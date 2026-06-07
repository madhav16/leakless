/**
 * TanStack Query key factory.
 *
 * Centralizing keys prevents stale/mismatched cache invalidations.
 * Use these constants in all useQuery / useMutation calls.
 *
 * @example
 * useQuery({ queryKey: QUERY_KEYS.subscriptions.all() })
 * useQuery({ queryKey: QUERY_KEYS.subscriptions.detail('abc') })
 */
export const QUERY_KEYS = {
  subscriptions: {
    all: () => ['subscriptions'],
    lists: () => ['subscriptions', 'list'],
    detail: (id) => ['subscriptions', 'detail', id],
    renewals: (days) => ['subscriptions', 'renewals', days],
  },

  notifications: {
    all: () => ['notifications'],
    list: (filters) => ['notifications', 'list', filters],
    unreadCount: () => ['notifications', 'unread-count'],
  },

  dashboard: {
    stats: () => ['dashboard', 'stats'],
    trends: () => ['dashboard', 'trends'],
  },

  healthScore: {
    score: () => ['health-score'],
    breakdown: () => ['health-score', 'breakdown'],
  },
};
