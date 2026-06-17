import * as subscriptionService from './subscription.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { SUBSCRIPTION_MESSAGES } from './subscription.constants.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from './subscription.validator.js';

/**
 * Subscription Controller
 * Handles HTTP layer: parse request → call service → send response.
 * Never contains business logic.
 */

export const getSubscriptions = asyncHandler(async (req, res) => {
  const data = await subscriptionService.getAllSubscriptions();
  sendSuccess(res, data, SUBSCRIPTION_MESSAGES.FETCHED);
});

export const getSubscriptionById = asyncHandler(async (req, res) => {
  const data = await subscriptionService.getSubscriptionById(req.params.id);
  sendSuccess(res, data, SUBSCRIPTION_MESSAGES.FETCHED_ONE);
});

export const createSubscription = asyncHandler(async (req, res) => {
  const parsed = createSubscriptionSchema.parse(req.body);
  const data = await subscriptionService.createSubscription(parsed);
  sendSuccess(res, data, SUBSCRIPTION_MESSAGES.CREATED, HTTP_STATUS.CREATED);
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const parsed = updateSubscriptionSchema.parse(req.body);
  const data = await subscriptionService.updateSubscription(req.params.id, parsed);
  sendSuccess(res, data, SUBSCRIPTION_MESSAGES.UPDATED);
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  await subscriptionService.deleteSubscription(req.params.id);
  sendSuccess(res, null, SUBSCRIPTION_MESSAGES.DELETED);
});

export const getUpcomingRenewals = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days ?? '7', 10);
  const data = await subscriptionService.getUpcomingRenewals(days);
  sendSuccess(res, data, 'Upcoming renewals fetched');
});

export const getTrialWatchlist = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days ?? '30', 10);
  const data = await subscriptionService.getTrialWatchlist(days);
  sendSuccess(res, data, 'Trial watchlist fetched');
});
