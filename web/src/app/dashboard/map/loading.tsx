import {
  DashboardLayoutSkeleton,
  MapPanelSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <MapPanelSkeleton heightClassName="h-[500px] sm:h-[600px]" />
      </div>
    </DashboardLayoutSkeleton>
  );
}
