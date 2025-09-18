import React, { useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ErrorMessage } from './ErrorMessage';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onDownloadSample: () => void;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onDownloadSample, error }) => {
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileUpload(event.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileUpload(event.target.files[0]);
    }
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent the file upload dialog from opening
    onDownloadSample();
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div 
        className="mt-8 p-8 border-4 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 cursor-pointer hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input 
          type="file" 
          id="file-upload-input" 
          className="hidden" 
          onChange={onFileChange} 
          accept=".xlsx, .xls"
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadIcon className="w-12 h-12 text-slate-400" />
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Click to upload or drag and drop your Excel file
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            (Supports .xlsx files)
          </p>
        </div>
      </div>
       <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-2">Don't have a file ready?</p>
        <button
          onClick={handleDownloadClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-slate-900 transition-colors duration-200"
        >
          <FileTextIcon className="w-5 h-5" />
          Download Sample Template
        </button>
      </div>
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
    </div>
  );
};
