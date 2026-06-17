import React from 'react';
import { useTrialWatchlist } from '../hooks/useTrialWatchlist';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  FlaskConical,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';

/**
 * Billing cycle labels.
 */
function getBillingCycleShort(cycle) {
  switch (cycle) {
    case 'daily':     return '/day';
    case 'weekly':    return '/week';
    case 'monthly':   return '/month';
    case 'quarterly': return '/quarter';
    case 'yearly':    return '/year';
    default:          return `/${cycle ?? '?'}`;
  }
}

function getBillingCycleLabel(cycle) {
  switch (cycle) {
    case 'daily':     return 'Daily';
    case 'weekly':    return 'Weekly';
    case 'monthly':   return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'yearly':    return 'Yearly';
    default:          return cycle ?? '—';
  }
}

/**
 * Urgency config per days_until_expiry.
 */
function getUrgencyConfig(days) {
  if (days === 0) {
    return {
      label: 'Ends Today',
      rowClass: 'border-red-500/20 bg-red-950/10',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      dotClass: 'bg-red-500 animate-pulse shadow-red-500/60',
      textClass: 'text-red-400',
    };
  }
  if (days === 1) {
    return {
      label: 'Ends Tomorrow',
      rowClass: 'border-orange-500/15 bg-orange-950/5',
      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      dotClass: 'bg-orange-500 shadow-orange-500/50',
      textClass: 'text-orange-400',
    };
  }
  if (days <= 7) {
    return {
      label: `Ends in ${days} days`,
      rowClass: 'border-amber-500/15 bg-amber-950/5',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-500 shadow-amber-500/50',
      textClass: 'text-amber-400',
    };
  }
  return {
    label: `Ends in ${days} days`,
    rowClass: 'border-white/5',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-500',
    textClass: 'text-slate-400',
  };
}

export default function TrialWatchlistPage() {
  const {
    data: trialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrialWatchlist(30);

  const trials = trialData?.trials ?? [];
  const totalTrials = trialData?.total_trials ?? 0;
  const potentialAnnualSpend = trialData?.potential_annual_spend ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-amber-400" />
          <span>Trial Watchlist</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Active free trials ending within the next 30 days. Act before they start charging.
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-32 bg-slate-800/40 rounded-xl animate-pulse border border-white/5" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/40 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-surface-200 border border-white/5 rounded-xl shadow-xl">
          <div className="p-4 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-4 animate-bounce">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to load trial watchlist</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {error?.message || 'Could not communicate with the API. Please ensure your backend server is online.'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Loaded Content */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          {/* Hero Aggregate Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Potential Annual Spend — first-class metric */}
            <Card className="border border-amber-500/20 bg-amber-950/10 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-400/80 tracking-wide uppercase">
                    Potential Annual Spend
                  </span>
                  <div className="p-2 rounded-lg border bg-amber-500/10 border-amber-500/20">
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight">
                    {formatCurrency(potentialAnnualSpend)}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs">
                    Combined annual cost if all active trials convert to paid subscriptions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Trial Count */}
            <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
                    Active Trials
                  </span>
                  <div className="p-2 rounded-lg border bg-slate-500/10 border-slate-500/20">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {totalTrials}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    {totalTrials === 1
                      ? 'trial ending within the next 30 days'
                      : 'trials ending within the next 30 days'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trial List */}
          {trials.length === 0 ? (
            <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-emerald-950/20 rounded-full border border-emerald-500/20 text-emerald-400 mb-4">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No active trials expiring soon</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  You have no active free trials ending within the next 30 days. Add a subscription
                  marked as a free trial to start tracking it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-400" />
                  All Active Trials
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Sorted by urgency — soonest expiring first.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {trials.map((trial) => {
                    const days = parseInt(trial.days_until_expiry ?? 0, 10);
                    const urgency = getUrgencyConfig(days);
                    const cost = parseFloat(trial.cost ?? 0);
                    const annualImpact = parseFloat(trial.annual_impact ?? 0);

                    return (
                      <div
                        key={trial.id}
                        className={`flex items-center justify-between px-6 py-4 hover:bg-surface-300/50 transition-all duration-200 border-l-2 ${urgency.rowClass}`}
                      >
                        {/* Left: dot + name + date + category */}
                        <div className="flex items-center gap-4 min-w-0">
                          <span
                            className={`flex-shrink-0 h-2.5 w-2.5 rounded-full shadow-[0_0_8px_1px] ${urgency.dotClass}`}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">
                              {trial.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {trial.category && (
                                <span className="text-[10px] text-slate-500 truncate">
                                  {trial.category}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-600">·</span>
                              <span className="text-[10px] text-slate-500">
                                Ends {formatDate(trial.trial_end_date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: urgency + charge + annual impact */}
                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          {/* Billing info */}
                          <div className="hidden sm:flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                              Will Charge
                            </span>
                            <span className="text-sm font-bold text-slate-200">
                              {formatCurrency(cost)}
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                {getBillingCycleShort(trial.billing_cycle)}
                              </span>
                            </span>
                            <span className={`text-[10px] font-semibold ${urgency.textClass}`}>
                              {formatCurrency(annualImpact)}/year
                            </span>
                          </div>

                          {/* Billing cycle badge */}
                          <div className="hidden md:flex flex-col items-end gap-1">
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-surface-300 text-slate-400 border-white/5 uppercase tracking-wider">
                              {getBillingCycleLabel(trial.billing_cycle)}
                            </span>
                          </div>

                          {/* Urgency badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md border whitespace-nowrap ${urgency.badgeClass}`}
                          >
                            {urgency.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
