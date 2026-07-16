"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;
const BAR_COUNT = 26;

type CardDef = {
  id: string;
  number: string;
  title: string;
  image?: string;
  gradient?: string;
};

const cards: CardDef[] = [
  {
    id: "track-01",
    number: "01",
    title: "Track 01",
    image: `${BASE}pics/aditya.jpg`,
  },
  {
    id: "track-02",
    number: "02",
    title: "Track 02",
    gradient: "bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600",
  },
  {
    id: "track-03",
    number: "03",
    title: "Track 03",
    gradient: "bg-gradient-to-br from-sky-300 via-blue-600 to-indigo-800",
  },
  {
    id: "track-04",
    number: "04",
    title: "Track 04",
    gradient: "bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-800",
  },
];

/**
 * Hover-to-play audio wired through the Web Audio API so an AnalyserNode
 * can drive the visualizer. Handles the browser autoplay policy: if the
 * first hover is blocked, `blocked` turns true (the card shows a hint) and
 * the next click unlocks playback.
 */
function useHoverAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fadeTimer = useRef<number | undefined>(undefined);
  // whether the pointer still wants audio — guards the race where the
  // hover ends while play() is still pending
  const wantRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const ensureGraph = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio(src);
      el.loop = true;
      el.preload = "auto";
      audioRef.current = el;
    }
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      const gain = ctx.createGain();
      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      gainRef.current = gain;
    }
    return audioRef.current;
  }, [src]);

  const play = useCallback(async () => {
    const el = ensureGraph();
    wantRef.current = true;
    window.clearTimeout(fadeTimer.current);
    try {
      // resume() can hang while autoplay is blocked, so never await it —
      // el.play() below rejects properly and flips `blocked` instead.
      void ctxRef.current?.resume().catch(() => {});
      await el.play();
      if (!wantRef.current) {
        el.pause();
        setPlaying(false);
        return;
      }
      void ctxRef.current?.resume().catch(() => {});
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      if (ctx && gain) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.35);
      }
      setPlaying(true);
      setBlocked(false);
    } catch {
      setBlocked(true);
    }
  }, [ensureGraph]);

  const pause = useCallback(() => {
    wantRef.current = false;
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain && !audioRef.current?.paused) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      fadeTimer.current = window.setTimeout(() => audioRef.current?.pause(), 270);
    } else {
      audioRef.current?.pause();
    }
    setPlaying(false);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(fadeTimer.current);
      audioRef.current?.pause();
      void ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  return { play, pause, playing, blocked, analyserRef };
}

/**
 * The live bars. While `live`, a rAF loop samples the analyser and writes
 * bar heights directly to the DOM (no re-renders). Bars are mirrored from
 * the center, center = bass. When not live they idle on a CSS wave.
 */
