"use client";

import { useEffect, useRef } from "react";

interface UseTeamSyncOptions {
  sessionId?: number | null;
  isTeamSession?: boolean;
  onSync: () => void | Promise<void>;
  intervalMs?: number;
}

/**
 * Team Sync Polling Hook.
 * Automatically synchronizes game session state every intervalMs
 * when a squad session is active and the browser tab is focused/visible.
 * Designed to be seamlessly replaced with push-based realtime in future milestones.
 */
export function useTeamSync({
  sessionId,
  isTeamSession = false,
  onSync,
  intervalMs = 4500,
}: UseTeamSyncOptions) {
  const syncRef = useRef(onSync);
  syncRef.current = onSync;

  useEffect(() => {
    if (!sessionId || !isTeamSession) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    const runSync = async () => {
      if (document.visibilityState === "visible") {
        try {
          await syncRef.current();
        } catch {
          // Suppress transient network sync errors
        }
      }
      if (!isCancelled) {
        timeoutId = setTimeout(runSync, intervalMs);
      }
    };

    // Run first sync loop
    timeoutId = setTimeout(runSync, intervalMs);

    // Immediate sync on tab visibility restoration
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, isTeamSession, intervalMs]);
}
