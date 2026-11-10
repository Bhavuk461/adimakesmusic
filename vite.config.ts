import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const at = (file: string) => path.resolve(import.meta.dirname, file);

// Served at the root of the custom domain (public/CNAME → adimakesmusic.in),
// so assets are absolute from "/" rather than a project-site subpath.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": at("./src"),
    },
  },
  build: {
    rollupOptions: {
      // One HTML file per page: each gets its own <head> (title, description,
      // structured data) and is prerendered by scripts/prerender.mjs.
      input: {
        main: at("index.html"),
        notFound: at("404.html"),
      },
    },
  },
});
