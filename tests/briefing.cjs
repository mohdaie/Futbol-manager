// Run with Playwright installed: node tests/navigation.cjs [existing server URL]
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  const fs = require('node:fs'), path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
  if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push(name); };
  const state = () => page.evaluate(() => ({ screen: UI.s, popup: UI.popup?.key || null, index: VIEW_HISTORY.index }));
  const act = (name, ds = {}) => page.evaluate(({ name, ds }) => viewAction(() => ACT[name](ds)), { name, ds });
  const back = async () => { await page.evaluate(() => history.back()); await page.waitForTimeout(100); };
  const appBack = async () => { await act('back'); await page.waitForTimeout(100); };
  let mode = 'ok', calls = [], release;
  await page.route('https://briefing.test/**', async route => {
    const body = route.request().postDataJSON(), jev = route.request().url().endsWith('/v1/systemone');
    calls.push({ jev, body });
    if (mode === 'slow' && jev) await new Promise(resolve => { release = resolve; });
    if (mode === 'fail') return route.fulfill({ status: 503, body: '{"error":"unavailable"}' });
    const data = jev
      ? { answers: { priority: { choice: mode === 'bad' ? 'academy' : 'medical', confidence: 0.9 } }, usage: { input_tokens: 100 } }
      : { choices: [{ message: { content: JSON.stringify({ text: mode === 'bad' ? 'A secret signing costs 987654321.' : 'Medical & fitness needs attention first. Finance also needs attention because the club is in debt; every staff department has someone in post.', evidence: ['medical', 'finance', 'staff'] }) } }], usage: { prompt_tokens: 100, completion_tokens: 40 } };
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  });
  const settled = () => page.waitForFunction(() => !BRIEF_PENDING);
  const report = async () => {
    await page.locator('.brief-counts').click();
    await page.locator('.brief-details').evaluate(e => { e.open = true; });
  };
  const ask = async () => { await page.locator('[data-a="askBriefing"]').click(); await settled(); };
  const close = async () => { await page.locator('.sh-x').click(); await page.waitForTimeout(100); };
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    check('Briefing stays at the top of Dashboard', await page.locator('.main section').first().getAttribute('id'), 'clubBriefing');
    check('Dashboard assistant has exactly three rows', await page.locator('#clubBriefing').evaluate(e => e.children.length), 3);
    check('Briefing fits a compact mobile space', await page.locator('#clubBriefing').evaluate(e => e.getBoundingClientRect().height <= 120), true);
    check('Full report is absent until opened', await page.locator('#briefingReport').count(), 0);
    await page.evaluate(() => {
      const sq = seniorSquad(G.club); sq.forEach(p => { p.inj = null; p.ban = 0; p.mor = 70; p.unset = null; p.treq = null; p.con = G.season + 4; p.cond = 100; });
      userClub().bal = -1000000; G.fin.wb = clubWageBill(userClub()) - 1000;
      sq[0].inj = { n: 'Ankle injury', w: 2 }; sq[1].mor = 20; sq[2].con = G.season + 1;
      const c = aiCfg();
      Object.assign(c.jev, { on: true, mode: 'proxy', proxy: 'https://briefing.test', feat: { briefing: true } });
      Object.assign(c.ds, { on: true, mode: 'proxy', proxy: 'https://briefing.test', feat: { briefing: true } });
      aiSave(); saveGame(); render(); render();
    });
    check('Enabled AI does not query on dashboard render', calls.length, 0);
    await page.evaluate(() => updateClubBriefing());
    check('Briefing function rejects calls without a manual request', calls.length, 0);
    await report();
    check('Full report retains all ten departments', await page.locator('.brief-department').count(), 10);
    check('Opening the full report does not query AI', calls.length, 0);
    await close(); await page.evaluate(() => SaveStorage.flush()); await page.reload();
    check('Reload does not query enabled AI', calls.length, 0);
    await ask();
    check('Ask button calls both existing AI clients', calls.map(c => c.jev), [true, false]);
    check('Jev chooses the priority', await page.evaluate(() => G.assistantBriefing.priority), 'medical');
    check('DeepSeek receives Jev priority', JSON.parse(calls[1].body.messages[1].content).priority, 'medical');
    check('Full briefing appears in a separate popup', (await state()).popup, 'clubBriefing');
    check('Summary uses the accepted AI text', await page.locator('.brief-summary').innerText(), 'Medical & fitness needs attention first. Finance also needs attention because the club is in debt; every staff department has someone in post.');
    check('AI sources and usage remain available', await page.evaluate(() => [G.assistantBriefing.sources.jev, G.assistantBriefing.sources.ds, aiUsage('jev').calls, aiUsage('ds').calls]), [true, true, 1, 1]);
    await page.locator('.brief-details').evaluate(e => { e.open = true; });
    await page.locator('.brief-department [data-a="player"]').first().click();
    check('Department player names still open profiles', (await state()).popup.startsWith('player:'), true);
    await close(); await report();
    await page.locator('.brief-details [data-a="news"]').first().click();
    check('Recent events still open news', (await state()).popup.startsWith('news:'), true);
    await close(); await report();
    await page.locator('.brief-priority').click();
    check('Priority still links to its department', (await state()).screen, 'medical');
    await act('go', { s: 'home' });
    await report(); await page.locator('#briefingReport [data-id="scouting"]').click();
    check('Scouting retains its direct tab link', await page.evaluate(() => [UI.s, UI.tab.tr]), ['transfers', 'scout']);
    await act('go', { s: 'home' });
    check('Navigation does not trigger more AI requests', calls.length, 2);
    await ask(); check('Asking on unchanged facts reuses the saved answer', calls.length, 2); await close();
    await page.reload();
    check('Reload of a completed briefing makes no requests', calls.length, 2);
    check('Saved summary remains one line', await page.locator('.brief-preview').evaluate(e => e.scrollWidth > e.clientWidth && e.getBoundingClientRect().height <= 21), true);
    check('Completed briefing stays within three compact rows', await page.locator('#clubBriefing').evaluate(e => [e.children.length, e.getBoundingClientRect().height <= 120]), [3, true]);
    await page.screenshot({ path: '/tmp/futbol-assistant-compact.png' });
    mode = 'bad'; await page.evaluate(() => { G.day++; render(); });
    check('Changed club facts do not automatically query AI', calls.length, 2);
    await ask();
    check('Invalid priorities and invented text remain rejected', await page.evaluate(() => [G.assistantBriefing.priority, G.assistantBriefing.text]), [null, null]); await close();
    mode = 'fail'; await page.evaluate(() => { G.day++; render(); }); await ask();
    check('Server failure keeps a factual report', await page.evaluate(() => [G.assistantBriefing.text, !!document.querySelector('.brief-priority')]), [null, true]); await close();
    const n = calls.length; await page.evaluate(() => { render(); render(); });
    check('Failures do not retry automatically', calls.length, n);
    mode = 'ok'; await page.evaluate(() => { G.day++; render(); }); await ask(); await close();
    const n0 = calls.length;
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => { userClub().bal -= 1000000; render(); });
      await ask(); await close();
    }
    check('Manual queries retain the daily service caps', calls.length - n0, 2);
    mode = 'slow'; await page.evaluate(() => { G.day++; render(); });
    await page.locator('[data-a="askBriefing"]').click();
    while (!release) await page.waitForTimeout(20);
    const pending = calls.length;
    await page.evaluate(() => { ACT.askBriefing(); ACT.askBriefing(); });
    check('Repeated taps while waiting cannot duplicate requests', calls.length, pending);
    await page.evaluate(() => { aiCfg().jev.on = aiCfg().ds.on = false; newGame(G.club, 'Another career', 1); go('home'); });
    release(); await page.waitForTimeout(100);
    check('Old responses cannot affect another career', await page.evaluate(() => [G.manager, G.assistantBriefing.text, G.assistantBriefing.priority]), ['Another career', null, null]);
    check('No mobile horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (release) release(); await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
