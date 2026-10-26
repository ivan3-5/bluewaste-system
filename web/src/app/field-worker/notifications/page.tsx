"use client";

import { useState } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  NotificationListSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

const typeIcons: Record<string, string> = {
  NEW_REPORT: "📋",
  STATUS_CHANGE: "🔄",
  ASSIGNMENT: "👷",
  SYSTEM: "⚙️",
};

export default function FieldWorkerNotificationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useNotifications(page, pageSize);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const pagination = data?.pagination;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <NotificationListSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Bell className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-300 text-sm font-medium">
            No notifications yet
          </p>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
            You&apos;ll be notified when new tasks are assigned to you
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                n.isRead ? "" : "bg-blue-50/50 dark:bg-blue-950/20"
              }`}
            >
              <span className="text-lg mt-0.5 flex-shrink-0">
                {typeIcons[n.type] || "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      n.isRead ? "text-gray-700 dark:text-slate-300" : "font-semibold text-gray-900 dark:text-slate-100"
                    }`}
                  >
                    {n.title}
                  </h3>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{n.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  {n.reportId && (
                    <Link href={`/field-worker/tasks/${n.reportId}`}>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                      >
                        View Task
                      </Button>
                    </Link>
                  )}
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => markAsRead.mutate(n.id)}
                      disabled={markAsRead.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <PaginationControls
          currentPage={pagination.page}
          totalRecords={pagination.total}
          pageSize={pagination.limit || pageSize}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          itemName="notifications"
          className="mt-6 border-t border-gray-100 pt-4"
        />
      )}
    </div>
  );
}
