// Focused mobile navigation checks: node tests/links.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = require('node:http').createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  const check = (n, a, b) => { assert.deepEqual(a, b, n); checks.push(n); };
  const act = (a, ds = {}) => page.evaluate(({ a, ds }) => viewAction(() => ACT[a](ds)), { a, ds });
  const back = async () => { await act('back'); await page.waitForTimeout(100); };
  const layout = async name => {
    check(name + ' fits 390px', await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
    check(name + ' has no nested controls', await page.locator('button button, button a').count(), 0);
  };
  try {
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    const info = await page.evaluate(() => {
      const p = seniorSquad('CIT')[0], ours = seniorSquad(G.club)[0];
      addNews('transfer', 'An offer for ' + fullName(p), `${pname(p)} of ${clubName(p.club)} is available.`, { t: 'player', pid: p.id });
      return { pid: p.id, ours: ours.id, cid: p.club, news: G.news[0].id, name: fullName(p) };
    });
    await act('go', { s: 'news' }); await act('news', { id: info.news });
    check('News body has a direct player link', await page.locator('.body [data-a="player"]').count(), 1);
    check('News body has a direct club link', await page.locator('.body [data-a="clubPage"]').count(), 1);
    check('News has a related player button', await page.locator('.related-actions [data-a="player"]').count(), 1);
    await layout('News'); await page.screenshot({ path: '/tmp/futbol-linked-news.png', animations: 'disabled' });
    await page.locator('.body [data-a="player"]').click();
    check('News opens correct player', await page.evaluate(() => UI.popup.key), 'player:' + info.pid);
    await page.locator('.pclub [data-a="clubPage"]').first().click();
    check('Profile opens correct opposition club', await page.evaluate(() => [UI.s, UI.p.cid]), ['clubview', info.cid]);
    check('Opposition dashboard has season data', await page.getByText('W / D / L', { exact: true }).count(), 1);
    await layout('Club dashboard'); await page.screenshot({ path: '/tmp/futbol-opposition-dashboard.png' });
    await back(); check('Back returns to player profile', await page.evaluate(() => UI.popup.key), 'player:' + info.pid);
    await back(); check('Back returns to original news', await page.evaluate(() => UI.popup.key), 'news:' + info.news);
    await page.locator('.related-actions [data-a="trackPlayer"]').click();
    check('Shortlist action opens shortlist tab', await page.evaluate(() => [UI.s, UI.tab.tr]), ['transfers', 'short']);
    check('Shortlist action persists player', await page.evaluate(async id => { await SaveStorage.flush(); return (await SaveStorage.request('load')).shortlist.includes(id); }, info.pid), true);
    await act('trackPlayer', { id: info.pid });
    check('Repeated shortlist action never duplicates player', await page.evaluate(id => G.shortlist.filter(x => x === id).length, info.pid), 1);
    await page.locator('.linked-prow [data-a="clubPage"]').first().click();
    check('Player row badge opens player club', await page.evaluate(() => UI.p.cid), info.cid);
    await act('clubPage', { id: info.cid, section: 'squad' });
    check('Opposition first team is browsable', await page.locator('.player-main').count(), await page.evaluate(id => seniorSquad(id).length, info.cid));
    await page.locator('[data-a="clubLevel"][data-level="Y"]').click();
    check('Opposition youth squad is browsable', await page.locator('.player-main').count(), 20);
    await layout('Club squad');
    await page.reload();
    await page.waitForFunction(() => !!G);
    check('Refresh restores opposition club and squad level', await page.evaluate(() => [UI.s, UI.p.cid, UI.p.level]), ['clubview', info.cid, 'Y']);
    await act('go', { s: 'clubs' });
    check('Directory includes every world club and free agents', await page.locator('.main .row[data-a="clubPage"]').count(), await page.evaluate(() => Object.keys(G.clubs).length));
    await act('clubPage', { id: 'F0' });
    check('Overseas dashboard explains its inactive league and transfer availability', await page.getByText(/This league is inactive.*can play friendlies.*players can be transferred/).count(), 1);
    await act('clubPage', { id: 'F0', section: 'squad' });
    check('Overseas squad contains players', await page.locator('.player-main').count() > 10, true);
    await act('clubPage', { id: 'FA' }); await layout('Free agents');
    await act('clubPage', { id: 'missing' });
    check('Unknown club leaves current page intact', await page.evaluate(() => UI.p.cid), 'FA');
    await act('go', { s: 'table' });
    await page.locator('.tc .entity-link[data-a="clubPage"][data-id="CIT"]').click();
    check('League table club opens dashboard', await page.evaluate(() => UI.p.cid), 'CIT');
    await act('go', { s: 'fixtures' });
    await page.locator('.main [data-a="fixturePage"]').first().click();
    check('Future fixture opens a preview', await page.getByText('Match preview', { exact: true }).count(), 1);
    check('Fixture preview offers both club pages', await page.locator('#layer .btns [data-a="clubPage"]').count(), 2);
    await act('relatedPage', { s: 'transfers', key: 'tr', tab: 'search' });
    await page.locator('#sName').fill(info.name);
    check('Player search input remains editable', await page.locator('#sName').inputValue(), info.name);
    await act('go', { s: 'tactics' });
    const xi = await page.evaluate(() => JSON.stringify(G.tactics.slots));
    await act('slot', { i: 0 });
    check('Selection list offers separate player profiles', await page.locator('.choice-row [data-a="player"]').count() >= 20, true);
    await page.locator('.choice-row [data-a="player"]').first().click();
    check('Viewing a selection candidate does not change the lineup', await page.evaluate(() => JSON.stringify(G.tactics.slots)), xi);
    await back();
    check('Back restores selection list', await page.evaluate(() => UI.popup.key), 'slot:0');
    await act('go', { s: 'transfers' });
    await page.evaluate(({ pid, cid }) => {
      G.tHist.unshift({ pid, name: fullName(G.players[pid]), from: cid, to: G.club, fee: 1e6, date: today().getTime() });
      UI.tab.tr = 'hist'; render();
    }, info);
    check('Transfer history has exact player link', await page.locator('.tx [data-a="player"]').count(), 1);
    check('Transfer history links both clubs', await page.locator('.tx [data-a="clubPage"]').count(), 2);
    // Generic duplicate-name text must not open a wrong or ambiguous profile.
    const duplicate = await page.evaluate(({ pid, ours }) => {
      G.players[ours].fn = G.players[pid].fn; G.players[ours].ln = G.players[pid].ln;
      render(); sheet('<p class="probe">' + esc(fullName(G.players[pid])) + '</p>');
      return fullName(G.players[pid]);
    }, info);
    check('Duplicate player-name text never opens an ambiguous chooser', await page.locator('.probe [data-a="entityChoose"]').count(), 0);
    check('Duplicate player-name text remains visible and unlinked', await page.locator('.probe').textContent(), duplicate);
    check('ID-backed player links still open the exact player among duplicates', await page.evaluate(pid => { sheet('<div class="probe">' + playerLink(pid, fullName(G.players[pid])) + '</div>'); return document.querySelector('.probe [data-a="player"]')?.dataset.id; }, info.pid), String(info.pid));
    await page.evaluate(() => { sheet('<p class="probe">&lt;img src=x onerror=alert(1)&gt; CitizensExtra / Citizens</p>'); });
    check('Plain text is not reinterpreted as HTML', await page.locator('.probe img').count(), 0);
    check('Names do not match inside a larger word', await page.locator('.probe [data-a="clubPage"]').count(), 1);
    await page.evaluate(() => { while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('instant');
    const fid = await page.evaluate(() => G.lastMatch);
    await act('go', { s: 'post', fid });
    await page.locator('[data-a="reportSide"][data-side="0"]').click();
    check('Home match ratings are browsable', await page.locator('.main .row[data-a="player"]').count() >= 11, true);
    await page.locator('[data-a="reportSide"][data-side="1"]').click();
    check('Away match ratings are browsable', await page.locator('.main .row[data-a="player"]').count() >= 11, true);
    await layout('Match report');
    const news = await page.evaluate(() => G.news.find(n => n.cat === 'match').id);
    await act('news', { id: news });
    check('Match news links its exact result', await page.locator('.related-actions [data-s="post"]').getAttribute('data-fid'), String(fid));
    await page.locator('.related-actions [data-s="post"]').click();
    check('Match report action reaches correct match', await page.evaluate(() => +UI.p.fid), fid);
    await page.evaluate(() => {
      const p = seniorSquad(G.club)[0]; addNews('club', fullName(p) + ' injured', 'An injury during training.', { t: 'player', pid: p.id }); ACT.news({ id: G.news[0].id });
    });
    check('Injury news links medical center', await page.locator('.related-actions [data-s="medical"]').count(), 1);
    check('Training news links training', await page.locator('.related-actions [data-s="training"]').count(), 1);
    const exactNewsPid = await page.evaluate(() => {
      const [target, ...sameDisplayName] = seniorSquad(G.club).slice(0, 8);
      target.fn = 'Jordan'; target.ln = 'Walker';
      ['Jamal', 'Jesse', 'Julian', 'Jude', 'James', 'Joel', 'Joseph'].forEach((fn, i) => { if (sameDisplayName[i]) { sameDisplayName[i].fn = fn; sameDisplayName[i].ln = 'Walker'; } });
      ENTITY_INDEX = null;
      const id = target.id;
      addNews('club', pname(target) + ' back in training', fullName(target) + ' has recovered from a groin strain.', { t: 'player', pid: id });
      ACT.news({ id: G.news[0].id }); return id;
    });
    check('News with an exact player action resolves an ambiguous abbreviated name to that player', await page.locator('.related-actions [data-a="player"]').count(), 1);
    check('The news player link uses the action player ID', await page.locator('.related-actions [data-a="player"]').getAttribute('data-id'), String(exactNewsPid));
    check('The exact player mentioned in news body links to its action player ID', await page.locator('#layer .body [data-a="player"]').getAttribute('data-id'), String(exactNewsPid));
    await page.evaluate(() => {
      const p = seniorSquad(G.club)[0]; addNews('inbox', 'Bid for ' + pname(p), `${clubName('CIT')} offered £1m for ${fullName(p)}.`, { t: 'bid', pid: p.id, from: 'CIT', fee: 1e6 }); ACT.news({ id: G.news[0].id });
    });
    check('Bid news keeps accept, counter and reject controls', await page.locator('#layer [data-a="bid"]').count(), 3);
    check('Bid news links the bidding club', await page.locator('.related-actions [data-a="clubPage"][data-id="CIT"]').count(), 1);
    const scan = await page.evaluate(() => {
      const bad = [];
      for (const s of ['home','news','team','squad','tactics','pinstr','fixtures','table','stats','training','medical','youth','staff','staffroom','transfers','finance','board','club','clubs','gamestatus','settings']) {
        go(s);
        for (const el of document.querySelectorAll('#app [data-a]')) {
          if (!ACT[el.dataset.a]) bad.push(s + ':' + el.dataset.a);
          if (el.dataset.a === 'go' && !SCREENS[el.dataset.s]) bad.push(s + ':screen:' + el.dataset.s);
        }
        if (document.documentElement.scrollWidth > 390) bad.push(s + ':overflow');
      }
      return bad;
    });
    check('All main screens have valid action targets and fit mobile', scan, []);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
