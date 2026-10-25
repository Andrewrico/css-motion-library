# CSS Motion Library

[![CI](https://github.com/Andrewrico/css-motion-library/actions/workflows/ci.yml/badge.svg)](https://github.com/Andrewrico/css-motion-library/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/css-motion-library.svg)](https://www.npmjs.com/package/css-motion-library)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE)

**Copy-paste CSS animations with a tiny, accessible playback controller.**
No framework, no build step, no runtime dependencies.

**[Live gallery →](https://andrewrico.github.io/css-motion-library/)**

- **Pure CSS motion.** Every visual is HTML, CSS keyframes and inline SVG. No video files,
  no web fonts, no animation engine.
- **Video-style controls when you want them.** A 7.7 KB (2.4 KB gzip), dependency-free ES module (`src/player.js`) adds
  pause, replay, seeking and playback speed to any CSS animation timeline.
- **Accessible by default.** Each entry has a readable static version for reduced motion
  and no-JavaScript, pauses when offscreen or in a background tab, and has no flashing.
- **Copy one thing.** Each entry is self-contained: one HTML snippet, one CSS file.

## The collection

| # | Entry | What it is | Loop |
|---|---|---|---|
| 001 | [Commerce Storyboard](examples/001-commerce-storyboard/) | Four illustrated process steps with restrained transitions | 24s |
| 002 | [Commerce Film](examples/002-commerce-film/) | Six-shot cinematic sequence: kinetic type, wipes, camera moves | 30s |
| 003 | [Kinetic Headline](examples/003-kinetic-headline/) | Masked word-by-word hero headline with a hand-drawn underline | 8s |
| 004 | [Loading States](examples/004-loading-states/) | Skeleton shimmer, progress, bouncing dots, spinner → check | 6s |
| 005 | [Orbit Diagram](examples/005-orbit-diagram/) | Explainer diagram: satellites orbit a core and highlight in turn | 12s |

Each entry folder has a README with its timeline, theme variables and customization notes.
[`catalog.json`](catalog.json) is the machine-readable index.

## Install

Copy files straight from this repo, or install from npm:

```sh
npm install css-motion-library
```

```js
import {createMotionPlayer} from 'css-motion-library/player.js';
import 'css-motion-library/examples/003-kinetic-headline/animation.css'; // with a CSS-aware bundler
```

## Use an animation

1. Copy the entry's component markup (the `<section data-motion-player>` block) from its
   `index.html`, plus its `animation.css`.
2. Copy [`src/player.js`](src/player.js) and start it:

```html
<link rel="stylesheet" href="animation.css">
<!-- …the entry's <section data-motion-player> markup… -->
<script type="module">
  import {createMotionPlayer} from './player.js';
  document.querySelectorAll('[data-motion-player]').forEach(createMotionPlayer);
</script>
```

3. Change the copy in the HTML and the colors through the custom properties listed in the
   entry README (for example `--ink`, `--accent`).

Entry 001 uses its own small inline script instead of the shared player; see its README.

### Player API

```js
const player = createMotionPlayer(element); // returns null if the browser lacks support
player.play();
player.pause();
player.seek(4.5);      // seconds
player.restart();
player.currentTime;    // seconds
player.playing;        // boolean
player.quality;        // 'full' | 'economy' | 'still'; assignable
player.destroy();      // removes listeners and restores the static state
```

The player reads `data-duration` (seconds) from the root and controls every CSS animation
inside `[data-motion-stage]` as one timeline. It hides its controls and keeps the static
overview when the user prefers reduced motion or the host sets
`data-a11y-reduce-motion="true"` on `<html>`. An embedding page can pause an iframe'd entry
with `postMessage({type: 'css-motion:visibility', visible: false}, origin)` (same origin only).

## Browser support

Current Chrome, Edge, Firefox and Safari. The layouts use container query units (`cqw`) and
the player uses the Web Animations API (`element.getAnimations()`). Older browsers get the
static overview.

## Run locally

Requires Node.js 22+. No install needed to view the gallery:

```sh
npm run dev            # http://127.0.0.1:8092  (PORT=8093 npm run dev to change)
```

### Motion quality

The animation runs on the browser's own timeline; the player only repaints its time label and
seek bar. Quality sets how often, and whether playback starts on its own:

| Mode | Controls repaint | Autoplay |
|---|---|---|
| `full` (default) | 10 Hz | yes |
| `economy` | 2 Hz | yes |
| `still` | 10 Hz while playing | no, shows the first frame until Play |

Set it with `data-motion-quality="economy"` on the player root or on `<html>`, or at runtime
with `player.quality = 'economy'`. Unknown values fall back to `full`. The DOM is only written
when a visible value changed.

Use HTTP rather than `file://`, because the player is an ES module.

## Checks

```sh
npm test               # player state, seeking, preferences, lifecycle (Node test runner)
npm run check          # catalog, links, local assets, JavaScript syntax
npm install && npx playwright install chromium
npm run test:browser   # real Chromium: every entry at 1440×900 and 390×844, seeking,
                       # reduced motion, no-JS, no console errors, no horizontal scroll
```

```sh
npm run measure                     # payload + runtime cost of every entry, per quality mode
npm run measure -- --mp4 film.mp4   # also compare entry 002's payload with a rendered video
npm run measure -- --json out.json  # keep the raw numbers; --only 003 and --seconds 6 narrow a run
```

`measure` is a repeatable lab in headless Chromium (1440×900): bytes served (raw, gzip, brotli),
repaint writes per second for the time label and seek bar, frame gaps, long tasks, animation
and DOM counts. Frame rates there are relative, same-machine numbers; GPU cost, battery,
Safari/Firefox and low-end devices are not measured. See `MEASUREMENTS.md`.

CI runs all three on every push and pull request. The gallery deploys to GitHub Pages
from `main` after CI passes.

## Contribute

New animations are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the entry checklist and
[DEPENDENCIES.md](DEPENDENCIES.md) before adding any third-party effect. Releases are listed in
[CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © 2026 Andrew Rico and CSS Motion Library contributors.
