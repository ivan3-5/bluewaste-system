"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuth } from "@/providers/AuthProvider";

type NotificationBellProps = {
  href?: string;
  className?: string;
};

export function NotificationBell({ href, className }: NotificationBellProps = {}) {
  const { user } = useAuth();
  const { data: unreadData } = useUnreadCount();

  const unreadCount = unreadData?.count || 0;
  const targetHref =
    href ||
    (user?.role === "FIELD_WORKER"
      ? "/field-worker/notifications"
      : user?.role === "CITIZEN"
        ? "/citizen/notifications"
        : "/dashboard/notifications");

  return (
    <Link
      href={targetHref}
      className={`relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${className || ""}`}
      aria-label="Notifications"
      title="View notifications"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
