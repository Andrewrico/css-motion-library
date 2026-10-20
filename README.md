# CSS Motion Library

A growing, MIT-licensed collection of reusable HTML and CSS animations. From quiet
illustrated storyboards to short cinematic sequences. Each entry keeps its own source
so new experiments never overwrite the good ones.

## Start the gallery

Requires Node.js 22 or newer. No package installation, account, CDN or build step.

```sh
npm run dev
```

Open **http://127.0.0.1:8092**. To change the port: `PORT=8093 npm run dev`.
You can also serve this folder with any ordinary static server. Use HTTP rather than
opening the HTML as `file://`, because the shared player is an ES module.

## Collection

| Entry | What it does | Duration | Files |
|---|---|---|---|
| 001 · Commerce Storyboard | Four illustrated process steps; restrained transitions | 24 seconds | [Demo](examples/001-commerce-storyboard/index.html) · [Notes](examples/001-commerce-storyboard/README.md) |
| 002 · Commerce Film | Six shots, kinetic typography, wipes, camera moves and a seekable player | 30 seconds | [Demo](examples/002-commerce-film/index.html) · [Notes](examples/002-commerce-film/README.md) |

`catalog.json` is the machine-readable index. The gallery uses local assets only.
Entry 001 preserves the first edition; entry 002 is a separate animation, not a rewrite.

## Reuse an animation

Copy an entry's HTML and `animation.css`. Keep the MIT notice. For entry 002, also copy
`src/player.js` and initialize it on your player element:

```html
<script type="module">
  import {createMotionPlayer} from './player.js';
  const player = createMotionPlayer(document.querySelector('[data-motion-player]'));
  // player.play(); player.pause(); player.seek(12); player.restart();
  // player.currentTime; player.playing; player.destroy();
</script>
```

`src/demo.css` contains the standalone demo's reset and navigation styles. Bring its
box-sizing reset and font defaults along if your host page does not already provide them.
All film motion is defined by CSS keyframes. The controller uses native CSSAnimation
objects to synchronize pause, resume, seeking and playback speed.

The controller pauses offscreen and in hidden tabs, respects OS reduced-motion preferences,
and supports the host attribute `data-a11y-reduce-motion="true"`. With reduced motion or
without JavaScript, the film displays a readable static overview. Controls are native
buttons, a keyboard-operable range input and a speed select. There is no audio.

The 002 film includes a host message for iframe visibility. `gallery.js` demonstrates
sending `{type:'css-motion:visibility', visible:true}` from the same-origin parent. Messages
from unrelated origins or windows are ignored. Each player instance is independent.

Customize copy in the HTML and colors via `--ink`, `--acid` and `--paper`. The current
002 storyboard is six five-second shots. Changing shot count or duration requires updating
the CSS timing percentages and delays as well as the HTML duration and seek range.

## Dependencies

The core has **zero third-party runtime dependencies**. It uses native CSS animations,
SVG and the Web Animations API. Modern browsers with container-query units are required
for the cinematic layout. No React, video files, web fonts or external assets are required.
See [DEPENDENCIES.md](DEPENDENCIES.md) for the optional animation/tooling choices and
Animate.css licensing details.

## Checks

```sh
npm test
npm run check
```

Tests exercise playback state, seeking, preferences and lifecycle using native Node test
facilities with animation objects mocked. They do not assert actual browser rendering.
The asset check validates catalog entries, internal demo assets and JavaScript syntax.
Before a release, visually inspect each shot at desktop and mobile widths, scrub the
boundaries at 5/10/15/20/25 seconds, and check reduced motion. Browser visual verification
is still pending for the initial local snapshot because the authoring browser service
was unavailable. Do not interpret the Node checks as a screenshot comparison.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Original code is [MIT](LICENSE). Public visual
inspiration is welcome; copied assets require their own license and attribution.
