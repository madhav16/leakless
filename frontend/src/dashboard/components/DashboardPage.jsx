import React from 'react';
import { useDashboardStats } from '../hooks/useDashboard';
import { useUpcomingRenewals } from '@/subscription/hooks/useSubscriptions';
import { useHealthScore } from '@/health-score/hooks/useHealthScore';
import { useTrialWatchlist } from '@/trial-watchlist/hooks/useTrialWatchlist';
import DashboardStats from './DashboardStats';
import UpcomingRenewalsWidget from './UpcomingRenewalsWidget';
import CategoryAnalyticsWidget from './CategoryAnalyticsWidget';
import TopCostDriversWidget from './TopCostDriversWidget';
import TrialWatchlistWidget from '@/trial-watchlist/components/TrialWatchlistWidget';
import { RefreshCw, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function DashboardPage() {
  // Fetch stats & category breakdowns
  const {
    data: statsData,
    isFetching: isStatsFetching,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  // Fetch renewals for the next 30 days
  const {
    data: renewalsData,
    isFetching: isRenewalsFetching,
    isError: isRenewalsError,
    error: renewalsError,
    refetch: refetchRenewals,
  } = useUpcomingRenewals(30);

  // Fetch Health Score
  const {
    data: healthData,
    isFetching: isHealthFetching,
    isError: isHealthError,
    refetch: refetchHealth,
  } = useHealthScore();

  // Fetch Trial Watchlist (30-day window)
  const {
    data: trialData,
    isFetching: isTrialFetching,
    isError: isTrialError,
    error: trialError,
    refetch: refetchTrials,
  } = useTrialWatchlist(30);

  // React Query v5: `isLoading` is only true for the initial pending fetch.
  // After an error, Retry sets `isFetching` while `isError` stays true and
  // `data` stays undefined — so skeletons must key off "fetching with no cache".
  // Cached data (including an empty renewals list) must keep rendering on a
  // failed background refetch instead of swapping back to the error UI.
  const showStatsLoading = isStatsFetching && !statsData;
  const showRenewalsLoading = isRenewalsFetching && !renewalsData;
  const showHealthLoading = isHealthFetching && !healthData;
  const showTrialLoading = isTrialFetching && !trialData;

  const showStatsError = isStatsError && !statsData;
  const showRenewalsError = isRenewalsError && !renewalsData;
  const showTrialError = isTrialError && !trialData;

  // Only a background re-fetch (already-cached data) counts as "Updating dashboard…".
  // A slow first-load / retry widget renders its own skeleton instead of the spinner.
  const isRefreshing =
    (isStatsFetching && !!statsData) ||
    (isRenewalsFetching && renewalsData != null) ||
    (isHealthFetching && !!healthData) ||
    (isTrialFetching && !!trialData);

  // Whether any active trials exist — controls Trial Watchlist column visibility.
  // Treat the trial column as occupied while loading or on first-load error so the
  // renewals widget doesn't briefly collapse and then re-expand. A refetch error
  // after a successful empty result must not re-open the column.
  const hasActiveTrials = (trialData?.total_trials ?? 0) > 0;
  const showTrialColumn = showTrialLoading || showTrialError || hasActiveTrials;

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Overview Dashboard</span>
            <Sparkles className="h-5 w-5 text-brand-400 animate-pulse hidden sm:inline" />
          </h1>
          {isRefreshing && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 select-none">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Updating dashboard…
            </span>
          )}
        </div>
        {statsData?.summary ? (
          <p className="text-sm md:text-base text-slate-300">
            You are spending{' '}
            <span className="text-brand-400 font-bold">
              {formatCurrency(statsData.summary.total_annual_spend ?? 0)}/year
            </span>{' '}
            across{' '}
            <span className="text-brand-400 font-bold">
              {statsData.summary.total_subscriptions ?? 0}
            </span>{' '}
            {(statsData.summary.total_subscriptions ?? 0) === 1 ? 'subscription' : 'subscriptions'}.
          </p>
        ) : (
          <p className="text-sm md:text-base text-slate-400">
            Get a centralized analytical overview of your subscription leakage, trials, and billing schedules.
          </p>
        )}
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Summary Cards — stats and health queries render independently */}
        <DashboardStats
          summary={statsData?.summary}
          health={healthData}
          isStatsLoading={showStatsLoading}
          isHealthLoading={showHealthLoading}
          isStatsError={showStatsError}
          isHealthError={isHealthError}
          statsError={statsError}
          onRetryStats={refetchStats}
          onRetryHealth={refetchHealth}
        />

        {/* Upcoming Financial Events:
            Left  — Trial Watchlist (hidden only after success with zero trials)
            Right — Upcoming Renewals
            While trials are loading or on first-load error the column is reserved,
            so the renewals widget doesn't briefly collapse and then re-expand. */}
        <div className={`grid grid-cols-1 gap-6 md:gap-8 items-start ${showTrialColumn ? 'lg:grid-cols-2' : ''}`}>
          {/* Trial Watchlist — handles its own loading/error/empty states */}
          <TrialWatchlistWidget
            trialData={trialData}
            isLoading={showTrialLoading}
            isError={showTrialError}
            error={trialError}
            onRetry={refetchTrials}
          />

          {/* Upcoming Renewals */}
          <UpcomingRenewalsWidget
            renewals={renewalsData ?? []}
            isLoading={showRenewalsLoading}
            isError={showRenewalsError}
            error={renewalsError}
            onRetry={refetchRenewals}
          />
        </div>

        {/* Top Cost Drivers (full width) */}
        <TopCostDriversWidget
          drivers={statsData?.top_cost_drivers ?? []}
          totalAnnualSpend={statsData?.summary?.total_annual_spend ?? 0}
          isLoading={showStatsLoading}
          isError={showStatsError}
          error={statsError}
          onRetry={refetchStats}
        />

        {/* Category Spend Analytics (full width) */}
        <CategoryAnalyticsWidget
          categories={statsData?.spending_by_category}
          isLoading={showStatsLoading}
          isError={showStatsError}
          error={statsError}
          onRetry={refetchStats}
        />
      </div>
    </div>
  );
}
