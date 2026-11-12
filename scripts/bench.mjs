#!/usr/bin/env node
// Perf benchmark for earthquake.wtf. Usage:
//   npm run build && npm run bench            (starts `next start` on :3123)
//   BENCH_URL=http://localhost:3000 npm run bench   (bench an already-running server)
// Options (env): BENCH_RUNS (default 5), BENCH_LIGHTHOUSE=0 to skip Lighthouse,
//   BENCH_BASELINE=path/to/baseline.json to print ratios + composite score,
//   BENCH_OUT=path to write JSON results (default bench-results.json).
// Emulates a mid-range phone: 4x CPU slowdown, 150ms RTT, ~1.6Mbps down.
import { chromium } from "playwright-core";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RUNS = Number(process.env.BENCH_RUNS ?? 5);
const PORT = 3123;
let BASE = process.env.BENCH_URL;
const OUT = process.env.BENCH_OUT ?? "bench-results.json";

const STATUS_RE = /^(YES|NO|MAYBE|UNKNOWN)\.?$/;
const READY = {
  "/": `() => [...document.querySelectorAll("h1")].some(h => ${STATUS_RE}.test(h.textContent.trim()) && h.getBoundingClientRect().height > 0)`,
  "/history": `() => /earthquakes in the Bay Area over the last 30 days|No earthquakes recorded/.test(document.querySelector("main")?.innerText ?? "")`,
  "/leaderboard": `() => /Total Earthquakes/.test(document.querySelector("main")?.innerText ?? "") && !/Leaderboard\\s*$/.test(document.querySelector("main")?.innerText ?? "")`,
};

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

async function waitForServer(url, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("server did not start");
}

async function newThrottledPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  return { ctx, page, cdp };
}

async function timeToReady(page, check, timeout = 30000) {
  return page.evaluate(async ({ check, timeout }) => {
    const fn = eval(check);
    const t0 = performance.now();
    while (!fn()) {
      if (performance.now() - t0 > timeout) return -1;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return performance.now();
  }, { check, timeout });
}

// Cold load: navigation start -> meaningful content visible.
async function coldLoad(browser, path) {
  const { ctx, page } = await newThrottledPage(browser);
  let jsBytes = 0;
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script") {
      try { jsBytes += Number(r.headers()["content-length"] ?? (await r.body()).length); } catch {}
    }
  });
  await page.goto(BASE + path, { waitUntil: "commit" });
  const t = await timeToReady(page, READY[path]);
  await page.waitForLoadState("networkidle").catch(() => {});
  const vitals = await page.evaluate(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? -1;
    return { fcp };
  });
  await ctx.close();
  return { readyMs: t, fcp: vitals.fcp, jsKB: jsBytes / 1024 };
}

// Client-side navigation: click nav link -> destination content visible. Also records janky frames.
async function clientNav(browser) {
  const { ctx, page } = await newThrottledPage(browser);
  await page.goto(BASE + "/", { waitUntil: "commit" });
  await timeToReady(page, READY["/"]);
  await page.waitForLoadState("networkidle").catch(() => {});
  const res = {};
  for (const [label, path] of [["History", "/history"], ["Leaderboard", "/leaderboard"], ["Status", "/"], ["History", "/history"]]) {
    const link = page.locator("nav:visible a", { hasText: label }).first();
    await page.evaluate(() => { window.__t0 = performance.now(); });
    await link.click({ noWaitAfter: true });
    const tReady = await timeToReady(page, `() => location.pathname === ${JSON.stringify(path)} && (${READY[path]})()`);
    const t0 = await page.evaluate(() => window.__t0);
    (res[path] ??= []).push(tReady < 0 ? 30000 : tReady - t0);
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  await ctx.close();
  return res;
}

// Smoothness: sample rAF frame deltas on "/" for 8s after it is ready (covers rotating bubble animation).
async function smoothness(browser) {
  const { ctx, page } = await newThrottledPage(browser);
  await page.goto(BASE + "/", { waitUntil: "commit" });
  await timeToReady(page, READY["/"]);
  const r = await page.evaluate(() => new Promise((resolve) => {
    const deltas = []; let last = performance.now(); const end = last + 8000;
    let loaf = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) loaf += e.duration; }).observe({ type: "long-animation-frame", buffered: false }); } catch {}
    const tick = (t) => { deltas.push(t - last); last = t; if (t < end) requestAnimationFrame(tick); else resolve({ deltas, loaf }); };
    requestAnimationFrame(tick);
  }));
  await ctx.close();
  const jank = r.deltas.filter((d) => d > 1000 / 60 * 1.5).length;
  return { jankPct: (100 * jank) / r.deltas.length, longAnimFrameMs: r.loaf };
}

