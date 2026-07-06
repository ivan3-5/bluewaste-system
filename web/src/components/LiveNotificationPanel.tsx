"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
  X,
} from "lucide-react";
import { useLiveNotifications, ToastNotification } from "@/contexts/LiveNotificationContext";

// ─── Icon + colour map ────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastNotification["variant"],
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    bar: string;
    title: string;
    iconBg: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: "bg-white",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    title: "text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    bg: "bg-white",
    border: "border-red-200",
    bar: "bg-red-500",
    title: "text-red-700",
    iconBg: "bg-red-50 text-red-600",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: "bg-white",
    border: "border-amber-200",
    bar: "bg-amber-500",
    title: "text-amber-700",
    iconBg: "bg-amber-50 text-amber-600",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bg: "bg-white",
    border: "border-blue-200",
    bar: "bg-blue-500",
    title: "text-blue-700",
    iconBg: "bg-blue-50 text-blue-600",
  },
  system: {
    icon: <Zap className="w-4 h-4" />,
    bg: "bg-white",
    border: "border-violet-200",
    bar: "bg-violet-500",
    title: "text-violet-700",
    iconBg: "bg-violet-50 text-violet-600",
  },
};

// ─── Single toast card ────────────────────────────────────────────────────────

function ToastCard({ toast }: { toast: ToastNotification }) {
  const { dismiss } = useLiveNotifications();
  const cfg = VARIANT_CONFIG[toast.variant];
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // mount → slide-in
    const t1 = requestAnimationFrame(() => setVisible(true));

    // start slide-out just before auto-dismiss fires (1.7 s in, dismiss at 2 s)
    const t2 = setTimeout(() => setLeaving(true), 1700);

    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => dismiss(toast.toastKey), 300);
  };

  const relativeTime = (() => {
    const diff = Math.floor(
      (Date.now() - new Date(toast.createdAt).getTime()) / 1000,
    );
    if (diff < 10) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(toast.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        // Layout
        "relative w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden",
        // Shape + blur
        "rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl",
        // Colour
        cfg.bg,
        cfg.border,
        // Motion
        "transition-all duration-300 ease-out",
        visible && !leaving
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0",
      ].join(" ")}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${cfg.bar} rounded-l-2xl`} />

      {/* Progress bar (shrinks over 2 s) */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-30 origin-left`}
        style={{
          animation: "shrink-bar 2s linear forwards",
        }}
      />

      <div className="flex items-start gap-3 pl-5 pr-3 py-3.5">
        {/* Icon */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl ${cfg.iconBg} mt-0.5`}
        >
          {cfg.icon}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-tight ${cfg.title}`}>
              {toast.title}
            </p>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-gray-600 leading-snug line-clamp-2">
            {toast.message}
          </p>
          <p className="mt-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {relativeTime}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Toast panel (portal-like fixed container) ────────────────────────────────

export function LiveNotificationPanel() {
  const { toasts } = useLiveNotifications();

  return (
    <>
      {/* Keyframe injected via a style tag */}
      <style>{`
        @keyframes shrink-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* Fixed right-side stack */}
      <div
        aria-label="Live notifications"
        className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.toastKey} className="pointer-events-auto">
            <ToastCard toast={t} />
          </div>
        ))}
      </div>
    </>
  );
}
