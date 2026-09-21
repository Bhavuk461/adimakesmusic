import { useEffect, useState } from "react";
import { SiriWave } from "@/components/ui/siri-wave";
import { cn } from "@/lib/utils";

const MIN_MS = 2400; // long enough for the wave to go through a full swell
const MAX_MS = 8000; // a stalled font or image never holds the site hostage
const FADE_MS = 900;

type Phase = "loading" | "leaving" | "done";

/**
 * Full-screen intro that covers the page until its fonts and images have
 * arrived, then dissolves to reveal the hero. The site renders underneath the
 * whole time, so everything is already in place when the curtain lifts.
 */
export default function Loader() {
  const [phase, setPhase] = useState<Phase>("loading");
  // sized once for the viewport it opens on; it's gone in a few seconds.
  // The viewport can still report 0 this early (e.g. a tab that hasn't laid
  // out yet), so fall back to the full size rather than a 0px canvas.
  const [size] = useState(() => {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return vw > 0 ? Math.min(380, Math.round(vw * 0.86)) : 380;
  });
  const [scale] = useState(() => Math.min(window.devicePixelRatio || 1, 2));
  // hold the wordmark back until the site's fonts are in, so it never
  // flashes in a fallback face first
  const [typeReady, setTypeReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    void ready.then(() => {
      if (alive) setTypeReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          );
    const fontsLoaded = document.fonts ? document.fonts.ready.then(() => {}) : Promise.resolve();
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, reduced ? 0 : MIN_MS));
    const ceiling = new Promise<void>((resolve) => setTimeout(resolve, MAX_MS));

    void Promise.race([Promise.all([pageLoaded, fontsLoaded, minimum]), ceiling]).then(() => {
      if (cancelled) return;
      root.style.overflow = prevOverflow;
      setPhase("leaving");
    });

    return () => {
      cancelled = true;
      root.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => setPhase("done"), FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  const leaving = phase === "leaving";

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        // under the film grain (z-50) so the texture carries straight through
        "fixed inset-0 z-[45] flex flex-col items-center justify-center bg-black transition-opacity ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div
        className={cn(
          "animate-fade-in transition-[transform,filter] ease-in",
          leaving && "scale-[1.18] blur-[6px]",
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <SiriWave
          aria-hidden
          variant="wave"
          size={size}
          renderScale={scale}
          // black & white like the rest of the site — colour is saved for the cards
          saturation={0}
          // the shader's side falloff never quite reaches black, so feather
          // the canvas edges rather than letting the box show
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)",
          }}
        />
      </div>

      <div
        className={cn(
          "flex min-h-10 flex-col items-center gap-3 transition-opacity duration-300",
          leaving && "opacity-0",
        )}
        // the shader's edge mask keeps the bottom ~fifth of its square black,
        // so tuck the wordmark up under the glow
        style={{ marginTop: -Math.round(size * 0.18) }}
      >
        {typeReady && (
          <>
            <p className="animate-fade-in text-[0.625rem] font-bold uppercase tracking-[0.5em] text-white/85 md:text-xs">
              adimakesmusic
            </p>
            <p className="animate-fade-in text-[0.5625rem] uppercase tracking-[0.45em] text-neutral-500 [animation-delay:150ms] md:text-[0.625rem]">
              tuning in
            </p>
          </>
        )}
      </div>
    </div>
  );
}
