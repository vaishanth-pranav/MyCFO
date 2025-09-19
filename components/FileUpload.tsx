import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ErrorMessage } from './ErrorMessage';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onDownloadSample: () => void;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onDownloadSample, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileUpload(event.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
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
  
  const dropzoneClasses = `mt-8 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-sky-400 dark:hover:border-sky-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`;


  return (
    <div className="max-w-2xl mx-auto text-center">
      <div 
        className={dropzoneClasses}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
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
            Click to upload or drag & drop your Excel file
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Supports .xlsx files
          </p>
        </div>
      </div>
       <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-2">Don't have a file ready?</p>
        <button
          onClick={handleDownloadClick}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:ring-offset-slate-900 transition-colors"
        >
          <FileTextIcon className="w-5 h-5" />
          Download Sample Template
        </button>
      </div>
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
    </div>
  );
};