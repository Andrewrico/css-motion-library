# 001 — Commerce Storyboard

The original four-step CSS introduction. Preserved as the first library entry.

- Story: Audit → Plan → Build → Measure.
- Timing: four six-second scenes, 24 seconds per loop.
- Style: dark canvas, yellow highlights, illustrated cards and subtle movement.
- Controls: pause/resume; automatic offscreen and background-tab pause.
- Fallback: static overview without JavaScript or with reduced motion enabled.
- Source: `source.njk` and `animation.css` preserve the first website component from
  andrewrico.com, commit `dd35b1d9`. The standalone HTML uses generic “Your studio” branding
  and system fonts so the demo has no dependency on that website or its assets.

Use `index.html` for a standalone version or `source.njk` in a Nunjucks project. Change the
copy and labels together. Its CSS expects `--color-primary` and font variables; the demo
provides fallback values through `../../src/demo.css`.

Keep this edition intact. Add new numbered entries when developing a different direction.
All original component code is covered by the repository MIT license.
