import apiClient from '@/utils/axios';

/**
 * Notification Service
 */

/**
 * @param {{ unreadOnly?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getNotifications({ unreadOnly = false } = {}) {
  const res = await apiClient.get('/notifications', {
    params: unreadOnly ? { unread: true } : {},
  });
  return res.data;
}

/**
 * @returns {Promise<{ count: number }>}
 */
export async function getUnreadCount() {
  const res = await apiClient.get('/notifications/unread-count');
  return res.data;
}

/**
 * @param {string[]} ids  Array of notification IDs
 * @returns {Promise<{ updated: number }>}
 */
export async function markAsRead(ids) {
  const res = await apiClient.patch('/notifications/mark-read', { ids });
  return res.data;
}

/**
 * @returns {Promise<{ updated: number }>}
 */
export async function markAllAsRead() {
  const res = await apiClient.patch('/notifications/mark-all-read');
  return res.data;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteNotification(id) {
  await apiClient.delete(`/notifications/${id}`);
}
