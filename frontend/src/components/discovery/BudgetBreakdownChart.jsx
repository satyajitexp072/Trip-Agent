import React from 'react';
import { Plane, Hotel, Utensils, Compass, ShieldAlert } from 'lucide-react';

export default function BudgetBreakdownChart({ breakdown, totalCost, currency = 'INR' }) {
  if (!breakdown || !totalCost) return null;

  const categories = [
    {
      key: 'accommodation',
      label: 'Accommodation',
      amount: breakdown.accommodation,
      percent: Math.round((breakdown.accommodation / totalCost) * 100),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      icon: Hotel,
    },
    {
      key: 'transport',
      label: 'Transport & Flights',
      amount: breakdown.transport,
      percent: Math.round((breakdown.transport / totalCost) * 100),
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      icon: Plane,
    },
    {
      key: 'food',
      label: 'Food & Dining',
      amount: breakdown.food,
      percent: Math.round((breakdown.food / totalCost) * 100),
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      icon: Utensils,
    },
    {
      key: 'activities',
      label: 'Activities & Tours',
      amount: breakdown.activities,
      percent: Math.round((breakdown.activities / totalCost) * 100),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      icon: Compass,
    },
    {
      key: 'buffer',
      label: 'Local Transit & Buffer',
      amount: breakdown.localTransport !== undefined ? breakdown.localTransport : (breakdown.buffer || 0),
      percent: Math.max(1, Math.round(((breakdown.localTransport !== undefined ? breakdown.localTransport : (breakdown.buffer || 0)) / totalCost) * 100)),
      color: 'bg-slate-500',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Estimated Cost Allocation</span>
        <span className="font-bold text-slate-900">Total: ₹{totalCost.toLocaleString('en-IN')}</span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden shadow-inner p-0.5 gap-0.5">
        {categories.map((cat) => (
          <div
            key={cat.key}
            style={{ width: `${cat.percent}%` }}
            title={`${cat.label}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.percent}%)`}
            className={`h-full rounded-sm ${cat.color} transition-all duration-500 hover:opacity-85 cursor-pointer`}
          />
        ))}
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className={`flex items-center justify-between p-2 rounded-lg ${cat.bgColor} border border-slate-200/60 text-xs`}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className={`w-2 h-2 rounded-full ${cat.color} flex-shrink-0`} />
                <span className="truncate text-slate-700 font-medium">{cat.label}</span>
              </div>
              <span className={`font-bold ${cat.textColor} pl-2 flex-shrink-0`}>
                ₹{cat.amount.toLocaleString('en-IN')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
