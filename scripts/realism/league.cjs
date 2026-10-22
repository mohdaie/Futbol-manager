// node scripts/realism/league.cjs "<JS run in the game page>"  (env: SEED=n fixes the world, ROOT=<copy of the repo> to compare engines)
// Starts the real game in a headless browser (new game, default club), runs the given script in the page and prints its result.
const { chromium } = require('playwright');
const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const fs = require('fs'), path = require('path'), root = process.env.ROOT || require('path').resolve(__dirname, '../..');
(async () => {
  const server = require('http').createServer((req, res) => { const f = path.join(root, new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html')); try { res.setHeader('Content-Type', f.endsWith('.js') ? 'application/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'image/webp'); res.end(fs.readFileSync(f)); } catch { res.writeHead(404).end(); } });
  await new Promise(r => server.listen(0, r));
  const b = await chromium.launch({ ...(CHROMIUM ? { executablePath: CHROMIUM } : {}), args: ['--no-sandbox'] });
  const p = await b.newPage();
  if (process.env.SEED) await p.addInitScript(sd => { let a = sd >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, Number(process.env.SEED)); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('https://fonts.googleapis.com/**', r => r.abort());
  await p.goto('http://127.0.0.1:' + server.address().port + '/');
  await p.click('[data-a="titleNew"]'); await p.click('[data-a="startGame"]');
  const code = process.argv[2] || '';
  const r = await p.evaluate(code);
  console.log(JSON.stringify(r)); if (errs.length) console.log('ERR', errs);
  await b.close(); server.close();
})();
