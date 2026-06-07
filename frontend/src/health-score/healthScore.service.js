import apiClient from '@/utils/axios';

/**
 * Health Score Service
 */

/**
 * @returns {Promise<{ score: number, label: string, total_subscriptions: number }>}
 */
export async function getHealthScore() {
  const res = await apiClient.get('/health-score');
  return res.data;
}

/**
 * @returns {Promise<object>}  Detailed breakdown of inactive and costly subscriptions
 */
export async function getHealthBreakdown() {
  const res = await apiClient.get('/health-score/breakdown');
  return res.data;
}
