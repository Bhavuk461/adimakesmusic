import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

/**
 * Pages are prerendered to HTML at build time (scripts/prerender.mjs), so in
 * production there is already markup in #root to adopt. The dev server serves
 * an empty root, which gets a plain client render instead.
 */
export function mount(page: ReactNode) {
  const root = document.getElementById("root")!;
  const tree = <StrictMode>{page}</StrictMode>;
  if (root.hasChildNodes()) hydrateRoot(root, tree);
  else createRoot(root).render(tree);
}
