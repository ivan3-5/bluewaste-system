import { MyReportsSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <MyReportsSkeleton />
      </div>
    </div>
  );
}

