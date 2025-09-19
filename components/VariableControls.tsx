import React from 'react';
import type { KnowledgeBase, SheetRow } from '../types';

interface VariableControlsProps {
  knowledgeBase: KnowledgeBase;
  simulationInputs: SheetRow | null;
  onVariableChange: (variable: string, value: number) => void;
}

export const VariableControls: React.FC<VariableControlsProps> = ({ knowledgeBase, simulationInputs, onVariableChange }) => {
  const mutableVariables = Object.entries(knowledgeBase.variables).filter(
    ([, config]) => config.mutable && !config.sim_formula && !config.hidden
  );

  if (!simulationInputs) return null;

  const handleInputChange = (key: string, value: string) => {
    // Allow the input to be temporarily empty for better UX
    if (value === '') {
        onVariableChange(key, 0); // or handle as a special case
        return;
    }
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onVariableChange(key, numericValue);
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Simulation Inputs</h2>
      </header>
      <div className="p-4 space-y-4 max-h-[calc(40vh-80px)] overflow-y-auto">
        {mutableVariables.map(([key, config]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {config.description}
            </label>
            <div className="relative">
              {config.unit === 'currency' && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 sm:text-sm">$</span>}
              <input
                type="number"
                id={key}
                value={simulationInputs[key] ?? ''}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className={`w-full py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 ${config.unit === 'currency' ? 'pl-7' : 'px-3'} ${config.unit === '%' ? 'pr-7' : ''}`}
              />
              {config.unit === '%' && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 sm:text-sm">%</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};