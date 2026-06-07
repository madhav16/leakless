import axios from 'axios';

/**
 * Configured Axios instance.
 * All API calls should use this instance — never import axios directly.
 *
 * Features:
 * - Reads base URL from environment
 * - Attaches Authorization header if token is in localStorage
 * - Normalizes error responses for consistent handling in React Query
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Request Interceptor ───────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach bearer token if present (extend for real auth later)
    const token = localStorage.getItem('leakless_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──────────────────────────────────
apiClient.interceptors.response.use(
  // Unwrap the `data` envelope so callers get payload directly
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'An unexpected error occurred';

    // Surface a normalized error object
    return Promise.reject({
      message,
      status: error?.response?.status,
      errors: error?.response?.data?.errors ?? null,
    });
  },
);

export default apiClient;
