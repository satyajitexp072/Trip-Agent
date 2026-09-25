// Base API endpoint from Vite environment or default to local '/api' proxy
const RAW_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Universal fetch wrapper with consistent error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Request Error] ${endpoint}:`, error.message);
    throw error;
  }
}
