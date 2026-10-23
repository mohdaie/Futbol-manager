'use strict';
/* Match Analysis Officer: an opt-in, read-only DeepSeek review for the Admin page. */
const MATCH_ANALYST_RAW = 'https://raw.githubusercontent.com/mohdaie/Futbol-manager/main/';
const MATCH_ANALYST_REFERENCES = [
  ['IFAB Laws of the Game', 'https://www.theifab.com/laws/latest/'],
  ['FIFA Training Centre', 'https://www.fifatrainingcentre.com/'],
  ['StatsBomb open data and analysis', 'https://github.com/statsbomb/open-data'],
  ['Football Manager match engine', 'https://www.footballmanager.com/features'],
];
const MATCH_ANALYST_CORE = ['js/engine/match.js', 'js/engine/sim.js', 'js/engine/live.js'];
const MATCH_ANALYST_SOURCE_LIMIT = 260000;

function matchAnalystFixtures() {
  return (G.fixtures || []).filter(f => played(f) && f.stats && (f.h === G.club || f.a === G.club))
    .sort((a, b) => fxDate(b) - fxDate(a));
}
function matchAnalystLabel(f) {
  const date = fmtDate(f.date || fxDate(f), false);
  return `${date} · ${clubName(f.h)} ${f.hg}-${f.ag} ${clubName(f.a)}`;
}
function matchAnalystSnapshot(f) {
  const teams = [f.h, f.a], stats = (f.stats || []).map((s, i) => ({
    club: clubName(teams[i]), goals: i ? f.ag : f.hg, possessionPct: s.pos,
    shots: s.sh, onTarget: s.sot, xG: s.xg, passes: s.pa, completedPasses: s.pc,
    crosses: s.cr, corners: s.co, fouls: s.fo, offsides: s.off, yellows: s.yc, reds: s.rc,
  }));
  const players = (f.ratings || []).map((rows, side) => rows.map(([id, rating]) => {
    const p = G.players[id], ps = (f.pstats?.[side] || []).find(x => x[0] === id);
    return p ? { player: fullName(p), position: p.pos, rating, stats: ps ? {
      passes: `${ps[1]}/${ps[2]}`, keyPasses: ps[3], dribblesWon: ps[4], tackles: ps[5], interceptions: ps[6],
      aerialsWon: ps[7], shots: ps[8], shotsOnTarget: ps[9], saves: p.pos === 'GK' ? p.st.sv : undefined,
    } : undefined } : null;
  }).map(x => x).filter(Boolean));
  const tactics = (f.engineTactics || []).map(t => ({ ...t, club: clubName(t.club), startingXI: t.startingXI.map(id => G.players[id] ? fullName(G.players[id]) : 'Unknown') }));
  const timeline = (f.timeline || []).map(e => {
    const out = { minute: e.min, second: e.tt, event: e.t, side: e.side == null ? null : clubName(teams[e.side]) };
    if (e.pid != null && G.players[e.pid]) out.player = fullName(G.players[e.pid]);
    if (e.aid != null && G.players[e.aid]) out.assist = fullName(G.players[e.aid]);
    if (e.out != null && G.players[e.out]) out.substitutedOff = fullName(G.players[e.out]);
    ['xg', 'pen', 'sp', 'volley', 'ck', 'fk', 'key', 'inj', 'wk', 'second', 'aim', 'over', 'block', 'line'].forEach(k => { if (e[k] != null) out[k] = e[k]; });
    return out;
  });
  return {
    fixture: { date: fmtDate(f.date || fxDate(f)), competition: leagueName(f.comp || leagueOf(f.h)), home: clubName(f.h), away: clubName(f.a), score: `${f.hg}-${f.ag}`, weather: f.wx?.k || null },
    coordinateGuide: 'Trace rows are [seconds, ballX, ballY, ballHeight, possessionSide, possessionSlot, then x,y for each of 11 home slots followed by 11 away slots]. Pitch is 68m wide (x 0–68) and 105m long (y 0–105). Samples are one minute apart. Slot player names are in the starting XI; substitutions are in the event timeline.',
    stats, tactics, playerRatingsAndStats: players, goals: (f.goals || []).map(([side, minute, id, pen]) => ({ side: clubName(teams[side]), minute, scorer: G.players[id] ? fullName(G.players[id]) : 'Unknown', penalty: !!pen })),
    actionTimeline: timeline, twoDPositionTrace: f.trace || null,
    missing: { trace: !f.trace, timeline: !f.timeline, tactics: !f.engineTactics },
  };
}
async function matchAnalystFetch(path) {
  const safe = String(path || '').replace(/^\/+/, '');
  if (!/^(js|scripts)\/[a-zA-Z0-9_./-]+\.js$/.test(safe) && !/^docs\/[a-zA-Z0-9_./-]+\.md$/.test(safe)) throw new Error('Invalid source path requested.');
  const r = await fetch(MATCH_ANALYST_RAW + safe, { cache: 'force-cache' });
  if (!r.ok) throw new Error(`Could not load ${safe} (${r.status}).`);
  return r.text();
}
async function matchAnalystFiles() {
  if (ADM.matchAnalystIndex) return ADM.matchAnalystIndex;
  const raw = await matchAnalystFetch('docs/match-analysis-js.json'), paths = JSON.parse(raw);
  if (!Array.isArray(paths) || !paths.length || paths.some(p => !/^(js|scripts)\/[a-zA-Z0-9_./-]+\.js$/.test(p))) throw new Error('The JavaScript source index is invalid.');
  ADM.matchAnalystIndex = paths;
  return paths;
}
function matchAnalystDigest(snapshot) {
  return JSON.stringify({ fixture: snapshot.fixture, stats: snapshot.stats, goals: snapshot.goals, timeline: snapshot.actionTimeline, traceSamples: snapshot.twoDPositionTrace?.length || 0, missing: snapshot.missing });
}
function matchAnalystPlanParse(text) {
  const body = String(text || '').replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try { return JSON.parse(body); } catch (_) { return {}; }
}
async function matchAnalystSourcePack(snapshot, paths) {
  const index = await matchAnalystFiles(), allowed = new Set(index);
  const catalog = index.map(p => p).join('\n');
  const planner = await dsChat([
    { role: 'system', content: 'You select source files for a football match engine audit. From the supplied complete JavaScript path catalogue, return JSON only: {"files":["path",...]} with at most 6 paths. Select the source files whose actual implementation must be inspected to assess this match, its 2D trace and statistics. Prefer engine and match-analysis implementation. Never invent paths.' },
    { role: 'user', content: `Match evidence:\n${matchAnalystDigest(snapshot)}\n\nComplete JavaScript source catalogue (${index.length} files):\n${catalog}` },
  ], 'Match analysis source selection', { maxTokens: 350, json: true });
  const requested = matchAnalystPlanParse(planner.text).files;
  const pathsToRead = [...new Set([...MATCH_ANALYST_CORE, ...(Array.isArray(requested) ? requested.filter(p => allowed.has(p)) : [])])].slice(0, 9);
  let total = 0; const files = [];
  for (const path of pathsToRead) {
    const source = await matchAnalystFetch(path);
    if (total + source.length > MATCH_ANALYST_SOURCE_LIMIT) continue;
    total += source.length; files.push({ path, source });
  }
  const [rulebook, enginePlan, qaGuide] = await Promise.all([
    matchAnalystFetch('docs/FOOTBALL_RULEBOOK.md'), matchAnalystFetch('docs/MATCH_ENGINE_PLAN.md'), matchAnalystFetch('docs/ENGINE_QA.md'),
  ]);
  return { index, files, rulebook, enginePlan, qaGuide, selectorModel: planner.model };
}
function matchAnalystSystem(pack) {
  const refs = MATCH_ANALYST_REFERENCES.map(([n, u]) => `${n}: ${u}`).join('\n');
  const code = pack.files.map(f => `\n===== ${f.path} (complete file) =====\n${f.source}`).join('\n');
  return `You are the club's independent Match Analysis Officer. Review the supplied match facts, 2D position trace, action timeline, player stats, the complete game rulebook, engine plan, QA guide, and complete source files selected from the full JavaScript code index (${pack.index.length} files total). Use exact evidence; separate observed problems from hypotheses and proposed fixes. Explain how each finding appears in the 2D, what metric supports it, which source file/function likely causes it, and a specific improvement that can be tested. Check both teams and the whole match, not only the user's club. Do not make changes or claim you ran tests.\n\nCompare the engine to real football and simulation practice: phase/role behavior, pitch spacing, passing and receiving, dribbling, duels, shooting and goalkeeping, set pieces, transitions, timing, xG and match-stat distributions. Treat the game's rulebook as its acceptance criteria; identify any target that is unrealistic or conflicts with the laws. Do not infer details absent from the trace. A missing trace means use the stats and event timeline and state that limitation.\n\nReal-world reference pointers (not fetched live for this report):\n${refs}\nDeepSeek API has no live web-search tool here. Do not claim to have browsed these pages or cite specific unseen claims to them. Use established football/simulation knowledge, give a URL as a follow-up source only when relevant, and flag uncertain or time-sensitive statements.\n\nReturn a concise, readable report with headings: Verdict; Evidence from this match; 2D and engine findings; Prioritized improvements (each with expected visual effect and a measurable test); Real-world comparison and sources. Do not give generic advice.\n\n===== COMPLETE RULEBOOK =====\n${pack.rulebook}\n\n===== MATCH ENGINE PLAN =====\n${pack.enginePlan}\n\n===== ENGINE QA GUIDE =====\n${pack.qaGuide}\n\n===== SOURCE FILES SELECTED FROM THE FULL INDEX =====\n${code}`;
}
function matchAnalystPanel() {
  const matches = matchAnalystFixtures(), chosen = matches.find(f => f.id === +(ADM.matchAnalystFid ?? G.lastMatch)) || matches[0];
  const report = chosen && (G.matchAnalyses || []).find(r => r.fid === chosen.id);
  const job = ADM.matchAnalystJob, ready = aiReady('ds', 'match');
  if (!matches.length) return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">No completed match reports for your club yet. The officer can review your matches after the next full-time whistle.</p></div>`;
  const choices = matches.slice(0, 24).map(f => [f.id, matchAnalystLabel(f)]);
  const missingTrace = chosen && !chosen.trace;
  return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">DeepSeek reviews your 2D pitch trace, event sequence, tactics and match statistics against the full game rulebook and JavaScript source index. It reads the core simulation files plus relevant files selected from the complete source index for each review. Your match and game are never changed.</p>
      ${fld('Your match', selectHtml('maFixture', choices, chosen.id, 'matchAnalystFixture'))}
      <p class="note">${missingTrace ? 'This match is from before position-trace capture. The officer can still inspect its stats and event timeline.' : 'For new matches, the saved 2D trace samples ball and player positions once per minute.'} Each review makes two DeepSeek calls: source selection and analysis. Cost depends on the selected model and your budget setting.</p>
      <div class="btns"><button class="btn pri" data-a="matchAnalystRun" ${job?.busy ? 'disabled' : ready ? '' : 'disabled'}>${job?.busy ? esc(job.phase) : 'Analyze match'}</button><button class="btn" data-a="tab" data-key="adm" data-v="ds">DeepSeek settings</button></div>
      ${!ready ? '<p class="muted">Enable DeepSeek, save your key/connection, and turn on “Match analysis officer” in DeepSeek settings.</p>' : ''}
      ${job?.error ? `<p class="bad">${esc(job.error)}</p>` : ''}</div>
    ${report ? `<div class="card"><h3>Officer's report <small>${esc(report.model || '')} · ${fmtDate(report.at)}</small></h3><p class="muted">Reviewed ${report.sourceCount} source files from the ${report.indexCount}-file JavaScript index · ${report.tracePoints} 2D samples.</p><div class="match-analysis-text">${esc(report.text)}</div></div>` : ''}
    <div class="card"><h3>Reference library</h3><div class="list">${MATCH_ANALYST_REFERENCES.map(([n, u]) => `<div class="row"><span class="grow"><b>${esc(n)}</b><small>${esc(u)}</small></span><a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener">Open</a></div>`).join('')}</div><p class="muted">These links are provided for follow-up. DeepSeek's API cannot browse them during analysis, so reports do not pretend to have live-searched the web.</p></div>`;
}
ADMIN_TABS.match = matchAnalystPanel;
CHG.matchAnalystFixture = v => { ADM.matchAnalystFid = +v; render(); };
ACT.matchAnalystRun = async () => {
  const fx = matchAnalystFixtures().find(f => f.id === +(document.getElementById('maFixture')?.value || ADM.matchAnalystFid || G.lastMatch));
  if (!fx) return toast('Choose a completed match first.');
  if (!aiReady('ds', 'match')) return toast('Enable DeepSeek and Match analysis officer in Admin settings first.');
  ADM.matchAnalystFid = fx.id; ADM.matchAnalystJob = { busy: true, phase: 'Preparing match and rulebook…' }; render();
  try {
    const snapshot = matchAnalystSnapshot(fx);
    ADM.matchAnalystJob.phase = 'Selecting source code…'; render();
    const pack = await matchAnalystSourcePack(snapshot, []);
    ADM.matchAnalystJob.phase = 'Comparing match, rulebook and engine code…'; render();
    const result = await dsChat([
      { role: 'system', content: matchAnalystSystem(pack) },
      { role: 'user', content: `Analyze this completed match using the evidence and exact coordinate guide. Do not infer that a sparse minute sample proves movement between samples.\n\n${JSON.stringify(snapshot)}` },
    ], 'Match analysis officer', { maxTokens: 2200 });
    const history = G.matchAnalyses || [];
    G.matchAnalyses = [{ fid: fx.id, at: Date.now(), model: result.model || aiCfg().ds.model, text: result.text, sourceCount: pack.files.length, indexCount: pack.index.length, tracePoints: fx.trace?.length || 0 }, ...history.filter(x => x.fid !== fx.id)].slice(0, 40);
    saveGame(); ADM.matchAnalystJob = null; toast('Match analysis complete.');
  } catch (e) {
    ADM.matchAnalystJob = { error: e.message || 'The match analysis could not finish.' };
  }
  if (UI.s === 'admin') render();
};
