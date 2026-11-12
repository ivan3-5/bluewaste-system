import {
  NotificationListSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeadingSkeleton />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <NotificationListSkeleton rows={6} />
    </div>
  );
}

