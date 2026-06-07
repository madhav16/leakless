import apiClient from '@/utils/axios';

/**
 * Subscription Service
 * All HTTP calls for the subscription feature.
 * Import these functions inside TanStack Query hooks — never call directly from components.
 */

/**
 * @returns {Promise<object[]>} List of all subscriptions
 */
export async function getSubscriptions() {
  const res = await apiClient.get('/subscriptions');
  return res.data;
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getSubscriptionById(id) {
  const res = await apiClient.get(`/subscriptions/${id}`);
  return res.data;
}

/**
 * @param {number} [days=7]
 * @returns {Promise<object[]>}
 */
export async function getUpcomingRenewals(days = 7) {
  const res = await apiClient.get('/subscriptions/renewals', {
    params: { days },
  });
  return res.data;
}

/**
 * @param {object} payload  Subscription create payload
 * @returns {Promise<object>}  Newly created subscription
 */
export async function createSubscription(payload) {
  const res = await apiClient.post('/subscriptions', payload);
  return res.data;
}

/**
 * @param {string} id
 * @param {object} payload  Subscription update payload (partial)
 * @returns {Promise<object>}
 */
export async function updateSubscription(id, payload) {
  const res = await apiClient.put(`/subscriptions/${id}`, payload);
  return res.data;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteSubscription(id) {
  await apiClient.delete(`/subscriptions/${id}`);
}
