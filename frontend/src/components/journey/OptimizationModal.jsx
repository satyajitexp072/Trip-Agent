import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Sliders,
  DollarSign,
  Coffee,
  Compass,
  Clock,
  Flame,
  MessageSquare,
  ShieldCheck,
  Palmtree,
  Loader2,
  Hotel,
  Car,
  Utensils
} from 'lucide-react';
import { tripService } from '../../services/tripService.js';
import { useTrip } from '../../context/TripContext.jsx';

const OPTIMIZATION_LEVERS = [
  {
    id: 'REDUCE_COST',
    title: 'Reduce Cost',
    badge: 'Save Budget',
    icon: TrendingDown,
    color: 'emerald',
    description: 'Economize lodging and transit while safeguarding your primary trip activities.',
  },
  {
    id: 'INCREASE_COMFORT',
    title: 'Increase Comfort',
    badge: 'Upgrade',
    icon: Sparkles,
    color: 'sky',
    description: 'Upgrade to premier 4-star beachfront resort and add a dedicated private chauffeur.',
  },
  {
    id: 'REDUCE_TRAVEL_TIME',
    title: 'Reduce Travel Time',
    badge: 'Speed',
    icon: Clock,
    color: 'indigo',
    description: 'Prioritize non-stop direct flights to maximize relaxation hours at destination.',
  },
  {
    id: 'INCREASE_ACTIVITIES',
    title: 'Increase Activities',
    badge: 'Explore',
    icon: Compass,
    color: 'amber',
    description: 'Enrich open schedule slots with curated sightseeing, water sports, and guided walks.',
  },
  {
    id: 'INCREASE_RELAXATION',
    title: 'Increase Relaxation',
    badge: 'Unwind',
    icon: Palmtree,
    color: 'teal',
    description: 'Enforce unhurried mornings, beach downtime blocks, and coastal proximity.',
  },
  {
    id: 'INCREASE_ADVENTURE',
    title: 'Increase Adventure',
    badge: 'Thrill',
    icon: Flame,
    color: 'rose',
    description: 'Infuse high-energy scuba trials, watersports, and outdoor expeditions.',
  },
  {
    id: 'INCREASE_FOOD',
    title: 'Increase Food Experiences',
    badge: 'Gastronomy',
    icon: Coffee,
    color: 'orange',
    description: 'Expand daily culinary budget for beach shacks, seafood bistros, and tastings.',
  },
  {
    id: 'CUSTOM',
    title: 'Custom Constraints',
    badge: 'Bespoke',
    icon: Sliders,
    color: 'purple',
    description: 'State custom rules like "Make it cheaper but don’t remove the main activities".',
  },
];

