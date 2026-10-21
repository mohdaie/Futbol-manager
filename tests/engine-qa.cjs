const assert = require('node:assert/strict');
const { createEngineQaRuntime } = require('../scripts/engine-qa-runtime.cjs');
const checks = [];
const check = (name, ok) => { assert.ok(ok, name); checks.push(name); };
const configure = rt => rt.run("Object.assign(aiCfg().jev,{on:true,mode:'proxy',proxy:'https://qa.test',budget:1,feat:{engine:true}})");
function service(mode = 'ok') {
  const calls = [], rt = createEngineQaRuntime(async (url, opts) => {
    const body = JSON.parse(opts.body); calls.push({ url, body });
    if (mode === 'fail') return new Response('{"error":"unavailable"}', { status: 503 });
    return new Response(JSON.stringify({ answers: { priority: { choice: mode === 'bad' ? 'rewrite_everything' : Object.keys(body.questions.priority.criteria)[0], confidence: mode === 'low' ? .2 : .95 } }, usage: { input_tokens: 100 } }));
  });
  configure(rt); return { ...rt, calls };
}
(async () => {
  const base = createEngineQaRuntime(), report = base.run('engineAudit()');
  check('Fast audit covers over a thousand scenarios and three thousand assertions', report.scenarios > 1000 && report.checked > 3000);
  check('Current engine passes deterministic shape and job checks', report.failed === 0);
  check('Repeated audit has identical facts for caching', JSON.stringify(base.run('engineQaFacts(engineAudit())')) === JSON.stringify(base.run('engineQaFacts(engineAudit())')));
  const corrupt = base.run('engineAudit((...args)=>{const p=teamPlan(...args);p.positions[3]=[NaN,1];return p;})');
  check('Fault injection proves invalid coordinates are detected', corrupt.groups.shape.failed > 0);
  const cover = base.run('engineAudit((...args)=>{const p=teamPlan(...args);p.rest.back=[];return p;})');
  check('Fault injection proves insufficient cover is detected', cover.groups.cover.failed > 0);
  const local = await base.run('reviewEngineAudit(engineAudit())');
  check('Missing credentials leave an honest local result', local.source === 'local' && local.status.includes('unavailable'));

  const ok = service();
  const review = await ok.run('reviewEngineAudit(engineAudit())');
  check('Jev uses the real client and choice schema in one request', ok.calls.length === 1 && ok.calls[0].url.endsWith('/v1/systemone') && ok.calls[0].body.questions.priority.type === 'choice');
  check('Successful Jev review is labelled with accepted confidence', review.source === 'jev' && review.confidence === .95 && review.priority === 'match_regression');
  check('Jev receives bounded aggregate facts without career or credential data', JSON.stringify(ok.calls[0].body).length < 10000 && !JSON.stringify(ok.calls[0].body).includes('players') && !JSON.stringify(ok.calls[0].body).includes('Authorization'));
  const cached = await ok.run('reviewEngineAudit(engineAudit())');
  check('Repeated review reuses accepted answer without paying again', cached.cached && ok.calls.length === 1);
  check('AI usage accounts for engine-review requests', ok.run("aiUsage('jev').calls") === 1 && ok.run("aiCfg().log[0].note") === 'Engine QA review');
  ok.run('ENGINE_QA_CACHE=null;aiCfg().jev.feat.engine=false');
  const off = await ok.run('reviewEngineAudit(engineAudit())');
  check('Feature disabled prevents a new request', off.source === 'local' && ok.calls.length === 1);

  for (const mode of ['bad', 'low', 'fail']) {
    const rt = service(mode), r = await rt.run('reviewEngineAudit(engineAudit())');
    check(mode + ' response retains deterministic recommendation', r.source === 'local');
    check(mode + ' response never becomes a cached success', rt.run('ENGINE_QA_CACHE') === null);
    if (mode === 'low') check('A valid uncertain review is recorded without adopting the suggestion', r.providerReview?.source === 'jev' && r.providerReview.confidence === .2 && !r.providerReview.accepted);
  }
  const budget = service(); budget.run("aiUsage('jev').cost=1");
  const blocked = await budget.run('reviewEngineAudit(engineAudit())');
  check('Existing monthly budget prevents network request', budget.calls.length === 0 && blocked.status.includes('budget'));

  let release;
  const waiting = createEngineQaRuntime(async (url, opts) => {
    await new Promise(r => { release = r; });
    return new Response(JSON.stringify({ answers: { priority: { choice: 'match_regression', confidence: .9 } } }));
  });
  configure(waiting);
  const pending = waiting.run('reviewEngineAudit(engineAudit())');
  const duplicate = await waiting.run('reviewEngineAudit(engineAudit())');
  check('Concurrent reviews cannot start duplicate calls', duplicate.source === 'local' && duplicate.status.includes('running'));
  waiting.run('G={players:{},changed:true}'); release();
  const stale = await pending;
  check('A career change discards an in-flight answer', stale.source === 'local' && stale.status.includes('discarded') && waiting.run('ENGINE_QA_CACHE') === null);
  check('In-flight lock clears after all outcomes', waiting.run('ENGINE_QA_PENDING') === null);

  const failed = service();
  const result = await failed.run('reviewEngineAudit(engineAudit((...args)=>{const p=teamPlan(...args);p.positions[3]=[NaN,1];return p;}))');
  check('Jev can only select a group with measured failures', result.priority === 'shape');
  check('Jev cannot rewrite test verdicts', failed.calls[0].body.state.failed > 0 && result.failed == null);
  const cli = require('node:child_process').spawnSync(process.execPath, [require('node:path').resolve(__dirname, '../scripts/engine-qa.cjs'), '--jev', '--strict'], { encoding: 'utf8', env: { ...process.env, JEV_API_KEY: '', TYPESAFE_API_KEY: '' } });
  check('CLI cannot claim a successful Jev run without credentials', cli.status === 2 && JSON.parse(cli.stdout).review.source === 'local');
  const fs = require('node:fs'), path = require('node:path'), dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'engine-qa-'));
  try {
    const hook = path.join(dir, 'mock-provider.cjs');
    fs.writeFileSync(hook, `global.fetch=async()=>new Response(JSON.stringify({answers:{priority:{choice:'match_regression',confidence:.2}}}));`);
    const uncertain = require('node:child_process').spawnSync(process.execPath, ['--require', hook, path.resolve(__dirname, '../scripts/engine-qa.cjs'), '--jev', '--strict'], { encoding: 'utf8', env: { ...process.env, JEV_API_KEY: 'mock-test-credential', TYPESAFE_API_KEY: '' } });
    const review = JSON.parse(uncertain.stdout).review;
    check('CLI records a valid uncertain review without adopting it', uncertain.status === 0 && review.source === 'local' && review.providerReview?.confidence === .2 && !review.providerReview.accepted);
  } finally { fs.rmSync(dir, {recursive:true,force:true}); }
  console.log(JSON.stringify({ passed: checks.length, checks, scenarios: report.scenarios, assertions: report.checked, auditMs: report.ms, realProviderCalls: 0 }, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
