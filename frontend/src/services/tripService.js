import { apiRequest } from './api.js';

export const tripService = {
  /**
   * Creates a structured trip on the backend
   */
  async createTrip(tripData) {
    return apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  /**
   * Fetches trips list
   */
  async getTrips(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/trips?${query}` : '/trips');
  },

  /**
   * Fetches single trip by ID
   */
  async getTripById(id) {
    return apiRequest(`/trips/${id}`);
  },

  /**
   * Updates or replans trip by ID
   */
  async updateTrip(id, updates) {
    return apiRequest(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Deletes trip by ID
   */
  async deleteTrip(id) {
    return apiRequest(`/trips/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Calculates ad-hoc deterministic budget estimates across all 4 tiers
   */
  async calculateEstimate(requirements) {
    return apiRequest('/trips/estimate', {
      method: 'POST',
      body: JSON.stringify(requirements),
    });
  },

  /**
   * Calculates and saves budget estimate on a specific trip
   */
  async generateBudgetEstimate(tripId, overrides = {}) {
    return apiRequest(`/trips/${tripId}/budget-estimate`, {
      method: 'POST',
      body: JSON.stringify(overrides),
    });
  },

  /**
   * Persists selected budget tier for a trip
   */
  async selectTripTier(tripId, tier) {
    return apiRequest(`/trips/${tripId}/select-tier`, {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  },

  /**
   * Optimize an existing journey by trip ID
   */
  async optimizeTrip(tripId, options = {}) {
    return apiRequest(`/trips/${tripId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  /**
   * Optimize journey directly using in-memory trip state
   */
  async optimizeTripDirect(tripState, options = {}) {
    return apiRequest('/trips/optimize', {
      method: 'POST',
      body: JSON.stringify({
        trip: tripState,
        ...options,
      }),
    });
  },
};
