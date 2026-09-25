/**
 * Trip Agent - Booking & Monetization Service
 *
 * Core Architecture & Trust Principles:
 * 1. Basic travel planning is free for travelers; monetization comes from partner commissions on eligible completed bookings.
 * 2. Extensible Provider Abstraction: allows plugging in real partner APIs (Amadeus, Booking.com, Viator, etc.) in the future.
 * 3. IMPORTANT TRUST PRINCIPLE: Relevance before Monetization.
 *    Options are scored and ranked strictly by user preferences, price fit, location, rating, and convenience.
 *    Commission rate NEVER influences ranking order.
 * 4. Transparent partner disclosures for sponsored or partner-promoted options.
 * 5. Full internal and UI labeling of simulated/demo data for the MVP.
 */

import { Trip } from '../models/Trip.js';
import { AccommodationOption } from '../models/AccommodationOption.js';
import { TransportOption } from '../models/TransportOption.js';
import { ActivityOption } from '../models/ActivityOption.js';
import { TripBooking } from '../models/TripBooking.js';

// ============================================================================
// 1. PARTNER PROVIDER ABSTRACTION
// ============================================================================

export class BaseBookingProvider {
  constructor(name, category, options = {}) {
    this.name = name;
    this.category = category;
    this.isDemo = options.isDemo ?? true;
    this.defaultCommissionRate = options.commissionRate ?? 0.08;
    this.partnerType = options.partnerType ?? 'verified_partner'; // 'verified_partner' | 'affiliate_network' | 'direct_operator'
  }

  /**
   * Fetch inventory options matching search criteria
   */
  async fetchOptions(criteria) {
    throw new Error(`fetchOptions() not implemented by provider ${this.name}`);
  }

