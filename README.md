# adimakesmusic

Site for **Aditya Chauhan** — musician. Everything is black &amp; white, until you press play.

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
npm run dev      # http://localhost:5173/adimakesmusic/
npm run build    # typecheck + production build to dist/
```

## Swap in new music

1. Drop the audio file at `public/audio/` and the cover at `public/pics/`.
2. Point a card at them in `src/components/ui/expand-cards.tsx` (the `cards` array).

Note: browsers block autoplay before the first interaction with a page — if the
first hover is blocked, the card shows *"click once for sound"* and any click
unlocks it. That's a browser policy, not a bug.

## Deploy

```bash
npm run deploy   # builds and publishes dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch (Vite `base` is set to
`/adimakesmusic/`). Live at https://bhavuk461.github.io/adimakesmusic/
