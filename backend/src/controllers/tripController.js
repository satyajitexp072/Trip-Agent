import { Trip } from '../models/Trip.js';
import { calculateBudgetEstimate } from '../services/budgetEstimator.service.js';
import { optimizeJourney } from '../services/optimization.service.js';

export const createTrip = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      duration,
      travelers,
      interests,
      travelStyle,
      transportPreference,
      accommodationPreference,
      optionalBudget,
      selectedBudgetTier,
      budgetEstimate,
      itinerary,
      title,
      summary,
      status,
      userId,
      guestId,
    } = req.body;

    // Validation
    if (!origin || !origin.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Origin is required.',
      });
    }

    if (!destination || !destination.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Destination is required.',
      });
    }

    const numDuration = Number(duration);
    if (!numDuration || numDuration <= 0 || !Number.isInteger(numDuration)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Duration must be a positive whole number of at least 1 day.',
      });
    }

    const numTravelers = Number(travelers);
    if (!numTravelers || numTravelers <= 0 || !Number.isInteger(numTravelers)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Travelers must be a positive whole number of at least 1.',
      });
    }

    const trip = await Trip.create({
      origin: origin.trim(),
      destination: destination.trim(),
      duration: numDuration,
      travelers: numTravelers,
      interests: Array.isArray(interests) ? interests : [],
      travelStyle: travelStyle || 'Relaxed',
      transportPreference: transportPreference || 'Any',
      accommodationPreference: accommodationPreference || 'Boutique Hotel',
      optionalBudget: optionalBudget !== undefined && optionalBudget !== '' ? Number(optionalBudget) : null,
      selectedBudgetTier: selectedBudgetTier || 'bestValue',
      budgetEstimate: budgetEstimate || null,
      itinerary: Array.isArray(itinerary)
        ? itinerary
        : (Array.isArray(itinerary?.days) ? itinerary.days : []),
      title: title || `${numDuration}-Day ${destination.trim()} Journey`,
      summary: summary || '',
      status: status || 'Draft',
      userId: userId || null,
      guestId: guestId || null,
    });

    return res.status(201).json({
      status: 'success',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const { userId, guestId, status } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (guestId) query.guestId = guestId;
    if (status) query.status = status;

    const trips = await Trip.find(query).sort({ updatedAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Trip ID format.',
      });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        status: 'fail',
        message: `Trip with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Trip ID format.',
      });
    }

    // If duration or travelers are updated, validate they are positive whole numbers
    if (req.body.duration !== undefined) {
      const numDuration = Number(req.body.duration);
      if (!numDuration || numDuration <= 0 || !Number.isInteger(numDuration)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Duration must be a positive whole number of at least 1 day.',
        });
      }
      req.body.duration = numDuration;
    }

    if (req.body.travelers !== undefined) {
      const numTravelers = Number(req.body.travelers);
      if (!numTravelers || numTravelers <= 0 || !Number.isInteger(numTravelers)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Travelers must be a positive whole number of at least 1.',
        });
      }
      req.body.travelers = numTravelers;
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({
        status: 'fail',
        message: `Trip with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Trip ID format.',
      });
    }

    const deleted = await Trip.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: `Trip with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Trip deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ad-hoc budget discovery estimation
 * Computes realistic costs across all 4 tiers without requiring an existing Trip document.
 */
export const calculateAdHocEstimate = async (req, res, next) => {
  try {
    const {
      origin = 'Bhubaneswar',
      destination = 'Goa',
      duration = 4,
      travelers = 2,
      optionalBudget = null,
      travelStyle = 'Relaxed',
      interests = [],
    } = req.body;

    const estimate = await calculateBudgetEstimate({
      origin,
      destination,
      duration,
      travelers,
      optionalBudget,
      travelStyle,
      interests,
    });

    return res.status(200).json({
      status: 'success',
      data: estimate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and persist budget estimate for a specific trip
 */
export const generateBudgetEstimate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Trip ID format.',
      });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        status: 'fail',
        message: `Trip with ID ${id} not found.`,
      });
    }

    const requirements = {
      origin: req.body.origin || trip.origin,
      destination: req.body.destination || trip.destination,
      duration: req.body.duration || trip.duration,
      travelers: req.body.travelers || trip.travelers,
      optionalBudget: req.body.optionalBudget !== undefined ? req.body.optionalBudget : trip.optionalBudget,
      travelStyle: req.body.travelStyle || trip.travelStyle,
      interests: req.body.interests || trip.interests,
    };

    const estimate = await calculateBudgetEstimate(requirements);

    trip.budgetEstimate = estimate;
    if (req.body.optionalBudget !== undefined) {
      trip.optionalBudget = req.body.optionalBudget ? Number(req.body.optionalBudget) : null;
    }
    await trip.save();

    return res.status(200).json({
      status: 'success',
      data: trip,
      estimate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Select active budget tier for a trip
 */
export const selectTripTier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Trip ID format.',
      });
    }

    if (!tier) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tier is required.',
      });
    }

    // Normalize hyphenated or mixed case to camelCase
    const normalizedKey = String(tier).toLowerCase().replace(/[\s_-]+/g, '');
    const tierMap = {
      cheapest: 'cheapest',
      bestvalue: 'bestValue',
      comfortable: 'comfortable',
      premium: 'premium',
    };

    const normalizedTier = tierMap[normalizedKey];
    if (!normalizedTier) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid tier '${tier}'. Must be one of: cheapest, bestValue, comfortable, premium.`,
      });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        status: 'fail',
        message: `Trip with ID ${id} not found.`,
      });
    }

    trip.selectedBudgetTier = normalizedTier;
    await trip.save();

    return res.status(200).json({
      status: 'success',
      message: `Tier '${normalizedTier}' selected successfully.`,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Journey Optimization Endpoint
 * Handles POST /api/trips/:id/optimize and POST /api/trips/optimize
 */
export const optimizeTripEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      objective = 'REDUCE_COST',
      customText = '',
      protectedItems = [],
      customWeights = null,
      tripState = null,
    } = req.body;

    let baseTrip = null;
    let dbTrip = null;

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      dbTrip = await Trip.findById(id);
      if (dbTrip) {
        baseTrip = dbTrip.toObject();
      }
    }

    if (!baseTrip) {
      baseTrip = tripState || req.body.trip || {
        origin: 'Bhubaneswar',
        destination: 'Goa',
        duration: 4,
        travelers: 2,
        totalCost: 36500,
        selectedBudgetTier: 'bestValue',
        accommodation: {
          name: 'BloomSuites Boutique & Spa, Calangute',
          costPerNight: 3300,
          totalCost: 9900,
          category: 'Boutique Hotel',
        },
        transport: {
          provider: 'IndiGo Airlines',
          mode: 'Flight',
          totalCost: 11800,
        },
        localTransit: {
          title: 'Dedicated App Cabs',
          cost: 2400,
        },
        days: [
          {
            day: 1,
            timeline: [
              { title: 'Airport Arrival & Calangute Check-in', type: 'transit' },
              { title: 'Sunset Catamaran Cruise', type: 'activity' },
            ],
          },
          {
            day: 2,
            timeline: [
              { title: 'Scuba Diving Trial & Snorkeling', type: 'activity' },
              { title: 'Beach Shack Seafood Dinner', type: 'food' },
            ],
          },
          {
            day: 3,
            timeline: [
              { title: 'Assagao Portuguese Heritage Walk', type: 'activity' },
            ],
          },
          {
            day: 4,
            timeline: [
              { title: 'Anjuna Flea Market & Return Flight', type: 'activity' },
            ],
          },
        ],
      };
    }

    const optimizationResult = await optimizeJourney(baseTrip, {
      objective,
      customText,
      protectedItems,
      customWeights,
    });

    // If persisted in DB, save selective updates
    if (dbTrip && optimizationResult.updatedJourney) {
      const u = optimizationResult.updatedJourney;
      if (u.totalCost) dbTrip.totalCost = u.totalCost;
      if (u.selectedBudgetTier) dbTrip.selectedBudgetTier = u.selectedBudgetTier;
      await dbTrip.save();
    }

    return res.status(200).json({
      status: 'success',
      data: optimizationResult,
    });
  } catch (error) {
    next(error);
  }
};


