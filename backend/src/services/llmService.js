import { config } from '../config/env.js';

/**
 * LLM Provider Abstraction Layer
 * Supports mock mode by default, and can switch to Gemini/OpenAI when API keys are configured.
 */
export class LLMService {
  constructor() {
    this.provider = config.llm.provider;
  }

  /**
   * Generates travel estimates and tier recommendations.
   * Uses deterministic fallback if no API key is supplied.
   */
  async generateEstimate(intent) {
    if (this.provider === 'mock' || (!config.llm.openaiApiKey && !config.llm.geminiApiKey)) {
      return this._mockEstimateResponse(intent);
    }

    // Future LLM provider integration hooks (Gemini / OpenAI)
    // For now, gracefully fall back to mock data
    return this._mockEstimateResponse(intent);
  }

  _mockEstimateResponse(intent) {
    return {
      source: 'deterministic-mock',
      intent: intent || 'Travel intent placeholder',
      tiers: {
        cheapest: {
          tier: 'Cheapest',
          estimatedCost: 8500,
          currency: 'INR',
          description: 'Budget-friendly transit, clean hostels/guesthouses, local street food & transit.',
          highlights: ['Hostel stays', 'Public transit & sleeper train/bus', 'Self-guided beach walks']
        },
        bestValue: {
          tier: 'Best Value',
          estimatedCost: 15500,
          currency: 'INR',
          description: 'Balanced comfort with 3-star boutique stays, cab rides, and popular cafes.',
          highlights: ['Boutique 3-star hotel', 'Rented scooter / rideshare', 'Curated cafe hopping & water activities']
        },
        comfortable: {
          tier: 'Comfortable',
          estimatedCost: 26000,
          currency: 'INR',
          description: '4-star beachfront resort, private air-conditioned cab, and premier dining.',
          highlights: ['4-star beachfront resort', 'Private cab for all 4 days', 'Fine coastal dining & scuba/watersports']
        },
        premium: {
          tier: 'Premium',
          estimatedCost: 48000,
          currency: 'INR',
          description: '5-star luxury villa/resort, chauffeur-driven luxury car, private yacht & bespoke experiences.',
          highlights: ['5-star luxury property', 'Chauffeur driven vehicle', 'Private yacht cruise & chef-curated meals']
        }
      }
    };
  }
}

export const llmService = new LLMService();
