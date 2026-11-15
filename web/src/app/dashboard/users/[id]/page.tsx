"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { DataTableSkeleton, PageHeadingSkeleton } from "@/components/skeletons/page-skeletons";
import { UserRoleBadge, UserStatusBadge } from "@/components/users/UserBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useUserHistory,
  useUserProfile,
  type HistoryItems,
  type UserReportHistoryItem,
  type UserScheduleHistoryItem,
} from "@/hooks/useUserHistory";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatDateTime } from "@/lib/utils";
import { REPORT_STATUS_LABELS, SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from "@/types";

const panel = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";
const heading = "text-lg font-bold text-slate-900 dark:text-slate-100";
const row = "grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] lg:items-start";
const metaGrid = "grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-3";

function Metadata({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function LoadError({ error, message, retry }: { error: unknown; message: string; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
      <p>{getApiErrorMessage(error, message)}</p>
      <Button variant="outline" size="sm" onClick={retry}>Retry</Button>
    </div>
  );
}

function HistorySection<Resource extends keyof HistoryItems>({
  id,
  resource,
  title,
  statusLabels,
  renderItem,
}: {
  id: string;
  resource: Resource;
  title: string;
  statusLabels: Record<string, string>;
  renderItem: (item: HistoryItems[Resource]) => ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const history = useUserHistory(id, resource, { page, limit, search, sort, status });
  const pagination = history.data?.pagination;

  return (
    <section aria-labelledby={`${resource}-heading`} className={panel}>
      <div className="space-y-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
        <h2 id={`${resource}-heading`} className={heading}>{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <form
            className="flex w-full min-w-0 items-center gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(draft.trim());
              setPage(1);
            }}
          >
            <Input
              type="search"
              value={draft}
              maxLength={150}
              onChange={(event) => setDraft(event.target.value)}
              aria-label={`Search ${resource}`}
              placeholder="Search ID, title or location"
              className="min-w-0 rounded-xl sm:w-56"
            />
            <Button type="submit" variant="outline" size="sm" className="rounded-xl">
              <Search aria-hidden="true" className="mr-1.5 h-4 w-4" /> Search
            </Button>
          </form>
          <Select
            value={status || "all"}
            onValueChange={(value) => { setStatus(value === "all" ? "" : value); setPage(1); }}
          >
            <SelectTrigger aria-label={`Filter ${resource} by status`} className="w-auto min-w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value: "asc" | "desc") => { setSort(value); setPage(1); }}
          >
            <SelectTrigger aria-label={`Sort ${resource} by date`} className="w-auto min-w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          {(draft || search || status || sort !== "desc") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDraft(""); setSearch(""); setStatus(""); setSort("desc"); setPage(1); }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {history.isPending ? (
        <div className="p-4" role="status">
          <span className="sr-only">Loading {resource}</span>
          <DataTableSkeleton rows={3} cols={3} />
        </div>
      ) : history.isError ? (
        <div className="p-4">
          <LoadError error={history.error} message={`Could not load ${resource}.`} retry={() => void history.refetch()} />
        </div>
      ) : history.data.data.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {search || status ? `No ${resource} match the current filters.` :
            resource === "reports" ? "No reports are attributed to this account." : "This worker has no cleanup schedule assignments."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {history.data.data.map(renderItem)}
        </ul>
      )}

      {pagination && pagination.total > 0 && (
        <div className="border-t border-slate-100 px-4 pb-3 dark:border-slate-800">
          <PaginationControls
            currentPage={pagination.page}
            totalRecords={pagination.total}
            totalPages={pagination.totalPages}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
            itemName={resource}
            compact
          />
        </div>
      )}
    </section>
  );
}

function ReportRow({ report }: { report: UserReportHistoryItem }) {
  return (
    <li className={row}>
      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold">{report.title}</h3>
        <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">{report.id}</p>
      </div>
      <dl className={metaGrid}>
        <Metadata label="Submitted">{formatDateTime(report.createdAt)}</Metadata>
        <Metadata label="Location">{report.address?.trim() || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}</Metadata>
        <Metadata label="Status">
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={report.status} />
            {report.isDeleted && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Deleted
              </span>
            )}
            <SeverityBadge severity={report.isSpam ? "SPAM" : report.severity} showEmoji={false} />
          </span>
        </Metadata>
      </dl>
      <Button asChild variant="outline" size="sm" className="w-fit rounded-lg">
        <Link href={`/dashboard/reports/${encodeURIComponent(report.id)}`} aria-label={`View Report: ${report.title}`}>
          View Report
        </Link>
      </Button>
    </li>
  );
}

