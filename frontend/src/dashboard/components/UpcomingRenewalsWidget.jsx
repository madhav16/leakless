import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { getDaysUntil, formatDate, formatCurrency } from '@/utils/format';
import { CalendarDays, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

export default function UpcomingRenewalsWidget({ renewals = [] }) {
  // Sort and group renewals
  const grouped = useMemo(() => {
    // 1. Sort by nearest renewal date ascending
    const sorted = [...renewals].sort((a, b) => {
      const daysA = getDaysUntil(a.renewal_date) ?? 999;
      const daysB = getDaysUntil(b.renewal_date) ?? 999;
      return daysA - daysB;
    });

    const today = [];
    const thisWeek = [];
    const thisMonth = [];

    sorted.forEach((item) => {
      const days = getDaysUntil(item.renewal_date);
      if (days === null) return;

      if (days <= 0) {
        today.push(item);
      } else if (days <= 7) {
        thisWeek.push(item);
      } else if (days <= 30) {
        thisMonth.push(item);
      }
    });

    return { today, thisWeek, thisMonth };
  }, [renewals]);

  const sections = [
    {
      id: 'today',
      title: 'Renewing Today',
      items: grouped.today,
      emptyText: 'No renewals scheduled for today.',
      badgeVariant: 'destructive',
      indicatorColor: 'bg-red-500 shadow-red-500/50',
    },
    {
      id: 'week',
      title: 'Renewing This Week',
      items: grouped.thisWeek,
      emptyText: 'No upcoming renewals in the next 7 days.',
      badgeVariant: 'warning',
      indicatorColor: 'bg-amber-500 shadow-amber-500/50',
    },
    {
      id: 'month',
      title: 'Renewing This Month',
      items: grouped.thisMonth,
      emptyText: 'No renewals scheduled for the rest of the month.',
      badgeVariant: 'default',
      indicatorColor: 'bg-brand-500 shadow-brand-500/50',
    },
  ];

  return (
    <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-brand-400" />
          <span>Upcoming Renewals</span>
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs md:text-sm">
          Keep track of your automatic license payments for the next 30 days.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${section.indicatorColor} shadow-[0_0_8px_1px_rgba(0,0,0,0.1)]`} />
                {section.title}
              </h4>
              <Badge variant={section.badgeVariant} className="text-[10px] font-bold px-2 py-0.5">
                {section.items.length}
              </Badge>
            </div>

            {/* Section Items */}
            {section.items.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-surface-300/30 border border-white/5 rounded-lg text-slate-500 text-xs font-medium">
                <CheckCircle className="h-4 w-4 text-slate-600" />
                <span>{section.emptyText}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {section.items.map((item) => {
                  const days = getDaysUntil(item.renewal_date);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-surface-300/60 hover:bg-surface-300 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-200"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {item.is_trial ? 'Trial Ends' : 'Renews'}: {formatDate(item.renewal_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right flex flex-col">
                          <span className="text-sm font-bold text-slate-200">
                            {formatCurrency(parseFloat(item.cost))}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {item.billing_cycle}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[64px]">
                          {days === 0 ? (
                            <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                              Today
                            </Badge>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {days} {days === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
