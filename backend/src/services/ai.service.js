import { config } from '../config/env.js';

/**
 * Structured TravelIntent Schema specification
 * {
 *   origin: string,
 *   destination: string,
 *   destinationType: 'beach' | 'mountain' | 'heritage' | 'urban' | 'nature' | 'any',
 *   dates: string | null,
 *   duration: number,
 *   travelers: number,
 *   interests: string[],
 *   travelStyle: 'Relaxed' | 'Balanced' | 'Fast-Paced',
 *   transportPreference: 'Flight' | 'Train' | 'Cab' | 'Any',
 *   accommodationPreference: 'Hostel' | 'Boutique Hotel' | 'Beach Resort' | 'Mountain Resort' | 'Luxury Villa',
 *   budget: number | null,
 *   constraints: string[]
 * }
 */

// ----------------------------------------------------------------------------
// MOCK AI PROVIDER: Deterministic NLP Pattern Matcher & Rule Interpreter
// ----------------------------------------------------------------------------
class MockAIProvider {
  /**
   * Extract structured travel intent from natural language
   */
  extractTravelIntent(message = '', currentContext = {}) {
    const text = message.toLowerCase();

    // 1. Origin extraction
    let origin = currentContext.origin || 'Bhubaneswar';
    const fromMatch = message.match(/\bfrom\s+([A-Za-z\s]+?)(?:\s+to|\s+for|\s+with|\s+in|\.|\,|$)/i);
    if (fromMatch && fromMatch[1]) {
      origin = fromMatch[1].trim();
    }

    // 2. Destination & Destination Type
    let destination = currentContext.destination || 'Goa';
    let destinationType = 'beach';

    const destinationsList = [
      { name: 'Goa', type: 'beach', keywords: ['goa', 'beach', 'coastal', 'sea'] },
      { name: 'Puri', type: 'beach', keywords: ['puri', 'jagannath', 'golden beach'] },
      { name: 'Manali', type: 'mountain', keywords: ['manali', 'snow', 'mountains', 'solang', 'himalaya'] },
      { name: 'Darjeeling', type: 'mountain', keywords: ['darjeeling', 'tea', 'tiger hill', 'kanchendzonga'] },
      { name: 'Jaipur', type: 'heritage', keywords: ['jaipur', 'rajasthan', 'palace', 'fort', 'heritage'] },
      { name: 'Hyderabad', type: 'heritage', keywords: ['hyderabad', 'nizami', 'charminar', 'biryani'] },
      { name: 'Bengaluru', type: 'urban', keywords: ['bengaluru', 'bangalore', 'microbreweries'] },
      { name: 'Kolkata', type: 'heritage', keywords: ['kolkata', 'calcutta', 'victoria', 'howrah'] },
    ];

    const toMatch = message.match(/\bto\s+([A-Za-z\s]+?)(?:\s+from|\s+for|\s+with|\s+in|\.|\,|$)/i);
    if (toMatch && toMatch[1]) {
      const candidate = toMatch[1].trim();
      const matched = destinationsList.find((d) => d.name.toLowerCase() === candidate.toLowerCase());
      if (matched) {
        destination = matched.name;
        destinationType = matched.type;
      } else {
        destination = candidate;
      }
    } else {
      for (const dest of destinationsList) {
        if (dest.keywords.some((kw) => text.includes(kw))) {
          destination = dest.name;
          destinationType = dest.type;
          break;
        }
      }
    }

    // 3. Duration extraction (e.g. "I have 5 days", "for 3 days", "4-day")
    let duration = currentContext.duration || currentContext.durationDays || 4;
    const durationMatch = message.match(/\b(\d+)\s*(?:days?|nights?)\b/i) || message.match(/\b(\d+)[ -]day\b/i);
    if (durationMatch && durationMatch[1]) {
      duration = Math.max(1, parseInt(durationMatch[1], 10));
    }

    // 4. Travelers extraction (e.g. "with 3 friends" -> 4 travelers, "for 2 people", "solo" -> 1)
    let travelers = currentContext.travelers || 2;
    const friendsMatch = message.match(/\b(?:with\s+)?(\d+)\s*friends?\b/i);
    if (friendsMatch && friendsMatch[1]) {
      travelers = parseInt(friendsMatch[1], 10) + 1; // User + friends
    } else {
      const travelersMatch = message.match(/\b(\d+)\s*(?:travelers?|people|persons?|adults?)\b/i);
      if (travelersMatch && travelersMatch[1]) {
        travelers = Math.max(1, parseInt(travelersMatch[1], 10));
      } else if (text.includes('solo') || text.includes('by myself') || text.includes('alone')) {
        travelers = 1;
      } else if (text.includes('couple') || text.includes('with my partner') || text.includes('with my wife') || text.includes('with my husband')) {
        travelers = 2;
      }
    }

    // 5. Travel Style
    let travelStyle = currentContext.travelStyle || 'Relaxed';
    if (text.includes('relaxed') || text.includes('chill') || text.includes('peaceful') || text.includes('leisurely')) {
      travelStyle = 'Relaxed';
    } else if (text.includes('fast') || text.includes('packed') || text.includes('active') || text.includes('adventure')) {
      travelStyle = 'Fast-Paced';
    } else if (text.includes('balanced')) {
      travelStyle = 'Balanced';
    }

    // 6. Transport Preference
    let transportPreference = currentContext.transportPreference || 'Any';
    if (text.includes('flight') || text.includes('air') || text.includes('flying')) {
      transportPreference = 'Flight';
    } else if (text.includes('train') || text.includes('railway') || text.includes('sleeper')) {
      transportPreference = 'Train';
    } else if (text.includes('drive') || text.includes('cab') || text.includes('car')) {
      transportPreference = 'Cab';
    }

    // 7. Accommodation Preference
    let accommodationPreference = currentContext.accommodationPreference || 'Boutique Hotel';
    if (text.includes('hostel') || text.includes('backpacker') || text.includes('dorm')) {
      accommodationPreference = 'Hostel';
    } else if (text.includes('resort') || text.includes('beachfront') || text.includes('sea view')) {
      accommodationPreference = 'Beach Resort';
    } else if (text.includes('villa') || text.includes('luxury') || text.includes('5-star')) {
      accommodationPreference = 'Luxury Villa';
    } else if (text.includes('boutique') || text.includes('heritage')) {
      accommodationPreference = 'Boutique Hotel';
    }

    // 8. Budget
    let budget = currentContext.optionalBudget !== undefined ? currentContext.optionalBudget : null;
    if (text.includes("don't know my budget") || text.includes('no budget') || text.includes('not sure about budget') || text.includes('flexible budget')) {
      budget = null;
    } else {
      const budgetMatch = message.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || message.match(/\bbudget\s*(?:of|is|around)?\s*([\d,]+)/i);
      if (budgetMatch && budgetMatch[1]) {
        const parsed = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          budget = parsed;
        }
      }
    }

