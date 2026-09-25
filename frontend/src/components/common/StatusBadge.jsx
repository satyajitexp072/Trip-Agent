import React from 'react';
import { useHealth } from '../../hooks/useHealth.js';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';

export default function StatusBadge() {
  const { health, loading, error, refetch } = useHealth();

  if (loading && !health && !error) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
        <span>Connecting to Backend...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
        title="Backend server offline or unreachable. Click to retry."
        onClick={refetch}
      >
        <WifiOff className="w-3.5 h-3.5 text-rose-500" />
        <span>API Offline (Port 5000)</span>
      </div>
    );
  }

  const isDbConnected = health.database?.details?.connected;

  return (
    <div
      className="inline-flex items-center gap-2.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
      title={`Backend: Online (${health.uptime}) | DB: ${health.database?.status} | AI: ${health.ai?.provider}`}
      onClick={refetch}
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="font-semibold">API Online</span>
      <span className="text-emerald-500">|</span>
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
        <Database className="w-3 h-3" />
        {isDbConnected ? 'DB Active' : 'Offline Storage'}
      </span>
    </div>
  );
}
