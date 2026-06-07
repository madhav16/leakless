import apiClient from '@/utils/axios';

/**
 * Dashboard Service
 */

/**
 * @returns {Promise<object>}  Summary stats + spending by category
 */
export async function getDashboardStats() {
  const res = await apiClient.get('/dashboard/stats');
  return res.data;
}

/**
 * @returns {Promise<object>}  Month-over-month spending trends
 */
export async function getSpendingTrends() {
  const res = await apiClient.get('/dashboard/trends');
  return res.data;
}