function ScheduleRow({ assignment }: { assignment: UserScheduleHistoryItem }) {
  const { schedule, assignedAt } = assignment;
  const color = SCHEDULE_STATUS_COLORS[schedule.status];
  const moreReports = schedule._count.reports - schedule.reports.length;

  return (
    <li className={row}>
      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold">{schedule.title}</h3>
        <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">{schedule.id}</p>
      </div>
      <dl className={metaGrid}>
        <Metadata label="Assigned">{formatDateTime(assignedAt)}</Metadata>
        <Metadata label="Scheduled for">{formatDateTime(schedule.scheduledAt)}</Metadata>
        <Metadata label="Location">{schedule.barangay}</Metadata>
        <Metadata label="Status">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ color, backgroundColor: `${color}15`, borderColor: `${color}35` }}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
            {SCHEDULE_STATUS_LABELS[schedule.status]}
          </span>
        </Metadata>
        <Metadata label="Related Reports">
          {schedule.reports.length === 0 ? "None" : (
            <ul className="space-y-1">
              {schedule.reports.map((report) => (
                <li key={report.id}>
                  <Link href={`/dashboard/reports/${encodeURIComponent(report.id)}`} className="text-primary underline-offset-4 hover:underline">
                    {report.title}
                  </Link>
                </li>
              ))}
              {moreReports > 0 && <li className="text-xs text-slate-500 dark:text-slate-400">+{moreReports} more</li>}
            </ul>
          )}
        </Metadata>
      </dl>
      <Button asChild variant="outline" size="sm" className="w-fit rounded-lg">
        <Link href={`/dashboard/schedules?scheduleId=${encodeURIComponent(schedule.id)}`} aria-label={`View Schedule: ${schedule.title}`}>
          View Schedule
        </Link>
      </Button>
    </li>
  );
}

export default function UserHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const profile = useUserProfile(id);
  const user = profile.data;

  return (
    <div className="min-w-0 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/dashboard/users" className="hover:text-primary hover:underline">User Management</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page" className="font-medium text-slate-900 dark:text-slate-100">User History</span>
      </nav>
      {profile.isPending ? (
        <div className="space-y-6" role="status">
          <span className="sr-only">Loading user details</span>
          <PageHeadingSkeleton />
          <DataTableSkeleton rows={3} cols={3} />
        </div>
      ) : (
        <>
          <PageHeader
            title={user ? `${user.firstName} ${user.lastName}` : "User History"}
            actions={
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard/users"><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" /> Back to User Management</Link>
              </Button>
            }
          />
          {profile.isError ? (
            <LoadError error={profile.error} message="Could not load user details." retry={() => void profile.refetch()} />
          ) : user && (
            <>
              <section aria-labelledby="account-heading" className={`${panel} p-4 sm:p-5`}>
                <h2 id="account-heading" className={heading}>Account Information</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Metadata label="Email">{user.email}</Metadata>
                  <Metadata label="Role"><UserRoleBadge role={user.role} /></Metadata>
                  <Metadata label="Account Status"><UserStatusBadge isActive={user.isActive} /></Metadata>
                  <Metadata label="Registered">{formatDateTime(user.createdAt)}</Metadata>
                  <Metadata label="Phone">{user.phone || "—"}</Metadata>
                  <Metadata label="Address">{user.address || "—"}</Metadata>
                </dl>
              </section>
              <HistorySection
                key={`reports-${id}`}
                id={id}
                resource="reports"
                title="Report History"
                statusLabels={REPORT_STATUS_LABELS}
                renderItem={(report) => <ReportRow key={report.id} report={report} />}
              />
              {user.role === "FIELD_WORKER" && (
                <HistorySection
                  key={`schedules-${id}`}
                  id={id}
                  resource="schedules"
                  title="Worker Schedule History"
                  statusLabels={SCHEDULE_STATUS_LABELS}
                  renderItem={(item) => <ScheduleRow key={item.schedule.id} assignment={item} />}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
