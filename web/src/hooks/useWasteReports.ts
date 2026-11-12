import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse, WasteReport } from "@/types";

export function useMyWasteReports(
  filters: { page?: number; limit?: number } = {},
) {
  return useQuery<PaginatedResponse<WasteReport>>({
    queryKey: ["waste-reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const { data } = await api.get(
        `/waste-reports/my-reports?${params.toString()}`,
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
