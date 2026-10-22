// Run with Playwright installed: node tests/lineup.cjs [existing server URL]
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
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { applyStyle(G.tactics, 'tiki'); ensureUserLineup(); go('tactics'); });
    const original = await page.evaluate(() => ({ xi: G.tactics.slots.slice(), bench: G.tactics.bench.slice(), roles: G.tactics.roles.slice(), pi: JSON.stringify(G.tactics.pi), fam: G.training.fam, st: FORMATIONS[G.tactics.ip].findIndex(s => s[0] === 'ST'), rw: FORMATIONS[G.tactics.ip].findIndex(s => s[0] === 'AMR'), lw: FORMATIONS[G.tactics.ip].findIndex(s => s[0] === 'AML') }));
    check('Pitch labels identify ST and RW', await page.locator('.tpitch .tk-pos').allTextContents().then(v => v.includes('ST') && v.includes('RW')), true);
    await page.locator('[data-a="swapMode"]').click();
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.st}"]`).tap();
    check('First tap selects the striker for swapping', await page.evaluate(() => UI.swapFrom), original.st);
    check('Selected striker is highlighted', await page.locator('.tpitch .swap-picked').count(), 1);
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.rw}"]`).tap();
    const expected = original.xi.slice(); [expected[original.st], expected[original.rw]] = [expected[original.rw], expected[original.st]];
    check('Two pitch taps swap ST and RW', await page.evaluate(() => G.tactics.slots), expected);
    check('The bench stays unchanged', await page.evaluate(() => G.tactics.bench), original.bench);
    check('Both starters remain selected exactly once', await page.evaluate(() => new Set(G.tactics.slots).size), 11);
    check('Roles and individual instructions stay with their positions', await page.evaluate(() => [G.tactics.roles, JSON.stringify(G.tactics.pi)]), [original.roles, original.pi]);
    check('Swapping players does not change tactical familiarity', await page.evaluate(() => G.training.fam), original.fam);
    check('Pitch swaps persist in the autosave', await page.evaluate(async () => { await SaveStorage.flush(); return (await SaveStorage.request('load')).tactics.slots; }), expected);
    check('After a swap the first selection is cleared', await page.evaluate(() => UI.swapFrom), null);
    await page.screenshot({ path: '/tmp/futbol-lineup-swap.png', animations: 'disabled' });
    // Tapping the same player twice cancels; Done must restore the normal picker.
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.st}"]`).tap();
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.st}"]`).tap();
    check('Tapping the same player twice leaves the XI unchanged', await page.evaluate(() => G.tactics.slots), expected);
    await page.locator('[data-a="swapMode"]').click();
    check('Done swapping restores ordinary selection controls', await page.locator('.tpitch [data-a="slot"]').count(), 11);
    // The normal picker also makes starter swaps discoverable, ahead of bench replacements.
    await page.locator(`.tpitch [data-a="slot"][data-i="${original.st}"]`).tap();
    check('Player picker explicitly offers starter swaps', await page.getByText('Starting XI — swap positions', { exact: true }).count(), 1);
    const targetId = expected[original.rw];
    const row = page.locator(`#layer [data-a="pickSlot"][data-id="${targetId}"]`);
    check('Current RW is labelled as a swap destination', await row.innerText().then(s => s.includes('Swap RW ↔ ST')), true);
    await row.click();
    check('Choosing the current winger swaps both starters back', await page.evaluate(() => G.tactics.slots), original.xi);
    check('Picker swap does not use a bench player', await page.evaluate(() => G.tactics.bench), original.bench);
    // Existing bench replacement remains available.
    await act('slot', { i: original.st });
    const sub = original.bench.find(id => id !== original.xi[0]);
    await page.locator(`#layer [data-a="pickSlot"][data-id="${sub}"]`).click();
    check('A substitute still replaces the selected starter', await page.evaluate(i => G.tactics.slots[i], original.st), sub);
    check('Replaced starter moves onto the bench', await page.evaluate(id => G.tactics.bench.includes(id), original.xi[original.st]), true);
    await page.evaluate(() => SaveStorage.flush());
    await page.reload(); await page.waitForFunction(() => !!G);
    check('Reload retains the revised selection', await page.evaluate(i => G.tactics.slots[i], original.st), sub);
    // Out-of-possession uses the mapped tokens but swaps the same player IDs.
    await act('tview', { v: 'oop' });
    const before = await page.evaluate(() => G.tactics.slots.slice());
    await page.locator('[data-a="swapMode"]').click();
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.st}"]`).tap();
    await page.locator(`.tpitch [data-a="swapSlot"][data-i="${original.lw}"]`).tap();
    const out = before.slice(); [out[original.st],out[original.lw]]=[out[original.lw],out[original.st]];
    check('Out-of-possession view swaps the mapped starters', await page.evaluate(() => G.tactics.slots), out);
    check('Tactics screen fits the phone', await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
    // The revised XI must be the XI used at kick-off, rather than being auto-picked away.
    await page.evaluate(() => { while (!userFixture()) advanceWeek(); ensureUserLineup(); go('tactics'); });
    const kickoff = await page.evaluate(() => G.tactics.slots.slice());
    await act('go', { s: 'prematch' }); await act('kickoff');
    await page.evaluate(() => { LIVE.paused = true; });
    check('Kick-off uses the saved starter positions', await page.evaluate(() => liveSide().on.slice()), kickoff);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
