# adimakesmusic

Site for **Aditya Chowhan** — singer. Everything is black &amp; white, until you press play.

Built with Vite + React + TypeScript + Tailwind CSS v4, shadcn-style project structure
(components live in `src/components/ui`, `@/` maps to `src/`).

## The idea

- **Upper half** — black. Big type, a slow-spinning vinyl, film grain.
- **The seam** — two marquee tapes crossing at opposing angles.
- **Lower half** — white. Four expand-on-hover cards: the only colour on the page.
  Hovering the first card blurs the photo and plays a demo track, with live
  sound bars driven by the Web Audio API (`AnalyserNode`) in front.
  Cards 2–4 are colourful placeholders waiting for the next tracks.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # typecheck, build, then prerender every page to static HTML
npm run preview  # serve dist/ exactly as it will be deployed
```

## Pages, and how they reach search engines

Each page is its own HTML file with its own `<head>` — title, description,
canonical URL, share-card tags and structured data live there, in plain HTML.

| File | Entry | Rendered by |
| --- | --- | --- |
| `index.html` | `src/main.tsx` | `src/App.tsx` |
| `404.html` | `src/not-found.tsx` | `src/pages/not-found.tsx` |

`npm run build` runs three steps: the client build, a second build of
`src/entry-server.tsx` for Node, and `scripts/prerender.mjs`, which renders each
page into its `<div id="root">` and writes `sitemap.xml`. So the deployed HTML
already contains the content (crawlers and link previews never need to run the
script), and the browser *hydrates* it instead of rendering from nothing.

To add a page: create its HTML file and entry, list it under `build.rollupOptions.input`
in `vite.config.ts`, add it to `pages` in `src/entry-server.tsx`, and — if it
should be indexed — to `SITEMAP` in `scripts/prerender.mjs`.

Things that live outside the components:

- `src/lib/site.ts` — name, links, booking switch. Empty values aren't rendered.
- `public/robots.txt`, `public/site.webmanifest`, icons, `public/og.png`
  (the share card; its source is `scripts/og.html`).

## Accessibility

The site is built to WCAG 2.2 AA. The parts that are easy to break:

- **Contrast.** The dimmest text uses the `quiet` / `quiet-ink` colours in
  `src/index.css`, which sit just above the 4.5:1 minimum for their background.
  On the colour cards the type is inked black or white *per card* (`ink` in
  `expand-cards.tsx`) — white fails on the orange and the green.
- **Keyboard.** The cards are buttons: Tab reaches them, Enter/Space plays or
  pauses the track, Escape stops it. Hover is only a shortcut.
- **Motion.** "pause motion" (footer, and the second Tab stop) freezes the
  looping animations; `prefers-reduced-motion` is honoured too. New infinite
  animations must be added to the `[data-motion="off"]` rule in `index.css`.

## Swap in new music

1. Drop the audio file at `public/audio/` and the cover at `public/pics/`.
2. Point a card at them in `src/components/ui/expand-cards.tsx` (the `cards` array),
   and pick its `ink` so the type stays readable on the cover.

Note: browsers block autoplay before the first interaction with a page — if the
first hover is blocked, the card shows *"click once for sound"* and any click
unlocks it. That's a browser policy, not a bug.

## Deploy

```bash
npm run deploy   # builds and publishes dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch. Live at https://adimakesmusic.in

The custom domain comes from `public/CNAME`, which ships in every build — if
that file ever goes missing, Pages drops back to the `github.io` URL and the
domain stops resolving. Vite `base` is `/` to match the domain root.

The domain is verified in Google Search Console through a `TXT` record at the
registrar (not a file in this repo), with `sitemap.xml` submitted there.
