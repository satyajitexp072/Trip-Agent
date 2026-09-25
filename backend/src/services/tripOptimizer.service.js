import { AccommodationOption } from '../models/AccommodationOption.js';
import { ActivityOption } from '../models/ActivityOption.js';
import { TransportOption } from '../models/TransportOption.js';
import { calculateBudgetEstimate } from './budgetEstimator.service.js';

/**
 * Deterministic Trip Optimizer Service
 * Performs surgical modifications to specific trip components without blindly regenerating the whole journey.
 */
export const executeTripModification = async (currentTrip, interpretation) => {
  const { action, affectedComponent, parameters = {} } = interpretation;
  const trip = JSON.parse(JSON.stringify(currentTrip));

  const duration = Math.max(1, Number(trip.duration || trip.durationDays || 4));
  const travelers = Math.max(1, Number(trip.travelers || 2));
  const nights = Math.max(1, duration - 1);
  const roomsNeeded = Math.ceil(travelers / 2);
  const destination = trip.destination || 'Goa';

  let delta = 0;
  let details = {};
  let summary = '';

  switch (action) {
    // ------------------------------------------------------------------------
    // 1. HOTEL REPLACEMENT
    // ------------------------------------------------------------------------
    case 'REPLACE_HOTEL': {
      let alternatives = [];
      try {
        alternatives = await AccommodationOption.find({
          destination: { $regex: destination, $options: 'i' },
        });
      } catch (err) {
        console.warn('[TripOptimizer] Accommodation query fallback:', err.message);
      }

      if (!alternatives || alternatives.length === 0) {
        alternatives = [
          { name: 'BloomSuites Boutique & Spa, Calangute', pricePerNight: 3300, category: 'Boutique Hotel' },
          { name: 'Caravela Beach Resort, Varca Beach', pricePerNight: 6800, category: 'Beach Resort' },
          { name: 'The Funky Monkey Hostel, Anjuna', pricePerNight: 1200, category: 'Hostel' },
        ];
      }

      // Pick an alternative hotel different from current
      const currentHotelName = trip.accommodation?.name || '';
      let picked = alternatives.find((a) => a.name !== currentHotelName);
      if (!picked) picked = alternatives[0];

      const oldPerNight = trip.accommodation?.costPerNight || 3500;
      const newPerNight = picked.pricePerNight;
      const oldStayTotal = trip.accommodation?.totalCost || (oldPerNight * nights * roomsNeeded);
      const newStayTotal = newPerNight * nights * roomsNeeded;

      delta = newStayTotal - oldStayTotal;

      if (!trip.accommodation) trip.accommodation = {};
      trip.accommodation.name = picked.name;
      trip.accommodation.type = picked.category;
      trip.accommodation.costPerNight = newPerNight;
      trip.accommodation.totalCost = newStayTotal;
      trip.accommodation.nights = nights;

      trip.totalCost = Math.max(1000, (trip.totalCost || 36500) + delta);
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      details = {
        oldHotel: currentHotelName || 'Previous Hotel',
        hotelName: picked.name,
        pricePerNight: newPerNight,
        totalStayCost: newStayTotal,
      };
      summary = `Swapped hotel to ${picked.name} (₹${newPerNight}/night).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 2. MAKE IT CHEAPER (WITH OR WITHOUT PRESERVING ACTIVITIES)
    // ------------------------------------------------------------------------
    case 'OPTIMIZE_CHEAPER': {
      const preserveActivities = Boolean(parameters.preserveActivities);

      // Save on lodging: switch to high-value boutique or hostel dorm
      let budgetStayPrice = parameters.preferHostel ? 1200 : 2500;
      let stayName = parameters.preferHostel ? 'The Funky Monkey Social Hostel' : 'Bloom Boutique Villa Stay';

      const oldStayCost = trip.accommodation?.totalCost || (3500 * nights * roomsNeeded);
      const newStayCost = budgetStayPrice * nights * (parameters.preferHostel ? travelers : roomsNeeded);
      const stayDelta = newStayCost - oldStayCost;

      // Save on local mobility: switch to rented scooter
      const oldLocalTransit = trip.localTransitCost || (1200 * duration);
      const newLocalTransit = 450 * duration;
      const transitDelta = newLocalTransit - oldLocalTransit;

      // Activity cost delta: if preserveActivities is FALSE, drop optional luxury excursions
      let activityDelta = 0;
      if (!preserveActivities && trip.activityCost && trip.activityCost > 1500) {
        activityDelta = -Math.round(trip.activityCost * 0.4);
      }

      delta = stayDelta + transitDelta + activityDelta;

      if (!trip.accommodation) trip.accommodation = {};
      trip.accommodation.name = stayName;
      trip.accommodation.costPerNight = budgetStayPrice;
      trip.accommodation.totalCost = newStayCost;

      trip.localTransitCost = newLocalTransit;
      if (trip.activityCost) {
        trip.activityCost += activityDelta;
      }

      trip.totalCost = Math.max(1000, (trip.totalCost || 36500) + delta);
      trip.perPersonCost = Math.round(trip.totalCost / travelers);
      trip.selectedBudgetTier = parameters.preferHostel ? 'cheapest' : 'bestValue';

      details = {
        preserveActivities,
        savings: Math.abs(delta),
        newStay: stayName,
      };
      summary = preserveActivities
        ? `Optimized lodging and local transit while keeping all ${trip.itinerary?.length || 4} day activities intact (saved ₹${Math.abs(delta).toLocaleString('en-IN')}).`
        : `Economized stay, transit, and optional excursions (saved ₹${Math.abs(delta).toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 3. MORE COMFORTABLE / UPGRADE
    // ------------------------------------------------------------------------
    case 'OPTIMIZE_COMFORT': {
      const upgradeStayPrice = 7200;
      const upgradeStayName = 'Caravela Beach Resort (Ocean View)';

      const oldStayCost = trip.accommodation?.totalCost || (3300 * nights * roomsNeeded);
      const newStayCost = upgradeStayPrice * nights * roomsNeeded;
      const stayDelta = newStayCost - oldStayCost;

      // Add dedicated private chauffeur
      const oldTransit = trip.localTransitCost || (600 * duration);
      const newTransit = 1800 * duration;
      const transitDelta = newTransit - oldTransit;

      delta = stayDelta + transitDelta;

      if (!trip.accommodation) trip.accommodation = {};
      trip.accommodation.name = upgradeStayName;
      trip.accommodation.type = 'Beach Resort';
      trip.accommodation.costPerNight = upgradeStayPrice;
      trip.accommodation.totalCost = newStayCost;

      trip.localTransitCost = newTransit;
      trip.totalCost = (trip.totalCost || 36500) + delta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);
      trip.selectedBudgetTier = 'comfortable';

      details = {
        newStay: upgradeStayName,
        transit: 'Dedicated Private AC Sedan with Chauffeur',
      };
      summary = `Upgraded to ${upgradeStayName} with dedicated private chauffeur (+₹${delta.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 4. ADD MORE ACTIVITIES
    // ------------------------------------------------------------------------
    case 'ADD_ACTIVITIES': {
      let activities = [];
      try {
        activities = await ActivityOption.find({
          destination: { $regex: destination, $options: 'i' },
        });
      } catch (err) {
        console.warn('[TripOptimizer] Activity query fallback:', err.message);
      }

      if (!activities || activities.length === 0) {
        activities = [
          { title: 'Mandovi River Sunset Catamaran Cruise', price: 950, category: 'Cruise' },
          { title: 'Guided Assagao Heritage & Portuguese Architecture Walk', price: 600, category: 'Cultural' },
          { title: 'Scuba Diving Trial & Coral Reef Snorkeling', price: 2800, category: 'Adventure' },
        ];
      }

      const newActivity = activities[0];
      const activityCostAdded = newActivity.price * travelers;
      delta = activityCostAdded;

      // Insert into day 2 or day 3 of itinerary if structured days exist
      if (Array.isArray(trip.itinerary) && trip.itinerary.length >= 2) {
        const targetDay = trip.itinerary[1]; // Day 2
        if (targetDay.items) {
          targetDay.items.push({
            dayNumber: targetDay.day || 2,
            type: 'Activity',
            title: newActivity.title,
            description: 'Curated experience added via AI assistant recommendation.',
            estimatedCost: newActivity.price,
            category: newActivity.category || 'Sightseeing',
          });
        }
      }

      trip.activityCost = (trip.activityCost || 2400) + activityCostAdded;
      trip.totalCost = (trip.totalCost || 36500) + delta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      details = {
        activityName: newActivity.title,
        pricePerPerson: newActivity.price,
        totalCostAdded: activityCostAdded,
      };
      summary = `Added '${newActivity.title}' (+₹${activityCostAdded.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 5. ADD MORE LOCAL FOOD / DINING
    // ------------------------------------------------------------------------
    case 'ADD_FOOD': {
      const foodBoostPerDayPerPerson = 600;
      const totalFoodBoost = foodBoostPerDayPerPerson * duration * travelers;
      delta = totalFoodBoost;

      trip.foodCost = (trip.foodCost || (1200 * duration * travelers)) + totalFoodBoost;
      trip.totalCost = (trip.totalCost || 36500) + delta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      details = {
        dailyAllowanceIncrease: foodBoostPerDayPerPerson,
        totalBoost: totalFoodBoost,
      };
      summary = `Expanded daily culinary allowance by ₹${foodBoostPerDayPerPerson}/day/traveler for beach shacks and seafood bistros (+₹${totalFoodBoost.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 6. REDUCE TRAVEL TIME / FASTER FLIGHT
    // ------------------------------------------------------------------------
    case 'REDUCE_TRAVEL_TIME': {
      const oldTransitCost = trip.transport?.totalCost || (2200 * travelers);
      const fastFlightPricePerPerson = 5900;
      const newTransitCost = fastFlightPricePerPerson * travelers;
      delta = newTransitCost - oldTransitCost;

      if (!trip.transport) trip.transport = {};
      trip.transport.mode = 'Flight';
      trip.transport.provider = 'IndiGo Airlines (Non-stop)';
      trip.transport.duration = '2h 35m';
      trip.transport.totalCost = newTransitCost;

      trip.totalCost = (trip.totalCost || 36500) + delta;
      trip.perPersonCost = Math.round(trip.totalCost / travelers);

      details = {
        newMode: 'Non-stop Direct Flight',
        timeSaved: 'Up to 22 hours over train/bus',
        newCost: newTransitCost,
      };
      summary = `Switched to non-stop direct flight (2h 35m transit), saving over 20 hours of travel time (+₹${delta.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 7. DURATION ADJUSTMENT
    // ------------------------------------------------------------------------
    case 'UPDATE_DURATION': {
      const newDuration = Math.max(1, Number(parameters.duration || 4));
      const oldDuration = duration;
      trip.duration = newDuration;
      trip.durationDays = newDuration;

      // Recalculate deterministic estimates
      const estimate = await calculateBudgetEstimate({
        origin: trip.origin || 'Bhubaneswar',
        destination: trip.destination || 'Goa',
        duration: newDuration,
        travelers,
        optionalBudget: trip.optionalBudget,
      });

      const tierKey = trip.selectedBudgetTier || 'bestValue';
      const selectedTierData = estimate[tierKey] || estimate.bestValue;

      delta = selectedTierData.total - (trip.totalCost || 36500);
      trip.totalCost = selectedTierData.total;
      trip.perPersonCost = selectedTierData.perPerson;
      trip.budgetEstimate = estimate;

      details = {
        oldDuration,
        duration: newDuration,
        newTotal: selectedTierData.total,
      };
      summary = `Adjusted trip duration from ${oldDuration} days to ${newDuration} days (new total: ₹${selectedTierData.total.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 8. TRAVELERS ADJUSTMENT
    // ------------------------------------------------------------------------
    case 'UPDATE_TRAVELERS': {
      const newTravelers = Math.max(1, Number(parameters.travelers || 2));
      const oldTravelers = travelers;
      trip.travelers = newTravelers;

      const estimate = await calculateBudgetEstimate({
        origin: trip.origin || 'Bhubaneswar',
        destination: trip.destination || 'Goa',
        duration,
        travelers: newTravelers,
        optionalBudget: trip.optionalBudget,
      });

      const tierKey = trip.selectedBudgetTier || 'bestValue';
      const selectedTierData = estimate[tierKey] || estimate.bestValue;

      delta = selectedTierData.total - (trip.totalCost || 36500);
      trip.totalCost = selectedTierData.total;
      trip.perPersonCost = selectedTierData.perPerson;
      trip.budgetEstimate = estimate;

      details = {
        oldTravelers,
        travelers: newTravelers,
        newPerPerson: selectedTierData.perPerson,
      };
      summary = `Updated group size from ${oldTravelers} to ${newTravelers} travelers (₹${selectedTierData.perPerson.toLocaleString('en-IN')} / person).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 9. SET TARGET BUDGET CONSTRAINT
    // ------------------------------------------------------------------------
    case 'SET_BUDGET': {
      const targetBudget = Number(parameters.targetBudget || 40000);
      trip.optionalBudget = targetBudget;

      const estimate = await calculateBudgetEstimate({
        origin: trip.origin || 'Bhubaneswar',
        destination: trip.destination || 'Goa',
        duration,
        travelers,
        optionalBudget: targetBudget,
      });

      const recKey = estimate.constraintAnalysis?.recommendedTierKey || 'bestValue';
      trip.selectedBudgetTier = recKey;
      const recTier = estimate[recKey] || estimate.bestValue;

      delta = recTier.total - (trip.totalCost || 36500);
      trip.totalCost = recTier.total;
      trip.perPersonCost = recTier.perPerson;
      trip.budgetEstimate = estimate;

      details = {
        targetBudget,
        recommendedTier: recTier.tier,
        diff: estimate.constraintAnalysis?.diff,
      };
      summary = `Constrained to ₹${targetBudget.toLocaleString('en-IN')}: selected ${recTier.tier} tier (₹${recTier.total.toLocaleString('en-IN')}).`;
      break;
    }

    // ------------------------------------------------------------------------
    // 10. EXPLORE BUDGET / GENERAL QUERY
    // ------------------------------------------------------------------------
    case 'EXPLORE_BUDGET':
    default: {
      summary = 'Analyzed trip context and current options.';
      break;
    }
  }

  return {
    action,
    affectedComponent: affectedComponent || 'general',
    delta,
    details,
    summary,
    updatedTrip: trip,
  };
};
