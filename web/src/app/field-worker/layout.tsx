"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Bell,
  User,
  Calendar,
  Settings,
} from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { FieldWorkerLayoutSkeleton } from "@/components/skeletons/page-skeletons";
import { LiveNotificationProvider } from "@/contexts/LiveNotificationContext";
import { LiveNotificationPanel } from "@/components/LiveNotificationPanel";
import { DashboardThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";

const navLinks = [
  { href: "/field-worker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/field-worker/tasks", label: "My Tasks", icon: ClipboardList },
  { href: "/field-worker/schedules", label: "My Schedules", icon: Calendar },
  { href: "/field-worker/notifications", label: "Notifications", icon: Bell },
];

export default function FieldWorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: unreadData } = useUnreadCount();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (!isLoading && user && user.role !== "FIELD_WORKER") {
      router.push("/citizen/report");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <FieldWorkerLayoutSkeleton />;
  }

  if (!user || user.role !== "FIELD_WORKER") return null;

  const isActive = (href: string) => {
    if (href === "/field-worker") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <DashboardThemeProvider>
      <LiveNotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
          {/* Sidebar */}
          <aside
            className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 border-r border-white/70 bg-white/65 dark:border-slate-800 dark:bg-slate-900/85 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(51,65,85,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.22)_1px,transparent_1px)] [background-size:30px_30px] shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ease-in-out z-40 ${
              isCollapsed ? "md:w-20" : "md:w-64"
            }`}
          >
            <div
              className={`flex items-center border-b border-white/70 dark:border-slate-800 ${
                isCollapsed
                  ? "h-24 justify-center px-2 flex-col gap-2"
                  : "h-16 justify-between px-4"
              }`}
            >
              {!isCollapsed && (
                <Link href="/field-worker" className="flex items-center space-x-2">
                  <Image
                    src="/logo-bluewaste.png"
                    alt="BlueWaste logo"
                    width={36}
                    height={36}
                    quality={100}
                    sizes="36px"
                    className="h-9 w-9 rounded-lg object-contain"
                  />
                  <span className="text-xl font-bold">
                    <span className="text-primary">Blue</span>
                    <span className="text-gray-900 dark:text-white">Waste</span>
                  </span>
                </Link>
              )}

              {isCollapsed && (
                <Link
                  href="/field-worker"
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                >
                  <Image
                    src="/logo-bluewaste.png"
                    alt="BlueWaste logo"
                    width={36}
                    height={36}
                    quality={100}
                    sizes="36px"
                    className="h-9 w-9 object-contain"
                  />
                </Link>
              )}

              <button
                onClick={() => setIsCollapsed((prev) => !prev)}
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
                className="p-1.5 rounded-lg text-gray-600 dark:text-slate-400 transition-colors hover:bg-gray-100/80 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "border border-white/60 dark:border-primary/50 bg-primary text-white shadow-[0_6px_18px_rgba(37,99,235,0.35)] backdrop-blur-md"
                        : "text-gray-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span
                      className={`transition-all duration-300 whitespace-nowrap ${
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : ""
                      }`}
                    >
                      {link.label}
                    </span>
                    {link.href === "/field-worker/notifications" &&
                      unreadData &&
                      unreadData.count > 0 && (
                        <span
                          className={`bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${
                            isCollapsed
                              ? "absolute top-2 right-2 h-4 w-4"
                              : "ml-auto h-5 w-5"
                          }`}
                        >
                          {unreadData.count > 9 ? "9+" : unreadData.count}
                        </span>
                      )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/70 dark:border-slate-800">
              <div
                className={`flex items-center ${
                  isCollapsed ? "flex-col space-y-2" : "space-x-3"
                }`}
              >
                <Link
                  href="/field-worker/profile"
                  className="rounded-full border border-white/80 bg-white/75 dark:border-slate-700 dark:bg-slate-800 shadow-sm backdrop-blur-md flex items-center justify-center flex-shrink-0 w-9 h-9 overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                  title="Account Settings"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.firstName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  )}
                </Link>
                {!isCollapsed && (
                  <Link
                    href="/field-worker/profile"
                    className="flex-1 min-w-0 group"
                    title="Account Settings"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Field Worker</p>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className={`text-gray-400 dark:text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400 ${
                    isCollapsed ? "mx-auto" : ""
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>

          <div
            className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? "md:pl-20" : "md:pl-64"
            }`}
          >
            {/* Top Nav */}
            <header className="sticky top-0 z-30 border-b bg-white dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between h-16 px-4 md:px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    title="Toggle menu"
                    className="md:hidden relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                    ) : (
                      <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                    )}
                    {!mobileMenuOpen && unreadData && unreadData.count > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  <Link
                    href="/field-worker"
                    className="flex items-center gap-2 md:hidden"
                  >
                    <Image
                      src="/logo-bluewaste.png"
                      alt="BlueWaste logo"
                      width={36}
                      height={36}
                      quality={100}
                      sizes="36px"
                      className="h-9 w-9 rounded-md object-contain"
                    />
                    <span className="font-bold">
                      <span className="text-primary">Blue</span>
                      <span className="text-black dark:text-white">Waste</span>
                    </span>
                  </Link>

                  <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                    Field Operations
                  </div>
                </div>

                {/* Right controls: Theme toggle + notification bell + user info */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <ThemeToggle />
                  <NotificationBell href="/field-worker/notifications" />

                  {/* Desktop User Info */}
                  <div className="hidden md:flex items-center gap-3 relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors focus:outline-none"
                    >
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.firstName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </button>

                    {profileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setProfileMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg dark:shadow-slate-950/60 border dark:border-slate-800 py-2 z-50 overflow-hidden">
                          <div className="px-4 py-2 border-b dark:border-slate-800 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/field-worker/profile"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              logout();
                              router.push("/");
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile: User + menu */}
                  <div className="md:hidden flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-slate-300">{user.firstName}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white dark:bg-slate-900 dark:border-slate-800">
                  <nav className="px-4 py-3 space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold"
                              : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {link.label}
                          {link.href === "/field-worker/notifications" &&
                            unreadData &&
                            unreadData.count > 0 && (
                              <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadData.count}
                              </span>
                            )}
                        </Link>
                      );
                    })}
                    <Link
                      href="/field-worker/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive("/field-worker/profile")
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold"
                          : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </header>

            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
        <LiveNotificationPanel />
      </LiveNotificationProvider>
    </DashboardThemeProvider>
  );
}
