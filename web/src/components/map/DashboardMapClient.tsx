"use client";

import dynamic from "next/dynamic";
import { MapPanelSkeleton } from "@/components/skeletons/page-skeletons";
import type { AdminReport } from "@/lib/admin-report";
import type { DashboardRange } from "@/lib/dashboard-period";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <MapPanelSkeleton heightClassName="h-[calc(100vh-140px)]" />,
});

export function DashboardMapClient({
  reports,
  dateRange,
}: {
  reports: AdminReport[];
  dateRange: DashboardRange;
}) {
  return <MapView reports={reports} dateRange={dateRange} />;
}

