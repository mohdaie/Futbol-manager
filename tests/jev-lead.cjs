// Mocked contract tests for the Jev-led decision loop (no real provider: replies below are synthetic).
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createEngineQaRuntime } = require('../scripts/engine-qa-runtime.cjs');
const checks = [];
const check = (name, ok) => { assert.ok(ok, name); checks.push(name); };
const SRC = fs.readFileSync(path.join(__dirname, '../js/systems/jev-lead.js'), 'utf8');
function service(reply) {
  const calls = [], rt = createEngineQaRuntime(async (url, opts) => {
    const body = JSON.parse(opts.body); calls.push(body);
    if (reply === 'fail') return new Response('{"error":"unavailable"}', { status: 503 });
    return new Response(JSON.stringify({ answers: reply(body), usage: { input_tokens: 120 } }));
  });
  vm.runInContext(SRC, rt.ctx, { filename: 'jev-lead.js' });
  if (reply) rt.run("Object.assign(aiCfg().jev,{on:true,mode:'proxy',proxy:'https://qa.test',budget:1,feat:{engine:true}})");
  return { ...rt, calls };
}
const decision = { id: 'flow-press-escape', kind: 'decision', question: 'Which defect do we fix first?', evidence: { isolatedPressPct: 34, freeRunnerPerMatch: 6.1 },
  options: { press_cover: { summary: 'Fix isolated pressers' }, runner_handoff: { summary: 'Fix free runners' } }, recommendation: 'press_cover',
  criteria: { isolated: 'Isolated presses below 15%', finite: 'All matches finish with finite positions' } };
const acceptance = { id: 'flow-press-escape-accept', kind: 'acceptance', question: 'Accept the press-cover change?', decision: { choice: 'press_cover' },
  criteria: { isolated: 'Isolated presses below 15%' }, evidence: { before: { isolatedPressPct: 34 }, after: { isolatedPressPct: 12, checks: { suites: { pass: true } } } } };
const ask = (rt, p) => { rt.ctx.P = p; return rt.run('jevLead(P, { mocked: true })'); };
(async () => {
  const pick = (choice, conf = .9, crit = 'require') => body => Object.fromEntries(Object.keys(body.questions).map(k => [k, { choice: k === 'decision' || k === 'verdict' ? choice : crit, confidence: conf }]));
  const off = service(null);
  const r0 = await ask(off, decision);
  check('No connection: decision is PENDING, never a silent local fallback', r0.status === 'pending' && !r0.choice);
  const bad = await ask(off, { ...decision, options: { only: { summary: 'x' } } });
  check('Malformed proposal is rejected before any request', bad.status === 'invalid-proposal' && bad.problems.length > 0);

  const ok = service(pick('runner_handoff'));
  const r1 = await ask(ok, decision);
  check('One request with choice questions for the decision and every criterion', ok.calls.length === 1 && ok.calls[0].questions.decision.type === 'choice' && ok.calls[0].questions.criterion_1.type === 'choice');
  check('Jev decides, even against the developer recommendation', r1.status === 'decided' && r1.choice === 'runner_handoff' && r1.followedRecommendation === false);
  check('Jev sets the acceptance criteria', r1.required.length === 2 && r1.criteria.isolated.verdict === 'require');
  check('Owner rules travel with every request', ok.calls[0].state.ownerRules.some(x => x.includes('win rates')));
  check('Mocked replies are labelled as mocked', r1.source === 'mocked' && r1.mocked === true);

  const low = await ask(service(pick('press_cover', .4)), decision);
  check('Low confidence leaves the decision pending with the reason', low.status === 'pending' && /low confidence/.test(low.reason));
  const unlisted = await ask(service(pick('rewrite_engine')), decision);
  check('Unlisted option is pending, not adopted', unlisted.status === 'pending' && !unlisted.choice);
  const fail = await ask(service('fail'), decision);
  check('Provider failure is pending', fail.status === 'pending' && /failed/.test(fail.reason));
  const partial = await ask(service(body => ({ decision: { choice: 'press_cover', confidence: .9 } })), decision);
  check('Unsettled criteria keep the decision pending', partial.status === 'pending' && /criterion/.test(partial.reason));

  const acc = await ask(service(pick('accept')), acceptance);
  check('Acceptance verdict recorded', acc.status === 'decided' && acc.verdict === 'accept' && acc.decision === 'press_cover');
  const failing = { ...acceptance, evidence: { ...acceptance.evidence, after: { ...acceptance.evidence.after, checks: { suites: { pass: false } } } } };
  const conflict = await ask(service(pick('accept')), failing);
  check('Accepting with failing checks is a conflict, not an acceptance', conflict.status === 'conflict');
  const revise = await ask(service(pick('revise')), failing);
  check('Revise with failing checks is recorded normally', revise.status === 'decided' && revise.verdict === 'revise');
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
