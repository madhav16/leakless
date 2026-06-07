import { Router } from 'express';
import * as notificationController from './notification.controller.js';

const router = Router();

// GET    /api/v1/notifications?unread=true
router.get('/', notificationController.getNotifications);

// GET    /api/v1/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// POST   /api/v1/notifications
router.post('/', notificationController.createNotification);

// PATCH  /api/v1/notifications/mark-read
router.patch('/mark-read', notificationController.markRead);

// PATCH  /api/v1/notifications/mark-all-read
router.patch('/mark-all-read', notificationController.markAllRead);

// DELETE /api/v1/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

export default router;
