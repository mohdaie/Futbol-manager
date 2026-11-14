// Renders a short video of the 3D match viewer (match3d/) with headless Chromium and ffmpeg.
//   node scripts/match3d-video.cjs out.mp4 '<segments JSON>' [fps] [width] [height]
// A segment is { t: start second, d: seconds, cam: 0-3 | follow: [side, slot] | goal: [side, slot],
// speed: 1, text: 'caption' }. In the cloud container: CHROMIUM_PATH=/opt/pw-browsers/chromium
// NODE_PATH=/opt/node-tools/node_modules.
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path'), { spawn } = require('node:child_process');
(async () => {
  const [out, json, fps = 25, W = 1280, H = 720] = process.argv.slice(2);
  const segs = JSON.parse(json.startsWith('@') ? fs.readFileSync(json.slice(1), 'utf8') : json), root = path.resolve(__dirname, '..');
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try { res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +W, height: +H } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/match3d/?manual=1`);
  await page.waitForFunction(() => window.match3d, null, { timeout: 120000 });
  await page.addStyleTag({ content: '#bar{display:none!important}#note{font-size:22px!important}' });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  let n = 0;
  for (const g of segs) {
    await page.evaluate(g => {
      const m = window.match3d;
      if (g.goal) m.follow(g.goal[0], g.goal[1], true); else if (g.follow) m.follow(g.follow[0], g.follow[1]); else m.setCam(g.cam ?? 1);
      m.seek(g.t - 1); for (let k = 0; k < 30; k++) m.step(1 / 30); // run in, so clips and the camera have settled
      m.caption(g.text);
    }, g);
    const frames = Math.round(g.d * fps), dt = (g.speed || 1) / fps;
    for (let k = 0; k < frames; k++) {
      await page.evaluate(([dt, text]) => { window.match3d.step(dt); window.match3d.caption(text); }, [dt, g.text]);
      ff.stdin.write(await page.screenshot({ type: 'jpeg', quality: 90 })); n++;
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close(); server.close();
  console.log(`${out}: ${n} frames, ${(n / fps).toFixed(1)} s`);
})().catch(e => { console.error(e); process.exit(1); });