  /**
   * Generate secure, trackable partner affiliate booking URL
   */
  generateBookingUrl(optionId, tripContext = {}, trackingRef) {
    const origin = tripContext.origin || 'Bhubaneswar';
    const dest = tripContext.destination || 'Goa';
    const ref = trackingRef || `TA-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    return `https://partners.tripagent.internal/checkout?partner=${encodeURIComponent(
      this.name
    )}&category=${this.category}&optionId=${optionId}&ref=${ref}&from=${encodeURIComponent(
      origin
    )}&to=${encodeURIComponent(dest)}&utm_source=trip_agent&utm_medium=affiliate`;
  }

  /**
   * Return commission terms for option
   */
  getCommissionTerms(option) {
    const rate = option.customCommissionRate ?? this.defaultCommissionRate;
    return {
      commissionEligible: !option.isPublicUtility,
      commissionRate: rate,
      commissionModel: 'CPA (Cost Per Completed Acquisition)',
      estimatedCommission: option.price ? Math.round(option.price * rate) : 0,
    };
  }
}

// ---------------- Concrete Demo Adapters ----------------

class DemoTransportProvider extends BaseBookingProvider {
  constructor() {
    super('Air & Rail Partner Network', 'transport', {
      isDemo: true,
      commissionRate: 0.06, // 6% on flights/trains
      partnerType: 'affiliate_network',
    });
  }

  async fetchOptions(criteria = {}) {
    const destination = criteria.destination || 'Goa';
    const origin = criteria.origin || 'Bhubaneswar';

    let dbTransports = [];
    try {
      dbTransports = await TransportOption.find({
        $or: [
          { destination: new RegExp(destination, 'i') },
          { origin: new RegExp(origin, 'i') }
        ]
      }).limit(6);
    } catch (e) {
      dbTransports = [];
    }

    if (dbTransports.length === 0) {
      return [
        {
          id: 'demo-fl-indigo-1',
          category: 'transport',
          provider: 'IndiGo Airlines',
          title: 'Direct / 1-Stop Fast Connector Flight',
          price: 5900,
          priceUnit: 'per person',
          relevantDetails: [
            'Cabin bag 7kg + Check-in 15kg included',
            'Direct gate transfer with 92% on-time record',
            'Instant PNR confirmation via API',
          ],
          rating: 4.5,
          reviewsCount: 3820,
          availabilityStatus: 'instant_confirmation',
          isPublicUtility: false,
          isSponsored: false,
          partnerBadge: 'Partner-ready option',
          speed: 'fast',
          comfort: 'standard',
        },
        {
          id: 'demo-fl-airindia-2',
          category: 'transport',
          provider: 'Air India Express',
          title: 'Economy Value Morning Flight',
          price: 5200,
          priceUnit: 'per person',
          relevantDetails: [
            'Economy seat selection included',
            'Complimentary hot snack combo',
            'Flexible date change up to 48h before departure',
          ],
          rating: 4.2,
          reviewsCount: 1940,
          availabilityStatus: 'few_seats_left',
          isPublicUtility: false,
          isSponsored: true,
          sponsoredReason: 'Special airline partner promotion for Goa routes',
          partnerBadge: 'Featured Partner',
          speed: 'fast',
          comfort: 'standard',
        },
        {
          id: 'demo-tr-rail-3',
          category: 'transport',
          provider: 'Indian Railways (Konkan Kanya Express)',
          title: 'AC 3-Tier Scenic Western Ghats Rail',
          price: 1850,
          priceUnit: 'per person',
          relevantDetails: [
            'Clean linen and air-conditioned sleeper berth',
            'Panoramic mountain and estuary views',
            'Confirmed e-ticket booking',
          ],
          rating: 4.3,
          reviewsCount: 4210,
          availabilityStatus: 'available',
          isPublicUtility: true, // Non-commission public utility
          isSponsored: false,
          partnerBadge: 'Public Transit Utility',
          speed: 'scenic',
          comfort: 'budget',
        },
      ];
    }

    return dbTransports.map((t, idx) => ({
      id: t._id ? t._id.toString() : `db-trans-${idx}`,
      category: 'transport',
      provider: t.provider || 'National Carrier',
      title: `${t.mode}: ${t.origin} → ${t.destination}`,
      price: t.price,
      priceUnit: 'per person',
      relevantDetails: t.details && t.details.length > 0 ? t.details : [
        `Departure: ${t.departure}`,
        `Duration: ${t.duration}`,
        `Comfort Tier: ${t.comfortLevel}`,
      ],
      rating: 4.4,
      reviewsCount: 1200 + idx * 350,
      availabilityStatus: idx === 1 ? 'few_seats_left' : 'instant_confirmation',
      isPublicUtility: t.mode === 'Train' || t.mode === 'Bus',
      isSponsored: idx === 0,
      sponsoredReason: idx === 0 ? 'Featured flight partner for fast transfers' : null,
      partnerBadge: t.mode === 'Train' ? 'Public Transit Utility' : idx === 0 ? 'Featured Partner' : 'Partner-ready option',
      speed: t.mode === 'Flight' ? 'fast' : 'scenic',
      comfort: (t.comfortLevel || 'standard').toLowerCase(),
    }));
  }
}

class DemoAccommodationProvider extends BaseBookingProvider {
  constructor() {
    super('Hospitality Channel Manager', 'accommodation', {
      isDemo: true,
      commissionRate: 0.10, // 10% on stays
      partnerType: 'verified_partner',
    });
  }

  async fetchOptions(criteria = {}) {
    const destination = criteria.destination || 'Goa';

    let dbHotels = [];
    try {
      dbHotels = await AccommodationOption.find({
        destination: new RegExp(destination, 'i'),
      }).limit(6);
    } catch (e) {
      dbHotels = [];
    }

    if (dbHotels.length === 0) {
      return [
        {
          id: 'demo-acc-bloom-1',
          category: 'accommodation',
          provider: 'BloomSuites Boutique & Spa',
          title: 'Boutique Garden Stay with Swimming Pool',
          price: 3300,
          priceUnit: 'per night',
          relevantDetails: [
            'Outdoor swimming pool with sun terrace',
            'Complimentary hot breakfast buffet daily',
            '600m walking distance to Calangute Beach',
            'Free high-speed Wi-Fi & workspace',
          ],
          location: 'Calangute, North Goa',
          rating: 4.6,
          reviewsCount: 428,
          availabilityStatus: 'instant_confirmation',
          isSponsored: false,
          partnerBadge: 'Partner-ready option',
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          styleMatch: ['Relaxed', 'Best Value', 'Boutique Hotel'],
        },
        {
          id: 'demo-acc-caravela-2',
          category: 'accommodation',
          provider: 'Caravela Beach Resort',
          title: 'Direct Beachfront Luxury Resort & Spa',
          price: 6800,
          priceUnit: 'per night',
          relevantDetails: [
            'Direct access to pristine Varca white sand beach',
            '9-hole golf course & Ayurvedic holistic spa',
            '3 oceanfront fine-dining restaurants',
            'Complimentary airport private transfers',
          ],
          location: 'Varca Beach, South Goa',
          rating: 4.8,
          reviewsCount: 1240,
          availabilityStatus: 'few_seats_left',
          isSponsored: true,
          sponsoredReason: 'Preferred 4-star resort partner promotion',
          partnerBadge: 'Featured Partner',
          imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
          styleMatch: ['Comfortable', 'Premium', 'Beach Resort'],
        },
        {
          id: 'demo-acc-zostel-3',
          category: 'accommodation',
          provider: 'Zostel Plus Morjim',
          title: 'Beachside Boutique Hostellerie & Social Pods',
          price: 2400,
          priceUnit: 'per night',
          relevantDetails: [
            'Beachside private pod rooms & suites',
            'Infinity pool overlooking palm groves',
            'Coworking cafe and live acoustic sunset jams',
            'On-premise scooter and surfboard rentals',
          ],
          location: 'Morjim, North Goa',
          rating: 4.8,
          reviewsCount: 960,
          availabilityStatus: 'instant_confirmation',
          isSponsored: false,
          partnerBadge: 'Partner-ready option',
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          styleMatch: ['Cheapest', 'Best Value', 'Hostel', 'Social'],
        },
      ];
    }

    return dbHotels.map((h, idx) => ({
      id: h._id ? h._id.toString() : `db-acc-${idx}`,
      category: 'accommodation',
      provider: h.name,
      title: `${h.category}: ${h.name}`,
      price: h.pricePerNight,
      priceUnit: 'per night',
      relevantDetails: h.amenities && h.amenities.length > 0 ? h.amenities : [
        h.distanceFromAttractions || 'Centrally located',
        'Air-conditioned rooms with private bath',
        '24/7 guest assistance desk',
      ],
      location: h.location,
      rating: h.rating || 4.5,
      reviewsCount: h.reviewsCount || 350,
      availabilityStatus: idx === 1 ? 'few_seats_left' : 'instant_confirmation',
      isSponsored: idx === 0,
      sponsoredReason: idx === 0 ? 'Featured boutique accommodation partner' : null,
      partnerBadge: idx === 0 ? 'Featured Partner' : 'Partner-ready option',
      imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      styleMatch: [h.category],
    }));
  }
}

class DemoActivityProvider extends BaseBookingProvider {
  constructor() {
    super('Experiences & Activities Collective', 'activities', {
      isDemo: true,
      commissionRate: 0.12, // 12% on tours/activities
      partnerType: 'verified_partner',
    });
  }

  async fetchOptions(criteria = {}) {
    const destination = criteria.destination || 'Goa';

    let dbActivities = [];
    try {
      dbActivities = await ActivityOption.find({
        destination: new RegExp(destination, 'i'),
      }).limit(8);
    } catch (e) {
      dbActivities = [];
    }

    if (dbActivities.length === 0) {
      return [
        {
          id: 'demo-act-scuba-1',
          category: 'activities',
          provider: 'Goa Dive Adventures',
          title: 'Grand Island Scuba Dive Discovery & Dolphin Cruise',
          price: 2400,
          priceUnit: 'per person',
          relevantDetails: [
            'Certified PADI instructor 1-on-1 underwater briefing',
            'Full underwater video & 10 high-res photos included',
            'Speedboat cruise with complimentary breakfast on deck',
            'Complete safety gear, wet suit and fins provided',
          ],
          duration: '4.5 Hours',
          rating: 4.9,
          reviewsCount: 512,
          availabilityStatus: 'few_seats_left',
          isSponsored: false,
          partnerBadge: 'Partner-ready option',
          imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
          interestTags: ['Adventure', 'Water sports', 'Nature'],
        },
        {
          id: 'demo-act-cruise-2',
          category: 'activities',
          provider: 'Paradise Catamarans Goa',
          title: 'Mandovi River Sunset Catamaran Sailing',
          price: 700,
          priceUnit: 'per person',
          relevantDetails: [
            '90 minutes scenic sailing on Mandovi estuary',
            'Traditional Goan folk dance performance on upper deck',
            'Complimentary tropical sundowner beverage',
            'Unobstructed sunset photo views',
          ],
          duration: '90 Minutes',
          rating: 4.7,
          reviewsCount: 789,
          availabilityStatus: 'instant_confirmation',
          isSponsored: true,
          sponsoredReason: 'Partner promotion with complimentary beverage upgrade',
          partnerBadge: 'Featured Partner',
          imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
          interestTags: ['Culture', 'Relaxed', 'Sunset'],
        },
        {
          id: 'demo-act-heritage-3',
          category: 'activities',
          provider: 'Soul Travelling Goa',
          title: 'Fontainhas Latin Quarter Heritage & Bakery Walk',
          price: 550,
          priceUnit: 'per person',
          relevantDetails: [
            'Guided walk through Portuguese heritage homes and azulejo tiles',
            'Exclusive tasting at 31st January traditional bakery',
            'Local historian storytelling and architecture commentary',
            'Small intimate group max 10 travelers',
          ],
          duration: '2 Hours',
          rating: 4.9,
          reviewsCount: 640,
          availabilityStatus: 'instant_confirmation',
          isSponsored: false,
          partnerBadge: 'Partner-ready option',
          imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
          interestTags: ['Culture', 'History', 'Food'],
        },
      ];
    }

    return dbActivities.map((a, idx) => ({
      id: a._id ? a._id.toString() : `db-act-${idx}`,
      category: 'activities',
      provider: a.category === 'Cruise' ? 'Paradise Cruises' : a.category === 'Adventure' ? 'Coastal Adventures' : 'Soul Travelling',
      title: a.name,
      price: a.price,
      priceUnit: 'per person',
      relevantDetails: a.includes && a.includes.length > 0 ? a.includes : [
        `Duration: ${a.duration}`,
        `Category: ${a.category}`,
        'Certified local guide with safety briefing',
      ],
      duration: a.duration,
      rating: a.rating || 4.8,
      reviewsCount: a.reviewsCount || 420,
      availabilityStatus: idx === 0 ? 'few_seats_left' : 'instant_confirmation',
      isSponsored: idx === 1,
      sponsoredReason: idx === 1 ? 'Official cruise partner special' : null,
      partnerBadge: idx === 1 ? 'Featured Partner' : 'Partner-ready option',
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      interestTags: [a.category],
    }));
  }
}

class DemoTourProvider extends BaseBookingProvider {
  constructor() {
    super('Guided Tours & Expeditions', 'tours', {
      isDemo: true,
      commissionRate: 0.10, // 10% on guided day tours
      partnerType: 'partner_ready',
    });
  }

  async fetchOptions(criteria = {}) {
    return [
      {
        id: 'demo-tour-dudhsagar-1',
        category: 'tours',
        provider: 'Goa Safari & Eco Tours',
        title: 'Dudhsagar Waterfall Jeep Safari & Spice Plantation Tour',
        price: 2100,
        priceUnit: 'per person',
        relevantDetails: [
          '4x4 open jeep ride through Bhagwan Mahavir Wildlife Sanctuary',
          'Swimming in freshwater mountain pool beneath Dudhsagar cascade',
          'Traditional Goan buffet lunch on banana leaf at organic spice farm',
          'Roundtrip AC hotel pickup and drop included',
        ],
        duration: 'Full Day (8 Hours)',
        rating: 4.8,
        reviewsCount: 1120,
        availabilityStatus: 'instant_confirmation',
        isSponsored: false,
        partnerBadge: 'Partner-ready option',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        interestTags: ['Nature', 'Adventure', 'Food'],
      },
      {
        id: 'demo-tour-divar-2',
        category: 'tours',
        provider: 'Island Trails India',
        title: 'Divar Island E-Bike Heritage & Village Circuit',
        price: 1650,
        priceUnit: 'per person',
        relevantDetails: [
          'Scenic ferry crossing to timeless Divar Island',
          'Electric smart bikes with safety helmets provided',
          'Visit to ancient ruins, bird sanctuary, and sluice gates',
          'Chai, snacks, and interactions with village elders',
        ],
        duration: '3.5 Hours',
        rating: 4.9,
        reviewsCount: 430,
        availabilityStatus: 'available',
        isSponsored: true,
        sponsoredReason: 'Eco-tourism partner highlight with complimentary GoPro video',
        partnerBadge: 'Featured Partner',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        interestTags: ['Nature', 'Culture', 'Relaxed'],
      }
    ];
  }
}

class DemoExperienceProvider extends BaseBookingProvider {
  constructor() {
    super('Curated Local Experiences', 'experiences', {
      isDemo: true,
      commissionRate: 0.12, // 12% on experiences
      partnerType: 'partner_ready',
    });
  }

  async fetchOptions(criteria = {}) {
    return [
      {
        id: 'demo-exp-foodtrail-1',
        category: 'experiences',
        provider: 'The Culinary Lore Collective',
        title: 'Panjim Latin Quarter Tapas & Feni Cocktail Tasting',
        price: 1800,
        priceUnit: 'per person',
        relevantDetails: [
          'Hosted by recognized culinary historian and mixologist',
          '5 signature Goan tapas dishes paired with cashew/coconut feni',
          'Exclusive access to a 150-year-old private heritage tavern cellar',
          'Recipe booklet and artisan spice souvenir to take home',
        ],
        duration: '2.5 Hours',
        rating: 4.9,
        reviewsCount: 380,
        availabilityStatus: 'few_seats_left',
        isSponsored: false,
        partnerBadge: 'Partner-ready option',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        interestTags: ['Food', 'Culture', 'Nightlife'],
      },
      {
        id: 'demo-exp-privateyacht-2',
        category: 'experiences',
        provider: 'Goa Luxury Yachting Guild',
        title: 'Private Sunset Sailing Yacht with Seafood Canapes',
        price: 7500,
        priceUnit: 'per group (up to 4)',
        relevantDetails: [
          'Exclusive 32-ft sailing yacht charter with captain and crew',
          'Chilled sparkling wine and fresh seafood canapes',
          'Bluetooth sound system and deck cushions for relaxation',
          'Unobstructed sunset views along the Arabian Sea coastline',
        ],
        duration: '2 Hours',
        rating: 5.0,
        reviewsCount: 165,
        availabilityStatus: 'on_request',
        isSponsored: true,
        sponsoredReason: 'Exclusive premium experience partner discount',
        partnerBadge: 'Featured Partner',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        interestTags: ['Luxury', 'Sunset', 'Relaxed'],
      }
    ];
  }
}

// ---------------- Registry ----------------

class PartnerProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(category, providerInstance) {
    if (!this.providers.has(category)) {
      this.providers.set(category, []);
    }
    this.providers.get(category).push(providerInstance);
  }

  getProvidersForCategory(category) {
    if (category === 'all') {
      const all = [];
      for (const list of this.providers.values()) {
        all.push(...list);
      }
      return all;
    }
    return this.providers.get(category) || [];
  }
}

// Global Registry Singleton
export const partnerRegistry = new PartnerProviderRegistry();
partnerRegistry.registerProvider('transport', new DemoTransportProvider());
partnerRegistry.registerProvider('accommodation', new DemoAccommodationProvider());
partnerRegistry.registerProvider('activities', new DemoActivityProvider());
partnerRegistry.registerProvider('tours', new DemoTourProvider());
partnerRegistry.registerProvider('experiences', new DemoExperienceProvider());

// ============================================================================
// 2. IMPORTANT TRUST PRINCIPLE: RELEVANCE SCORING
// ============================================================================

/**
 * Calculates item relevance strictly according to:
 * - user preferences (interests, style)
 * - price alignment (selected budget tier)
 * - location & proximity
 * - rating & guest feedback
 * - convenience & directness
 * - trip compatibility
 *
 * NOTE: Commission rate or monetization eligibility is NEVER included in this calculation!
 */
export function calculateRelevanceScore(option, tripContext = {}) {
  const selectedTier = tripContext.selectedBudgetTier || 'bestValue';
  const travelStyle = tripContext.travelStyle || 'Relaxed';
  const interests = tripContext.interests || ['Beaches', 'Food', 'Culture'];

  let preferenceMatch = 0.5;
  let priceFit = 0.5;
  let locationScore = 0.6;
  let ratingScore = (option.rating || 4.5) / 5.0; // 0 to 1
  let convenienceScore = 0.7;

  // 1. Preference Match
  if (option.interestTags && Array.isArray(option.interestTags)) {
    const matched = option.interestTags.filter((t) =>
      interests.some((ui) => ui.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ui.toLowerCase()))
    );
    preferenceMatch = matched.length > 0 ? 0.75 + (matched.length * 0.1) : 0.5;
    if (preferenceMatch > 1.0) preferenceMatch = 1.0;
  }

  // 2. Price Fit relative to Tier Target
  const price = option.price || 0;
  if (selectedTier === 'cheapest') {
    priceFit = price < 3000 ? 0.95 : price < 6000 ? 0.65 : 0.35;
  } else if (selectedTier === 'bestValue') {
    priceFit = price >= 1000 && price <= 6000 ? 0.95 : price < 1000 ? 0.75 : 0.60;
  } else if (selectedTier === 'comfortable') {
    priceFit = price >= 3000 && price <= 12000 ? 0.95 : price < 3000 ? 0.60 : 0.75;
  } else if (selectedTier === 'premium') {
    priceFit = price >= 6000 ? 0.95 : 0.55;
  }

  // 3. Convenience Score
  if (option.availabilityStatus === 'instant_confirmation') convenienceScore += 0.15;
  if (option.speed === 'fast') convenienceScore += 0.1;
  if (convenienceScore > 1.0) convenienceScore = 1.0;

  // Weighted Total Relevance Score (Normalized 0.0 to 1.0)
  const totalRelevance =
    0.25 * preferenceMatch +
    0.25 * priceFit +
    0.20 * locationScore +
    0.15 * ratingScore +
    0.15 * convenienceScore;

  return {
    relevanceScore: Math.round(totalRelevance * 100) / 100,
    breakdown: {
      preferenceMatch: Math.round(preferenceMatch * 100),
      priceFit: Math.round(priceFit * 100),
      locationScore: Math.round(locationScore * 100),
      ratingScore: Math.round(ratingScore * 100),
      convenienceScore: Math.round(convenienceScore * 100),
    },
  };
}

/**
 * Generates an explainable travel designer rationale for "Why this option?"
 */
export function generateWhyThisOption(option, tripContext = {}, relevanceBreakdown) {
  const tier = (tripContext.selectedBudgetTier || 'Best Value').replace(/([A-Z])/g, ' $1').trim();
  const travelers = tripContext.travelers || 2;
  const destination = tripContext.destination || 'Goa';

  if (option.category === 'transport') {
    if (option.speed === 'fast') {
      return `Selected for optimal travel time to ${destination}: high on-time reliability with luggage included, saving you hours of transit for a ${travelers}-traveler group.`;
    }
    return `Balanced scenic option matching budget constraints, offering direct confirmed berths with zero highway stress.`;
  }

  if (option.category === 'accommodation') {
    if (option.rating >= 4.7) {
      return `Top-rated (${option.rating}★) stay in ${option.location || destination} matching your ${tier} tier. Combines excellent guest reviews, central beach proximity, and verified amenities.`;
    }
    return `Prime value match for ${tier} tier: dependable comfort in ${option.location || destination} with high guest ratings, avoiding expensive resort markups.`;
  }

  if (option.category === 'activities' || option.category === 'tours' || option.category === 'experiences') {
    return `Curated for your travel interests in ${destination}: verified local guides, small group sizes, and high traveler satisfaction (${option.rating}★ rating from ${option.reviewsCount || 300}+ reviews).`;
  }

  return `Handpicked option offering the strongest balance of guest rating, price fit, and convenient location for your trip.`;
}

// ============================================================================
// 3. MAIN SERVICE METHODS
// ============================================================================

/**
 * Fetches structured bookable options for a given trip.
 * Respects the TRUST PRINCIPLE:
 * - Scored by relevance first
 * - Ranked strictly by relevance descending
 * - Monetization and sponsored metadata attached with full transparency
 * - Labeled with clear demo indicators
 */
export async function getTripBookingOptions(tripId, query = {}) {
  let tripContext = {
    origin: 'Bhubaneswar',
    destination: 'Goa',
    duration: 4,
    travelers: 2,
    selectedBudgetTier: 'bestValue',
    travelStyle: 'Relaxed',
    interests: ['Beaches', 'Food', 'Culture'],
  };

  // If tripId is a valid ObjectId, load trip from DB
  if (tripId && tripId !== 'default' && tripId !== 'demo' && tripId.length === 24) {
    try {
      const tripDoc = await Trip.findById(tripId).lean();
      if (tripDoc) {
        tripContext = {
          origin: tripDoc.origin || tripContext.origin,
          destination: tripDoc.destination || tripContext.destination,
          duration: tripDoc.duration || tripContext.duration,
          travelers: tripDoc.travelers || tripContext.travelers,
          selectedBudgetTier: tripDoc.selectedBudgetTier || tripContext.selectedBudgetTier,
          travelStyle: tripDoc.travelStyle || tripContext.travelStyle,
          interests: tripDoc.interests && tripDoc.interests.length > 0 ? tripDoc.interests : tripContext.interests,
        };
      }
    } catch (e) {
      // Continue with default context if lookup fails
    }
  }

  const requestedCategory = query.category || 'all';
  const providers = partnerRegistry.getProvidersForCategory(requestedCategory);

  const rawOptions = [];
  for (const provider of providers) {
    const items = await provider.fetchOptions({
      destination: tripContext.destination,
      origin: tripContext.origin,
      travelers: tripContext.travelers,
      tier: tripContext.selectedBudgetTier,
    });

    for (const item of items) {
      const commissionTerms = provider.getCommissionTerms(item);
      const trackingRef = `TA-REF-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingUrl = provider.generateBookingUrl(item.id, tripContext, trackingRef);

      const relevance = calculateRelevanceScore(item, tripContext);
      const whyThisOption = generateWhyThisOption(item, tripContext, relevance.breakdown);

      rawOptions.push({
        id: item.id,
        category: item.category,
        provider: item.provider,
        title: item.title,
        price: item.price,
        priceUnit: item.priceUnit || 'per person',
        relevantDetails: item.relevantDetails || [],
        duration: item.duration || null,
        location: item.location || tripContext.destination,
        rating: item.rating || 4.5,
        reviewsCount: item.reviewsCount || 250,
        imageUrl: item.imageUrl || null,
        availabilityStatus: item.availabilityStatus || 'available',
        commissionEligible: commissionTerms.commissionEligible,
        commissionRate: commissionTerms.commissionRate,
        estimatedCommission: commissionTerms.estimatedCommission,
        bookingUrl,
        trackingRef,
        whyThisOption,
        relevanceScore: relevance.relevanceScore,
        matchBreakdown: relevance.breakdown,
        isSponsored: Boolean(item.isSponsored),
        sponsoredReason: item.sponsoredReason || null,
        partnerBadge: item.partnerBadge || 'Partner-ready option',
        isDemoData: true,
      });
    }
  }

  // TRUST PRINCIPLE ENFORCEMENT:
  // Sort strictly by relevanceScore descending.
  // Commission rates or sponsored status DO NOT manipulate the primary relevance ordering.
  rawOptions.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    tripId,
    tripContext: {
      origin: tripContext.origin,
      destination: tripContext.destination,
      duration: tripContext.duration,
      travelers: tripContext.travelers,
      selectedBudgetTier: tripContext.selectedBudgetTier,
      travelStyle: tripContext.travelStyle,
    },
    count: rawOptions.length,
    trustPrinciples: {
      relevanceFirst: true,
      noPayToRank: true,
      monetizationDisclosure: 'Trip Agent receives partner commission on eligible completed bookings. Commission rate depends on partner agreement. Rankings are driven strictly by user preference compatibility, price fit, and verified ratings.',
      isDemoDataNotice: 'MVP Demonstration: All provider options and commission structures are simulated for product verification.',
    },
    options: rawOptions,
  };
}

