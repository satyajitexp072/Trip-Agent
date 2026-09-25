import { apiRequest } from './api.js';

export const healthService = {
  /**
   * Fetches backend service health and DB connectivity status
   */
  async checkHealth() {
    return apiRequest('/health');
  },
};
