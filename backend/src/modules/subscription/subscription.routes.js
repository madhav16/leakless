import { Router } from 'express';
import * as subscriptionController from './subscription.controller.js';

const router = Router();

// GET    /api/v1/subscriptions
router.get('/', subscriptionController.getSubscriptions);

// GET    /api/v1/subscriptions/renewals?days=7
router.get('/renewals', subscriptionController.getUpcomingRenewals);

// GET    /api/v1/subscriptions/trials?days=30
router.get('/trials', subscriptionController.getTrialWatchlist);

// GET    /api/v1/subscriptions/:id
router.get('/:id', subscriptionController.getSubscriptionById);

// POST   /api/v1/subscriptions
router.post('/', subscriptionController.createSubscription);

// PUT    /api/v1/subscriptions/:id
router.put('/:id', subscriptionController.updateSubscription);

// DELETE /api/v1/subscriptions/:id
router.delete('/:id', subscriptionController.deleteSubscription);

export default router;
