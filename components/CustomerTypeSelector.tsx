import React from 'react';
import { BuildingIcon } from './icons/BuildingIcon';
import { StoreIcon } from './icons/StoreIcon';
import { HybridIcon } from './icons/HybridIcon';

interface CustomerTypeSelectorProps {
  onSelectType: (type: 'sme' | 'large' | 'hybrid') => void;
}

export const CustomerTypeSelector: React.FC<CustomerTypeSelectorProps> = ({ onSelectType }) => {

  const cardBaseClasses = "relative p-10 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-lg transform hover:-translate-y-2 group";
  const cardColorClasses = "bg-white/50 backdrop-blur-lg border border-white/20 hover:shadow-2xl hover:shadow-sky-500/20 dark:bg-slate-800/50 dark:border-white/10 dark:hover:shadow-sky-400/10";
  const iconClasses = "w-20 h-20 mb-6 text-sky-500 dark:text-sky-400";
  const titleClasses = "text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3";
  const descriptionClasses = "text-slate-600 dark:text-slate-400 text-base";
  
  return (
    <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Select Your Business Model Focus
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
            Choose the go-to-market strategy that best represents the financial model you want to build or analyze.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div
                className={`${cardBaseClasses} ${cardColorClasses}`}
                onClick={() => onSelectType('large')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectType('large')}
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-300"></div>
                <BuildingIcon className={iconClasses} />
                <h3 className={titleClasses}>Large Enterprise Customers</h3>
                <p className={descriptionClasses}>
                    Focus on a direct sales approach where executives sign a few high-value customers each month.
                </p>
            </div>
            <div
                className={`${cardBaseClasses} ${cardColorClasses}`}
                onClick={() => onSelectType('sme')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectType('sme')}
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-300"></div>
                <StoreIcon className={iconClasses} />
                <h3 className={titleClasses}>Small & Medium Business (SMB)</h3>
                <p className={descriptionClasses}>
                    Focus on acquiring customers through digital marketing spend (e.g., Google Ads) and inside sales conversions.
                </p>
            </div>
            <div
                className={`${cardBaseClasses} ${cardColorClasses}`}
                onClick={() => onSelectType('hybrid')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectType('hybrid')}
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-300"></div>
                <HybridIcon className={iconClasses} />
                <h3 className={titleClasses}>Hybrid Model</h3>
                <p className={descriptionClasses}>
                    Combines both direct sales for large customers and digital marketing for SMBs.
                </p>
            </div>
        </div>
    </div>
  );
};