import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Tiny always-on equalizer next to the wordmark. */
function NavEq() {
  return (
    <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-bottom animate-eq bg-white"
          style={{ animationDelay: `${i * 0.16}s`, animationDuration: `${0.85 + i * 0.14}s` }}
        />
      ))}
    </span>
  );
}

/** The same equalizer, inked black, playing inside the Book button. */
function BookEq() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-full w-[2.5px] origin-bottom animate-eq bg-black"
          style={{ animationDelay: `${i * 0.2}s`, animationDuration: `${0.8 + i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// Taller tap targets without a taller row: the padding is cancelled by an
// equal negative margin, so the nav keeps the exact height it always had.
const target = "-my-2 py-2";

export default function SiteNav({ page }: { page: "home" | "book" | "other" }) {
  const home = page === "home";
  const booking = SITE.booking.enabled;
  // in-page anchors on the homepage, full URLs from anywhere else
  const to = (hash: string) => (home ? hash : `/${hash}`);

  return (
    <nav
      aria-label="Primary"
      className="z-20 flex items-center justify-between px-5 py-5 md:px-10 md:py-7"
    >
      <a
        href={home ? "#top" : "/"}
        className={cn(
          target,
          // tracked a touch tighter on the very smallest phones, so the Book
          // button still has room to breathe beside it
          "flex items-center gap-3 text-xs font-bold uppercase tracking-[0.26em] min-[360px]:tracking-[0.35em] md:text-sm",
        )}
      >
        <NavEq />
        adimakesmusic
      </a>
      <div className="flex items-center gap-5 text-[0.625rem] uppercase tracking-[0.3em] text-neutral-400 md:gap-8 md:text-xs">
        {/* Below laptop width there's no room for all three next to the
            wordmark and the Book button — the hero's own "scroll for the
            sound" covers this one there. */}
        <a
          className={cn(target, "hidden transition-colors hover:text-white", booking ? "lg:block" : "sm:block")}
          href={to("#sound")}
        >
          the sound
        </a>
        <a
          className={cn(target, "transition-colors hover:text-white", booking && "hidden sm:block")}
          href={to("#contact")}
        >
          contact
        </a>
        {/* The one thing on every page meant to be seen first: the only solid
            white shape in the black header, with a soft glow, the equalizer
            playing inside it and a slow "live" pulse around it. On the
            booking page itself it jumps straight to the sets. */}
        {booking && (
          <a
            href={page === "book" ? "#booking" : "/book/"}
            aria-current={page === "book" ? "page" : undefined}
            aria-label={`Book ${SITE.artist}`}
            className="group/book relative -my-2.5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 font-bold text-black shadow-[0_0_26px_rgba(255,255,255,0.3)] transition-[background-color,box-shadow] duration-300 hover:bg-neutral-200 hover:shadow-[0_0_38px_rgba(255,255,255,0.5)] focus-visible:outline-white md:px-5 md:py-3"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-cta-ring rounded-full border border-white"
            />
            <BookEq />
            <span>
              book<span className="hidden sm:inline">&nbsp;aditya</span>
            </span>
            <span aria-hidden className="hidden transition-transform duration-300 group-hover/book:translate-x-1 sm:inline">
              →
            </span>
          </a>
        )}
      </div>
    </nav>
  );
}
