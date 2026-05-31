"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function CitizenNotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              {unreadCount} unread
            </span>
            <span className="text-xs text-gray-400">showing recent alerts</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            aria-label="Mark all notifications as read"
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <div className="mx-auto mb-3 h-16 w-16 flex items-center justify-center rounded-lg bg-gray-100">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 text-sm font-medium">
            No notifications yet
          </p>
          <p className="text-gray-400 text-xs mt-1">
            We will alert you when your reports are updated.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
                n.isRead ? "bg-white" : "bg-blue-50 shadow-sm"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 ${n.isRead ? "bg-gray-100" : "bg-blue-100"}`}
              >
                <span className="text-lg">{typeIcons[n.type] || "🔔"}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${n.isRead ? "text-gray-700" : "font-semibold text-gray-900"}`}
                  >
                    {n.title}
                  </h3>
                  <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600 truncate">
                  {n.message}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {n.reportId && (
                    <Link href="/citizen/my-reports">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-sm"
                      >
                        View Report
                      </Button>
                    </Link>
                  )}

                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-sm"
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
