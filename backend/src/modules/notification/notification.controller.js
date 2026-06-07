import * as notificationService from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import {
  createNotificationSchema,
  markReadSchema,
} from './notification.validator.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const data = await notificationService.getAllNotifications({ unreadOnly });
  sendSuccess(res, data, 'Notifications fetched');
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount();
  sendSuccess(res, { count }, 'Unread count fetched');
});

export const createNotification = asyncHandler(async (req, res) => {
  const parsed = createNotificationSchema.parse(req.body);
  const data = await notificationService.createNotification(parsed);
  sendSuccess(res, data, 'Notification created', HTTP_STATUS.CREATED);
});

export const markRead = asyncHandler(async (req, res) => {
  const parsed = markReadSchema.parse(req.body);
  const result = await notificationService.markNotificationsRead(parsed.ids);
  sendSuccess(res, result, 'Notifications marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead();
  sendSuccess(res, result, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);
  sendSuccess(res, null, 'Notification deleted');
});
