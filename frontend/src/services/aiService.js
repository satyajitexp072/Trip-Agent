import { apiRequest } from './api.js';

export const aiService = {
  /**
   * Send conversational message / replanning directive to AI orchestration layer
   */
  async sendChatMessage({ message, tripId = null, currentContext = {}, tripState = null }) {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        tripId,
        currentContext,
        tripState,
      }),
    });
  },

  /**
   * Extract structured travel intent from natural language message
   */
  async extractIntent({ message, currentContext = {} }) {
    return apiRequest('/ai/intent', {
      method: 'POST',
      body: JSON.stringify({
        message,
        currentContext,
      }),
    });
  },
};
