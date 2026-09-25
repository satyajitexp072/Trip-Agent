/**
 * Deterministic optimization rules engine for Trip Agent.
 * Modifies an existing journey based on preset levers or natural-language prompts.
 */

export const optimizationPresets = [
  {
    id: 'cheaper',
    title: 'Make it cheaper',
    description: 'Optimize accommodation and transport to reduce overall expenditure while preserving key highlights.',
    icon: 'PiggyBank',
    badge: 'Save ~₹4,500'
  },
  {
    id: 'comfortable',
    title: 'Make it more comfortable',
    description: 'Upgrade stays to premier beachfront rooms, add private AC cabs, and eliminate tight connections.',
    icon: 'Sparkles',
    badge: 'Upgrade Comfort'
  },
  {
    id: 'activities',
    title: 'Add more activities',
    description: 'Introduce scuba diving, heritage trails, and boat tours for a packed, thrill-filled itinerary.',
    icon: 'Compass',
    badge: '+2 Experiences'
  },
  {
    id: 'reduce-travel-time',
    title: 'Reduce travel time',
    description: 'Group geographic stops closer together, prioritize direct transfers, and cut down on commute fatigue.',
    icon: 'Clock',
    badge: 'Faster Pace'
  },
  {
    id: 'food',
    title: 'More food experiences',
    description: 'Focus on coastal shacks, chef tasting menus, spice plantations, and artisan breakfast spots.',
    icon: 'Utensils',
    badge: 'Foodie Trail'
  },
  {
    id: 'nature',
    title: 'More nature & relaxation',
    description: 'Trade crowded markets for serene backwaters, turtle nesting beaches, and shaded nature walks.',
    icon: 'Palmtree',
    badge: 'Peaceful'
  },
  {
    id: 'adventure',
    title: 'More adventure',
    description: 'Focus on water sports, clifftop hikes, kayaking, and open sea adventures.',
    icon: 'Flame',
    badge: 'High Thrill'
  }
];

