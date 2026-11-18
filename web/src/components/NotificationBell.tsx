"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  FileText,
  RefreshCw,
  HardHat,
  Settings,
  Inbox,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { useAuth } from "@/providers/AuthProvider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn, timeAgo } from "@/lib/utils";
import { getNotificationDestination } from "@/lib/notifications";
import type { Notification } from "@/types";

type NotificationBellProps = {
  href?: string;
  className?: string;
};

const typeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  NEW_REPORT: {
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/70",
    label: "Report",
  },
  STATUS_CHANGE: {
    icon: RefreshCw,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/70",
    label: "Status",
  },
  ASSIGNMENT: {
    icon: HardHat,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/70",
    label: "Assignment",
  },
  SYSTEM: {
    icon: Settings,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    label: "System",
  },
};

export function NotificationBell({ href, className }: NotificationBellProps = {}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData, isLoading } = useNotifications(1, 10);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count || 0;

  const targetHref =
    href ||
    (user?.role === "FIELD_WORKER"
      ? "/field-worker/notifications"
      : user?.role === "CITIZEN"
        ? "/citizen/notifications"
        : "/dashboard/notifications");

  // Sort latest first (descending by createdAt)
  const notifications = useMemo(() => {
    const list = notificationsData?.data ? [...notificationsData.data] : [];
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notificationsData?.data]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    setOpen(false);
    const destination = getNotificationDestination(notification, user?.role);
    router.push(destination);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            open && "bg-gray-100 dark:bg-slate-800",
            className,
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="w-[calc(100vw-1.5rem)] sm:w-[350px] max-w-[350px] p-0 overflow-hidden shadow-xl rounded-xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 z-50"
      >
        {/* Dropdown Header */}
        <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40">
                {unreadCount} unread
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Mark all notifications as read"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )}
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notifications Scrollable List */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/70">
          {isLoading && notifications.length === 0 ? (
            <div className="p-3 space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2.5 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5 py-0.5">
                    <div className="h-2.5 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 dark:bg-slate-800/60 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 px-3 text-center">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <Inbox className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                No notifications yet
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                You&apos;re all caught up! New alerts and updates will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.SYSTEM;
              const Icon = config.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(n);
                    }
                  }}
                  className={cn(
                    "flex items-start gap-2.5 px-3.5 py-2.5 transition-colors cursor-pointer text-left focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-800/60",
                    !n.isRead
                      ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
                      : "bg-white dark:bg-slate-900 hover:bg-gray-50/80 dark:hover:bg-slate-800/60",
                  )}
                >
                  {/* Type Icon */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs mt-0.5",
                      config.bgColor,
                      config.color,
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <p
                        className={cn(
                          "text-xs leading-snug line-clamp-1",
                          !n.isRead
                            ? "font-bold text-gray-900 dark:text-slate-100"
                            : "font-medium text-gray-700 dark:text-slate-300",
                        )}
                      >
                        {n.title}
                      </p>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0"
                            title="Unread notification"
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Metadata & Quick Actions */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500">
                        {n.reportId && (
                          <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[9px] text-gray-600 dark:text-slate-300">
                            #{n.reportId.slice(0, 6)}
                          </span>
                        )}
                        <span className="capitalize text-[10px]">{config.label}</span>
                      </div>

                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead.mutate(n.id);
                          }}
                          disabled={markAsRead.isPending}
                          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dropdown Footer */}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 rounded-b-xl">
          <Link
            href={targetHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full py-0.5 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors group"
          >
            <span>View all notifications</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
