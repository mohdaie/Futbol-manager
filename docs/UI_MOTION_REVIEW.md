# UI motion review

Inspected the current main UI in Chromium at a 390×844 touch viewport. Changes
are isolated on `fix/ui-motion`, separate from the rulebook engine PR.

## Findings and changes

- Standard buttons/tabs had no press feedback while Continue scaled to 97%.
  Controls now dim immediately on press and release in 80 ms. Small action
  buttons move down 1 px; navigation labels stay in place. Hover is limited to
  devices that actually support it, avoiding sticky touch hover.
- Screen changes were abrupt. New screens receive a 160 ms, 4 px content fade;
  same-screen edits do not replay it. Live match playback is excluded.
- Sheet entrances used 25 px of travel and exits were instant. Entrances now
  travel 12 px in 180 ms; dismissals fade/move out over 120 ms. Real dialog/history
  state closes immediately. Only an inert, aria-hidden visual copy completes
  the exit, and a newly opened dialog cancels that copy.
- Full redraws recentered horizontal section rails and could discard focus or
  unsubmitted search text. Same-screen updates retain rail/main scroll, the
  focused control, draft text and selection. New navigation still resets normally.
- A toast's delayed hide could conceal a newer toast. Both timers are cancelled
  when a new message arrives; initial appearance now transitions correctly.
- Reduced motion disables the new movement, existing toast/progress movement
  and dialog/page transitions. Controls remain immediately usable throughout.

## Validation

- `tests/ui-motion.cjs`: 16 focused browser checks, including touch feedback,
  screen vs. redraw behaviour, focus/selection/scroll, rapid sheet replacement,
  inert exit cleanup, toast replacement and reduced motion.
- `tests/ui-stability.cjs`: 24 existing fee/wage, rapid edit and popup checks.
- `tests/navigation.cjs`: 47 existing Back/history/save/title checks.
- `tests/live.cjs`: live playback/save/resume regression (result in PR).
  Its existing timing race is corrected using the actual page-exit checkpoint
  and an atomic paused save/load, matching the previously reviewed PR #40 fix.

```sh
CHROMIUM_PATH=/path/to/chromium node tests/ui-motion.cjs
CHROMIUM_PATH=/path/to/chromium node tests/ui-stability.cjs
CHROMIUM_PATH=/path/to/chromium node tests/navigation.cjs
CHROMIUM_PATH=/path/to/chromium node tests/live.cjs
```

[Short QA recording](ui-motion/demo.mp4) shows navigation, transfers and dialog
checks. It includes diagnostic toast/dialog text used by the test. This is a
Chromium inspection; native Android WebView/Safari still merit hands-on review.
No match logic, tuning, theme or deployment configuration changed.
