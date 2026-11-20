import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const at = (file: string) => path.resolve(import.meta.dirname, file);

/**
 * The <head> tags every page shares, written once. Each HTML entry keeps only
 * what is its own (title, description, canonical, structured data) and marks
 * where these go with <!-- shared-head -->.
 */
const SHARED_HEAD = `
    <meta name="theme-color" content="#000000" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2" />
    <!-- before anything paints: restore a saved "pause motion" choice, and note
         whether this visit has already opened a page — the homepage's intro
         plays only on the first one (sessionStorage: forgotten with the tab) -->
    <script>
      try {
        if (localStorage.getItem("motion") === "off") document.documentElement.dataset.motion = "off";
      } catch (e) {}
      try {
        if (sessionStorage.getItem("visited")) document.documentElement.dataset.intro = "seen";
        else sessionStorage.setItem("visited", "1");
      } catch (e) {}
    </script>`;

function sharedHead(): Plugin {
  return {
    name: "shared-head",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (!html.includes("<!-- shared-head -->")) {
          throw new Error(`${ctx.filename}: missing <!-- shared-head --> marker`);
        }
        return html.replace("<!-- shared-head -->", SHARED_HEAD.trim());
      },
    },
  };
}

// Served at the root of the custom domain (public/CNAME → adimakesmusic.in),
// so assets are absolute from "/" rather than a project-site subpath.
export default defineConfig({
  plugins: [react(), tailwindcss(), sharedHead()],
  base: "/",
  resolve: {
    alias: {
      "@": at("./src"),
    },
  },
  build: {
    rollupOptions: {
      // One HTML file per page, each with its own <head>, prerendered by
      // scripts/prerender.mjs. The folder is the URL: book/index.html → /book/.
      input: {
        main: at("index.html"),
        notFound: at("404.html"),
        book: at("book/index.html"),
        terms: at("terms/index.html"),
        privacy: at("privacy/index.html"),
        refunds: at("refunds/index.html"),
        shipping: at("shipping/index.html"),
      },
    },
  },
});