export function applyOptimizationRule(currentItinerary, actionType, customText = '') {
  const cloned = JSON.parse(JSON.stringify(currentItinerary));
  const beforeCost = cloned.totalCost;
  let summaryOfChanges = [];
  let costDelta = 0;

  const normalizedInput = (actionType + ' ' + customText).toLowerCase();

  if (normalizedInput.includes('cheaper') || normalizedInput.includes('budget') || normalizedInput.includes('less cost')) {
    // Make cheaper
    if (cloned.accommodation && cloned.accommodation.costPerNight > 2500) {
      const oldCost = cloned.accommodation.totalCost;
      cloned.accommodation.name = 'Zostel Plus Morjim (Private Beachside Pods)';
      cloned.accommodation.costPerNight = 2400;
      cloned.accommodation.totalCost = cloned.accommodation.costPerNight * cloned.accommodation.nights;
      cloned.accommodation.type = 'Chic Beachside Stay (3-Star)';
      const savedOnStay = oldCost - cloned.accommodation.totalCost;
      costDelta -= savedOnStay;
      summaryOfChanges.push(`Swapped accommodation to Zostel Beachside Pods (Saved ₹${savedOnStay.toLocaleString('en-IN')})`);
    }

    if (cloned.localTransit && cloned.localTransit.cost > 2000) {
      const oldTransit = cloned.localTransit.cost;
      cloned.localTransit.title = 'Self-drive Scooter Rental (4 Days)';
      cloned.localTransit.cost = 2000;
      costDelta -= (oldTransit - 2000);
      summaryOfChanges.push('Changed local transport to self-drive scooter');
    } else {
      costDelta -= 1800;
      summaryOfChanges.push('Replaced commercial water sports with scenic self-guided coastal trails (Saved ₹1,800)');
    }
  } else if (normalizedInput.includes('comfortable') || normalizedInput.includes('luxury') || normalizedInput.includes('upgrade')) {
    // Make comfortable
    if (cloned.accommodation) {
      cloned.accommodation.name = 'Caravela Beach Resort (Oceanfront Deluxe)';
      cloned.accommodation.type = '4-Star Beachfront Resort';
      cloned.accommodation.costPerNight = 5800;
      cloned.accommodation.totalCost = cloned.accommodation.costPerNight * cloned.accommodation.nights;
      costDelta += 4500;
      summaryOfChanges.push('Upgraded stay to 4-Star Caravela Beachfront Resort with sea view');
    }
    if (cloned.localTransit) {
      cloned.localTransit.title = 'Private AC Cab with dedicated chauffeur';
      cloned.localTransit.cost = 5500;
      costDelta += 2500;
      summaryOfChanges.push('Upgraded transport to dedicated AC chauffeur cab');
    }
  } else if (normalizedInput.includes('food') || normalizedInput.includes('culinary') || normalizedInput.includes('dining')) {
    costDelta += 1200;
    summaryOfChanges.push('Added Assagao Spice Garden lunch & craft brewery tasting experience');
    // Inject food experience on Day 2
    if (cloned.days && cloned.days[1]) {
      cloned.days[1].timeline.push({
        time: '04:30 PM',
        type: 'food',
        title: 'Assagao Artisan Bakery & Craft Brewery Tasting',
        duration: '1.5h',
        cost: 1200,
        description: 'Tasting flight of 4 artisanal Goan craft beers paired with local poi sliders.'
      });
    }
  } else if (normalizedInput.includes('nature') || normalizedInput.includes('relax') || normalizedInput.includes('second day')) {
    costDelta -= 600;
    summaryOfChanges.push('Streamlined Day 2 into a tranquil beach hammock & mangrove kayaking afternoon');
    if (cloned.days && cloned.days[1]) {
      cloned.days[1].title = 'Tranquil Nerul River Kayaking & Morjim Sunset';
      cloned.days[1].timeline[0] = {
        time: '10:00 AM',
        type: 'activity',
        title: 'Mangrove River Kayaking in Calm Backwaters',
        duration: '2h',
        cost: 800,
        description: 'Peaceful guided kayak paddle through quiet mangrove tunnels.'
      };
    }
  } else if (normalizedInput.includes('adventure') || normalizedInput.includes('activities') || normalizedInput.includes('scuba')) {
    costDelta += 2800;
    summaryOfChanges.push('Added certified Scuba dive trial session with underwater GoPro video');
    if (cloned.days && cloned.days[2]) {
      cloned.days[2].timeline.unshift({
        time: '07:30 AM',
        type: 'activity',
        title: 'Grand Island Speedboat & Scuba Dive Session',
        duration: '4h',
        cost: 3200,
        description: 'Speedboat cruise to Grand Island with certified PADI dive instructor.'
      });
    }
  } else if (normalizedInput.includes('beach') || normalizedInput.includes('hotel')) {
    summaryOfChanges.push('Relocated hotel choice to 150m from Ashwem Beach shore');
    if (cloned.accommodation) {
      cloned.accommodation.name = 'Rococco Ashwem Beachfront Resort';
      cloned.accommodation.distanceToBeach = '150m from Ashwem Shore';
    }
  } else {
    // Generic custom prompt
    costDelta += 500;
    summaryOfChanges.push(`Adapted itinerary for custom intent: "${customText || actionType}"`);
  }

  cloned.totalCost = Math.max(8000, beforeCost + costDelta);
  cloned.perPersonCost = Math.round(cloned.totalCost / (cloned.travelers || 2));

  return {
    updatedItinerary: cloned,
    beforeCost,
    afterCost: cloned.totalCost,
    costDelta,
    summaryOfChanges: summaryOfChanges.length > 0 ? summaryOfChanges : ['Adjusted timeline flow for optimal comfort and travel duration.'],
  };
}