function SoundBars({
  analyser,
  live,
}: {
  analyser: React.RefObject<AnalyserNode | null>;
  live: boolean;
}) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let buf: Uint8Array<ArrayBuffer> | null = null;
    const tick = () => {
      const an = analyser.current;
      if (an) {
        if (!buf || buf.length !== an.frequencyBinCount) {
          buf = new Uint8Array(an.frequencyBinCount);
        }
        an.getByteFrequencyData(buf);
        const usable = Math.floor(buf.length * 0.75);
        const center = (BAR_COUNT - 1) / 2;
        for (let i = 0; i < BAR_COUNT; i++) {
          const d = Math.abs(i - center) / center; // 0 at center → 1 at edges
          const idx = Math.min(usable - 1, Math.round(Math.pow(d, 1.7) * (usable - 1)));
          let sum = 0;
          for (let w = 0; w < 4; w++) sum += buf[Math.min(usable - 1, idx + w)];
          const v = Math.pow(sum / 4 / 255, 1.25);
          const el = bars.current[i];
          if (el) {
            el.style.height = `${Math.max(6, v * 100)}%`;
            el.style.opacity = String(0.55 + v * 0.45);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      for (const el of bars.current) {
        if (el) {
          el.style.height = "";
          el.style.opacity = "";
        }
      }
    };
  }, [analyser, live]);

  return (
    <div className="flex h-24 items-center justify-center gap-[3px] md:h-36 md:gap-1">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          className={cn(
            "w-[3px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.4)] md:w-[5px]",
            !live && "animate-eq-bar",
          )}
          style={{
            height: "8%",
            animationDelay: `${(i % 7) * 0.11}s`,
            animationDuration: `${0.8 + (i % 5) * 0.14}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ExpandCards() {
  const [open, setOpen] = useState(0);
  const [hoverHero, setHoverHero] = useState(false);
  const { play, pause, playing, blocked, analyserRef } = useHoverAudio(
    `${BASE}audio/track-01.mp3`,
  );

  const enter = (i: number) => {
    setOpen(i);
    if (i === 0) {
      setHoverHero(true);
      void play();
    }
  };

  const leaveHero = () => {
    setHoverHero(false);
    pause();
  };

  return (
    <div className="flex h-[24rem] w-full items-stretch gap-2 md:h-[30rem] md:gap-3">
      {cards.map((card, i) => {
        const isOpen = open === i;
        return (
          <div
            key={card.id}
            onMouseEnter={() => enter(i)}
            onMouseLeave={i === 0 ? leaveHero : undefined}
            onClick={() => enter(i)}
            style={{ flexGrow: isOpen ? 7 : 1, flexBasis: 0 }}
            className={cn(
              "group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl transition-[flex-grow,box-shadow] duration-500 ease-in-out md:rounded-3xl",
              isOpen
                ? "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]"
                : "shadow-[0_12px_35px_-14px_rgba(0,0,0,0.35)]",
              card.gradient,
            )}
          >
            {/* card 1 — the photo + audio */}
            {card.image && (
              <>
                <img
                  src={card.image}
                  alt="Aditya Chauhan with his guitar"
                  draggable={false}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-all duration-700",
                    hoverHero ? "scale-110 blur-[6px] brightness-[0.45]" : "scale-100",
                  )}
                />
                {/* legibility gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* the live bars, front and center on hover */}
                <div
                  className={cn(
                    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 transition-opacity duration-500",
                    hoverHero && isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <SoundBars analyser={analyserRef} live={playing} />
                  <p className="px-4 text-center text-[9px] uppercase tracking-[0.45em] text-white/90 md:text-[11px]">
                    {playing
                      ? "now playing — track 01"
                      : blocked
                        ? "♪ click once for sound"
                        : "tuning…"}
                  </p>
                </div>

                {/* expanded caption */}
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 transition-opacity duration-500 md:p-6",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div>
                    <p className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                      {card.title}
                    </p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-white/70 md:text-[10px]">
                      aditya chauhan — demo
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-sm text-white transition-colors md:h-10 md:w-10",
                      playing && "border-white bg-white text-black",
                    )}
                  >
                    ♪
                  </span>
                </div>
              </>
            )}

            {/* cards 2–4 — colorful, waiting for music */}
            {!card.image && (
              <>
                <div className="grain absolute inset-0 opacity-30 mix-blend-overlay" />
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-start justify-between p-5 transition-opacity delay-100 duration-500 md:p-6",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                >
                  <span className="rounded-full border border-white/70 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.3em] text-white md:text-[10px]">
                    coming soon
                  </span>
                  <div>
                    <p className="font-display text-6xl uppercase leading-none text-white/95 md:text-8xl">
                      {card.number}
                    </p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-white/80 md:text-[10px]">
                      still in the studio
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* collapsed vertical label */}
            <div
              className={cn(
                "absolute inset-0 flex items-end justify-center pb-5 transition-opacity duration-300",
                isOpen ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              <span className="rotate-180 text-[9px] font-semibold uppercase tracking-[0.4em] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] [writing-mode:vertical-rl] md:text-[10px]">
                {i === 0 ? `${card.number} — track 01 ♪` : `${card.number} — soon`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
