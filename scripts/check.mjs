import {readFile,readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const errors = [];
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    if (item.name.startsWith('.') || ['node_modules','dist','_site','coverage','test-results'].includes(item.name)) continue;
    const file = path.join(dir,item.name);
    if (item.isDirectory()) await walk(file); else files.push(file);
  }
}
await walk(root);
const catalog = JSON.parse(await readFile(path.join(root,'catalog.json'),'utf8'));
const ids = new Set();
for (const entry of catalog) {
  if (!/^\d{3}-[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id)) errors.push(`Invalid or duplicate entry: ${entry.id}`);
  ids.add(entry.id);
  if (!Number.isFinite(entry.duration) || entry.duration <= 0) errors.push(`${entry.id}: invalid duration`);
  for (const key of ['entry','styles']) {
    if (typeof entry[key] !== 'string' || !entry[key].startsWith(`examples/${entry.id}/`)) errors.push(`${entry.id}: invalid ${key}`);
    else try { await stat(path.join(root,entry[key])); } catch { errors.push(`${entry.id}: missing ${entry[key]}`); }
  }
  try { await stat(path.join(root,'examples',entry.id,'README.md')); } catch { errors.push(`${entry.id}: missing README`); }
  const gallery = await readFile(path.join(root,'index.html'),'utf8');
  if (!gallery.includes(`examples/${entry.id}/`)) errors.push(`${entry.id}: missing gallery link`);
}
for (const file of files) {
  if (/\.(m?js)$/.test(file)) {
    const result = spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if (result.status !== 0) errors.push(`${path.relative(root,file)}: ${result.stderr.trim()}`);
  }
  if (!file.endsWith('.html')) continue;
  const html = await readFile(file,'utf8');
  if (!/<html\b[^>]*lang=/.test(html) || !/name="viewport"/.test(html)) errors.push(`${file}: missing language or viewport`);
  if (/<(?:video|audio)\b/i.test(html)) errors.push(`${file}: contains media element`);
  for (const [,attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(#|https?:|mailto:|data:|javascript:)/.test(attribute)) continue;
    const location = path.resolve(path.dirname(file),decodeURIComponent(attribute.split(/[?#]/)[0] || '.'));
    if (location !== root && !location.startsWith(root + path.sep)) { errors.push(`${file}: asset outside repository`); continue; }
    try {
      const info = await stat(location);
      if (info.isDirectory()) await stat(path.join(location,'index.html'));
    } catch { errors.push(`${path.relative(root,file)}: missing ${attribute}`); }
  }
}
const packageInfo = JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
if (Object.keys(packageInfo.dependencies || {}).length) errors.push('Core snapshot must stay free of runtime package dependencies.');
if (errors.length) { errors.forEach(error => console.error('FAIL:',error)); process.exitCode=1; }
else console.log(`PASS: ${catalog.length} catalog entries, ${files.filter(file=>file.endsWith('.html')).length} HTML pages, local assets and JavaScript syntax.`);
