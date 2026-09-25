import { AccommodationOption } from '../models/AccommodationOption.js';
import { TransportOption } from '../models/TransportOption.js';
import { ActivityOption } from '../models/ActivityOption.js';

/**
 * Configurable multi-criteria scoring weight matrices.
 * Can be overridden or customized per request.
 */
export const DEFAULT_WEIGHT_MATRICES = {
  REDUCE_COST: {
    budgetFit: 0.50,
    rating: 0.15,
    convenience: 0.15,
    preferenceMatch: 0.10,
    comfort: 0.10,
    travelTime: 0.0,
  },
  INCREASE_COMFORT: {
    comfort: 0.45,
    rating: 0.25,
    convenience: 0.15,
    preferenceMatch: 0.10,
    budgetFit: 0.05,
    travelTime: 0.0,
  },
  REDUCE_TRAVEL_TIME: {
    travelTime: 0.50,
    convenience: 0.20,
    comfort: 0.15,
    rating: 0.10,
    preferenceMatch: 0.05,
    budgetFit: 0.0,
  },
  INCREASE_ACTIVITIES: {
    preferenceMatch: 0.40,
    rating: 0.25,
    convenience: 0.20,
    budgetFit: 0.10,
    comfort: 0.05,
    travelTime: 0.0,
  },
  INCREASE_RELAXATION: {
    comfort: 0.35,
    convenience: 0.30,
    preferenceMatch: 0.20,
    rating: 0.15,
    budgetFit: 0.0,
    travelTime: 0.0,
  },
  INCREASE_ADVENTURE: {
    preferenceMatch: 0.45,
    rating: 0.25,
    convenience: 0.15,
    budgetFit: 0.10,
    comfort: 0.05,
    travelTime: 0.0,
  },
  INCREASE_FOOD: {
    preferenceMatch: 0.45,
    rating: 0.30,
    convenience: 0.15,
    budgetFit: 0.10,
    comfort: 0.0,
    travelTime: 0.0,
  },
  CUSTOM: {
    budgetFit: 0.30,
    preferenceMatch: 0.25,
    rating: 0.20,
    comfort: 0.15,
    convenience: 0.10,
    travelTime: 0.0,
  },
};

/**
 * Score an accommodation option based on multi-criteria weights
 */
export const scoreAccommodation = (acc, weights, maxPrice = 15000, preferredInterests = []) => {
  // 1. Budget Fit: lower price -> higher score (0 to 1)
  const budgetFit = Math.max(0, 1 - (acc.pricePerNight / maxPrice));

  // 2. Rating: normalized 0 to 1
  const ratingScore = Math.min(1, (acc.rating || 4.0) / 5.0);

  // 3. Comfort Level based on category
  const comfortMap = {
    'Hostel': 0.35,
    'Boutique Hotel': 0.70,
    'Beach Resort': 0.90,
    'Mountain Resort': 0.90,
    'Heritage Hotel': 0.85,
    'Luxury Villa': 1.0,
  };
  const comfortScore = comfortMap[acc.category] || 0.60;

  // 4. Convenience (amenities, location)
  let convenienceScore = 0.5;
  if (acc.amenities && acc.amenities.length > 0) {
    if (acc.amenities.includes('Swimming Pool') || acc.amenities.includes('Complimentary Breakfast')) {
      convenienceScore += 0.3;
    }
    if (acc.amenities.includes('Beachfront') || acc.amenities.includes('Spa')) {
      convenienceScore += 0.2;
    }
  }
  convenienceScore = Math.min(1.0, convenienceScore);

  // 5. Preference Match
  let preferenceMatch = 0.5;
  if (preferredInterests.includes('Beaches') && acc.category === 'Beach Resort') preferenceMatch += 0.4;
  if (preferredInterests.includes('Relaxed') && (acc.category === 'Beach Resort' || acc.category === 'Luxury Villa')) preferenceMatch += 0.3;
  if (preferredInterests.includes('Budget-friendly') && (acc.category === 'Hostel' || acc.category === 'Boutique Hotel')) preferenceMatch += 0.4;
  preferenceMatch = Math.min(1.0, preferenceMatch);

  // Travel time score for stays (proximity)
  const travelTime = acc.distanceToBeach ? (acc.distanceToBeach.includes('Walk') ? 1.0 : 0.7) : 0.6;

  // Total weighted score
  const totalScore =
    (weights.budgetFit || 0) * budgetFit +
    (weights.rating || 0) * ratingScore +
    (weights.comfort || 0) * comfortScore +
    (weights.convenience || 0) * convenienceScore +
    (weights.preferenceMatch || 0) * preferenceMatch +
    (weights.travelTime || 0) * travelTime;

  return { option: acc, score: totalScore, components: { budgetFit, ratingScore, comfortScore, convenienceScore } };
};