    // 9. Interests
    const interests = new Set(currentContext.interests || []);
    if (text.includes('beach') || text.includes('ocean') || text.includes('coast')) interests.add('Beaches');
    if (text.includes('food') || text.includes('seafood') || text.includes('culinary') || text.includes('cafes') || text.includes('eat')) interests.add('Food');
    if (text.includes('nightlife') || text.includes('club') || text.includes('party')) interests.add('Nightlife');
    if (text.includes('heritage') || text.includes('history') || text.includes('fort') || text.includes('temple')) interests.add('Culture');
    if (text.includes('adventure') || text.includes('scuba') || text.includes('trek') || text.includes('activities') || text.includes('activity')) interests.add('Adventure');
    if (text.includes('nature') || text.includes('mountain') || text.includes('pine') || text.includes('waterfall')) interests.add('Nature');
    if (text.includes('relaxed') || text.includes('wellness') || text.includes('spa')) interests.add('Relaxed');

    // 10. Constraints
    const constraints = [...(currentContext.constraints || [])];
    if (text.includes("don't reduce") && text.includes('activities')) {
      constraints.push('Preserve all core activities');
    }
    if (text.includes('close to beach') || text.includes('beachfront')) {
      constraints.push('Walking distance to beach');
    }
    if (text.includes('no early morning')) {
      constraints.push('Late starts after 10:00 AM');
    }

