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
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/ui/button';
import { formatCurrency } from '@/utils/format';

export default function DashboardPage() {
  // Fetch stats & category breakdowns
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  // Fetch renewals for the next 30 days
  const {
    data: renewalsData = [],
    isLoading: isRenewalsLoading,
    isFetching: isRenewalsFetching,
    isError: isRenewalsError,
    error: renewalsError,
    refetch: refetchRenewals,
  } = useUpcomingRenewals(30);

  // Fetch Health Score
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    isError: isHealthError,
    error: healthError,
    refetch: refetchHealth,
  } = useHealthScore();

  // Fetch Trial Watchlist (30-day window)
  const {
    data: trialData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
    isError: isTrialError,
    error: trialError,
    refetch: refetchTrials,
  } = useTrialWatchlist(30);

  const isLoading = isStatsLoading || isRenewalsLoading || isHealthLoading || isTrialLoading;
  const isError = isStatsError || isRenewalsError || isHealthError || isTrialError;
  const activeError = statsError || renewalsError || healthError || trialError;

  // True only after the first load completes and any query is silently re-fetching.
  const isRefreshing =
    !isLoading &&
    (isStatsFetching || isRenewalsFetching || isHealthFetching || isTrialFetching);

  const handleRetry = () => {
    refetchStats();
    refetchRenewals();
    refetchHealth();
    refetchTrials();
  };

  // Whether any active trials exist — controls Trial Watchlist column visibility
  const hasActiveTrials = (trialData?.total_trials ?? 0) > 0;

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
        {!isLoading && !isError && statsData?.summary ? (
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 md:space-y-8">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-32 bg-slate-800/40 rounded-xl animate-pulse border border-white/5" />
            ))}
          </div>

          {/* Widgets Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-800/40 rounded-xl animate-pulse border border-white/5" />
            <div className="h-96 bg-slate-800/40 rounded-xl animate-pulse border border-white/5" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-surface-200 border border-white/5 rounded-xl shadow-xl">
          <div className="p-4 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-4 animate-bounce">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to load analytics</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {activeError?.message || 'We had trouble communicating with the API. Please ensure your backend server is online.'}
          </p>
          <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry Loading</span>
          </Button>
        </div>
      )}

      {/* Loaded Dashboard Content */}
      {!isLoading && !isError && (
        <div className="space-y-6 md:space-y-8">
          {/* Summary Cards */}
          <DashboardStats summary={statsData?.summary} health={healthData} />

          {/* Upcoming Financial Events:
              Left  — Trial Watchlist (hidden when no active trials)
              Right — Upcoming Renewals
              When no trials exist the grid becomes single-column and Upcoming Renewals is full-width. */}
          <div className={`grid grid-cols-1 gap-6 md:gap-8 ${hasActiveTrials ? 'lg:grid-cols-2' : ''}`}>
            {/* Trial Watchlist — only renders when trials exist */}
            <TrialWatchlistWidget trialData={trialData} />

            {/* Upcoming Renewals */}
            <UpcomingRenewalsWidget renewals={renewalsData} />
          </div>

          {/* Top Cost Drivers (full width) */}
          <TopCostDriversWidget
            drivers={statsData?.top_cost_drivers ?? []}
            totalAnnualSpend={statsData?.summary?.total_annual_spend ?? 0}
          />

          {/* Category Spend Analytics (full width) */}
          <CategoryAnalyticsWidget categories={statsData?.spending_by_category} />
        </div>
      )}
    </div>
  );
}
