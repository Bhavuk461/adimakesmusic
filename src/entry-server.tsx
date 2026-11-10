import { StrictMode, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import NotFoundPage from "@/pages/not-found";

/**
 * Build-time only (scripts/prerender.mjs). Each page is rendered to the HTML
 * its client entry will later hydrate, so the built files carry the real
 * content — for search engines, link previews, and the first paint.
 *
 * Keys are files in dist/; every entry must mount the same tree as that
 * page's client entry (src/main.tsx, src/not-found.tsx, …).
 */
const page = (node: ReactNode) => () => renderToString(<StrictMode>{node}</StrictMode>);

export const pages: Record<string, () => string> = {
  "index.html": page(<App />),
  "404.html": page(<NotFoundPage />),
};
