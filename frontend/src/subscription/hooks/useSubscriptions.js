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
 * Invalidate every cache that depends on subscription data.
 * Called after any create / update / delete mutation.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string|null} [id] Supply the subscription id when invalidating a detail entry.
 */
function invalidateDependentCaches(queryClient, id = null) {
  // Subscription list
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.all(), });

  // Any upcoming renewals query (7, 30, etc.)
  queryClient.invalidateQueries({ queryKey: ['subscriptions', 'renewals'], });

  // Individual subscription
  if (id) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions.detail(id), });
  }

  // Dashboard
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats(), });

  // Leak Score
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.healthScore.score(), });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.healthScore.breakdown(), });

  // Any Trial Watchlist query
  queryClient.invalidateQueries({ queryKey: ['trial-watchlist'] });
}

/**
 * Create a new subscription.
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      invalidateDependentCaches(queryClient);
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
      invalidateDependentCaches(queryClient, id);
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
    onSuccess: (_, deletedId) => {
      invalidateDependentCaches(queryClient, deletedId);
    },
  });
}
