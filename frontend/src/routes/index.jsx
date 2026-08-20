import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/layouts/RootLayout';
import { ROUTES } from '@/constants/routes';
import RouteErrorBoundary from './RouteErrorBoundary';
import DashboardPage from '@/dashboard/components/DashboardPage';

// Secondary pages stay lazy — dashboard is eager because it is the default route
// and every visit would otherwise pay a main-bundle + dashboard-chunk waterfall.
const SubscriptionsPage  = lazy(() => import('@/subscription/components/SubscriptionsPage'));
const NotificationsPage  = lazy(() => import('@/notification/components/NotificationsPage'));
const HealthScorePage    = lazy(() => import('@/health-score/components/HealthScorePage'));
const TrialWatchlistPage = lazy(() => import('@/trial-watchlist/components/TrialWatchlistPage'));
const SettingsPage       = lazy(() => import('@/settings/components/SettingsPage'));

/**
 * Lightweight loader for lazy secondary routes.
 * Sidebar stays visible (Suspense is inside RootLayout's outlet); keep this
 * small so it does not bloat the entry bundle the way the old full-page
 * dashboard skeleton did.
 */
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 min-h-[40vh]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}

/**
 * Wrap a lazy page with per-route Suspense (sidebar stays visible) and an
 * ErrorBoundary that recovers from chunk-load failures with a Reload button.
 */
function lazyRoute(element, fallback = <PageLoader />) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={fallback}>{element}</Suspense>
    </RouteErrorBoundary>
  );
}

/**
 * Application route definitions.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Eager — renders widget skeletons immediately once the app shell loads */}
        <Route
          index
          element={
            <RouteErrorBoundary>
              <DashboardPage />
            </RouteErrorBoundary>
          }
        />
        <Route
          path={ROUTES.SUBSCRIPTIONS}
          element={lazyRoute(<SubscriptionsPage />)}
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={lazyRoute(<NotificationsPage />)}
        />
        <Route
          path={ROUTES.HEALTH_SCORE}
          element={lazyRoute(<HealthScorePage />)}
        />
        <Route
          path={ROUTES.TRIAL_WATCHLIST}
          element={lazyRoute(<TrialWatchlistPage />)}
        />
        <Route
          path={ROUTES.SETTINGS}
          element={lazyRoute(<SettingsPage />)}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
  );
}
