# 002 — Commerce Film

A thirty-second CSS film designed to feel closer to an edited motion-graphics video.
All pictures are HTML, CSS or original SVG; there is no rendered video or animation engine.

| Time | Shot | Direction |
|---|---|---|
| 0–5s | Commerce in Motion | Masked kinetic typography, lens push and a moving ticker |
| 5–10s | Audit | Full-frame acid yellow, a tilted diagnostics window and a scanning line |
| 10–15s | Plan | Blueprint camera drift, drawing SVG wires and staggered nodes |
| 15–20s | Build | A perspective storefront flies into the frame and the camera pushes in |
| 20–25s | Measure | Tall typography, an orbit and staggered illustrative chart bars |
| 25–30s | Better Commerce | Closing title on yellow; short hold before the loop |

The film uses CSS scene cuts, a recurring wipe, slow camera movement and deliberate title
holds. Desktop is 16:9; smaller screens recompose into a 3:4 frame rather than cropping.
The chart is a motion illustration and claims no measured result.

## Playback

`../../src/player.js` controls CSSAnimation objects with the browser's native API. Controls
include pause/play, replay, a keyboard-operable seek bar, time display and 0.5×/1×/1.5× speed.
The shared controller pauses in hidden tabs and offscreen, remembers manual pause, supports
multiple instances, handles reduced motion and cleans up listeners on `destroy()`.

No-JS or reduced-motion mode shows “Better commerce. By design.” and the process summary.
With reduced motion active, playback controls are hidden and automatic motion stays paused.

## Customize

Edit text and SVG in `index.html`. Theme variables are `--ink`, `--acid`, `--paper`.
All shot and detail animations share a 30-second timeline; shot starts use `--shot * 5s`.
To change the duration or scene count, update the CSS timeline, delays, percentages,
`data-duration`, and seek-range maximum together.

For reuse, copy this HTML and CSS plus `src/player.js`. Adapt the short import in `src/auto.js`
to your file layout, and keep the demo's box-sizing/font defaults or provide your own.
Use the existing CSS effect as a reference when adding new shots. Avoid overwriting entry 001.
