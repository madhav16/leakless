import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import { ROUTES } from '@/constants/routes';

// Feature pages (lazy-loaded for performance)
import { lazy, Suspense } from 'react';

const DashboardPage     = lazy(() => import('@/dashboard/components/DashboardPage'));
const SubscriptionsPage  = lazy(() => import('@/subscription/components/SubscriptionsPage'));
const NotificationsPage  = lazy(() => import('@/notification/components/NotificationsPage'));
const HealthScorePage    = lazy(() => import('@/health-score/components/HealthScorePage'));
const TrialWatchlistPage = lazy(() => import('@/trial-watchlist/components/TrialWatchlistPage'));
const SettingsPage       = lazy(() => import('@/settings/components/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

/**
 * Application route definitions.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.HEALTH_SCORE} element={<HealthScorePage />} />
          <Route path={ROUTES.TRIAL_WATCHLIST} element={<TrialWatchlistPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
