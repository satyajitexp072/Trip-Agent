import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Route, Plane, Car, Flag } from 'lucide-react';

export default function RouteVisualizer({ origin, destination, days }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const waypoints = [
    { name: 'MOPA Airport', type: 'Arrival', time: '12:30 PM', day: 1, coords: 'North Goa' },
    { name: 'Calangute Beach & Hotel', type: 'Stay Hub', time: '01:30 PM', day: 1, coords: 'Coastal West' },
    { name: 'Chapora Clifftop', type: 'Sunset Vista', time: '04:00 PM', day: 1, coords: 'Vagator' },
    { name: 'Fontainhas Heritage Quarter', type: 'Culture', time: '09:00 AM', day: 2, coords: 'Panjim' },
    { name: 'Basilica of Bom Jesus', type: 'UNESCO Site', time: '03:30 PM', day: 2, coords: 'Old Goa' },
    { name: 'Mandovi River Port', type: 'Catamaran Cruise', time: '06:00 PM', day: 2, coords: 'Riverfront' },
    { name: 'Anjuna Beach', type: 'Watersports & Shacks', time: '11:30 AM', day: 3, coords: 'North Coast' },
    { name: 'Assagao Bamboo Grove', type: 'Bistro Dining', time: '08:30 PM', day: 3, coords: 'Assagao' },
    { name: 'Ashwem Shore', type: 'Morning Swim', time: '08:00 AM', day: 4, coords: 'Far North' },
    { name: 'Airport Departure Gate', type: 'Return', time: '03:30 PM', day: 4, coords: 'Transit' },
  ];

  const currentDayWaypoints = waypoints.filter((w) => w.day === activeDayIndex + 1);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 overflow-hidden relative">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{origin || 'Bhubaneswar'}</span>
              <Plane className="w-3.5 h-3.5 text-sky-400 rotate-45" />
              <span>{destination || 'Goa'}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive Route & Geographic Waypoint Visualizer (Simulated Map)
            </p>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl">
          {days && days.map((d, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDayIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeDayIndex === idx
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Day {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Route Map Graphic Canvas Placeholder */}
      <div className="relative z-10 mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            Active Route: <strong>Day {activeDayIndex + 1}</strong>
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Approx. Daily Transit: 42 km • 1h 15m in transit
          </span>
        </div>

        {/* Visual Waypoint Nodes Pathway */}
        <div className="relative py-4">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 -translate-y-1/2 hidden sm:block border-dashed" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {currentDayWaypoints.map((pt, i) => (
              <div
                key={i}
                className="flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/40 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="sm:text-center">
                  <div className="text-xs font-bold text-slate-200">{pt.name}</div>
                  <div className="text-[11px] text-sky-400 font-medium">{pt.type}</div>
                  <div className="text-[10px] text-slate-500">{pt.time} • {pt.coords}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
