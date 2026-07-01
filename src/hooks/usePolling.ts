import { useEffect, useRef } from "react";

/**
 * Runs `callback` immediately, then every `intervalMs`.
 * Pauses when `enabled` is false. Pauses when the tab is hidden
 * (saves API calls when the user isn't looking at the page).
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState === "hidden") return; // skip while tab is backgrounded
      savedCallback.current();
    };

    tick(); // run immediately on mount / when enabled flips true
    const id = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}