import React from 'react';
import type { SheetRow, KnowledgeBase } from '../types';

interface DataTableProps {
  data: SheetRow[];
  knowledgeBase: KnowledgeBase;
}

const formatValue = (value: any, unit: string): string => {
  if (typeof value !== 'number') return String(value);

  switch (unit) {
    case 'currency':
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case '%':
      return `${value.toFixed(1)}%`;
    case 'count':
      return value.toLocaleString('en-US');
    default:
      return String(value);
  }
};

export const DataTable: React.FC<DataTableProps> = ({ data, knowledgeBase }) => {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }
  
  const headers = Object.keys(knowledgeBase.variables).filter(key => !knowledgeBase.variables[key]?.hidden);

  return (
    <div className="overflow-auto relative rounded-lg max-h-[60vh] border border-white/30">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-white/60 backdrop-blur-md sticky top-0 z-10">
          <tr>
            {headers.map(key => (
              <th key={key} scope="col" className="px-6 py-3 whitespace-nowrap">
                {knowledgeBase.variables[key]?.description || key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-200/50 hover:bg-sky-100/50">
              {headers.map(key => (
                <td key={key} className="px-6 py-4 whitespace-nowrap font-mono text-right">
                  {formatValue(row[key], knowledgeBase.variables[key]?.unit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};