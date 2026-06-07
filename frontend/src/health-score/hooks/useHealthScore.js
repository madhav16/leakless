import { useQuery } from '@tanstack/react-query';
import { getHealthScore, getHealthBreakdown } from '../healthScore.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useHealthScore() {
  return useQuery({
    queryKey: QUERY_KEYS.healthScore.score(),
    queryFn: getHealthScore,
  });
}

export function useHealthBreakdown() {
  return useQuery({
    queryKey: QUERY_KEYS.healthScore.breakdown(),
    queryFn: getHealthBreakdown,
  });
}
