import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CleanupScheduleStatus, PaginatedResponse, ReportStatus } from "@/types";
import type { SeverityLevel } from "@/components/SeverityBadge";
import type { UserRecord } from "./useUsers";

export interface UserProfile extends UserRecord {
  address: string;
}

export interface UserReportHistoryItem {
  id: string;
  title: string;
  address: string | null;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  severity: SeverityLevel;
  createdAt: string;
  isSpam: boolean;
  isDeleted: boolean;
}

export interface UserScheduleHistoryItem {
  assignedAt: string;
  schedule: {
    id: string;
    title: string;
    barangay: string;
    scheduledAt: string;
    status: CleanupScheduleStatus;
    reports: { id: string; title: string }[];
    _count: { reports: number };
  };
}

export type HistoryItems = {
  reports: UserReportHistoryItem;
  schedules: UserScheduleHistoryItem;
};

export interface HistoryFilters {
  page: number;
  limit: number;
  search: string;
  sort: "asc" | "desc";
  status: string;
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ["users", id, "profile"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<UserProfile>(`/users/${encodeURIComponent(id)}`, { signal });
      return data;
    },
  });
}

export function useUserHistory<K extends keyof HistoryItems>(
  id: string,
  resource: K,
  { page, limit, search, sort, status }: HistoryFilters,
) {
  return useQuery({
    queryKey: [resource, "user-history", id, { page, limit, search, sort, status }],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PaginatedResponse<HistoryItems[K]>>(
        `/users/${encodeURIComponent(id)}/${resource}`,
        { signal, params: { page, limit, sort, search: search || undefined, status: status || undefined } },
      );
      return data;
    },
  });
}
