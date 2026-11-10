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
  /**
   * Which of the two inks the type is set in. White cannot be read on the
   * orange or the green (it fails WCAG AA there), so those two cards are inked
   * in black; the gradients themselves are never dimmed to make room for text.
   */
  ink?: "light" | "dark";
};

const cards: CardDef[] = [
  {
    id: "track-01",
    number: "01",
    title: "Track 01",
    image: `${BASE}pics/aditya-chowhan.jpg`,
  },
  {
    id: "track-02",
    number: "02",
    title: "Track 02",
    gradient: "bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600",
    ink: "dark",
  },
  {
    id: "track-03",
    number: "03",
    title: "Track 03",
    gradient: "bg-gradient-to-br from-sky-300 via-blue-600 to-indigo-800",
    ink: "light",
  },
  {
    id: "track-04",
    number: "04",
    title: "Track 04",
    gradient: "bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-800",
    ink: "dark",
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
    <div aria-hidden className="flex h-24 items-center justify-center gap-[3px] md:h-36 md:gap-1">
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
  // Card 1 shows its "audio view" (blurred photo, live bars) while a mouse
  // rests on it, or while the track has been asked for by tap, click or key.
  const [hovering, setHovering] = useState(false);
  const [want, setWant] = useState(false);
  const { play, pause, playing, blocked, analyserRef } = useHoverAudio(
    `${BASE}audio/track-01.mp3`,
  );

  const audioView = hovering || want;

  const start = () => {
    setWant(true);
    void play();
  };
  const stop = () => {
    setWant(false);
    pause();
  };

  // A click, a tap, Enter or Space. On the first card that is the play/pause
  // switch — hovering starts the track as a shortcut, but nobody has to hover,
  // and anyone can stop it again.
  const activate = (i: number) => {
    setOpen(i);
    if (i !== 0) {
      if (want) stop();
      return;
    }
    if (playing) stop();
    else start();
  };

  return (
    <div className="flex h-[24rem] w-full items-stretch gap-2 md:h-[30rem] md:gap-3">
      {cards.map((card, i) => {
        const isOpen = open === i;
        const isTrack = i === 0;
        const darkInk = card.ink === "dark";
        return (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            aria-pressed={isTrack ? playing : undefined}
            aria-expanded={isTrack ? undefined : isOpen}
            // hover is a mouse-only shortcut; a touch "enters" too, but there
            // the tap itself (onClick) is the switch
            onPointerEnter={(e) => {
              if (e.pointerType === "touch") return;
              setOpen(i);
              if (isTrack) {
                setHovering(true);
                start();
              }
            }}
            onPointerLeave={
              isTrack
                ? (e) => {
                    if (e.pointerType === "touch") return;
                    setHovering(false);
                    stop();
                  }
                : undefined
            }
            onClick={() => activate(i)}
            onKeyDown={(e) => {
              if (e.repeat) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activate(i);
              } else if (e.key === "Escape" && isTrack) {
                stop();
              }
            }}
            onFocus={() => setOpen(i)}
            // the track never plays on behind a card nobody is on any more
            onBlur={
              isTrack
                ? () => {
                    if (!hovering) stop();
                  }
                : undefined
            }
            style={{ flexGrow: isOpen ? 7 : 1, flexBasis: 0 }}
            className={cn(
              "group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl transition-[flex-grow,box-shadow] duration-500 ease-in-out md:rounded-3xl",
              isOpen
                ? "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]"
                : "shadow-[0_12px_35px_-14px_rgba(0,0,0,0.35)]",
              card.gradient,
            )}
          >
            {/* card 1 — the photo + audio. As a button its name is read from
                the caption ("Play Track 01, aditya chowhan — demo"); everything
                that would only repeat or clutter that is hidden from it. */}
            {card.image && (
              <>
                <span className="sr-only">Play </span>
                <img
                  aria-hidden
                  src={card.image}
                  alt="Aditya Chowhan with his guitar"
                  width={960}
                  height={1280}
                  draggable={false}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-all duration-700",
                    audioView ? "scale-110 blur-[6px] brightness-[0.45]" : "scale-100",
                  )}
                />
                {/* legibility gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                {/* Closed, the card is a thin slice of the photo with its label
                    running up the bright stonework — so the fade deepens while
                    it is shut, and lifts again as it opens. */}
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/45 to-transparent transition-opacity duration-500",
                    isOpen ? "opacity-0" : "opacity-100",
                  )}
                />

                {/* the live bars, front and center while the track is up */}
                <div
                  className={cn(
                    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 transition-opacity duration-500",
                    audioView && isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <SoundBars analyser={analyserRef} live={playing} />
                  {/* the playing state itself reaches assistive tech as aria-pressed */}
                  <p
                    aria-hidden
                    className="px-4 text-center text-[0.5625rem] uppercase tracking-[0.45em] text-white/90 md:text-[0.6875rem]"
                  >
                    {playing
                      ? "now playing — track 01"
                      : blocked
                        ? "♪ click once for sound"
                        : want
                          ? "tuning…"
                          : "paused — click to play"}
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
                    <p className="mt-2 text-[0.5625rem] uppercase tracking-[0.4em] text-white/85 md:text-[0.625rem]">
                      aditya chowhan — demo
                    </p>
                  </div>
                  <span
                    aria-hidden
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
                  {/* sits on the palest corner of each gradient, so it is inked
                      in black — white would vanish there */}
                  <span className="rounded-full border border-black/70 px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-black md:text-[0.625rem]">
                    coming soon
                  </span>
                  <div>
                    <p
                      className={cn(
                        "font-display text-6xl uppercase leading-none md:text-8xl",
                        darkInk ? "text-black" : "text-white/95",
                      )}
                    >
                      <span className="sr-only">Track </span>
                      {card.number}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[0.5625rem] uppercase tracking-[0.4em] md:text-[0.625rem]",
                        darkInk ? "text-black/80" : "text-white",
                      )}
                    >
                      still in the studio
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* collapsed vertical label — a second copy of what the card already says */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 flex items-end justify-center pb-5 transition-opacity duration-300",
                isOpen ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              <span
                className={cn(
                  "rotate-180 text-[0.5625rem] font-semibold uppercase tracking-[0.4em] [writing-mode:vertical-rl] md:text-[0.625rem]",
                  darkInk
                    ? "text-black"
                    : "text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]",
                )}
              >
                {isTrack ? `${card.number} — track 01 ♪` : `${card.number} — soon`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
