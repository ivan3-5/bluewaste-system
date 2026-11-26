import { useEffect } from "react";
import { checkWebSession, getCurrentWebSession } from "@/lib/api";
import { updateWebSession } from "@/lib/web-session";

const ACTIVITY_INTERVAL_MS = 2000;

export function useWebSessionActivity(sessionId: string | undefined, idleUntil: number | undefined) {
  useEffect(() => {
    if (idleUntil === undefined) return;
    let deadlineTimer: number;

    function checkDeadline() {
      const session = getCurrentWebSession();
      if (session) {
        deadlineTimer = window.setTimeout(checkDeadline, Math.max(0, session.idleUntil - Date.now()));
      }
    }

    checkDeadline();
    return () => window.clearTimeout(deadlineTimer);
  }, [idleUntil]);

  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();
    let lastSentAt = -Infinity;
    let lastActivityAt = -Infinity;
    let activityTimer: number | undefined;

    function check(activityAgeMs?: number) {
      if (!sessionId || getCurrentWebSession()?.sessionId !== sessionId) return;
      void checkWebSession(sessionId, controller.signal, activityAgeMs)
        .then(({ data }) => updateWebSession(sessionId, data))
        .catch(() => {
          // The Axios client handles ended sessions. Connectivity failures leave the deadline in effect.
        });
    }

    function sendActivity() {
      activityTimer = undefined;
      const now = Date.now();
      const activityAgeMs = now - lastActivityAt;
      if (activityAgeMs < 0 || activityAgeMs > ACTIVITY_INTERVAL_MS) return;
      lastSentAt = now;
      check(activityAgeMs);
    }

    function onActivity(event: Event) {
      if (!event.isTrusted || document.visibilityState !== "visible") return;

      const session = getCurrentWebSession();
      if (!session || session.sessionId !== sessionId) return;
      lastActivityAt = Date.now();
      const delay = ACTIVITY_INTERVAL_MS - (lastActivityAt - lastSentAt);
      if (delay <= 0 || session.idleUntil - lastActivityAt <= ACTIVITY_INTERVAL_MS) {
        window.clearTimeout(activityTimer);
        sendActivity();
      } else if (activityTimer === undefined) {
        activityTimer = window.setTimeout(sendActivity, delay);
      }
    }

    function onResume() {
      if (document.visibilityState === "visible") check();
    }

    const activityEvents = ["pointerdown", "keydown", "wheel", "click"];
    const options = { capture: true, passive: true };
    for (const event of activityEvents) document.addEventListener(event, onActivity, options);
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("pageshow", onResume);
    onResume();

    return () => {
      controller.abort();
      window.clearTimeout(activityTimer);
      for (const event of activityEvents) document.removeEventListener(event, onActivity, options);
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("pageshow", onResume);
    };
  }, [sessionId]);
}
