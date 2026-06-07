/**
 * Subscription module constants.
 */

export const SUBSCRIPTION_MESSAGES = {
  CREATED: 'Subscription created successfully',
  UPDATED: 'Subscription updated successfully',
  DELETED: 'Subscription deleted successfully',
  FETCHED: 'Subscriptions fetched successfully',
  FETCHED_ONE: 'Subscription fetched successfully',
  NOT_FOUND: 'Subscription not found',
};

/**
 * Days before renewal_date to surface a reminder notification.
 */
export const RENEWAL_REMINDER_DAYS = 7;

/**
 * Days of inactivity before flagging a subscription as potentially unused.
 */
export const INACTIVITY_THRESHOLD_DAYS = 30;
