import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import BudgetBreakdownChart from '../components/discovery/BudgetBreakdownChart.jsx';
import { tripService } from '../services/tripService.js';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plane,
  Hotel,
  Compass,
  Utensils,
  Car,
  RotateCcw,
  Loader2,
  Info
} from 'lucide-react';

export default function BudgetDiscoveryPage() {
  const navigate = useNavigate();
  const { intent, computedTiers, selectedTierId, selectTier, updateIntent } = useTrip();

  const [backendEstimate, setBackendEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetBudgetInput, setTargetBudgetInput] = useState(
    intent.optionalBudget ? String(intent.optionalBudget) : ''
  );
  const [appliedBudget, setAppliedBudget] = useState(
    intent.optionalBudget ? Number(intent.optionalBudget) : null
  );

  // Fetch live deterministic budget estimate from backend
  const fetchEstimate = async (budgetConstraint = null) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await tripService.calculateEstimate({
        origin: intent.origin || 'Bhubaneswar',
        destination: intent.destination || 'Goa',
        duration: Number(intent.duration || intent.durationDays) || 4,
        travelers: Number(intent.travelers) || 2,
        optionalBudget: budgetConstraint !== null ? budgetConstraint : (intent.optionalBudget || null),
        travelStyle: intent.travelStyle || 'Relaxed',
        interests: intent.interests || [],
      });

      if (response && response.data) {
        setBackendEstimate(response.data);
      }
    } catch (err) {
      console.warn('[BudgetDiscovery] Backend estimate query fallback to local model:', err.message);
      setErrorMsg('Using benchmark estimation engine while syncing with live server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate(appliedBudget);
  }, [intent.origin, intent.destination, intent.duration, intent.durationDays, intent.travelers]);

  // Transform backend tiers or fallback to computedTiers
  const displayTiers = useMemo(() => {
    if (backendEstimate) {
      const { cheapest, bestValue, comfortable, premium } = backendEstimate;

      const formatTier = (key, data, colorAccent, badge, isRec = false) => ({
        id: key === 'bestValue' ? 'best-value' : key,
        rawKey: key,
        name: data.tier,
        badge,
        isRecommended: isRec,
        colorAccent,
        totalCost: data.total,
        perPersonCost: data.perPerson,
        headline: data.description,
        levels: {
          transport: data.selectedOptions?.transport || 'Transit Connection',
          accommodation: data.selectedOptions?.accommodation || 'Standard Stay',
          food: `Daily dining allowance (₹${data.foodCost.toLocaleString('en-IN')})`,
          activities: `Curated experiences (₹${data.activityCost.toLocaleString('en-IN')})`,
          localTransit: data.selectedOptions?.localTransit || 'Local mobility allowance',
        },
        inclusions: data.inclusions || [],
        tradeoffs: data.tradeoffs || [],
        breakdown: {
          transport: data.transportCost,
          accommodation: data.accommodationCost,
          food: data.foodCost,
          activities: data.activityCost,
          localTransport: data.localTransportCost,
        },
        raw: data,
      });

      return [
        formatTier('cheapest', cheapest, 'amber', 'Budget Explorer', false),
        formatTier('bestValue', bestValue, 'emerald', 'Recommended Choice', true),
        formatTier('comfortable', comfortable, 'blue', 'High Comfort Resort', false),
        formatTier('premium', premium, 'purple', 'Ultra Luxury & Bespoke', false),
      ];
    }

    return computedTiers;
  }, [backendEstimate, computedTiers]);

  // Preview tier state for the interactive breakdown chart
  const [activeTierPreview, setActiveTierPreview] = useState(null);

  // Sync activeTierPreview whenever displayTiers updates
  useEffect(() => {
    if (displayTiers && displayTiers.length > 0) {
      const match = displayTiers.find((t) => t.id === selectedTierId) || displayTiers[1];
      setActiveTierPreview(match);
    }
  }, [displayTiers, selectedTierId]);

  // Handle "Optimize around ₹_____" constraint submission
  const handleApplyTargetBudget = (e) => {
    e.preventDefault();
    const num = targetBudgetInput ? parseInt(targetBudgetInput, 10) : null;
    if (num && num > 0) {
      setAppliedBudget(num);
      updateIntent({ optionalBudget: num });
      fetchEstimate(num);
    }
  };

  const handleClearTargetBudget = () => {
    setTargetBudgetInput('');
    setAppliedBudget(null);
    updateIntent({ optionalBudget: '' });
    fetchEstimate(null);
  };

  const handleChoosePlan = (tier) => {
    selectTier(tier.id, tier.raw || tier);
    navigate('/journey');
  };

  const constraintAnalysis = backendEstimate?.constraintAnalysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 pb-24">
      {/* Top Banner & Intent Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/plan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify travel preferences</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Budget Discovery Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Deterministic Calculations
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                <span>Recalculating...</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Here's what your trip could realistically cost.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            Estimated for <strong>{intent.travelers || 2} travelers</strong> •{' '}
            <strong>{intent.duration || intent.durationDays || 4} days</strong> to{' '}
            <strong>{intent.destination || 'Goa'}</strong> (from {intent.origin || 'Bhubaneswar'}).
          </p>
        </div>

        {appliedBudget ? (
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <div>
              <span className="block text-[10px] uppercase font-bold text-sky-600">Constrained Target</span>
              <span className="font-bold text-sm">₹{appliedBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 hidden sm:block text-right">
            <span>Budget is not required.</span>
            <span className="block text-[11px] text-slate-400">Explore tiers below or specify a cap anytime.</span>
          </div>
        )}
      </div>

      {/* Interactive Constraint Solver: Optimize around ₹_____ */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Budget Constraint Solver</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Have a specific budget in mind?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have a ceiling or target, enter it below. Trip Agent will treat it as a hard constraint and identify the best possible plan without compromising trip viability.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleApplyTargetBudget}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10"
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="500"
                value={targetBudgetInput}
                onChange={(e) => setTargetBudgetInput(e.target.value)}
                placeholder="Optimize around ₹_____"
                className="w-full sm:w-64 pl-8 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !targetBudgetInput}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-sky-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Optimize</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {appliedBudget && (
              <button
                type="button"
                onClick={handleClearTargetBudget}
                title="Reset constraint"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-medium transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </form>
        </div>

        {/* Constraint Analysis Result Banner */}
        {constraintAnalysis && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed transition-all ${
              constraintAnalysis.status === 'tight-budget'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {constraintAnalysis.status === 'tight-budget' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-white/15">
                  Constraint Optimization Result
                </span>
                <span className="font-bold text-white">
                  Recommended Fit: {constraintAnalysis.recommendedTierName} Tier (₹{constraintAnalysis.recommendedTotal.toLocaleString('en-IN')})
                </span>
              </div>
              <p className="text-slate-200">{constraintAnalysis.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayTiers.map((tier) => {
          const isSelected = activeTierPreview?.id === tier.id;
          const isConstraintMatch =
            constraintAnalysis &&
            (constraintAnalysis.recommendedTierKey === tier.rawKey ||
              constraintAnalysis.recommendedTierName.toLowerCase() === tier.name.toLowerCase());
          const isBestValue = tier.id === 'best-value';

          return (
            <div
              key={tier.id}
              onClick={() => setActiveTierPreview(tier)}
              className={`relative flex flex-col rounded-3xl p-6 transition-all cursor-pointer border ${
                isConstraintMatch
                  ? 'bg-white ring-2 ring-emerald-500 shadow-xl border-transparent scale-[1.02]'
                  : isSelected
                  ? 'bg-white ring-2 ring-sky-500 shadow-xl border-transparent scale-[1.01]'
                  : isBestValue
                  ? 'bg-white border-emerald-300 shadow-md hover:shadow-lg'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badges */}
              {isConstraintMatch ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                  Optimal for ₹{appliedBudget.toLocaleString('en-IN')}
                </div>
              ) : isBestValue ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-sky-700 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                  Recommended Choice
                </div>
              ) : null}

              {/* Card Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tier.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {tier.badge}
                  </span>
                </div>

                <div className="mt-3 text-3xl font-black text-slate-900">
                  ₹{tier.totalCost.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  ₹{tier.perPersonCost.toLocaleString('en-IN')} / person
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[3.25rem]">
                {tier.headline}
              </p>

              {/* Service Levels Matrix */}
              <div className="space-y-3 py-3 border-y border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Hotel className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Accommodation:</span>
                    <span className="text-slate-600 text-[11px]">{tier.levels.accommodation}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Plane className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Transit:</span>
                    <span className="text-slate-600 text-[11px]">{tier.levels.transport}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Utensils className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Food & Dining:</span>
                    <span className="text-slate-600 text-[11px]">{tier.levels.food}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Compass className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Activities:</span>
                    <span className="text-slate-600 text-[11px]">{tier.levels.activities}</span>
                  </div>
                </div>

                {tier.levels.localTransit && (
                  <div className="flex items-start gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Local Mobility:</span>
                      <span className="text-slate-600 text-[11px]">{tier.levels.localTransit}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inclusions */}
              <div className="py-3 space-y-1.5 text-[11px] text-slate-600">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block">
                  What is Included
                </span>
                {tier.inclusions.slice(0, 3).map((inc, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>

              {/* Trade-offs */}
              <div className="pb-4 space-y-1 text-[11px] text-slate-500">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block">
                  Trade-offs to Consider
                </span>
                {tier.tradeoffs.slice(0, 2).map((tr, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-500">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{tr}</span>
                  </div>
                ))}
              </div>

              {/* Choose this plan button */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoosePlan(tier);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                    isConstraintMatch
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-105'
                      : isBestValue
                      ? 'bg-sky-700 hover:bg-sky-800 text-white shadow-sky-700/20 hover:scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-105'
                  }`}
                >
                  <span>Choose this plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tier Budget Breakdown Visualization */}
      {activeTierPreview && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Itemized Cost Allocation
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Spend Distribution for {activeTierPreview.name} Tier
              </h3>
            </div>
            <button
              onClick={() => handleChoosePlan(activeTierPreview)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold self-start sm:self-auto transition-all hover:scale-105 shadow"
            >
              <span>Generate Itinerary for {activeTierPreview.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BudgetBreakdownChart
            breakdown={activeTierPreview.breakdown}
            totalCost={activeTierPreview.totalCost}
          />
        </div>
      )}

      {/* Transparency & Trust Notice */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            How Trip Agent Estimates Your Budget
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Unlike chatbots that produce invented numbers, Trip Agent builds deterministic calculations from real transportation schedules, verified room night benchmarks, local meal indexes, and destination activity options. When you generate an itinerary, each day is structured with these exact components, which you can adjust or re-optimize at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

