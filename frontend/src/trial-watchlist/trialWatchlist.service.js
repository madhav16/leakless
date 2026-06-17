import apiClient from '@/utils/axios';

/**
 * Trial Watchlist Service
 * HTTP calls for the trial watchlist feature.
 * Import these functions inside TanStack Query hooks — never call directly from components.
 */

/**
 * Fetch active trials ending within the next `days` days.
 * @param {number} [days=30]
 * @returns {Promise<{ trials: object[], total_trials: number, potential_annual_spend: number }>}
 */
export async function getTrialWatchlist(days = 30) {
  const res = await apiClient.get('/subscriptions/trials', {
    params: { days },
  });
  return res.data;
}
