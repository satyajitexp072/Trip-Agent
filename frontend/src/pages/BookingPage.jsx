import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import bookingService from '../services/bookingService.js';
import BookingModal from '../components/booking/BookingModal.jsx';
import OptionDetailsModal from '../components/booking/OptionDetailsModal.jsx';
import {
  ShieldCheck,
  Plane,
  Hotel,
  Compass,
  Star,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Users,
  Eye,
  Sparkles,
  Info,
  Briefcase,
  Layers,
  Code2,
  TrendingUp,
  X,
  Send,
  MapPin,
  Clock,
  Award
} from 'lucide-react';

export default function BookingPage() {
  const { itinerary, intent } = useTrip();

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetailsOption, setSelectedDetailsOption] = useState(null);
  const [selectedBookingItem, setSelectedBookingItem] = useState(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerFormSubmitted, setPartnerFormSubmitted] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({
    businessName: '',
    category: 'Hotels & Resorts',
    contactEmail: '',
    website: '',
    inventoryDetails: '',
  });

  const tripId = itinerary?.id || 'default';

  // Fetch structured bookable options
  useEffect(() => {
    let isMounted = true;
    async function loadOptions() {
      setLoading(true);
      try {
        const data = await bookingService.getBookingOptions(tripId, activeTab);
        if (isMounted) {
          setOptions(data.options || []);
        }
      } catch (err) {
        console.error('Failed to load booking options:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [tripId, activeTab]);

  const handleOpenDetails = (option) => {
    setSelectedDetailsOption(option);
  };

  const handleOpenBookModal = (option) => {
    setSelectedBookingItem(option);
  };

  const handlePartnerFormSubmit = (e) => {
    e.preventDefault();
    setPartnerFormSubmitted(true);
    setTimeout(() => {
      setPartnerFormSubmitted(false);
      setIsPartnerModalOpen(false);
      setPartnerFormData({
        businessName: '',
        category: 'Hotels & Resorts',
        contactEmail: '',
        website: '',
        inventoryDetails: '',
      });
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/journey"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary</span>
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Book Your Journey
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Simulated Partner Inventory (MVP)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Your trip is planned. Here are relevant options for the things you may want to book for your {itinerary?.tierName || 'Best Value'} plan in{' '}
            {itinerary?.destination || 'Goa'}.
          </p>
        </div>

        {/* Business Model Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sky-600 flex-shrink-0" />
          <div className="text-xs text-slate-600 leading-snug">
            <strong>Free for Travelers:</strong> Trip Agent is 100% free to plan. Partner commission on eligible completed bookings (commission rate depends on partner agreement).
          </div>
        </div>
      </div>

      {/* Trust Principle Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Important Trust Principle: Relevance First, Monetization Second
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Every option is ranked strictly by compatibility with your preferences, price target, location, and guest ratings.
              We <strong>never</strong> manipulate rankings to favor higher-commission options.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-xs flex-shrink-0 self-start sm:self-auto">
          100% Impartial Ranking
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Options' },
          { id: 'transport', label: 'Flights & Trains' },
          { id: 'accommodation', label: 'Hotels & Resorts' },
          { id: 'activities', label: 'Activities' },
          { id: 'tours', label: 'Guided Tours' },
          { id: 'experiences', label: 'Curated Experiences' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Options Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Fetching partner-ready options and calculating relevance scores...
          </p>
        </div>
      ) : options.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">No partner options found for this category</p>
          <p className="text-xs text-slate-500">Try switching to 'All Options' to view all available verticals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Optional Hero Image */}
              {opt.imageUrl && (
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img
                    src={opt.imageUrl}
                    alt={opt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase">
                    {opt.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold shadow flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {opt.rating}
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Badges & Rating if no image */}
                  {!opt.imageUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        {opt.category}
                      </span>
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {opt.rating} ({opt.reviewsCount})
                      </span>
                    </div>
                  )}

                  {/* Provider & Title */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500">
                        {opt.provider}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {opt.partnerBadge || 'Partner-ready option'}
                      </span>
                      {opt.isSponsored && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">
                      {opt.title}
                    </h3>
                    {opt.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {opt.location}
                      </p>
                    )}
                  </div>

                  {/* "Why this option?" Callout Snippet */}
                  {opt.whyThisOption && (
                    <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/70 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-sky-900">
                        <Sparkles className="w-3 h-3 text-sky-600 flex-shrink-0" />
                        <span>Why this option?</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {opt.whyThisOption}
                      </p>
                    </div>
                  )}

                  {/* Relevant Details Highlights */}
                  {opt.relevantDetails && opt.relevantDetails.length > 0 && (
                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      {opt.relevantDetails.slice(0, 2).map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      ₹{opt.price?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {opt.priceUnit || 'per person'} • Estimated price
                    </span>
                  </div>

                  {/* BOTH "View option" and "Book" Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(opt)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View option</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBookModal(opt)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-600/20"
                    >
                      <span>Book</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* "FOR TRAVEL BUSINESSES" B2B CONCEPT SECTION */}
      {/* ========================================================================= */}
      <div className="mt-16 pt-12 border-t-2 border-dashed border-slate-200 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              For Travel Businesses & Operators
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Turn high-intent AI itineraries into direct booking transactions.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Trip Agent connects hotels, airlines, and licensed experience creators with travelers at the exact moment their personalized day-by-day journey is being shaped.
            </p>
          </div>

          {/* 4 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Qualified Travelers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Travelers come with confirmed travel dates, party size, pacing style, and calculated budget tiers. Zero cold bounce traffic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Native AI Integration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your inventory is recommended natively inside dynamic day-by-day schedules (e.g. sunset catamaran right after an afternoon beach stroll).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Zero Upfront Fees</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Performance-based commission (CPA). Partner commission on eligible completed bookings (rate depends on partner agreement).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Future Partner API</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upcoming REST & GraphQL APIs to synchronize real-time rates, inventory allotments, and automated reservation callbacks.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="text-xs text-slate-400">
              Accepting early access partner applications for Boutique Stays, Tours & Unique Local Experiences.
            </div>
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md hover:scale-105"
            >
              <span>Partner with Trip Agent</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "View option" Details Modal */}
      <OptionDetailsModal
        isOpen={Boolean(selectedDetailsOption)}
        onClose={() => setSelectedDetailsOption(null)}
        option={selectedDetailsOption}
        onBook={handleOpenBookModal}
        travelers={itinerary?.travelers || intent.travelers || 2}
      />

      {/* "Book" Partner Handover Modal */}
      <BookingModal
        isOpen={Boolean(selectedBookingItem)}
        onClose={() => setSelectedBookingItem(null)}
        item={selectedBookingItem}
        travelers={itinerary?.travelers || intent.travelers || 2}
        tripContext={{
          id: itinerary?.id,
          destination: itinerary?.destination,
          tierName: itinerary?.tierName,
        }}
      />

      {/* Partner Registration / Inquiry Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Partner Network Inquiry</h3>
                <p className="text-xs text-slate-500">Connect your inventory to Trip Agent</p>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {partnerFormSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Inquiry Received!</h4>
                <p className="text-xs text-slate-500">
                  Our Travel Partnerships team will review your business credentials and provide API access details within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerFormSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Business / Property Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coastal Heritage Villas"
                    value={partnerFormData.businessName}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, businessName: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Category Vertical
                  </label>
                  <select
                    value={partnerFormData.category}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, category: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Hotels & Resorts</option>
                    <option>Airlines & Rail Carriers</option>
                    <option>Guided Tours & Day Trips</option>
                    <option>Water Sports & Adventures</option>
                    <option>Curated Experiences & Dining</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@yourbusiness.com"
                    value={partnerFormData.contactEmail}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, contactEmail: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Website or Booking Engine URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourbusiness.com"
                    value={partnerFormData.website}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, website: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
