import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  Info,
  RefreshCw,
  Coins
} from 'lucide-react';
import bookingService from '../../services/bookingService.js';

export default function BookingModal({
  isOpen,
  onClose,
  item,
  travelers = 2,
  tripContext = {},
}) {
  const [step, setStep] = useState('handover'); // 'handover' | 'processing' | 'confirmed'
  const [handoverData, setHandoverData] = useState(null);

  if (!isOpen || !item) return null;

  const handleStartHandover = async () => {
    setStep('processing');
    try {
      const data = await bookingService.initiateHandover({
        optionId: item.id,
        tripId: tripContext.id || 'demo-trip',
        category: item.category || 'accommodation',
        travelers: travelers,
      });
      setHandoverData(data);
      setTimeout(() => {
        setStep('confirmed');
      }, 1000);
    } catch (err) {
      // Fallback local simulation if backend offline
      setHandoverData({
        trackingRef: `TA-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        commissionTerms: { rate: 'Partner commission on eligible completed bookings' },
      });
      setTimeout(() => {
        setStep('confirmed');
      }, 1000);
    }
  };

  const handleClose = () => {
    setStep('handover');
    setHandoverData(null);
    onClose();
  };

  const trackingRef =
    handoverData?.trackingRef ||
    item.trackingRef ||
    `TA-REF-${Math.floor(100000 + Math.random() * 900000)}`;

  const commissionModelNotice = 'Partner commission on eligible completed bookings';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Partner Handover Flow
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Simulated Partner Transaction
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {item.title || item.name}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Stage Transaction Visualizer */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Trip Agent Monetization Loop
          </span>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 gap-1 flex-wrap">
            <span className="text-sky-700 bg-sky-100 px-2 py-0.5 rounded">1. Traveler</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-sky-700 bg-sky-100 px-2 py-0.5 rounded">2. Trip Agent</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">3. Partner</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">4. Booking</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded">5. Commission</span>
          </div>
        </div>

        {step === 'processing' && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Generating secure affiliate tracking token & itinerary handover...
            </p>
            <p className="text-[11px] text-slate-400">
              Transferring date and traveler parameters to partner booking engine
            </p>
          </div>
        )}

        {step === 'confirmed' && (
          /* Confirmation Success View */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Partner Handover & Reservation Confirmed!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Trip Agent would redirect the traveler to the partner to complete the booking. In production, this hands the traveler directly over to{' '}
                <strong>{item.provider || 'the booking partner'}</strong> with pre-populated itinerary parameters.
              </p>
            </div>

            <div className="space-y-2 max-w-sm mx-auto text-left">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Affiliate Tracking Ref:</span>
                  <strong className="font-mono text-slate-800">{trackingRef}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Partner Provider:</span>
                  <strong className="text-slate-800">{item.provider || 'Direct Travel Partner'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Partner Compensation:</span>
                  <strong className="text-purple-700 font-bold">Performance CPA (Eligible bookings)</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-800 flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>
                  <strong>Monetization Logged:</strong> Partner transaction attributed. Traveler pays zero fee.
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20"
            >
              Return to Itinerary
            </button>
          </div>
        )}

        {step === 'handover' && (
          /* Pre-booking details */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Partner: <strong>{item.provider || 'Partner Provider'}</strong>
                </span>
                <span className="text-emerald-700 font-semibold">
                  {item.partnerBadge || item.badge || 'Partner-ready option'}
                </span>
              </div>

              <div className="text-xl font-extrabold text-slate-900">
                ₹{item.price?.toLocaleString('en-IN') || item.totalForStay?.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({item.priceUnit || item.pricePer || 'total'})
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {travelers} Travelers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Instant Itinerary Sync
                </span>
              </div>
            </div>

            {/* "Why this option?" reminder */}
            {item.whyThisOption && (
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-800 font-bold text-[11px]">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  <span>Why this option?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {item.whyThisOption}
                </p>
              </div>
            )}

            {/* Inclusions / Highlights */}
            {item.relevantDetails && (
              <div className="space-y-1 text-xs text-slate-600">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Partner Highlights:
                </span>
                {item.relevantDetails.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust & Commission Disclosure */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Zero Added Cost:</strong> You pay the direct partner price. Trip Agent receives partner commission on eligible completed bookings (commission rate depends on partner agreement) directly from the partner upon completed reservation.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartHandover}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Book</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
