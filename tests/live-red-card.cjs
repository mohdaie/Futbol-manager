// Real mobile controls after dismissing the automatic red-card popup.
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
(async () => {
  const root = path.resolve(__dirname, '..'), checks = [], errors = [];
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try { res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  let browser;
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  try {
    if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {}) });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errors.push(e.message)); await page.route('https://fonts.googleapis.com/**', r => r.abort());
    const close = async () => { await page.locator('#layer .sh-x').tap(); await page.waitForFunction(() => document.getElementById('layer').hidden); };
    const open = async kind => { await page.locator(`.mctl [data-a=liveSheet][data-k=${kind}]`).tap(); };
    await page.goto(base); await page.locator('[data-a=titleNew]').click(); await page.locator('[data-a=startGame]').click();
    await page.evaluate(() => { while (!userFixture()) advanceWeek(); go('prematch'); });
    await page.locator('[data-a=kickoff]').tap(); await page.waitForFunction(() => LIVE && LIVE.M.min >= 1 && !LIVE.simBusy);
    const redId = await page.evaluate(() => {
      LIVE.paused = true; const S = liveSide(), id = S.on[4], ev = { min: LIVE.M.min, pid: id };
      sendOff(LIVE.M, S, id, ev); syncSide(LIVE.M, S.idx);
      LIVE.mq = { ev: [ev], main: ev, fr: [], segs: [] }; endMinute(LIVE); return id;
    });
    check('A dismissal opens the gap popup', await page.locator('#layer .sh-t').textContent() === 'A man down');
    await close();
    await open('subs');
    check('Subs retains access after the initial popup is dismissed', await page.locator('#layer [data-a=liveGap]').count() === 1);
    await page.locator('#layer [data-a=liveGap]').tap();
    const mover = await page.evaluate(() => liveSide().on[7]);
    await page.locator(`#layer [data-a=gapMove][data-id="${mover}"]`).tap();
    check('A remaining player can fill the dismissed player’s position later', await page.evaluate(({ mover, redId }) => {
      const S = liveSide(); return S.on[4] === mover && S.on[7] === null && !S.on.includes(redId) && S.on.filter(Boolean).length === 10 && S.subs === 0 && S.wins === 0;
    }, { mover, redId }));
    await page.locator('#layer [data-a=liveSheet][data-k=tactics]').tap();
    check('First XI displays a selectable empty position', await page.locator('#liveXiPanel button.live-xi-gap[data-i="7"]').count() === 1);
    await page.locator('#liveXiPanel button.live-xi-gap').tap();
    check('The selected position is used by the gap selector', await page.locator('#layer [data-a=gapMove]').first().getAttribute('data-i') === '7');
    const mover2 = await page.evaluate(() => liveSide().on[8]);
    await page.locator(`#layer [data-a=gapMove][data-id="${mover2}"]`).tap();
    await page.locator('#layer [data-a=liveSheet][data-k=tactics]').tap();
    await page.getByRole('tab', { name: 'Formation', exact: true }).tap();
    check('The formation shows the empty position as a selectable token', await page.locator('#livePitchPanel .live-gap-token[data-i="8"]').count() === 1);
    await page.locator('#livePitchPanel .live-gap-token').tap();
    check('Formation gap access targets the right position', await page.locator('#layer [data-a=gapMove]').first().getAttribute('data-i') === '8');
    await page.locator('#layer [data-a=liveSheet][data-k=tactics]').tap();
    await page.getByRole('button', { name: 'Swap positions', exact: true }).tap();
    const swapMover = await page.evaluate(() => liveSide().on[9]);
    await page.locator('#livePitchPanel [data-a=liveTok][data-i="9"]').tap();
    await page.locator('#livePitchPanel .live-gap-token[data-i="8"]').tap();
    check('Swap mode moves an on-pitch player into an empty position', await page.evaluate(id => liveSide().on[8] === id && liveSide().on[9] === null && liveSide().on.filter(Boolean).length === 10, swapMover));
    // Select the gap first, then the player: both orders are supported.
    const reverseMover = await page.evaluate(() => liveSide().on[6]);
    await page.locator('#livePitchPanel .live-gap-token[data-i="9"]').tap();
    await page.locator('#livePitchPanel [data-a=liveTok][data-i="6"]').tap();
    check('Swap mode also accepts the empty position first', await page.evaluate(id => liveSide().on[9] === id && liveSide().on[6] === null && liveSide().on.filter(Boolean).length === 10, reverseMover));
    // A goalkeeper dismissal adds a second gap; the manager chooses which one to cover.
    await page.evaluate(() => { const S = liveSide(); sendOff(LIVE.M, S, S.on[0], {}); syncSide(LIVE.M, S.idx); ACT.liveGap({ i: 0 }); });
    check('Multiple dismissals expose every empty position', await page.locator('#layer [aria-label="Empty positions"] [data-a=liveGap]').count() === 2);
    const emergency = await page.evaluate(() => liveSide().on[10]);
    await page.locator(`#layer [data-a=gapMove][data-id="${emergency}"]`).tap();
    check('An emergency keeper can be assigned without restoring the dismissed player', await page.evaluate(id => liveSide().on[0] === id && liveSide().on.filter(Boolean).length === 9 && liveSide().subs === 0, emergency));
    await page.locator('#layer [data-a=liveGap][data-i="6"]').tap();
    check('The other empty position can be selected explicitly', await page.locator('#layer [data-a=gapMove]').first().getAttribute('data-i') === '6');
    // A normal substitution still requires taking off a remaining player.
    await close(); await open('subs');
    const substitution = await page.evaluate(() => ({ out: liveSide().on[2], incoming: liveSide().bench.find(id => G.players[id].pos !== 'GK') }));
    await page.locator(`#layer [data-a=subOut][data-id="${substitution.out}"]`).tap();
    await page.locator(`#layer [data-a=subIn][data-id="${substitution.incoming}"]`).tap();
    check('Normal substitutions still work while the team remains two players down', await page.evaluate(({ out, incoming }) => {
      const S = liveSide(); return !S.on.includes(out) && S.on.includes(incoming) && S.on.filter(Boolean).length === 9 && S.subs === 1;
    }, substitution));
    await close();
    const lineup = await page.evaluate(async () => { liveKeep(); await SaveStorage.flush(); return liveSide().on; });
    await page.reload(); await page.waitForFunction(() => LIVE && UI.s === 'match');
    check('Save and reload retain the reorganized side and dismissed-player count', await page.evaluate(expected => JSON.stringify(liveSide().on) === JSON.stringify(expected) && liveSide().reds.length === 2, lineup));
    await open('tactics');
    check('Reorganization is available after reloading the live match', await page.locator('#layer [data-a=liveGap]').count() === 1);
    check('No browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
