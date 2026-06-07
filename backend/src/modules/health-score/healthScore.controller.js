import * as healthScoreService from './healthScore.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const getHealthScore = asyncHandler(async (req, res) => {
  const data = await healthScoreService.getHealthScore();
  sendSuccess(res, data, 'Health score fetched');
});

export const getHealthBreakdown = asyncHandler(async (req, res) => {
  const data = await healthScoreService.getHealthBreakdown();
  sendSuccess(res, data, 'Health breakdown fetched');
});
