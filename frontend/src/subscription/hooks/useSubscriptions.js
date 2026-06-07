import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../subscription.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Fetch all subscriptions.
 */
export function useSubscriptions() {
  return useQuery({
    queryKey: QUERY_KEYS.subscriptions.all(),
    queryFn: getSubscriptions,
  });
}

/**
 * Fetch a single subscription by ID.
 * @param {string} id
 */
export function useSubscription(id) {
  return useQuery({
    queryKey: QUERY_KEYS.subscriptions.detail(id),
    queryFn: () => getSubscriptionById(id),
    enabled: !!id,
  });
}

/**
 * Fetch upcoming renewals.
 * @param {number} [days=7]
 */
export function useUpcomingRenewals(days = 7) {
  return useQuery({
    queryKey: QUERY_KEYS.subscriptions.renewals(days),
    queryFn: () => getUpcomingRenewals(days),
  });
}

/**
 * Create a new subscription.
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.all() });
    },
  });
}

/**
 * Update an existing subscription.
 * @param {string} id
 */
export function useUpdateSubscription(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateSubscription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.detail(id) });
    },
  });
}

/**
 * Delete a subscription.
 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.all() });
    },
  });
}
