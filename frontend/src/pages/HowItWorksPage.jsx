import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  TrendingDown,
  Repeat,
  DollarSign,
  Building2,
  Cpu,
  Layers,
  ShieldCheck,
  ArrowRight,
  Code2,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 pb-28">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Product Philosophy & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Trip Agent Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Trip Agent is an AI-powered travel planning and journey optimization platform built on the principle that travelers should not have to guess what a trip costs before planning it.
        </p>
      </div>

      {/* Core Principle 1: Budget as an Output Variable */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shadow-inner">
            01
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Budget is an Output Variable, Not an Input Constraint
            </h2>
            <span className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
              The Fundamental Flaw of Traditional Travel Sites
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Traditional booking portals force travelers to filter by nightly budget, specific flight numbers, and star ratings before they even know whether ₹15,000 or ₹40,000 is realistic for their destination.
        </p>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Example in Action:
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 italic">
            "I want a 4-day trip from Bhubaneswar to Goa with beaches, good food and a relaxed pace."
          </div>
          <p className="leading-relaxed">
            Trip Agent analyzes seasonal transit rates, boutique hotel medians, culinary averages, and local activity costs to immediately present four realistic tiers:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-800">
            <div className="p-2 rounded bg-amber-50 border border-amber-200">Cheapest: ₹8,500</div>
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200 font-bold">Best Value: ₹15,500</div>
            <div className="p-2 rounded bg-blue-50 border border-blue-200">Comfortable: ₹26,000</div>
            <div className="p-2 rounded bg-purple-50 border border-purple-200">Premium: ₹48,000</div>
          </div>
        </div>
      </div>

      {/* Core Principle 2: Dynamic Replanning */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-inner">
            02
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Dynamic Journey Replanning
            </h2>
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
              No More Starting Over When Things Change
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Generic AI chatbots generate a completely random, unrelated itinerary whenever a user asks for an adjustment. Trip Agent treats an itinerary as a structured graph of connected nodes (stays, flights, meals, sights).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Swap Components</h4>
            <p className="text-slate-500">
              Change a hotel to one closer to the beach, and the route visualizer immediately recalculates local transit times.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Natural Levers</h4>
            <p className="text-slate-500">
              Click "Make it cheaper" or enter "Give me a more relaxed second day" to intelligently adjust pacing without losing your favorite restaurant.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Before vs After Diff</h4>
            <p className="text-slate-500">
              Every optimization clearly highlights the financial delta and summarizes the precise trade-offs made.
            </p>
          </div>
        </div>
      </div>

      {/* Business Model & Monetization Roadmap */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Commercial Roadmap
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            The Business Model
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            How Trip Agent creates value for travelers while scaling into a sustainable TravelTech business:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Free Traveler Planning</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unrestricted, transparent natural language journey planning and multi-tier cost discovery at zero cost to the end consumer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Booking Commissions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partner commission on eligible completed bookings (commission rate depends on partner agreement) when users book suggested flights, hotels, and tours.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Qualified Lead Gen</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct high-intent travel requests forwarded to verified boutique tour operators, car rentals, and luxury villas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-sm font-bold text-white">B2B / API Integrations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              White-label trip estimation API licensed to airlines, travel aggregators, and corporate booking tools.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h4 className="text-sm font-bold text-white">Travel Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anonymized aggregate traveler intent metrics and seasonal pricing elasticity reports for hospitality groups.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                ★
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Try the Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience how intuitive travel discovery feels today.
              </p>
            </div>
            <Link
              to="/plan"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 pt-2"
            >
              <span>Build an Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
