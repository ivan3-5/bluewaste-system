import {
  MapPanelSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <PageHeadingSkeleton />
      <MapPanelSkeleton heightClassName="h-96 md:h-[600px]" />
    </div>
  );
}

