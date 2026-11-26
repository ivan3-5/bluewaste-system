import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types";

export type ActivityCategory =
  | "AUTH"
  | "USER"
  | "REPORT"
  | "SCHEDULE"
  | "ZONE"
  | "SYSTEM";

export interface ActivityLogUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export interface ActivityLogRecord {
  id: string;
  userId?: string | null;
  userName: string;
  userRole: string;
  action: string;
  category: ActivityCategory;
  description: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: ActivityLogUser | null;
}

export interface ActivityLogsFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  userRole?: string;
  category?: ActivityCategory | "";
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogFilterOptions {
  actions: string[];
  users: { id: string; name: string; role: string }[];
  categories: ActivityCategory[];
  roles: string[];
}

export function useActivityLogs(filters: ActivityLogsFilters = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    userId,
    userRole,
    category,
    action,
    startDate,
    endDate,
  } = filters;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (userId) params.set("userId", userId);
  if (userRole) params.set("userRole", userRole);
  if (category) params.set("category", category);
  if (action) params.set("action", action);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  return useQuery<PaginatedResponse<ActivityLogRecord>>({
    queryKey: [
      "activity-logs",
      { page, limit, search, userId, userRole, category, action, startDate, endDate },
    ],
    queryFn: async () => {
      const { data } = await api.get(`/activity-logs?${params.toString()}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useActivityLogFilters() {
  return useQuery<ActivityLogFilterOptions>({
    queryKey: ["activity-logs-filters"],
    queryFn: async () => {
      const { data } = await api.get("/activity-logs/filters");
      return data;
    },
    staleTime: 60_000,
  });
}
