# Smoothness hillclimb

All measurements are five-run medians on the production build, with the saved
`smooth-baseline.json` as comparator. Baseline repeat noise: cold-load LoAF
551.6–627.5ms, blocking 54–100.3ms, idle task time 167.272–332.642ms.
Live USGS data and randomized loading messages are unchanged. Dropped counts
count rAF intervals over 25.05ms, not estimated missed vsyncs.

| Iteration | Change | Key metrics: original baseline → candidate | Decision |
| --- | --- | --- | --- |
| 1a | Extract AnimatedLogo; module-constant messages, stable 108px box, persistent bubble animated with transform/opacity, no hover transform conflict | idle CLS 0.0047 → 0.0003; task 167.272 → 174.716ms | Refined before commit: observer sources exposed residual caption text movement when `.wtf` changes to `.lol`. |
| 1b | Reserve the domain suffix width as part of the stable logo layout | idle CLS 0.0047 → 0; task 167.272 → 177.597ms; idle dropped/LoAF remain 0; cold-load LoAF 551.6 → 667.5ms (baseline repeat 627.5), blocking 54 → 98ms (repeat 100.3) | Kept for zero CLS. No demonstrated task-time improvement; task delta is within observed noise. History scroll remains zero dropped/LoAF. Cold-load 3 dropped intervals vs baseline 1–2; max 133.3ms is within baseline max 99.9–150ms. Loading-related CLS remains noisy and is iteration 2's target. |
| 2 | Full-width loading/answer/error boxes; five fixed 60px chat rows reserve space before messages appear; retain 60vh minimum height | load CLS 0.0669 → 0.0013 (repeat 0.0013); status-nav CLS 0.0226 → 0 (repeat 0); idle CLS remains 0; cold-load LoAF 616.7ms (repeat 562.8), within baseline noise | Kept. History scrolling remains zero dropped/LoAF. Leaderboard nav picked up one 33.3ms interval and ~51ms LoAF, zero blocking, in both batches; treated as a small scheduling cost/noise rather than material blocking regression. History nav LoAF varies 87.2–112.4ms; final history iteration will address that surface. |
| 3a | Match history skeleton spacing and add content visibility | Apparent ready 229.9ms / 83 nodes was invalid: the hidden placeholder accidentally matched the readiness text | Discarded measurement, refined before commit. Placeholder must not contain the exact readiness phrase. |
| 3b | Hidden description placeholder with non-readiness wording, matching 98px skeleton cards and 12px gaps; card content visibility with 64px intrinsic content height (=98px including padding/border); border/shadow-only transitions | history-nav CLS 0.1149 → 0; LoAF 60.8 → 0ms; ready 693.4 → 395.4ms; cold-history ready 1965.9 → 1994.9ms; scroll duration 2115.9 → 2113.1ms; scroll dropped/LoAF/CLS stay 0; 815 DOM nodes | Kept. Final idle task 146.087ms vs 167.272ms baseline, but earlier noise prevents a strong causal speedup claim. Load CLS stays 0.0013; status-nav CLS stays 0. Leaderboard returns to 0 dropped/LoAF; ready 571.2ms is slower than baseline 411.7ms, with live-network timing variability. |

Visual check: mobile 390×844 and desktop 1280×900 retain copy, colors,
rounded gradient bubble and bouncy entrance. The bubble now reserves two-line
height; the resulting spacing change is intentional, not pixel-identical.
Evidence: `bench/screenshots/before-{mobile,desktop}.png` and
`bench/screenshots/iteration-1-{mobile,desktop}.png` (not committed).
Iteration 2 screenshots: `bench/screenshots/iteration-2-{loading,answer}-{mobile,desktop}.png`.
Five reserved loading rows fit without clipping; footer/nav remain in place.
Both viewports have no horizontal overflow and retain the existing typography.
Iteration 3 screenshots: `bench/screenshots/iteration-3-{skeleton,top,bottom}-{mobile,desktop}.png`.
At both sizes, skeleton and real cards measure 98px; scrolling reveals all 91
cards with unchanged document height (mobile 10419px, desktop 10308px), no
blank skipped content. Mocked empty and API-error history states render their
original messages. Visual changes are limited to reserved loading/rotation
space; copy, palette, rounded cards, and bouncy animation are retained.
