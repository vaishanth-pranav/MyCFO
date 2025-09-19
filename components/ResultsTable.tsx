
import React from 'react';
import type { FinancialRow } from '../types';

interface ResultsTableProps {
  data: FinancialRow[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Dynamically find all period keys (period1, period2, etc.)
  const periodKeys = Object.keys(data[0] || {}).filter(key => key.startsWith('period'));

  // The first row is expected to be labels
  const headerRow = data[0];
  const bodyRows = data.slice(1);

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-4">Metric</th>
              <th scope="col" className="px-6 py-4">Formula / Logic</th>
              {periodKeys.map((key, index) => (
                <th key={key} scope="col" className="px-6 py-4 text-right">
                  {/* Fix: Removed incorrect 'as keyof' cast. Direct property access is correct for a type with an index signature. */}
                  {headerRow[key] || `Period ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {row.metric}
                </th>
                <td className="px-6 py-4 text-slate-500 italic">
                  {row.formula}
                </td>
                {periodKeys.map((key) => (
                  <td key={key} className="px-6 py-4 text-right font-mono">
                    {/* Fix: Removed incorrect 'as keyof' cast. Direct property access is correct for a type with an index signature. */}
                    {row[key] || '--'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};