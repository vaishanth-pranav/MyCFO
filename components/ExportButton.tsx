import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  return (
    <button
      onClick={onExport}
      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-lg shadow-md hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:ring-offset-slate-800 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
    >
      <DownloadIcon className="w-5 h-5" />
      <span>Export</span>
    </button>
  );
};