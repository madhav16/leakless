import React from 'react';
import { Card, CardContent } from '@/ui/card';
import { formatCurrency } from '@/utils/format';
import { Layers, Calendar, CalendarRange, Sparkles, Activity, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import WidgetError from './WidgetError';

/**
 * Dashboard summary cards.
 *
 * Two independent React Query requests feed this widget:
 *   - `/dashboard/stats`  → four spend/count cards
 *   - `/health-score`     → the Leak Score card
 *
 * The two queries render/skeleton/error independently. The Leak Score card
 * keeps its existing fallback ("—" / "Calculating score…") when health is
 * pending, and shows a small inline Retry control on health error.
 */
export default function DashboardStats({
  summary,
  health,
  isStatsLoading = false,
  isHealthLoading = false,
  isStatsError = false,
  isHealthError = false,
  statsError = null,
  onRetryStats = null,
  onRetryHealth = null,
}) {
  const leakageRiskLabel = (label) => {
    switch (label) {
      case 'Excellent': return 'Low Leakage Risk';
      case 'Good':      return 'Moderate Leakage Risk';
      case 'Fair':      return 'High Leakage Risk';
      case 'Poor':      return 'Critical Leakage Risk';
      default:          return 'Low Leakage Risk';
    }
  };

  const healthColor = !health
    ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    : health.score >= 85
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : health.score >= 70
    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    : health.score >= 50
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  // Four spend/count cards — produced by the /dashboard/stats query.
  const spendStats = summary
    ? [
        {
          title: 'Active Subscriptions',
          value: summary.total_subscriptions ?? 0,
          description: `${summary.paid_subscriptions ?? 0} paid • ${summary.active_trials ?? 0} free trials`,
          icon: Layers,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        },
        {
          title: 'Monthly Spend',
          value: formatCurrency(summary.total_monthly_spend ?? 0),
          description: 'Normalized monthly recurring cost',
          icon: Calendar,
          color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
        },
        {
          title: 'Annual Commitment',
          value: formatCurrency(summary.total_annual_spend ?? 0),
          description: 'Annualized cost across all billing cycles',
          icon: CalendarRange,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        },
        {
          title: 'Active Free Trials',
          value: summary.active_trials ?? 0,
          description: summary.active_trials > 0 ? 'Expiring dates monitored' : 'No active free trials',
          icon: Sparkles,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        },
      ]
    : [];

  const renderStat = (stat, index) => {
    const Icon = stat.icon;
    return (
      <Card
        key={index}
        className="border border-white/5 bg-surface-200 hover:border-white/10 transition-all duration-300 shadow-md group relative overflow-hidden"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">
              {stat.title}
            </span>
            <div className={`p-2 rounded-lg border ${stat.color} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {stat.value}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {stat.description}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Leak Score card — health query only. Three states:
  //   loading → "—" / "Calculating score…" (value pulses)
  //   error   → "—" / "Couldn't calculate score" + small Retry control
  //   ok      → score + leakage risk label + Analyze link
  const renderLeakScoreCard = () => {
    const Icon = Activity;
    let valueText;
    let descriptionNode;
    let trailing;

    if (isHealthError && !health && !isHealthLoading) {
      valueText = '—';
      descriptionNode = <span>Couldn't calculate score</span>;
      trailing = onRetryHealth && (
        <button
          type="button"
          onClick={onRetryHealth}
          className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      );
    } else if (!health) {
      // Loading (or no data yet) — keep the existing fallback copy.
      valueText = '—';
      descriptionNode = <span>Calculating score...</span>;
    } else {
      valueText = `${health.score}/100`;
      descriptionNode = <span>{leakageRiskLabel(health.label)}</span>;
      trailing = (
        <Link
          to={ROUTES.HEALTH_SCORE}
          className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          <span>Analyze</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      );
    }

    return (
      <Card className="border border-white/5 bg-surface-200 hover:border-white/10 transition-all duration-300 shadow-md group relative overflow-hidden ring-1 ring-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">
              Leak Score
            </span>
            <div className={`p-2 rounded-lg border ${healthColor} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <span
              className={`text-2xl md:text-3xl font-extrabold text-white tracking-tight ${
                isHealthLoading && !health ? 'animate-pulse' : ''
              }`}
            >
              {valueText}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center justify-between">
              {descriptionNode}
              {trailing}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Card-shaped stat skeleton mirroring renderStat so the loaded cards fall
  // into the same slots (title row + value/description) instead of a bare
  // h-32 block sitting next to the real Leak Score Card in the same row.
  const renderStatSkeleton = (key) => (
    <Card
      key={key}
      className="border border-white/5 bg-surface-200 shadow-md"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="h-4 w-28 bg-slate-800/40 rounded animate-pulse" />
          <div className="h-9 w-9 rounded-lg border border-white/5 bg-slate-800/40 animate-pulse" />
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <span className="h-7 w-24 bg-slate-800/40 rounded animate-pulse" />
          <span className="h-3 w-32 bg-slate-800/40 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* Leak Score is driven only by the health query. */}
      {renderLeakScoreCard()}

      {isStatsLoading && [...Array(4)].map((_, i) => renderStatSkeleton(i))}

      {!isStatsLoading && (isStatsError || !summary) && (
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-4">
          <WidgetError
            message={statsError?.message ?? (!summary ? 'Subscription data is unavailable.' : undefined)}
            onRetry={onRetryStats}
          />
        </div>
      )}

      {!isStatsLoading && !isStatsError && summary && (
        spendStats.map((stat, i) => renderStat(stat, i))
      )}
    </div>
  );
}
