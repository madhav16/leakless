/**
 * Application route path constants.
 * Import these everywhere instead of hardcoding strings.
 */
export const ROUTES = {
  DASHBOARD: '/',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_NEW: '/subscriptions/new',
  SUBSCRIPTION_DETAIL: '/subscriptions/:id',
  NOTIFICATIONS: '/notifications',
  HEALTH_SCORE: '/health-score',
  SETTINGS: '/settings',
};

/**
 * Helper to build a dynamic route.
 * @example buildRoute(ROUTES.SUBSCRIPTION_DETAIL, { id: '123' })
 */
export function buildRoute(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template,
  );
}