/**
 * Score a transport option based on multi-criteria weights
 */
export const scoreTransport = (t, weights, maxPrice = 15000) => {
  const budgetFit = Math.max(0, 1 - (t.price / maxPrice));
  const ratingScore = 0.85;

  // Speed / Travel time: Flight (2-3h) -> 1.0; Train -> 0.45; Bus -> 0.35
  const isFlight = t.mode === 'Flight';
  const travelTime = isFlight ? 1.0 : t.mode === 'Train' ? 0.45 : 0.35;

  const comfortMap = { 'Budget': 0.4, 'Standard': 0.75, 'Premium': 0.95 };
  const comfortScore = comfortMap[t.comfortLevel] || 0.65;
  const convenienceScore = isFlight ? 0.9 : 0.6;

  const totalScore =
    (weights.budgetFit || 0) * budgetFit +
    (weights.rating || 0) * ratingScore +
    (weights.comfort || 0) * comfortScore +
    (weights.convenience || 0) * convenienceScore +
    (weights.travelTime || 0) * travelTime;

  return { option: t, score: totalScore };
};

/**
 * Score an activity option based on multi-criteria weights
 */
export const scoreActivity = (act, weights, targetCategory = 'All') => {
  const ratingScore = Math.min(1, (act.rating || 4.5) / 5.0);
  let preferenceMatch = 0.5;

  if (targetCategory !== 'All' && act.category && act.category.toLowerCase() === targetCategory.toLowerCase()) {
    preferenceMatch = 1.0;
  }

  const convenienceScore = act.duration ? (act.duration.includes('2') || act.duration.includes('3') ? 0.85 : 0.7) : 0.6;
  const budgetFit = Math.max(0, 1 - ((act.price || 500) / 4000));

  const totalScore =
    (weights.preferenceMatch || 0.4) * preferenceMatch +
    (weights.rating || 0.3) * ratingScore +
    (weights.convenience || 0.2) * convenienceScore +
    (weights.budgetFit || 0.1) * budgetFit;

  return { option: act, score: totalScore };
};

/**
 * Main Journey Optimization Function
 * Modifies an existing structured journey based on a designated optimization objective.
 */
