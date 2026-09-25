import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateTiersForIntent } from '../data/demoTiers.js';
import { demoItineraries } from '../data/demoItineraries.js';
import { applyOptimizationRule } from '../data/demoOptimizationEngine.js';
import { demoDestinations } from '../data/demoDestinations.js';
import { destinationService } from '../services/destinationService.js';
import { tripService } from '../services/tripService.js';

const TripContext = createContext();

const INITIAL_INTENT = {
  origin: 'Bhubaneswar',
  destination: 'Goa',
  duration: 4,
  durationDays: 4,
  travelers: 2,
  interests: ['Beaches', 'Food', 'Relaxed'],
  travelStyle: 'Relaxed',
  transportPref: 'Any',
  accommodationPref: 'Boutique Hotel',
  optionalBudget: '',
  constraints: 'Proximity to clean beach, coastal seafood, no rushed mornings',
};

const INITIAL_SAVED_TRIPS = [
  {
    id: 'trip-saved-1',
    title: '4-Day Vibrant Coastal Goa Escape',
    destination: 'Goa',
    origin: 'Bhubaneswar',
    durationDays: 4,
    travelers: 2,
    tierName: 'Best Value',
    tierId: 'best-value',
    totalCost: 31000,
    savedAt: '2026-09-15T10:30:00.000Z',
    status: 'Planned',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    summary: 'Boutique stay in Calangute with sunset cruise, cafe hopping in Assagao, and scooter tours.'
  },
  {
    id: 'trip-saved-2',
    title: '5-Day Alpine Manali Scenic Retreat',
    destination: 'Manali',
    origin: 'Delhi',
    durationDays: 5,
    travelers: 2,
    tierName: 'Comfortable',
    tierId: 'comfortable',
    totalCost: 42000,
    savedAt: '2026-08-20T14:15:00.000Z',
    status: 'Draft',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    summary: 'Pine valley riverside cottage with Solang paragliding and Old Manali cafe discovery.'
  }
];

const INITIAL_PREFERENCES = {
  travelerName: 'Satya',
  homeAirport: 'Bhubaneswar (BBI)',
  defaultTravelStyle: 'Relaxed',
  preferredTier: 'best-value',
  dietaryPreferences: ['Coastal & Seafood', 'Local Specialties'],
  transitPreference: 'Fastest with comfort (Flights / 1-stop)',
  stayPreference: 'Boutique 3-star to 4-star with swimming pool',
  pacingPreference: 'Max 2 core activities per day',
};

