import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../notification.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useNotifications(filters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.list(filters),
    queryFn: () => getNotifications(filters),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() });
    },
  });
}
