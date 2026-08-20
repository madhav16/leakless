import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';

/**
 * Compact in-card retry block for the Trial Watchlist dashboard widget.
 * Duplicated from dashboard/components/WidgetError to obey the
 * feature-scope rule (trial-watchlist must not import from dashboard/).
 *
 * @param {{ message?: string, onRetry?: () => void, className?: string }} props
 */
export default function TrialWidgetError({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}>
      <div className="p-2.5 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-300 mb-1">Couldn't load this widget</p>
      <p className="text-xs text-slate-500 max-w-xs mb-4">
        {message || 'We had trouble reaching the API. Please try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}
