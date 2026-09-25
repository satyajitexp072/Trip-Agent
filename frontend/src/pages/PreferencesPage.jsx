import React, { useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import {
  UserCheck,
  MapPin,
  Heart,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Utensils,
  Hotel,
  Clock,
  Sparkles
} from 'lucide-react';

export default function PreferencesPage() {
  const { preferences, updatePreferences } = useTrip();

  const [form, setForm] = useState(preferences);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updatePreferences(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 pb-28">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Smart Traveler Memory
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
            Stored Locally
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Traveler Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Preferences that Trip Agent automatically incorporates into every future itinerary and cost discovery.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <span>Traveler Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Display Name</label>
              <input
                type="text"
                value={form.travelerName}
                onChange={(e) => setForm({ ...form, travelerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Default Home Airport / City</label>
              <input
                type="text"
                value={form.homeAirport}
                onChange={(e) => setForm({ ...form, homeAirport: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Travel Style & Preferred Tier */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <span>Pacing & Tier Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Default Travel Pace</label>
              <select
                value={form.defaultTravelStyle}
                onChange={(e) => setForm({ ...form, defaultTravelStyle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Relaxed">Relaxed (Slow mornings, maximum 2 activities/day)</option>
                <option value="Balanced">Balanced (Standard pace with landmark highlights)</option>
                <option value="Fast-Paced">Fast-Paced (Active schedule from dawn to dusk)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Default Budget Tier Focus</label>
              <select
                value={form.preferredTier}
                onChange={(e) => setForm({ ...form, preferredTier: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="cheapest">Cheapest (Budget backpacker & social hostels)</option>
                <option value="best-value">Best Value (Recommended 3-star boutique stays)</option>
                <option value="comfortable">Comfortable (4-star resorts & private cabs)</option>
                <option value="premium">Premium (5-star private villas & yachts)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dietary & Stay Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-sky-600" />
            <span>Culinary & Stay Preferences</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Accommodation Preference Note
              </label>
              <input
                type="text"
                value={form.stayPreference}
                onChange={(e) => setForm({ ...form, stayPreference: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Transit Preference Note
              </label>
              <input
                type="text"
                value={form.transitPreference}
                onChange={(e) => setForm({ ...form, transitPreference: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {saved && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences updated successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
