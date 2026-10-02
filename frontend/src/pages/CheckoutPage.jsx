import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import bookingService from '../services/bookingService.js';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plane,
  Hotel,
  Compass,
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  MapPin,
  Car,
  Award,
  Lock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

class CheckoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CheckoutPage ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Something went wrong during checkout</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected rendering issue occurred.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
            >
              Refresh Page
            </button>
            <Link
              to="/trips"
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Go to My Trips
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function CheckoutPageContent() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { itinerary, intent, addConfirmedBooking } = useTrip();

  // Loading & session state
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  // Flow stages: 'review' | 'transport' | 'accommodation' | 'activities' | 'localTransport' | 'payment' | 'processing' | 'confirmed'
  const [stage, setStage] = useState('review');

  // Multi-activity index
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Sub-step verification animation states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  // Alternative options swap modal state
  const [changeModalType, setChangeModalType] = useState(null); // 'transport' | 'accommodation' | 'activity'

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI'
  const [cardData, setCardData] = useState({
    cardholderName: 'Satya Prakash',
    cardNumber: '4532 •••• •••• 8912',
    expiry: '09/28',
    cvv: '849',
  });
  const [upiData, setUpiData] = useState({
    upiId: 'satya@okhdfcbank',
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [copiedRef, setCopiedRef] = useState(null);

  // Processing stage animation checklist states
  const [processingStep, setProcessingStep] = useState(0);

  // References for processing timers so they can be cleaned up on unmount
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // Load or create session on mount
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      setLoading(true);
      setError('');
      try {
        const rawData = await bookingService.createSession(tripId, itinerary, intent);
        const data = rawData?.data || rawData;
        if (isMounted) {
          setSession(data);
          // If already confirmed (idempotency check), jump to confirmation screen
          if (data?.status === 'CONFIRMED') {
            setStage('confirmed');
          }
        }
      } catch (err) {
        console.error('Failed to initialize booking session:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize booking session.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initSession();
    return () => { isMounted = false; };
  }, [tripId]);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedRef(key);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  // ----------------------------------------------------
  // VERIFICATION ACTIONS
  // ----------------------------------------------------

  // Confirm Transport
  const handleConfirmTransport = async (overrides = {}) => {
    setIsVerifying(true);
    setVerifyMessage('Checking seat inventory with carrier...');
    try {
      await new Promise((r) => setTimeout(r, 700));
      setVerifyMessage('Validating route schedules and fare class...');
      await new Promise((r) => setTimeout(r, 600));

      const updated = await bookingService.verifyTransport(session.bookingId || session._id, overrides);
      setSession(updated);
      setIsVerifying(false);
      setStage('accommodation');
    } catch (err) {
      console.error('Failed to verify transport:', err);
      setIsVerifying(false);
      setError('Transport verification could not be completed. Please retry.');
    }
  };

  // Confirm Accommodation
  const handleConfirmAccommodation = async (overrides = {}) => {
    setIsVerifying(true);
    setVerifyMessage('Checking room allotment with property manager...');
    try {
      await new Promise((r) => setTimeout(r, 700));
      setVerifyMessage('Verifying room rate & included amenities...');
      await new Promise((r) => setTimeout(r, 600));

      const updated = await bookingService.verifyAccommodation(session.bookingId || session._id, overrides);
      setSession(updated);
      setIsVerifying(false);
      setStage('activities');
      setCurrentActivityIndex(0);
    } catch (err) {
      console.error('Failed to verify accommodation:', err);
      setIsVerifying(false);
      setError('Stay verification could not be completed. Please retry.');
    }
  };

  // Confirm Individual Activity (One by One)
  const handleConfirmActivity = async (overrides = {}) => {
    setIsVerifying(true);
    const act = session.bookings.activities[currentActivityIndex];
    setVerifyMessage(`Checking slot availability for "${act?.title || 'Activity'}"...`);
    try {
      await new Promise((r) => setTimeout(r, 650));
      setVerifyMessage('Confirming certified local operator allotment...');
      await new Promise((r) => setTimeout(r, 550));

      const updated = await bookingService.verifyActivity(
        session.bookingId || session._id,
        currentActivityIndex,
        overrides
      );
      setSession(updated);
      setIsVerifying(false);

      // Check if more activities remain
      if (currentActivityIndex < updated.bookings.activities.length - 1) {
        setCurrentActivityIndex((prev) => prev + 1);
      } else {
        // All activities verified! Move to localTransport or payment
        if (updated.bookings.localTransport?.cost > 0) {
          setStage('localTransport');
        } else {
          setStage('payment');
        }
      }
    } catch (err) {
      console.error('Failed to verify activity:', err);
      setIsVerifying(false);
      setError('Activity verification could not be completed. Please retry.');
    }
  };

  // Confirm Local Transport
  const handleConfirmLocalTransport = async () => {
    try {
      const updated = await bookingService.verifyLocalTransport(session.bookingId || session._id);
      setSession(updated);
      setStage('payment');
    } catch {
      setStage('payment');
    }
  };

  // Submit Dummy Payment
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    setError('');

    try {
      await bookingService.processPayment(session.bookingId || session._id, {
        method: paymentMethod,
        cardholderName: paymentMethod === 'CARD' ? cardData.cardholderName : 'UPI Traveler',
      });

      // Clear any prior pending timers
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];

      // Move to processing animation stage
      setStage('processing');
      setProcessingStep(0);

      // Trigger sequential confirmation animation
      timersRef.current.push(setTimeout(() => setProcessingStep(1), 700));  // Transport confirmed
      timersRef.current.push(setTimeout(() => setProcessingStep(2), 1500)); // Accommodation confirmed
      timersRef.current.push(setTimeout(() => setProcessingStep(3), 2300)); // Activities confirmed
      timersRef.current.push(setTimeout(() => setProcessingStep(4), 3100)); // Finalized!

      // Finalize booking on backend with complete itinerary snapshot
      const finalTimer = setTimeout(async () => {
        try {
          const snapshotData = {
            itinerary: itinerary,
            tripTitle: itinerary?.tripTitle || `${session?.destination || 'Trip'} Journey`,
            origin: session?.origin,
            destination: session?.destination,
            duration: session?.duration,
            travelers: session?.travelers,
            selectedBudgetTier: session?.selectedBudgetTier,
            totalCost: session?.totalCost,
            bookings: session?.bookings,
            bookingItems: [
              {
                category: 'transport',
                itemType: 'Flight',
                provider: session?.bookings?.transport?.provider,
                title: session?.bookings?.transport?.title,
                price: session?.bookings?.transport?.price || session?.bookings?.transport?.cost,
                status: 'CONFIRMED',
                reference: session?.bookings?.transport?.reference,
              },
              {
                category: 'accommodation',
                itemType: 'Stay',
                provider: session?.bookings?.accommodation?.name,
                title: session?.bookings?.accommodation?.name,
                price: session?.bookings?.accommodation?.price || session?.bookings?.accommodation?.cost,
                status: 'CONFIRMED',
                reference: session?.bookings?.accommodation?.reference,
              },
              ...(session?.bookings?.activities || []).map((a) => ({
                category: 'activity',
                itemType: 'Activity',
                provider: a.provider,
                title: a.title,
                price: a.price || a.cost,
                status: 'CONFIRMED',
                reference: a.reference,
              })),
            ],
            notes: 'Hackathon confirmed booking snapshot',
          };

          const rawConfirmed = await bookingService.confirmBooking(session.bookingId || session._id, snapshotData);
          const confirmed = rawConfirmed?.data || rawConfirmed;

          if (confirmed) {
            setSession(confirmed);
            if (addConfirmedBooking) {
              addConfirmedBooking(confirmed);
            }
            setStage('confirmed');
          } else {
            throw new Error('Empty response received from confirmation endpoint.');
          }
        } catch (err) {
          console.error('Failed to confirm booking:', err);
          setError('Booking confirmation could not be finalized. Please retry.');
          setStage('payment');
        } finally {
          setPaymentSubmitting(false);
        }
      }, 3600);

      timersRef.current.push(finalTimer);
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment authorization failed. Please retry.');
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Initializing Booking Session...</h2>
        <p className="text-xs text-slate-500">Preparing component checklists and live price verification.</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Could Not Initialize Booking</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
        <Link
          to="/journey"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Itinerary</span>
        </Link>
      </div>
    );
  }

  const transport = session?.bookings?.transport || {};
  const accommodation = session?.bookings?.accommodation || {};
  const activities = session?.bookings?.activities || [];
  const localTransport = session?.bookings?.localTransport || {};
  const currentActivity = activities[currentActivityIndex] || {};

  // Step indicator order
  const steps = [
    { id: 'review', label: 'Trip Review' },
    { id: 'transport', label: 'Transport' },
    { id: 'accommodation', label: 'Stay' },
    { id: 'activities', label: 'Activities' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmed', label: 'Confirmed' },
  ];

  const getStepStatus = (stepId) => {
    const stepOrder = ['review', 'transport', 'accommodation', 'activities', 'localTransport', 'payment', 'processing', 'confirmed'];
    const currentIdx = stepOrder.indexOf(stage);
    const targetIdx = stepOrder.indexOf(stepId);

    if (stage === 'confirmed' && stepId === 'confirmed') return 'current';
    if (stage === 'processing' && stepId === 'payment') return 'current';
    if (currentIdx > targetIdx) return 'completed';
    if (currentIdx === targetIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-32">
      {/* Top Breadcrumb & Disclaimer Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/journey"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary</span>
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-800">
            Booking Session: <span className="font-mono text-sky-700">{session?.bookingId}</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo booking environment — no real booking or payment will occur.</span>
        </div>
      </div>

      {/* Progress Stepper Header */}
      {stage !== 'confirmed' && stage !== 'processing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {steps.map((st, idx) => {
              const status = getStepStatus(st.id);
              return (
                <div key={st.id} className="flex items-center gap-2 min-w-max">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : status === 'current'
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      status === 'current'
                        ? 'text-sky-900 font-extrabold'
                        : status === 'completed'
                        ? 'text-emerald-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center Wizard Column */}
        <div className={stage === 'confirmed' || stage === 'processing' ? 'lg:col-span-12' : 'lg:col-span-8'}>
          {/* ======================================================== */}
          {/* STAGE 1: TRIP REVIEW */}
          {/* ======================================================== */}
          {stage === 'review' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Step 1 of 5 • Complete Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Review Your Journey
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Verify the itinerary parameters and component allocations before starting sequential reservations.
                </p>
              </div>

              {/* Trip Metadata Card */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Route</div>
                  <div className="text-lg font-black text-slate-900">
                    {session.origin} → {session.destination}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Travelers & Duration</div>
                  <div className="text-sm font-bold text-slate-900">
                    {session.duration} Days • {session.travelers} Travelers
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Travel Dates</div>
                  <div className="text-sm font-bold text-slate-900">
                    {session.travelDates?.start} to {session.travelDates?.end}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Tier Selected</div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                    {session.selectedBudgetTier === 'bestValue' ? 'Best Value' : session.selectedBudgetTier}
                  </span>
                </div>
              </div>

              {/* Components List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Bookable Verticals
                </h3>

                {/* Transport item */}
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{transport.provider}</div>
                      <div className="text-xs text-slate-500">{transport.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">₹{transport.price?.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] font-semibold text-amber-600">Pending Verification</span>
                  </div>
                </div>

                {/* Accommodation item */}
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{accommodation.name}</div>
                      <div className="text-xs text-slate-500">
                        {accommodation.nights} Nights • {accommodation.roomType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">₹{accommodation.price?.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] font-semibold text-amber-600">Pending Verification</span>
                  </div>
                </div>

                {/* Activities item */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>Curated Experiences & Excursions ({activities.length})</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{activities.reduce((s, a) => s + (a.price || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="space-y-1 pl-6">
                    {activities.map((a, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-600">
                        <span>• {a.title} ({a.date})</span>
                        <span className="text-slate-500">₹{a.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Local transport allowance */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{localTransport.title}</div>
                      <div className="text-[11px] text-slate-500">{localTransport.notes}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">₹{localTransport.cost?.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Included in Estimate
                    </span>
                  </div>
                </div>
              </div>

              {/* Total & Action Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-400">Total Trip Cost</div>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{session.totalCost?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500">
                    approx. ₹{Math.round(session.totalCost / session.travelers).toLocaleString('en-IN')} per traveler
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStage('transport')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Start booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 2: TRANSPORT VERIFICATION */}
          {/* ======================================================== */}
          {stage === 'transport' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Step 2 of 5 • Component Verification
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Verify Your Flight & Transit
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Please review flight timings, route details, and traveler count before locking in seat allotment.
                </p>
              </div>

              {/* Transit Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-600" />
                    <span className="text-sm font-bold text-slate-900">{transport.provider}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {transport.flightNumbers}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Departure</span>
                    <strong className="text-slate-900 text-sm">{transport.departure}</strong>
                    <span className="text-slate-500 block">{session.origin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration</span>
                    <strong className="text-slate-900 text-sm">{transport.duration}</strong>
                    <span className="text-slate-500 block">Fast connector</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Return Arrival</span>
                    <strong className="text-slate-900 text-sm">{transport.returnArrival}</strong>
                    <span className="text-slate-500 block">{session.destination}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
                  <span>Passengers: <strong>{session.travelers} Travelers</strong></span>
                  <span>Cabin: <strong>{transport.cabin || 'Economy'}</strong></span>
                  <span className="text-base font-black text-slate-900">
                    ₹{transport.price?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Booking Verification Checklist:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-semibold">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Route</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dates</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Travelers</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cabin</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fare</span>
                </div>
              </div>

              {/* Processing Spinner State */}
              {isVerifying && (
                <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-in fade-in">
                  <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-sky-900">{verifyMessage}</p>
                </div>
              )}

              {/* Actions */}
              {!isVerifying && (
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setChangeModalType('transport')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Change flight
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmTransport()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                  >
                    <span>Confirm flight</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 3: ACCOMMODATION VERIFICATION */}
          {/* ======================================================== */}
          {stage === 'accommodation' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Step 3 of 5 • Component Verification
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Verify Your Stay
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Confirm room configuration, check-in window, and guest headcount.
                </p>
              </div>

              {/* Stay Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{accommodation.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {accommodation.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {accommodation.roomType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Check-in</span>
                    <strong className="text-slate-900">{accommodation.checkIn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-out</span>
                    <strong className="text-slate-900">{accommodation.checkOut}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration</span>
                    <strong className="text-slate-900">{accommodation.nights} Nights</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Guests</span>
                    <strong className="text-slate-900">{session.travelers} Travelers</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
                  <span>Rate: ₹{accommodation.pricePerNight?.toLocaleString('en-IN')} / night</span>
                  <span className="text-base font-black text-slate-900">
                    Total: ₹{accommodation.price?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Stay Verification Checklist:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-semibold">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Property</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dates</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Guests</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Room</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Price</span>
                </div>
              </div>

              {/* Processing Spinner State */}
              {isVerifying && (
                <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-in fade-in">
                  <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-sky-900">{verifyMessage}</p>
                </div>
              )}

              {/* Actions */}
              {!isVerifying && (
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setChangeModalType('accommodation')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Change stay
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmAccommodation()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                  >
                    <span>Confirm stay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 4: ACTIVITIES VERIFICATION (ONE BY ONE) */}
          {/* ======================================================== */}
          {stage === 'activities' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                    Step 4 of 5 • Activity Verification
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Activity {currentActivityIndex + 1} of {activities.length}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  {currentActivity.date || `Day ${currentActivityIndex + 1}`}
                </span>
              </div>

              {/* Current Activity Detail Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Curated Tour & Activity
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {currentActivity.title}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-black text-slate-900">
                      ₹{currentActivity.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Total for group</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Scheduled Time</span>
                    <strong className="text-slate-800">{currentActivity.time}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration</span>
                    <strong className="text-slate-800">{currentActivity.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Party Size</span>
                    <strong className="text-slate-800">{currentActivity.travelers} Travelers</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Operator Status</span>
                    <strong className="text-emerald-700">Allotment Verified</strong>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Activity Verification Checklist:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-semibold">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Activity</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Date</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Time</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Travelers</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Price</span>
                </div>
              </div>

              {/* Processing Spinner State */}
              {isVerifying && (
                <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-in fade-in">
                  <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-sky-900">{verifyMessage}</p>
                </div>
              )}

              {/* Actions */}
              {!isVerifying && (
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setChangeModalType('activity')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Change activity
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmActivity()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                  >
                    <span>Confirm activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 5: LOCAL TRANSPORT ALLOWANCE */}
          {/* ======================================================== */}
          {stage === 'localTransport' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Notice • Travel Allowance
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Local Mobility Allowance
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Clarification regarding local transportation costs included in your trip estimate.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Car className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900">
                      {localTransport.title} (₹{localTransport.cost?.toLocaleString('en-IN')})
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Important Distinction:</strong> This amount is included in your trip cost estimate for local scooter rentals, fuel, or ride-hailing, but <strong>does not require a separate external booking reservation</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleConfirmLocalTransport}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 6: DUMMY PAYMENT */}
          {/* ======================================================== */}
          {stage === 'payment' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Step 5 of 5 • Payment Stage
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Trip Payment
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  All components have been verified. Authorize dummy payment to issue booking confirmations.
                </p>
              </div>

              {/* Demo Mode Notice */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="text-xs text-purple-900">
                  <strong>Simulated Demo Payment:</strong> No real money will be charged. Sensitive card details are never saved to our database.
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / Instant QR</span>
                </button>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {paymentMethod === 'CARD' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.cardholderName}
                        onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Card Number (Simulated)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          CVV (3 Digits)
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          required
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        required
                        value={upiData.upiId}
                        onChange={(e) => setUpiData({ upiId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span>Supported UPI handles: <strong>@okhdfcbank, @okicici, @paytm, @upi</strong></span>
                      <span className="font-bold text-emerald-700">Instant Demo Auth</span>
                    </div>
                  </div>
                )}

                {/* Amount to Pay CTA */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Amount Due</span>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{session.totalCost?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{session.totalCost?.toLocaleString('en-IN')} (Demo)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 7: SEQUENTIAL BOOKING FINALIZATION ANIMATION */}
          {/* ======================================================== */}
          {stage === 'processing' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md text-center max-w-2xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Finalizing Your Trip</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authorizing payment & dispatching confirmed reservation payloads to travel partners...
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto text-left pt-2">
                {/* Step 1: Flight */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-600" />
                    <span>Flight reservation: {transport.provider}</span>
                  </span>
                  {processingStep >= 1 ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-slate-400">Processing...</span>
                  )}
                </div>

                {/* Step 2: Hotel */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-indigo-600" />
                    <span>Stay reservation: {accommodation.name}</span>
                  </span>
                  {processingStep >= 2 ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-slate-400">Processing...</span>
                  )}
                </div>

                {/* Step 3: Activities */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Curated Excursions ({activities.length} tours)</span>
                  </span>
                  {processingStep >= 3 ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-slate-400">Processing...</span>
                  )}
                </div>

                {/* Step 4: Finalize */}
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>MongoDB Persistence & Receipt Sync</span>
                  </span>
                  {processingStep >= 4 ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Saved in My Trips
                    </span>
                  ) : (
                    <span className="text-slate-400">Finalizing...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 8: FINAL CONFIRMATION SCREEN */}
          {/* ======================================================== */}
          {stage === 'confirmed' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 animate-in fade-in">
              {/* Confirmed Header */}
              <div className="text-center space-y-3 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Booking Status: Confirmed
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                    ✓ Booking Confirmed
                  </h2>
                  <p className="text-sm font-semibold text-emerald-800 mt-1">
                    Your trip to {session?.destination || 'Destination'} is confirmed.
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-lg mx-auto">
                    {session?.origin || 'Origin'} → {session?.destination || 'Destination'} • {session?.duration || 4} Days • {session?.travelers || 2} Travelers
                  </p>
                </div>

                {/* Master Reference Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-xs text-slate-500 font-medium">Confirmation Number:</span>
                    <span className="text-sm font-mono font-black text-emerald-800">{session?.confirmationNumber || session?.bookingId || 'TA-CONF'}</span>
                    <button
                      onClick={() => handleCopy(session?.confirmationNumber || session?.bookingId, 'confirmation')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                      title="Copy confirmation number"
                    >
                      {copiedRef === 'confirmation' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="inline-flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-xs text-slate-500 font-medium">Payment Reference:</span>
                    <span className="text-sm font-mono font-black text-purple-800">{session?.trackingRef || session?.payment?.transactionId || 'PAY-DEMO'}</span>
                    <button
                      onClick={() => handleCopy(session?.trackingRef || session?.payment?.transactionId || 'PAY-DEMO', 'paymentRef')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                      title="Copy payment reference"
                    >
                      {copiedRef === 'paymentRef' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Complete Confirmation Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Flight Confirmation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Plane className="w-4 h-4 text-sky-600" />
                      <span>Flight Booking</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{transport.provider}</div>
                  <div className="text-xs text-slate-500">
                    {transport.title} • {transport.departure}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-400">Flight Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{transport.reference || 'TA-FLT-7K29Q'}</span>
                  </div>
                </div>

                {/* 2. Hotel Confirmation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Hotel className="w-4 h-4 text-indigo-600" />
                      <span>Stay Booking</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{accommodation.name}</div>
                  <div className="text-xs text-slate-500">
                    {accommodation.nights} Nights • {accommodation.roomType}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-400">Hotel Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{accommodation.reference || 'TA-HOT-4M91B'}</span>
                  </div>
                </div>

                {/* 3. Activities Confirmation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>Confirmed Activities & Tours</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      All {activities.length} Confirmed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {activities.map((a, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900 truncate">{a.title}</div>
                        <div className="text-[11px] text-slate-500">{a.date} • {a.time}</div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">Ref:</span>
                          <span className="font-mono font-bold text-emerald-800">{a.reference || `TA-ACT-${i + 1}K99`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Payment Receipt */}
                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <CreditCard className="w-4 h-4 text-purple-700" />
                      <span>Payment Transaction Receipt</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Paid — Demo Authorized
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Transaction ID</span>
                      <strong className="font-mono text-purple-900">
                        {session?.payment?.transactionId || session?.trackingRef || 'TA-PAY-629143'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Amount Settled</span>
                      <strong className="text-slate-900 text-sm">
                        ₹{Number(session?.totalCost || session?.payment?.amount || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payment Method</span>
                      <strong className="text-slate-900">{session?.payment?.method || 'CARD'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Cardholder / Name</span>
                      <strong className="text-slate-900">{session?.payment?.cardholderName || 'Demo Traveler'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved to My Trips Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your complete itinerary has been saved to My Trips.</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  All booked components, hotel vouchers, activity passes, and day-by-day schedules are safely preserved in your personal trip vault.
                </p>
              </div>

              {/* Hackathon Disclaimer */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center text-[11px] text-slate-500">
                All booking references, vouchers, and transactions are simulated for this hackathon prototype.
              </div>

              {/* Navigation CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  to="/trips"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105"
                >
                  <Award className="w-4 h-4" />
                  <span>Go to My Trips</span>
                </Link>

                <Link
                  to="/journey"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>View Itinerary</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky / Side Live Booking Summary (Hidden on full confirmation screen) */}
        {stage !== 'confirmed' && stage !== 'processing' && (
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Live Booking Summary</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                  {session?.selectedBudgetTier || 'Best Value'}
                </span>
              </div>

              {/* Live Checklist */}
              <div className="space-y-3 text-xs">
                {/* Flight Checklist */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {transport.status === 'VERIFIED' || transport.status === 'CONFIRMED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800">Flight</span>
                      {transport.reference && (
                        <span className="block text-[10px] font-mono text-emerald-700 font-bold">
                          {transport.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{transport.price?.toLocaleString('en-IN')}</span>
                </div>

                {/* Hotel Checklist */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {accommodation.status === 'VERIFIED' || accommodation.status === 'CONFIRMED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800">Hotel / Stay</span>
                      {accommodation.reference && (
                        <span className="block text-[10px] font-mono text-emerald-700 font-bold">
                          {accommodation.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{accommodation.price?.toLocaleString('en-IN')}</span>
                </div>

                {/* Activities Checklist */}
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {a.status === 'VERIFIED' || a.status === 'CONFIRMED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-800 truncate max-w-[130px] block">
                          Act {i + 1}: {a.title}
                        </span>
                        {a.reference && (
                          <span className="block text-[10px] font-mono text-emerald-700 font-bold">
                            {a.reference}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{a.price?.toLocaleString('en-IN')}</span>
                  </div>
                ))}

                {/* Local transport */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-800">Local Allowance</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{localTransport.cost?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Booking:</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{session.totalCost?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400 mt-0.5">
                  ₹{Math.round(session.totalCost / session.travelers).toLocaleString('en-IN')} per person
                </div>
              </div>
            </div>

            {/* Security & Partner Assurance badge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Simulated Reservation Token</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Component verification guarantees seat and room allocation before dummy payment is authorized.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Options Modal for In-Checkout Swaps */}
      {changeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Change {changeModalType === 'transport' ? 'Flight' : changeModalType === 'accommodation' ? 'Hotel' : 'Activity'}
              </h3>
              <button
                onClick={() => setChangeModalType(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {changeModalType === 'transport' && (
              <div className="space-y-3">
                {[
                  {
                    title: 'IndiGo Fast Connector Flight',
                    provider: 'IndiGo Airlines',
                    price: 11800,
                    departure: '08:15 AM Day 1',
                    returnArrival: '09:40 PM Day 4',
                    tag: 'Recommended',
                  },
                  {
                    title: 'Air India Direct Morning Flight',
                    provider: 'Air India Express',
                    price: 13200,
                    departure: '07:30 AM Day 1',
                    returnArrival: '10:15 PM Day 4',
                    tag: '+₹1,400',
                  },
                  {
                    title: 'Konkan Express AC 2-Tier Rail',
                    provider: 'Indian Railways',
                    price: 4200,
                    departure: '04:00 PM Day 1',
                    returnArrival: '08:00 AM Day 4',
                    tag: '-₹7,600 (Scenic)',
                  },
                ].map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleConfirmTransport(opt);
                      setChangeModalType(null);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                      <div className="text-[11px] text-slate-500">{opt.provider} • {opt.departure}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">₹{opt.price.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-sky-700 font-semibold">{opt.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {changeModalType === 'accommodation' && (
              <div className="space-y-3">
                {[
                  {
                    name: 'BloomSuites Boutique & Spa, Calangute',
                    location: 'Calangute, North Goa',
                    price: 9900,
                    roomType: 'Deluxe Pool View Room',
                    tag: 'Current selection',
                  },
                  {
                    name: 'Casa De Goa Boutique Resort',
                    location: 'Calangute Beachfront',
                    price: 11700,
                    roomType: 'Portuguese Villa Suite',
                    tag: '+₹1,800',
                  },
                  {
                    name: 'Zostel Plus Morjim (Private Pods)',
                    location: 'Morjim, North Goa',
                    price: 7100,
                    roomType: 'Beachside Private Pod Suite',
                    tag: '-₹2,800 (Social)',
                  },
                ].map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleConfirmAccommodation(opt);
                      setChangeModalType(null);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                      <div className="text-[11px] text-slate-500">{opt.roomType} • {opt.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">₹{opt.price.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-indigo-700 font-semibold">{opt.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {changeModalType === 'activity' && (
              <div className="space-y-3">
                {[
                  {
                    title: 'Aguada Fort & Lighthouse Sunset Walk',
                    time: '04:30 PM',
                    price: 400 * session.travelers,
                    tag: 'Panoramic Clifftop',
                  },
                  {
                    title: 'Sinquerim Beach Jet Ski & Speedboat Safari',
                    time: '11:00 AM',
                    price: 1200 * session.travelers,
                    tag: 'Water Sports',
                  },
                  {
                    title: 'Fontainhas Bakery & Heritage Photo Walk',
                    time: '10:00 AM',
                    price: 550 * session.travelers,
                    tag: 'Culture & Food',
                  },
                ].map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleConfirmActivity(opt);
                      setChangeModalType(null);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                      <div className="text-[11px] text-slate-500">{opt.time} • {opt.tag}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">₹{opt.price.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-emerald-700 font-semibold">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutErrorBoundary>
      <CheckoutPageContent />
    </CheckoutErrorBoundary>
  );
}
