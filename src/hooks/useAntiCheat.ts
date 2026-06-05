"use client";

import { useEffect, useRef, useCallback } from "react";

type UseAntiCheatProps = {
  nim: string;
  onViolation?: (count: number) => void;
  maxViolations?: number;
  onForceSubmit?: () => void;
};

export function useAntiCheat({
  nim,
  onViolation,
  maxViolations = 3,
  onForceSubmit,
}: UseAntiCheatProps) {
  const violationCount = useRef(0);

  // Log blur ke API
  const logBlur = useCallback(async (keterangan: string) => {
    if (!nim) return;
    try {
      await fetch("/api/log-blur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim,
          timestamp: new Date().toISOString(),
          keterangan,
        }),
      });
    } catch {
      // silent fail
    }
  }, [nim]);

  useEffect(() => {
    if (!nim) return;

    // --- Fullscreen ---
    function requestFullscreen() {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    }
    requestFullscreen();

    // --- Disable klik kanan ---
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    // --- Disable keyboard shortcuts berbahaya ---
    function handleKeyDown(e: KeyboardEvent) {
      const blocked = [
        e.ctrlKey && e.key === "c",       // copy
        e.ctrlKey && e.key === "v",       // paste
        e.ctrlKey && e.key === "u",       // view source
        e.ctrlKey && e.key === "s",       // save
        e.ctrlKey && e.key === "a",       // select all
        e.ctrlKey && e.shiftKey && e.key === "I", // devtools
        e.ctrlKey && e.shiftKey && e.key === "J", // devtools
        e.ctrlKey && e.shiftKey && e.key === "C", // inspector
        e.key === "F12",                  // devtools
        e.key === "PrintScreen",          // screenshot
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    // --- Disable select text ---
    function handleSelectStart(e: Event) {
      e.preventDefault();
    }

    // --- Tab switch / window blur detection ---
    function handleVisibilityChange() {
      if (document.hidden) {
        violationCount.current += 1;
        logBlur(`tab_hidden_${violationCount.current}`);
        onViolation?.(violationCount.current);

        if (violationCount.current >= maxViolations) {
          logBlur("force_submit_max_violations");
          onForceSubmit?.();
        }
      }
    }

    function handleWindowBlur() {
      violationCount.current += 1;
      logBlur(`window_blur_${violationCount.current}`);
      onViolation?.(violationCount.current);

      if (violationCount.current >= maxViolations) {
        logBlur("force_submit_max_violations");
        onForceSubmit?.();
      }
    }

    // --- Detect DevTools (resize trick) ---
    function handleDevTools() {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        logBlur("devtools_detected");
      }
    }

    // Pasang semua event listener
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("resize", handleDevTools);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleDevTools);
    };
  }, [nim, logBlur, onViolation, maxViolations, onForceSubmit]);

  return { violationCount };
}
