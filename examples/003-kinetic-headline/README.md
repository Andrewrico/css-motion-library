# 003 — Kinetic Headline

An eight-second hero headline reveal: words rise through overflow masks, a hand-drawn
SVG underline draws in, then the subline and call to action follow. Pure CSS keyframes
on one shared timeline, driven by `src/player.js`.

| Time | Beat |
|---|---|
| 0.2–0.7s | Eyebrow slides in |
| 0.6–1.7s | Headline words rise one by one |
| 1.8–2.7s | Underline draws under the last word |
| 2.2–2.9s | Subline fades up |
| 2.7–3.5s | CTA pops in |
| 3.5–7.2s | Hold |
| 7.2–8s | Everything exits up; loop restarts |

## Customize

- Theme: `--paper`, `--ink`, `--accent` on `.kh`.
- Copy: edit both the static `.kh__overview` (no-JS / reduced motion) and the animated
  `.kh__scene`. Keep one `.kh__mask > .kh__word` per word; add `kh__word--N` and a
  matching keyframe if you add words.
- Use it as a page hero by dropping the `.kh` section in and keeping `src/player.js`, or remove
  the controls block and the player for an autoplay-only headline (keep the reduced-motion rule).

## Accessibility

The real heading lives in the static overview; the animated copy is `aria-hidden`. Reduced
motion and no-JS show the finished headline with no movement and no controls.
