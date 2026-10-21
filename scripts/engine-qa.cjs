// node scripts/engine-qa.cjs [--matches 24] [--baseline-intent] [--jev].
// The optional credential stays in Node.
// Set JEV_API_KEY or TYPESAFE_API_KEY in the environment for a genuine AI review.
const { createEngineQaRuntime } = require('./engine-qa-runtime.cjs');
(async () => {
  const wantsJev = process.argv.includes('--jev'), key = process.env.JEV_API_KEY || process.env.TYPESAFE_API_KEY;
  const at = process.argv.indexOf('--matches'), matches = at < 0 ? 0 : Number(process.argv[at + 1]);
  if (at >= 0 && (!Number.isInteger(matches) || matches < 1 || matches > 40)) throw new Error('--matches requires an integer from 1 to 40');
  const baseline = process.argv.includes('--baseline-intent');
  if (baseline && !matches) throw new Error('--baseline-intent requires --matches');
  const fetcher = async (url, opts) => {
    // The VM carries no real credential; only the requested official Jev endpoint
    // receives the environment key. No browser storage or relay origin bypass.
    if (url !== 'https://api.typesafe.ai/v1/systemone') throw new Error('Unexpected AI endpoint');
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: 'Bearer ' + key } });
  };
  const runtime = matches ? require('./match-qa-runtime.cjs').createMatchQaRuntime(20261021, fetcher) : createEngineQaRuntime(fetcher);
  const report = runtime.run('engineAudit()');
  if (matches) report.match = runtime.run('matchQaBatch(' + matches + ',' + baseline + ')');
  if (wantsJev && key) {
    runtime.run("Object.assign(aiCfg().jev, {on:true,mode:'direct',key:'environment-credential',feat:{engine:true}})");
    runtime.ctx.reportForReview = report;
    report.review = await runtime.run('reviewEngineAudit(reportForReview)');
  } else if (wantsJev) report.review = { source: 'local', status: 'No environment Jev key; local checks ran without an AI request.' };
  console.log(JSON.stringify(report, null, 2));
  // Known spacing failures remain visible; a release gate should use --strict.
  if (process.argv.includes('--strict') && (report.failed || report.match && (!report.match.finished || !report.match.finite || report.match.defensiveViolations > 0))) process.exitCode = 1;
  else if (wantsJev && report.review?.source !== 'jev' && report.review?.providerReview?.source !== 'jev') process.exitCode = 2;
})().catch(e => { console.error(String(e.message)); process.exitCode = 1; });
