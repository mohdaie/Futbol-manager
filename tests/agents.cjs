// Run with Playwright installed: node tests/agents.cjs [existing server URL]
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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    const r = await page.evaluate(() => {
      const ps = Object.values(G.players), adults = ps.filter(p => p.age >= 17);
      const by = {}; adults.forEach(p => { (by[p.ag] = by[p.ag] || []).push(p); });
      const avgCa = id => (by[id] || []).reduce((t, p) => t + p.ca, 0) / Math.max(1, (by[id] || []).length);
      const known = ps.filter(p => p.insp && AGENT_CLIENTS.pimentel.includes(p.insp)).map(p => p.ag);
      const mk = adults.filter(p => p.nat === 'POR' && p.ca >= 80).map(p => ['POR', 'Europe', '*'].some(m => G.agents[p.ag].markets.includes(m)) || (p.insp && Object.values(AGENT_CLIENTS).some(l => l.includes(p.insp))));
      return { n: Object.keys(G.agents).length, all: adults.every(p => p.ag && G.agents[p.ag]), used: Object.keys(by).length, max: Math.max(...Object.values(by).map(x => x.length)),
        big: avgCa('mandes'), small: avgCa('holt'), known, mk, youth: ps.filter(p => p.age < 17 && p.ag).length };
    });
    console.log('agents', JSON.stringify({ ...r, known: r.known.length, mk: r.mk.length }));
    check('Forty agents, every adult player represented', [r.n, r.all], [40, true]);
    check('Agents have many clients each', r.used >= 30 && r.max >= 20, true);
    check('Big agents represent the best players', r.big > r.small + 8, true);
    check('Known pairings follow the inspirational figure', r.known.every(a => a === 'pimentel'), true);
    check('Agents work their markets', r.mk.every(Boolean), true);
    check('Under-17s have no agent', r.youth, 0);

    const d = await page.evaluate(() => {
      G.fin.tb = 300e6; G.fin.wb += 600000;
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && lvlOf(x) === 'A' && !isKeyPlayer(x) && x.ca < userClub().rep);
      const a = agentOf(p), rel0 = agentRel(a);
      const d = startDeal(p, 'agent', { lim: { fee: 1e9, wage: 1e6 }, fee: 10e6, opened: true, next: dayAbs() });
      DEAL_STEP.in.agent(d, p);
      const pct = Math.round(d.agentFee / d.fee * 100), feeNeed = d.need && d.need.k;
      if (d.need) dealRaise(d, d.agentFee);
      d.stage = 'final'; d.wage = 1000; d.years = 3; d.status = 'Rotation'; d.need = { k: 'final' };
      completeIn(d);
      const rel1 = agentRel(a);
      const q = Object.values(G.players).find(x => x.ag === a.id && x.club !== G.club && G.clubs[x.club].pl && !activeDeal(x.id));
      const d2 = startDeal(q, 'final', { lim: { fee: 1e9, wage: 1e6 } }); d2.need = { k: 'final' };
      dealWalk(d2);
      return { pct, exp: agentFeePct(a), feeNeed, rel0, rel1, rel2: agentRel(a), id: a.id, signed: p.club === G.club };
    });
    console.log('deal', JSON.stringify(d));
    check("Agent's fee follows his greed", d.pct, d.exp);
    check('High fees need your approval', d.exp > 8 ? d.feeNeed === 'agentfee' : d.feeNeed == null, true);
    check('A completed deal improves the relationship', d.rel1, Math.min(50, d.rel0 + (d.feeNeed ? 3 : 0) + 8));
    check('Pulling out at the end hurts it', d.rel2, d.rel1 - 10);

    await page.evaluate(id => agentSheet(id), d.id);
    check('Agent page shows clients and relationship', await page.evaluate(() => [!!document.querySelector('#layer .sh-t'), document.querySelectorAll('#layer .list .row').length > 5, /Relationship/.test(document.querySelector('#layer').innerText)]), [true, true, true]);
    check('Agent page fits the phone', await page.evaluate(() => document.querySelector('#layer .sheet').scrollWidth <= document.querySelector('#layer .sheet').clientWidth + 1), true);
    await page.screenshot({ path: '/tmp/futbol-agent.png' });
    await page.evaluate(() => { closeSheet(true); UI.tab.tr = 'agents'; go('transfers'); });
    check('Agents tab lists agents', await page.locator('.main [data-a="agent"]').count(), 40);
    const old = await page.evaluate(() => { delete G.agents; Object.values(G.players).forEach(p => delete p.ag); saveGame(); loadGame(); return [Object.keys(G.agents).length, Object.values(G.players).filter(p => p.age >= 17).every(p => p.ag)]; });
    check('Older saves get agents', old, [40, true]);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
