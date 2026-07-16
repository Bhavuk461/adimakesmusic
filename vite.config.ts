import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Deployed as a GitHub Pages project site at /adimakesmusic/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/adimakesmusic/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
