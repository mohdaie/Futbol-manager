// node scripts/jev-lead.cjs <proposal.json> [--out record.json]
// Sends one development proposal (decision or acceptance) to Jev and prints the decision record.
// Needs JEV_API_KEY in the environment (the GitHub Actions secret). Without it the record is PENDING.
// Exit codes: 0 decided, 3 pending/conflict, 1 invalid proposal or error.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createEngineQaRuntime } = require('./engine-qa-runtime.cjs');
(async () => {
  const file = process.argv[2], key = process.env.JEV_API_KEY || process.env.TYPESAFE_API_KEY;
  if (!file) throw new Error('usage: node scripts/jev-lead.cjs <proposal.json> [--out record.json]');
  const proposal = JSON.parse(fs.readFileSync(file, 'utf8'));
  const fetcher = async (url, opts) => {
    if (url !== 'https://api.typesafe.ai/v1/systemone') throw new Error('Unexpected AI endpoint');
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: 'Bearer ' + key } });
  };
  const rt = createEngineQaRuntime(fetcher);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/systems/jev-lead.js'), 'utf8'), rt.ctx, { filename: 'js/systems/jev-lead.js' });
  if (key) rt.run("Object.assign(aiCfg().jev, {on:true,mode:'direct',key:'environment-credential',feat:{engine:true}})");
  rt.ctx.proposalForJev = proposal;
  const record = await rt.run(`jevLead(proposalForJev, { run: ${JSON.stringify(process.env.GITHUB_RUN_ID || null)} })`);
  const out = JSON.stringify(record, null, 2);
  console.log('JEV_DECISION_RECORD ' + JSON.stringify(record));
  console.log(out);
  const at = process.argv.indexOf('--out');
  if (at > 0) fs.writeFileSync(process.argv[at + 1], out + '\n');
  process.exitCode = record.status === 'decided' ? 0 : record.status === 'invalid-proposal' ? 1 : 3;
})().catch(e => { console.error(String(e.message)); process.exitCode = 1; });
