import React from 'react';
import { Compass, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Compass className="w-5 h-5 text-sky-400" />
              <span>Trip Agent</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              AI-driven journey optimization and multi-tier travel planning. Discover realistic costs across Cheapest, Best Value, Comfortable, and Premium options without requiring upfront budget guesswork.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-slate-400" /> Full-Stack JS (React + Express)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" /> AI Provider Abstraction
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Core Workflow
            </h4>
            <ul className="space-y-2 text-sm">
              <li>1. Natural Language Intent</li>
              <li>2. Multi-tier Cost Discovery</li>
              <li>3. Structured Itinerary Plan</li>
              <li>4. Dynamic Re-planning</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              System Specs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Backend: Express & Mongoose</li>
              <li>Frontend: React 18 + Vite</li>
              <li>Styling: Tailwind CSS</li>
              <li>API Health: <code className="text-sky-400 bg-slate-800 px-1 py-0.5 rounded text-xs">/api/health</code></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Trip-Agent. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Clean Architecture • ES Modules
          </p>
        </div>
      </div>
    </footer>
  );
}
