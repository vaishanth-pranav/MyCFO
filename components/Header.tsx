import React from 'react';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 12L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 4L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 8L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8">
      <div className="inline-flex items-center gap-3">
        <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
            <LogoIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            FinPilot AI
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Transform your financial forecasting with the power of generative AI.
      </p>
    </header>
  );
};