/**
 * Initiates the Traveler -> Trip Agent -> Partner handover flow
 */
export async function initiatePartnerHandover(payload = {}) {
  const { optionId, tripId, category, travelers = 2, selectedDate = null } = payload;
  const trackingRef = `TA-REF-${Math.floor(100000 + Math.random() * 900000)}`;

  const commissionRateMap = {
    transport: 0.06,
    accommodation: 0.10,
    activities: 0.12,
    tours: 0.10,
    experiences: 0.12,
  };

  const rate = commissionRateMap[category] || 0.08;

  return {
    handoverId: `HO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    trackingRef,
    status: 'redirect_ready',
    tripId: tripId || 'demo-trip',
    optionId,
    category,
    partySize: travelers,
    selectedDate: selectedDate || new Date().toISOString().split('T')[0],
    handoverSequence: [
      { step: 1, label: 'Traveler Intent Confirmed', completed: true },
      { step: 2, label: 'Trip Agent Context Handover Generated', completed: true },
      { step: 3, label: 'Partner Booking Engine Session Initialized', completed: true },
      { step: 4, label: 'Secure Transaction & Confirmation', completed: false, pendingAtPartner: true },
      { step: 5, label: 'Partner Commission Attribution Logged', completed: false, pendingAtSettlement: true },
    ],
    commissionTerms: {
      model: 'CPA (Cost Per Acquisition)',
      rate: 'Partner commission on eligible completed bookings (rate depends on partner agreement)',
      disclosure: 'Earned through partner referral at no additional cost to traveler.',
    },
    redirectUrl: `https://partners.tripagent.internal/checkout?ref=${trackingRef}&optionId=${optionId}&partySize=${travelers}`,
    isSimulation: true,
    message: 'Partner handover token issued. In production, this redirects directly to the partner booking engine with pre-populated itinerary parameters.',
  };
}

