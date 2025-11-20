import React, { useMemo } from 'react';
import { SimulationResult } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface Props {
  result: SimulationResult | null;
}

export const ResultsView: React.FC<Props> = ({ result }) => {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-200 min-h-[400px]">
        <p>No simulation results yet.</p>
        <p className="text-sm">Configure and run a simulation to see the analysis.</p>
      </div>
    );
  }

  const { stats, bootMeans } = result;

  // Prepare Histogram Data
  const histogramData = useMemo(() => {
    const binCount = 40;
    const range = stats.max - stats.min;
    const step = range / binCount || 0.01;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      rangeStart: stats.min + i * step,
      rangeEnd: stats.min + (i + 1) * step,
      mid: stats.min + (i + 0.5) * step,
      count: 0
    }));

    bootMeans.forEach(val => {
      const binIdx = Math.min(
        Math.floor((val - stats.min) / step),
        binCount - 1
      );
      if (binIdx >= 0) bins[binIdx].count++;
    });

    return bins.map(b => ({
      ...b,
      label: b.mid.toFixed(3)
    }));
  }, [bootMeans, stats]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 uppercase font-semibold">Median Estimate</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{stats.median.toFixed(5)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 uppercase font-semibold">95% Bootstrap CI</div>
          <div className="text-sm font-bold text-gray-800 mt-2 break-words">
            [{stats.ciLower.toFixed(5)}, {stats.ciUpper.toFixed(5)}]
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 uppercase font-semibold">Range (Min - Max)</div>
          <div className="text-sm font-medium text-gray-600 mt-2">
            {stats.min.toFixed(4)} to {stats.max.toFixed(4)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="text-xs text-gray-500 uppercase font-semibold">IQR (25% - 75%)</div>
           <div className="text-sm font-medium text-gray-600 mt-2">
            {stats.p25.toFixed(4)} to {stats.p75.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution of Bootstrap Means</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} barCategoryGap={0}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{fontSize: 10}} 
                interval={4}
                label={{ value: 'R2med Estimate', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => `Value ≈ ${label}`}
              />
              <ReferenceLine x={stats.median.toFixed(3)} stroke="#4f46e5" strokeDasharray="3 3" label="Median" />
              <ReferenceLine x="0.000" stroke="#ef4444" label="0" />
              <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]}>
                {histogramData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={Number(entry.mid) < 0 ? '#f87171' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 italic">
          Note: This histogram shows the distribution of the *mean* R2med estimates calculated from each of the {result.config.replications} independent simulations.
          Red bars indicate negative values, which can occur when R²(Y~X+M) > r²YX + r²YM.
        </p>
      </div>
    </div>
  );
};
