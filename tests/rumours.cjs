// Run with Playwright installed: node tests/social.cjs [existing server URL]
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

    const seeded=await page.evaluate(()=>{
      G.social=[];G.rumours=[];G.worldAlerts=[];clearTimeout(WORLD_ALERT_TIMER);clearTimeout(WORLD_ALERT_EXIT_TIMER);WORLD_ALERT_TIMER=WORLD_ALERT_EXIT_TIMER=0;
      const p=Object.values(G.players).find(p=>G.clubs[p.club]?.pl&&p.club!==G.club),to=domesticClubs().find(id=>id!==G.club&&id!==p.club);
      const journalist=Object.values(MEDIA).find(a=>a.kind==='journalist'),clubs=[to,p.club];
      const source=post(journalist.id,`${clubName(to)} monitoring ${fullName(p)}: source test`,{kind:'rumour',pid:p.id,clubs});
      window.rumourSource=source.id;const sourceAlert=structuredClone(G.worldAlerts.find(a=>a.postId===source.id));
      for(let i=0;i<10;i++)post('whispers',`Additional rumour ${i}`,{kind:'rumour',pid:p.id,clubs});
      post('whispers','Non-rumour account update',{kind:'talks',pid:p.id,clubs});
      G.worldAlerts=[sourceAlert];go('home');
      return {id:source.id,text:source.txt};
    });
    check('A rumour notification identifies its source post',await page.locator('#world-alert .world-alert-story').getAttribute('aria-label').then(t=>t.includes('Open related source')),true);
    await page.locator('#world-alert .world-alert-story').click();
    check('Tapping the banner opens the exact source report',await page.locator('#layer').textContent().then(t=>t.includes(seeded.text)),true);
    check('Rumour source opens in Transfers > Rumours',await page.evaluate(()=>UI.s==='transfers'&&UI.tab.tr==='rumours'),true);
    await page.evaluate(()=>closeSheet(true));
    check('Transfers lists all retained rumours beyond the eight-story preview',await page.locator('.main .spost').count(),11);
    check('Journalist rumour remains visible in the rumour list',await page.locator(`.main .spost[data-id="${seeded.id}"]`).count(),1);
    await page.evaluate(()=>{UI.tab.nv='social';UI.tab.sf2='rumour';go('news');});
    check('Social Rumours uses story type across every account',await page.locator('.main .spost').count(),11);
    check('Non-rumour posts from rumour accounts are excluded',await page.locator('.main').textContent().then(t=>!t.includes('Non-rumour account update')),true);
    const archived=await page.evaluate(async()=>{
      for(let i=0;i<170;i++)post('whispers',`General post ${i}`);
      const trimmed=!G.social.some(p=>p.id===rumourSource);
      saveGame();await SaveStorage.flush();return trimmed;
    });
    check('General social feed can roll over independently',archived,true);
    await page.reload();
    // The host keeps the source ID across navigation; the in-page helper is intentionally transient.
    await page.waitForFunction(id=>G?.rumours?.some(p=>p.id===id),seeded.id);
    await page.evaluate(()=>{UI.tab.tr='rumours';go('transfers');});
    check('Banner source remains in rumours after feed rollover and reload',await page.locator(`.main .spost[data-id="${seeded.id}"]`).count(),1);
    await page.locator(`.main .spost[data-id="${seeded.id}"]`).click();
    check('Archived rumour opens its original report',await page.locator('#layer').textContent().then(t=>t.includes(seeded.text)),true);
    await page.evaluate(()=>{closeSheet(true);UI.tab.nv='tc';go('news');});
    check('Transfer centre has a link to the full rumour list',await page.locator('[data-a=transferRumours]').count(),1);
    await page.locator('[data-a=transferRumours]').click();
    check('View all opens the full transfer rumour list',await page.locator('.main .spost').count(),11);

    const migration=await page.evaluate(()=>{
      closeSheet(true);const sample=G.rumours[0];
      G.social=[sample];G.rumours=[{date:Math.floor(sample.date/864e5)*864e5,pid:sample.pid,txt:sample.txt,acc:sample.acc,to:sample.clubs[0],real:false}];ensureSocial();
      const deduped=G.rumours.length===1&&G.rumours[0].id===sample.id;
      G.social=[];G.rumours=[{date:today().getTime(),pid:sample.pid,txt:'Older saved rumour report',acc:sample.acc,to:sample.clubs[0],real:false}];ensureSocial();
      const id=G.rumours[0].id;ensureSocial();threadSheet(id);
      return {deduped,stable:G.rumours.length===1&&G.rumours[0].id===id};
    });
    check('Older saves merge duplicate stories and preserve stable archive IDs',migration,{deduped:true,stable:true});
    check('An older archive record opens its original text',await page.locator('#layer').textContent().then(t=>t.includes('Older saved rumour report')),true);
    await page.evaluate(()=>{closeSheet(true);clearTimeout(WORLD_ALERT_TIMER);clearTimeout(WORLD_ALERT_EXIT_TIMER);WORLD_ALERT_TIMER=WORLD_ALERT_EXIT_TIMER=0;G.worldAlerts=[];queueWorldAlert('RUMOUR · Dismiss test',{postId:G.rumours[0].id});go('home');});
    await page.setViewportSize({width:320,height:568});
    check('Source notification fits a small phone',await page.locator('#world-alert').evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.scrollWidth<=el.clientWidth),true);
    await page.locator('#world-alert .world-alert-close').click();await page.waitForFunction(()=>!G.worldAlerts.length);
    check('The separate close control dismisses without opening a story',await page.evaluate(()=>UI.s==='home'&&!UI.popup),true);
    check('No nested buttons or browser errors',await page.locator('button button,button a').count()===0&&errors.length===0,true);
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
