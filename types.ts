export interface SimulationConfig {
  id: string;
  name: string;
  description: string;
  n: number; // Sample size
  replications: number; // Number of simulations (Meta-sim)
  bootstrapSamples: number; // Number of bootstraps per simulation
  a: number; // X -> M path
  c_prime: number; // Direct X -> Y path
  b: number; // M -> Y path (usually 0 for this paper)
  sigma_em: number; // SD of Error of M (usually 1, but 0.1 for "Unrealistic")
}

export interface SimulationResult {
  config: SimulationConfig;
  bootMeans: number[]; // The mean R2med from each simulation's bootstrap
  stats: {
    min: number;
    max: number;
    median: number;
    p25: number;
    p75: number;
    ciLower: number; // 2.5%
    ciUpper: number; // 97.5%
  };
}

export enum SimulationStatus {
  IDLE,
  RUNNING,
  COMPLETED,
}
