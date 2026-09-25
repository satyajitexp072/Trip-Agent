import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { useTrip } from '../../context/TripContext.jsx';
import {
  Compass,
  MapPin,
  Calendar,
  Bookmark,
  UserCheck,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { savedTrips, itinerary } = useTrip();

  const navLinks = [
    { name: 'Plan a Journey', path: '/plan', icon: Sparkles },
    { name: 'Budget Tiers', path: '/discovery', icon: DollarSign },
    { name: 'Itinerary', path: '/journey', icon: Compass },
    { name: 'Book & Partners', path: '/book', icon: ShieldCheck },
    { name: 'My Trips', path: '/trips', icon: Bookmark, badge: savedTrips.length },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-[spin_25s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                  Trip Agent
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded border border-sky-200 uppercase tracking-wider">
                  Trip-Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                AI Travel Planning & Journey Optimization
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status Badge */}
          <div className="hidden lg:flex items-center gap-4">
            <StatusBadge />
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
            >
              <span>Plan Trip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <StatusBadge />
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Journey</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
