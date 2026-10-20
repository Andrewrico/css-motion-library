# Add an animation

1. Create `examples/NNN-short-name/` using the next unused number. Preserve existing entries.
2. Include `index.html`, `animation.css`, and a README with a storyboard, timing notes,
   customization instructions and any asset/license credits.
3. Add the entry to `catalog.json` and add its card to the gallery.
4. Use original CSS and SVG. Use `src/player.js` for video-like playback rather than copying
   a controller into every new entry. Namespace selectors and keyframes to avoid collisions.
5. Provide a static no-JS/reduced-motion overview, pause/replay controls and keyboard seeking.
   Pause automatic playback offscreen and in background tabs. Avoid rapid flashing.
6. Use generic examples. Label illustrative charts. Include no private business data, client
   screenshots, credentials, remote analytics or unapproved third-party assets.
7. Run `npm test` and `npm run check`, then inspect desktop and mobile in a real browser.
   Check seeking at scene boundaries, manual pause after scrolling, playback speed and
   reduced motion. Document any verification you could not perform.

The original source here is MIT-licensed. Keep third-party licenses distinct and preserve
notices. See `DEPENDENCIES.md` before adding Animate.css or another effects library.
