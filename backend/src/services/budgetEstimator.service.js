import { TransportOption } from '../models/TransportOption.js';
import { AccommodationOption } from '../models/AccommodationOption.js';
import { ActivityOption } from '../models/ActivityOption.js';

/**
 * Deterministic Budget Discovery & Estimation Service
 * Derives realistic trip costs from underlying database inventory (transits, stays, activities, dining).
 */
export const calculateBudgetEstimate = async (requirements) => {
  const {
    origin = 'Bhubaneswar',
    destination = 'Goa',
    duration = 4,
    travelers = 2,
    optionalBudget = null,
    travelStyle = 'Relaxed',
  } = requirements;

  const numDays = Math.max(1, parseInt(duration, 10));
  const numTravelers = Math.max(1, parseInt(travelers, 10));
  const numNights = Math.max(1, numDays - 1);
  const roomsNeeded = Math.ceil(numTravelers / 2);

  // 1. Fetch Transport Options for Route
  let transports = [];
  try {
    transports = await TransportOption.find({
      origin: { $regex: origin, $options: 'i' },
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[BudgetEstimator] Transport DB query fallback:', err.message);
  }

  // 2. Fetch Accommodation Options for Destination
  let accommodations = [];
  try {
    accommodations = await AccommodationOption.find({
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[BudgetEstimator] Accommodation DB query fallback:', err.message);
  }

  // 3. Fetch Activity Options for Destination
  let activities = [];
  try {
    activities = await ActivityOption.find({
      destination: { $regex: destination, $options: 'i' },
    });
  } catch (err) {
    console.warn('[BudgetEstimator] Activity DB query fallback:', err.message);
  }

  // Fallback defaults if inventory for specific route isn't seeded
  const budgetTransport = transports.find((t) => t.comfortLevel === 'Budget') || {
    provider: 'Express Train (AC 3-Tier / Sleeper)',
    price: 1850,
    mode: 'Train',
  };

  const standardTransport = transports.find((t) => t.comfortLevel === 'Standard') || {
    provider: 'Direct / 1-Stop Economy Flight',
    price: 5900,
    mode: 'Flight',
  };

  const premiumTransport = transports.find((t) => t.comfortLevel === 'Premium') || {
    provider: 'Prime Slot Flight / Executive Cab',
    price: 8600,
    mode: 'Flight',
  };

  const luxuryTransport = {
    provider: 'Business / Flexible Priority Flight',
    price: 13500,
    mode: 'Flight',
  };

  // Accommodation matches by category
  const hostelStay = accommodations.find((a) => a.category === 'Hostel') || {
    name: 'Top-Rated Social Hostel Dorm',
    pricePerNight: 1200,
  };

  const boutiqueStay = accommodations.find((a) => a.category === 'Boutique Hotel') || {
    name: '3-Star Boutique Hotel with Pool',
    pricePerNight: 3300,
  };

  const resortStay = accommodations.find((a) => a.category === 'Beach Resort' || a.category === 'Mountain Resort') || {
    name: '4-Star Beachfront / Mountain Resort',
    pricePerNight: 6800,
  };

  const villaStay = accommodations.find((a) => a.category === 'Luxury Villa' || a.category === 'Heritage Hotel') || {
    name: '5-Star Luxury Private Pool Villa',
    pricePerNight: 15500,
  };

  // Structured Activity Selection by Tier
  const sortedActivities = [...activities].sort((a, b) => (a.price || 0) - (b.price || 0));

  const budgetActivity = sortedActivities.find((a) => a.price <= 600) || sortedActivities[0] || {
    name: 'Self-Guided Heritage Walk & Landmark Entry',
    price: 350,
  };

  const standardActivity = sortedActivities.find((a) => a.price > 600 && a.price <= 2000) || {
    name: 'Sunset Catamaran Cruise & Sailing',
    price: 1400,
  };

  const premiumActivity = sortedActivities.find((a) => a.price > 2000 && a.price <= 5000) || {
    name: 'PADI Scuba Diving Discovery Trial',
    price: 3500,
  };

  const luxuryActivity = sortedActivities.find((a) => a.price > 5000) || {
    name: 'Private Chartered Catamaran Yacht & Champagne',
    price: 8500,
  };

  // --------------------------------------------------------------------------
  // TIER 1: CHEAPEST
  // Goal: Minimize total practical trip cost while maintaining a reasonable trip
  // --------------------------------------------------------------------------
  const t1_transit = budgetTransport.price * numTravelers;
  const t1_stay = hostelStay.pricePerNight * numNights * numTravelers; // dorm beds per traveler
  const t1_food = 600 * numDays * numTravelers; // authentic beach shacks, dhabas, local street food
  const t1_activities = budgetActivity.price * numTravelers; // structured low-cost activity
  const t1_localTransit = 400 * numDays; // shared scooter / Kadamba public buses
  const t1_total = t1_transit + t1_stay + t1_food + t1_activities + t1_localTransit;

  const cheapest = {
    tier: 'Cheapest',
    total: t1_total,
    perPerson: Math.round(t1_total / numTravelers),
    transportCost: t1_transit,
    accommodationCost: t1_stay,
    foodCost: t1_food,
    activityCost: t1_activities,
    localTransportCost: t1_localTransit,
    comfortLevel: 'Budget Backpacker',
    description: 'Clean social hostels, sleeper train / public connections, authentic street gastronomy, and scenic self-guided walking trails.',
    selectedOptions: {
      transport: `${budgetTransport.provider} (₹${budgetTransport.price}/person)`,
      accommodation: `${hostelStay.name} (₹${hostelStay.pricePerNight}/night)`,
      activity: `${budgetActivity.name} (₹${budgetActivity.price}/person)`,
      localTransit: 'Rented Scooter or State Bus',
    },
    inclusions: [
      'Roundtrip sleeper train or budget connection',
      'Clean community hostel dorm bed (rated 4.5+)',
      'Authentic local street food & beach shack allowance',
      'Self-guided nature and heritage walks',
    ],
    tradeoffs: [
      'Longer travel transit time compared to flights',
      'Shared dorm or modest private bathroom',
      'Self-navigation in local traffic',
    ],
  };

  // --------------------------------------------------------------------------
  // TIER 2: BEST VALUE (Recommended)
  // Goal: Optimal balance of cost, comfort, travel speed, and curated experience
  // --------------------------------------------------------------------------
  const t2_transit = standardTransport.price * numTravelers;
  const t2_stay = boutiqueStay.pricePerNight * numNights * roomsNeeded;
  const t2_food = 1200 * numDays * numTravelers; // curated beachfront cafes, seafood bistros
  const t2_activities = standardActivity.price * numTravelers; // structured curated activity
  const t2_localTransit = 600 * numDays; // dedicated scooter rental or fixed app cab allowance
  const t2_total = t2_transit + t2_stay + t2_food + t2_activities + t2_localTransit;

  const bestValue = {
    tier: 'Best Value',
    isRecommended: true,
    total: t2_total,
    perPerson: Math.round(t2_total / numTravelers),
    transportCost: t2_transit,
    accommodationCost: t2_stay,
    foodCost: t2_food,
    activityCost: t2_activities,
    localTransportCost: t2_localTransit,
    comfortLevel: 'Boutique Comfort',
    description: 'Direct air transit, 3-star boutique stay with swimming pool and breakfast, rental scooter, sunset boat cruise, and curated cafes.',
    selectedOptions: {
      transport: `${standardTransport.provider} (₹${standardTransport.price}/person)`,
      accommodation: `${boutiqueStay.name} (₹${boutiqueStay.pricePerNight}/night)`,
      activity: `${standardActivity.name} (₹${standardActivity.price}/person)`,
      localTransit: 'Self-drive Honda Activa or App Cabs',
    },
    inclusions: [
      'Direct or 1-stop fast airline transit',
      'Private deluxe boutique hotel room with breakfast',
      'Dedicated scooter rental or app cab budget',
      'Pre-booked sunset catamaran cruise or guided tour pass',
    ],
    tradeoffs: [
      'Standard economy baggage limits apply',
      'Mid-tier boutique hotel rather than direct private beach resort',
    ],
  };

  // --------------------------------------------------------------------------
  // TIER 3: COMFORTABLE
  // Goal: High comfort, beachfront resort living, dedicated private chauffeur
  // --------------------------------------------------------------------------
  const t3_transit = premiumTransport.price * numTravelers;
  const t3_stay = resortStay.pricePerNight * numNights * roomsNeeded;
  const t3_food = 2200 * numDays * numTravelers; // fine coastal dining, sundowner beach clubs
  const t3_activities = premiumActivity.price * numTravelers; // structured adventure/scuba excursion
  const t3_localTransit = 1800 * numDays; // dedicated private air-conditioned cab + driver
  const t3_total = t3_transit + t3_stay + t3_food + t3_activities + t3_localTransit;

  const comfortable = {
    tier: 'Comfortable',
    total: t3_total,
    perPerson: Math.round(t3_total / numTravelers),
    transportCost: t3_transit,
    accommodationCost: t3_stay,
    foodCost: t3_food,
    activityCost: t3_activities,
    localTransportCost: t3_localTransit,
    comfortLevel: 'High Comfort Resort',
    description: '4-star beachfront resort with sea-view room, dedicated private AC sedan & driver for all days, scuba excursion, and fine dining.',
    selectedOptions: {
      transport: `${premiumTransport.provider} (₹${premiumTransport.price}/person)`,
      accommodation: `${resortStay.name} (₹${resortStay.pricePerNight}/night)`,
      activity: `${premiumActivity.name} (₹${premiumActivity.price}/person)`,
      localTransit: 'Dedicated Private AC Sedan with Driver (All Days)',
    },
    inclusions: [
      'Prime-slot direct flight bookings with seat selection',
      '4-star beachfront/mountain resort with oceanfront pool',
      'Dedicated private AC sedan & polite driver for all days',
      'PADI-certified scuba diving session & dolphin boat tour',
    ],
    tradeoffs: [
      'Higher overall financial commitment',
      'Fixed itinerary schedule with pre-arranged driver hours',
    ],
  };

  // --------------------------------------------------------------------------
  // TIER 4: PREMIUM
  // Goal: Uncompromising 5-star luxury, private pool villa, private yacht
  // --------------------------------------------------------------------------
  const t4_transit = luxuryTransport.price * numTravelers;
  const t4_stay = villaStay.pricePerNight * numNights * roomsNeeded;
  const t4_food = 4500 * numDays * numTravelers; // 7-course chef tasting menu, champagne lounge
  const t4_activities = luxuryActivity.price * numTravelers; // structured luxury charter
  const t4_localTransit = 3000 * numDays; // luxury Innova Hycross / BMW with chauffeur
  const t4_total = t4_transit + t4_stay + t4_food + t4_activities + t4_localTransit;

  const premium = {
    tier: 'Premium',
    total: t4_total,
    perPerson: Math.round(t4_total / numTravelers),
    transportCost: t4_transit,
    accommodationCost: t4_stay,
    foodCost: t4_food,
    activityCost: t4_activities,
    localTransportCost: t4_localTransit,
    comfortLevel: 'Ultra Luxury & Bespoke',
    description: '5-star private pool villa with 24/7 butler, private chartered yacht cruise, luxury chauffeur, and chef-table gastronomical evenings.',
    selectedOptions: {
      transport: `${luxuryTransport.provider} (₹${luxuryTransport.price}/person)`,
      accommodation: `${villaStay.name} (₹${villaStay.pricePerNight}/night)`,
      activity: `${luxuryActivity.name} (₹${luxuryActivity.price}/person)`,
      localTransit: 'Luxury SUV (Innova Hycross / BMW) with Chauffeur',
    },
    inclusions: [
      'Business class priority flight tickets & airport lounge access',
      '5-star private pool villa with personal butler service',
      'Private 3-hour chartered catamaran cruise with refreshments',
      'Luxury SUV with personal chauffeur on call 24/7',
    ],
    tradeoffs: [
      'Significant financial investment',
      'Strict cancellation policies on private charter reservations',
    ],
  };

  // --------------------------------------------------------------------------
  // CONSTRAINT ANALYSIS (If optional budget is explicitly specified)
  // --------------------------------------------------------------------------
  let constraintAnalysis = null;
  if (optionalBudget && Number(optionalBudget) > 0) {
    const target = Number(optionalBudget);
    let recommended = 'cheapest';
    let status = 'within-budget';

    if (target >= premium.total) {
      recommended = 'premium';
      status = 'surplus-budget';
    } else if (target >= comfortable.total) {
      recommended = 'comfortable';
    } else if (target >= bestValue.total) {
      recommended = 'bestValue';
    } else if (target >= cheapest.total) {
      recommended = 'cheapest';
    } else {
      recommended = 'cheapest';
      status = 'tight-budget';
    }

    const recTier = { cheapest, bestValue, comfortable, premium }[recommended];
    const diff = target - recTier.total;

    constraintAnalysis = {
      targetBudget: target,
      recommendedTierKey: recommended,
      recommendedTierName: recTier.tier,
      recommendedTotal: recTier.total,
      status,
      diff,
      message:
        status === 'tight-budget'
          ? `Your target of ₹${target.toLocaleString('en-IN')} is slightly below our minimum estimated Cheapest tier (₹${cheapest.total.toLocaleString('en-IN')}). Consider reducing duration by 1 day or opting for sleeper transit.`
          : diff >= 0
          ? `Your budget of ₹${target.toLocaleString('en-IN')} comfortably covers the ${recTier.tier} tier (₹${recTier.total.toLocaleString('en-IN')}) with ₹${diff.toLocaleString('en-IN')} remaining as a cushion.`
          : `Optimized around ${recTier.tier} tier within your constraint.`,
    };
  }

  return {
    meta: {
      origin,
      destination,
      duration: numDays,
      travelers: numTravelers,
      nights: numNights,
      roomsNeeded,
      calculatedAt: new Date().toISOString(),
    },
    cheapest,
    bestValue,
    comfortable,
    premium,
    constraintAnalysis,
  };
};
