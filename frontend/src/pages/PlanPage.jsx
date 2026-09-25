import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import { aiService } from '../services/aiService.js';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Heart,
  Car,
  Hotel,
  DollarSign,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Compass,
  AlertCircle,
  Loader2,
  Wand2,
} from 'lucide-react';

const INTEREST_CHIPS = [
  'Beaches',
  'Mountains',
  'Adventure',
  'Food',
  'Culture',
  'Nature',
  'Nightlife',
  'Relaxed',
  'Budget-friendly',
  'Luxury',
];

const TRAVEL_STYLES = [
  { id: 'Relaxed', label: 'Relaxed Pace', desc: 'Slow mornings, max 2 spots/day, time to unwind' },
  { id: 'Balanced', label: 'Balanced', desc: 'Mix of iconic landmarks and downtime' },
  { id: 'Fast-Paced', label: 'Active & Packed', desc: 'See everything possible from dawn to dusk' },
];

const TRANSPORT_PREFS = [
  { id: 'Any', label: 'Fastest & Best Value' },
  { id: 'Flight', label: 'Flights Preferred' },
  { id: 'Train', label: 'Scenic Trains / Sleeper' },
  { id: 'Cab', label: 'Private AC Cab Throughout' },
];

const ACCOMMODATION_PREFS = [
  { id: 'Boutique Hotel', label: 'Boutique 3-Star Hotel' },
  { id: 'Beachfront Resort', label: '4-Star Beachfront Resort' },
  { id: 'Social Hostel', label: 'Hostel / Homestay Dorm' },
  { id: 'Luxury Villa', label: '5-Star Private Luxury Villa' },
];

const validateDuration = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 'Duration is required. Please enter at least 1 day.';
  }
  const strVal = String(value).trim();
  if (strVal.includes('.') || strVal.includes('e') || strVal.includes('E')) {
    return 'Duration must be a positive whole number (no decimals).';
  }
  const num = Number(strVal);
  if (isNaN(num)) {
    return 'Please enter a valid number of days.';
  }
  if (num <= 0) {
    return 'Duration must be at least 1 day.';
  }
  if (!Number.isInteger(num)) {
    return 'Duration must be a positive whole number.';
  }
  return '';
};

const validateTravelers = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 'Number of travelers is required. Please enter at least 1 traveler.';
  }
  const strVal = String(value).trim();
  if (strVal.includes('.') || strVal.includes('e') || strVal.includes('E')) {
    return 'Number of travelers must be a positive whole number (no decimals).';
  }
  const num = Number(strVal);
  if (isNaN(num)) {
    return 'Please enter a valid number of travelers.';
  }
  if (num <= 0) {
    return 'Number of travelers must be at least 1.';
  }
  if (!Number.isInteger(num)) {
    return 'Travelers must be a positive whole number.';
  }
  return '';
};