function lighthouse(path) {
  const chromePath = chromium.executablePath();
  const out = execSync(
    `npx -y lighthouse@12 "${BASE + path}" --quiet --only-categories=performance --output=json --form-factor=mobile --chrome-flags="--headless=new --no-sandbox"`,
    { env: { ...process.env, CHROME_PATH: chromePath }, maxBuffer: 64 * 1024 * 1024 }
  ).toString();
  const j = JSON.parse(out);
  const a = j.audits;
  return { score: j.categories.performance.score * 100, lcp: a["largest-contentful-paint"].numericValue, tbt: a["total-blocking-time"].numericValue, si: a["speed-index"].numericValue, cls: a["cumulative-layout-shift"].numericValue };
}

async function main() {
  let server;
  if (!BASE) {
    BASE = `http://localhost:${PORT}`;
    server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", detached: true });
    await waitForServer(BASE);
  }
  const browser = await chromium.launch({ headless: true });
  const raw = {};
  const push = (k, v) => (raw[k] ??= []).push(v);
  try {
    for (let i = 0; i < RUNS; i++) {
      for (const p of ["/", "/history", "/leaderboard"]) {
        const r = await coldLoad(browser, p);
        const k = p === "/" ? "status" : p.slice(1);
        push(`${k}_ready_ms`, r.readyMs); push(`${k}_fcp_ms`, r.fcp);
        if (p === "/") push("status_js_kb", r.jsKB);
      }
      const nav = await clientNav(browser);
      push("nav_history_ms", median(nav["/history"])); push("nav_leaderboard_ms", median(nav["/leaderboard"])); push("nav_status_ms", median(nav["/"]));
      const s = await smoothness(browser);
      push("status_jank_frame_pct", s.jankPct); push("status_long_anim_frame_ms", s.longAnimFrameMs);
      process.stderr.write(`run ${i + 1}/${RUNS} done\n`);
    }
    if (process.env.BENCH_LIGHTHOUSE !== "0") {
      for (let i = 0; i < Math.min(RUNS, 3); i++) {
        for (const p of ["/", "/history"]) {
          const k = p === "/" ? "status" : "history";
          const l = lighthouse(p);
          push(`lh_${k}_lcp_ms`, l.lcp); push(`lh_${k}_tbt_ms`, l.tbt); push(`lh_${k}_si_ms`, l.si); push(`lh_${k}_score`, l.score);
        }
      }
    }
  } finally {
    await browser.close();
    if (server) try { process.kill(-server.pid); } catch {}
  }
  const results = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.round(median(v) * 10) / 10]));
  console.log(JSON.stringify(results, null, 2));
  fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

  if (process.env.BENCH_BASELINE) {
    const base = JSON.parse(fs.readFileSync(process.env.BENCH_BASELINE, "utf8"));
    // Composite = geometric mean of (current / baseline) over the "lower is better" metrics below.
    // 1.0 = baseline; 0.5 = 2x faster on average. Lighthouse score (higher is better) and smoothness
    // metrics (often ~0 at baseline) are guardrails: printed, excluded from the composite, must not regress.
    const isGuardrail = (k) => k.endsWith("_score") || k.includes("jank") || k.includes("anim");
    for (const k of Object.keys(base).filter((k) => isGuardrail(k) && k in results)) console.log(`[guardrail] ${k.padEnd(28)} ${base[k]} -> ${results[k]}`);
    const keys = Object.keys(base).filter((k) => !isGuardrail(k) && k in results);
    const floor = (k) => (k.includes("tbt") ? 50 : 1);
    let logSum = 0;
    for (const k of keys) {
      const ratio = Math.max(results[k], floor(k)) / Math.max(base[k], floor(k));
      logSum += Math.log(ratio);
      console.log(`${k.padEnd(28)} ${String(base[k]).padStart(9)} -> ${String(results[k]).padStart(9)}  x${ratio.toFixed(2)}`);
    }
    console.log(`\nCOMPOSITE (lower is better, target <= 0.50): ${Math.exp(logSum / keys.length).toFixed(3)}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
