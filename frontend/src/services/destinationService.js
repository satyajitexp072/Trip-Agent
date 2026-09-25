import { apiRequest } from './api.js';

export const destinationService = {
  /**
   * Fetches all destinations with optional filtering (search, tag, state)
   */
  async getDestinations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/destinations?${query}` : '/destinations';
    return apiRequest(endpoint);
  },

  /**
   * Fetches destination detail by ID or slug, including related stays and activities
   */
  async getDestinationById(idOrSlug) {
    return apiRequest(`/destinations/${idOrSlug}`);
  },
};
