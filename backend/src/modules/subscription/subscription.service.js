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
