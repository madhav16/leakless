import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { formatCurrency } from '@/utils/format';
import { TrendingUp } from 'lucide-react';

/**
 * Human-readable billing cycle label.
 */
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
 * Rank badge styles for top 3 positions.
 */
const RANK_COLORS = [
  'bg-amber-500/20 text-amber-400 border-amber-500/30',  // 1st
  'bg-slate-500/20 text-slate-300 border-slate-500/30',  // 2nd
  'bg-amber-700/20 text-amber-600 border-amber-700/30',  // 3rd
];

export default function TopCostDriversWidget({ drivers = [], totalAnnualSpend = 0 }) {
  // Sort by annual_cost descending, take top 5
  const sorted = useMemo(() => {
    return [...drivers]
      .sort((a, b) => parseFloat(b.annual_cost ?? 0) - parseFloat(a.annual_cost ?? 0))
      .slice(0, 5);
  }, [drivers]);

  return (
    <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-400" />
          <span>Top Cost Drivers</span>
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs md:text-sm">
          Your highest-cost paid subscriptions by annualized spend.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
            <TrendingUp className="h-8 w-8 text-slate-600 mb-2" />
            <span className="text-sm font-semibold">No paid subscriptions found</span>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add paid subscriptions to see your top annual cost drivers here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-white/5">
              <span>Subscription</span>
              <span className="text-right">Annual Cost</span>
            </div>

            {sorted.map((item, index) => {
              const annualCost = parseFloat(item.annual_cost ?? 0);
              const rankColorClass = RANK_COLORS[index] ?? 'bg-surface-300/40 text-slate-400 border-white/5';
              const percent = totalAnnualSpend > 0 ? (annualCost / totalAnnualSpend) * 100 : 0;
              const percentText = percent < 0.1 && percent > 0 ? '<0.1%' : `${percent.toFixed(1).replace(/\.0$/, '')}%`;

              return (
                <div
                  key={item.id ?? index}
                  className="flex items-center justify-between p-3 bg-surface-300/40 hover:bg-surface-300/70 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-200 group"
                >
                  {/* Left: rank + name + cycle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-extrabold ${rankColorClass}`}>
                      {index + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-semibold px-1.5 py-0 bg-surface-300 text-slate-400 border-white/5"
                        >
                          {getBillingCycleLabel(item.billing_cycle)}
                        </Badge>
                        {item.category && (
                          <span className="text-[10px] text-slate-500 truncate">{item.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: annual cost */}
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(annualCost)}
                    </span>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      /year
                    </div>
                    {totalAnnualSpend > 0 && (
                      <div className="text-[10px] text-brand-400 font-semibold mt-0.5">
                        {percentText} of annual spend
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
