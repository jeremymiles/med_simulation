import React, { useState, useCallback } from 'react';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ResultsView } from './components/ResultsView';
import { SimulationConfig, SimulationResult, SimulationStatus } from './types';
import { runSimulationBatch } from './utils/math';
import { Activity, Github } from 'lucide-react';

const INITIAL_CONFIG: SimulationConfig = {
  id: 's1',
  name: 'Custom',
  description: 'Custom Configuration',
  n: 200,
  replications: 1000, 
  bootstrapSamples: 1000, // Increased to 1000 as per user request
  a: 0.5,
  c_prime: 0.5,
  b: 0,
  sigma_em: 1.0,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRun = useCallback(async () => {
    setStatus(SimulationStatus.RUNNING);
    setProgress(0);
    setResult(null);

    try {
      // Use a small timeout to let the UI update to "Running" state before heavy JS starts
      setTimeout(async () => {
        const res = await runSimulationBatch(config, (p) => setProgress(p));
        setResult(res);
        setStatus(SimulationStatus.COMPLETED);
      }, 100);
    } catch (e) {
      console.error(e);
      setStatus(SimulationStatus.IDLE);
    }
  }, [config]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
               <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">R2med Replication</h1>
              <p className="text-xs text-gray-500 font-medium">Based on Park & Yi (2025)</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Behavior Research Methods
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 space-y-6">
            <ScenarioSelector 
              config={config} 
              setConfig={setConfig} 
              isRunning={status === SimulationStatus.RUNNING}
              onRun={handleRun}
            />
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-sm text-gray-600 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Study Context</h3>
              <p className="mb-3">
                This simulation investigates the behavior of <span className="font-mono text-indigo-600">R²med</span> (proportion of variance explained by the indirect effect) when the true indirect effect is zero (b=0).
              </p>
              <p className="mb-3">
                The paper clarifies that while <span className="font-mono text-indigo-600">R²med</span> theoretically equals zero when b=0, finite sample estimates can fluctuate.
              </p>
              <p>
                <strong>Goal:</strong> Replicate the bootstrap analysis to demonstrate that confidence intervals appropriately capture the null effect, despite sampling variability.
              </p>
            </div>
          </div>

          {/* Main Content / Results */}
          <div className="lg:col-span-8 space-y-6">
             {/* Progress Bar */}
             {status === SimulationStatus.RUNNING && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-pulse">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600">Running Simulation...</span>
                    <span className="text-sm font-medium text-gray-500">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Processing {config.replications} datasets with {config.bootstrapSamples} bootstrap samples each.</p>
                </div>
             )}

             <ResultsView result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
