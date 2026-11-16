"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  DASHBOARD_PERIODS,
  DEFAULT_DASHBOARD_RANGE,
  type DashboardRange,
} from "@/lib/dashboard-period";

export function DashboardDateFilter({ range }: { range: DashboardRange }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nextRange, setNextRange] = useState(range);
  const [isPending, startTransition] = useTransition();

  function changeRange(value: DashboardRange) {
    setNextRange(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_DASHBOARD_RANGE) params.delete("range");
    else params.set("range", value);
    const query = params.toString();
    startTransition(() => router.push(query ? `/dashboard?${query}` : "/dashboard", { scroll: false }));
  }

  return (
    <div className="space-y-1">
      <label htmlFor="dashboard-date-range" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
        Date Range
      </label>
      <div className="relative flex items-center">
        <Calendar aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
        <select
          id="dashboard-date-range"
          value={isPending ? nextRange : range}
          onChange={(event) => changeRange(event.target.value as DashboardRange)}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
        >
          {Object.entries(DASHBOARD_PERIODS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <span role="status" className="sr-only">{isPending ? "Updating dashboard date range" : ""}</span>
    </div>
  );
}
