// Repeatable in-browser measurement lab: payload and runtime cost of every catalog entry, per
// motion-quality mode. Requires the dev dependency `playwright` (Chromium).
//
//   npm run measure                       # table on stdout
//   npm run measure -- --json out.json    # also write raw numbers
//   npm run measure -- --mp4 film.mp4     # compare entry 002's payload with a rendered video
//   npm run measure -- --seconds 6        # sampling window per run (default 4)
//
// Headless Chromium paints in software, so frame rates are only comparable between runs of this
// same lab on the same machine. They are not a measure of real devices (see the footer it prints).
import {readFile, writeFile, stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';
import {gzipSync, brotliCompressSync} from 'node:zlib';
import {chromium} from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const seconds = Number(option('--seconds') || 4);
const jsonPath = option('--json');
const mp4Path = option('--mp4');
// A free port, never a fixed one: a stale server on a fixed port would be measured instead of this checkout.
const port = process.env.PORT ? Number(process.env.PORT) : await new Promise(resolve => {
  const probe = createServer().listen(0, '127.0.0.1', () => { const {port} = probe.address(); probe.close(() => resolve(port)); });
});
const base = `http://127.0.0.1:${port}/`;
const modes = ['full', 'economy'];
const only = option('--only');
const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8')).filter(entry => !only || entry.id.startsWith(only));
const kb = bytes => (bytes / 1024).toFixed(1);

const server = spawn(process.execPath, ['scripts/serve.mjs'], {cwd: root, env: {...process.env, PORT: String(port)}, stdio: 'ignore'});
const browser = await chromium.launch();
const rows = [];
try {
  for (let attempt = 0; ; attempt++) {
    if (server.exitCode !== null) throw new Error(`scripts/serve.mjs exited (port ${port} busy?)`);
    try { if ((await fetch(base)).ok) break; } catch {}
    if (attempt > 50) throw new Error('Server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  for (const entry of catalog) {
    for (const mode of modes) {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      const files = [];
      page.on('response', async response => {
        if (!response.url().startsWith(base)) return;
        try { files.push(await response.body()); } catch {}
      });
      await page.goto(`${base}examples/${entry.id}/`);
      await page.waitForTimeout(400);
      const hasPlayer = await page.evaluate(() => Boolean(document.querySelector('[data-motion-player]')?.motionPlayer));
      if (hasPlayer) await page.evaluate(quality => { const p = document.querySelector('[data-motion-player]').motionPlayer; p.quality = quality; p.restart(); }, mode);
      // In-page sampler: repaint writes to the time label, animation frame gaps and long tasks.
      const runtime = await page.evaluate(async ms => {
        const label = document.querySelector('[data-motion-time]');
        let writes = 0;
        let barWrites = 0;
        const bar = document.querySelector('[data-motion-seek]');
        const barObserver = bar ? new MutationObserver(list => { barWrites += list.length; }) : null;
        barObserver?.observe(bar, {attributes: true, attributeFilter: ['style']});
        const observer = label ? new MutationObserver(list => { writes += list.length; }) : null;
        observer?.observe(label, {childList: true, characterData: true, subtree: true});
        let longTasks = 0;
        try { new PerformanceObserver(list => { longTasks += list.getEntries().length; }).observe({type: 'longtask'}); } catch {}
        const gaps = [];
        let last = performance.now();
        const end = last + ms;
        await new Promise(resolve => {
          const step = now => { gaps.push(now - last); last = now; now < end ? requestAnimationFrame(step) : resolve(); };
          requestAnimationFrame(step);
        });
        observer?.disconnect();
        barObserver?.disconnect();
        gaps.shift();
        gaps.sort((a, b) => a - b);
        const avg = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
        return {
          uiWritesPerSecond: Math.round(writes / (ms / 1000) * 10) / 10,
          barWritesPerSecond: Math.round(barWrites / (ms / 1000) * 10) / 10,
          avgFrameMs: Math.round(avg * 10) / 10,
          p95FrameMs: Math.round(gaps[Math.floor(gaps.length * .95)] * 10) / 10,
          longTasks,
          animations: document.getAnimations().length,
          domNodes: document.getElementsByTagName('*').length
        };
      }, seconds * 1000);
      const raw = files.reduce((sum, body) => sum + body.length, 0);
      const gzip = files.reduce((sum, body) => sum + gzipSync(body).length, 0);
      const brotli = files.reduce((sum, body) => sum + brotliCompressSync(body).length, 0);
      rows.push({id: entry.id, mode, files: files.length, raw, gzip, brotli, ...runtime});
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

console.log(`\nMeasured ${new Date().toISOString().slice(0, 10)} · Chromium headless, 1440×900, ${seconds}s per run\n`);
console.log('| Entry | Mode | Files | Raw KB | gzip KB | brotli KB | Label writes/s | Seek-bar writes/s | Avg frame ms | p95 frame ms | Long tasks | Animations | DOM nodes |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.id} | ${r.mode} | ${r.files} | ${kb(r.raw)} | ${kb(r.gzip)} | ${kb(r.brotli)} | ${r.uiWritesPerSecond} | ${r.barWritesPerSecond} | ${r.avgFrameMs} | ${r.p95FrameMs} | ${r.longTasks} | ${r.animations} | ${r.domNodes} |`);
}

const film = rows.find(r => r.id === '002-commerce-film' && r.mode === 'full');
if (mp4Path && film) {
  const mp4 = (await stat(mp4Path)).size;
  console.log(`\nEntry 002 vs ${mp4Path}: ${kb(film.brotli)} KB brotli / ${kb(film.gzip)} KB gzip / ${kb(film.raw)} KB raw against ${kb(mp4)} KB MP4`
    + ` (${(film.gzip / mp4 * 100).toFixed(1)}% of the MP4 at gzip). Payload only: it says nothing about visual equivalence.`);
} else {
  console.log('\nMP4 payload comparison: not run. Pass --mp4 <file> with the video you want to compare against; this repo contains no rendered video.');
}
console.log('\nNot measured here: GPU/compositor cost and real paint timing, battery or power draw, Safari/WebKit and Firefox,'
  + ' low-end phones, throttled CPU/network. Headless frame rates are relative, same-machine numbers only.');

if (jsonPath) await writeFile(jsonPath, JSON.stringify(rows, null, 2) + '\n');
