import {
  DashboardLayoutSkeleton,
  DataTableSkeleton,
  FilterToolbarSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <FilterToolbarSkeleton blocks={3} withSearch />
        <DataTableSkeleton rows={8} cols={7} />
      </div>
    </DashboardLayoutSkeleton>
  );
}
