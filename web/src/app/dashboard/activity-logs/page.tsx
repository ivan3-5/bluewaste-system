"use client";

import { useState, useRef } from "react";
import {
  Search,
  ScrollText,
  Filter,
  RotateCcw,
  Calendar as CalendarIcon,
  ShieldCheck,
  User as UserIcon,
  FileText,
  MapPin,
  Settings,
  Lock,
} from "lucide-react";
import {
  useActivityLogs,
  useActivityLogFilters,
  ActivityCategory,
  ActivityLogRecord,
} from "@/hooks/useActivityLogs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";

const FIELD_CLASS =
  "rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500";

const TH_CLASS =
  "sticky top-0 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800 shadow-xs";

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; className: string; icon: typeof Lock }
> = {
  AUTH: {
    label: "Authentication",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70",
    icon: Lock,
  },
  USER: {
    label: "User Account",
    className:
      "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/70",
    icon: UserIcon,
  },
  REPORT: {
    label: "Waste Report",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70",
    icon: FileText,
  },
  SCHEDULE: {
    label: "Cleanup Schedule",
    className:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70",
    icon: CalendarIcon,
  },
  ZONE: {
    label: "Reporting Zone",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/70",
    icon: MapPin,
  },
  SYSTEM: {
    label: "System",
    className:
      "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: Settings,
  },
};

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  LGU_ADMIN: {
    label: "LGU Admin",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60",
  },
  FIELD_WORKER: {
    label: "Field Worker",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200/70 dark:border-green-800/60",
  },
  CITIZEN: {
    label: "Citizen",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/70 dark:border-slate-700",
  },
  ANONYMOUS: {
    label: "Anonymous",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60",
  },
  SYSTEM: {
    label: "System",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/70 dark:border-slate-700",
  },
};

function formatActionLabel(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ActivityLogsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-64 hidden md:block" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [category, setCategory] = useState<ActivityCategory | "">("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const debounceRef = useRef<NodeJS.Timeout>();

  const { data, isLoading, isFetching } = useActivityLogs({
    page,
    limit: pageSize,
    search: search || undefined,
    userId: userId || undefined,
    userRole: userRole || undefined,
    category: category || undefined,
    action: action || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: filterOptions } = useActivityLogFilters();

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const hasActiveFilters = Boolean(
    search || userId || userRole || category || action || startDate || endDate,
  );

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setUserId("");
    setUserRole("");
    setCategory("");
    setAction("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  if (isLoading && !data) {
    return <ActivityLogsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Monitor system-wide user actions, report lifecycle events, cleanup schedules, and administrative changes."
        actions={
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Immutable Audit Trail</span>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Search &amp; Filters</span>
            {isFetching && (
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by user, description, action, or record ID..."
              aria-label="Search activity logs"
              className={cn("pl-9", FIELD_CLASS)}
            />
          </div>

          {/* Filter by User */}
          <Select
            value={userId || "ALL"}
            onValueChange={(val) => {
              setUserId(val === "ALL" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by user" className={FIELD_CLASS}>
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              {(filterOptions?.users ?? []).map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter by Role */}
          <Select
            value={userRole || "ALL"}
            onValueChange={(val) => {
              setUserRole(val === "ALL" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by role" className={FIELD_CLASS}>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {(filterOptions?.roles ?? [
                "LGU_ADMIN",
                "FIELD_WORKER",
                "CITIZEN",
                "ANONYMOUS",
                "SYSTEM",
              ]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_BADGES[r]?.label ?? r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter by Category */}
          <Select
            value={category || "ALL"}
            onValueChange={(val) => {
              setCategory(val === "ALL" ? "" : (val as ActivityCategory));
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by category" className={FIELD_CLASS}>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {(Object.keys(CATEGORY_META) as ActivityCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_META[cat].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter by Activity Type / Action */}
          <Select
            value={action || "ALL"}
            onValueChange={(val) => {
              setAction(val === "ALL" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by activity type" className={FIELD_CLASS}>
              <SelectValue placeholder="All Activity Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Activity Types</SelectItem>
              {(filterOptions?.actions ?? []).map((act) => (
                <SelectItem key={act} value={act}>
                  {formatActionLabel(act)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Start Date */}
          <div>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              aria-label="Start date"
              title="From date"
              className={FIELD_CLASS}
            />
          </div>

          {/* End Date */}
          <div>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              aria-label="End date"
              title="To date"
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <ScrollText className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No activity logs found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {hasActiveFilters
                ? "No recorded activities match your current search or filter criteria."
                : "System activities will appear here automatically as users interact with BlueWaste."}
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-4 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={TH_CLASS}>User</th>
                    <th className={TH_CLASS}>Activity Description</th>
                    <th className={TH_CLASS}>Category &amp; Action</th>
                    <th className={TH_CLASS}>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {logs.map((log: ActivityLogRecord) => {
                    const catMeta =
                      CATEGORY_META[log.category] ?? CATEGORY_META.SYSTEM;
                    const CatIcon = catMeta.icon;
                    const roleMeta = ROLE_BADGES[log.userRole] ?? {
                      label: log.userRole,
                      className:
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                    };

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">
                              {getInitials(log.userName)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {log.userName}
                              </div>
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[11px] font-medium border",
                                  roleMeta.className,
                                )}
                              >
                                {roleMeta.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                            {log.description}
                          </p>
                          {log.entityId && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                              {log.entityType ? `${log.entityType}: ` : ""}
                              {log.entityId}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                catMeta.className,
                              )}
                            >
                              <CatIcon className="h-3 w-3" />
                              {catMeta.label}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                              {formatActionLabel(log.action)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-top whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log: ActivityLogRecord) => {
                const catMeta =
                  CATEGORY_META[log.category] ?? CATEGORY_META.SYSTEM;
                const CatIcon = catMeta.icon;
                const roleMeta = ROLE_BADGES[log.userRole] ?? {
                  label: log.userRole,
                  className:
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                };

                return (
                  <div key={log.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">
                          {getInitials(log.userName)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {log.userName}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                              roleMeta.className,
                            )}
                          >
                            {roleMeta.label}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                          catMeta.className,
                        )}
                      >
                        <CatIcon className="h-3 w-3" />
                        {catMeta.label}
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatActionLabel(log.action)}</span>
                      <span>{formatDateTime(log.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.total > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
                <PaginationControls
                  currentPage={pagination.page}
                  totalRecords={pagination.total}
                  pageSize={pagination.limit}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  itemName="activities"
                  disabled={isFetching}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
