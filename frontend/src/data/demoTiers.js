export const budgetTiers = [
  {
    id: 'cheapest',
    key: 'cheapest',
    name: 'Cheapest',
    title: 'Cheapest Tier',
    badge: 'Budget Explorer',
    isRecommended: false,
    colorAccent: 'amber',
    basePricePerPerson: 8500,
    headline: 'Maximum adventure on a minimalist budget',
    summary: 'Travel smart using sleeper transit, community boutique hostels, street gastronomy, and self-guided nature walks.',
    levels: {
      transport: 'Train (3-tier AC / Sleeper) or State Volvos',
      accommodation: 'Top-rated social hostel dorm or local homestay',
      activities: 'Free beaches, heritage walks & DIY scooter trails',
      food: 'Authentic beach shacks, coastal dhabas & night markets',
    },
    inclusions: [
      'Roundtrip sleeper/train transit allocation',
      'Clean hostel/homestay dorm (rated 4.5+)',
      'Local scooter rental (fuel excluded)',
      'Free landmark entry and self-guided maps',
      'Top 10 authentic street food curated spots',
    ],
    tradeoffs: [
      'Shared room or modest private bathroom',
      'Longer transit duration compared to direct flights',
      'Self-driven navigation in local traffic',
    ],
    breakdownPercentages: {
      transport: 30,
      accommodation: 28,
      food: 22,
      activities: 12,
      buffer: 8,
    }
  },
  {
    id: 'best-value',
    key: 'best-value',
    name: 'Best Value',
    title: 'Best Value Tier',
    badge: 'Recommended',
    isRecommended: true,
    colorAccent: 'emerald',
    basePricePerPerson: 15500,
    headline: 'The sweet spot of high comfort, speed & curated value',
    summary: 'Balancing direct air travel with charming 3-star boutique stays, reliable app cabs/scooter, and top-rated culinary spots.',
    levels: {
      transport: 'Direct economy flights or Premium Vande Bharat/Express',
      accommodation: '3-star boutique hotel with pool & complimentary breakfast',
      activities: 'Curated sunset boat cruise, scuba trial, & heritage tour',
      food: 'Popular beachfront cafes, seafood bistros & craft breweries',
    },
    inclusions: [
      'Roundtrip flight/fast transit budget allowance',
      'Private deluxe room with balcony and pool access',
      'Dedicated scooter rental or fixed app cab allowance',
      'Pre-booked sunset catamaran cruise pass',
      'Curated dining itinerary with table reservation tips',
      'Priority customer assistance'
    ],
    tradeoffs: [
      'Economy airline baggage limits',
      'Mid-tier boutique hotel rather than full private beachfront resort',
    ],
    breakdownPercentages: {
      transport: 38,
      accommodation: 32,
      food: 16,
      activities: 10,
      buffer: 4,
    }
  },
  {
    id: 'comfortable',
    key: 'comfortable',
    name: 'Comfortable',
    title: 'Comfortable Tier',
    badge: 'High Comfort',
    isRecommended: false,
    colorAccent: 'blue',
    basePricePerPerson: 26000,
    headline: 'Effortless relaxation with premier beachfront living',
    summary: '4-star beachfront resort, dedicated private air-conditioned cab for every day, fine dining, and guided private excursions.',
    levels: {
      transport: 'Prime slot flights + Dedicated private AC cab with driver',
      accommodation: '4-star beachfront resort with sea-view room & spa',
      activities: 'PADI scuba diving session, spice plantation & dolphin cruise',
      food: 'Signature coastal fine dining, sundowner beach clubs & seafood grills',
    },
    inclusions: [
      'Prime time flight tickets with seat selection',
      '4-star beachfront resort with breakfast & sunset lounge access',
      'Dedicated private AC sedan & polite driver for all 4 days',
      'Guided scuba diving & certified water sports excursion',
      'Reservations at top rated beachside dining venues',
    ],
    tradeoffs: [
      'Higher overall budget outlay',
      'Less flexible departure hours on pre-arranged driver slots',
    ],
    breakdownPercentages: {
      transport: 32,
      accommodation: 40,
      food: 16,
      activities: 8,
      buffer: 4,
    }
  },
  {
    id: 'premium',
    key: 'premium',
    name: 'Premium',
    title: 'Premium Tier',
    badge: 'Luxury & Bespoke',
    isRecommended: false,
    colorAccent: 'purple',
    basePricePerPerson: 48000,
    headline: 'Uncompromising 5-star luxury and bespoke indulgence',
    summary: '5-star private luxury villa or heritage estate, luxury chauffeur, private yacht charter, and chef-table culinary moments.',
    levels: {
      transport: 'Business / premium economy flight + Luxury SUV with chauffeur',
      accommodation: '5-star private pool villa or heritage luxury suite',
      activities: 'Private yacht charter, personal heritage curator & spa day',
      food: 'Celebrity chef tasting menus, private beach dinners & champagne lounge',
    },
    inclusions: [
      'Business class / flexible flight tickets + airport lounge',
      '5-star private villa with plunge pool and 24/7 butler service',
      'Dedicated luxury SUV (Innova Hycross / BMW) with personal chauffeur',
      'Exclusive 3-hour private yacht cruise with refreshments',
      'Private beach cabana candle-light dinner for two',
    ],
    tradeoffs: [
      'Substantially higher investment',
      'Advance reservation mandatory during peak holiday season',
    ],
    breakdownPercentages: {
      transport: 28,
      accommodation: 48,
      food: 14,
      activities: 8,
      buffer: 2,
    }
  }
];

