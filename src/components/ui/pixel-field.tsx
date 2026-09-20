"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type PixelFieldProps = {
  className?: string;
  /** grid pitch, in CSS pixels */
  cell?: number;
  /** how far the cursor reaches, in CSS pixels */
  radius?: number;
};

/**
 * Tiles are quantized into LEVELS brightness steps and batched into one
 * Path2D per step, so a frame costs ~LEVELS canvas state changes no matter
 * how many tiles are up.
 */
const LEVELS = 14;
const GAP = 7; // gutter between tiles at rest
const RISE = 14; // travel of a fully lifted tile, px
const K_UP = 260; // spring stiffness on the way up — snappy
const K_DOWN = 85; // …and on the way down — slow, so the wave trails
const DAMP = 17; // under-damped, so tiles overshoot and settle

/**
 * Interactive backdrop: a field of near-black tiles that swell up under the
 * cursor and sink back once it moves on. Everything is drawn on one canvas,
 * and only the tiles that are actually moving are touched each frame — when
 * the cursor holds still or leaves the section, the loop stops completely.
 */
export default function PixelField({ className, cell = 36, radius = 200 }: PixelFieldProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    // Purely a hover effect — coarse pointers and reduced-motion users get the
    // static dot grid and nothing else. No canvas work is scheduled at all.
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rounded = typeof Path2D.prototype.roundRect === "function";

    // per-step styles never change, so build the strings once
    const fills: string[] = [];
    const edges: string[] = [];
    const halos: string[] = [];
    for (let b = 0; b < LEVELS; b++) {
      const v = (b + 0.5) / LEVELS;
      fills.push(`rgba(255,255,255,${(0.01 + v * 0.05).toFixed(4)})`);
      edges.push(`rgba(255,255,255,${(0.05 + v * 0.42).toFixed(4)})`);
      halos.push(`rgba(255,255,255,${(Math.max(0, v - 0.45) * 0.12).toFixed(4)})`);
    }

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;

    let lift = new Float32Array(0);
    let vel = new Float32Array(0);
    let queued = new Uint8Array(0); // is this cell in the working set?
    let work = new Int32Array(0); // the working set itself
    let workLen = 0;

    const pointer = { x: -9e5, y: -9e5, on: false };
    let seenX = NaN;
    let seenY = NaN;
    let painted: number[] | null = null; // bounds of the last paint, for partial clears
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      const n = cols * rows;
      lift = new Float32Array(n);
      vel = new Float32Array(n);
      queued = new Uint8Array(n);
      work = new Int32Array(n);
      workLen = 0;
      painted = null;
    };

    const reset = () => {
      for (let k = 0; k < workLen; k++) {
        const idx = work[k];
        lift[idx] = 0;
        vel[idx] = 0;
        queued[idx] = 0;
      }
      workLen = 0;
      ctx.clearRect(0, 0, w, h);
      painted = null;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const rect = host.getBoundingClientRect();
      const mx = pointer.on ? pointer.x - rect.left : -9e5;
      const my = pointer.on ? pointer.y - rect.top : -9e5;

      // pull every cell the cursor can currently reach into the working set
      if (pointer.on) {
        const i0 = Math.max(0, Math.floor((mx - radius) / cell));
        const i1 = Math.min(cols - 1, Math.floor((mx + radius) / cell));
        const j0 = Math.max(0, Math.floor((my - radius) / cell));
        const j1 = Math.min(rows - 1, Math.floor((my + radius) / cell));
        for (let j = j0; j <= j1; j++) {
          const row = j * cols;
          for (let i = i0; i <= i1; i++) {
            const idx = row + i;
            if (!queued[idx]) {
              queued[idx] = 1;
              work[workLen++] = idx;
            }
          }
        }
      }

      const paths: (Path2D | null)[] = [];
      for (let b = 0; b < LEVELS; b++) paths.push(null);

      const r2 = radius * radius;
      let minX = 1e9;
      let minY = 1e9;
      let maxX = -1e9;
      let maxY = -1e9;
      let busy = false;
      let write = 0;

      for (let k = 0; k < workLen; k++) {
        const idx = work[k];
        const i = idx % cols;
        const j = (idx - i) / cols;
        const cx = i * cell + cell * 0.5;
        const cy = j * cell + cell * 0.5;
        const dx = mx - cx;
        const dy = my - cy;
        const d2 = dx * dx + dy * dy;

        let target = 0;
        if (d2 < r2) {
          const t = 1 - Math.sqrt(d2) / radius;
          target = t * t * (3 - 2 * t); // smoothstep — no hard edge to the wave
        }

        let v = vel[idx];
        let l = lift[idx];
        // Tiles under the cursor snap up, tiles at the rim climb slower, so the
        // crest visibly travels outward instead of the whole disc popping at once.
        const stiff = target > l ? K_UP * (0.5 + 0.5 * target) : K_DOWN;
        v += ((target - l) * stiff - v * DAMP) * dt;
        l += v * dt;

        // fully settled and out of reach — drop it, it costs nothing until
        // the cursor comes back
        if (target === 0 && l < 0.003 && l > -0.003 && v < 0.02 && v > -0.02) {
          lift[idx] = 0;
          vel[idx] = 0;
          queued[idx] = 0;
          continue;
        }

        lift[idx] = l;
        vel[idx] = v;
        work[write++] = idx;
        // still drifting, or still short of where it wants to be — a frame can
        // land exactly on the spring's turning point, and parking there would
        // freeze the tile a touch high
        const off = target - l;
        if (v > 0.02 || v < -0.02 || off > 0.004 || off < -0.004) busy = true;

        if (l > 0.004) {
          const a = l > 1 ? 1 : l;
          const size = (cell - GAP) * (1 + l * 0.16);
          const x = cx - size * 0.5;
          const y = cy - size * 0.5 - l * RISE;
          const step = a >= 1 ? LEVELS - 1 : (a * LEVELS) | 0;
          let p = paths[step];
          if (!p) {
            p = new Path2D();
            paths[step] = p;
          }
          if (rounded) p.roundRect(x, y, size, size, 2 + l * 2);
          else p.rect(x, y, size, size);

          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x + size > maxX) maxX = x + size;
          if (y + size > maxY) maxY = y + size;
        }
      }
      workLen = write;

      // clear only what was painted last frame plus what is about to be
      const box = maxX > -1e9 ? [minX - 3, minY - 3, maxX + 3, maxY + 3] : null;
      if (box || painted) {
        const a = box ?? painted!;
        const b = painted ?? box!;
        const x0 = Math.min(a[0], b[0]);
        const y0 = Math.min(a[1], b[1]);
        ctx.clearRect(x0, y0, Math.max(a[2], b[2]) - x0, Math.max(a[3], b[3]) - y0);
      }
      painted = box;

      for (let b = 0; b < LEVELS; b++) {
        const p = paths[b];
        if (!p) continue;
        if (b > LEVELS * 0.45) {
          // soft bloom on the tiles right under the cursor
          ctx.lineWidth = 3;
          ctx.strokeStyle = halos[b];
          ctx.stroke(p);
        }
        ctx.fillStyle = fills[b];
        ctx.fill(p);
        ctx.lineWidth = 1;
        ctx.strokeStyle = edges[b];
        ctx.stroke(p);
      }

      const moved = pointer.x !== seenX || pointer.y !== seenY;
      seenX = pointer.x;
      seenY = pointer.y;

      // nothing moving and the cursor is parked: stop until something happens
      if (workLen > 0 && (busy || moved)) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !onScreen) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      wake();
    };

    const onOut = () => {
      pointer.on = false;
      wake();
    };

    // Scrolling moves the grid out from under a stationary cursor, but only
    // matters while something is actually raised — otherwise scrolling is free.
    const onScroll = () => {
      if (workLen > 0) wake();
    };

    // size it now rather than waiting on the observer's first callback, so the
    // canvas is never briefly stretched from its default 300x150 backing store
    measure();

    // A window dragged to a display with different scaling changes the pixel
    // ratio without resizing the element, so watch that separately.
    let dprQuery: MediaQueryList | null = null;
    const onDpr = () => {
      measure();
      watchDpr();
      wake();
    };
    const watchDpr = () => {
      dprQuery?.removeEventListener("change", onDpr);
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    };
    watchDpr();

    const ro = new ResizeObserver(() => {
      measure();
      wake();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          wake();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          reset();
        }
      },
      { threshold: 0 },
    );
    io.observe(host);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onOut);
    window.addEventListener("blur", onOut);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      dprQuery?.removeEventListener("change", onDpr);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onOut);
      window.removeEventListener("blur", onOut);
    };
  }, [cell, radius]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
    >
      {/* the field at rest — one dot per cell, so a lifted tile reads as
          rising off the dot it was anchored to. Pure CSS, zero per-frame cost. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.075) 1px, transparent 1.5px)",
          backgroundSize: `${cell}px ${cell}px`,
          maskImage:
            "radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
