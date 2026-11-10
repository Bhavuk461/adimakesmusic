import MotionToggle from "@/components/motion-toggle";
import { SITE } from "@/lib/site";

export default function Footer() {
  // Only links that actually lead somewhere are shown.
  const links = [
    ...(SITE.booking.enabled
      ? [{ label: `book ${SITE.artist.split(" ")[0]}`, href: "/book/", external: false }]
      : []),
    ...SITE.socials.map((social) => ({ ...social, external: true })),
  ];

  return (
    <footer id="contact" className="border-t-4 border-black bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24">
        <h2 className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">
          say hi —
          <br />
          <span className="text-outline">make some noise</span>
        </h2>

        {links.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[0.625rem] uppercase tracking-[0.35em] text-neutral-400 md:mt-12 md:text-xs">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="-my-2 py-2 transition-colors hover:text-white"
                >
                  {link.label} <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="-my-2 py-2 text-white transition-colors hover:text-neutral-400"
                >
                  {link.label} <span aria-hidden>→</span>
                </a>
              ),
            )}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-[0.5625rem] uppercase tracking-[0.3em] text-quiet md:text-[0.625rem]">
          <span>© mmxxvi aditya chowhan</span>
          <MotionToggle className="-my-2 cursor-pointer py-2 uppercase transition-colors hover:text-white" />
          <span>black &amp; white by design — colour by the music</span>
        </div>
      </div>
    </footer>
  );
}
