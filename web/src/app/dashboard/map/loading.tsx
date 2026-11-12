import {
  MapPanelSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeadingSkeleton />
      <MapPanelSkeleton heightClassName="h-[calc(100vh-14rem)] min-h-[500px]" />
    </div>
  );
}