export default function PlanPage() {
  const navigate = useNavigate();
  const { intent, updateIntent } = useTrip();

  const initialDuration = typeof intent.duration === 'number'
    ? intent.duration
    : typeof intent.durationDays === 'number'
    ? intent.durationDays
    : 4;

  const initialTravelers = typeof intent.travelers === 'number'
    ? intent.travelers
    : 2;

  const [formData, setFormData] = useState({
    origin: intent.origin || 'Bhubaneswar',
    destination: intent.destination || 'Goa',
    duration: initialDuration,
    durationDays: initialDuration,
    travelers: initialTravelers,
    interests: intent.interests || ['Beaches', 'Food', 'Relaxed'],
    travelStyle: intent.travelStyle || 'Relaxed',
    transportPref: intent.transportPref || 'Any',
    accommodationPref: intent.accommodationPref || 'Boutique Hotel',
    optionalBudget: intent.optionalBudget || '',
    constraints: intent.constraints || 'Proximity to clean beach, coastal seafood, no rushed mornings',
  });

  const [durationRaw, setDurationRaw] = useState(String(initialDuration));
  const [travelersRaw, setTravelersRaw] = useState(String(initialTravelers));
  const [durationError, setDurationError] = useState('');
  const [travelersError, setTravelersError] = useState('');
  const [formError, setFormError] = useState('');

  const [naturalInput, setNaturalInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  React.useEffect(() => {
    if (window.location.search.includes('demo=true')) {
      const demoPrompt = "I want a 4-day relaxed beach trip from Bhubaneswar. I want good food and some activities.";
      setNaturalInput(demoPrompt);
      handleParseNaturalIntent(demoPrompt);
    }
  }, []);

  const handleParseNaturalIntent = async (textToParse = naturalInput) => {
    const text = typeof textToParse === 'string' ? textToParse : naturalInput;
    if (!text.trim() || isParsing) return;

    setIsParsing(true);
    setAiNotice(null);

    try {
      const res = await aiService.extractIntent({
        message: text,
        currentContext: formData,
      });

      if (res && res.data) {
        const d = res.data;
        const dur = Number(d.duration) || 4;
        const trav = Number(d.travelers) || 2;

        setDurationRaw(String(dur));
        setTravelersRaw(String(trav));
        setDurationError('');
        setTravelersError('');

        setFormData((prev) => ({
          ...prev,
          origin: d.origin || prev.origin,
          destination: d.destination || prev.destination,
          duration: dur,
          durationDays: dur,
          travelers: trav,
          interests: d.interests && d.interests.length > 0 ? d.interests : prev.interests,
          travelStyle: d.travelStyle || prev.travelStyle,
          transportPref: d.transportPreference || prev.transportPref,
          accommodationPref: d.accommodationPreference || prev.accommodationPref,
          optionalBudget: d.budget !== null && d.budget !== undefined ? String(d.budget) : prev.optionalBudget,
          constraints: d.constraints && d.constraints.length > 0 ? d.constraints.join(', ') : prev.constraints,
        }));

        setAiNotice({
          summary: `Extracted intent: ${d.origin} → ${d.destination}, ${dur} days, ${trav} travelers (${d.travelStyle} pace). Form auto-filled!`,
        });
      }
    } catch (err) {
      console.warn('[PlanPage] AI intent parse fallback:', err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDurationChange = (e) => {
    const val = e.target.value;
    setDurationRaw(val);
    const err = validateDuration(val);
    setDurationError(err);
    if (!err) {
      const num = parseInt(val, 10);
      setFormData((prev) => ({ ...prev, duration: num, durationDays: num }));
    }
  };

  const handleTravelersChange = (e) => {
    const val = e.target.value;
    setTravelersRaw(val);
    const err = validateTravelers(val);
    setTravelersError(err);
    if (!err) {
      const num = parseInt(val, 10);
      setFormData((prev) => ({ ...prev, travelers: num }));
    }
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleApplyExample = (exOrigin, exDest, exDays, exInterests, exConstraints) => {
    const daysNum = Number(exDays);
    setDurationRaw(String(daysNum));
    setTravelersRaw('2');
    setDurationError('');
    setTravelersError('');
    setFormData((prev) => ({
      ...prev,
      origin: exOrigin,
      destination: exDest,
      duration: daysNum,
      durationDays: daysNum,
      travelers: 2,
      interests: exInterests,
      constraints: exConstraints,
      optionalBudget: '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const dError = validateDuration(durationRaw);
    const tError = validateTravelers(travelersRaw);

    if (dError || tError) {
      setDurationError(dError);
      setTravelersError(tError);
      return;
    }

    if (!formData.origin || !formData.origin.trim()) {
      setFormError('Please enter your departure city (Origin).');
      return;
    }

    if (!formData.destination || !formData.destination.trim()) {
      setFormError('Please enter where you want to travel (Destination).');
      return;
    }

    const cleanData = {
      ...formData,
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      duration: parseInt(durationRaw, 10),
      durationDays: parseInt(durationRaw, 10),
      travelers: parseInt(travelersRaw, 10),
    };

    updateIntent(cleanData);
    navigate('/discovery');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Conversational Trip Planning</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Where are we headed next?
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Share your travel thoughts. We will estimate realistic trip options and determine the budget for you.
        </p>
      </div>

      {/* Natural Language Intent Assistant Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Describe your journey naturally
            </h2>
            <p className="text-xs text-slate-300">
              Tell us where you want to go, for how long, and with whom. Trip Agent's AI parses your intent and auto-fills the parameters below.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleParseNaturalIntent();
              }
            }}
            placeholder="e.g. 'I want a relaxed beach trip from Bhubaneswar with 3 friends for 5 days.'"
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/15 transition-all"
          />
          <button
            type="button"
            onClick={() => handleParseNaturalIntent()}
            disabled={!naturalInput.trim() || isParsing}
            className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <span>Extract Intent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Feedback Alert if intent extracted */}
        {aiNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{aiNotice.summary}</span>
          </div>
        )}
      </div>

      {/* Preset Quick Fill Cards */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Or start from an example prompt:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              const demoPrompt = "I want a 4-day relaxed beach trip from Bhubaneswar. I want good food and some activities.";
              setNaturalInput(demoPrompt);
              handleParseNaturalIntent(demoPrompt);
            }}
            className="text-left p-3.5 rounded-xl bg-white border border-sky-300 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-xs text-slate-700 shadow-xs ring-1 ring-sky-200"
          >
            <div className="flex items-center gap-1.5 text-sky-700 font-bold text-[10px] uppercase mb-1">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>Core Demo Script Prompt</span>
            </div>
            <strong className="text-slate-900 block font-bold text-xs sm:text-sm">
              "I want a 4-day relaxed beach trip from Bhubaneswar. I want good food and some activities."
            </strong>
            <span className="text-[11px] text-slate-500 block mt-1">
              Extracts: Bhubaneswar → Goa, 4 Days, 2 Travelers, Relaxed Pacing, Beaches & Dining
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyExample(
                'Delhi',
                'Manali',
                5,
                ['Mountains', 'Adventure', 'Nature'],
                'Snow views, pine forest hikes, riverside cafes'
              )
            }
            className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 transition-all text-xs text-slate-700"
          >
            <strong className="text-slate-900 block font-semibold">
              "5-day alpine escape to Manali with hiking & cafes"
            </strong>
            <span className="text-[11px] text-slate-500">
              Mountains, Solang Valley adventure, cozy wooden cottages
            </span>
          </button>
        </div>
      </div>

      {/* Main Interactive Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Step 1: Origin & Destination */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">1</span>
            Route & Destinations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Origin City / Airport</span>
              </label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="e.g. Bhubaneswar"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>Destination or Region</span>
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Goa, Manali, Kerala"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Duration & Travelers */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">2</span>
            Duration & Travelers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Duration Input */}
            <div className="space-y-1.5">
              <label htmlFor="duration-input" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Min. 1 day</span>
              </label>
              <div className="relative">
                <input
                  id="duration-input"
                  name="duration"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={durationRaw}
                  onChange={handleDurationChange}
                  placeholder="Enter number of days"
                  aria-invalid={Boolean(durationError)}
                  aria-describedby={durationError ? "duration-error" : undefined}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    durationError
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-2 focus:ring-rose-400 focus:border-rose-400'
                      : 'border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  days
                </span>
              </div>
              {durationError && (
                <p id="duration-error" role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{durationError}</span>
                </p>
              )}
            </div>

            {/* Travelers Input */}
            <div className="space-y-1.5">
              <label htmlFor="travelers-input" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Travelers</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Min. 1 traveler</span>
              </label>
              <div className="relative">
                <input
                  id="travelers-input"
                  name="travelers"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={travelersRaw}
                  onChange={handleTravelersChange}
                  placeholder="Enter number of travelers"
                  aria-invalid={Boolean(travelersError)}
                  aria-describedby={travelersError ? "travelers-error" : undefined}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    travelersError
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-2 focus:ring-rose-400 focus:border-rose-400'
                      : 'border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  travelers
                </span>
              </div>
              {travelersError && (
                <p id="travelers-error" role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{travelersError}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Interests & Preference Chips */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">3</span>
              Interests & Experiences
            </h3>
            <span className="text-[11px] text-slate-500">Select all that apply</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {INTEREST_CHIPS.map((chip) => {
              const selected = formData.interests.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleInterest(chip)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {selected && '✓ '}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Travel Style & Accommodation */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">4</span>
            Pacing & Stay Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TRAVEL_STYLES.map((st) => (
              <div
                key={st.id}
                onClick={() => setFormData({ ...formData, travelStyle: st.id })}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  formData.travelStyle === st.id
                    ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{st.label}</div>
                <p className="text-[11px] text-slate-500 mt-1">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred Lodging Type</span>
              </label>
              <select
                value={formData.accommodationPref}
                onChange={(e) => setFormData({ ...formData, accommodationPref: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                {ACCOMMODATION_PREFS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>Transportation Preference</span>
              </label>
              <select
                value={formData.transportPref}
                onChange={(e) => setFormData({ ...formData, transportPref: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                {TRANSPORT_PREFS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 5: Budget (EXPLICITLY MARKED OPTIONAL) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">5</span>
              Target Budget (Explicitly Optional)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Optional
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs text-sky-950">
              <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                <strong>Not sure about your budget? Leave it blank.</strong> Trip Agent will discover realistic costs and generate Cheapest, Best Value, Comfortable, and Premium options for you.
              </span>
            </div>

            <div className="relative pt-2">
              <span className="absolute left-3.5 top-5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={formData.optionalBudget}
                onChange={(e) => setFormData({ ...formData, optionalBudget: e.target.value })}
                placeholder="Leave blank for automatic discovery, or enter limit (e.g. 20000)"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 6: Special Constraints */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700">
            Special Constraints or Personal Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={formData.constraints}
            onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
            placeholder="e.g. Vegetarian food only, wheelchair accessible transport, need sea-facing balcony..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Form Error Alert */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Estimates are generated instantly using realistic travel benchmarks.
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Estimate & Discover Tiers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
