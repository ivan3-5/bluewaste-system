"use client";

import { useEffect, useRef } from "react";

export function useDemoMode() {
  const lastKeyTime = useRef<number>(0);
  const keyCount = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "g") return; // strict lowercase 'g' only

      const now = Date.now();
      if (now - lastKeyTime.current < 1500) {
        keyCount.current += 1;
      } else {
        keyCount.current = 1;
      }

      lastKeyTime.current = now;

      if (keyCount.current >= 2) {
        try {
          const current = window.localStorage.getItem("demo_mode") === "true";
          window.localStorage.setItem("demo_mode", String(!current));
          // reset counter to 1 every time demo mode is toggled ON
          if (!current) {
            window.localStorage.setItem("demo_counter", "1");
          }
        } catch (err) {
          // silent
        }

        keyCount.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

export function isDemoModeOn(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem("demo_mode") === "true"
    );
  } catch (e) {
    return false;
  }
}
