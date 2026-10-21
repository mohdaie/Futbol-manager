// Run with Playwright installed: node tests/transfer-ai.cjs [existing server URL]
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
    // Stub both AI services: DeepSeek echoes a fact (or invents a number when asked to misbehave); Jev answers from a table.
    await page.evaluate(() => {
      window.AIT = { ds: 0, jev: 0, bad: false, jevPick: {} };
      const c = aiCfg();
      Object.assign(c.ds, { on: true, mode: 'proxy', proxy: 'https://stub', feat: { staff: true, agents: true, news: true } });
      Object.assign(c.jev, { on: true, mode: 'proxy', proxy: 'https://stub', feat: { transfer: true } });
      window.dsChat = async msgs => { AIT.ds++; const f = JSON.parse(msgs[1].content).facts; const name = (f.join(' ').match(/Player: ([^,]+?)(,|$)/) || f.join(' ').match(/Client: ([^,]+?)(,|$)/) || [, ''])[1]; return { text: JSON.stringify({ text: AIT.bad ? 'He will cost 987654 and score 99 goals.' : `My view on ${name || 'this'}: a sensible call.` }) }; };
      window.jevAsk = async (state, q, note) => { AIT.jev++; const k = Object.keys(q.decision.criteria); const pick = AIT.jevPick[note] || k[0]; return { answers: { decision: { choice: pick, confidence: 0.9 } } }; };
    });
    const flush = () => page.waitForTimeout(80);
    const r1 = await page.evaluate(async () => {
      G.fin.tb = 300e6; G.fin.wb += 600000;
      staffOf('Director')[0].rating = 9;
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && lvlOf(x) === 'A' && !isKeyPlayer(x) && x.ca < userClub().rep);
      G.know[p.id] = 95;
      const rulesSay = dofMemo(p).verdict;
      AIT.jevPick['DoF review'] = rulesSay === 'Drop' ? 'Proceed' : 'Drop';
      const d = startDeal(p, 'review'); DEAL_STEP.in.review(d, p);
      const rules = d.memo.rules || d.memo.verdict;
      await new Promise(r => setTimeout(r, 30));
      return { id: d.id, pid: p.id, verdict: d.memo.verdict, rules: d.memo.rules || null, jev: d.memo.jev, first: rules, log: d.log[0].txt };
    });
    console.log('dof', JSON.stringify(r1));
    check('Jev gives the DoF a second opinion', !!(r1.jev && r1.jev.choice), true);
    check('A DoF below 13 adopts a confident AI opinion', [r1.verdict === r1.jev.choice, r1.rules != null && r1.rules !== r1.verdict, /AI review/.test(r1.log)], [true, true, true]);
    await page.evaluate(id => dealSheet(id), r1.id); await flush(); await page.evaluate(id => dealSheet(id), r1.id);
    check("The DoF's memo in his own words", await page.locator('#layer .memo .aiq').count(), 1);
    check('The AI second opinion is shown', await page.locator('#layer .memo', { hasText: 'AI second opinion' }).count(), 1);

    const bad = await page.evaluate(async () => {
      AIT.bad = true; const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id) && lvlOf(x) === 'A');
      G.know[p.id] = 95; const d = startDeal(p, 'review'); DEAL_STEP.in.review(d, p); dofWords(d);
      await new Promise(r => setTimeout(r, 30)); AIT.bad = false;
      return dofWords(d);
    });
    check('Invented numbers are rejected (built-in wording stays)', bad, null);

    const r2 = await page.evaluate(async () => {
      // Player decision: the AI says he stays, even though the rules would let a keen player join.
      AIT.jevPick['Player decision'] = 'Stay';
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id) && lvlOf(x) === 'A' && !x.inj);
      const d = startDeal(p, 'terms', { lim: { fee: 1e9, wage: 1e6 }, fee: 5e6, opened: true, next: dayAbs(), will: 'open', memo: null, bonus: 0 });
      DEAL_STEP.in.terms(d, p); await new Promise(r => setTimeout(r, 30));
      DEAL_STEP.in.player(d, p);
      // Selling club: a borderline offer the AI accepts.
      AIT.jevPick['Club answer'] = 'Accept';
      const q = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id) && lvlOf(x) === 'A' && !isKeyPlayer(x));
      const ask = askingPrice(q), e = startDeal(q, 'bid', { lim: { fee: 1e9, wage: 1e6 }, fee: roundMoney(ask * 0.93), add: 0, inst: 0, ask, opened: true, next: dayAbs() });
      DEAL_STEP.in.bid(e, q); await new Promise(r => setTimeout(r, 30));
      DEAL_STEP.in.bid(e, q);
      return { player: d.closed && d.closed.why, club: e.stage, clubLog: e.log[0].txt };
    });
    console.log('decisions', JSON.stringify(r2));
    check('Jev decides a hesitant player stays', /decided to stay/.test(r2.player || ''), true);
    check('Jev accepts a borderline bid for the selling club', r2.club, 'agent');

    const r3 = await page.evaluate(async () => {
      const n = G.social.length; falseRumour(9); const p = G.social[0];
      await new Promise(r => setTimeout(r, 30));
      return { ai: !!p.ai, txt: p.txt };
    });
    check('Influencers and journalists write their own posts', r3.ai, true);
    const r4 = await page.evaluate(async () => {
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id) && lvlOf(x) === 'A');
      const d = startDeal(p, 'agent', { lim: { fee: 1e9, wage: 1e6 }, fee: 5e6, opened: true, next: dayAbs() });
      dealLog(d, 'The club would listen to offers.', 'club'); agentWords(d); await new Promise(r => setTimeout(r, 30));
      return { id: d.id, w: agentWords(d) };
    });
    check("An agent's message in his own words", typeof r4.w, 'string');
    const budget = await page.evaluate(() => { const n0 = AIT.ds; for (let i = 0; i < 80; i++) aiVoice('staff', 'spam:' + i + ':' + Math.random(), 'Test.', ['Player: Nobody']); return AIT.ds - n0; });
    check('AI calls are capped per day', budget <= 40, true);

    const learn = await page.evaluate(() => {
      const d = G.deals.find(x => x.memo && x.dir === 'in'); logDof(d, 'proceed');
      const p = G.players[d.pid]; p.st.a = 10; p.st.rt = 72; // averaging 7.2
      transferLearnSeason();
      const s = seniorSquad(G.club)[2]; const r = { id: 1, kind: 'ours', choice: 'notforsale', pid: s.id }; logStatement(r, s); s.mor += 6;
      G.staffLog.filter(e => e.k === 'press').forEach(e => { e.day -= 20; });
      transferLearnWeekly();
      const keys = Object.keys(staffLearn().draft);
      return { dof: keys.some(k => k.startsWith('dof|')), press: keys.includes('press|ours|notforsale'), snap: staffSnapshot().records.transfers };
    });
    console.log('learn', JSON.stringify(learn));
    check('DoF verdicts are learned from how players did', learn.dof, true);
    check('Statements are learned from morale two weeks later', learn.press, true);
    check('Transfer summary goes to the cloud with the staff tables', !!learn.snap && typeof learn.snap.deals.done === 'number', true);

    const off = await page.evaluate(() => {
      const c = aiCfg(); c.ds.on = false; c.jev.on = false; const n0 = AIT.ds + AIT.jev;
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id) && lvlOf(x) === 'A');
      G.know[p.id] = 95; const d = startDeal(p, 'review'); DEAL_STEP.in.review(d, p); dofWords(d); falseRumour(3);
      return { calls: AIT.ds + AIT.jev - n0, verdict: d.memo.verdict, jev: d.memo.jev || null };
    });
    check('With AI off, the rules decide and nothing is called', [off.calls, !!off.verdict, off.jev], [0, true, null]);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
