#!/usr/bin/env node
// npm run build && npm run smooth; SMOOTH_URL targets an existing server.
// SMOOTH_RUNS=5 SMOOTH_OUT=results.json SMOOTH_BASELINE=before.json npm run smooth
// SMOOTH_SCENARIOS=leaderboard_load runs only the cold leaderboard scenario.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";

const runs = Number(process.env.SMOOTH_RUNS ?? 5);
const out = process.env.SMOOTH_OUT ?? "smooth-results.json";
let base = process.env.SMOOTH_URL;
const scenarioNames = ["load_transition", "bubble_idle", "history_scroll", "nav_history", "nav_leaderboard", "nav_status", "leaderboard_load"];
const selected = new Set((process.env.SMOOTH_SCENARIOS ?? scenarioNames.join(",")).split(","));
const ready = {
  "/": () => [...document.querySelectorAll("h1")].some(h => /^(YES|NO|MAYBE|UNKNOWN)\.?$/.test(h.textContent.trim()) && h.getBoundingClientRect().height > 0),
  "/history": () => (document.querySelector("main")?.innerText ?? "").includes("earthquakes in the Bay Area over the last 30 days"),
  "/leaderboard": () => (document.querySelector("main")?.innerText ?? "").includes("Total Earthquakes"),
};
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function newPage(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Performance.enable");
  await page.addInitScript(() => {
    const data = window.__smooth = { frames: [], loaf: [], shifts: [], observers: [] };
    for (const [type, key] of [["long-animation-frame", "loaf"], ["layout-shift", "shifts"]]) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) throw new Error(`Unsupported performance entry: ${type}`);
      const observer = new PerformanceObserver(list => data[key].push(...list.getEntries()));
      observer.observe({ type, buffered: true });
      data.observers.push({ observer, key });
    }
    let last;
    const tick = t => {
      if (last !== undefined) data.frames.push({ start: last, end: t, delta: t - last });
      last = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return { context, page, cdp };
}

async function waitReady(page, path) {
  await page.waitForFunction(`location.pathname === ${JSON.stringify(path)} && (${ready[path].toString()})()`);
  return page.evaluate(() => performance.now());
}

async function sample(page, start) {
  return page.evaluate(start => {
    const end = performance.now();
    const data = window.__smooth;
    for (const { observer, key } of data.observers) data[key].push(...observer.takeRecords());
    const deltas = data.frames.filter(f => f.start >= start && f.end <= end).map(f => f.delta).sort((a, b) => a - b);
    if (!deltas.length) throw new Error("No rAF frames captured");
    const dropped = deltas.filter(d => d > 1.5 * 16.7).length;
    const loaf = data.loaf.filter(e => e.startTime >= start && e.startTime < end);
    return {
      duration_ms: end - start,
      frame_count: deltas.length,
      dropped_count: dropped,
      dropped_pct: 100 * dropped / deltas.length,
      p95_frame_ms: deltas[Math.ceil(deltas.length * 0.95) - 1],
      max_frame_ms: deltas.at(-1),
      loaf_ms: loaf.reduce((sum, e) => sum + e.duration, 0),
      loaf_blocking_ms: loaf.reduce((sum, e) => sum + e.blockingDuration, 0),
      cls: data.shifts.filter(e => !e.hadRecentInput && e.startTime >= start && e.startTime < end).reduce((sum, e) => sum + e.value, 0),
    };
  }, start);
}

async function taskDuration(cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics");
  return metrics.find(m => m.name === "TaskDuration").value * 1000;
}

async function statusScenarios(browser) {
  const { context, page, cdp } = await newPage(browser);
  try {
    await page.goto(base + "/", { waitUntil: "commit" });
    const commit = await page.evaluate(() => performance.getEntriesByType("navigation")[0].responseStart);
    await waitReady(page, "/");
    await page.waitForTimeout(1500);
    const load = await sample(page, commit);
    const taskStart = await taskDuration(cdp);
    const start = await page.evaluate(() => performance.now());
    await page.waitForTimeout(11000);
    const idle = await sample(page, start);
    idle.task_ms = await taskDuration(cdp) - taskStart;
    const results = { load_transition: load, bubble_idle: idle };
    for (const [label, path] of [["History", "/history"], ["Leaderboard", "/leaderboard"], ["Status", "/"]]) {
      const start = await page.evaluate(() => performance.now());
      await page.locator("nav:visible a", { hasText: label }).first().click({ noWaitAfter: true });
      const visible = await waitReady(page, path);
      await page.waitForTimeout(500);
      results[`nav_${label.toLowerCase()}`] = { ...await sample(page, start), ready_ms: visible - start };
    }
    return results;
  } finally { await context.close(); }
}

async function historyScenario(browser) {
  const { context, page } = await newPage(browser);
  try {
    await page.goto(base + "/history", { waitUntil: "commit" });
    const readyMs = await waitReady(page, "/history");
    const nodes = await page.evaluate(() => document.getElementsByTagName("*").length);
    const start = await page.evaluate(() => performance.now());
    let bottom = false;
    for (let step = 0; step < 1000; step++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(50);
      bottom = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
      if (bottom) break;
    }
    if (!bottom) throw new Error("History scroll did not reach bottom after 1000 steps");
    await page.waitForTimeout(500);
    return { ...await sample(page, start), dom_nodes: nodes, ready_ms: readyMs };
  } finally { await context.close(); }
}

async function leaderboardScenario(browser) {
  const { context, page } = await newPage(browser);
  try {
    await page.goto(base + "/leaderboard", { waitUntil: "commit" });
    const commit = await page.evaluate(() => performance.getEntriesByType("navigation")[0].responseStart);
    const readyMs = await waitReady(page, "/leaderboard");
    await page.waitForTimeout(1500);
    return {
      ...await sample(page, commit),
      ready_ms: readyMs,
      dom_nodes: await page.evaluate(() => document.getElementsByTagName("*").length),
    };
  } finally { await context.close(); }
}

async function main() {
  if (!Number.isInteger(runs) || runs < 1) throw new Error("SMOOTH_RUNS must be a positive integer");
  if ([...selected].some(name => !scenarioNames.includes(name))) throw new Error("Unknown SMOOTH_SCENARIOS selection");
  let server, browser;
  const raw = {};
  try {
    if (!base) {
      base = "http://localhost:3124";
      server = spawn("npx", ["next", "start", "-p", "3124"], { stdio: "ignore", detached: true });
      let available = false;
      for (let i = 0; i < 200; i++) {
        try { if ((await fetch(base)).ok) { available = true; break; } } catch {}
        await pause(300);
      }
      if (!available) throw new Error("Server did not start on :3124");
    }
    browser = await chromium.launch({ headless: true });
    for (let i = 0; i < runs; i++) {
      const scenarios = {};
      if (["load_transition", "bubble_idle", "nav_history", "nav_leaderboard", "nav_status"].some(name => selected.has(name))) Object.assign(scenarios, await statusScenarios(browser));
      if (selected.has("history_scroll")) scenarios.history_scroll = await historyScenario(browser);
      if (selected.has("leaderboard_load")) scenarios.leaderboard_load = await leaderboardScenario(browser);
      for (const [scenario, metrics] of Object.entries(scenarios)) {
        if (!selected.has(scenario)) continue;
        for (const [metric, value] of Object.entries(metrics)) (raw[`${scenario}_${metric}`] ??= []).push(value);
      }
      process.stderr.write(`smooth run ${i + 1}/${runs} done\n`);
    }
  } finally {
    if (browser) await browser.close();
    if (server) try { process.kill(-server.pid); } catch {}
  }
  const results = Object.fromEntries(Object.entries(raw).map(([key, values]) => [key, Number(median(values).toFixed(4))]));
  fs.writeFileSync(out, JSON.stringify(results, null, 2) + "\n");
  console.table(Object.fromEntries(scenarioNames.filter(s => selected.has(s)).map(s => [s, Object.fromEntries(["dropped_pct", "dropped_count", "p95_frame_ms", "max_frame_ms", "loaf_ms", "loaf_blocking_ms", "cls"].map(k => [k, results[`${s}_${k}`]]))])));
  console.log(JSON.stringify(results, null, 2));
  if (process.env.SMOOTH_BASELINE) {
    const before = JSON.parse(fs.readFileSync(process.env.SMOOTH_BASELINE, "utf8"));
    for (const [key, value] of Object.entries(results)) if (key in before) console.log(`${key}: ${before[key]} → ${value}`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
