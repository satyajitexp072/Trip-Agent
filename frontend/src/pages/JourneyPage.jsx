import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import RouteVisualizer from '../components/journey/RouteVisualizer.jsx';
import ItemChangeModal from '../components/journey/ItemChangeModal.jsx';
import OptimizationModal from '../components/journey/OptimizationModal.jsx';
import NaturalLanguageReplanBar from '../components/journey/NaturalLanguageReplanBar.jsx';
import OptionDetailsModal from '../components/booking/OptionDetailsModal.jsx';
import BookingModal from '../components/booking/BookingModal.jsx';
import { tripService } from '../services/tripService.js';
import {
  Sparkles,
  Sliders,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Plane,
  Hotel,
  Utensils,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Share2,
  Edit3,
  ExternalLink,
  Users,
  Eye,
  ShieldCheck
} from 'lucide-react';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { itinerary, optimizeTrip, swapItem, saveCurrentTrip, intent, selectedTierId } = useTrip();
  const [isStartingBooking, setIsStartingBooking] = useState(false);

  // Modal states
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [selectedDetailsOption, setSelectedDetailsOption] = useState(null);
  const [selectedBookingItem, setSelectedBookingItem] = useState(null);
  const [changeModalState, setChangeModalState] = useState({
    isOpen: false,
    category: null,
    item: null,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!itinerary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">No active journey selected</h2>
        <p className="text-sm text-slate-500">Please choose a travel tier to generate your itinerary.</p>
        <Link
          to="/plan"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          Plan a Journey
        </Link>
      </div>
    );
  }

  const handleOpenChangeModal = (category, item) => {
    setChangeModalState({
      isOpen: true,
      category,
      item,
    });
  };

  const handleApplySwap = (newAlt) => {
    swapItem(changeModalState.category, changeModalState.item.id, newAlt);
  };

  const handleSave = () => {
    saveCurrentTrip();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleStartBooking = async () => {
    setIsStartingBooking(true);
    let targetTripId = itinerary.id;
    if (!targetTripId || targetTripId === 'default' || targetTripId === 'demo' || !targetTripId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const created = await tripService.createTrip({
          origin: itinerary.origin || intent?.origin || 'Bhubaneswar',
          destination: itinerary.destination || intent?.destination || 'Goa',
          duration: Number(itinerary.durationDays || intent?.duration || intent?.durationDays) || 4,
          travelers: Number(itinerary.travelers || intent?.travelers) || 2,
          interests: intent?.interests || ['Beach', 'Culture'],
          travelStyle: intent?.travelStyle || 'Relaxed',
          selectedBudgetTier: itinerary.tierId || selectedTierId || 'bestValue',
          title: itinerary.tripTitle || `${itinerary.destination || 'Goa'} Journey`,
          summary: itinerary.summary || '',
          status: 'Planned',
          itinerary: itinerary,
        });
        if (created?.data?._id) {
          targetTripId = created.data._id;
        }
      } catch (err) {
        console.warn('Trip save failed, fallback to id/demo:', err);
        targetTripId = targetTripId || `trip-${Date.now()}`;
      }
    }
    navigate(`/checkout/${targetTripId || 'demo'}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 pb-28">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/discovery"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tiers</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {itinerary.tierName} Plan
            </span>
            <span className="text-xs text-slate-500">
              {itinerary.durationDays || 4} Days • {itinerary.travelers || 2} Travelers
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {itinerary.tripTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            {itinerary.summary}
          </p>
        </div>

        {/* Total Cost & CTAs */}
        <div className="flex flex-col sm:flex-row items-start lg:items-end gap-4 self-start lg:self-auto">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Estimated Cost
            </span>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              ₹{itinerary.totalCost.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500">
              ₹{itinerary.perPersonCost?.toLocaleString('en-IN')} per traveler
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsOptimizeOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Optimize Trip</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
              >
                <Bookmark className={`w-3.5 h-3.5 ${saveSuccess ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                <span>{saveSuccess ? 'Saved!' : 'Save Trip'}</span>
              </button>

              <button
                type="button"
                onClick={handleStartBooking}
                disabled={isStartingBooking}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                <span>{isStartingBooking ? 'Preparing Checkout...' : 'Book Journey'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Natural Language Replanner */}
      <NaturalLanguageReplanBar
        onReplan={optimizeTrip}
        currentItinerary={itinerary}
        onOpenOptimize={() => setIsOptimizeOpen(true)}
      />

      {/* Interactive Route / Map Visualizer */}
      <RouteVisualizer
        origin={itinerary.origin}
        destination={itinerary.destination}
        days={itinerary.days}
      />

      {/* Main Highlights Grid: Accommodation & Primary Transport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accommodation Card */}
        {itinerary.accommodation && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                  <Hotel className="w-4 h-4" />
                  Primary Accommodation
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDetailsOption({
                        id: itinerary.accommodation.id || 'acc-current',
                        category: 'accommodation',
                        provider: itinerary.accommodation.name,
                        title: itinerary.accommodation.name,
                        price: itinerary.accommodation.costPerNight,
                        priceUnit: 'per night',
                        location: itinerary.accommodation.location || itinerary.destination,
                        rating: itinerary.accommodation.rating || 4.6,
                        reviewsCount: itinerary.accommodation.reviewsCount || 420,
                        imageUrl: itinerary.accommodation.image,
                        whyThisOption: `Selected for your ${itinerary.tierName} plan in ${itinerary.destination}: comfortable stay with high ratings, verified amenities, and close beach proximity.`,
                        relevantDetails: itinerary.accommodation.amenities || [],
                        partnerBadge: 'Partner-ready option',
                        isSponsored: false,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>View option</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBookingItem({
                        id: itinerary.accommodation.id || 'acc-current',
                        category: 'accommodation',
                        provider: itinerary.accommodation.name,
                        title: itinerary.accommodation.name,
                        price: itinerary.accommodation.totalCost || itinerary.accommodation.costPerNight,
                        priceUnit: 'total stay',
                        partnerBadge: 'Partner-ready option',
                        whyThisOption: `Selected for your ${itinerary.tierName} plan in ${itinerary.destination}.`,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Book</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenChangeModal('accommodation', itinerary.accommodation)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {itinerary.accommodation.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {itinerary.accommodation.type} • {itinerary.accommodation.distanceToBeach}
                </p>
              </div>

              {itinerary.accommodation.image && (
                <div className="h-36 rounded-2xl overflow-hidden relative shadow-inner">
                  <img
                    src={itinerary.accommodation.image}
                    alt={itinerary.accommodation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                    ★ {itinerary.accommodation.rating} ({itinerary.accommodation.reviewsCount})
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {itinerary.accommodation.amenities?.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {itinerary.accommodation.nights} Nights × ₹{itinerary.accommodation.costPerNight?.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                ₹{itinerary.accommodation.totalCost?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Transport & Local Transit Card */}
        {itinerary.transport && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                  <Plane className="w-4 h-4" />
                  Inbound & Return Transit
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDetailsOption({
                        id: itinerary.transport.id || 'trans-current',
                        category: 'transport',
                        provider: itinerary.transport.provider,
                        title: itinerary.transport.title,
                        price: itinerary.transport.totalCost,
                        priceUnit: 'roundtrip',
                        rating: 4.4,
                        reviewsCount: 1200,
                        whyThisOption: `Selected for optimal travel time and convenient scheduled departures for your group.`,
                        relevantDetails: [
                          `Outbound: ${itinerary.transport.departure}`,
                          `Return: ${itinerary.transport.returnArrival}`,
                          `Duration: ${itinerary.transport.duration}`,
                        ],
                        partnerBadge: 'Partner-ready option',
                        isSponsored: false,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>View option</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBookingItem({
                        id: itinerary.transport.id || 'trans-current',
                        category: 'transport',
                        provider: itinerary.transport.provider,
                        title: itinerary.transport.title,
                        price: itinerary.transport.totalCost,
                        priceUnit: 'roundtrip',
                        partnerBadge: 'Partner-ready option',
                        whyThisOption: `Selected for optimal transit between ${itinerary.origin} and ${itinerary.destination}.`,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Book</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenChangeModal('transport', itinerary.transport)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {itinerary.transport.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {itinerary.transport.provider} • {itinerary.transport.duration}
                </p>
              </div>

              {/* Transit Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Outbound Departure:</span>
                  <strong className="text-slate-900">{itinerary.transport.departure}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Return Arrival:</span>
                  <strong className="text-slate-900">{itinerary.transport.returnArrival}</strong>
                </div>
              </div>

              {/* Local transit add-on */}
              {itinerary.localTransit && (
                <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-900">{itinerary.localTransit.title}</span>
                    <span className="font-bold text-sky-800">₹{itinerary.localTransit.cost}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{itinerary.localTransit.details}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Roundtrip Transit Total:</span>
              <span className="text-sm font-extrabold text-slate-900">
                ₹{itinerary.transport.totalCost?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Day-by-Day Detailed Itinerary Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Personalized Day-by-Day Schedule
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Day-by-Day Journey Itinerary
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Click 'Change' on any activity to swap it
          </span>
        </div>

        <div className="space-y-6">
          {itinerary.days?.map((dayPlan) => (
            <div
              key={dayPlan.day}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow">
                    D{dayPlan.day}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {dayPlan.title}
                    </h3>
                    <span className="text-xs text-slate-500">{dayPlan.date}</span>
                  </div>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Day Estimated Spend
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{dayPlan.estimatedSpend?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="space-y-4 pl-2 sm:pl-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {dayPlan.timeline?.map((item, idx) => {
                  const isActivity = item.type === 'activity';
                  const isFood = item.type === 'food';
                  const isTransport = item.type === 'transport';

                  const Icon = isActivity ? Compass : isFood ? Utensils : isTransport ? Plane : Hotel;

                  return (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      {/* Timeline Dot with Icon */}
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-sky-500 text-slate-600 group-hover:text-sky-600 flex items-center justify-center relative z-10 shadow-sm transition-colors flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">
                              {item.time}
                            </span>
                            <span className="text-slate-300">•</span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                            {item.cost > 0 && (
                              <span className="text-xs font-extrabold text-slate-800 mr-1">
                                ₹{item.cost.toLocaleString('en-IN')}
                              </span>
                            )}
                            {(item.cost > 0 || item.type === 'activity' || item.type === 'food') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDetailsOption({
                                      id: item.id || `item-${item.title}`,
                                      category: item.type === 'food' ? 'experiences' : 'activities',
                                      provider: item.provider || 'Local Partner Operator',
                                      title: item.title,
                                      price: item.cost || 550,
                                      priceUnit: 'per person',
                                      location: item.location || itinerary.destination,
                                      rating: 4.8,
                                      reviewsCount: 380,
                                      whyThisOption: `Curated for Day ${dayPlan.day} in ${itinerary.destination}: ${item.description || item.title}`,
                                      relevantDetails: [
                                        `Scheduled Time: ${item.time}`,
                                        `Duration: ${item.duration}`,
                                        `Category: ${item.type}`,
                                      ],
                                      partnerBadge: 'Partner-ready option',
                                      isSponsored: false,
                                    })
                                  }
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-0.5"
                                >
                                  <Eye className="w-2.5 h-2.5 text-slate-500" />
                                  <span>View option</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedBookingItem({
                                      id: item.id || `item-${item.title}`,
                                      category: item.type === 'food' ? 'experiences' : 'activities',
                                      provider: item.provider || 'Local Partner Operator',
                                      title: item.title,
                                      price: item.cost || 550,
                                      priceUnit: 'per person',
                                      partnerBadge: 'Partner-ready option',
                                      whyThisOption: `Handpicked for your ${itinerary.tierName} plan in ${itinerary.destination}.`,
                                    })
                                  }
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white transition-colors inline-flex items-center gap-0.5"
                                >
                                  <span>Book</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              </>
                            )}
                            {item.canChange && (
                              <button
                                type="button"
                                onClick={() => handleOpenChangeModal('activity', item)}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 transition-colors"
                              >
                                Change
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.duration}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Floating Booking CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30 animate-in slide-in-from-bottom">
        <div className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Journey Price</div>
            <div className="text-xl font-black text-white">
              ₹{itinerary.totalCost.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptimizeOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700 hidden sm:block"
            >
              Optimize
            </button>
            <button
              type="button"
              onClick={handleStartBooking}
              disabled={isStartingBooking}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              <span>{isStartingBooking ? 'Preparing Checkout...' : 'Book this journey'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OptimizationModal
        isOpen={isOptimizeOpen}
        onClose={() => setIsOptimizeOpen(false)}
        currentItinerary={itinerary}
        onOptimize={optimizeTrip}
      />

      <ItemChangeModal
        isOpen={changeModalState.isOpen}
        onClose={() => setChangeModalState({ isOpen: false, category: null, item: null })}
        itemCategory={changeModalState.category}
        currentItem={changeModalState.item}
        onSelectAlternative={handleApplySwap}
      />

      {/* Option Details Modal ("View option") */}
      <OptionDetailsModal
        isOpen={Boolean(selectedDetailsOption)}
        onClose={() => setSelectedDetailsOption(null)}
        option={selectedDetailsOption}
        onBook={(opt) => setSelectedBookingItem(opt)}
        travelers={itinerary?.travelers || 2}
      />

      {/* Booking Handover Modal ("Book") */}
      <BookingModal
        isOpen={Boolean(selectedBookingItem)}
        onClose={() => setSelectedBookingItem(null)}
        item={selectedBookingItem}
        travelers={itinerary?.travelers || 2}
        tripContext={{
          id: itinerary?.id,
          destination: itinerary?.destination,
          tierName: itinerary?.tierName,
        }}
      />
    </div>
  );
}
