import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';

/**
 * Error boundary for lazy-loaded routes.
 *
 * Catches chunk-load failures (`ChunkLoadError` / "Failed to fetch dynamically
 * imported module"), which are common on flaky networks or when a deploy
 * invalidates cached chunk hashes and a user with a stale tab tries to
 * navigate. Without a boundary the whole app white-screens; here we render a
 * Retry control inside the content area so the sidebar stays usable.
 *
 * Retry performs a hard reload — the most reliable recovery, since it re-fetches
 * the current HTML and the fresh chunk hashes pointing at chunks that still
 * exist on the server.
 */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const error = this.state.error;
    const isChunkLoadFailure =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk|Failed to fetch dynamically imported module/i.test(error?.message ?? '');

    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center text-center max-w-sm">
          <div className="p-2.5 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-300 mb-1">
              {isChunkLoadFailure ? "Couldn't load this page" : 'Something went wrong'}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {isChunkLoadFailure
              ? 'A required part of the app failed to download. Check your connection and try again.'
              : error?.message ?? 'An unexpected error occurred while loading this page.'}
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload page</span>
          </Button>
        </div>
      </div>
    );
  }
}
