import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Star,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Award,
  AlertCircle
} from 'lucide-react';

export default function OptionDetailsModal({
  isOpen,
  onClose,
  option,
  onBook,
  travelers = 2,
}) {
  if (!isOpen || !option) return null;

  const handleBookClick = () => {
    onClose();
    if (onBook) onBook(option);
  };

  const relevance = option.relevanceScore
    ? Math.round(option.relevanceScore * 100)
    : 88;

  const breakdown = option.matchBreakdown || {
    preferenceMatch: 85,
    priceFit: 90,
    locationScore: 80,
    ratingScore: 92,
    convenienceScore: 88,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {option.category}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {option.partnerBadge || 'Partner-ready option'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Sample Option
              </span>
              {option.isSponsored && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Featured Partner
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {option.title || option.name}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>By {option.provider}</span>
              {option.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {option.location}
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image if available */}
        {option.imageUrl && (
          <div className="h-48 sm:h-56 rounded-2xl overflow-hidden relative shadow-inner">
            <img
              src={option.imageUrl}
              alt={option.title || option.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{option.rating}</span>
              <span className="text-slate-300 font-normal">({option.reviewsCount || 350})</span>
            </div>
          </div>
        )}

        {/* "Why this option?" Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/50 border border-sky-200/80 space-y-2">
          <div className="flex items-center gap-2 text-sky-800">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Why this option was selected for your journey
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {option.whyThisOption ||
              'Selected specifically for your selected budget tier and pacing style, balancing guest satisfaction, optimal location, and competitive partner pricing.'}
          </p>
        </div>

        {/* Trust Principle: Relevance Scoring Transparency */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900">
                Transparent Relevance Match
              </h4>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {relevance}% Match
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Ranked strictly by itinerary fit and user preferences. Commissions never manipulate our recommendation order.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Preference Fit</span>
              <span className="text-xs font-bold text-slate-800">{breakdown.preferenceMatch}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Price Alignment</span>
              <span className="text-xs font-bold text-slate-800">{breakdown.priceFit}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Guest Rating</span>
              <span className="text-xs font-bold text-slate-800">{breakdown.ratingScore}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Location Proximity</span>
              <span className="text-xs font-bold text-slate-800">{breakdown.locationScore}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Convenience</span>
              <span className="text-xs font-bold text-slate-800">{breakdown.convenienceScore}%</span>
            </div>
          </div>
        </div>

        {/* Included Details & Inclusions */}
        {option.relevantDetails && option.relevantDetails.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Key Inclusions & Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {option.relevantDetails.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust & Monetization Disclosure */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Monetization & Free Planning Guarantee:</strong> Planning on Trip Agent is 100% free. If you book this option through our partner, Trip Agent receives partner commission on eligible completed bookings (commission rate depends on partner agreement) at zero extra cost to you.
          </div>
        </div>

        {/* Footer Pricing & CTAs */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Sample Partner Rate (Estimated)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                ₹{option.price?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {option.priceUnit || 'per person'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleBookClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
            >
              <span>Book</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