export function TripProvider({ children }) {
  const [intent, setIntent] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_agent_intent');
      return stored ? JSON.parse(stored) : INITIAL_INTENT;
    } catch {
      return INITIAL_INTENT;
    }
  });

  const [selectedTierId, setSelectedTierId] = useState('best-value');

  const [itinerary, setItinerary] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_agent_current_itinerary');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return demoItineraries['best-value'];
  });

  const [confirmedBookings, setConfirmedBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_agent_confirmed_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_agent_saved_trips');
      return stored ? JSON.parse(stored) : INITIAL_SAVED_TRIPS;
    } catch {
      return INITIAL_SAVED_TRIPS;
    }
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_agent_preferences');
      return stored ? JSON.parse(stored) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  });

  const [destinations, setDestinations] = useState(demoDestinations);
  const [optimizationHistory, setOptimizationHistory] = useState([]);

  // Fetch live seeded destinations from backend on mount
  useEffect(() => {
    let mounted = true;
    destinationService.getDestinations()
      .then((res) => {
        if (mounted && res.data && res.data.length > 0) {
          setDestinations(res.data);
        }
      })
      .catch((err) => {
        console.warn('[TripContext] Using fallback demo destinations:', err.message);
      });
    return () => { mounted = false; };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('trip_agent_intent', JSON.stringify(intent));
    } catch (e) {}
  }, [intent]);

  useEffect(() => {
    try {
      localStorage.setItem('trip_agent_current_itinerary', JSON.stringify(itinerary));
    } catch (e) {}
  }, [itinerary]);

  useEffect(() => {
    try {
      localStorage.setItem('trip_agent_confirmed_bookings', JSON.stringify(confirmedBookings));
    } catch (e) {}
  }, [confirmedBookings]);

  useEffect(() => {
    try {
      localStorage.setItem('trip_agent_saved_trips', JSON.stringify(savedTrips));
    } catch (e) {}
  }, [savedTrips]);

  useEffect(() => {
    try {
      localStorage.setItem('trip_agent_preferences', JSON.stringify(preferences));
    } catch (e) {}
  }, [preferences]);

  // Recalculate tiers when intent changes
  const computedTiers = calculateTiersForIntent(intent);

  const updateIntent = (fields) => {
    setIntent((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.duration !== undefined) {
        updated.duration = Number(fields.duration);
        updated.durationDays = Number(fields.duration);
      } else if (fields.durationDays !== undefined) {
        updated.duration = Number(fields.durationDays);
        updated.durationDays = Number(fields.durationDays);
      }
      if (fields.travelers !== undefined) {
        updated.travelers = Number(fields.travelers);
      }
      return updated;
    });
  };

  const selectTier = (tierId, customTierData = null) => {
    setSelectedTierId(tierId);
    const template = demoItineraries[tierId] || demoItineraries['best-value'];
    const cloned = JSON.parse(JSON.stringify(template));

    // Use live customTierData if provided, else fallback to computedTiers
    if (customTierData) {
      cloned.totalCost = customTierData.totalCost || customTierData.total;
      cloned.perPersonCost = customTierData.perPersonCost || customTierData.perPerson;
      if (customTierData.accommodationCost && cloned.accommodation) {
        cloned.accommodation.totalCost = customTierData.accommodationCost;
      }
      if (customTierData.transportCost && cloned.transport) {
        cloned.transport.totalCost = customTierData.transportCost;
      }
    } else {
      const calculatedTier = computedTiers.find((t) => t.id === tierId) || computedTiers[1];
      cloned.totalCost = calculatedTier.totalCost;
      cloned.perPersonCost = calculatedTier.perPersonCost;
    }

    cloned.travelers = Number(intent.travelers) || 2;
    cloned.duration = Number(intent.duration || intent.durationDays) || 4;
    cloned.durationDays = cloned.duration;
    cloned.origin = intent.origin;
    cloned.destination = intent.destination;

    setItinerary(cloned);
  };

  const optimizeTrip = (actionType, customText = '') => {
    const result = applyOptimizationRule(itinerary, actionType, customText);
    setItinerary(result.updatedItinerary);
    setOptimizationHistory((prev) => [
      {
        timestamp: new Date().toISOString(),
        action: actionType,
        customText,
        ...result,
      },
      ...prev,
    ]);
    return result;
  };

  const applyAIUpdate = (updatedTrip, metadata = {}) => {
    if (!updatedTrip) return;
    setItinerary((prev) => ({
      ...prev,
      ...updatedTrip,
    }));
    setOptimizationHistory((prev) => [
      {
        timestamp: new Date().toISOString(),
        action: metadata.action || 'AI_UPDATE',
        customText: metadata.message || '',
        summaryOfChanges: [metadata.reply || metadata.summary || 'Trip modified via AI assistant.'],
        costDelta: metadata.delta || 0,
        ...metadata,
      },
      ...prev,
    ]);
  };

  const swapItem = (category, oldItemId, newOption) => {
    const updated = JSON.parse(JSON.stringify(itinerary));

    if (category === 'accommodation') {
      const oldCost = updated.accommodation.totalCost;
      updated.accommodation.name = newOption.name;
      if (newOption.type) updated.accommodation.type = newOption.type;
      if (newOption.image) updated.accommodation.image = newOption.image;

      const delta = newOption.costDelta || 0;
      updated.totalCost += delta;
      updated.accommodation.totalCost += delta;
      updated.accommodation.costPerNight = Math.round(updated.accommodation.totalCost / updated.accommodation.nights);
      updated.perPersonCost = Math.round(updated.totalCost / updated.travelers);
    } else if (category === 'transport') {
      const delta = newOption.costDelta || 0;
      updated.transport.title = newOption.title;
      if (newOption.provider) updated.transport.provider = newOption.provider;
      if (newOption.duration) updated.transport.duration = newOption.duration;
      updated.transport.totalCost += delta;
      updated.totalCost += delta;
      updated.perPersonCost = Math.round(updated.totalCost / updated.travelers);
    }

    setItinerary(updated);
  };

  const saveCurrentTrip = () => {
    const newSaved = {
      id: `trip-saved-${Date.now()}`,
      title: itinerary.tripTitle,
      destination: intent.destination,
      origin: intent.origin,
      duration: Number(intent.duration || intent.durationDays) || 4,
      durationDays: Number(intent.duration || intent.durationDays) || 4,
      travelers: Number(intent.travelers) || 2,
      tierName: itinerary.tierName,
      tierId: selectedTierId,
      totalCost: itinerary.totalCost,
      savedAt: new Date().toISOString(),
      status: 'Planned',
      heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      summary: itinerary.summary,
      itinerarySnapshot: itinerary,
    };

    setSavedTrips((prev) => [newSaved, ...prev]);

    // Asynchronously save to backend MongoDB
    tripService.createTrip({
      origin: intent.origin,
      destination: intent.destination,
      duration: Number(intent.duration || intent.durationDays) || 4,
      travelers: Number(intent.travelers) || 2,
      interests: intent.interests || [],
      travelStyle: intent.travelStyle || 'Relaxed',
      selectedBudgetTier: selectedTierId,
      title: itinerary.tripTitle,
      summary: itinerary.summary,
      status: 'Planned',
    }).catch((err) => {
      console.warn('[TripContext] Saved locally. Remote trip sync note:', err.message);
    });

    return newSaved;
  };

  const deleteTrip = (tripId) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (tripId.match(/^[0-9a-fA-F]{24}$/)) {
      tripService.deleteTrip(tripId).catch(() => {});
    }
  };

  const addConfirmedBooking = (bookingRecord) => {
    if (!bookingRecord) return;
    const bookingId = bookingRecord.bookingId || bookingRecord.confirmationNumber || bookingRecord._id;

    setConfirmedBookings((prev) => {
      const filtered = prev.filter(
        (b) => (b.bookingId || b.confirmationNumber || b._id) !== bookingId
      );
      const updated = [bookingRecord, ...filtered];
      try {
        localStorage.setItem('trip_agent_confirmed_bookings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Also update savedTrips with Confirmed status so it appears consistently in all views
    const newSaved = {
      id: bookingRecord.tripId?._id || bookingRecord.tripId || `trip-confirmed-${Date.now()}`,
      title: bookingRecord.tripTitle || `${bookingRecord.destination} Journey (Confirmed)`,
      destination: bookingRecord.destination,
      origin: bookingRecord.origin,
      duration: Number(bookingRecord.duration) || 4,
      durationDays: Number(bookingRecord.duration) || 4,
      travelers: Number(bookingRecord.travelers) || 2,
      tierName: bookingRecord.selectedBudgetTier || 'Best Value',
      tierId: (bookingRecord.selectedBudgetTier || 'best-value').toLowerCase().replace(/\s+/g, '-'),
      totalCost: bookingRecord.totalCost || bookingRecord.totalPrice || 0,
      savedAt: bookingRecord.confirmedAt || new Date().toISOString(),
      status: 'Confirmed',
      confirmationNumber: bookingRecord.confirmationNumber || bookingRecord.bookingId,
      trackingRef: bookingRecord.trackingRef || bookingRecord.payment?.transactionId,
      heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      summary: `Confirmed booking (${bookingRecord.confirmationNumber || bookingRecord.bookingId}) to ${bookingRecord.destination}.`,
      itinerarySnapshot: bookingRecord.itinerary || itinerary,
      bookingData: bookingRecord,
    };

    setSavedTrips((prev) => {
      const filtered = prev.filter(
        (t) => t.id !== newSaved.id && t.confirmationNumber !== newSaved.confirmationNumber
      );
      const updated = [newSaved, ...filtered];
      try {
        localStorage.setItem('trip_agent_saved_trips', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const loadSavedTrip = (saved) => {
    let targetItinerary = null;
    if (saved.itinerarySnapshot) {
      targetItinerary = saved.itinerarySnapshot;
    } else if (saved.itinerary) {
      targetItinerary = saved.itinerary;
    } else if (demoItineraries[saved.tierId]) {
      targetItinerary = demoItineraries[saved.tierId];
    } else {
      targetItinerary = demoItineraries['best-value'];
    }

    if (targetItinerary) {
      setItinerary(targetItinerary);
      try {
        localStorage.setItem('trip_agent_current_itinerary', JSON.stringify(targetItinerary));
      } catch (e) {}
    }

    setSelectedTierId(saved.tierId || 'best-value');
    setIntent((prev) => {
      const updated = {
        ...prev,
        destination: saved.destination || prev.destination,
        origin: saved.origin || prev.origin,
        duration: Number(saved.duration || saved.durationDays) || prev.duration,
        durationDays: Number(saved.duration || saved.durationDays) || prev.durationDays,
        travelers: Number(saved.travelers) || prev.travelers,
      };
      try {
        localStorage.setItem('trip_agent_intent', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updatePreferences = (newPrefs) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  return (
    <TripContext.Provider
      value={{
        intent,
        updateIntent,
        selectedTierId,
        selectTier,
        computedTiers,
        itinerary,
        setItinerary,
        optimizeTrip,
        applyAIUpdate,
        swapItem,
        savedTrips,
        saveCurrentTrip,
        deleteTrip,
        loadSavedTrip,
        confirmedBookings,
        setConfirmedBookings,
        addConfirmedBooking,
        preferences,
        updatePreferences,
        optimizationHistory,
        destinations,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
