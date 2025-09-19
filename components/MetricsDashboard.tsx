import React from 'react';
import type { SheetRow, KnowledgeBase } from '../types';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

interface MetricsDashboardProps {
  lastRow: SheetRow;
  knowledgeBase: KnowledgeBase;
  customerType: 'sme' | 'large';
}

const formatValue = (value: any, unit: string): string => {
  if (typeof value !== 'number') return String(value || '0');

  switch (unit) {
    case 'currency':
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case 'count':
      return value.toLocaleString('en-US');
    default:
      return String(value);
  }
};

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ lastRow, knowledgeBase, customerType }) => {
  if (!lastRow) return null;

  const metrics = [];

  // Total Revenue (common to both)
  const totalRevenue = lastRow['total_revenues'];
  metrics.push({
    title: 'Total Revenue',
    value: formatValue(totalRevenue, 'currency'),
    icon: <DollarSignIcon className="w-6 h-6" />
  });

  // Customer Count (dynamic)
  if (customerType === 'large') {
    const customerCount = lastRow['cumulative_large_customers'];
    metrics.push({
      title: 'Total Large Customers',
      value: formatValue(customerCount, 'count'),
      icon: <UsersIcon className="w-6 h-6" />
    });
  } else {
    const customerCount = lastRow['cumulative_sme_customers'];
    metrics.push({
      title: 'Total SME Customers',
      value: formatValue(customerCount, 'count'),
      icon: <UsersIcon className="w-6 h-6" />
    });
  }
  
  // Sales Reps (large only)
  if (customerType === 'large') {
    const salesReps = lastRow['sales_people'];
    metrics.push({
      title: '# of Sales Reps',
      value: formatValue(salesReps, 'count'),
      icon: <BriefcaseIcon className="w-6 h-6" />
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map(metric => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
};
