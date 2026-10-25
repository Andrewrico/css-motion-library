# 005 — Orbit Diagram

A twelve-second explainer diagram. Four satellites ride a slowly rotating orbit around a
core; every three seconds one lights up, a connector draws in from the core and the caption
changes. Labels counter-rotate so they always read upright.

| Time | Highlight | Caption |
|---|---|---|
| 0–3s | Data | Data — collect what matters |
| 3–6s | Design | Design — shape the experience |
| 6–9s | Content | Content — say it clearly |
| 9–12s | Delivery | Delivery — ship and iterate |

The orbit makes one full turn per loop, so the loop restarts seamlessly.

## Customize

- Theme: `--bg`, `--line`, `--text`, `--accent`, `--accent-2` on `.od`.
- Sizes: `--orbit-size`, `--node-size`, `--core-size`.
- Labels and captions: edit the node labels, the caption list and the static overview list
  together. For a different number of satellites, change the node positions, the connector
  angles and the per-node keyframe windows (each node owns a `100% / n` slice of the loop).
- Every keyframe set starts with an explicit `0%` stop. Keep it that way: a keyframe that
  starts at, say, `25%` interpolates from the element's resting style, which here would show
  the connector fully drawn before its turn.

## Accessibility

The animated diagram is `aria-hidden`; the static overview carries the heading and the four
captions as a list. Reduced motion and no-JS show that overview.
