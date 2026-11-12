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

## Final load-speed guardrail

Ran the requested three-run benchmark once with Lighthouse disabled.
Composite: **1.011**. Idle jank and LoAF remain 0. Status ready 4358.3 →
4176.1ms; history ready 2149.1 → 1761.3ms; JS 481.6 → 482.2KB.
History nav 551.2 → 602.5ms; leaderboard nav 385.1 → 572.8ms (1.49×),
so the run is not an across-the-board load-speed improvement.

Investigated the leaderboard flag without changing application code:
five live-response pairs toggling history card content visibility showed
both fast (~340–392ms) and slow (~855–898ms) transitions; the slow class
also occurred with containment disabled. Slow transitions had USGS TTFB
~368–388ms rather than ~153–158ms. This demonstrates upstream timing
variation, but does not by itself exclude an additional rendering cost.
A second five-pair diagnostic served the same captured USGS response with
the same 150ms delay, alternating order, under the same CPU/network
emulation. Median leaderboard ready: **355ms with containment vs 357ms
without**. Kept iteration 3: no material containment-induced regression
was reproduced under controlled data. This diagnostic is not a replacement
for the live-data benchmark, whose 1.49× result remains reported.

All iteration builds and five-run smoothness batches completed. Lint ran
before every commit: 0 errors, the same three pre-existing unused `err`
warnings. No API, fetch/loading timing, readiness strings, navigation
labels, or `scripts/bench.mjs` changes. Only the two approved baseline JSON
files are committed; candidate JSON and screenshots remain local.

## Iterations 4–8

| Iteration | Change | Key metrics / verification | Decision |
| --- | --- | --- | --- |
| 4 | Restore natural inline-block bubble and edge-aligned caption inside a bottom-anchored reserved box; start entrance/caption animation before paint | Idle CLS stays 0 in two five-run batches; idle dropped/LoAF stay 0; load CLS 0.0013; history/status-nav CLS 0. Short bubble and 358×80px two-line bubble match original geometry. Idle task 201.644/260.039ms, within baseline noise. Leaderboard nav CLS 0.0889 is now repeatable and will be investigated in iteration 8; no leaderboard code changed here. | Kept: visual regression fixed, stability retained. |
| 5 | Reduced-motion CSS disables float/wiggle/pulse/bounce and replaces entrance animations with 100ms opacity fades; WAAPI uses 100ms opacity-only fades | Normal idle CLS/dropped/LoAF remain 0; load CLS 0.0013; normal cold-load LoAF 642.5ms, blocking 126.4ms. Reduced-media check: no dot animations, CSS/WAAPI durations ≤100ms, no WAAPI transform keyframes. | Kept for accessibility; normal cold-load scheduling remains noisy (max 166.7ms vs prior 100.1–133.3ms), no persistent idle regression. |
| 6 | Transparent tap highlight and manipulation touch action on links/buttons; transform-only 0.98 press feedback on cards/nav/retry, respecting reduced motion | Initial batch had 1 idle dropped interval and history p95 33.3ms; repeat idle dropped/CLS/LoAF 0, history p95 16.8ms and LoAF 0, load CLS 0.0013. Press checks show scale 0.98 and only transform/translate/scale/rotate transitions; history retains content-visibility:auto. | Kept. Repeat history-nav CLS 0.0545 vs original 0.1149 (first candidate 0); route shifts remain timing-dependent. |

Iteration 4 visual evidence, compared directly: `bench/screenshots/perf-bench-{short,long}-mobile.png`
and `bench/screenshots/iteration-4-{short,long}-mobile.png`. Same bubble width,
height, padding, wrapping, colors, corners and caption alignment; reserved box
intentionally keeps the answer stationary instead of following bubble height.
