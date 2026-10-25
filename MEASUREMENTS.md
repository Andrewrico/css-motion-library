# Measurements

Produced by `npm run measure` (scripts/measure.mjs): headless Chromium, 1440×900, 4 s per run,
2026-10-25, one machine. Re-run it after any player or CSS change and replace this file's numbers.

## Player repaint cost, entry 003 (before = committed player, after = this change)

| Player | Mode | Label writes/s | Seek-bar writes/s | Avg frame ms |
|---|---|---|---|---|
| before | any | 60.3 | 60.3 | 16.7 |
| after | full | 0.8 | 9.8 | 16.7 |
| after | economy | 1.0 | 2.0 | 16.7 |

The animation itself is unchanged (same animation count, same frame gaps); only the controls'
DOM writes dropped. Frame gaps sit at the 60 Hz display rate in every row, so headless
Chromium does not show a frame-time gain: the saving is main-thread and style-recalc work that
this lab counts as writes but does not time.

## Payload per entry (bytes served by the local server)

| Entry | Raw KB | gzip KB | brotli KB |
|---|---|---|---|
| 001 Commerce Storyboard | 20.0 | 5.2 | 4.2 |
| 002 Commerce Film | 33.7 | 10.0 | 8.3 |
| 003 Kinetic Headline | 21.8 | 6.5 | 5.4 |
| 004 Loading States | 24.3 | 6.7 | 5.6 |
| 005 Orbit Diagram | 25.5 | 7.0 | 5.8 |

The player grew from 6.4 KB to 7.7 KB raw (2.4 KB gzip) with the throttle and quality modes.

## Entry 002 against an MP4

Not applicable: there is no original rendered film of entry 002 (confirmed by the author,
2026-10-25), so no like-for-like payload comparison exists. Entry 002 is the original, built in
HTML/CSS/SVG: 10.0 KB gzip (8.3 KB brotli) served. `npm run measure -- --mp4 path/to/video.mp4`
still compares against any other video you supply; payload says nothing about visual equivalence.

## Not measured (unavailable here)

- GPU and compositor cost, real paint timing, power or battery draw.
- Safari/WebKit and Firefox; this lab runs Chromium only.
- Low-end phones, CPU throttling, slow networks.
- Whether `economy` is noticeable to viewers: the seek bar moves in 0.5 s steps.
