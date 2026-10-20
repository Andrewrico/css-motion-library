# CSS Motion Library

Standalone open-source repository; no dependency on the original website/workspace.

- Original code is MIT. Preserve entry 001 and add numbered examples rather than overwriting it.
- Keep animation visuals in CSS/SVG. JavaScript handles playback, preferences and controls.
- Core and examples run without package installation or a build step (`npm run dev`).
- `catalog.json` records every example. Keep the gallery and per-example README in sync.
- Every animation needs pause/replay, reduced-motion and no-JS fallbacks; no flashing/strobing.
- Keep examples neutral and reusable. No private client names, analytics, credentials or invented results.
- Third-party effects need their own license review and attribution. Animate.css 4.1.1 is
  Hippocratic-2.1; it is an optional integration, not bundled or relicensed as MIT.
- Run `npm test` and `npm run check`. Check desktop/mobile and seeking in a real browser when available;
  document unavailable browser verification rather than claiming it passed.
- No deployment, recurring workflows, publishing to npm or remote push without authorization.
