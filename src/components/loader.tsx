import { useEffect, useState } from "react";
import { SiriWave } from "@/components/ui/siri-wave";
import { motionPaused } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MIN_MS = 2400; // long enough for the wave to go through a full swell
const MAX_MS = 8000; // a stalled font or image never holds the site hostage
const FADE_MS = 900;

// The wave's square, as CSS, so the prerendered page reserves exactly the room
// the canvas will take once the script sizes it.
const WAVE_BOX = "min(380px, 86vw)";

type Phase = "loading" | "leaving" | "done";

/**
 * Full-screen intro that covers the page until its fonts and images have
 * arrived, then dissolves to reveal the hero. The site renders underneath the
 * whole time, so everything is already in place when the curtain lifts.
 *
 * The curtain itself is part of the prerendered HTML — the page opens black,
 * exactly as it did when it was rendered in the browser — and the WebGL wave
 * joins it as soon as the script is running.
 */
export default function Loader() {
  const [phase, setPhase] = useState<Phase>("loading");
  // Sized once for the viewport it opens on; it's gone in a few seconds.
  // Client-only: there is no window to measure while prerendering, and a
  // canvas has nothing to show without the script anyway.
  const [wave, setWave] = useState<{ size: number; scale: number } | null>(null);
  // hold the wordmark back until the site's fonts are in, so it never
  // flashes in a fallback face first
  const [typeReady, setTypeReady] = useState(false);

  useEffect(() => {
    // The viewport can still report 0 this early (e.g. a tab that hasn't laid
    // out yet), so fall back to the full size rather than a 0px canvas.
    const vw = window.innerWidth || document.documentElement.clientWidth;
    setWave({
      size: vw > 0 ? Math.min(380, Math.round(vw * 0.86)) : 380,
      scale: Math.min(window.devicePixelRatio || 1, 2),
    });
  }, []);

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
    // anyone who has asked for less motion — in the OS or with the site's own
    // switch — gets the page as soon as it is ready, without the showpiece
    const calm =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || motionPaused();

    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          );
    const fontsLoaded = document.fonts ? document.fonts.ready.then(() => {}) : Promise.resolve();
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, calm ? 0 : MIN_MS));
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
      // styled as [data-loader] in index.css: lifts by itself if the script never runs
      data-loader
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
        className={cn("transition-[transform,filter] ease-in", leaving && "scale-[1.18] blur-[6px]")}
        style={{ transitionDuration: `${FADE_MS}ms`, width: WAVE_BOX, height: WAVE_BOX }}
      >
        {wave && (
          <div className="h-full w-full animate-fade-in">
            <SiriWave
              aria-hidden
              variant="wave"
              size={wave.size}
              renderScale={wave.scale}
              // black & white like the rest of the site — colour is saved for the cards
              saturation={0}
              style={{
                // fill the reserved square exactly, whatever `size` rounded to
                width: "100%",
                height: "100%",
                // the shader's side falloff never quite reaches black, so
                // feather the canvas edges rather than letting the box show
                maskImage:
                  "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)",
              }}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex min-h-10 flex-col items-center gap-3 transition-opacity duration-300",
          leaving && "opacity-0",
        )}
        // the shader's edge mask keeps the bottom ~fifth of its square black,
        // so tuck the wordmark up under the glow
        style={{ marginTop: `calc(${WAVE_BOX} * -0.18)` }}
      >
        {typeReady && (
          <>
            <p className="animate-fade-in text-[0.625rem] font-bold uppercase tracking-[0.5em] text-white/85 md:text-xs">
              adimakesmusic
            </p>
            <p className="animate-fade-in text-[0.5625rem] uppercase tracking-[0.45em] text-quiet [animation-delay:150ms] md:text-[0.625rem]">
              tuning in
            </p>
          </>
        )}
      </div>
    </div>
  );
}
