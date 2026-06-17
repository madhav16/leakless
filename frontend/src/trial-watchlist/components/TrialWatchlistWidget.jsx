import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { FlaskConical, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';

const WIDGET_MAX_ROWS = 5;

/**
 * Billing cycle short labels for the "Will Charge" line.
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

/**
 * Returns urgency badge config based on days_until_expiry.
 */
function getUrgencyConfig(days) {
  if (days === 0) {
    return {
      label: 'Ends Today',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      dotClass: 'bg-red-500 shadow-red-500/60 animate-pulse',
    };
  }
  if (days === 1) {
    return {
      label: 'Ends Tomorrow',
      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      dotClass: 'bg-orange-500 shadow-orange-500/50',
    };
  }
  if (days <= 7) {
    return {
      label: `Ends in ${days} days`,
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-500 shadow-amber-500/50',
    };
  }
  return {
    label: `Ends in ${days} days`,
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-500',
  };
}

/**
 * Compact Trial Watchlist dashboard widget.
 * Shows max WIDGET_MAX_ROWS most urgent trials.
 * Returns null when there are no active trials (widget is hidden).
 *
 * @param {{ trialData: { trials: object[], total_trials: number, potential_annual_spend: number } }} props
 */
export default function TrialWatchlistWidget({ trialData }) {
  if (!trialData || trialData.total_trials === 0) return null;

  const { trials, total_trials, potential_annual_spend } = trialData;
  const visibleTrials = trials.slice(0, WIDGET_MAX_ROWS);
  const hasMore = total_trials > WIDGET_MAX_ROWS;

  return (
    <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-amber-400" />
              <span>Trial Watchlist</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs md:text-sm mt-1">
              {total_trials} active {total_trials === 1 ? 'trial' : 'trials'} ending within 30 days
            </CardDescription>
          </div>

          {/* Aggregate Potential Annual Spend — first-class metric */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              If all convert
            </p>
            <p className="text-lg font-extrabold text-amber-400 leading-tight">
              {formatCurrency(potential_annual_spend)}
            </p>
            <p className="text-[10px] text-slate-500">/year at risk</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-2 flex-1 overflow-y-auto">
        {visibleTrials.map((trial) => {
          const days = parseInt(trial.days_until_expiry ?? 0, 10);
          const urgency = getUrgencyConfig(days);
          const annualImpact = parseFloat(trial.annual_impact ?? 0);
          const cost = parseFloat(trial.cost ?? 0);

          return (
            <div
              key={trial.id}
              className="flex items-center justify-between p-3 bg-surface-300/50 hover:bg-surface-300 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-200 group"
            >
              {/* Left: urgency indicator + name + date */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex-shrink-0 h-2 w-2 rounded-full shadow-[0_0_6px_1px] ${urgency.dotClass}`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {trial.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Ends {formatDate(trial.trial_end_date)}
                  </span>
                </div>
              </div>

              {/* Right: urgency badge + charge info */}
              <div className="flex flex-col items-end flex-shrink-0 ml-3 gap-1">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${urgency.badgeClass}`}
                >
                  {urgency.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {formatCurrency(cost)}
                  </span>
                  {getBillingCycleShort(trial.billing_cycle)}
                </span>
                <span className="text-[10px] text-amber-400/80 font-medium">
                  ↳ {formatCurrency(annualImpact)}/year
                </span>
              </div>
            </div>
          );
        })}

        {/* View all link */}
        <div className="pt-2">
          <Link
            to={ROUTES.TRIAL_WATCHLIST}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-white/5 hover:border-white/10 hover:bg-surface-300/40 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-all duration-200 group"
          >
            <span>
              {hasMore
                ? `View all ${total_trials} trials`
                : 'View full watchlist'}
            </span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
