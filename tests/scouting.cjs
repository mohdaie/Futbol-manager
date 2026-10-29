// Run with Playwright installed: node tests/scouting.cjs [existing server URL]
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
      const out = {};
      // The stage tests need a blank network; country knowledge is checked on its own below.
      staffOf('Scout').forEach(s => { s.cn = {}; s.cnv = (s.cnv || 0) + 1; });
      const others = Object.values(G.players).filter(p => p.club !== G.club && p.club !== 'FA');
      const p = others.find(x => G.clubs[x.club].pl && !inUserLeague(x) && lvlOf(x) === 'A' && x.ca > 70);
      const vis = (k) => { G.know[p.id] = k; return ATTRS.map((a, i) => { const s = seenAttr(p, i); return s.unk ? 'u' : s.ok ? 'x' : 'r'; }); };
      const grp = g => ATTRS.map((a, i) => i).filter(i => ATTRS[i][2] === g);
      const at10 = vis(10), at40 = vis(40), at60 = vis(60), at80 = vis(80), at90 = vis(90);
      out.at10 = at10.every(v => v === 'u');
      out.phys40 = grp('P').some(i => at40[i] === 'x') && grp('T').every(i => at40[i] === 'u') && grp('M').every(i => at40[i] === 'u');
      out.at60 = grp('P').every(i => at60[i] === 'x') && grp('T').some(i => at60[i] !== 'u') && grp('M').every(i => at60[i] === 'u');
      out.at80 = grp('T').every(i => at80[i] === 'x') && grp('M').some(i => at80[i] !== 'u');
      out.at90 = at90.every(v => v === 'x') && seenOvr(p).txt === String(p.ca);
      // The share of exact values grows with knowledge.
      out.share = [25, 50, 75, 90].map(k => { const v = vis(k); return Math.round(v.filter(x => x === 'x').length / v.length * 100); });
      // Ranges always contain the true value.
      let bad = 0;
      others.slice(0, 300).forEach(q => { const k0 = G.know[q.id]; [30, 55, 80].forEach(k => { G.know[q.id] = k; ATTRS.forEach((a, i) => { const s = seenAttr(q, i); if (!s.unk && (q.at[i] < s.lo || q.at[i] > s.hi)) bad++; }); }); G.know[q.id] = k0; });
      out.bad = bad;
      G.know[p.id] = 10;
      out.pid = p.id;
      out.foreign = others.find(x => !G.clubs[x.club].pl && lvlOf(x) === 'A').id;
      out.video = others.find(x => x.id !== p.id && x.id !== out.foreign && G.clubs[x.club].pl && !inUserLeague(x)).id;
      return out;
    });
    check('Unscouted player shows no attributes', r.at10, true);
    check('Watched stage confirms physical attributes first', r.phys40, true);
    check('Scouted stage: physical exact, technical arriving, mental hidden', r.at60, true);
    check('Detailed stage: technical exact, mental arriving', r.at80, true);
    check('Full file: every value exact', r.at90, true);
    console.log('exact share at 25/50/75/90%:', r.share.join('/'));
    check('Exact share rises with knowledge', r.share.every((v, i) => i === 0 || v > r.share[i - 1]), true);
    check('Estimates always contain the true value', r.bad, 0);

    const send = await page.evaluate(({ pid, foreign, video }) => [scoutPlayer(G.players[pid]).ok, scoutPlayer(G.players[foreign]).ok, scoutPlayer(G.players[video], 'video').ok, scoutPlayer(G.players[pid]).ok], r);
    check('Scout and video jobs start; no double booking', send, [true, true, true, false]);
    check('Watch jobs take no more than two weeks', await page.evaluate(() => G.scout.jobs.filter(j => j.mode === 'watch').every(j => j.end - j.start >= 7 && j.end - j.start <= 14)), true);
    const cap = await page.evaluate(() => { const n = staffOf('Scout').length * SCOUT_LOAD; const pool = Object.values(G.players).filter(p => p.club !== G.club && p.club !== 'FA' && !G.scout.jobs.some(j => j.pid === p.id)); let ok = 0; for (let i = 0; i < 12; i++) if (scoutPlayer(pool[i]).ok) ok++; const jobs = G.scout.jobs.filter(j => j.mode === 'watch').length; G.scout.jobs = G.scout.jobs.slice(0, 3); return [jobs, n, ok]; });
    check('Each scout follows up to three players', cap[0], cap[1]);
    const run = await page.evaluate(({ pid, foreign, video }) => {
      staffOf('Scout').forEach(s => { s.cn = genScoutCountries(s); s.cnv = (s.cnv || 0) + 1; });
      [pid, foreign, video].forEach(id => { G.know[id] = 10; });
      const k0 =[knowOf(G.players[pid]), knowOf(G.players[foreign])];
      let days = 0, vk = null;
      while (days < 15) { const res = advanceDay(); if (res === 'match') { playUserInstant(userFixture()); continue; } days++; if (days === 3) vk = knowOf(G.players[video]); }
      const f = G.scout.reports.find(x => x.pid === pid), ff = G.scout.reports.find(x => x.pid === foreign);
      return { k0, k1: [knowOf(G.players[pid]), knowOf(G.players[foreign])], vk, seen: f.seen.length, rt: f.seen.find(x => x.rt != null)?.rt ?? null, fseen: ff.seen.length, left: G.scout.jobs.filter(j => j.pid === pid).length, news: G.news.some(n => n.action && n.action.t === 'scoutfile' && n.action.pid === pid), grade: f.grade, hist: f.hist.length };
    }, r);
    console.log('scouting run', JSON.stringify(run));
    check('Watching league matches adds knowledge over time', run.k1[0] > run.k0[0] + 20 && run.seen >= 2, true);
    check('Matches watched are logged with ratings', typeof run.rt, 'number');
    check('Overseas players are watched at weekends', run.k1[1] > run.k0[1] && run.fseen >= 2, true);
    check('Video analysis files within days and stops at 74%', run.vk > 10 && run.vk <= 74, true);
    check('Job ends within two weeks with a news item', [run.left, run.news], [0, true]);
    // Two watches inside the same stage with an unchanged grade correctly add no second entry, so one is the guaranteed minimum.
    check('File keeps a history of the report', run.hist >= 1, true);

    await page.evaluate(id => { G.know[id] = 82; scoutFileSheet(id); }, r.pid);
    check('Scouting file opens', await page.locator('#layer .sfile').count(), 1);
    check('File shows confirmed, estimated and locked parts', await page.evaluate(() => [!!document.querySelector('#layer .sfile b.est, #layer .sfile b.unk'), !!document.querySelector('#layer .sfile .lock'), !!document.querySelector('#layer .sf-stamp')]), [true, true, true]);
    check('File fits the phone screen', await page.evaluate(() => document.querySelector('#layer .sheet').scrollWidth <= document.querySelector('#layer .sheet').clientWidth + 1), true);
    await page.screenshot({ path: '/tmp/futbol-scouting.png' });
    await page.locator('#layer [data-a="fileFolder"][data-v="rec"]').click();
    check('Files can be moved to a folder', await page.evaluate(id => G.scout.reports.find(x => x.pid === id).folder, r.pid), 'rec');
    await page.evaluate(() => { closeSheet(true); UI.tab.tr = 'scout'; UI.tab.sfold = 'rec'; go('transfers'); });
    check('Folder lists the file', await page.locator('.main .grade').count() >= 1, true);
    await page.screenshot({ path: '/tmp/futbol-scouting-tab.png', fullPage: true });

    const old = await page.evaluate(() => { G.scout.reports.push({ pid: Object.keys(G.players)[5] * 1, grade: 'B', date: 0 }); delete G.scout.jobs; saveGame(); loadGame(); return [Array.isArray(G.scout.jobs), G.scout.reports.every(x => x.folder && Array.isArray(x.seen))]; });
    check('Older saves load with folders and jobs', old, [true, true]);
    const asg = await page.evaluate(() => { G.scout.jobs = []; G.scout.assign = []; addAssignment('Europe', 'Any', 30, 2); const before = G.scout.reports.length; weeklyScouting(); const fresh = G.scout.reports.slice(0, G.scout.reports.length - before).map(x => x.k); return fresh; });
    // A strong scout with a deep regional network can lift a first look into the Scouted stage, and a target may already have a file.
    check('Assignments file first reports (Watched stage or just beyond)', asg.length >= 1 && asg.length <= 2 && asg.every(k => k >= 25 && k < 75), true);
    const lg = await page.evaluate(() => {
      const q = Object.values(G.players).find(x => inUserLeague(x) && lvlOf(x) === 'A');
      delete G.know[q.id];
      const exact = ATTRS.every((a, i) => seenAttr(q, i).ok) && seenOvr(q).txt === String(q.ca);
      const k0 = knowOf(q);
      scoutFileSheet(q.id);
      const lockedInterest = [...document.querySelectorAll('#layer .fsec')].some(s => s.querySelector('h4')?.textContent === 'Full file' && s.querySelector('.lock'));
      closeSheet(true);
      noteLeaguePlayers();
      const other = Object.keys(G.clubs).find(cid => G.clubs[cid].pl && !G.clubs[cid].fa && leagueOf(cid) !== leagueOf(G.club));
      const from = q.club; q.club = other;
      const kept = ATTRS.every((a, i) => seenAttr(q, i).ok);
      q.club = from;
      return { exact, k0, lockedInterest, kept };
    });
    check('League players: every attribute exact without scouting', lg.exact, true);
    check('League players: file at 89%, interest still hidden', [lg.k0, lg.lockedInterest], [89, true]);
    check('League players keep their attributes after leaving the league', lg.kept, true);
    const net = await page.evaluate(() => {
      staffOf('Scout').forEach(s => { s.cn = genScoutCountries(s); s.cnv = (s.cnv || 0) + 1; });
      const sc = staffOf('Scout');
      const shape = sc.every(s => s.nat && Object.keys(s.cn).length >= 2 && s.cn[s.nat] >= 55 && Object.values(s.cn).every(v => v > 0 && v <= 100));
      const pool = Array.from({ length: 40 }, () => genStaffMember('Scout', 70));
      const byRating = r => { const g = pool.filter(s => r ? s.rating >= 12 : s.rating <= 7); return g.length ? g.reduce((t, s) => t + Object.keys(s.cn).length, 0) / g.length : null; };
      // One scout: an expert on Spain, nothing else.
      const keep = G.staff; G.staff = G.staff.filter(s => s.role !== 'Scout');
      const exp = { id: G.nextId++, role: 'Scout', name: 'Test Scout', age: 50, rating: 20, wage: 1000, nat: 'ESP', cn: { ESP: 100 } };
      G.staff.push(exp);
      const spain = Object.values(G.players).find(x => clubCountry(x) === 'ESP' && lvlOf(x) !== 'Y' && !leagueKnown(x));
      const spanishAbroad = Object.values(G.players).find(x => x.nat === 'ESP' && clubCountry(x) && clubCountry(x) !== 'ESP' && !inUserLeague(x) && x.club !== G.club);
      const other = Object.values(G.players).find(x => clubCountry(x) && !['ESP'].includes(clubCountry(x)) && x.nat !== 'ESP' && !inUserLeague(x) && x.club !== G.club);
      [spain, spanishAbroad, other].forEach(x => x && delete G.know[x.id]);
      const res = { spain: spain ? knowOf(spain) : null, abroad: spanishAbroad ? knowOf(spanishAbroad) : null, other: other ? knowOf(other) : null,
        physSeen: spain ? ATTRS.some((a, i) => a[2] === 'P' && seenAttr(spain, i).ok) : null, mentalHidden: spain ? ATTRS.every((a, i) => a[2] !== 'M' || seenAttr(spain, i).unk) : null };
      exp.rating = 6; exp.cnv++;
      res.weak = spain ? knowOf(spain) : null;
      exp.rating = 20; exp.cn = { ESP: 30 }; exp.cnv++;
      const g0 = watchGain(exp, spain, true);
      exp.cn = { ESP: 100 }; exp.cnv++;
      res.faster = watchGain(exp, spain, true) > g0;
      exp.cn = { ESP: 30 };
      learnCountry(exp, 'ESP', 1.5); res.learn = exp.cn.ESP > 30;
      G.staff = keep;
      return { shape, many: byRating(true), few: byRating(false), ...res };
    });
    console.log('network', JSON.stringify(net));
    check('Scouts have a home country and more countries by %', net.shape, true);
    check('Better scouts know more countries', net.many == null || net.few == null || net.many > net.few, true);
    check('An expert on a country files its league players before watching', net.spain, 55);
    check('Network files show physical attributes, not mental', [net.physSeen, net.mentalHidden], [true, true]);
    check('Players of that nationality abroad are partly known', net.abroad > 10 && net.abroad < net.spain, true);
    check('Other countries are not helped', net.other, 10);
    check('A poor scout knows less of the same country', net.weak < net.spain, true);
    check('Knowing the country speeds up watching', net.faster, true);
    check('Working in a country raises knowledge', net.learn, true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
