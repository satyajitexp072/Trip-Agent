import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, CheckCircle2, Sliders, Hotel, Utensils, Plane, DollarSign } from 'lucide-react';
import { aiService } from '../../services/aiService.js';
import { useTrip } from '../../context/TripContext.jsx';

export default function NaturalLanguageReplanBar({ onReplan, currentItinerary, onOpenOptimize }) {
  const { applyAIUpdate } = useTrip();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const samplePrompts = [
    "Make it cheaper but don't remove the main activities.",
    "Replace the hotel",
    "Show me something more comfortable",
    "Add more local food experiences",
    "Reduce travel time",
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userPrompt = prompt.trim();
    setIsLoading(true);

    try {
      // Call backend AI chat endpoint (Mock or Gemini)
      const res = await aiService.sendChatMessage({
        message: userPrompt,
        tripState: currentItinerary,
        currentContext: {
          origin: currentItinerary?.origin,
          destination: currentItinerary?.destination,
          duration: currentItinerary?.duration || currentItinerary?.durationDays,
          travelers: currentItinerary?.travelers,
          totalCost: currentItinerary?.totalCost,
          selectedBudgetTier: currentItinerary?.tierId,
        },
      });

      if (res && res.updatedTrip) {
        applyAIUpdate(res.updatedTrip, {
          action: res.action,
          message: userPrompt,
          reply: res.reply,
          summary: res.summary,
          delta: res.delta,
          details: res.details,
          affectedComponent: res.affectedComponent,
        });

        setFeedback({
          reply: res.reply,
          summary: res.summary,
          delta: res.delta,
          action: res.action,
          affectedComponent: res.affectedComponent,
        });
      }
    } catch (err) {
      console.warn('[ReplanBar] AI service call fallback:', err.message);
      // Graceful local rule fallback if offline
      const result = onReplan('custom', userPrompt);
      setFeedback({
        summary: result.summaryOfChanges[0] || 'Itinerary replanned successfully!',
        delta: result.costDelta,
      });
    } finally {
      setIsLoading(false);
      setPrompt('');
      setTimeout(() => {
        setFeedback(null);
      }, 10000);
    }
  };

  const getActionBadgeIcon = (component) => {
    switch (component) {
      case 'accommodation':
        return <Hotel className="w-3.5 h-3.5 text-indigo-500" />;
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'transport':
        return <Plane className="w-3.5 h-3.5 text-sky-500" />;
      case 'budget':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Sliders className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              AI Orchestrated Replanner
            </span>
            <span className="text-[11px] text-slate-500">
              Modifies affected components selectively without regenerating the whole trip
            </span>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
          Deterministic Service Dispatch
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask in natural language (e.g. 'Make this cheaper without removing activities')..."
          className="w-full pl-4 pr-28 py-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-slate-50/60"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Orchestrating...</span>
            </>
          ) : (
            <>
              <span>Re-plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Suggested prompts:</span>
        {samplePrompts.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(s)}
            className="text-[11px] px-3 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors border border-slate-200/80 hover:border-sky-200"
          >
            "{s}"
          </button>
        ))}
      </div>

      {/* AI Execution Feedback Notification */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-white/10 flex items-center justify-center">
                {getActionBadgeIcon(feedback.affectedComponent)}
              </span>
              <span className="font-bold text-[11px] uppercase tracking-wider text-sky-300">
                {feedback.action || 'AI Update Completed'}
              </span>
            </div>

            {feedback.delta !== undefined && feedback.delta !== 0 && (
              <span
                className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                  feedback.delta < 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {feedback.delta < 0 ? `-₹${Math.abs(feedback.delta).toLocaleString('en-IN')}` : `+₹${feedback.delta.toLocaleString('en-IN')}`}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {feedback.reply || feedback.summary}
          </p>

          {onOpenOptimize && (
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Itemized diffs and preserved elements available:
              </span>
              <button
                type="button"
                onClick={onOpenOptimize}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-sm self-start sm:self-auto"
              >
                <span>View Before/After Comparison</span>
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
