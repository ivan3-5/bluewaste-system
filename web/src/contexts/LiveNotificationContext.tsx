"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Notification } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToastNotification extends Notification {
  /** Unique key for the visible toast (may differ from db id on duplicates) */
  toastKey: string;
  /** Which icon / colour theme to use */
  variant: "info" | "success" | "warning" | "error" | "system";
}

interface LiveNotificationContextType {
  toasts: ToastNotification[];
  dismiss: (toastKey: string) => void;
  pushToast: (n: Omit<ToastNotification, "toastKey">) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LiveNotificationContext = createContext<
  LiveNotificationContextType | undefined
>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function variantForType(
  type: Notification["type"],
  title: string,
): ToastNotification["variant"] {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("clean") || lowerTitle.includes("complet"))
    return "success";
  if (lowerTitle.includes("reject") || lowerTitle.includes("delete"))
    return "error";
  if (lowerTitle.includes("spam") || lowerTitle.includes("warning"))
    return "warning";
  if (type === "ASSIGNMENT") return "info";
  if (type === "STATUS_CHANGE") return "info";
  return "system";
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function LiveNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const dismiss = useCallback((toastKey: string) => {
    setToasts((prev) => prev.filter((t) => t.toastKey !== toastKey));
  }, []);

  const pushToast = useCallback(
    (n: Omit<ToastNotification, "toastKey">) => {
      const toastKey = `${n.id}-${Date.now()}`;
      const toast: ToastNotification = { ...n, toastKey };

      setToasts((prev) => {
        // Keep at most 5 visible toasts
        const trimmed = prev.length >= 5 ? prev.slice(1) : prev;
        return [...trimmed, toast];
      });

      // Auto-dismiss after 2 seconds
      setTimeout(() => dismiss(toastKey), 2000);
    },
    [dismiss],
  );

  /**
   * Called by the polling hook whenever a fresh batch of notifications
   * arrives from the server.
   */
  const handleIncomingNotifications = useCallback(
    (notifications: Notification[]) => {
      if (!initializedRef.current) {
        // First load — seed seenIds so we don't flood on mount
        notifications.forEach((n) => seenIdsRef.current.add(n.id));
        initializedRef.current = true;
        return;
      }

      const newOnes = notifications.filter(
        (n) => !seenIdsRef.current.has(n.id),
      );

      newOnes.forEach((n) => {
        seenIdsRef.current.add(n.id);
        pushToast({
          ...n,
          variant: variantForType(n.type, n.title),
        });
      });
    },
    [pushToast],
  );

  return (
    <LiveNotificationContext.Provider value={{ toasts, dismiss, pushToast }}>
      {children}
      <InternalPoller onNotifications={handleIncomingNotifications} />
    </LiveNotificationContext.Provider>
  );
}

// ─── Internal polling component ───────────────────────────────────────────────

/**
 * Polls /notifications every 3 seconds and calls onNotifications with the
 * latest page-1 results. Lives inside the provider so it can be tree-shaken
 * away when the provider is not mounted.
 */
function InternalPoller({
  onNotifications,
}: {
  onNotifications: (n: Notification[]) => void;
}) {
  const onNotificationsRef = useRef(onNotifications);
  onNotificationsRef.current = onNotifications;

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        // Only poll if a user session is active
        const token = localStorage.getItem("bluewaste_token");
        if (!token) return;

        const { default: api } = await import("@/lib/api");
        const res = await api.get<{ data: Notification[] }>(
          "/notifications?page=1&limit=20",
        );

        if (!active) return;

        const items: Notification[] = res.data?.data ?? [];
        onNotificationsRef.current(items);
      } catch {
        // Silently ignore network / auth errors
      }
    };

    poll(); // immediate first run
    const interval = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLiveNotifications() {
  const ctx = useContext(LiveNotificationContext);
  if (!ctx) {
    throw new Error(
      "useLiveNotifications must be used inside <LiveNotificationProvider>",
    );
  }
  return ctx;
}
