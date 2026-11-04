import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/api";
import { PaginatedResponse, Notification } from "@/types";

export function useNotifications(page: number = 1, limit: number = 10) {
  const queryClient = useQueryClient();

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", page, limit],
      });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [page, limit, queryClient]);

  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      const { data } = await api.get(
        `/notifications?page=${page}&limit=${limit}`,
      );
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
    refetchIntervalInBackground: true, // Keep polling even when window is not focused
    staleTime: 2000, // Consider data stale after 2 seconds
  });
}

export function useUnreadCount() {
  const queryClient = useQueryClient();

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread-count");
      return data;
    },
    refetchInterval: 3000, // Poll every 3 seconds for unread count
    refetchIntervalInBackground: true,
    staleTime: 1000,
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
