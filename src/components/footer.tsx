import MotionToggle from "@/components/motion-toggle";
import { SITE, whatsappUrl } from "@/lib/site";

const POLICIES = [
  { label: "terms", href: "/terms/" },
  { label: "privacy", href: "/privacy/" },
  { label: "refunds", href: "/refunds/" },
  { label: "shipping", href: "/shipping/" },
];

type FooterLink = { label: string; href: string; kind: "page" | "tab" | "app" };

export default function Footer() {
  // Only links that actually lead somewhere are shown.
  const links: FooterLink[] = [
    ...(SITE.booking.enabled
      ? [{ label: `book ${SITE.artist.split(" ")[0]}`, href: "/book/", kind: "page" as const }]
      : []),
    ...SITE.socials.map((s) => ({ ...s, kind: "tab" as const })),
    ...(SITE.contact.whatsapp
      ? [{ label: "whatsapp", href: whatsappUrl("Hi Aditya! "), kind: "tab" as const }]
      : []),
    ...(SITE.contact.email
      ? [{ label: "email", href: `mailto:${SITE.contact.email}`, kind: "app" as const }]
      : []),
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
              link.kind === "page" ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="-my-2 py-2 text-white transition-colors hover:text-neutral-400"
                >
                  {link.label} <span aria-hidden>→</span>
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.kind === "tab" ? { target: "_blank", rel: "noopener" } : {})}
                  className="-my-2 py-2 transition-colors hover:text-white"
                >
                  {link.label} <span aria-hidden>↗</span>
                  {link.kind === "tab" && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              ),
            )}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-[0.5625rem] uppercase tracking-[0.3em] text-quiet md:text-[0.625rem]">
          <span>© mmxxvi aditya chowhan</span>
          <span>black &amp; white by design — colour by the music</span>
        </div>

        {/* the fine print, kept to one quiet line under the sign-off */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.5625rem] uppercase tracking-[0.3em] text-quiet md:text-[0.625rem]">
          <nav aria-label="Policies" className="flex flex-wrap gap-x-6 gap-y-3">
            {POLICIES.map((p) => (
              <a key={p.href} href={p.href} className="-my-2 py-2 transition-colors hover:text-white">
                {p.label}
              </a>
            ))}
          </nav>
          <MotionToggle className="-my-2 cursor-pointer py-2 uppercase transition-colors hover:text-white" />
        </div>
      </div>
    </footer>
  );
}