/**
 * B2B Partner Program Overview for "For travel businesses" concept section
 */
export function getPartnerProgramInfo() {
  return {
    programName: 'Trip Agent Travel Partner Network',
    tagline: 'Connect directly with high-intent travelers right inside AI-curated itineraries',
    valuePropositions: [
      {
        title: 'Qualified Travelers, Not Window Shoppers',
        description: 'Every traveler on Trip Agent has an explicit destination, travel dates, pacing style, and calculated budget tier. No cold bounce traffic.',
        metric: '4.2x higher conversion than standard display ads',
      },
      {
        title: 'Contextual AI Itinerary Placement',
        description: 'Your inventory appears exactly when and where it fits into a traveler\'s schedule, such as an evening catamaran cruise after a morning heritage walk.',
        metric: 'Zero banner blindness; 100% native placement',
      },
      {
        title: 'Zero Upfront Listing Fees',
        description: 'Pay only on completed, verified traveler bookings (performance CPA model). Free plan discovery for travelers ensures a vast inbound funnel.',
        metric: 'Performance-based affiliate model',
      },
      {
        title: 'Future Automated Partner Ingestion API',
        description: 'Upcoming REST & GraphQL APIs to synchronize real-time rates, inventory allotments, and automated reservation confirmation callbacks.',
        metric: 'Direct PMS / GDS / Channel Manager sync',
      },
    ],
    supportedVerticals: [
      'Boutique Hotels & Resorts',
      'Airlines & Regional Rail Operators',
      'Licensed Scuba & Water Sports Centers',
      'Local Heritage Tour Operators',
      'Curated Culinary Trails & Chef Experiences',
    ],
    status: 'MVP Partner Program (Early Access Inquiries Open)',
  };
}

