import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import { bookingService } from '../services/bookingService.js';
import {
  Bookmark,
  Calendar,
  Users,
  MapPin,
  Trash2,
  ArrowRight,
  Compass,
  Plus,
  CheckCircle2,
  Receipt,
  Plane,
  Hotel,
  Ticket,
  Car,
  CreditCard,
  ShieldCheck,
  X,
  Copy,
  Check,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  Utensils
} from 'lucide-react';

export default function SavedTripsPage() {
  const navigate = useNavigate();
  const { savedTrips, deleteTrip, loadSavedTrip } = useTrip();

  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed'); // 'confirmed' | 'drafts'
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch confirmed bookings from backend on mount
  useEffect(() => {
    fetchBookedTrips();
  }, []);

  const fetchBookedTrips = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await bookingService.getBookedTrips();
      const serverList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      // Read local confirmed bookings from localStorage
      let localList = [];
      try {
        const stored = localStorage.getItem('trip_agent_confirmed_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localList = parsed;
        }
      } catch (e) {}

      // Deduplicate by bookingId or confirmationNumber or _id
      const map = new Map();
      localList.forEach((b) => {
        const key = b.bookingId || b.confirmationNumber || b._id;
        if (key) map.set(key, b);
      });
      serverList.forEach((b) => {
        const key = b.bookingId || b.confirmationNumber || b._id;
        if (key) map.set(key, b);
      });

      const merged = Array.from(map.values()).reverse();
      setConfirmedBookings(merged);
      if (merged.length === 0 && savedTrips.length > 0) {
        setActiveTab('drafts');
      }
    } catch (err) {
      console.warn('[SavedTripsPage] Error loading confirmed bookings:', err);
      try {
        const stored = localStorage.getItem('trip_agent_confirmed_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConfirmedBookings(parsed);
          }
        }
      } catch (e) {}
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResumeTrip = (trip) => {
    loadSavedTrip(trip);
    navigate('/journey');
  };

  // Safe data extraction helpers supporting both schema formats
  const getTransport = (b) => b?.bookings?.transport || b?.transport || {};
  const getAccommodation = (b) => b?.bookings?.accommodation || b?.accommodation || {};
  const getActivities = (b) => b?.bookings?.activities || b?.activities || [];
  const getLocalTransport = (b) => b?.bookings?.localTransport || b?.localTransport || {};
  const getPayment = (b) => b?.payment || {};
  const getTotalCost = (b) => b?.totalCost || b?.totalPrice || b?.payment?.amount || 0;
  const getDuration = (b) => b?.duration || b?.durationDays || 4;

  const getItineraryDays = (booking) => {
    if (!booking) return [];
    if (Array.isArray(booking.itinerary?.days) && booking.itinerary.days.length > 0) return booking.itinerary.days;
    if (Array.isArray(booking.itinerary) && booking.itinerary.length > 0) return booking.itinerary;
    if (Array.isArray(booking.rawItinerarySnapshot?.days) && booking.rawItinerarySnapshot.days.length > 0) return booking.rawItinerarySnapshot.days;
    if (Array.isArray(booking.rawItinerarySnapshot) && booking.rawItinerarySnapshot.length > 0) return booking.rawItinerarySnapshot;
    if (Array.isArray(booking.tripId?.itinerary?.days) && booking.tripId.itinerary.days.length > 0) return booking.tripId.itinerary.days;
    if (Array.isArray(booking.tripId?.itinerary) && booking.tripId.itinerary.length > 0) return booking.tripId.itinerary;

    // Fallback: synthesized day-by-day plan across entire duration
    const dur = getDuration(booking);
    const dest = booking.destination || 'Destination';
    const total = getTotalCost(booking);
    return Array.from({ length: dur }, (_, i) => ({
      day: i + 1,
      date: `Day ${i + 1}`,
      title: i === 0 ? `Arrival & Welcome in ${dest}` : i === dur - 1 ? `Farewell & Outbound Journey` : `Exploration & Local Wonders in ${dest}`,
      estimatedSpend: Math.round(total / dur),
      timeline: [
        {
          id: `item-${i + 1}-1`,
          time: '09:00 AM',
          type: i === 0 ? 'transport' : 'activity',
          title: i === 0 ? `Inbound Transit to ${dest}` : `Morning Sightseeing & Experience in ${dest}`,
          duration: '2.5 hours',
          cost: Math.round((total / dur) * 0.4),
          description: i === 0 ? `Scheduled transit to ${dest} and hotel check-in.` : `Curated guided activity pass with certified local operator.`,
        },
        {
          id: `item-${i + 1}-2`,
          time: '01:00 PM',
          type: 'food',
          title: `Regional Culinary Luncheon`,
          duration: '1.5 hours',
          cost: Math.round((total / dur) * 0.25),
          description: `Handpicked local restaurant sampling authentic coastal specialties.`,
        },
        {
          id: `item-${i + 1}-3`,
          time: '05:30 PM',
          type: i === dur - 1 ? 'transport' : 'activity',
          title: i === dur - 1 ? `Return Departure Transit` : `Sunset Coastal Promenade & Discovery`,
          duration: '2 hours',
          cost: Math.round((total / dur) * 0.35),
          description: i === dur - 1 ? `Transfer to terminal for outbound departure.` : `Relaxed evening stroll and sunset viewing.`,
        }
      ]
    }));
  };

  const handleViewTripFromBooking = (booking) => {
    const tripData = booking.tripId && typeof booking.tripId === 'object' ? booking.tripId : null;
    const transport = getTransport(booking);
    const accommodation = getAccommodation(booking);
    const activities = getActivities(booking);
    const localTransport = getLocalTransport(booking);
    const totalCost = getTotalCost(booking);
    const duration = getDuration(booking);
    const days = getItineraryDays(booking);

    const itinerarySnapshot = {
      id: tripData?._id || booking.bookingId || `trip-${Date.now()}`,
      tripTitle: booking.tripTitle || tripData?.title || `${booking.destination} Journey`,
      destination: booking.destination,
      origin: booking.origin,
      duration: duration,
      durationDays: duration,
      travelers: booking.travelers || 2,
      tierName: booking.selectedBudgetTier || booking.selectedTierName || 'Best Value',
      tierId: (booking.selectedBudgetTier || 'best-value').toLowerCase().replace(/\s+/g, '-'),
      totalCost,
      perPersonCost: Math.round(totalCost / (booking.travelers || 2)),
      transport: {
        title: transport.title || `${transport.provider || 'Express'} to ${booking.destination}`,
        provider: transport.provider || 'Express Flight',
        costPerPerson: Math.round((transport.price || transport.cost || 0) / (booking.travelers || 2)),
        totalCost: transport.price || transport.cost || 0,
        departure: transport.departure || '08:30 AM Day 1',
        returnArrival: transport.returnArrival || '09:45 PM',
        reference: transport.reference || 'TA-FLT-CONFIRMED',
      },
      accommodation: {
        name: accommodation.name || accommodation.propertyName || 'Boutique Hotel',
        costPerNight: Math.round((accommodation.price || accommodation.cost || 0) / (accommodation.nights || Math.max(1, duration - 1))),
        totalCost: accommodation.price || accommodation.cost || 0,
        nights: accommodation.nights || Math.max(1, duration - 1),
        type: accommodation.type || accommodation.roomType || 'Boutique Stay',
        rating: accommodation.rating || 4.7,
        reference: accommodation.reference || 'TA-HOT-CONFIRMED',
      },
      activities: activities.map((a, idx) => ({
        id: a.activityId || `act-${idx}`,
        title: a.title,
        costPerPerson: a.price || a.cost || 0,
        provider: a.provider || 'Local Experience Partner',
        duration: a.duration || '2-3 hours',
        date: a.date,
        time: a.time,
        reference: a.reference,
      })),
      localTransportCost: localTransport.cost || localTransport.totalAllowance || 0,
      days: days,
      summary: booking.notes || `Confirmed ${booking.selectedBudgetTier || 'Best Value'} trip to ${booking.destination}.`,
      status: 'Confirmed',
      confirmationNumber: booking.confirmationNumber || booking.bookingId,
      trackingRef: booking.trackingRef || booking.payment?.transactionId,
    };

    loadSavedTrip({
      id: tripData?._id || booking.bookingId,
      title: `${booking.destination} Journey (${booking.selectedBudgetTier || booking.selectedTierName || 'Confirmed'})`,
      destination: booking.destination,
      origin: booking.origin,
      durationDays: duration,
      travelers: booking.travelers,
      tierName: booking.selectedBudgetTier || booking.selectedTierName || 'Best Value',
      tierId: (booking.selectedBudgetTier || 'best-value').toLowerCase().replace(/\s+/g, '-'),
      totalCost,
      itinerarySnapshot,
    });

    navigate('/journey');
  };

  const totalAllItems = confirmedBookings.length + savedTrips.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Personal Travel Vault
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {totalAllItems} Total Saved
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            My Trips & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View your confirmed journey bookings, download receipts, and manage saved itinerary drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookedTrips}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('confirmed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'confirmed'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'confirmed' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>Confirmed Bookings</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'confirmed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {confirmedBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'drafts'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'drafts' ? 'text-sky-400' : 'text-slate-400'}`} />
          <span>Saved Drafts</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'drafts' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {savedTrips.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: Confirmed Bookings */}
      {activeTab === 'confirmed' && (
        <div>
          {isLoadingBookings ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading confirmed bookings from database...</p>
            </div>
          ) : confirmedBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No confirmed bookings yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once you generate an itinerary and complete the booking verification checkout flow, your confirmed journey tickets, vouchers, and references will appear here.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to="/plan"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-700"
                >
                  <span>Plan a Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {savedTrips.length > 0 && (
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    View Saved Drafts ({savedTrips.length})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedBookings.map((b) => {
                const bookedDate = b.confirmedAt || b.createdAt;
                const formattedDate = bookedDate
                  ? new Date(bookedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={b._id || b.bookingId}
                    className="bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between ring-1 ring-emerald-500/10"
                  >
                    {/* Card Top Banner */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white relative">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmed
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {b.bookingId}
                        </span>
                      </div>

                      <div className="text-xs text-sky-300 font-semibold tracking-wide">
                        {b.origin} → {b.destination}
                      </div>
                      <h3 className="text-lg font-black text-white truncate mt-0.5">
                        {b.destination} Vacation Journey
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Booked on {formattedDate}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{b.selectedBudgetTier || b.selectedTierName || 'Best Value'}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Summary details */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{getDuration(b)} Days</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{b.travelers || 2} Travelers</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-200">
                          <Plane className="w-3.5 h-3.5 text-sky-500" />
                          <span className="truncate text-[11px]">{getTransport(b).provider || 'Primary Flight'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Hotel className="w-3.5 h-3.5 text-amber-500" />
                          <span className="truncate text-[11px]">{getAccommodation(b).name || getAccommodation(b).propertyName || 'Hotel Stay'}</span>
                        </div>
                      </div>

                      {/* References & Payment */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Confirmation No:</span>
                          <span className="font-mono font-bold text-emerald-800">{b.confirmationNumber || b.bookingId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Payment Ref:</span>
                          <span className="font-mono font-semibold text-purple-800">{b.trackingRef || b.payment?.transactionId || 'PAY-DEMO'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-semibold">Total Paid (Demo)</span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{Number(getTotalCost(b)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForModal(b)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Itinerary</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleViewTripFromBooking(b)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors border border-sky-200"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Open in Planner</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Saved Drafts */}
      {activeTab === 'drafts' && (
        <div>
          {savedTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No saved drafts</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have not saved any trip drafts yet. Customize an itinerary and hit "Save Trip" to keep it here.
              </p>
              <Link
                to="/plan"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={trip.heroImage || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                      {trip.tierName || 'Custom'}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                      {trip.status || 'Draft'}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs text-sky-300 font-medium">
                        {trip.origin} → {trip.destination}
                      </div>
                      <h3 className="text-base font-bold truncate">{trip.title}</h3>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {trip.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {trip.durationDays} Days
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {trip.travelers} Travelers
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 block">
                          ₹{trip.totalCost?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => deleteTrip(trip.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete journey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResumeTrip(trip)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <span>Resume Journey</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKING RECEIPT MODAL */}
      {selectedBookingForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedBookingForModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Confirmed Booking Receipt
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedBookingForModal.confirmationNumber || selectedBookingForModal.bookingId}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {selectedBookingForModal.tripTitle || `${selectedBookingForModal.origin} → ${selectedBookingForModal.destination}`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {getDuration(selectedBookingForModal)} Days • {selectedBookingForModal.travelers || 2} Travelers • {selectedBookingForModal.selectedBudgetTier || selectedBookingForModal.selectedTierName || 'Best Value'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Demo Ecosystem Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Simulated Travel Partner Ecosystem (Demo):</span> All confirmation references, flight PNRs, hotel vouchers, and payment records below have been simulated for hackathon demonstration. No real charges or live inventory locks occurred.
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                    Payment Transaction
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PAID_DEMO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Transaction ID:</span>
                    <span className="font-mono font-semibold text-slate-800">{getPayment(selectedBookingForModal).transactionId || 'TA-PAY-DEMO'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Paid:</span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{Number(getTotalCost(selectedBookingForModal)).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Method:</span>
                    <span className="font-medium text-slate-700 capitalize">{getPayment(selectedBookingForModal).method || 'Card (Demo)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Timestamp:</span>
                    <span className="text-slate-700">
                      {selectedBookingForModal.confirmedAt ? new Date(selectedBookingForModal.confirmedAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Transport Voucher */}
              {getTransport(selectedBookingForModal) && (
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5" />
                      Transport Voucher
                    </span>
                    <button
                      onClick={() => handleCopy(getTransport(selectedBookingForModal).reference || getTransport(selectedBookingForModal).bookingReference || 'TA-FLT-DEMO', 'transport')}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-900"
                    >
                      <span>{getTransport(selectedBookingForModal).reference || getTransport(selectedBookingForModal).bookingReference || 'TA-FLT-DEMO'}</span>
                      {copiedId === 'transport' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {getTransport(selectedBookingForModal).provider || 'Express Carrier'} ({getTransport(selectedBookingForModal).cabin || 'Economy'})
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Route: <span className="font-semibold text-slate-800">{getTransport(selectedBookingForModal).title || `${selectedBookingForModal.origin} ⇄ ${selectedBookingForModal.destination}`}</span></div>
                    <div>Flight / Train: <span className="font-semibold text-slate-800">{getTransport(selectedBookingForModal).flightNumbers || '6E-452'}</span></div>
                    <div>Departure: <span className="font-semibold text-slate-800">{getTransport(selectedBookingForModal).departure || '08:30 AM Day 1'}</span></div>
                    <div>Arrival / Return: <span className="font-semibold text-slate-800">{getTransport(selectedBookingForModal).returnArrival || '09:45 PM'}</span></div>
                  </div>
                </div>
              )}

              {/* Accommodation Voucher */}
              {getAccommodation(selectedBookingForModal) && (
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                      <Hotel className="w-3.5 h-3.5" />
                      Hotel Stay Voucher
                    </span>
                    <button
                      onClick={() => handleCopy(getAccommodation(selectedBookingForModal).reference || getAccommodation(selectedBookingForModal).bookingReference || 'TA-HOT-DEMO', 'hotel')}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-900"
                    >
                      <span>{getAccommodation(selectedBookingForModal).reference || getAccommodation(selectedBookingForModal).bookingReference || 'TA-HOT-DEMO'}</span>
                      {copiedId === 'hotel' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {getAccommodation(selectedBookingForModal).name || getAccommodation(selectedBookingForModal).propertyName || 'Boutique Hotel Stay'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Stay: <span className="font-semibold text-slate-800">{getAccommodation(selectedBookingForModal).nights || 3} Nights</span></div>
                    <div>Cost: <span className="font-semibold text-slate-800">₹{(getAccommodation(selectedBookingForModal).price || getAccommodation(selectedBookingForModal).cost)?.toLocaleString('en-IN')}</span></div>
                    <div>Check-in: <span className="font-semibold text-slate-800">{getAccommodation(selectedBookingForModal).checkIn || 'Day 1'}</span></div>
                    <div>Check-out: <span className="font-semibold text-slate-800">{getAccommodation(selectedBookingForModal).checkOut || 'Day 4'}</span></div>
                    <div className="col-span-2">Location: <span className="text-slate-700">{getAccommodation(selectedBookingForModal).location || getAccommodation(selectedBookingForModal).address || selectedBookingForModal.destination}</span></div>
                  </div>
                </div>
              )}

              {/* Verified Activity Passes */}
              {getActivities(selectedBookingForModal).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    Activity Booking Passes ({getActivities(selectedBookingForModal).length})
                  </span>
                  <div className="space-y-2">
                    {getActivities(selectedBookingForModal).map((act, idx) => (
                      <div
                        key={act.activityId || idx}
                        className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{act.title}</div>
                          <div className="text-slate-500 text-[11px]">
                            {act.date || `Day ${act.dayNumber || idx + 1}`} • {act.time || '10:00 AM'} • ₹{(act.price || act.cost || 0)?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(act.reference || act.bookingReference || `TA-ACT-${idx}`, `act-${idx}`)}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700 hover:bg-slate-100"
                        >
                          <span>{act.reference || act.bookingReference || `TA-ACT-${idx}`}</span>
                          {copiedId === `act-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Transport Allowance */}
              {getLocalTransport(selectedBookingForModal) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-600" />
                      Local Transit Allowance
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {getLocalTransport(selectedBookingForModal).notes || getLocalTransport(selectedBookingForModal).description || 'Included in overall trip cost estimate; no separate booking required.'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {getLocalTransport(selectedBookingForModal).reference || getLocalTransport(selectedBookingForModal).allowanceReference || 'TA-LOC-INCL'}
                  </span>
                </div>
              )}

              {/* Detailed Day-by-Day Confirmed Itinerary */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    Complete Day-by-Day Itinerary ({getItineraryDays(selectedBookingForModal).length} Days)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Confirmed Schedule
                  </span>
                </div>

                <div className="space-y-4">
                  {getItineraryDays(selectedBookingForModal).map((dayPlan) => (
                    <div
                      key={dayPlan.day}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-600 text-white text-[11px] font-black flex items-center justify-center">
                            D{dayPlan.day}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{dayPlan.title}</h5>
                            <span className="text-[10px] text-slate-400">{dayPlan.date || `Day ${dayPlan.day}`}</span>
                          </div>
                        </div>
                        {dayPlan.estimatedSpend > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Spend</span>
                            <span className="text-xs font-extrabold text-slate-800">
                              ₹{dayPlan.estimatedSpend?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Day Timeline Items */}
                      <div className="space-y-2 pl-1">
                        {dayPlan.timeline?.map((item, idx) => {
                          const isFood = item.type === 'food';
                          const isTrans = item.type === 'transport';
                          const Icon = isFood ? Utensils : isTrans ? Plane : Compass;

                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5 text-xs"
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="w-3 h-3 text-sky-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.time}</span>
                                    <span className="text-slate-300">•</span>
                                    <strong className="text-slate-900 font-semibold truncate">{item.title}</strong>
                                  </div>
                                  {item.cost > 0 && (
                                    <span className="text-[11px] font-bold text-slate-700 shrink-0">
                                      ₹{item.cost?.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBookingForModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold"
              >
                Close Receipt
              </button>

              <button
                type="button"
                onClick={() => {
                  const b = selectedBookingForModal;
                  setSelectedBookingForModal(null);
                  handleViewTripFromBooking(b);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open in Journey View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
