// Run with Playwright installed: node tests/live-tactics.cjs [existing server URL]
// Live match: the tactics page (pitch, swaps, roles) and the gap after a dismissal. No provider calls.
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
    try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push(name); };
  const act = (name, ds = {}) => page.evaluate(({ name, ds }) => viewAction(() => ACT[name](ds)), { name, ds });
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { G.settings.speed = 4; while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('kickoff');
    await page.waitForFunction(() => LIVE && LIVE.M.min >= 1, null, { timeout: 30000 });

    check('condition and fatigue are visible for all eleven players without opening Subs', await page.locator('#liveWatchPlayers .live-watch-player').count(), 11);
    await page.evaluate(() => { LIVE.paused = true; const S = liveSide(); S.cond[S.on[1]] = 64; S.cond[S.on[2]] = 78; S.injuries.push([S.on[1], 'Test injury', 1]); updateBoard(LIVE); });
    const tiredId = await page.evaluate(() => liveSide().on[1]);
    const tiringId = await page.evaluate(() => liveSide().on[2]);
    check('the live panel shows current match condition and injury separately', await page.locator(`#liveWatchPlayers [data-health-id="${tiredId}"]`).getAttribute('aria-label'), 'Injured · Condition 64% · Tired');
    check('moderate fatigue has a distinct label', await page.locator(`#liveWatchPlayers [data-health-id="${tiringId}"] .live-fatigue`).innerText(), 'Tiring');
    await page.locator(`#liveWatchPlayers [data-id="${tiredId}"]`).click();
    check('the live panel opens the player card directly', await page.evaluate(() => UI.popup.key), 'live:pl');
    await act('closeSheet');

    await act('liveSheet', { k: 'tactics' });
    check('First XI is the default tactics view', await page.locator('#liveXiPanel').isVisible(), true);
    check('First XI lists every current player', await page.locator('.live-xi-player').count(), 11);
    check('tactics shows the same condition and injury as the live panel', await page.locator(`#liveXiPanel [data-health-id="${tiredId}"]`).getAttribute('aria-label'), 'Injured · Condition 64% · Tired');
    // Condition changes update the open tactics list without replacing focused controls.
    await page.locator('.live-xi-player').first().focus();
    await page.evaluate(() => { const S = liveSide(); S.cond[S.on[1]] = 60; updateBoard(LIVE); });
    check('condition refresh keeps focus in the tactics list', await page.evaluate(() => document.activeElement.classList.contains('live-xi-player')), true);
    check('open tactics displays refreshed condition', await page.locator(`#liveXiPanel [data-health-id="${tiredId}"] > b`).innerText(), '60%');
    await page.getByRole('tab', { name: 'Formation', exact: true }).click();
    check('Formation still provides the pitch view', await page.locator('#livePitchPanel').isVisible(), true);
    const toks = await page.locator('.tpitch .tok').count();
    check('the tactics page shows every player on the pitch', toks, await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.filter(Boolean).length));

    const before = await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.slice(2, 8));
    await act('liveSwapMode');
    await act('liveTok', { i: 2 });
    await act('liveTok', { i: 7 });
    const after = await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.slice(2, 8));
    check('two players swap places on the pitch', [after[0], after[5]], [before[5], before[0]]);

    await act('liveSwapMode');
    await act('liveTok', { i: 3 });
    await act('liveRole', { i: 3, k: 0 });
    check('a role can be set during the match', await page.evaluate(() => LIVE.M.sides[LIVE.bottom].roles[3]), 0);

    await page.getByRole('tab', { name: 'First XI', exact: true }).click();
    await page.locator('.live-xi-player[data-i="3"]').click();
    check('First XI rows use the same role selection as the pitch', await page.evaluate(() => LIVE.roleSlot), null);

    // A substitution immediately replaces the outgoing player in the live panel.
    await act('closeSheet');
    const substitution = await page.evaluate(() => {
      const S = liveSide(), out = S.on[1], incoming = S.bench.find(id => G.players[id].pos !== 'GK');
      S.injuries = S.injuries.filter(x => x[0] !== out);
      LIVE.subSel = out; ACT.subIn({ id: incoming });
      return { out, incoming };
    });
    check('substituted players leave the live condition panel', await page.locator(`#liveWatchPlayers [data-id="${substitution.out}"]`).count(), 0);
    check('replacement players appear in the live condition panel', await page.locator(`#liveWatchPlayers [data-id="${substitution.incoming}"]`).count(), 1);

    // A dismissal leaves a gap; the manager moves a team-mate into it.
    await act('closeSheet');
    await page.evaluate(() => { const S = liveSide(), id = S.on[5]; sendOff(LIVE.M, S, id, { min: LIVE.M.min, side: 1 - S.idx, t: 'foul', pid: id }); syncSide(LIVE.M, S.idx); openLiveSheet('gap'); });
    check('the gap is shown after a dismissal', await page.locator('.sh-t', { hasText: 'A man down' }).count() > 0, true);
    const mover = await page.evaluate(() => liveSide().on[7]);
    await act('gapMove', { id: mover });
    check('a dismissal removes the player from the condition panel', await page.locator('#liveWatchPlayers .live-watch-player').count(), 10);
    check('a team-mate moves into the gap and leaves a new one', await page.evaluate(() => { const S = liveSide(); return S.on[5] === null || S.on[5] === undefined ? false : S.on.indexOf(null) === 7; }), true);
    check('every player on the pitch carries a speed for the dribble view', await page.evaluate(() => LIVE.dots.every(team => team.every(d => !d || typeof d.v === 'number'))), true);
    // Set pieces and captain: the chosen penalty taker is stored for this match.
    const taker = await page.evaluate(() => liveSide().on.filter(Boolean)[3]);
    await act('liveSheet', { k: 'tactics' });
    await page.selectOption('#lsp-pk', String(taker));
    check('the penalty taker chosen on the tactics page is kept for the match', await page.evaluate(() => liveSide().pk), taker);
    // A penalty: the taker runs in from six metres behind the spot before he strikes; the view must draw it cleanly.
    await page.waitForFunction(() => { if (!LIVE.mq || !LIVE.mq.marks) { LIVE.paused = false; return false; } LIVE.paused = true; return true; }, null, { timeout: 30000 });
    await page.evaluate(() => { LIVE.mq.marks.push({ t: LIVE.gt + 1, k: 'sfx', s: 0, kind: 'penalty', who: 9, x0: 34, y0: 92, ax: 0, az: 0, res: 'goal', flight: 0.8 }); LIVE.paused = false; });
    await page.waitForTimeout(700);
    check('the match carries on after a penalty run-up is drawn', await page.evaluate(() => !!LIVE && !LIVE.done), true);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForFunction(() => Math.abs(LIVE.H - LIVE.cv.parentElement.clientHeight) < 2);
    check('small phones keep match controls visible beside the condition panel', await page.evaluate(() => document.querySelector('.mctl').getBoundingClientRect().bottom <= innerHeight && document.documentElement.scrollWidth <= innerWidth), true);
    check('the canvas uses the actual pitch space left by the condition panel', await page.evaluate(() => Math.abs(LIVE.cv.getBoundingClientRect().height - LIVE.cv.parentElement.getBoundingClientRect().height) < 2), true);
  } finally {
    await browser.close(); server.close();
  }
  check('no page errors', errors, []);
  console.log(`live tactics checks passed: ${checks.length}`);
})().catch(e => { console.error(e); process.exit(1); });
