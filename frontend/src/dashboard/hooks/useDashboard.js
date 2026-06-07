import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getSpendingTrends } from '../dashboard.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.stats(),
    queryFn: getDashboardStats,
  });
}

export function useSpendingTrends() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.trends(),
    queryFn: getSpendingTrends,
  });
}
