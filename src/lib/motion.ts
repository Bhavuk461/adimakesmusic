import { useCallback, useSyncExternalStore } from "react";

/**
 * The visitor's own switch for the animations that loop by themselves (the
 * marquee tapes, the vinyl, the equalizer). It lives on <html data-motion>,
 * where the stylesheet reads it, and is remembered between visits. A tiny
 * inline script in each page's <head> restores it before first paint.
 */
const KEY = "motion";
const EVENT = "motionchange";

export function motionPaused() {
  return typeof document !== "undefined" && document.documentElement.dataset.motion === "off";
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useMotionPaused() {
  // the prerendered markup always says "running"; a stored preference is
  // picked up right after hydration
  const paused = useSyncExternalStore(subscribe, motionPaused, () => false);

  const toggle = useCallback(() => {
    const next = !motionPaused();
    if (next) document.documentElement.dataset.motion = "off";
    else delete document.documentElement.dataset.motion;
    try {
      localStorage.setItem(KEY, next ? "off" : "on");
    } catch {
      // private mode / storage blocked — the switch still works for this visit
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [paused, toggle] as const;
}
