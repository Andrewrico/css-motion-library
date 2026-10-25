// Real-browser release check: every catalog entry at desktop and mobile widths,
// seeking, reduced motion and no-JS. Requires the dev dependency `playwright`.
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 8099);
const base = `http://127.0.0.1:${port}/`;
const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
const viewports = {desktop: {width: 1440, height: 900}, mobile: {width: 390, height: 844}};
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const server = spawn(process.execPath, ['scripts/serve.mjs'], {cwd: root, env: {...process.env, PORT: String(port)}, stdio: 'ignore'});
const browser = await chromium.launch();
try {
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (attempt > 50) throw new Error('Server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async function open(context, path, where) {
    const page = await context.newPage();
    page.on('pageerror', error => fail(where, error.message));
    page.on('console', message => { if (message.type() === 'error') fail(where, message.text()); });
    await page.goto(base + path);
    await page.waitForTimeout(400);
    return page;
  }

  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({viewport});
    const gallery = await open(context, '', `gallery/${name}`);
    if (await gallery.evaluate(() => document.documentElement.scrollWidth > innerWidth)) fail(`gallery/${name}`, 'horizontal scroll');
    for (const entry of catalog) {
      const where = `${entry.id}/${name}`;
      const page = await open(context, `examples/${entry.id}/`, where);
      const state = await page.evaluate(() => {
        const player = document.querySelector('[data-motion-player]');
        const controls = player?.querySelector('[data-motion-controls]');
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          player: Boolean(player),
          ready: player?.classList.contains('is-ready'),
          controlsBottom: controls && !controls.hidden ? controls.getBoundingClientRect().bottom : null
        };
      });
      if (state.overflow) fail(where, 'horizontal scroll');
      if (!state.player) continue;
      if (!state.ready) fail(where, 'player did not start');
      if (name === 'desktop' && state.controlsBottom > viewport.height) fail(where, `controls below the fold (${Math.round(state.controlsBottom)}px)`);
      const seek = await page.evaluate(() => {
        const player = document.querySelector('[data-motion-player]').motionPlayer;
        const target = Number(document.querySelector('[data-motion-player]').dataset.duration) / 2;
        player.pause();
        player.seek(target);
        return {target, now: player.currentTime};
      });
      if (Math.abs(seek.now - seek.target) > .05) fail(where, `seek to ${seek.target}s landed at ${seek.now}s`);
      await page.close();
    }
    await context.close();
  }

  for (const [name, options] of [['reduced-motion', {reducedMotion: 'reduce'}], ['no-js', {javaScriptEnabled: false}]]) {
    const context = await browser.newContext(options);
    for (const entry of catalog) {
      const where = `${entry.id}/${name}`;
      const page = await open(context, `examples/${entry.id}/`, where);
      const controlsVisible = await page.evaluate(() => {
        const controls = document.querySelector('[data-motion-controls]');
        return Boolean(controls && !controls.hidden && controls.getClientRects().length);
      });
      if (controlsVisible) fail(where, 'playback controls visible in a static mode');
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}

if (errors.length) { errors.forEach(error => console.error('FAIL:', error)); process.exitCode = 1; }
else console.log(`PASS: gallery + ${catalog.length} entries at ${Object.keys(viewports).join('/')} widths, seeking, reduced motion and no-JS.`);
