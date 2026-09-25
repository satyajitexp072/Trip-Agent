/**
 * Mock & Seed travel data for deterministic demo mode
 */
export const mockDestinations = [
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    tags: ['beaches', 'nightlife', 'seafood', 'relaxation'],
    typicalDailyCostINR: {
      budget: 2000,
      moderate: 4500,
      luxury: 12000
    }
  },
  {
    id: 'manali',
    name: 'Manali, Himachal Pradesh',
    country: 'India',
    tags: ['mountains', 'snow', 'trekking', 'cafes'],
    typicalDailyCostINR: {
      budget: 1800,
      moderate: 3800,
      luxury: 9500
    }
  },
  {
    id: 'kerala',
    name: 'Munnar & Alleppey, Kerala',
    country: 'India',
    tags: ['backwaters', 'nature', 'tea plantations', 'ayurveda'],
    typicalDailyCostINR: {
      budget: 2200,
      moderate: 4800,
      luxury: 14000
    }
  }
];
