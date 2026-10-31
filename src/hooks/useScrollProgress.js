import { useEffect } from "react";
import { getScrollProgress } from "../lib/scroll";

/**
 * Scrubs a CSS custom property from 0 to 1 while a spacer element scrolls
 * past the viewport. Designed for the sticky invitation-cover lift: the
 * spacer owns the scroll distance, a sticky "pin" wrapper owns the on-screen
 * height, and the variable is written onto a `target` element (whose children
 * and pseudo-elements can read it).
 */
export function useScrollProgress(
  spacerRef,
  { targetRef, pinRef, variable, onProgress }
) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let frame = null;

    const settle = () => {
      const target = targetRef?.current;
      if (!target) return;
      target.style.setProperty(variable, "0");
      target.inert = false;
      onProgress?.(0);
    };

    const update = () => {
      frame = null;

      if (reducedMotionQuery.matches || window.innerHeight <= 560) {
        settle();
        return;
      }

      const spacer = spacerRef?.current;
      const target = targetRef?.current;
      if (!spacer || !target) return;

      const rect = spacer.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      // Match the sticky pin's 100svh height on mobile browsers.
      const viewportHeight = pinRef?.current?.offsetHeight || window.innerHeight;

      const progress = getScrollProgress({
        scrollY: window.scrollY,
        elementTop,
        elementHeight: rect.height,
        viewportHeight
      });

      target.style.setProperty(variable, progress.toFixed(4));
      target.inert = progress > 0.98;
      onProgress?.(progress);
    };

    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(update);
      }
    };

    const handleMotionChange = () => schedule();

    // Set the initial state before paint-side scrolling begins.
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reducedMotionQuery.addEventListener?.("change", handleMotionChange);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotionQuery.removeEventListener?.("change", handleMotionChange);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [spacerRef, targetRef, pinRef, variable, onProgress]);
}
