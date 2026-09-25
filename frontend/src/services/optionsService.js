import { apiRequest } from './api.js';

export const optionsService = {
  /**
   * Fetches transport options matching route criteria
   */
  async getTransport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/transport?${query}` : '/transport');
  },

  /**
   * Fetches accommodation options matching destination and category
   */
  async getAccommodations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/accommodations?${query}` : '/accommodations');
  },

  /**
   * Fetches activities matching destination and category
   */
  async getActivities(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/activities?${query}` : '/activities');
  },
};
