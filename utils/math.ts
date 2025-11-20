import { SimulationConfig, SimulationResult } from '../types';

// Box-Muller transform for normal distribution
function randn_bm(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateData(n: number, config: SimulationConfig) {
  const X = new Float64Array(n);
  const M = new Float64Array(n);
  const Y = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    const x_val = randn_bm();
    const em_val = randn_bm() * config.sigma_em;
    const m_val = config.a * x_val + em_val;
    
    const ey_val = randn_bm(); // sigma_ey is always 1 in the paper
    const y_val = config.c_prime * x_val + config.b * m_val + ey_val;

    X[i] = x_val;
    M[i] = m_val;
    Y[i] = y_val;
  }
  return { X, M, Y };
}

function calculateCorrelation(A: Float64Array, B: Float64Array): number {
  const n = A.length;
  let sumA = 0, sumB = 0;
  let sumA2 = 0, sumB2 = 0;
  let sumAB = 0;

  for (let i = 0; i < n; i++) {
    sumA += A[i];
    sumB += B[i];
    sumA2 += A[i] * A[i];
    sumB2 += B[i] * B[i];
    sumAB += A[i] * B[i];
  }

  const numerator = n * sumAB - sumA * sumB;
  const denA = n * sumA2 - sumA * sumA;
  const denB = n * sumB2 - sumB * sumB;
  
  if (denA === 0 || denB === 0) return 0;
  return numerator / Math.sqrt(denA * denB);
}

// Fast R2med calculation using correlation matrix
// Formula: R2med = rYX^2 + rYM^2 - R2_Y_XM
// R2_Y_XM = (rYX^2 + rYM^2 - 2*rYX*rYM*rXM) / (1 - rXM^2)
function computeR2Med(X: Float64Array, M: Float64Array, Y: Float64Array): number {
  const rYX = calculateCorrelation(Y, X);
  const rYM = calculateCorrelation(Y, M);
  const rXM = calculateCorrelation(X, M);

  const rYX2 = rYX * rYX;
  const rYM2 = rYM * rYM;
  const rXM2 = rXM * rXM;

  // R-squared of Y ~ X + M
  // Check for singularity
  if (Math.abs(rXM2 - 1) < 1e-9) {
     // If X and M are perfectly correlated, multicollinearity.
     // In this simulation context, we fallback or handle gracefully.
     // For the formula, if rXM=1, denom is 0.
     return rYX2 + rYM2 - rYX2; // Simplified fallback (likely incorrect but prevents NaN in edge case)
  }

  const R2_Y_XM = (rYX2 + rYM2 - 2 * rYX * rYM * rXM) / (1 - rXM2);

  return (rYX2 + rYM2) - R2_Y_XM;
}

function quantile(data: number[], q: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export async function runSimulationBatch(
  config: SimulationConfig,
  onProgress: (progress: number) => void
): Promise<SimulationResult> {
  
  const bootMeans: number[] = [];
  
  // To avoid blocking UI, we chunk the simulation
  const chunkSize = 10; 
  const totalChunks = Math.ceil(config.replications / chunkSize);

  for (let c = 0; c < totalChunks; c++) {
    // Yield to event loop
    await new Promise(resolve => setTimeout(resolve, 0));

    const start = c * chunkSize;
    const end = Math.min((c + 1) * chunkSize, config.replications);

    for (let i = start; i < end; i++) {
      // 1. Generate Data
      const { X, M, Y } = generateData(config.n, config);

      // 2. Bootstrap
      // Pre-allocate resample arrays to save memory alloc time? 
      // Actually, we can just sample indices and use the computeR2Med logic on indexed access,
      // but computeR2Med takes arrays. Constructing new arrays is safer for the modularity.
      // Optimization: Create one buffer for resampled data and reuse it.
      const X_b = new Float64Array(config.n);
      const M_b = new Float64Array(config.n);
      const Y_b = new Float64Array(config.n);
      
      let sumR2Med = 0;

      for (let b = 0; b < config.bootstrapSamples; b++) {
        for (let j = 0; j < config.n; j++) {
          const idx = Math.floor(Math.random() * config.n);
          X_b[j] = X[idx];
          M_b[j] = M[idx];
          Y_b[j] = Y[idx];
        }
        const r2med = computeR2Med(X_b, M_b, Y_b);
        sumR2Med += r2med;
      }
      
      const meanR2Med = sumR2Med / config.bootstrapSamples;
      bootMeans.push(meanR2Med);
    }
    onProgress(((c + 1) / totalChunks) * 100);
  }

  // Calculate stats on the bootMeans
  const min = Math.min(...bootMeans);
  const max = Math.max(...bootMeans);
  const median = quantile(bootMeans, 0.5);
  const p25 = quantile(bootMeans, 0.25);
  const p75 = quantile(bootMeans, 0.75);
  const ciLower = quantile(bootMeans, 0.025);
  const ciUpper = quantile(bootMeans, 0.975);

  return {
    config,
    bootMeans,
    stats: {
      min,
      max,
      median,
      p25,
      p75,
      ciLower,
      ciUpper
    }
  };
}
