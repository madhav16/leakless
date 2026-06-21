import { z } from 'zod';

/**
 * Billing cycle options — mirrors the DB ENUM.
 */
export const BILLING_CYCLES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'lifetime',
];

/**
 * Subscription category suggestions.
 */
export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Music',
  'Design',
  'Development',
  'Productivity',
  'Cloud',
  'Security',
  'Finance',
  'Health',
  'Education',
  'News',
  'Gaming',
  'Other',
];

/**
 * Zod schema for creating a subscription.
 */
export const createSubscriptionSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be at most 100 characters'),

    cost: z
      .number({ invalid_type_error: 'Cost must be a number' })
      .min(0, 'Cost cannot be negative')
      .max(100_000, 'Cost seems too large'),

    billing_cycle: z.enum(BILLING_CYCLES, {
      errorMap: () => ({
        message: `billing_cycle must be one of: ${BILLING_CYCLES.join(', ')}`,
      }),
    }),

    category: z
      .string()
      .max(50)
      .nullable()
      .optional(),

    renewal_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), 'renewal_date must be a valid date')
      .nullable()
      .optional(),

    is_trial: z.boolean().default(false),

    trial_end_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), 'trial_end_date must be a valid date')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If is_trial is true, trial_end_date must be provided
      if (data.is_trial && !data.trial_end_date) return false;
      return true;
    },
    {
      message: 'trial_end_date is required when is_trial is true',
      path: ['trial_end_date'],
    },
  );

/**
 * Zod schema for updating a subscription (all fields optional).
 */
export const updateSubscriptionSchema = createSubscriptionSchema;
