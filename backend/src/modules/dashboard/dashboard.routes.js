import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

// GET /api/v1/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/v1/dashboard/trends
router.get('/trends', dashboardController.getSpendingTrends);

export default router;
