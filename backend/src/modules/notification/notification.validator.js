import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'renewal_reminder',
  'trial_expiring',
  'payment_due',
  'subscription_inactive',
  'health_alert',
];

export const createNotificationSchema = z.object({
  subscription_id: z.string().uuid('subscription_id must be a valid UUID'),
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({
      message: `type must be one of: ${NOTIFICATION_TYPES.join(', ')}`,
    }),
  }),
  message: z.string().min(1, 'Message is required').max(1000),
});

export const markReadSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, 'At least one notification id is required'),
});
