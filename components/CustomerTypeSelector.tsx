import React from 'react';
import { BuildingIcon } from './icons/BuildingIcon';
import { StoreIcon } from './icons/StoreIcon';

interface CustomerTypeSelectorProps {
  onSelectType: (type: 'sme' | 'large') => void;
}

export const CustomerTypeSelector: React.FC<CustomerTypeSelectorProps> = ({ onSelectType }) => {

  const cardBaseClasses = "p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-lg transform hover:-translate-y-2";
  const cardColorClasses = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500";
  const iconClasses = "w-16 h-16 mb-4 text-blue-600 dark:text-blue-400";
  const titleClasses = "text-xl font-bold text-slate-800 dark:text-slate-100 mb-2";
  const descriptionClasses = "text-slate-600 dark:text-slate-400 text-sm";
  
  return (
    <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Select Your Business Model Focus
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Choose the go-to-market strategy that best represents the financial model you want to build or analyze.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
                className={`${cardBaseClasses} ${cardColorClasses}`}
                onClick={() => onSelectType('large')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectType('large')}
            >
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
                <StoreIcon className={iconClasses} />
                <h3 className={titleClasses}>Small & Medium Business (SMB)</h3>
                <p className={descriptionClasses}>
                    Focus on acquiring customers through digital marketing spend (e.g., Google Ads) and inside sales conversions.
                </p>
            </div>
        </div>
    </div>
  );
};