// ============================================================================
// 4. CHECKOUT WIZARD, STEP VERIFICATION & PERSISTENCE ENGINE
// ============================================================================

function generateRef(prefix, length = 5) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

function generateNumericRef(prefix) {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

function calculateDemoDates(duration = 4) {
  const now = new Date();
  const start = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return {
    start: start.toLocaleDateString('en-GB', options),
    end: end.toLocaleDateString('en-GB', options),
    isoStart: start.toISOString(),
    isoEnd: end.toISOString(),
  };
}

/**
 * Normalizes day-by-day itinerary days into a structured, full schedule
 */
export function normalizeItineraryDays(days = [], origin = 'Bhubaneswar', destination = 'Goa', duration = 4, travelers = 2) {
  if (Array.isArray(days) && days.length > 0) {
    return days.map((d, dIdx) => {
      const rawItems = d.items || d.timeline || [];
      const normalizedItems = rawItems.map((item, iIdx) => ({
        id: item.id || `item-d${d.day || dIdx + 1}-${iIdx + 1}`,
        time: item.time || (iIdx === 0 ? '09:00 AM' : iIdx === 1 ? '01:00 PM' : iIdx === 2 ? '04:30 PM' : '07:30 PM'),
        type: item.type || (iIdx === 0 ? 'transport' : iIdx === 1 ? 'food' : 'activity'),
        title: item.title || 'Itinerary Milestone',
        description: item.description || '',
        estimatedCost: Number(item.estimatedCost !== undefined ? item.estimatedCost : (item.cost || 0)),
        cost: Number(item.cost !== undefined ? item.cost : (item.estimatedCost || 0)),
        duration: item.duration || '1.5-2 hours',
        category: item.category || (item.type === 'food' ? 'Food & Dining' : item.type === 'transport' ? 'Transport' : item.type === 'accommodation' ? 'Accommodation' : 'Sightseeing'),
        location: item.location || destination,
        canChange: Boolean(item.canChange),
        alternatives: item.alternatives || [],
      }));

      return {
        day: Number(d.day || dIdx + 1),
        date: d.date || `Day ${d.day || dIdx + 1}`,
        title: d.title || `Day ${d.day || dIdx + 1} Discovery & Experiences`,
        estimatedSpend: Number(d.estimatedSpend || normalizedItems.reduce((sum, it) => sum + (it.estimatedCost || 0), 0)),
        items: normalizedItems,
        timeline: normalizedItems,
      };
    });
  }

  // Generate complete day-by-day fallback itinerary covering all days through the final day
  const daysList = [];
  const safeDuration = Math.max(1, Number(duration || 4));
  for (let dayNum = 1; dayNum <= safeDuration; dayNum++) {
    let dayTitle = '';
    let items = [];

    if (dayNum === 1) {
      dayTitle = `Arrival in ${destination}, Check-in & Evening Orientation`;
      items = [
        {
          id: `item-d1-1`,
          time: '11:30 AM',
          type: 'transport',
          title: `Transit & Transfer from ${origin} to Hotel`,
          duration: '2.5 hours',
          estimatedCost: 1200,
          cost: 1200,
          category: 'Transport',
          description: `Smooth airport transfer from arrival terminal directly to your verified accommodation.`
        },
        {
          id: `item-d1-2`,
          time: '01:30 PM',
          type: 'accommodation',
          title: 'Hotel Check-in & Freshen Up',
          duration: '1.5 hours',
          estimatedCost: 0,
          cost: 0,
          category: 'Accommodation',
          description: 'Settle into your room, unpack, and relax after the journey.'
        },
        {
          id: `item-d1-3`,
          time: '04:30 PM',
          type: 'activity',
          title: 'Sunset Coastal Walk & Landmark Viewpoint',
          duration: '2 hours',
          estimatedCost: 400,
          cost: 400,
          category: 'Sightseeing',
          description: `Take a leisurely golden-hour stroll along scenic coastal promenades and clifftops.`
        },
        {
          id: `item-d1-4`,
          time: '07:30 PM',
          type: 'food',
          title: 'Welcome Dinner & Regional Specialties',
          duration: '2 hours',
          estimatedCost: 1200,
          cost: 1200,
          category: 'Food & Dining',
          description: `Sample authentic local cuisine and chef favorites in a relaxed ambiance.`
        }
      ];
    } else if (dayNum === safeDuration) {
      dayTitle = 'Souvenir Morning & Return Journey';
      items = [
        {
          id: `item-d${dayNum}-1`,
          time: '09:00 AM',
          type: 'food',
          title: 'Buffet Breakfast & Leisure Morning',
          duration: '1.5 hours',
          estimatedCost: 0,
          cost: 0,
          category: 'Food & Dining',
          description: 'Enjoy a leisurely breakfast buffet and pack essentials before checkout.'
        },
        {
          id: `item-d${dayNum}-2`,
          time: '11:00 AM',
          type: 'activity',
          title: 'Artisan Market & Local Souvenir Walk',
          duration: '2 hours',
          estimatedCost: 600,
          cost: 600,
          category: 'Cultural',
          description: 'Pick up handcrafted spices, tea, handicrafts, and regional souvenirs.'
        },
        {
          id: `item-d${dayNum}-3`,
          time: '03:00 PM',
          type: 'transport',
          title: `Return Transfer & Departure to ${origin}`,
          duration: '3 hours',
          estimatedCost: 1200,
          cost: 1200,
          category: 'Transport',
          description: `Pre-arranged return transfer connecting to your flight/train back home.`
        }
      ];
    } else if (dayNum === 2) {
      dayTitle = 'Core Cultural Heritage & Guided Excursion';
      items = [
        {
          id: `item-d2-1`,
          time: '09:00 AM',
          type: 'activity',
          title: `Historic Quarter & Architectural Walking Tour`,
          duration: '3 hours',
          estimatedCost: 800,
          cost: 800,
          category: 'Cultural',
          description: `Guided exploration of heritage lanes, ancient monuments, and colorful historical quarters.`
        },
        {
          id: `item-d2-2`,
          time: '01:00 PM',
          type: 'food',
          title: 'Traditional Lunch at Heritage Courtyard',
          duration: '1.5 hours',
          estimatedCost: 900,
          cost: 900,
          category: 'Food & Dining',
          description: 'Authentic multi-course meal in a charming historic courtyard.'
        },
        {
          id: `item-d2-3`,
          time: '04:30 PM',
          type: 'activity',
          title: 'Catamaran Cruise & Panoramic Waterways',
          duration: '2.5 hours',
          estimatedCost: 1400,
          cost: 1400,
          category: 'Experience',
          description: 'Scenic water cruise with live music and golden-hour vistas.'
        }
      ];
    } else {
      dayTitle = `Day ${dayNum}: Nature Exploration & Outdoor Adventure`;
      items = [
        {
          id: `item-d${dayNum}-1`,
          time: '08:30 AM',
          type: 'activity',
          title: 'Nature Trail & Scenic Exploration',
          duration: '3.5 hours',
          estimatedCost: 1500,
          cost: 1500,
          category: 'Adventure',
          description: 'Immersive outdoor journey discovering hidden viewpoints, local flora, and viewpoints.'
        },
        {
          id: `item-d${dayNum}-2`,
          time: '01:30 PM',
          type: 'food',
          title: 'Cafe Discovery & Artisan Lunch',
          duration: '1.5 hours',
          estimatedCost: 850,
          cost: 850,
          category: 'Food & Dining',
          description: 'Relaxed artisan lunch with freshly prepared regional delicacies.'
        },
        {
          id: `item-d${dayNum}-3`,
          time: '04:00 PM',
          type: 'activity',
          title: 'Relaxed Beach / Valley Leisure & Photography',
          duration: '3 hours',
          estimatedCost: 400,
          cost: 400,
          category: 'Leisure',
          description: 'Free time for photography, beach relaxation, or cafe hopping.'
        }
      ];
    }

    daysList.push({
      day: dayNum,
      date: `Day ${dayNum}`,
      title: dayTitle,
      estimatedSpend: items.reduce((s, it) => s + it.estimatedCost, 0),
      items,
      timeline: items,
    });
  }

  return daysList;
}

/**
 * Creates or retrieves an existing booking session for a trip.
 * IDEMPOTENT: If trip is already CONFIRMED, returns that confirmation immediately.
 */
export async function createOrGetBookingSession(tripId, itineraryData = {}, intentData = {}) {
  // 1. Check if there is already a CONFIRMED booking for this tripId
  const existingConfirmed = await TripBooking.findOne({
    tripId: String(tripId),
    status: 'CONFIRMED',
  });
  if (existingConfirmed) {
    return existingConfirmed;
  }

  // 2. Check if an IN_PROGRESS session exists
  const existingSession = await TripBooking.findOne({
    tripId: String(tripId),
    status: { $in: ['IN_PROGRESS', 'PAYMENT_PENDING'] },
  }).sort({ updatedAt: -1 });

  if (existingSession) {
    return existingSession;
  }

  // 3. Look up Trip document if valid ObjectId
  let tripDoc = null;
  if (tripId && tripId !== 'default' && tripId !== 'demo' && tripId.length === 24) {
    try {
      tripDoc = await Trip.findById(tripId).lean();
    } catch {
      // Ignore lookup failure
    }
  }

  const origin = intentData.origin || tripDoc?.origin || 'Bhubaneswar';
  const destination = intentData.destination || tripDoc?.destination || 'Goa';
  const duration = Number(intentData.duration || intentData.durationDays || tripDoc?.duration || 4);
  const travelers = Number(intentData.travelers || tripDoc?.travelers || 2);
  const selectedBudgetTier = intentData.selectedBudgetTier || tripDoc?.selectedBudgetTier || 'bestValue';
  const dates = calculateDemoDates(duration);

  // Normalize transport
  const tObj = itineraryData.transport || {};
  const transport = {
    status: 'PENDING',
    reference: '',
    provider: tObj.provider || 'IndiGo Airlines / Air India Express',
    title: tObj.title || `Roundtrip Fast Connector Flights (${origin} ⇄ ${destination})`,
    flightNumbers: tObj.flightNumbers || '6E-543 / 6E-892',
    departure: tObj.departure || '08:15 AM Day 1',
    returnArrival: tObj.returnArrival || '09:40 PM Day ' + duration,
    cabin: 'Economy',
    duration: tObj.duration || '4h 15m (1 stop)',
    price: Number(tObj.totalCost || tObj.price || 11800),
    verifiedAt: null,
  };

  // Normalize accommodation
  const aObj = itineraryData.accommodation || {};
  const nights = Number(aObj.nights || (duration > 1 ? duration - 1 : 1));
  const pricePerNight = Number(aObj.costPerNight || aObj.pricePerNight || 3300);
  const accommodation = {
    status: 'PENDING',
    reference: '',
    name: aObj.name || 'BloomSuites Boutique & Spa, Calangute',
    location: aObj.location || (destination.includes('Goa') ? 'Calangute, North Goa' : destination),
    roomType: aObj.type || 'Deluxe Pool View Room',
    nights,
    checkIn: dates.start,
    checkOut: dates.end,
    pricePerNight,
    price: Number(aObj.totalCost || nights * pricePerNight || 9900),
    verifiedAt: null,
  };

  // Extract individual bookable activities
  const activities = [];
  if (Array.isArray(itineraryData.days) && itineraryData.days.length > 0) {
    itineraryData.days.forEach((day) => {
      const items = day.timeline || day.items || [];
      items.forEach((item, idx) => {
        if (item.type === 'activity' || (item.cost && item.cost > 0 && item.type !== 'transport' && item.type !== 'accommodation')) {
          activities.push({
            activityId: item.id || `act-d${day.day || 1}-${idx}`,
            title: item.title,
            dayNumber: Number(day.day || 1),
            date: `Day ${day.day || 1}`,
            time: item.time || '10:00 AM',
            duration: item.duration || '2 hours',
            travelers,
            price: Number(item.cost || 500),
            status: 'PENDING',
            reference: '',
            verifiedAt: null,
          });
        }
      });
    });
  }

  // Fallback activities if none extracted
  if (activities.length === 0) {
    activities.push(
      {
        activityId: 'act-demo-1',
        title: 'Mandovi River Sunset Catamaran Cruise',
        dayNumber: 1,
        date: 'Day 1',
        time: '05:30 PM',
        duration: '90 Minutes',
        travelers,
        price: 700 * travelers,
        status: 'PENDING',
        reference: '',
        verifiedAt: null,
      },
      {
        activityId: 'act-demo-2',
        title: 'Grand Island Scuba Dive Discovery & Dolphin Tour',
        dayNumber: 2,
        date: 'Day 2',
        time: '08:30 AM',
        duration: '4.5 Hours',
        travelers,
        price: 2400 * travelers,
        status: 'PENDING',
        reference: '',
        verifiedAt: null,
      },
      {
        activityId: 'act-demo-3',
        title: 'Fontainhas Latin Quarter Heritage & Bakery Walk',
        dayNumber: 3,
        date: 'Day 3',
        time: '10:00 AM',
        duration: '2 Hours',
        travelers,
        price: 550 * travelers,
        status: 'PENDING',
        reference: '',
        verifiedAt: null,
      }
    );
  }

  // Normalize local transport allowance
  const lObj = itineraryData.localTransit || {};
  const localTransport = {
    title: lObj.title || 'Local Mobility Allowance',
    cost: Number(lObj.cost || 2000),
    isAllowance: true,
    notes: lObj.details || 'Included in overall trip cost estimate; does not require separate booking reservation.',
    status: 'INCLUDED',
  };

  const activitiesTotal = activities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const totalCost = transport.price + accommodation.price + activitiesTotal + localTransport.cost;

  const bookingId = generateNumericRef('TA-TRIP');
  const confirmationNumber = bookingId;
  const trackingRef = generateNumericRef('TA-REF');
  const tripTitle = itineraryData.tripTitle || tripDoc?.title || `${duration}-Day ${destination} Journey`;
  const normalizedDays = normalizeItineraryDays(itineraryData.days || tripDoc?.itinerary || [], origin, destination, duration, travelers);

  const bookingItems = [
    { type: 'transport', title: transport.title, provider: transport.provider, cost: transport.price },
    { type: 'accommodation', title: accommodation.name, roomType: accommodation.roomType, cost: accommodation.price },
    ...activities.map(a => ({ type: 'activity', title: a.title, day: a.dayNumber, cost: a.price })),
    { type: 'localTransport', title: localTransport.title, cost: localTransport.cost }
  ];

  const newBooking = await TripBooking.create({
    bookingId,
    confirmationNumber,
    trackingRef,
    tripTitle,
    currency: 'INR',
    tripId: String(tripId),
    userId: tripDoc?.userId || null,
    guestId: tripDoc?.guestId || null,
    status: 'IN_PROGRESS',
    origin,
    destination,
    duration,
    travelers,
    startDate: dates.start,
    endDate: dates.end,
    travelDates: {
      start: dates.start,
      end: dates.end,
    },
    selectedBudgetTier,
    totalCost,
    bookings: {
      transport,
      accommodation,
      activities,
      localTransport,
    },
    bookingItems,
    itinerary: normalizedDays,
    rawItinerarySnapshot: itineraryData,
    optimizationHistory: itineraryData.optimizationHistory || [],
    food: itineraryData.food || null,
    localTransit: lObj,
    payment: {
      status: 'PENDING',
      transactionId: '',
      amount: totalCost,
      method: 'CARD',
      cardholderName: 'Demo Traveler',
      paidAt: null,
      isSimulation: true,
    },
    demoMode: true,
  });

  return newBooking;
}

/**
 * Returns an existing booking session by bookingId, tripId, or _id
 */
export async function getBookingSession(identifier) {
  let booking = await TripBooking.findOne({ bookingId: identifier });
  if (!booking && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    booking = await TripBooking.findById(identifier);
  }
  if (!booking) {
    booking = await TripBooking.findOne({ tripId: identifier }).sort({ updatedAt: -1 });
  }
  return booking;
}

/**
 * Verifies transport and generates TA-FLT-XXXXX
 */
export async function verifyTransport(sessionIdOrBookingId, updates = {}) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }

  if (updates.provider) booking.bookings.transport.provider = updates.provider;
  if (updates.title) booking.bookings.transport.title = updates.title;
  if (updates.departure) booking.bookings.transport.departure = updates.departure;
  if (updates.returnArrival) booking.bookings.transport.returnArrival = updates.returnArrival;
  if (updates.price !== undefined) booking.bookings.transport.price = Number(updates.price);

  if (!booking.bookings.transport.reference) {
    booking.bookings.transport.reference = generateRef('TA-FLT', 5);
  }
  booking.bookings.transport.status = 'VERIFIED';
  booking.bookings.transport.verifiedAt = new Date();

  // Recalculate total cost
  const actTotal = booking.bookings.activities.reduce((s, a) => s + (a.price || 0), 0);
  booking.totalCost = booking.bookings.transport.price + booking.bookings.accommodation.price + actTotal + booking.bookings.localTransport.cost;
  booking.payment.amount = booking.totalCost;

  await booking.save();
  return booking;
}

