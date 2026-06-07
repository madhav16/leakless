import { Router } from 'express';
import subscriptionRoutes from '../modules/subscription/subscription.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import healthScoreRoutes from '../modules/health-score/healthScore.routes.js';

const router = Router();

/**
 * Central route registry.
 * All feature routers are mounted here under /api/v1.
 */
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health-score', healthScoreRoutes);

export default router;
