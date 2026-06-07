import React from 'react';
import { useHealthBreakdown } from '../hooks/useHealthScore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { formatCurrency } from '@/utils/format';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function HealthScorePage() {
  const {
    data: health,
    isLoading,
    isError,
    error,
    refetch,
  } = useHealthBreakdown();

  const getScoreTheme = (score) => {
    if (score >= 85) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/20',
        circle: 'stroke-emerald-500',
      };
    }
    if (score >= 70) {
      return {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/20',
        circle: 'stroke-blue-500',
      };
    }
    if (score >= 50) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/20',
        circle: 'stroke-amber-500',
      };
    }
    return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/20',
      circle: 'stroke-red-500',
    };
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="bg-surface-300 text-slate-300">Info</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800/40 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-xl md:col-span-1 border border-white/5"></div>
          <div className="h-80 bg-slate-800/40 rounded-xl md:col-span-2 border border-white/5"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-4 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-4 animate-bounce">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to load health metrics</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {error?.message || 'We could not communicate with the health scoring API.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  const theme = getScoreTheme(health?.score ?? 0);
  const issues = health?.issues || [];
  const recommendations = health?.recommendations || [];
  const deductions = health?.deductions || [];

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Back link & Title */}
      <div className="space-y-4">
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand-400" />
            <span>Subscription Health Analysis</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400">
            A comprehensive, non-punitive audit based on active trials, upcoming renewals, category redundancies, and spending thresholds.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Gauge Card & Score Breakdown */}
        <div className="space-y-6">
          {/* Gauge Card */}
          <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden relative">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <span>Overall Status</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Your calculated financial leakage safety rating.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              {/* Radial Dial Indicator */}
              <div className="relative flex items-center justify-center h-48 w-48 mt-4">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                    r="75"
                    cx="96"
                    cy="96"
                  />
                  <circle
                    className={`transition-all duration-1000 ${theme.circle}`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 * (1 - (health?.score ?? 0) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    r="75"
                    cx="96"
                    cy="96"
                  />
                </svg>
                {/* Display Value */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {health?.score ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Status Indicator Label */}
              <div className={`mt-6 px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide shadow-lg ${theme.bg} ${theme.border} ${theme.text}`}>
                {health?.label ?? 'Excellent'} Health Status
              </div>

              {/* Sub metrics list */}
              <div className="mt-8 w-full border-t border-white/5 pt-6 space-y-3 text-xs md:text-sm text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>Tracked Subscriptions</span>
                  <span className="text-white font-bold">{health?.total_subscriptions ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Monthly Expenditure</span>
                  <span className="text-white font-bold">{formatCurrency(health?.total_monthly_spend ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Identified Vulnerabilities</span>
                  <span className="text-white font-bold">{issues.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown Card */}
          <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <span>Score Deductions Breakdown</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Itemized points deducted from your starting 100/100 score.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {deductions.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs">
                  No points deducted. Clean record!
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-white/5">
                    <span>Category</span>
                    <span className="text-right">Deduction</span>
                  </div>
                  {deductions.map((d, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-slate-300 py-0.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        <span>{d.category}</span>
                        <span className="text-slate-500 text-[10px] font-semibold">({d.count} {d.count === 1 ? 'issue' : 'issues'})</span>
                      </div>
                      <span className="font-extrabold text-red-400">−{d.points} pts</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-xs text-slate-300 pt-3 border-t border-white/5 font-bold">
                    <span>Total Deductions</span>
                    <span className="text-red-400">−{100 - (health?.score ?? 100)} pts</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Issues & Actionable Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Vulnerabilities */}
          <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-brand-400" />
                <span>Vulnerabilities & Flagged Issues</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs md:text-sm">
                Subscription configurations that require informational review or present billing risk.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mb-3" />
                  <span className="text-base font-bold text-white mb-1">No issues identified!</span>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Excellent! Your subscription dashboard is fully optimized with clean cycles and budget margins.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-surface-300/40 border border-white/5 rounded-lg text-slate-300 text-xs md:text-sm leading-relaxed"
                    >
                      <div className="mt-0.5">{getSeverityBadge(issue.severity)}</div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-white font-semibold">
                            {issue.issueLabel || 'Alert'}
                          </span>
                          {issue.deduction > 0 && (
                            <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px] font-extrabold">
                              −{issue.deduction} pts
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 mt-1">{issue.message}</p>
                        {issue.details && (
                          <div className="mt-2 text-xs text-slate-500 font-normal">
                            Redundant tools found: {issue.details.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Recommendations */}
          <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span>Actionable Recommendations</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs md:text-sm">
                Practical tips to prevent spending leakage, optimize tools, and improve your health score.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mb-3" />
                  <span className="text-base font-bold text-white">All actions cleared</span>
                  <p className="text-xs text-slate-400 mt-1">
                    No urgent adjustments needed. You are fully tracking trial dates and renewals.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-surface-300/20 rounded-lg text-slate-300 text-xs md:text-sm font-medium"
                    >
                      <div className="h-5 w-5 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-slate-300 font-normal leading-relaxed">
                        {rec.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
