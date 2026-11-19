// Runs after both Vite builds (see "build" in package.json):
//   dist/  — the client build
//   .ssr/  — src/entry-server.tsx compiled for Node
//
// Fills every page's empty <div id="root"> with its server-rendered markup,
// adds any generated <head> tags, and writes sitemap.xml — then throws the
// server bundle away.
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ORIGIN = "https://adimakesmusic.in";
// Pages search engines should index, most important first. The 404 and the
// policy pages are deliberately left out (they're noindex).
const SITEMAP = ["/", "/book/"];

const root = process.cwd();
const dist = path.join(root, "dist");
const ssr = path.join(root, ".ssr");
// the root may carry attributes (the policy pages say which page they are)
const ROOT = /<div id="root"([^>]*)><\/div>/;

const { pages } = await import(pathToFileURL(path.join(ssr, "entry-server.js")).href);

for (const [file, page] of Object.entries(pages)) {
  const target = path.join(dist, file);
  let html = await fs.readFile(target, "utf8");
  if (!ROOT.test(html)) throw new Error(`${file}: no empty #root to fill`);

  const markup = page.render();
  // functions, so "$" in the markup is never read as a replacement pattern
  html = html.replace(ROOT, (_, attrs) => `<div id="root"${attrs}>${markup}</div>`);
  if (page.head) html = html.replace("</head>", () => `    ${page.head()}\n  </head>`);

  await fs.writeFile(target, html);
  console.log(`prerendered ${file} (${(markup.length / 1024).toFixed(1)} kB)`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = SITEMAP.map(
  (p) => `  <url>\n    <loc>${ORIGIN}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
).join("\n");
await fs.writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`wrote sitemap.xml (${SITEMAP.length} url${SITEMAP.length === 1 ? "" : "s"})`);

await fs.rm(ssr, { recursive: true, force: true });
