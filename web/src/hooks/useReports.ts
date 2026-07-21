import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Report,
  PaginatedResponse,
  MapReport,
  HeatmapPoint,
  ReportStatus,
  WasteCategory,
} from "@/types";

interface ReportFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  category?: WasteCategory;
  isSpam?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function useReports(filters: ReportFilters = {}) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: ["reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get(`/reports?${params.toString()}`);
      return data;
    },
  });
}

export function useReport(id: string) {
  return useQuery<Report>({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useMyReports(
  filters: { page?: number; status?: ReportStatus } = {},
) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: ["my-reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      const { data } = await api.get(
        `/reports/my-reports?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useMapData(filters?: {
  status?: ReportStatus;
  category?: WasteCategory;
  limit?: number;
}) {
  return useQuery<MapReport[]>({
    queryKey: ["map-data", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      if (!params.has("limit")) {
        params.append("limit", "5000");
      }
      const { data } = await api.get(`/reports/map?${params.toString()}`);
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useHeatmapData() {
  return useQuery<HeatmapPoint[]>({
    queryKey: ["heatmap-data"],
    queryFn: async () => {
      const { data } = await api.get("/reports/heatmap?limit=8000");
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: {
      title: string;
      description: string;
      // backend expects "with_waste" | "no_waste" for category
      category: WasteCategory | "with_waste" | "no_waste";
      latitude: number;
      longitude: number;
      address?: string;
      isAnonymous?: boolean;
      /** Pre-computed severity from the client-side YOLO /analyze pipeline */
      severity?: "CRITICAL" | "HIGH" | "MODERATE" | "SPAM" | null;
      /** Pre-computed status from client-side analysis */
      analysisStatus?: "DIRTY" | "CLEAN" | null;
      /** Pre-computed confidence (0.0–1.0) from client-side analysis */
      analysisConfidence?: number | null;
      /** Number of waste items detected */
      analysisWasteCount?: number | null;
      aiModel?: string | null;
      aiCategories?: string[] | null;
      aiReason?: string | null;
      aiProcessingMs?: number | null;
      aiGeminiMs?: number | null;
    }) => {
      const { data } = await api.post("/reports", reportData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ReportStatus;
      notes?: string;
    }) => {
      const { data } = await api.put(`/reports/${id}/status`, {
        status,
        notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}

export function useAssignWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      assignedToId,
    }: {
      reportId: string;
      assignedToId: string;
    }) => {
      const { data } = await api.put(`/reports/${reportId}/assign`, {
        assignedToId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useUploadReportImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      files,
      type,
    }: {
      reportId: string;
      files: File[];
      type?: string;
    }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      if (type) formData.append("type", type);
      const { data } = await api.post(`/reports/${reportId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useAssignedReports(
  filters: { page?: number; status?: ReportStatus } = {},
) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: ["assigned-reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      const { data } = await api.get(`/reports/assigned?${params.toString()}`);
      return data;
    },
  });
}

export function useRestoreSpamReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/reports/${id}/restore-spam`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useDeleteSpamReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/reports/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}
