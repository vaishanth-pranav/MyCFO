import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  return (
    <button
      onClick={onExport}
      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center gap-2"
    >
      <DownloadIcon className="w-5 h-5" />
      Export to Excel
    </button>
  );
};
