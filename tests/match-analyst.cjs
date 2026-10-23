const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const checks = [];
const ctx = vm.createContext({
  TextEncoder, ADMIN_TABS: {}, ACT: {}, CHG: {}, ADM: {},
  G: { players: { 1: { name: 'Home Keeper', pos: 'GK', st: { sv: 999 } }, 2: { name: 'Away Keeper', pos: 'GK', st: { sv: 888 } } } },
  fullName: p => p.name, clubName: c => c, fmtDate: () => '30 Aug 2026', fxDate: () => 0, leagueName: () => 'Premier League', leagueOf: () => 'PL',
  aiCfg: () => ({ ds: { mode: 'relay', model: 'deepseek-flash', thinking: false, temp: .3 } }), aiMeta: () => ({ f: 'audit', i: 'anonymous-installation' }),
  fetch: async url => ({ ok: true, text: async () => read(String(url).replace('https://raw.githubusercontent.com/mohdaie/Futbol-manager/main/', '')) }),
  dsChat: async () => ({ text: '{"files":["js/engine/defending.js","js/engine/pitch.js"]}' }),
});
vm.runInContext(read('js/systems/match-analyst.js'), ctx);

(async () => {
  const fx = { h: 'Home', a: 'Away', hg: 8, ag: 2, comp: 'PL', stats: [{ pos: 1991.5, sh: 17, sot: 8, xg: 2.87 }, { pos: 1811.5, sh: 13, sot: 4, xg: 1.03 }],
    ratings: [[[1, 8]], [[2, 3.7]]], pstats: [[[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]], [[2, 0, 0, 0, 0, 0, 0, 0, 0, 0]]],
    goals: [[0, 2, 1, false], [0, 89, 1, false]],
    timeline: Array.from({ length: 90 }, (_, i) => ({ min: i, t: i === 2 || i === 89 ? 'goal' : 'shot', pid: 1, side: 0 })),
    trace: Array.from({ length: 91 }, (_, i) => [i * 60, 34, 52, 0, 0, 1, ...Array(44).fill(20.5)]),
  };
  const snapshot = ctx.matchAnalystSnapshot(fx);
  assert.equal(snapshot.stats[0].possessionPct, 52.4);
  assert.equal(snapshot.stats[1].possessionPct, 47.6);
  checks.push('Possession seconds are normalized before labelling percentages');
  assert.equal(snapshot.playerRatingsAndStats[0][0][3][8], 3);
  assert.equal(snapshot.playerRatingsAndStats[1][0][3][8], null);
  checks.push('Match saves use fixture records; legacy saves remain unknown, never season totals');
  assert(snapshot.actionTimeline.some(e => e[0] === 2 && e[2] === 'goal'));
  assert(snapshot.actionTimeline.some(e => e[0] === 89 && e[2] === 'goal'));
  assert.equal(snapshot.actionTimeline.length, 36);
  assert.equal(snapshot.evidenceLimits.recordedEvents, 90);
  assert.equal(snapshot.evidenceLimits.timelineIsExcerpt, true);
  checks.push('Timeline samples span the match, preserve goals and disclose omitted events');
  assert(snapshot.coordinateGuide.includes('x=WIDTH'));
  assert(snapshot.coordinateGuide.includes('y=LENGTH'));
  checks.push('Pitch axes and attacking directions are explicit');
  const pack = await ctx.matchAnalystSourcePack(snapshot, []), fit = ctx.matchAnalystFitMessages(snapshot, pack);
  assert(fit.bytes <= 29000);
  assert.equal(snapshot.twoDPositionTrace.length, 24);
  checks.push('Real source/rulebook excerpts and fixture evidence fit the relay byte limit');
  const stress = { ...snapshot, coordinateGuide: 'A'.repeat(23000), twoDPositionTrace: [], actionTimeline: snapshot.actionTimeline.slice(0, 11), playerRatingsAndStats: [Array(100).fill('player'.repeat(50))] };
  const bounded = ctx.matchAnalystFitMessages(stress, pack);
  assert(bounded.bytes <= 29000);
  checks.push('Oversized evidence terminates safely with one player side and eleven events');
  const ai = vm.createContext({ performance, AbortController, setTimeout, clearTimeout,
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: true, text: async () => JSON.stringify({ choices: [{ message: { content: 'Incomplete' }, finish_reason: 'length' }] }) }),
  });
  vm.runInContext(read('js/systems/ai.js'), ai);
  vm.runInContext("aiCfg().ds.mode='proxy';aiCfg().ds.proxy='https://example.invalid';", ai);
  const response = await ai.dsChat([{ role: 'user', content: 'Review' }]);
  assert.equal(response.finishReason, 'length');
  checks.push('Provider truncation is exposed so incomplete reports can be labelled');
  console.log(JSON.stringify({ passed: checks.length, checks, requestBytes: fit.bytes }, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
