import { useQuery } from '@tanstack/react-query';
import { getTrialWatchlist } from '../trialWatchlist.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Fetch active trials ending within the given window.
 * @param {number} [days=30]
 */
export function useTrialWatchlist(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.trialWatchlist.list(days),
    queryFn: () => getTrialWatchlist(days),
  });
}
