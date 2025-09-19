import React from 'react';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
        </defs>
        <rect width="40" height="40" rx="8" fill="#0c4a6e"/>
        <rect x="8" y="21" width="6" height="10" rx="2.5" fill="url(#bar-gradient)"/>
        <rect x="17" y="9" width="6" height="22" rx="2.5" fill="url(#bar-gradient)"/>
        <rect x="26" y="15" width="6" height="16" rx="2.5" fill="url(#bar-gradient)"/>
    </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="text-center pt-28 pb-8">
      <div className="inline-flex items-center gap-4">
        <LogoIcon className="w-12 h-12" />
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            Stratifi AI
        </h1>
      </div>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Rebuilding strategic finance from the ground up—faster, smarter, autonomous.
      </p>
    </header>
  );
};