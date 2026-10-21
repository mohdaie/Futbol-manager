// Run with Playwright installed: node tests/ui-stability.cjs [existing server URL]
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
    const dealId = await page.evaluate(() => {
      const p = Object.values(G.players).find(p => p.club !== G.club && !G.clubs[p.club].fa && lvlOf(p) === 'A');
      ACT.offer({ id: p.id });
      UI.dealForm.fee = 1500000; UI.dealForm.wage = 5250;
      delete UI.dealForm.feeStep; delete UI.dealForm.wageStep;
      dealSheet(UI.dealForm.id);
      return UI.dealForm.id;
    });
    const button = (k, direction) => page.locator(`#layer [data-a="dealForm"][data-k="${k}"]`).nth(direction === '-' ? 1 : 2);
    await button('fee', '-').click();
    check('Fee minus subtracts £50,000 without rounding it away', await page.evaluate(() => UI.dealForm.fee), 1450000);
    check('Fee displays exact pounds', await page.locator('.stepper').first().locator('b').innerText(), '£1,450,000');
    await button('fee', '+').click();
    check('Fee plus returns to the original amount', await page.evaluate(() => UI.dealForm.fee), 1500000);
    await button('wage', '-').click();
    check('Wage minus subtracts exactly £250', await page.evaluate(() => UI.dealForm.wage), 5000);
    await button('wage', '+').click();
    check('Wage plus restores exactly £5,250', await page.evaluate(() => UI.dealForm.wage), 5250);
    check('Weekly wage displays exact pounds', await page.locator('.stepper').nth(1).locator('b').innerText(), '£5,250/w');
    await page.evaluate(() => {
      UI.dealForm.fee = 20000000; delete UI.dealForm.feeStep;
      dealSheet(UI.dealForm.id);
      window.originalPanel = document.querySelector('#layer .sheet');
      window.originalScrim = document.querySelector('#layer .scrim');
      window.animationsStarted = 0;
      originalPanel.addEventListener('animationstart', () => animationsStarted++);
    });
    await page.waitForTimeout(250);
    const oldIndex = await page.evaluate(() => VIEW_HISTORY.index);
    await button('fee', '-').click(); await button('fee', '+').click();
    check('Crossing a fee threshold keeps plus and minus reversible', await page.evaluate(() => UI.dealForm.fee), 20000000);
    check('Changing a fee retains the same popup and scrim', await page.evaluate(() => originalPanel === document.querySelector('#layer .sheet') && originalScrim === document.querySelector('#layer .scrim')), true);
    check('Changing fees does not restart the entrance animation', await page.evaluate(() => animationsStarted), 0);
    check('Fee editing creates no extra Back entries', await page.evaluate(() => VIEW_HISTORY.index), oldIndex);
    const focusedScroll = await page.evaluate(() => {
      const panel = document.querySelector('#layer .sheet'), b = panel.querySelector('[data-a="dealForm"][data-k="fee"][data-v^="-"]');
      panel.scrollTop = 100; b.focus({ preventScroll: true });
      return { scroll: panel.scrollTop, y: panel.getBoundingClientRect().y, value: b.dataset.v };
    });
    // Keyboard activation checks focus and scroll without Playwright scrolling the button into view.
    await page.keyboard.press('Enter');
    check('Same-popup refresh keeps scroll position', await page.evaluate(() => document.querySelector('#layer .sheet').scrollTop), focusedScroll.scroll);
    check('Same-popup refresh keeps the panel in place', await page.evaluate(() => document.querySelector('#layer .sheet').getBoundingClientRect().y), focusedScroll.y);
    check('Keyboard focus stays on the fee control', await page.evaluate(() => [document.activeElement.dataset.a, document.activeElement.dataset.v]), ['dealForm', focusedScroll.value]);
    // Rapid phone taps must update once each and leave the control on screen.
    const before = await page.evaluate(() => UI.dealForm.fee);
    const fast = button('fee', '+');
    for (let i = 0; i < 5; i++) await fast.tap();
    check('Five rapid taps apply five fee increments', await page.evaluate(() => UI.dealForm.fee), before + 5000000);
    check('Deal sheet has no horizontal overflow', await page.evaluate(() => { const s = document.querySelector('#layer .sheet'); return s.scrollWidth <= s.clientWidth + 1; }), true);
    await page.screenshot({ path: '/tmp/futbol-transfer-controls.png', animations: 'disabled' });
    // A late AI response redraws the same deal; it must preserve the draft and viewport.
    const draft = await page.evaluate(() => ({ ...UI.dealForm, scroll: document.querySelector('#layer .sheet').scrollTop }));
    await page.evaluate(id => reopen('deal:' + id)(), dealId);
    check('Late AI refresh retains fee, wage and approach', await page.evaluate(() => ({ ...UI.dealForm, scroll: document.querySelector('#layer .sheet').scrollTop })), draft);
    await page.locator('#layer [data-a="player"]').last().click();
    check('Related player opens a different popup', (await state()).popup.startsWith('player:'), true);
    await appBack();
    check('Back restores the deal popup', (await state()).popup, 'deal:' + dealId);
    check('Back retains the edited fee limit', await page.evaluate(() => UI.dealForm.fee), draft.fee);
    // Minimums clamp without negative fees or wages below £300.
    await act('dealForm', { k: 'fee', v: -1e12 });
    await act('dealForm', { k: 'wage', v: -1e12 });
    check('Fee and wage minimums remain enforced', await page.evaluate(() => [UI.dealForm.fee, UI.dealForm.wage]), [0, 300]);
    await act('go', { s: 'squad' });
    const pid = await page.evaluate(() => seniorSquad(G.club)[0].id);
    await act('contract', { id: pid, mode: 'renew' });
    await page.evaluate(() => { UI.con.wage = 10000; delete UI.con.wageStep; contractSheet(UI.con.pid, 0, 'renew'); });
    await page.locator('[data-a="wStep"]').nth(1).click();
    await page.locator('[data-a="wStep"]').nth(2).click();
    check('Contract wage steps stay reversible across thresholds', await page.evaluate(() => UI.con.wage), 10000);
    check('Contract wage amount is exact', await page.locator('.stepper b').innerText(), '£10,000/w');
    // Public UI-only refresh must not spend money or advance time.
    const world = await page.evaluate(() => JSON.stringify([G.fin, G.week, G.day, G.players[UI.con.pid].con]));
    await act('wStep', { v: 1000 });
    check('Editing terms does not change finances, game time or contracts', await page.evaluate(() => JSON.stringify([G.fin, G.week, G.day, G.players[UI.con.pid].con])), world);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
