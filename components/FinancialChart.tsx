import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { SheetRow, KnowledgeBase } from '../types';

interface FinancialChartProps {
  data: SheetRow[];
  knowledgeBase: KnowledgeBase;
  selectedMetrics: string[];
  onMetricChange: (metric: string) => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#e6194b', '#3cb44b', '#ffe119', '#4363d8'];

const yAxisFormatter = (value: number) => {
  if (typeof value !== 'number') return value;
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label, knowledgeBase }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="label font-bold text-slate-800 dark:text-slate-200">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
              const variableConfig = knowledgeBase.variables[entry.dataKey];
              const unit = variableConfig?.unit || '';
              let formattedValue = entry.value;
              if (typeof entry.value === 'number') {
                  switch (unit) {
                      case 'currency':
                          formattedValue = entry.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                          break;
                      case '%':
                          formattedValue = `${entry.value.toFixed(1)}%`;
                          break;
                      case 'count':
                          formattedValue = entry.value.toLocaleString('en-US');
                          break;
                  }
              }
            return (
              <p key={`item-${index}`} style={{ color: entry.color }} className="intro text-sm">
                {`${entry.name}: ${formattedValue}`}
              </p>
            );
          })}
        </div>
      );
    }
  
    return null;
};

export const FinancialChart: React.FC<FinancialChartProps> = ({ data, knowledgeBase, selectedMetrics, onMetricChange }) => {
  const plottableMetrics = Object.keys(knowledgeBase.variables).filter(key => {
    if (knowledgeBase.variables[key]?.hidden) {
        return false;
    }
    const unit = knowledgeBase.variables[key].unit;
    return ['currency', 'count', '%'].includes(unit);
  });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Select Metrics to Plot (up to 2):</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
            {plottableMetrics.map(metric => (
            <label key={metric} className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                type="checkbox"
                checked={selectedMetrics.includes(metric)}
                onChange={() => onMetricChange(metric)}
                disabled={!selectedMetrics.includes(metric) && selectedMetrics.length >= 2}
                className="form-checkbox h-4 w-4 rounded text-blue-600 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-slate-700 dark:text-slate-300 select-none">{knowledgeBase.variables[metric].description}</span>
            </label>
            ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
            <XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis yAxisId="left" stroke={COLORS[0]} tickFormatter={yAxisFormatter} tick={{ fill: 'currentColor', fontSize: 12 }} />
            {selectedMetrics.length > 1 && (
                <YAxis yAxisId="right" orientation="right" stroke={COLORS[1]} tickFormatter={yAxisFormatter} tick={{ fill: 'currentColor', fontSize: 12 }} />
            )}
            <Tooltip content={<CustomTooltip knowledgeBase={knowledgeBase} />} />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Line
                key={metric}
                yAxisId={index === 0 ? 'left' : 'right'}
                type="monotone"
                dataKey={metric}
                name={knowledgeBase.variables[metric]?.description || metric}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: COLORS[index % COLORS.length] }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};