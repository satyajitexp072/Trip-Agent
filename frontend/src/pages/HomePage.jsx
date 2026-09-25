import React from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import { demoDestinations } from '../data/demoDestinations.js';
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingDown,
  Layers,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

export default function HomePage() {
  const { computedTiers, updateIntent, destinations } = useTrip();

  const handleSelectQuickDestination = (dest) => {
    updateIntent({
      destination: dest.name,
      origin: dest.popularOrigin || 'Bhubaneswar',
      duration: dest.defaultDuration || dest.defaultDurationDays || 4,
      durationDays: dest.defaultDuration || dest.defaultDurationDays || 4,
      interests: dest.tags,
    });
  };

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-sky-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold tracking-wide border border-sky-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Budget is an Output Variable, Not a Constraint</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your journey,{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                planned around you.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Tell us where you want to go, how you want to travel, and what you want to experience. Trip Agent builds the journey and shows what it could realistically cost.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/plan?demo=true"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 border border-amber-400"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run 5-Min Core Demo</span>
              </Link>
              <Link
                to="/plan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-lg shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Plan a journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-300 shadow-sm transition-all"
              >
                <span>Explore how it works</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Quick Prompts Bar */}
            <div className="pt-6">
              <p className="text-xs text-slate-500 font-medium mb-2.5">
                Popular journeys you can estimate right now:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(destinations || []).slice(0, 5).map((dest) => (
                  <Link
                    key={dest._id || dest.id || dest.slug}
                    to="/plan"
                    onClick={() => handleSelectQuickDestination(dest)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-700 hover:bg-sky-50/50 shadow-sm transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>{dest.popularOrigin || 'Bhubaneswar'} → {dest.name} ({dest.defaultDuration || dest.defaultDurationDays || 4}D)</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Example of Four Budget Tiers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Multi-Tier Cost Discovery
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Realistic Trip Costs Across 4 Distinct Tiers
          </h2>
          <p className="text-sm text-slate-600">
            You don't need to guess how much your trip will cost. We generate realistic estimates for every travel style:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {computedTiers.map((tier) => {
            const isBestValue = tier.id === 'best-value';

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl p-6 transition-all border ${
                  isBestValue
                    ? 'bg-white ring-2 ring-emerald-500 shadow-xl border-transparent scale-[1.02]'
                    : 'bg-white hover:bg-slate-50/60 border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isBestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Most Popular Choice
                  </div>
                )}

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
                  <p className="text-xs text-slate-500 mt-0.5">
                    approx. ₹{tier.perPersonCost.toLocaleString('en-IN')} per person
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {tier.summary}
                </p>

                {/* Level Highlights */}
                <div className="space-y-2.5 text-xs text-slate-700 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 w-16 flex-shrink-0">Stay:</span>
                    <span className="text-slate-600">{tier.levels.accommodation}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 w-16 flex-shrink-0">Transit:</span>
                    <span className="text-slate-600">{tier.levels.transport}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-auto pt-6">
                  <Link
                    to="/plan"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isBestValue
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>Explore this tier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Core Product Loop Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              The Trip Agent Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Discover → Estimate → Compare → Plan → Book
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We flipped the conventional booking funnel upside down. Instead of requiring you to know flight numbers and exact hotel budgets on day one, we help you uncover the true journey cost first.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                name: 'Discover',
                desc: 'Describe your vision in natural language (places, vibe, dates, or party size).',
              },
              {
                step: '02',
                name: 'Estimate',
                desc: 'Our engine calculates real-world transit, stay, dining, and activity costs.',
              },
              {
                step: '03',
                name: 'Compare',
                desc: 'Evaluate 4 transparent tiers: Cheapest, Best Value, Comfortable, and Premium.',
              },
              {
                step: '04',
                name: 'Plan',
                desc: 'Receive an itemized day-by-day journey that dynamically re-optimizes when plans shift.',
              },
              {
                step: '05',
                name: 'Book',
                desc: 'Seamlessly reserve flights, curated boutique stays, and partner experiences.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2 hover:border-sky-500/60 transition-colors"
              >
                <div className="text-sky-400 font-mono text-sm font-bold">{st.step}</div>
                <h4 className="text-base font-bold text-white">{st.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transparent estimations • No hidden surcharges • Instant dynamic replanning</span>
            </div>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Destinations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Inspiration & Ideas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Journey Destinations
            </h2>
          </div>
          <Link
            to="/plan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>Custom destination planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(destinations || []).slice(0, 8).map((dest) => (
            <div
              key={dest._id || dest.id || dest.slug}
              className="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-sky-300">{dest.state}</div>
                  <h3 className="text-lg font-bold">{dest.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2">
                  {dest.tagline || dest.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {(dest.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">From</span>
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{(dest.typicalDailyCost?.budget ? dest.typicalDailyCost.budget * 4 : (dest.estimatedStartingPrice || 8500)).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Link
                    to="/plan"
                    onClick={() => handleSelectQuickDestination(dest)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-600 hover:text-white transition-colors"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
