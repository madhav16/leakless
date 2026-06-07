import * as notificationRepo from './notification.repository.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

/**
 * Notification Service
 */

export async function getAllNotifications({ unreadOnly } = {}) {
  return notificationRepo.findAll({ unreadOnly });
}

export async function getUnreadCount() {
  return notificationRepo.countUnread();
}

export async function createNotification(data) {
  const id = await notificationRepo.create(data);
  return notificationRepo.findById(id);
}

export async function markNotificationsRead(ids) {
  const count = await notificationRepo.markAsRead(ids);
  return { updated: count };
}

export async function markAllNotificationsRead() {
  const count = await notificationRepo.markAllAsRead();
  return { updated: count };
}

export async function deleteNotification(id) {
  const notification = await notificationRepo.findById(id);
  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }
  await notificationRepo.remove(id);
}