export const calculateTiersForIntent = (intent) => {
  const travelers = Math.max(1, parseInt(intent.travelers || 2, 10));
  const days = Math.max(1, parseInt(intent.duration || intent.durationDays || 4, 10));
  const nights = Math.max(1, days - 1);
  const rooms = Math.ceil(travelers / 2);

  // Component costs map matching structured benchmark inventory
  const componentMatrix = {
    cheapest: {
      transport: 1850 * travelers, // Sleeper train
      accommodation: 1200 * nights * travelers, // Clean hostel dorm bed per traveler
      food: 600 * days * travelers, // Beach shacks & street food
      activities: 350 * travelers, // Self-guided walking trail & landmark entry
      localTransport: 400 * days, // Shared scooter / state bus
    },
    'best-value': {
      transport: 5900 * travelers, // Direct economy flights
      accommodation: 3300 * nights * rooms, // 3-star boutique with pool
      food: 1200 * days * travelers, // Curated beachfront cafes & bistros
      activities: 1400 * travelers, // Sunset catamaran cruise
      localTransport: 600 * days, // Rental scooter / app cabs
    },
    comfortable: {
      transport: 8600 * travelers, // Prime slot flights
      accommodation: 6800 * nights * rooms, // 4-star beachfront resort
      food: 2200 * days * travelers, // Signature coastal dining
      activities: 3500 * travelers, // PADI scuba diving discovery & safari
      localTransport: 1800 * days, // Dedicated private AC sedan & driver
    },
    premium: {
      transport: 13500 * travelers, // Business / flexible flight
      accommodation: 15500 * nights * rooms, // 5-star private pool villa
      food: 4500 * days * travelers, // Chef tasting menus & champagne lounges
      activities: 8500 * travelers, // Private chartered catamaran yacht
      localTransport: 3000 * days, // Luxury SUV & chauffeur
    },
  };

  return budgetTiers.map(tier => {
    const components = componentMatrix[tier.id] || componentMatrix['best-value'];
    const totalCost =
      components.transport +
      components.accommodation +
      components.food +
      components.activities +
      components.localTransport;
    const perPersonCost = Math.round(totalCost / travelers);

    return {
      ...tier,
      totalCost,
      perPersonCost,
      breakdown: components,
      currency: 'INR',
    };
  });
};
