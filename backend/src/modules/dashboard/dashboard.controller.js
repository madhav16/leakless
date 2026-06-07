import * as dashboardService from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardStats();
  sendSuccess(res, data, 'Dashboard stats fetched');
});

export const getSpendingTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSpendingTrends();
  sendSuccess(res, data, 'Spending trends fetched');
});
