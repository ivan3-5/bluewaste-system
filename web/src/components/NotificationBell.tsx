"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { data: unreadData } = useUnreadCount();

  const unreadCount = unreadData?.count || 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
      title="View notifications"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
