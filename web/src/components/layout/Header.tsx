"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Bell, Menu, LogOut, Settings } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isLGUAdmin = user?.role === "LGU_ADMIN";
  const isFieldWorker = user?.role === "FIELD_WORKER";

  return (
    <header className="sticky top-0 z-40 bg-white border-b dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile menu toggle */}
        <button
          title="Toggle mobile menu"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-200 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="md:hidden flex items-center space-x-2">
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
        </div>

        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
            {isLGUAdmin
              ? "Admin Dashboard"
              : isFieldWorker
                ? "Field Worker Portal"
                : "Citizen Portal"}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <NotificationBell />

          <div className="hidden md:flex items-center space-x-2 relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="User profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-primary">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg dark:shadow-slate-950/60 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b dark:border-slate-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {isLGUAdmin
                      ? "Administrator"
                      : isFieldWorker
                        ? "Field Worker"
                        : "Citizen"}
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
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
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-slate-900 dark:border-slate-800 py-2 px-4 space-y-1">
          {isAdmin ? (
            <>
              {isLGUAdmin && (
                <MobileLink
                  href="/dashboard"
                  label="Dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
              <MobileLink
                href="/dashboard/reports"
                label="Reports"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileLink
                href="/dashboard/map"
                label="Waste Map"
                onClick={() => setMobileMenuOpen(false)}
              />
              {isLGUAdmin && (
                <MobileLink
                  href="/dashboard/analytics"
                  label="Analytics"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
              <MobileLink
                href="/dashboard/notifications"
                label="Notifications"
                onClick={() => setMobileMenuOpen(false)}
              />
            </>
          ) : (
            <>
              <MobileLink
                href="/citizen/report"
                label="Submit Report"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileLink
                href="/citizen/my-reports"
                label="My Reports"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileLink
                href="/citizen/map"
                label="Waste Map"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileLink
                href="/citizen/notifications"
                label="Notifications"
                onClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
              router.push("/");
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
    >
      {label}
    </Link>
  );
}
