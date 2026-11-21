import { StrictMode, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { SETS, fromPrice, hoursLabel, rupees } from "@/lib/packages";
import { SITE } from "@/lib/site";
import BookPage from "@/pages/book";
import DashboardPage from "@/pages/dashboard";
import NotFoundPage from "@/pages/not-found";
import PolicyPage, { type PolicyId } from "@/pages/policy";

/**
 * Build-time only (scripts/prerender.mjs). Each page is rendered to the HTML
 * its client entry will later hydrate, so the built files carry the real
 * content — for search engines, link previews, and the first paint.
 *
 * Keys are files in dist/; every entry must mount the same tree as that
 * page's client entry (src/main.tsx, src/book.tsx, …). `head` returns extra
 * tags for that page's <head>, for anything generated from data.
 */
type PageBuild = { render: () => string; head?: () => string };

const render = (node: ReactNode) => () => renderToString(<StrictMode>{node}</StrictMode>);

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** JSON for a <script> tag — "</" can't appear inside one. */
const jsonForScript = (data: unknown) => JSON.stringify(data, null, 2).replace(/<\//g, "<\\/");

function bookHead() {
  const solo = SETS.find((s) => s.id === "solo")!;
  const band = SETS.find((s) => s.id === "band")!;
  const description =
    `Book Aditya Chowhan live — solo from ${rupees(fromPrice(solo))} or the five-piece band from ` +
    `${rupees(fromPrice(band))}. Bollywood sets for weddings, parties and corporate events in Delhi NCR.`;

  const page = `${SITE.url}/book/`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${page}#webpage`,
        url: page,
        name: "Book Aditya Chowhan — Live Singer & Band in Delhi NCR",
        inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE.url}/#website` },
        about: { "@id": `${SITE.url}/#aditya` },
      },
      {
        "@type": "Person",
        "@id": `${SITE.url}/#aditya`,
        name: SITE.artist,
        url: `${SITE.url}/`,
        sameAs: SITE.socials.map((s) => s.href),
      },
      {
        "@type": "Service",
        "@id": `${page}#service`,
        serviceType: "Live music performance",
        name: "Live Bollywood music — solo or with a band",
        provider: { "@id": `${SITE.url}/#aditya` },
        areaServed: ["Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad"].map((name) => ({
          "@type": "City",
          name,
        })),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Performance packages",
          itemListElement: SETS.flatMap((set) =>
            set.options.map((o) => ({
              "@type": "Offer",
              name: `${set.name} — ${hoursLabel(o.hours)}`,
              price: String(o.price),
              priceCurrency: "INR",
              url: page,
            })),
          ),
        },
      },
    ],
  };

  return [
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<script type="application/ld+json">\n${jsonForScript(data)}\n</script>`,
  ].join("\n    ");
}

const policy = (id: PolicyId): PageBuild => ({ render: render(<PolicyPage id={id} />) });

export const pages: Record<string, PageBuild> = {
  "index.html": { render: render(<App />) },
  "404.html": { render: render(<NotFoundPage />) },
  "book/index.html": { render: render(<BookPage />), head: bookHead },
  "terms/index.html": policy("terms"),
  "privacy/index.html": policy("privacy"),
  "refunds/index.html": policy("refunds"),
  "shipping/index.html": policy("shipping"),
  // only the signed-out shell: bookings never reach the HTML
  "dashboard/index.html": { render: render(<DashboardPage />) },
};