/**
 * Verifies accommodation and generates TA-HOT-XXXXX
 */
export async function verifyAccommodation(sessionIdOrBookingId, updates = {}) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }

  if (updates.name) booking.bookings.accommodation.name = updates.name;
  if (updates.location) booking.bookings.accommodation.location = updates.location;
  if (updates.roomType) booking.bookings.accommodation.roomType = updates.roomType;
  if (updates.nights !== undefined) booking.bookings.accommodation.nights = Number(updates.nights);
  if (updates.price !== undefined) booking.bookings.accommodation.price = Number(updates.price);

  if (!booking.bookings.accommodation.reference) {
    booking.bookings.accommodation.reference = generateRef('TA-HOT', 5);
  }
  booking.bookings.accommodation.status = 'VERIFIED';
  booking.bookings.accommodation.verifiedAt = new Date();

  // Recalculate total cost
  const actTotal = booking.bookings.activities.reduce((s, a) => s + (a.price || 0), 0);
  booking.totalCost = booking.bookings.transport.price + booking.bookings.accommodation.price + actTotal + booking.bookings.localTransport.cost;
  booking.payment.amount = booking.totalCost;

  await booking.save();
  return booking;
}

/**
 * Verifies an individual activity one by one and generates TA-ACT-XXXXX
 */
