# 004 — Loading States

Four reusable loading micro-animations on one six-second loop: a skeleton shimmer, a
determinate progress bar, bouncing dots, and a spinner that resolves into a check mark.

| Card | Motion | Cycle |
|---|---|---|
| Skeleton | Gradient shimmer sweeps across placeholder lines | 2s |
| Progress | Bar and tick row fill 0→100%, hold, reset | 6s |
| Dots | Three staggered bounces | 1.5s |
| Success | Spinner rotates, then a check mark draws in at ~3s | 6s |

All cycles divide six seconds evenly, so seeking keeps every card in sync.

## Customize

- Theme: `--bg`, `--card`, `--text`, `--accent` on `.ls`.
- Each card is independent. Copy one `.ls__card` and the rules/keyframes with its prefix
  (`ls__skeleton`, `ls__progress`, `ls__dot`, `ls__success`). Without the player, the
  `infinite` keyframes still loop on their own; keep the `prefers-reduced-motion` block.
- In a real app, swap the progress keyframe for a `width` you set from JavaScript, and show
  the success state when your task actually finishes.

## Accessibility

The cards are decorative (`aria-hidden`). In production, pair a loader with
`role="status"` or `aria-busy="true"` on the region that is loading. Reduced motion and
no-JS show the resting states.
