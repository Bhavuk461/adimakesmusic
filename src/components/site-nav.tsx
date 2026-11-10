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
          "flex items-center gap-3 text-xs font-bold uppercase tracking-[0.35em] md:text-sm",
        )}
      >
        <NavEq />
        adimakesmusic
      </a>
      <div className="flex items-center gap-5 text-[0.625rem] uppercase tracking-[0.3em] text-neutral-400 md:gap-8 md:text-xs">
        {/* a phone has no room for all three next to the wordmark — the hero's
            own "scroll for the sound" covers this one there */}
        <a className={cn(target, "hidden transition-colors hover:text-white sm:block")} href={to("#sound")}>
          the sound
        </a>
        <a
          className={cn(target, "transition-colors hover:text-white", booking && "hidden sm:block")}
          href={to("#contact")}
        >
          contact
        </a>
        {booking && (
          <a
            href="/book/"
            aria-current={page === "book" ? "page" : undefined}
            aria-label={`Book ${SITE.artist}`}
            className="-my-2 rounded-full border border-white/70 px-4 py-2 text-white transition-colors hover:bg-white hover:text-black"
          >
            book<span className="hidden sm:inline">&nbsp;aditya</span>
          </a>
        )}
      </div>
    </nav>
  );
}
