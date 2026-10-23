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
const MATCH_ANALYST_CORE_FUNCTIONS = {
  'js/engine/match.js': ['createMatchState', 'simMinute', 'quickSim', 'finishMatch'],
  'js/engine/sim.js': ['chanceAt', 'carrierDecide', 'kick', 'roundKeeper', 'shoot', 'shotArrives', 'crossBall', 'tryCrossVolley', 'receive', 'challenges', 'tickSim', 'recordFrame'],
  'js/engine/live.js': ['playMinuteView', 'setFrame', 'liveEvent', 'liveMark', 'shotPathPoint', 'draw'],
};
const MATCH_ANALYST_FUNCTION_LIMITS = {
  'js/engine/match.js': { createMatchState: 650, simMinute: 450, quickSim: 200, finishMatch: 850 },
  'js/engine/sim.js': { chanceAt: 350, carrierDecide: 850, kick: 500, roundKeeper: 380, shoot: 800, shotArrives: 520, crossBall: 400, tryCrossVolley: 350, receive: 350, challenges: 450, tickSim: 300, recordFrame: 300 },
  'js/engine/live.js': { playMinuteView: 300, setFrame: 500, liveEvent: 400, liveMark: 200, shotPathPoint: 250, draw: 450 },
};
const MATCH_ANALYST_RULE_HEADINGS = [/^## 1\./, /^## 1b\./, /^## 1c\./, /^## 2\./, /^## 3\./, /^## 4\./, /^## 5\./, /^## 7\./, /^## 8\./, /^## 11b\./];

function matchAnalystFixtures() {
  return (G.fixtures || []).filter(f => played(f) && f.stats && (f.h === G.club || f.a === G.club))
    .sort((a, b) => fxDate(b) - fxDate(a));
}
function matchAnalystLabel(f) {
  const date = fmtDate(f.date || fxDate(f), false);
  return `${date} · ${clubName(f.h)} ${f.hg}-${f.ag} ${clubName(f.a)}`;
}
function matchAnalystSnapshot(f) {
  const teams = [f.h, f.a], stats = (f.stats || []).map((s, i) => [
    clubName(teams[i]), i ? f.ag : f.hg, s.pos, s.sh, s.sot, s.xg, s.pa, s.pc, s.cr, s.co, s.fo, s.off, s.yc, s.rc,
  ]);
  const players = (f.ratings || []).map((rows, side) => rows.map(([id, rating]) => {
    const p = G.players[id], ps = (f.pstats?.[side] || []).find(x => x[0] === id);
    return p ? [fullName(p), p.pos, rating, ps ? [`${ps[1]}/${ps[2]}`, ps[3], ps[4], ps[5], ps[6], ps[7], ps[8], ps[9], p.pos === 'GK' ? p.st.sv : null] : null] : null;
  }).map(x => x).filter(Boolean));
  const tactics = (f.engineTactics || []).map(t => ({ ...t, club: clubName(t.club), startingXI: t.startingXI.map(id => G.players[id] ? fullName(G.players[id]) : 'Unknown') }));
  const timeline = (f.timeline || []).filter(e => /shot|goal|save|block|wide|miss|cross|corner|free|tackle|duel|offside|injur|card|sub|pen|foul|restart|volley|header/i.test(e.t || '')).slice(-36).map(e => {
    const extra = {};
    ['xg', 'pen', 'sp', 'volley', 'ck', 'fk', 'key', 'inj', 'wk', 'second', 'aim', 'over', 'block', 'line'].forEach(k => { if (e[k] != null) extra[k] = e[k]; });
    return [e.min, e.tt, e.t, e.side == null ? null : clubName(teams[e.side]), e.pid != null && G.players[e.pid] ? fullName(G.players[e.pid]) : null, e.aid != null && G.players[e.aid] ? fullName(G.players[e.aid]) : null, extra];
  });
  return {
    fixture: { date: fmtDate(f.date || fxDate(f)), competition: leagueName(f.comp || leagueOf(f.h)), home: clubName(f.h), away: clubName(f.a), score: `${f.hg}-${f.ag}`, weather: f.wx?.k || null },
    coordinateGuide: 'Stats rows: [club,goals,possession%,shots,onTarget,xG,passes,completed,crosses,corners,fouls,offsides,yellow,red]. Player rows: [name,position,rating,[passes, keyPasses, dribbles, tackles, interceptions, aerials, shots, onTarget, saves]]. Event rows: [minute,second,type,side,player,assist,flags]. Trace rows: [sec,ballX,ballY,height,possessionSide,possessionSlot, then x,y for 11 home slots and 11 away slots]; pitch 68×105m; samples are sparse and slot order starts with XI. Goal rows [side,minute,scorer,penalty].',
    stats, tactics, playerRatingsAndStats: players, goals: (f.goals || []).map(([side, minute, id, pen]) => [clubName(teams[side]), minute, G.players[id] ? fullName(G.players[id]) : 'Unknown', !!pen]),
    actionTimeline: timeline, twoDPositionTrace: f.trace ? f.trace.filter((_, i, a) => i === 0 || i === a.length - 1 || i % Math.max(1, Math.ceil(a.length / 24)) === 0) : null,
    missing: { trace: !f.trace, timeline: !f.timeline, tactics: !f.engineTactics },
  };
}
async function matchAnalystFetch(path) {
  const safe = String(path || '').replace(/^\/+/, '');
  const codePath = /^(js|scripts)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.js$/.test(safe);
  const docPath = /^docs\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.md$/.test(safe);
  const sourceIndex = safe === 'docs/match-analysis-js.json';
  if (!codePath && !docPath && !sourceIndex) throw new Error('Invalid source path requested.');
  const r = await fetch(MATCH_ANALYST_RAW + safe, { cache: 'force-cache' });
  if (!r.ok) throw new Error(`Could not load ${safe} (${r.status}).`);
  return r.text();
}
async function matchAnalystFiles() {
  if (ADM.matchAnalystIndex) return ADM.matchAnalystIndex;
  const raw = await matchAnalystFetch('docs/match-analysis-js.json'), paths = JSON.parse(raw);
  if (!Array.isArray(paths) || !paths.length || paths.some(p => !/^(js|scripts)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.js$/.test(p))) throw new Error('The JavaScript source index is invalid.');
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
function matchAnalystTrim(text, max) {
  if (text.length <= max) return text;
  const head = Math.floor(max * 0.48), tail = Math.floor(max * 0.22), rest = text.slice(head, text.length - tail);
  const terms = /(?:shot|pass|ball|keeper|save|press|tackle|duel|cross|corner|free kick|offside|flight|receive|recordFrame|goal|trace)/ig;
  const snippets = []; let m;
  while ((m = terms.exec(rest)) && snippets.length < 8) {
    const start = Math.max(0, m.index - 95), end = Math.min(rest.length, m.index + 175);
    if (snippets.length && start < snippets[snippets.length - 1].end) continue;
    snippets.push({ start, end, text: rest.slice(start, end) });
  }
  let middle = '';
  for (const x of snippets) { if (middle.length + x.text.length > max - head - tail) break; middle += `\n…\n${x.text}`; }
  return `${text.slice(0, head)}\n… relevant excerpts …${middle}\n…\n${text.slice(-tail)}`;
}
function matchAnalystSourceExcerpt(path, source, max) {
  const wanted = MATCH_ANALYST_CORE_FUNCTIONS[path];
  if (!wanted) {
    const decls = [...source.matchAll(/^(?:async\s+)?function\s+(\w+)\s*\(/gm)];
    const relevant = decls.filter(m => /match|sim|ball|pass|shot|goal|keeper|tactic|shape|frame|move|duel|train/i.test(m[1]));
    return matchAnalystTrim(relevant.slice(0, 3).map(m => {
      const i = decls.indexOf(m), end = decls[i + 1]?.index ?? source.length;
      return source.slice(m.index, end);
    }).join('\n…\n') || source, max);
  }
  const decls = [...source.matchAll(/^(?:async\s+)?function\s+(\w+)\s*\(/gm)], chunks = [];
  for (let i = 0; i < decls.length; i++) if (wanted.includes(decls[i][1])) {
    const end = decls[i + 1]?.index ?? source.length;
    const name = decls[i][1], cap = MATCH_ANALYST_FUNCTION_LIMITS[path]?.[name] || 300;
    chunks.push(`// ${name}\n${matchAnalystTrim(source.slice(decls[i].index, end), cap)}`);
  }
  return matchAnalystTrim(chunks.join('\n'), max);
}
function matchAnalystRuleExtract(text, max = 4700) {
  const lines = text.split('\n'), headings = [];
  for (let i = 0; i < lines.length; i++) if (MATCH_ANALYST_RULE_HEADINGS.some(re => re.test(lines[i]))) headings.push(i);
  let out = `${lines.slice(0, headings[0] || 10).join('\n').slice(0, 650)}\n`;
  for (let n = 0; n < headings.length; n++) {
    const start = headings[n], end = headings[n + 1] ?? lines.length;
    const block = lines.slice(start, end).join('\n');
    const portion = matchAnalystTrim(block, n === headings.length - 1 ? 600 : 470);
    if (out.length + portion.length > max) continue;
    out += `${portion}\n\n`;
  }
  return out.slice(0, max);
}
async function matchAnalystSourcePack(snapshot, paths) {
  const index = await matchAnalystFiles(), allowed = new Set(index);
  const catalog = index.map(p => p).join('\n');
  const planner = await dsChat([
    { role: 'system', content: 'You select source files for a football match engine audit. From the supplied complete JavaScript path catalogue, return JSON only: {"files":["path",...]} with at most 6 paths. Select the source files whose actual implementation must be inspected to assess this match, its 2D trace and statistics. Prefer engine and match-analysis implementation. Never invent paths.' },
    { role: 'user', content: `Match evidence:\n${matchAnalystDigest(snapshot)}\n\nComplete JavaScript source catalogue (${index.length} files):\n${catalog}` },
  ], 'Match analysis source selection', { maxTokens: 350, json: true });
  const requested = matchAnalystPlanParse(planner.text).files;
  const extras = [...new Set(Array.isArray(requested) ? requested.filter(p => allowed.has(p) && !MATCH_ANALYST_CORE.includes(p)) : [])].slice(0, 2);
  const pathsToRead = [...MATCH_ANALYST_CORE, ...extras];
  const files = [];
  for (const path of pathsToRead) {
    const source = await matchAnalystFetch(path);
    const cap = MATCH_ANALYST_CORE.includes(path) ? ({ 'js/engine/match.js': 2200, 'js/engine/sim.js': 5700, 'js/engine/live.js': 2200 })[path] : 900;
    const excerpt = matchAnalystSourceExcerpt(path, source, cap);
    files.push({ path, source: excerpt });
  }
  const [rulebook, enginePlan, qaGuide] = await Promise.all([
    matchAnalystFetch('docs/FOOTBALL_RULEBOOK.md'), matchAnalystFetch('docs/MATCH_ENGINE_PLAN.md'), matchAnalystFetch('docs/ENGINE_QA.md'),
  ]);
  return { index, files, rulebook: matchAnalystRuleExtract(rulebook), enginePlan: matchAnalystTrim(enginePlan, 850), qaGuide: matchAnalystTrim(qaGuide, 650), selectorModel: planner.model };
}
function matchAnalystSystem(pack) {
  const refs = MATCH_ANALYST_REFERENCES.map(([n, u]) => `${n}: ${u}`).join('\n');
  const code = pack.files.map(f => `\n[${f.path} excerpt]\n${f.source}`).join('\n');
  return `Independent match analyst. Review the match evidence against these rulebook and source excerpts selected from the complete ${pack.index.length}-file JS index. Give specific findings with match evidence, source/function, expected 2D effect and measurable follow-up test. Separate observations from hypotheses; cover both teams; do not claim tests or live browsing. Compare with real football. Output concise sections: Verdict; Evidence; Findings; Prioritized fixes; Real-world comparison. Reference pointers (not live-fetched): IFAB ${MATCH_ANALYST_REFERENCES[0][1]}; FIFA ${MATCH_ANALYST_REFERENCES[1][1]}; StatsBomb ${MATCH_ANALYST_REFERENCES[2][1]}; Football Manager ${MATCH_ANALYST_REFERENCES[3][1]}.\nRULEBOOK EXTRACTS:\n${pack.rulebook}\nPLAN: ${pack.enginePlan}\nQA: ${pack.qaGuide}\nSOURCE EXCERPTS:\n${code}`;
}
function matchAnalystRequestBytes(messages, note, maxTokens) {
  const c = aiCfg().ds, body = { model: c.model, messages, max_tokens: maxTokens, thinking: { type: c.thinking ? 'enabled' : 'disabled' } };
  if (!c.thinking) body.temperature = c.temp;
  if (c.mode === 'relay') body.meta = aiMeta(note);
  return new TextEncoder().encode(JSON.stringify(body)).length;
}
function matchAnalystFitMessages(snapshot, pack) {
  let evidence = { ...snapshot, twoDPositionTrace: snapshot.twoDPositionTrace && snapshot.twoDPositionTrace.slice() };
  let system = matchAnalystSystem(pack);
  const make = () => [
    { role: 'system', content: system },
    { role: 'user', content: `Review this match. Trace rows are sparse snapshots, not continuous animation.\n${JSON.stringify(evidence)}` },
  ];
  let messages = make(), bytes = matchAnalystRequestBytes(messages, 'Match analysis officer', 2200);
  while (bytes > 29000) {
    if (evidence.twoDPositionTrace?.length > 8) evidence.twoDPositionTrace = evidence.twoDPositionTrace.filter((_, i, a) => i === 0 || i === a.length - 1 || i % 2 === 0);
    else if (evidence.actionTimeline?.length > 10) evidence.actionTimeline = evidence.actionTimeline.filter((_, i, a) => i >= a.length - 10 || i % 2 === 0);
    else if (evidence.playerRatingsAndStats?.length > 0) evidence.playerRatingsAndStats = evidence.playerRatingsAndStats.slice(0, Math.ceil(evidence.playerRatingsAndStats.length / 2));
    else if (system.length > 4000) system = system.slice(0, system.length - 1200);
    else throw new Error('This match report still exceeds the DeepSeek relay’s 32 KB request limit after trimming.');
    messages = make(); bytes = matchAnalystRequestBytes(messages, 'Match analysis officer', 2200);
  }
  return { messages, bytes, tracePoints: evidence.twoDPositionTrace?.length || 0 };
}
function matchAnalystPanel() {
  const matches = matchAnalystFixtures(), chosen = matches.find(f => f.id === +(ADM.matchAnalystFid ?? G.lastMatch)) || matches[0];
  const report = chosen && (G.matchAnalyses || []).find(r => r.fid === chosen.id);
  const job = ADM.matchAnalystJob, ready = aiReady('ds', 'match');
  if (!matches.length) return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">No completed match reports for your club yet. The officer can review your matches after the next full-time whistle.</p></div>`;
  const choices = matches.slice(0, 24).map(f => [f.id, matchAnalystLabel(f)]);
  const missingTrace = chosen && !chosen.trace;
  return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">DeepSeek compares match evidence with relevant rulebook excerpts and core engine code plus files selected from the complete JavaScript source index. Your match and game are never changed.</p>
      ${fld('Your match', selectHtml('maFixture', choices, chosen.id, 'matchAnalystFixture'))}
      <p class="note">${missingTrace ? 'This match is from before position-trace capture. The officer can still inspect its stats and event timeline.' : 'For new matches, the saved 2D trace samples ball and player positions once per minute.'} Each review makes two DeepSeek calls: source selection and analysis. Requests are compacted to fit the relay limit; cost depends on your model and budget.</p>
      <div class="btns"><button class="btn pri" data-a="matchAnalystRun" ${job?.busy ? 'disabled' : ready ? '' : 'disabled'}>${job?.busy ? esc(job.phase) : 'Analyze match'}</button><button class="btn" data-a="tab" data-key="adm" data-v="ds">DeepSeek settings</button></div>
      ${!ready ? '<p class="muted">Enable DeepSeek, save your key/connection, and turn on “Match analysis officer” in DeepSeek settings.</p>' : ''}
      ${job?.error ? `<p class="bad">${esc(job.error)}</p>` : ''}</div>
    ${report ? `<div class="card"><h3>Officer's report <small>${esc(report.model || '')} · ${fmtDate(report.at)}</small></h3><p class="muted">Reviewed excerpts from ${report.sourceCount} source files in the ${report.indexCount}-file JavaScript index · ${report.tracePoints} 2D samples.</p><div class="match-analysis-text">${esc(report.text)}</div></div>` : ''}
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
    const fit = matchAnalystFitMessages(snapshot, pack);
    const result = await dsChat(fit.messages, 'Match analysis officer', { maxTokens: 2200 });
    const history = G.matchAnalyses || [];
    G.matchAnalyses = [{ fid: fx.id, at: Date.now(), model: result.model || aiCfg().ds.model, text: result.text, sourceCount: pack.files.length, indexCount: pack.index.length, tracePoints: fit.tracePoints, requestBytes: fit.bytes }, ...history.filter(x => x.fid !== fx.id)].slice(0, 40);
    saveGame(); ADM.matchAnalystJob = null; toast('Match analysis complete.');
  } catch (e) {
    ADM.matchAnalystJob = { error: e.message || 'The match analysis could not finish.' };
  }
  if (UI.s === 'admin') render();
};
