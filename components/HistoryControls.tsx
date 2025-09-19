import React from 'react';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';

interface HistoryControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const buttonClass = "p-2 rounded-md transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
  const enabledClass = "text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-700/80";

  return (
    <div className="flex items-center gap-1">
      <button onClick={onUndo} disabled={!canUndo} className={`${buttonClass} ${canUndo ? enabledClass : ''}`} aria-label="Undo">
        <UndoIcon className="w-5 h-5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={`${buttonClass} ${canRedo ? enabledClass : ''}`} aria-label="Redo">
        <RedoIcon className="w-5 h-5" />
      </button>
    </div>
  );
};