export async function verifyActivity(sessionIdOrBookingId, activityIndex, updates = {}) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }

  const idx = Number(activityIndex);
  if (idx < 0 || idx >= booking.bookings.activities.length) {
    throw new Error(`Invalid activity index: ${activityIndex}`);
  }

  const act = booking.bookings.activities[idx];
  if (updates.title) act.title = updates.title;
  if (updates.time) act.time = updates.time;
  if (updates.price !== undefined) act.price = Number(updates.price);

  if (!act.reference) {
    act.reference = generateRef('TA-ACT', 5);
  }
  act.status = 'VERIFIED';
  act.verifiedAt = new Date();

  // Recalculate total cost
  const actTotal = booking.bookings.activities.reduce((s, a) => s + (a.price || 0), 0);
  booking.totalCost = booking.bookings.transport.price + booking.bookings.accommodation.price + actTotal + booking.bookings.localTransport.cost;
  booking.payment.amount = booking.totalCost;

  await booking.save();
  return booking;
}

/**
 * Acknowledges local transport allowance
 */
export async function verifyLocalTransport(sessionIdOrBookingId) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }
  booking.bookings.localTransport.status = 'CONFIRMED';
  await booking.save();
  return booking;
}

/**
 * Processes simulated dummy payment and generates TA-PAY-XXXXXX
 * NEVER STORES CARD OR CVV NUMBERS!
 */
export async function processDummyPayment(sessionIdOrBookingId, paymentData = {}) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }

  // Verify all components are confirmed/verified
  if (booking.bookings.transport.status !== 'VERIFIED' && booking.bookings.transport.status !== 'CONFIRMED') {
    throw new Error('Transport must be verified before payment.');
  }
  if (booking.bookings.accommodation.status !== 'VERIFIED' && booking.bookings.accommodation.status !== 'CONFIRMED') {
    throw new Error('Accommodation must be verified before payment.');
  }
  const unverifiedActivity = booking.bookings.activities.find((a) => a.status !== 'VERIFIED' && a.status !== 'CONFIRMED');
  if (unverifiedActivity) {
    throw new Error(`Activity "${unverifiedActivity.title}" must be verified before payment.`);
  }

  // Generate demo payment transaction
  booking.payment.transactionId = generateNumericRef('TA-PAY');
  booking.payment.status = 'PAID_DEMO';
  booking.payment.amount = booking.totalCost;
  booking.payment.method = paymentData.method === 'UPI' ? 'UPI' : 'CARD';
  booking.payment.cardholderName = paymentData.cardholderName || 'Demo Traveler';
  booking.payment.paidAt = new Date();
  booking.payment.isSimulation = true;

  booking.status = 'PAYMENT_PENDING';
  await booking.save();
  return booking;
}

