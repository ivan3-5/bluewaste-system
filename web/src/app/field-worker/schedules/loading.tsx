import {
  PageHeadingSkeleton,
  ScheduleListSkeleton,
} from "@/components/skeletons/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeadingSkeleton />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg p-1 inline-flex shadow-sm border border-slate-200 dark:border-slate-800 gap-1">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <ScheduleListSkeleton count={5} />
    </div>
  );
}

