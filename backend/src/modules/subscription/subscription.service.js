import * as subscriptionRepo from './subscription.repository.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { SUBSCRIPTION_MESSAGES } from './subscription.constants.js';

/**
 * Subscription Service
 * Business logic lives here. Orchestrates repository calls.
 */

export async function getAllSubscriptions() {
  return subscriptionRepo.findAll();
}

export async function getSubscriptionById(id) {
  const subscription = await subscriptionRepo.findById(id);
  if (!subscription) {
    throw new AppError(SUBSCRIPTION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return subscription;
}

export async function createSubscription(data) {
  const id = await subscriptionRepo.create(data);
  return subscriptionRepo.findById(id);
}

export async function updateSubscription(id, data) {
  await getSubscriptionById(id); // throws 404 if not found
  await subscriptionRepo.update(id, data);
  return subscriptionRepo.findById(id);
}

export async function deleteSubscription(id) {
  await getSubscriptionById(id); // throws 404 if not found
  await subscriptionRepo.remove(id);
}

export async function getUpcomingRenewals(days) {
  return subscriptionRepo.findUpcomingRenewals(days);
}

/**
 * Fetch active trials ending within the next `days` days.
 * Computes aggregate potential_annual_spend across all returned trials.
 *
 * @param {number} days
 * @returns {Promise<{ trials: object[], total_trials: number, potential_annual_spend: number }>}
 */
export async function getTrialWatchlist(days = 30) {
  const trials = await subscriptionRepo.findTrialWatchlist(days);
  const potential_annual_spend = trials.reduce(
    (sum, t) => sum + parseFloat(t.annual_impact ?? 0),
    0,
  );
  return {
    trials,
    total_trials: trials.length,
    potential_annual_spend: +(potential_annual_spend.toFixed(2)),
  };
}
