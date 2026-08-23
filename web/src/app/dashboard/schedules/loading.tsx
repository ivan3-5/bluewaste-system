import {
  DashboardLayoutSkeleton,
  SchedulePageSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <DashboardLayoutSkeleton>
      <SchedulePageSkeleton />
    </DashboardLayoutSkeleton>
  );
}
