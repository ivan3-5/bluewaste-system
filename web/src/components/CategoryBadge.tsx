import {
  ADMIN_REPORT_CATEGORY_LABELS,
  type AdminReportCategory,
} from "@/lib/admin-report";

export function CategoryBadge({ category }: { category: AdminReportCategory }) {
  const isWaste = category === "with_waste";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        isWaste
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {ADMIN_REPORT_CATEGORY_LABELS[category]}
    </span>
  );
}