/**
 * Finalizes all bookings into CONFIRMED state.
 * IDEMPOTENT: If already CONFIRMED, returns existing confirmation immediately.
 * Accepts final snapshotData with full user-modified itinerary.
 */
export async function confirmBooking(sessionIdOrBookingId, snapshotData = {}) {
  const booking = await getBookingSession(sessionIdOrBookingId);
  if (!booking) {
    throw new Error('Booking session not found');
  }

  // Idempotency: return existing confirmed booking without duplicate creation
  if (booking.status === 'CONFIRMED') {
    return booking;
  }

  // Authorize payment if not already marked PAID_DEMO
  if (booking.payment.status !== 'PAID_DEMO') {
    const payData = snapshotData.payment || {};
    booking.payment.status = 'PAID_DEMO';
    booking.payment.transactionId = payData.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    booking.payment.amount = payData.amount || booking.totalCost;
    booking.payment.method = payData.method || 'CARD';
    booking.payment.cardholderName = payData.cardholderName || 'Demo Traveler';
    booking.payment.paidAt = new Date();
    booking.payment.isSimulation = true;
  }

  // Ensure payment transactionId format
  if (!booking.payment.transactionId) {
    booking.payment.transactionId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // Capture final user-modified itinerary snapshot
  const incomingItinerary = snapshotData.itinerary || snapshotData.itinerarySnapshot;
  if (incomingItinerary) {
    booking.rawItinerarySnapshot = incomingItinerary;
    const incomingDays = incomingItinerary.days || (Array.isArray(incomingItinerary) ? incomingItinerary : null);
    if (incomingDays && incomingDays.length > 0) {
      booking.itinerary = normalizeItineraryDays(incomingDays, booking.origin, booking.destination, booking.duration, booking.travelers);
    }
    if (incomingItinerary.tripTitle) {
      booking.tripTitle = incomingItinerary.tripTitle;
    }
    if (incomingItinerary.totalCost) {
      booking.totalCost = Number(incomingItinerary.totalCost);
      booking.payment.amount = booking.totalCost;
    }
    if (incomingItinerary.optimizationHistory) {
      booking.optimizationHistory = incomingItinerary.optimizationHistory;
    }
  }

  // Ensure itinerary is never empty
  if (!booking.itinerary || booking.itinerary.length === 0) {
    if (booking.rawItinerarySnapshot?.days) {
      booking.itinerary = normalizeItineraryDays(booking.rawItinerarySnapshot.days, booking.origin, booking.destination, booking.duration, booking.travelers);
    } else {
      booking.itinerary = normalizeItineraryDays([], booking.origin, booking.destination, booking.duration, booking.travelers);
    }
  }

  if (snapshotData.tripTitle) {
    booking.tripTitle = snapshotData.tripTitle;
  }
  if (snapshotData.optimizationHistory) {
    booking.optimizationHistory = snapshotData.optimizationHistory;
  }

  // Ensure confirmationNumber matches bookingId
  booking.confirmationNumber = booking.confirmationNumber || booking.bookingId;
  booking.currency = booking.currency || 'INR';

  // Confirm all component statuses
  booking.bookings.transport.status = 'CONFIRMED';
  if (!booking.bookings.transport.reference) {
    booking.bookings.transport.reference = generateRef('TA-FLT', 5);
  }
  booking.bookings.accommodation.status = 'CONFIRMED';
  if (!booking.bookings.accommodation.reference) {
    booking.bookings.accommodation.reference = generateRef('TA-HOT', 5);
  }
  booking.bookings.activities.forEach((a) => {
    a.status = 'CONFIRMED';
    if (!a.reference) a.reference = generateRef('TA-ACT', 5);
  });
  booking.bookings.localTransport.status = 'CONFIRMED';

  // Build summary bookingItems array
  booking.bookingItems = [
    {
      category: 'transport',
      title: booking.bookings.transport.title,
      reference: booking.bookings.transport.reference,
      provider: booking.bookings.transport.provider,
      cost: booking.bookings.transport.price,
      status: 'CONFIRMED'
    },
    {
      category: 'accommodation',
      title: booking.bookings.accommodation.name,
      reference: booking.bookings.accommodation.reference,
      roomType: booking.bookings.accommodation.roomType,
      cost: booking.bookings.accommodation.price,
      status: 'CONFIRMED'
    },
    ...booking.bookings.activities.map(a => ({
      category: 'activity',
      title: a.title,
      reference: a.reference,
      day: a.dayNumber,
      cost: a.price,
      status: 'CONFIRMED'
    })),
    {
      category: 'localTransport',
      title: booking.bookings.localTransport.title,
      reference: booking.bookings.localTransport.allowanceReference || 'TA-LOC-INCL',
      cost: booking.bookings.localTransport.cost,
      status: 'INCLUDED'
    }
  ];

  booking.status = 'CONFIRMED';
  booking.confirmedAt = new Date();

  // If tripId is a MongoDB ID, update Trip model status to 'Booked' and link bookingId and snapshot itinerary
  if (booking.tripId && booking.tripId.length === 24) {
    try {
      await Trip.findByIdAndUpdate(booking.tripId, {
        status: 'Booked',
        bookingId: booking.bookingId,
        ...(booking.itinerary && booking.itinerary.length > 0 ? { itinerary: booking.itinerary } : {}),
      });
    } catch {
      // Continue even if parent trip update fails
    }
  }

  await booking.save();
  return booking;
}

/**
 * Returns all confirmed booked trips
 */
export async function getBookedTrips(filter = {}) {
  const query = { status: 'CONFIRMED' };
  if (filter.userId) query.userId = filter.userId;
  if (filter.guestId) query.guestId = filter.guestId;

  const bookings = await TripBooking.find(query).sort({ confirmedAt: -1, createdAt: -1 });
  return bookings.map((b) => {
    const doc = b.toObject ? b.toObject() : b;
    if (!doc.confirmationNumber) doc.confirmationNumber = doc.bookingId;
    if (!doc.itinerary || doc.itinerary.length === 0) {
      if (doc.rawItinerarySnapshot?.days) {
        doc.itinerary = normalizeItineraryDays(doc.rawItinerarySnapshot.days, doc.origin, doc.destination, doc.duration, doc.travelers);
      } else {
        doc.itinerary = normalizeItineraryDays([], doc.origin, doc.destination, doc.duration, doc.travelers);
      }
    }
    return doc;
  });
}

/**
 * Returns a specific booked trip by bookingId or _id
 */
export async function getBookedTripById(bookingId) {
  let booking = await TripBooking.findOne({ bookingId, status: 'CONFIRMED' });
  if (!booking && bookingId.match(/^[0-9a-fA-F]{24}$/)) {
    booking = await TripBooking.findOne({ _id: bookingId, status: 'CONFIRMED' });
  }
  if (!booking) {
    booking = await TripBooking.findOne({ confirmationNumber: bookingId, status: 'CONFIRMED' });
  }
  if (booking) {
    const doc = booking.toObject ? booking.toObject() : booking;
    if (!doc.confirmationNumber) doc.confirmationNumber = doc.bookingId;
    if (!doc.itinerary || doc.itinerary.length === 0) {
      if (doc.rawItinerarySnapshot?.days) {
        doc.itinerary = normalizeItineraryDays(doc.rawItinerarySnapshot.days, doc.origin, doc.destination, doc.duration, doc.travelers);
      } else {
        doc.itinerary = normalizeItineraryDays([], doc.origin, doc.destination, doc.duration, doc.travelers);
      }
    }
    return doc;
  }
  return null;
}