export default function OptimizationModal({ isOpen, onClose, currentItinerary, onOptimize }) {
  const { applyAIUpdate } = useTrip();
  const [selectedObjective, setSelectedObjective] = useState('REDUCE_COST');
  const [customText, setCustomText] = useState("Make it cheaper but don't remove the main activities.");
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [protectActivitiesChecked, setProtectActivitiesChecked] = useState(true);

  // Run initial calculation when modal opens
  useEffect(() => {
    if (isOpen && currentItinerary) {
      handleRunOptimization(selectedObjective, selectedObjective === 'CUSTOM' ? customText : '');
    }
  }, [isOpen]);

  if (!isOpen || !currentItinerary) return null;

  const handleRunOptimization = async (objectiveKey, textInstruction = '') => {
    setIsCalculating(true);
    try {
      const res = await tripService.optimizeTripDirect(currentItinerary, {
        objective: objectiveKey,
        customText: textInstruction,
        protectedItems: protectActivitiesChecked
          ? [
              'Mandovi River Sunset Catamaran Cruise',
              'Scuba Diving Trial & Snorkeling',
              'Assagao Portuguese Heritage Walk',
            ]
          : [],
      });

      if (res && res.data) {
        setPreviewResult(res.data);
      }
    } catch (err) {
      console.warn('[OptimizationModal] Direct optimize error, local fallback:', err.message);
      // Local fallback
      const fallbackRes = onOptimize(objectiveKey.toLowerCase(), textInstruction);
      if (fallbackRes) {
        setPreviewResult({
          previousTotal: fallbackRes.beforeCost,
          newTotal: fallbackRes.afterCost,
          savings: Math.max(0, -fallbackRes.costDelta),
          changedItems: fallbackRes.summaryOfChanges.map((c) => ({
            component: 'trip',
            from: 'Standard Option',
            to: c,
            delta: fallbackRes.costDelta,
          })),
          preservedItems: ['4 Core Activities & Schedule'],
          explanation: fallbackRes.summaryOfChanges.join(' • '),
          updatedJourney: fallbackRes.updatedItinerary,
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApplyCommit = () => {
    if (previewResult && previewResult.updatedJourney) {
      applyAIUpdate(previewResult.updatedJourney, {
        action: `OPTIMIZATION_${selectedObjective}`,
        delta: previewResult.newTotal - previewResult.previousTotal,
        summary: previewResult.explanation,
        reply: previewResult.explanation,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Journey Optimization Engine
                </h3>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Multi-Criteria Scoring
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Modify existing structured journey components without regenerating an unrelated plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Optimization Levers Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Optimization Goal (8 Objectives)
            </label>
            <span className="text-[11px] text-slate-400">Scores budget, comfort, time & convenience</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {OPTIMIZATION_LEVERS.map((lever) => {
              const isSelected = selectedObjective === lever.id;
              const Icon = lever.icon;

              return (
                <div
                  key={lever.id}
                  onClick={() => {
                    setSelectedObjective(lever.id);
                    handleRunOptimization(lever.id, lever.id === 'CUSTOM' ? customText : '');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/30 shadow-md scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {lever.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{lever.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">
                      {lever.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Natural Language Constraint Input */}
        {selectedObjective === 'CUSTOM' && (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Custom Constraint Instruction</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-purple-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={protectActivitiesChecked}
                  onChange={(e) => setProtectActivitiesChecked(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Protect core activities</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Make it cheaper but don't remove the main activities..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs text-slate-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button
                type="button"
                onClick={() => handleRunOptimization('CUSTOM', customText)}
                disabled={!customText.trim() || isCalculating}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40"
              >
                Evaluate
              </button>
            </div>
          </div>
        )}

        {/* BEFORE / AFTER COMPARISON CARD (The core demo feature) */}
        {isCalculating ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
            <div className="text-xs font-bold text-slate-700">Evaluating multi-criteria scores & alternatives...</div>
            <p className="text-[11px] text-slate-400">Scoring budget fit, comfort index, travel speed, and preserving untouched preferences.</p>
          </div>
        ) : previewResult ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50/30 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
            {/* Header: Previous vs New vs Savings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Optimization Outcome
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Previous</span>
                    <span className="text-sm font-semibold text-slate-500 line-through">
                      ₹{previewResult.previousTotal?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-sky-600 mt-3 flex-shrink-0" />

                  <div>
                    <span className="text-xs text-slate-900 font-bold block">New</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{previewResult.newTotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings or Delta Badge */}
              <div className="self-start sm:self-auto">
                {previewResult.savings > 0 ? (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-100 block">Total Saved</span>
                    <span className="text-lg font-black tracking-tight">
                      ₹{previewResult.savings.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : previewResult.savings < 0 ? (
                  <div className="px-4 py-2 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-sky-100 block">Value Upgrade</span>
                    <span className="text-lg font-black tracking-tight">
                      +₹{Math.abs(previewResult.savings).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Delta</span>
                    <span className="text-sm font-bold">Cost-Neutral</span>
                  </div>
                )}
              </div>
            </div>

            {/* Changed Items & Preserved Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Changed Items */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500 block">
                  Changes Made ({previewResult.changedItems?.length || 0})
                </span>
                <div className="space-y-2">
                  {previewResult.changedItems?.map((ch, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="capitalize">{ch.component.replace('_', ' ')}</span>
                        {ch.delta !== 0 && (
                          <span className={`text-[11px] font-bold ${ch.delta < 0 ? 'text-emerald-600' : 'text-sky-700'}`}>
                            {ch.delta < 0 ? `-₹${Math.abs(ch.delta).toLocaleString('en-IN')}` : `+₹${ch.delta.toLocaleString('en-IN')}`}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        <span className="text-slate-400 line-through mr-1">{ch.from}</span>
                        <span className="text-sky-700 font-bold">→ {ch.to}</span>
                      </div>
                      {ch.reason && (
                        <p className="text-[10px] text-slate-400 italic">{ch.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preserved Items */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500 block">
                  Preserved Experiences ({previewResult.preservedItems?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {previewResult.preservedItems?.map((pr, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 p-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{pr}</span>
                    </div>
                  ))}
                  {(!previewResult.preservedItems || previewResult.preservedItems.length === 0) && (
                    <p className="text-[11px] text-slate-400 italic">All core trip preferences and dates intact.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Designer Explanation */}
            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-xs text-sky-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed text-[11px]">
                {previewResult.explanation}
              </p>
            </div>
          </div>
        ) : null}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyCommit}
              disabled={!previewResult || isCalculating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <span>Apply This Optimization</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