    return {
      origin,
      destination,
      destinationType,
      dates: currentContext.dates || null,
      duration,
      travelers,
      interests: Array.from(interests),
      travelStyle,
      transportPreference,
      accommodationPreference,
      budget,
      constraints: Array.from(new Set(constraints)),
    };
  }

  /**
   * Interpret modification request into a structured action
   */
  interpretModification(message = '', currentTripContext = {}) {
    const text = message.toLowerCase();

    // 1. CHEAPER / AFFORDABLE
    if (
      text.includes('cheaper') ||
      text.includes('affordable') ||
      text.includes('save money') ||
      text.includes('cut cost') ||
      text.includes('lower budget') ||
      text.includes('make this cheaper') ||
      text.includes('make it cheaper') ||
      text.includes('less expensive')
    ) {
      const preserveActivities =
        text.includes("don't reduce") ||
        text.includes("don't remove") ||
        text.includes("dont remove") ||
        text.includes("not remove") ||
        text.includes("without removing") ||
        text.includes("keep activities") ||
        text.includes("protect activities") ||
        text.includes("retain activities");

      return {
        action: 'OPTIMIZE_CHEAPER',
        affectedComponent: 'budget',
        parameters: {
          preserveActivities,
          preferHostel: text.includes('hostel') || text.includes('dorm'),
        },
        confidence: 0.95,
        reasoning: preserveActivities
          ? 'User requested to reduce overall cost while preserving key activities.'
          : 'User requested to optimize trip for a more economical budget tier.',
      };
    }

    // 2. COMFORT / UPGRADE
    if (
      text.includes('more comfortable') ||
      text.includes('upgrade') ||
      text.includes('luxury') ||
      text.includes('higher comfort') ||
      text.includes('better stay') ||
      text.includes('more premium') ||
      text.includes('comfort')
    ) {
      return {
        action: 'OPTIMIZE_COMFORT',
        affectedComponent: 'accommodation',
        parameters: {
          upgradeStay: true,
          privateTransit: true,
        },
        confidence: 0.94,
        reasoning: 'User requested an upgrade in comfort, accommodation category, or travel convenience.',
      };
    }

    // 3. HOTEL / ACCOMMODATION REPLACEMENT
    if (
      text.includes('hotel') ||
      text.includes('stay') ||
      text.includes('resort') ||
      text.includes('accommodation') ||
      text.includes('villa') ||
      text.includes('hostel')
    ) {
      if (
        text.includes('replace') ||
        text.includes('change') ||
        text.includes('swap') ||
        text.includes('different') ||
        text.includes('switch') ||
        text.includes('closer')
      ) {
        let preference = 'any';
        if (text.includes('beach') || text.includes('sea view') || text.includes('coast')) preference = 'beachfront';
        if (text.includes('pool')) preference = 'pool';
        if (text.includes('cheaper') || text.includes('budget')) preference = 'budget';

        return {
          action: 'REPLACE_HOTEL',
          affectedComponent: 'accommodation',
          parameters: { preference },
          confidence: 0.92,
          reasoning: `User requested to swap the current hotel (preference: ${preference}).`,
        };
      }
    }

    // 4. ADD ACTIVITIES
    if (
      (text.includes('activity') || text.includes('activities') || text.includes('things to do') || text.includes('sightseeing') || text.includes('experience')) &&
      (text.includes('add') || text.includes('more') || text.includes('include') || text.includes('extra'))
    ) {
      return {
        action: 'ADD_ACTIVITIES',
        affectedComponent: 'activities',
        parameters: {
          category: text.includes('adventure') ? 'Adventure' : text.includes('culture') ? 'Cultural' : 'General',
        },
        confidence: 0.9,
        reasoning: 'User requested to add more curated experiences or sightseeing activities.',
      };
    }

    // 5. ADD LOCAL FOOD / CULINARY
    if (
      text.includes('local food') ||
      text.includes('more food') ||
      text.includes('culinary') ||
      text.includes('seafood') ||
      text.includes('dining') ||
      text.includes('street food') ||
      text.includes('cafes')
    ) {
      return {
        action: 'ADD_FOOD',
        affectedComponent: 'food',
        parameters: {
          preference: text.includes('seafood') ? 'seafood' : text.includes('street') ? 'street-food' : 'curated-cafes',
        },
        confidence: 0.93,
        reasoning: 'User requested an enhanced local food and culinary discovery allowance.',
      };
    }

    // 6. REDUCE TRAVEL TIME / FASTER TRANSIT
    if (
      text.includes('reduce travel time') ||
      text.includes('faster') ||
      text.includes('quicker') ||
      text.includes('speed up travel') ||
      text.includes('too slow')
    ) {
      return {
        action: 'REDUCE_TRAVEL_TIME',
        affectedComponent: 'transport',
        parameters: {
          preferredMode: 'Flight',
        },
        confidence: 0.91,
        reasoning: 'User requested to minimize transit time by switching to faster airline connections.',
      };
    }

    // 7. DURATION UPDATE (e.g. "I have 5 days", "change to 3 days")
    const daysMatch = message.match(/\b(\d+)\s*(?:days?|nights?)\b/i) || message.match(/\b(\d+)[ -]day\b/i);
    if (daysMatch && daysMatch[1]) {
      const days = parseInt(daysMatch[1], 10);
      return {
        action: 'UPDATE_DURATION',
        affectedComponent: 'duration',
        parameters: { duration: days },
        confidence: 0.95,
        reasoning: `User requested to adjust the trip duration to ${days} days.`,
      };
    }

    // 8. TRAVELERS UPDATE (e.g. "traveling with 3 friends", "for 4 people")
    const friendsMatch = message.match(/\b(?:with\s+)?(\d+)\s*friends?\b/i);
    if (friendsMatch && friendsMatch[1]) {
      const count = parseInt(friendsMatch[1], 10) + 1;
      return {
        action: 'UPDATE_TRAVELERS',
        affectedComponent: 'travelers',
        parameters: { travelers: count },
        confidence: 0.95,
        reasoning: `User is traveling with ${friendsMatch[1]} friends (total: ${count} travelers).`,
      };
    }

    // 9. EXPLICIT BUDGET SPECIFICATION
    const budgetMatch = message.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || message.match(/\bbudget\s*(?:of|is|around)?\s*([\d,]+)/i);
    if (budgetMatch && budgetMatch[1]) {
      const target = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      return {
        action: 'SET_BUDGET',
        affectedComponent: 'budget',
        parameters: { targetBudget: target },
        confidence: 0.96,
        reasoning: `User set a specific budget constraint of ₹${target.toLocaleString('en-IN')}.`,
      };
    }

    if (text.includes("don't know my budget") || text.includes('no budget') || text.includes('not sure of budget')) {
      return {
        action: 'EXPLORE_BUDGET',
        affectedComponent: 'budget',
        parameters: {},
        confidence: 0.95,
        reasoning: 'User does not know their budget; initiate budget discovery across all 4 tiers.',
      };
    }

    // Default: General conversational inquiry
    return {
      action: 'GENERAL_QUERY',
      affectedComponent: 'general',
      parameters: { query: message },
      confidence: 0.75,
      reasoning: 'Conversational travel question or advice request.',
    };
  }

  /**
   * Generate an explainable journey narrative
   */
  generateJourneyExplanation(itinerary = {}, tier = 'Best Value', constraints = []) {
    const destination = itinerary.destination || 'Goa';
    const duration = itinerary.duration || itinerary.durationDays || 4;
    const travelers = itinerary.travelers || 2;
    const totalCost = itinerary.totalCost || 36500;

    return `This ${duration}-day journey in ${destination} is structured around the **${tier}** tier (₹${totalCost.toLocaleString('en-IN')} total for ${travelers} travelers). We've balanced high-priority activities with unhurried mornings, ensuring direct connections and handpicked accommodations.`;
  }

  /**
   * Generate a warm, contextual conversational response following an operation
   */
  generateConversationalResponse(message, operationResult = {}, currentTripContext = {}) {
    const { action, affectedComponent, delta, summary, details } = operationResult;

    switch (action) {
      case 'OPTIMIZE_CHEAPER':
        if (delta && delta < 0) {
          return `I've optimized your itinerary for greater economy. By selecting high-value boutique transit and stay options, we saved **₹${Math.abs(delta).toLocaleString('en-IN')}** while preserving all your planned core experiences!`;
        }
        return `I've reviewed your plan and adjusted the accommodation and transit benchmarks to save costs without compromising trip safety or enjoyment.`;

      case 'OPTIMIZE_COMFORT':
        return `I've upgraded your itinerary to a higher comfort tier! Your stay is now moved to an oceanfront resort, and private air-conditioned transit has been added for all days.`;

      case 'REPLACE_HOTEL':
        if (details && details.hotelName) {
          const deltaText = delta !== undefined
            ? delta < 0
              ? ` (saving ₹${Math.abs(delta).toLocaleString('en-IN')})`
              : delta > 0
              ? ` (+₹${delta.toLocaleString('en-IN')})`
              : ' (at the same rate)'
            : '';
          return `I've swapped your accommodation to **${details.hotelName}**${deltaText}. Your schedule and day-by-day activities remain intact.`;
        }
        return `I've updated your accommodation with an alternative boutique stay closer to your preferred areas.`;

      case 'ADD_ACTIVITIES':
        return `I've enriched your itinerary with top-rated local activities matched to your interests, scheduled during convenient open afternoon slots!`;

      case 'ADD_FOOD':
        return `I've expanded your culinary budget and embedded curated recommendations for iconic beach shacks, seafood bistros, and authentic dining spots.`;

      case 'REDUCE_TRAVEL_TIME':
        return `I've prioritized the fastest available airline routes to minimize travel time, giving you more hours to relax at your destination.`;

      case 'UPDATE_DURATION':
        return `I've updated your trip duration to **${details?.duration || 4} days** and recalculated the stay nights and daily budget allocations accordingly.`;

      case 'UPDATE_TRAVELERS':
        return `I've adjusted the itinerary for **${details?.travelers || 2} travelers**, recalculating room counts and shared transit costs deterministically.`;

      case 'SET_BUDGET':
        return `I've analyzed your target budget constraint of **₹${details?.targetBudget?.toLocaleString('en-IN')}** and aligned the best-fitting journey tier and service options to stay within your ceiling.`;

      case 'EXPLORE_BUDGET':
        return `No problem! In Trip Agent, budget is an output, not a requirement. I've computed realistic estimates across four distinct tiers (Cheapest, Best Value, Comfortable, and Premium) so you can compare trade-offs directly.`;

      default:
        return `I'm here to help plan and fine-tune your journey! You can ask me to make it cheaper, change the hotel, add activities, or optimize around a specific budget anytime.`;
    }
  }
}

