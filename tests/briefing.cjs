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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    check('Briefing is the first dashboard card', await page.locator('.main section').first().getAttribute('id'), 'clubBriefing');
    check('Offline report covers every department', await page.locator('.brief-department').count(), 10);
    check('No AI calls when services are off', calls.length, 0);
    check('No matches means monitor rather than healthy results', await page.evaluate(() => clubBriefingFacts().departments.find(d => d.id === 'board').status), 'monitor');
    const flags = await page.evaluate(() => {
      const sq = seniorSquad(G.club); sq.forEach(p => { p.inj = null; p.ban = 0; p.mor = 70; p.unset = null; p.treq = null; p.con = G.season + 4; p.cond = 100; });
      userClub().bal = -1000000; G.fin.wb = clubWageBill(userClub()) - 1000;
      sq[0].inj = { n: 'Ankle injury', w: 2 }; sq[1].mor = 20; sq[2].con = G.season + 1;
      const before = JSON.stringify([G.tactics, G.training, G.fin, G.staff]);
      const f = clubBriefingFacts(); render();
      return { stable: JSON.stringify(f) === JSON.stringify(clubBriefingFacts()), unchanged: before === JSON.stringify([G.tactics, G.training, G.fin, G.staff]), statuses: Object.fromEntries(f.departments.map(d => [d.id, d.status])) };
    });
    check('Reports are deterministic and do not change the club', [flags.stable, flags.unchanged], [true, true]);
    check('Debt, injury, morale and expiring contracts flag attention', ['finance', 'medical', 'morale', 'transfers'].map(id => flags.statuses[id]), ['attention', 'attention', 'attention', 'attention']);
    check('Staff coverage is healthy', flags.statuses.staff, 'healthy');
    await page.locator('.brief-details summary').click();
    await page.evaluate(() => {
      const c = aiCfg();
      Object.assign(c.jev, { on: true, mode: 'proxy', proxy: 'https://briefing.test', feat: { briefing: true } });
      Object.assign(c.ds, { on: true, mode: 'proxy', proxy: 'https://briefing.test', feat: { briefing: true } });
      render();
      document.querySelector('.brief-details').open = true;
    });
    await settled();
    check('Both existing AI clients are used once', calls.map(c => c.jev), [true, false]);
    check('Jev chooses an existing attention department', await page.evaluate(() => G.assistantBriefing.priority), 'medical');
    check('Jev cannot choose a healthy department', Object.keys(calls[0].body.questions.priority.criteria).includes('staff'), false);
    check('DeepSeek receives Jev priority and department evidence', JSON.parse(calls[1].body.messages[1].content).priority, 'medical');
    check('Accepted AI sources are displayed', await page.locator('.brief-footer').innerText().then(s => /Jev priorities.*DeepSeek summary/.test(s)), true);
    check('Opening the detailed report survives AI completion', await page.locator('.brief-details').evaluate(e => e.open), true);
    check('Summary is written by DeepSeek', await page.locator('.brief-summary').innerText(), 'Medical & fitness needs attention first. Finance also needs attention because the club is in debt; every staff department has someone in post.');
    check('AI calls appear in usage accounting', await page.evaluate(() => [aiUsage('jev').calls, aiUsage('ds').calls]), [1, 1]);
    await page.locator('.brief-department [data-a="player"]').first().click();
    check('Named players in department evidence open profiles', (await state()).popup.startsWith('player:'), true);
    await page.locator('.sh-x').click(); await page.waitForTimeout(100);
    await page.locator('.brief-details summary').click();
    await page.locator('.brief-details [data-a="news"]').first().click();
    check('Recent events open their news story', (await state()).popup.startsWith('news:'), true);
    await page.locator('.sh-x').click(); await page.waitForTimeout(100);
    await page.locator('.brief-details').evaluate(e => { e.open = true; });
    await page.screenshot({ path: '/tmp/futbol-dashboard-briefing-expanded.png' });
    await page.locator('.brief-details summary').click();
    await page.locator('.main').evaluate(e => { e.scrollTop = 0; });
    await page.screenshot({ path: '/tmp/futbol-dashboard-briefing.png' });
    await page.locator('.brief-priority').click();
    check('Priority links to its department', (await state()).screen, 'medical');
    await act('go', { s: 'home' }); await settled();
    check('Reopening dashboard reuses the briefing', calls.length, 2);
    await page.evaluate(() => { aiSave(); saveGame(); }); await page.reload(); await settled();
    check('Refresh reuses the persisted briefing', calls.length, 2);
    await page.locator('.brief-healthy [data-id="staff"]').click();
    check('Healthy departments are linked too', (await state()).screen, 'staff');
    await act('go', { s: 'home' });
    await page.locator('.brief-details summary').click();
    await page.locator('#clubBriefing [data-id="scouting"]').first().click();
    check('Scouting opens the correct transfer tab', await page.evaluate(() => [UI.s, UI.tab.tr]), ['transfers', 'scout']);
    await act('go', { s: 'home' }); await page.locator('[data-a="briefAI"]').click();
    check('AI settings opens the relevant existing controls', await page.evaluate(() => [UI.s, UI.tab.adm]), ['admin', 'ds']);
    // A changed snapshot regenerates the report. Hallucinated text and invalid priorities must be ignored.
    mode = 'bad'; await page.evaluate(() => { G.day++; go('home'); }); await settled();
    check('Invalid priority and invented facts are rejected', await page.evaluate(() => [G.assistantBriefing.priority, G.assistantBriefing.text]), [null, null]);
    check('Factual health remains available after bad AI answers', await page.locator('.brief-attention [data-id="finance"]').count(), 1);
    mode = 'fail'; await page.evaluate(() => { G.day++; render(); }); await settled();
    check('Server failures retain the factual briefing', await page.evaluate(() => [G.assistantBriefing.text, !!document.querySelector('.brief-priority')]), [null, true]);
    const n = calls.length; await page.evaluate(() => { render(); render(); }); await settled();
    check('Failures are not retried on every render', calls.length, n);
    mode = 'ok'; await page.evaluate(() => { G.day++; render(); }); await settled();
    const n0 = calls.length;
    for (let i = 0; i < 4; i++) { await page.evaluate(() => { userClub().bal -= 1000000; render(); }); await settled(); }
    check('Changing club facts is capped at two calls per service per game day', calls.length - n0, 2);
    mode = 'slow'; await page.evaluate(() => { G.day++; render(); });
    await page.waitForFunction(() => !!BRIEF_PENDING);
    while (!release) await page.waitForTimeout(20);
    await page.evaluate(() => { aiCfg().jev.on = aiCfg().ds.on = false; newGame(G.club, 'Another career', 1); go('home'); });
    release(); await page.waitForTimeout(100);
    check('An old career response cannot alter the new career', await page.evaluate(() => [G.manager, G.assistantBriefing.text, G.assistantBriefing.priority]), ['Another career', null, null]);
    check('No horizontal overflow on mobile', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (release) release(); await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
