import React from 'react';
import { Card, CardContent } from '@/ui/card';
import { formatCurrency } from '@/utils/format';
import { Layers, Calendar, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function DashboardStats({ summary, health }) {
  if (!summary) return null;

  const healthColor = !health
    ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    : health.score >= 80
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : health.score >= 60
    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    : health.score >= 40
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  const stats = [
    {
      title: 'Subscription Health',
      value: health ? `${health.score}/100` : '—',
      description: health ? `${health.label} Status` : 'Calculating health...',
      icon: Activity,
      color: healthColor,
      isHealth: true,
    },
    {
      title: 'Active Subscriptions',
      value: summary.total_subscriptions ?? 0,
      description: `${summary.paid_subscriptions ?? 0} paid • ${summary.active_trials ?? 0} free trials`,
      icon: Layers,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Monthly recurring spend',
      value: formatCurrency(summary.total_monthly_spend ?? 0),
      description: 'Normalized monthly recurring cost',
      icon: Calendar,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Active Free Trials',
      value: summary.active_trials ?? 0,
      description: summary.active_trials > 0 ? 'Expiring dates monitored' : 'No active free trials',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border border-white/5 bg-surface-200 hover:border-white/10 transition-all duration-300 shadow-md group relative overflow-hidden ${
              stat.isHealth ? 'ring-1 ring-white/[0.02]' : ''
            }`}
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
                <span className="text-xs text-slate-500 font-medium flex items-center justify-between">
                  <span>{stat.description}</span>
                  {stat.isHealth && health && (
                    <Link
                      to={ROUTES.HEALTH_SCORE}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
