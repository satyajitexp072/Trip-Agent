import { apiRequest } from './api.js';

export const bookingService = {
  /**
   * Get structured bookable options for a trip
   * @param {string} tripId
   * @param {string} category - 'all' | 'transport' | 'accommodation' | 'activities' | 'tours' | 'experiences'
   */
  async getBookingOptions(tripId = 'default', category = 'all') {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    const res = await apiRequest(`/bookings/options/${tripId}${query}`);
    return res.data;
  },

  /**
   * Initiate partner affiliate handover (Traveler -> Trip Agent -> Partner)
   * @param {Object} payload - { optionId, tripId, category, travelers, selectedDate }
   */
  async initiateHandover(payload) {
    const res = await apiRequest('/bookings/handover', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Get B2B Partner Program information for travel businesses
   */
  async getPartnerProgramInfo() {
    const res = await apiRequest('/bookings/partner-program');
    return res.data;
  },

  // ==========================================
  // CHECKOUT WIZARD & VERIFICATION METHODS
  // ==========================================

  /**
   * Create or resume a booking checkout session
   */
  async createSession(tripId, itinerary, intent) {
    const res = await apiRequest('/bookings/session', {
      method: 'POST',
      body: JSON.stringify({ tripId, itinerary, intent }),
    });
    return res.data;
  },

  /**
   * Get an existing booking session
   */
  async getSession(sessionId) {
    const res = await apiRequest(`/bookings/session/${sessionId}`);
    return res.data;
  },

  /**
   * Verify transport step
   */
  async verifyTransport(sessionId, updates = {}) {
    const res = await apiRequest(`/bookings/session/${sessionId}/verify-transport`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  /**
   * Verify accommodation step
   */
  async verifyAccommodation(sessionId, updates = {}) {
    const res = await apiRequest(`/bookings/session/${sessionId}/verify-accommodation`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  /**
   * Verify single activity by index
   */
  async verifyActivity(sessionId, activityIndex, updates = {}) {
    const res = await apiRequest(`/bookings/session/${sessionId}/verify-activity`, {
      method: 'POST',
      body: JSON.stringify({ activityIndex, updates }),
    });
    return res.data;
  },

  /**
   * Acknowledge local transport allowance
   */
  async verifyLocalTransport(sessionId) {
    const res = await apiRequest(`/bookings/session/${sessionId}/verify-local-transport`, {
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Process dummy payment (NEVER sends card credentials to DB)
   */
  async processPayment(sessionId, paymentData = {}) {
    const res = await apiRequest(`/bookings/session/${sessionId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return res.data;
  },

  /**
   * Finalize all bookings into CONFIRMED state with itinerary snapshot
   */
  async confirmBooking(sessionId, snapshotData = {}) {
    const res = await apiRequest(`/bookings/session/${sessionId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(snapshotData),
    });
    return res?.data || res;
  },

  /**
   * Fetch all confirmed bookings for My Trips
   */
  async getBookedTrips(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiRequest(query ? `/trips/booked?${query}` : '/trips/booked');
    return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
  },

  /**
   * Fetch specific confirmed booking by bookingId or ID
   */
  async getBookedTripById(bookingId) {
    const res = await apiRequest(`/trips/booked/${bookingId}`);
    return res?.data || res;
  },
};

export default bookingService;

