import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse, Notification } from "@/types";

export function useNotifications(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      const { data } = await api.get(
        `/notifications?page=${page}&limit=${limit}`,
      );
      return data;
    },
    refetchInterval: 20000, // Poll every 20s while active tab
    refetchIntervalInBackground: false, // Suspend polling when tab is inactive
    staleTime: 10000,
    placeholderData: keepPreviousData,
  });
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread-count");
      return data;
    },
    refetchInterval: 30000, // Poll every 30s while active tab
    refetchIntervalInBackground: false,
    staleTime: 15000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      // Invalidate both notifications and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      // Invalidate both notifications and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}
