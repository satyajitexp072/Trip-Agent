import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6 shadow-inner">
        <Compass className="w-8 h-8 animate-spin" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page Not Found (404)
      </h1>
      <p className="text-slate-600 max-w-md mb-8 text-sm">
        It looks like this journey route doesn't exist. Let's get you back on track to exploring trips.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
