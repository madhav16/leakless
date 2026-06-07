import { Router } from 'express';
import * as healthScoreController from './healthScore.controller.js';

const router = Router();

// GET /api/v1/health-score
router.get('/', healthScoreController.getHealthScore);

// GET /api/v1/health-score/breakdown
router.get('/breakdown', healthScoreController.getHealthBreakdown);

export default router;
