# Dependencies and design choices

The first release runs with no third-party runtime packages. All animation keyframes are
original CSS; a small JavaScript controller operates the browser's CSSAnimation objects.

| Tool | Where it fits | Decision |
|---|---|---|
| Native CSS + SVG + Web Animations API | Scene visuals, timing and playback | Core, included |
| [Motion](https://motion.dev/docs/animate) | Advanced timeline sequences or springs | Optional future engine; [MIT](https://github.com/motiondivision/motion/blob/main/LICENSE.md) |
| [Animate.css](https://animate.style/) | Ready-made CSS entrances, exits and emphasis | Optional integration; not bundled |
| [Vite](https://vite.dev/guide/) | Gallery development and builds as the collection grows | Optional later; the current static gallery needs no bundler |
| [Playwright](https://playwright.dev/docs/test-snapshots) | Real-browser playback, mobile and visual regression checks | Recommended release tooling; not installed in this offline snapshot |

## Animate.css

Checked against upstream on 2026-10-20: Animate.css package version 4.1.1 declares
`Hippocratic-2.1`, and its LICENSE contains those terms. Do not describe the package as
MIT or copy its effects into this repo under the repository's MIT notice.

- [Upstream package metadata](https://github.com/animate-css/animate.css/blob/main/package.json)
- [Upstream license](https://github.com/animate-css/animate.css/blob/main/LICENSE)

It can be useful for an integration with its license and attribution preserved separately.
No Animate.css code or CSS asset is bundled here. No CDN is needed to run either example.

## Keep the dependency surface small

Add an engine when a demonstrated effect needs it. Motion, Anime.js and GSAP overlap;
installing several animation engines for the same job increases maintenance and payload.
Keep optional adapters separate so people can copy a plain CSS example without adopting
a framework. The video-like result comes from scene direction, composition, timing and
camera movement as well as the engine.
