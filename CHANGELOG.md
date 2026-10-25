# Changelog

## 1.0.1 — 2026-10-24

- First npm release. Package exports `css-motion-library/player.js`, every entry file under
  `css-motion-library/examples/*`, and `catalog.json`. The original site source of entry 001
  (`source.njk`) stays in the repository but is left out of the npm package.

## 1.0.0 — 2026-10-24

First public release.

- New entries: 003 Kinetic Headline, 004 Loading States, 005 Orbit Diagram.
- 002 Commerce Film: the standalone page now keeps the playback controls on screen at
  common desktop heights.
- `npm run test:browser`: real-browser release check (Playwright/Chromium) across every
  entry at desktop and mobile widths, seeking, reduced motion and no-JS.
- GitHub Actions: CI (unit, asset and browser checks) and GitHub Pages deploy of the gallery.
- Package metadata, `exports` for `src/player.js`, and a rewritten README.

## 0.1.0 — 2026-10-20

- 001 Commerce Storyboard and 002 Commerce Film, shared `src/player.js`, gallery,
  Node unit tests and asset check.
