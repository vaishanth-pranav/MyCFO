import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
        MyCFO AI Modeler
      </h1>
      <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Interactive financial modeling powered by AI.
      </p>
    </header>
  );
};
