"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAssignedReports } from "@/hooks/useReports";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { Button } from "@/components/ui/button";
import { ReportStatus, WASTE_CATEGORY_LABELS, Report } from "@/types";
import { timeAgo } from "@/lib/utils";
import {
  MapPin,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Clock,
  Image as ImageIcon,
  ClipboardList,
} from "lucide-react";
import {
  ListCardsSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILTERS: { value: ReportStatus | ""; label: string }[] = [
  { value: "", label: "All Tasks" },
  { value: "VERIFIED", label: "Verified" },
  { value: "CLEANUP_SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLEANED", label: "Completed" },
];

export default function TasksPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");

  const { data, isLoading } = useAssignedReports({
    page,
    status: statusFilter || undefined,
  });

  const reports = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Skeleton className="h-5 w-5 rounded-full" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ListCardsSkeleton rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              My Tasks
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Manage and track your assigned cleanup tasks
          </p>
        </div>

        {/* Task Counter summary optionally */}
        <div className="flex items-center gap-3 ml-11 md:ml-0">
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                Total Found
              </span>
              <span className="text-lg font-bold text-gray-900 leading-none mt-0.5">
                {pagination?.total || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 px-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks List */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-2xl border shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No tasks found
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {statusFilter
              ? "Try a different filter to see your assigned tasks."
              : "You have no tasks assigned to you right now. Grab a coffee!"}
          </p>
          {statusFilter && (
            <Button
              variant="outline"
              className="mt-6 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
              onClick={() => setStatusFilter("")}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {reports.map((report: Report) => (
            <Link
              key={report.id}
              href={`/field-worker/tasks/${report.id}`}
              className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-5 flex flex-col h-full gap-4">
                {/* Top header: status and time */}
                <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <StatusBadge status={report.status} />
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {timeAgo(report.createdAt)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex gap-4 sm:gap-5 mt-1">
                  {/* Image Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                    {report.images && report.images.length > 0 ? (
                      <Image
                        src={report.images[0].imageUrl}
                        alt="Report thumbnail"
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
                        <ImageIcon className="w-7 h-7 opacity-50" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">
                          No Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col py-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1.5 truncate group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 mb-2">
                      <div className="flex items-start gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                        <span className="line-clamp-2 leading-tight">
                          {report.address || "Location not provided"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-auto hidden sm:block">
                      {report.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className="inline-flex items-center whitespace-nowrap justify-center bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {WASTE_CATEGORY_LABELS[report.category] ||
                        report.category}
                    </span>
                    {report.images?.length > 1 && (
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        +{report.images.length - 1} photo
                        {report.images.length - 1 !== 1 && "s"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm font-bold text-white bg-primary px-4 py-2 rounded-lg whitespace-nowrap group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-300">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600 font-medium font-sans">
            Showing page{" "}
            <span className="font-bold text-gray-900">{pagination.page}</span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">
              {pagination.totalPages}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hover:bg-gray-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              className="hover:bg-gray-50"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
