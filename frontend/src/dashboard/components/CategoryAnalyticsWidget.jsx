import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { formatCurrency } from '@/utils/format';
import { PieChart, Sparkles } from 'lucide-react';

const BAR_COLORS = [
  'bg-brand-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-teal-500',
];

export default function CategoryAnalyticsWidget({ categories = [] }) {
  // Sort categories by highest spend descending
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => parseFloat(b.total_cost ?? 0) - parseFloat(a.total_cost ?? 0));
  }, [categories]);

  // Calculate sum of category spending
  const totalCategorySpend = useMemo(() => {
    return categories.reduce((sum, item) => sum + parseFloat(item.total_cost ?? 0), 0);
  }, [categories]);

  return (
    <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="h-5 w-5 text-brand-400" />
          <span>Category Spend Analytics</span>
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs md:text-sm">
          Detailed proportional distribution of your recurring costs across categories.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
        {sortedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
            <Sparkles className="h-8 w-8 text-slate-600 mb-2" />
            <span className="text-sm font-semibold">No category spending recorded</span>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add subscriptions with valid categories to see detailed analytical breakdowns.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedCategories.map((item, index) => {
              const cost = parseFloat(item.total_cost ?? 0);
              const count = parseInt(item.subscription_count ?? 0);
              const percentage = totalCategorySpend > 0 ? (cost / totalCategorySpend) * 100 : 0;
              const colorClass = BAR_COLORS[index % BAR_COLORS.length];

              return (
                <div key={item.category || 'Uncategorized'} className="space-y-1.5">
                  {/* Label Row */}
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                      <span className="font-semibold text-slate-200 truncate">
                        {item.category || 'Other'}
                      </span>
                      <span className="text-slate-500 text-xs font-normal">
                        ({count} {count === 1 ? 'subscription' : 'subscriptions'})
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2 pl-2">
                      <span className="font-bold text-white">
                        {formatCurrency(cost)}
                      </span>
                      <span className="text-slate-400 text-[10px] font-semibold bg-surface-300 px-1.5 py-0.5 rounded border border-white/5">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Visualizer */}
                  <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden border border-white/[0.02]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    />
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
