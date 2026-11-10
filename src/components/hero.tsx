import SiteNav from "@/components/site-nav";
import PixelField from "@/components/ui/pixel-field";

/** Faint spinning vinyl in the lower-left corner. */
function Vinyl() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-48 -left-48 z-0 hidden md:block"
    >
      <div className="relative h-[38rem] w-[38rem] animate-spin-slower rounded-full border border-white/30 bg-[radial-gradient(circle,transparent_58%,rgba(255,255,255,0.04)_100%)]">
        <div className="absolute inset-10 rounded-full border border-white/20" />
        <div className="absolute inset-20 rounded-full border border-white/20" />
        <div className="absolute inset-32 rounded-full border border-dashed border-white/30" />
        <div className="absolute inset-44 rounded-full border border-white/20" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
        {/* notch so the spin reads */}
        <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-white/50" />
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <header className="relative flex min-h-svh flex-col overflow-hidden bg-black text-white">
      <PixelField />

      <SiteNav page="home" />

      <Vinyl />

      {/* headline */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-6 text-[0.625rem] uppercase tracking-[0.55em] text-quiet md:mb-8 md:text-xs">
          ( sound on ) — vol. 01
        </p>

        {/* The three lines are stacked by CSS, so the spaces between them are
            written out: without them a crawler or screen reader gets
            "AdityaChowhanmakes music". */}
        <h1 className="relative font-display uppercase leading-[0.84]">
          <span className="block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]">
            Aditya
          </span>{" "}
          <span className="text-outline block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]">
            Chowhan
          </span>{" "}
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[5deg] whitespace-nowrap font-accent text-[clamp(2.2rem,7.5vw,5.5rem)] lowercase italic tracking-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            makes&nbsp;music
          </span>
        </h1>

        <p className="mt-9 max-w-md text-[0.625rem] font-medium uppercase leading-loose tracking-[0.28em] text-neutral-400 md:mt-11 md:text-xs">
          everything here is black &amp; white —
          <br />
          until you press play.
        </p>
      </div>

      {/* bottom strip of the hero */}
      <div className="z-10 flex items-end justify-between px-5 pb-6 text-[0.5625rem] uppercase tracking-[0.35em] text-quiet md:px-10 md:pb-8 md:text-[0.6875rem]">
        <span className="hidden sm:block">est. mmxxvi</span>
        <a
          href="#sound"
          className="group flex flex-col items-center gap-2 text-neutral-300 transition-colors hover:text-white"
        >
          <span>scroll for the sound</span>
          <span aria-hidden className="animate-bounce text-sm leading-none">
            ↓
          </span>
        </a>
        <span className="hidden sm:block">play it loud ♪</span>
      </div>
    </header>
  );
}
