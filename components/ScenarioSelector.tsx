import React from 'react';
import { SimulationConfig } from '../types';
import { Settings2, Play, AlertCircle } from 'lucide-react';

interface Props {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  isRunning: boolean;
  onRun: () => void;
}

const PRESETS: Partial<SimulationConfig>[] = [
  { id: 's1', name: 'Scenario 1 (Plausible)', description: 'a = 0.5, c\' = 0.5, b = 0', a: 0.5, c_prime: 0.5, b: 0, sigma_em: 1 },
  { id: 's2', name: 'Scenario 2 (Plausible)', description: 'a = 0.1, c\' = 0.5, b = 0', a: 0.1, c_prime: 0.5, b: 0, sigma_em: 1 },
  { id: 's3', name: 'Scenario 3 (Plausible)', description: 'a = 0.5, c\' = 0.1, b = 0', a: 0.5, c_prime: 0.1, b: 0, sigma_em: 1 },
  { id: 's4', name: 'Scenario 4 (Plausible)', description: 'a = -0.5, c\' = 0.5, b = 0', a: -0.5, c_prime: 0.5, b: 0, sigma_em: 1 },
  { id: 's5', name: 'Scenario 5 (Plausible)', description: 'a = -0.1, c\' = 0.5, b = 0', a: -0.1, c_prime: 0.5, b: 0, sigma_em: 1 },
  { id: 's6', name: 'Scenario 6 (Plausible)', description: 'a = -0.5, c\' = 0.1, b = 0', a: -0.5, c_prime: 0.1, b: 0, sigma_em: 1 },
  { id: 'u1', name: 'Scenario U1 (Unrealistic)', description: 'a = 0.9, c\' = 0.5, b = 0, Low SD(M)', a: 0.9, c_prime: 0.5, b: 0, sigma_em: 0.1 },
  { id: 'u2', name: 'Scenario U2 (Unrealistic)', description: 'a = -0.9, c\' = 0.5, b = 0, Low SD(M)', a: -0.9, c_prime: 0.5, b: 0, sigma_em: 0.1 },
];

export const ScenarioSelector: React.FC<Props> = ({ config, setConfig, isRunning, onRun }) => {
  
  const handlePresetClick = (preset: Partial<SimulationConfig>) => {
    setConfig({ ...config, ...preset });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: parseFloat(value) });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b pb-4">
        <Settings2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">Configuration</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Presets (from Paper)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p)}
                disabled={isRunning}
                className={`text-left px-3 py-2 rounded-lg text-sm border transition-all duration-200
                  ${config.a === p.a && config.c_prime === p.c_prime && config.sigma_em === p.sigma_em 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
                  } disabled:opacity-50`}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs opacity-75">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">a (X → M)</label>
            <input
              type="number"
              name="a"
              step="0.1"
              value={config.a}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">c' (X → Y)</label>
            <input
              type="number"
              name="c_prime"
              step="0.1"
              value={config.c_prime}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">b (M → Y)</label>
            <input
              type="number"
              name="b"
              step="0.1"
              value={config.b}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SD(e_M)</label>
            <input
              type="number"
              name="sigma_em"
              step="0.1"
              value={config.sigma_em}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sample Size (N)</label>
            <input
              type="number"
              name="n"
              value={config.n}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Replications</label>
            <input
              type="number"
              name="replications"
              value={config.replications}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bootstrap Reps</label>
            <input
              type="number"
              name="bootstrapSamples"
              value={config.bootstrapSamples}
              onChange={handleChange}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Running high replications (1000) with high bootstrap samples (1000) may take 10-20 seconds depending on your device. The simulation is chunked to keep the UI responsive.</p>
        </div>

        <button
          onClick={onRun}
          disabled={isRunning}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all shadow-md
            ${isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]'
            }`}
        >
          {isRunning ? 'Simulating...' : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Run Simulation
            </>
          )}
        </button>
      </div>
    </div>
  );
};
