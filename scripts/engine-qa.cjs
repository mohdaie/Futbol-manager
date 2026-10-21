// node scripts/engine-qa.cjs [--jev]. The optional credential stays in Node.
// Set JEV_API_KEY or TYPESAFE_API_KEY in the environment for a genuine AI review.
const { createEngineQaRuntime } = require('./engine-qa-runtime.cjs');
(async () => {
  const wantsJev = process.argv.includes('--jev'), key = process.env.JEV_API_KEY || process.env.TYPESAFE_API_KEY;
  const runtime = createEngineQaRuntime(async (url, opts) => {
    // The VM carries no real credential; only the requested official Jev endpoint
    // receives the environment key. No browser storage or relay origin bypass.
    if (url !== 'https://api.typesafe.ai/v1/systemone') throw new Error('Unexpected AI endpoint');
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: 'Bearer ' + key } });
  });
  const report = runtime.run('engineAudit()');
  if (wantsJev && key) {
    runtime.run("Object.assign(aiCfg().jev, {on:true,mode:'direct',key:'environment-credential',feat:{engine:true}})");
    runtime.ctx.reportForReview = report;
    report.review = await runtime.run('reviewEngineAudit(reportForReview)');
  } else if (wantsJev) report.review = { source: 'local', status: 'No environment Jev key; local checks ran without an AI request.' };
  console.log(JSON.stringify(report, null, 2));
  // Known spacing failures remain visible; a release gate should use --strict.
  if (process.argv.includes('--strict') && report.failed) process.exitCode = 1;
  else if (wantsJev && report.review?.source !== 'jev') process.exitCode = 2;
})().catch(e => { console.error(String(e.message)); process.exitCode = 1; });