// ----------------------------------------------------------------------------
// GEMINI AI PROVIDER: Calls Google Gemini API when GEMINI_API_KEY is configured
// ----------------------------------------------------------------------------
class GeminiAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = null;
    this.fallback = new MockAIProvider();
  }

  async getClient() {
    if (!this.client) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('[GeminiAIProvider] Failed to load @google/genai SDK, falling back to mock provider:', err.message);
      }
    }
    return this.client;
  }

  async extractTravelIntent(message, currentContext) {
    try {
      const client = await this.getClient();
      if (!client) return this.fallback.extractTravelIntent(message, currentContext);

      const prompt = `You are the travel intent parser for Trip Agent.
Analyze this user travel request and extract the structured intent as a JSON object matching this schema:
{
  "origin": string (default "Bhubaneswar" if not mentioned),
  "destination": string (default "Goa" if not mentioned),
  "destinationType": "beach" | "mountain" | "heritage" | "urban" | "nature" | "any",
  "duration": integer (positive number of days, default 4),
  "travelers": integer (positive number of travelers, default 2; "with 3 friends" means 4 travelers),
  "interests": array of strings (e.g. ["Beaches", "Food", "Relaxed"]),
  "travelStyle": "Relaxed" | "Balanced" | "Fast-Paced",
  "transportPreference": "Flight" | "Train" | "Cab" | "Any",
  "accommodationPreference": "Hostel" | "Boutique Hotel" | "Beach Resort" | "Mountain Resort" | "Luxury Villa",
  "budget": integer or null (null if user says "don't know my budget" or doesn't mention one),
  "constraints": array of strings
}

User Message: "${message}"
Current Context: ${JSON.stringify(currentContext)}

Return ONLY valid JSON.`;

      const response = await client.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const text = response.output_text?.trim() || '';
      const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[GeminiAIProvider] extractTravelIntent error, falling back to mock:', err.message);
      return this.fallback.extractTravelIntent(message, currentContext);
    }
  }

  async interpretModification(message, currentTripContext) {
    try {
      const client = await this.getClient();
      if (!client) return this.fallback.interpretModification(message, currentTripContext);

      const prompt = `You are the modification interpreter for Trip Agent.
The user wants to modify their existing trip. Do NOT generate a whole new trip.
Identify which single component or constraint is affected and choose the appropriate structured operation.

Allowed actions:
- OPTIMIZE_CHEAPER (for "make it cheaper", "affordable", "save money")
- OPTIMIZE_COMFORT (for "more comfortable", "upgrade", "luxury")
- REPLACE_HOTEL (for "change the hotel", "replace stay", "closer to beach")
- ADD_ACTIVITIES (for "add more activities", "things to do")
- ADD_FOOD (for "add more local food", "more dining")
- REDUCE_TRAVEL_TIME (for "reduce travel time", "faster way")
- UPDATE_DURATION (for "I have 5 days", "make it 3 days")
- UPDATE_TRAVELERS (for "traveling with 3 friends", "for 4 people")
- SET_BUDGET (for explicit budget constraints like "budget is 40000")
- EXPLORE_BUDGET (for "don't know my budget")
- GENERAL_QUERY (general advice)

Return ONLY valid JSON matching:
{
  "action": string,
  "affectedComponent": "budget" | "accommodation" | "activities" | "food" | "transport" | "duration" | "travelers" | "general",
  "parameters": {
    "preserveActivities": boolean,
    "targetBudget": integer or null,
    "duration": integer or null,
    "travelers": integer or null,
    "preference": string or null
  },
  "confidence": number between 0 and 1,
  "reasoning": string
}

User Message: "${message}"
Current Trip Context: ${JSON.stringify(currentTripContext)}
`;

      const response = await client.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const text = response.output_text?.trim() || '';
      const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[GeminiAIProvider] interpretModification error, falling back to mock:', err.message);
      return this.fallback.interpretModification(message, currentTripContext);
    }
  }

  generateJourneyExplanation(itinerary, tier, constraints) {
    return this.fallback.generateJourneyExplanation(itinerary, tier, constraints);
  }

  generateConversationalResponse(message, operationResult, currentTripContext) {
    return this.fallback.generateConversationalResponse(message, operationResult, currentTripContext);
  }
}

// ----------------------------------------------------------------------------
// AI SERVICE FACTORY & EXPORT
// ----------------------------------------------------------------------------
const createAIService = () => {
  const isGemini = config.llm.provider === 'gemini' && Boolean(config.llm.geminiApiKey);

  if (isGemini) {
    console.log('[AIService] Initializing with Gemini AI Provider');
    return new GeminiAIProvider(config.llm.geminiApiKey);
  }

  console.log('[AIService] Initializing with Mock AI Provider (Deterministic NLP Engine)');
  return new MockAIProvider();
};

export const aiService = createAIService();
export { MockAIProvider, GeminiAIProvider };
export default aiService;