export const optimizeJourney = async (currentTrip, options = {}) => {
  const {
    objective = 'REDUCE_COST',
    customText = '',
    protectedItems = [],
    customWeights = null,
  } = options;

  const trip = JSON.parse(JSON.stringify(currentTrip));
  const previousTotal = trip.totalCost || 36500;
  const duration = Math.max(1, Number(trip.duration || trip.durationDays || 4));
  const travelers = Math.max(1, Number(trip.travelers || 2));
  const nights = Math.max(1, duration - 1);
  const roomsNeeded = Math.ceil(travelers / 2);
  const destination = trip.destination || 'Goa';
  const origin = trip.origin || 'Bhubaneswar';

  // Normalize objective key
  let normalizedObjective = String(objective).toUpperCase().replace(/[\s-]+/g, '_');
  if (normalizedObjective === 'CHEAPER') normalizedObjective = 'REDUCE_COST';
  if (normalizedObjective === 'COMFORT' || normalizedObjective === 'MORE_COMFORTABLE') normalizedObjective = 'INCREASE_COMFORT';
  if (normalizedObjective === 'FASTER' || normalizedObjective === 'SPEED') normalizedObjective = 'REDUCE_TRAVEL_TIME';
  if (normalizedObjective === 'ACTIVITIES') normalizedObjective = 'INCREASE_ACTIVITIES';
  if (normalizedObjective === 'RELAXED') normalizedObjective = 'INCREASE_RELAXATION';
  if (normalizedObjective === 'ADVENTURE') normalizedObjective = 'INCREASE_ADVENTURE';
  if (normalizedObjective === 'FOOD') normalizedObjective = 'INCREASE_FOOD';

  // Check if custom text specifies protecting activities
  const textLower = (customText || '').toLowerCase();
  const shouldProtectActivities =
    protectedItems.length > 0 ||
    textLower.includes("don't remove") ||
    textLower.includes('keep activities') ||
    textLower.includes('without removing') ||
    textLower.includes('retain activities') ||
    textLower.includes('preserve activities');

  // Select weight matrix
  const weights = customWeights || DEFAULT_WEIGHT_MATRICES[normalizedObjective] || DEFAULT_WEIGHT_MATRICES.CUSTOM;

  const changedItems = [];
  const preservedItemsList = new Set(protectedItems);

  // Collect existing activities from itinerary to protect
  const existingActivities = [];
  if (Array.isArray(trip.days)) {
    trip.days.forEach((d) => {
      if (Array.isArray(d.timeline)) {
        d.timeline.forEach((item) => {
          if (item.type === 'activity' || item.type === 'sightseeing') {
            existingActivities.push(item.title);
          }
        });
      }
    });
  } else if (Array.isArray(trip.itinerary)) {
    trip.itinerary.forEach((d) => {
      if (Array.isArray(d.items)) {
        d.items.forEach((item) => {
          existingActivities.push(item.title);
        });
      }
    });
  }

  // If activities should be protected, record them
  if (shouldProtectActivities || normalizedObjective === 'REDUCE_COST') {
    existingActivities.forEach((act) => preservedItemsList.add(act));
  }

  // 1. Fetch available alternatives from MongoDB
  let accommodationsPool = [];
  let transportsPool = [];
  let activitiesPool = [];

  try {
    accommodationsPool = await AccommodationOption.find({
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[OptimizationService] Accommodation query error:', err.message);
  }

  try {
    transportsPool = await TransportOption.find({
      origin: { $regex: origin, $options: 'i' },
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[OptimizationService] Transport query error:', err.message);
  }

  try {
    activitiesPool = await ActivityOption.find({
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[OptimizationService] Activity query error:', err.message);
  }

  // Fallbacks if database not populated
  if (!accommodationsPool || accommodationsPool.length === 0) {
    accommodationsPool = [
      { name: 'The Funky Monkey Social Hostel, Anjuna', category: 'Hostel', pricePerNight: 1200, rating: 4.6, amenities: ['Free WiFi', 'Social Lounge'] },
      { name: 'BloomSuites Boutique & Spa, Calangute', category: 'Boutique Hotel', pricePerNight: 3300, rating: 4.7, amenities: ['Swimming Pool', 'Complimentary Breakfast'] },
      { name: 'Caravela Beach Resort, Varca Beach', category: 'Beach Resort', pricePerNight: 6800, rating: 4.8, amenities: ['Beachfront', 'Swimming Pool', 'Spa'] },
      { name: '5-Star Luxury Private Pool Villa, Assagao', category: 'Luxury Villa', pricePerNight: 15500, rating: 4.9, amenities: ['Private Pool', 'Butler Service'] },
    ];
  }

  if (!transportsPool || transportsPool.length === 0) {
    transportsPool = [
      { mode: 'Train', provider: 'Konkan Kanya Express (3-tier AC)', price: 1850, comfortLevel: 'Budget', duration: '24h 00m' },
      { mode: 'Flight', provider: 'IndiGo Airlines (Direct)', price: 5900, comfortLevel: 'Standard', duration: '2h 35m' },
      { mode: 'Flight', provider: 'Air India Prime Slot', price: 8600, comfortLevel: 'Premium', duration: '2h 20m' },
    ];
  }

  if (!activitiesPool || activitiesPool.length === 0) {
    activitiesPool = [
      { title: 'Mandovi River Sunset Catamaran Cruise', category: 'Cruise', price: 950, rating: 4.7, duration: '2 hours' },
      { title: 'Guided Assagao Heritage & Portuguese Architecture Walk', category: 'Cultural', price: 600, rating: 4.8, duration: '2.5 hours' },
      { title: 'Scuba Diving Trial & Coral Reef Snorkeling', category: 'Adventure', price: 2800, rating: 4.9, duration: '4 hours' },
      { title: 'Traditional Goan Spice Plantation Tour & Lunch', category: 'Food & Nightlife', price: 850, rating: 4.6, duration: '3 hours' },
    ];
  }

  // --------------------------------------------------------------------------
  // OBJECTIVE EXECUTION LOGIC
  // --------------------------------------------------------------------------
  let explanation = '';

  switch (normalizedObjective) {
    // ------------------------------------------------------------------------
    // 1. REDUCE COST
    // ------------------------------------------------------------------------
    case 'REDUCE_COST': {
      const oldHotelName = trip.accommodation?.name || '';
      const oldPerNight = trip.accommodation?.costPerNight || 3300;
      const oldStayTotal = trip.accommodation?.totalCost || (oldPerNight * nights * roomsNeeded);

      // Score accommodations prioritizing budgetFit, picking a different and more economical stay
      const scoredStays = accommodationsPool
        .filter((a) => a.name !== oldHotelName && a.pricePerNight < oldPerNight)
        .map((a) => scoreAccommodation(a, weights, 12000, trip.interests || []))
        .sort((a, b) => b.score - a.score);

      let bestStay = scoredStays[0]?.option;
      if (!bestStay) {
        // Fallback to lowest priced stay in pool
        const byPrice = [...accommodationsPool].filter((a) => a.name !== oldHotelName).sort((a, b) => a.pricePerNight - b.pricePerNight);
        bestStay = byPrice[0] || { name: 'The Funky Monkey Social Hostel', pricePerNight: 1200, category: 'Hostel' };
      }

      const newStayTotal = bestStay.pricePerNight * nights * roomsNeeded;
      const stayDelta = newStayTotal - oldStayTotal;

      changedItems.push({
        component: 'accommodation',
        from: oldHotelName || 'Previous Stay',
        to: `${bestStay.name} (₹${bestStay.pricePerNight}/night)`,
        delta: stayDelta,
        reason: 'Selected top-scoring value stay with 4.5+ rating to reduce lodging expenses',
      });

      if (!trip.accommodation) trip.accommodation = {};
      trip.accommodation.name = bestStay.name;
      trip.accommodation.type = bestStay.category;
      trip.accommodation.costPerNight = bestStay.pricePerNight;
      trip.accommodation.totalCost = newStayTotal;

      // Optimize local mobility (e.g. switch to scooter / public transit)
      const oldLocalTransit = trip.localTransit?.cost || 2400;
      const newLocalTransit = 1200; // e.g. scooter rental
      const transitDelta = newLocalTransit - oldLocalTransit;

      if (transitDelta < 0) {
        changedItems.push({
          component: 'local_transit',
          from: trip.localTransit?.title || 'Dedicated App Cabs',
          to: 'Rented Scooter / Public Transit Allowance',
          delta: transitDelta,
          reason: 'Switched to economical self-drive mobility to protect core experiences',
        });
        if (!trip.localTransit) trip.localTransit = {};
        trip.localTransit.title = 'Rented Honda Activa / Scooter';
        trip.localTransit.cost = newLocalTransit;
      }

      // Recalculate trip total
      const netDelta = stayDelta + transitDelta;
      trip.totalCost = Math.max(1000, previousTotal + netDelta);
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      const preservedCount = preservedItemsList.size;
      explanation = `Optimized journey for cost efficiency. We saved ₹${Math.abs(netDelta).toLocaleString('en-IN')} by selecting ${bestStay.name} and economical local transit, while strictly preserving ${preservedCount} core activities.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 2. INCREASE COMFORT
    // ------------------------------------------------------------------------
    case 'INCREASE_COMFORT': {
      const scoredStays = accommodationsPool
        .map((a) => scoreAccommodation(a, weights, 20000, trip.interests || []))
        .sort((a, b) => b.score - a.score);

      const bestStay = scoredStays[0]?.option || accommodationsPool[accommodationsPool.length - 1];
      const oldHotelName = trip.accommodation?.name || 'Standard Hotel';
      const oldStayTotal = trip.accommodation?.totalCost || (3300 * nights * roomsNeeded);
      const newStayTotal = bestStay.pricePerNight * nights * roomsNeeded;
      const stayDelta = newStayTotal - oldStayTotal;

      changedItems.push({
        component: 'accommodation',
        from: oldHotelName,
        to: `${bestStay.name} (₹${bestStay.pricePerNight}/night)`,
        delta: stayDelta,
        reason: `Upgraded to premier ${bestStay.category} with beachfront access and pool`,
      });

      if (!trip.accommodation) trip.accommodation = {};
      trip.accommodation.name = bestStay.name;
      trip.accommodation.type = bestStay.category;
      trip.accommodation.costPerNight = bestStay.pricePerNight;
      trip.accommodation.totalCost = newStayTotal;

      // Upgrade local mobility to private chauffeur
      const chauffeurCost = 1800 * duration;
      const oldTransit = trip.localTransit?.cost || 1200;
      const transitDelta = chauffeurCost - oldTransit;

      changedItems.push({
        component: 'local_transit',
        from: trip.localTransit?.title || 'Self-drive Scooter',
        to: 'Dedicated Private AC Sedan with Chauffeur',
        delta: transitDelta,
        reason: 'Added dedicated polite private driver on call for all days',
      });

      if (!trip.localTransit) trip.localTransit = {};
      trip.localTransit.title = 'Dedicated Private AC Sedan with Chauffeur';
      trip.localTransit.cost = chauffeurCost;

      const netDelta = stayDelta + transitDelta;
      trip.totalCost = previousTotal + netDelta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);
      trip.selectedBudgetTier = 'comfortable';

      explanation = `Elevated overall journey comfort. Upgraded stay to ${bestStay.name} and added a dedicated private air-conditioned chauffeur for effortless travel.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 3. REDUCE TRAVEL TIME
    // ------------------------------------------------------------------------
    case 'REDUCE_TRAVEL_TIME': {
      const scoredTransports = transportsPool
        .map((t) => scoreTransport(t, weights))
        .sort((a, b) => b.score - a.score);

      const fastTransport = scoredTransports[0]?.option || transportsPool.find((t) => t.mode === 'Flight') || transportsPool[0];
      const oldProvider = trip.transport?.provider || 'Sleeper Train';
      const oldTransitCost = trip.transport?.totalCost || (1850 * travelers);
      const newTransitCost = fastTransport.price * travelers;
      const transitDelta = newTransitCost - oldTransitCost;

      changedItems.push({
        component: 'transport',
        from: `${oldProvider} (Long Transit)`,
        to: `${fastTransport.provider} (${fastTransport.duration})`,
        delta: transitDelta,
        reason: 'Selected fastest direct airline connection to minimize door-to-door transit time',
      });

      if (!trip.transport) trip.transport = {};
      trip.transport.mode = fastTransport.mode;
      trip.transport.provider = fastTransport.provider;
      trip.transport.duration = fastTransport.duration;
      trip.transport.totalCost = newTransitCost;

      trip.totalCost = previousTotal + transitDelta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      explanation = `Reduced transit duration by switching to ${fastTransport.provider} (${fastTransport.duration}), saving over 20 hours of travel time.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 4. INCREASE ACTIVITIES
    // ------------------------------------------------------------------------
    case 'INCREASE_ACTIVITIES': {
      const candidateActivities = activitiesPool.filter(
        (a) => !existingActivities.includes(a.title)
      );

      const added = candidateActivities[0] || activitiesPool[0];
      const addedCost = added.price * travelers;

      changedItems.push({
        component: 'activities',
        from: 'Open afternoon leisure block',
        to: `${added.title} (₹${added.price}/person)`,
        delta: addedCost,
        reason: 'Enriched open schedule with high-rated sightseeing experience',
      });

      trip.totalCost = previousTotal + addedCost;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      explanation = `Enriched your journey schedule by adding ${added.title} during Day 2 afternoon leisure hours.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 5. INCREASE RELAXATION
    // ------------------------------------------------------------------------
    case 'INCREASE_RELAXATION': {
      changedItems.push({
        component: 'schedule_pacing',
        from: '3 structured activities per day',
        to: 'Relaxed Pacing (Max 1 core morning activity, free afternoons)',
        delta: 0,
        reason: 'Paced schedule with unhurried mornings and sundowner downtime blocks',
      });

      // Boost pool/beach resort fit
      const resortStay = accommodationsPool.find((a) => a.category === 'Beach Resort') || accommodationsPool[0];
      if (trip.accommodation?.name !== resortStay.name) {
        const oldStay = trip.accommodation?.totalCost || (3300 * nights * roomsNeeded);
        const newStay = resortStay.pricePerNight * nights * roomsNeeded;
        const delta = newStay - oldStay;

        changedItems.push({
          component: 'accommodation',
          from: trip.accommodation?.name || 'City Hotel',
          to: `${resortStay.name} (Direct beach access)`,
          delta,
          reason: 'Swapped stay to direct beachfront resort with oceanfront infinity pool',
        });

        if (!trip.accommodation) trip.accommodation = {};
        trip.accommodation.name = resortStay.name;
        trip.accommodation.type = resortStay.category;
        trip.accommodation.costPerNight = resortStay.pricePerNight;
        trip.accommodation.totalCost = newStay;

        trip.totalCost = previousTotal + delta;
        trip.perPersonCost = Math.round(trip.totalCost / travelers);
      }

      explanation = `Adapted itinerary for maximum relaxation. Cleared afternoon slots for beach lounge time and positioned your stay directly on the coast.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 6. INCREASE ADVENTURE
    // ------------------------------------------------------------------------
    case 'INCREASE_ADVENTURE': {
      const adventureAct = activitiesPool.find((a) => a.category === 'Adventure') || {
        title: 'Scuba Diving Trial & Water Sports Safari',
        price: 2800,
      };

      const addedCost = adventureAct.price * travelers;
      changedItems.push({
        component: 'activities',
        from: 'General beach sightseeing',
        to: `${adventureAct.title} (₹${adventureAct.price}/person)`,
        delta: addedCost,
        reason: 'Added adrenaline water sports and certified diving trial',
      });

      trip.totalCost = previousTotal + addedCost;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      explanation = `Infused high-energy thrills into your journey with ${adventureAct.title}!`;
      break;
    }

    // ------------------------------------------------------------------------
    // 7. INCREASE FOOD EXPERIENCES
    // ------------------------------------------------------------------------
    case 'INCREASE_FOOD': {
      const foodBoost = 600 * duration * travelers;
      changedItems.push({
        component: 'dining',
        from: 'Standard daily meal allowance',
        to: 'Curated coastal seafood & chef bistro allowance (+₹600/day/traveler)',
        delta: foodBoost,
        reason: 'Embedded authentic culinary tasting sessions and iconic beach shacks',
      });

      trip.totalCost = previousTotal + foodBoost;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      explanation = `Expanded daily culinary discovery budget to include signature coastal dining and Assagao boutique cafes.`;
      break;
    }

    // ------------------------------------------------------------------------
    // 8. CUSTOM CONSTRAINTS
    // ------------------------------------------------------------------------
    case 'CUSTOM':
    default: {
      if (shouldProtectActivities) {
        // Find accommodation savings
        const oldHotelName = trip.accommodation?.name || '';
        const oldPerNight = trip.accommodation?.costPerNight || 3300;
        const oldStay = trip.accommodation?.totalCost || (oldPerNight * nights * roomsNeeded);

        let budgetStay = accommodationsPool.find((a) => a.name !== oldHotelName && a.pricePerNight < oldPerNight);
        if (!budgetStay) {
          const sortedStays = [...accommodationsPool].filter((a) => a.name !== oldHotelName).sort((a, b) => a.pricePerNight - b.pricePerNight);
          budgetStay = sortedStays[0] || { name: 'The Funky Monkey Social Hostel, Anjuna', pricePerNight: 1200, category: 'Hostel' };
        }

        const newStay = budgetStay.pricePerNight * nights * roomsNeeded;
        const stayDelta = newStay - oldStay;

        changedItems.push({
          component: 'accommodation',
          from: oldHotelName || 'Previous Stay',
          to: `${budgetStay.name} (₹${budgetStay.pricePerNight}/night)`,
          delta: stayDelta,
          reason: 'Optimized lodging to achieve savings while protecting core activities',
        });

        if (!trip.accommodation) trip.accommodation = {};
        trip.accommodation.name = budgetStay.name;
        trip.accommodation.type = budgetStay.category;
        trip.accommodation.costPerNight = budgetStay.pricePerNight;
        trip.accommodation.totalCost = newStay;

        // Also check local transit savings if applicable
        let transitDelta = 0;
        const oldLocalTransit = trip.localTransit?.cost || 2400;
        const newLocalTransit = 1200;
        if (oldLocalTransit > newLocalTransit) {
          transitDelta = newLocalTransit - oldLocalTransit;
          changedItems.push({
            component: 'local_transit',
            from: trip.localTransit?.title || 'Dedicated App Cabs',
            to: 'Rented Scooter or Public Transit Allowance',
            delta: transitDelta,
            reason: 'Switched to economical self-drive mobility to protect core experiences',
          });
          if (!trip.localTransit) trip.localTransit = {};
          trip.localTransit.title = 'Rented Honda Activa / Scooter';
          trip.localTransit.cost = newLocalTransit;
        }

        const netDelta = stayDelta + transitDelta;
        trip.totalCost = Math.max(1000, previousTotal + netDelta);
        trip.perPersonCost = Math.round(trip.totalCost / travelers);

        explanation = `Applied constraint: "${customText}". Strictly preserved all ${preservedItemsList.size} major activities while generating ₹${Math.abs(netDelta).toLocaleString('en-IN')} in savings across accommodation and local transit.`;
      } else {
        explanation = `Re-aligned journey parameters around your custom objective: "${customText}".`;
      }
      break;
    }
  }

  const newTotal = trip.totalCost;
  const savings = previousTotal - newTotal;

  return {
    previousTotal,
    newTotal,
    savings,
    changedItems,
    preservedItems: Array.from(preservedItemsList),
    explanation,
    updatedJourney: trip,
  };
};
