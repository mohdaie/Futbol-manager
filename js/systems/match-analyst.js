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
  'js/engine/sim.js': ['engage', 'chanceAt', 'carrierDecide', 'kick', 'roundKeeper', 'shoot', 'shotArrives', 'crossBall', 'tryCrossVolley', 'receive', 'challenges', 'tickSim', 'recordFrame'],
  'js/engine/live.js': ['playMinuteView', 'setFrame', 'liveEvent', 'liveMark', 'shotPathPoint', 'draw'],
};
const MATCH_ANALYST_FUNCTION_LIMITS = {
  'js/engine/match.js': { createMatchState: 650, simMinute: 450, quickSim: 200, finishMatch: 850 },
  'js/engine/sim.js': { engage: 850, chanceAt: 350, carrierDecide: 850, kick: 500, roundKeeper: 380, shoot: 800, shotArrives: 520, crossBall: 400, tryCrossVolley: 350, receive: 350, challenges: 450, tickSim: 300, recordFrame: 300 },
  'js/engine/live.js': { playMinuteView: 300, setFrame: 500, liveEvent: 400, liveMark: 200, shotPathPoint: 250, draw: 450 },
};
const MATCH_ANALYST_RULE_HEADINGS = [/^## 1\./, /^## 1b\./, /^## 1c\./, /^## 2\./, /^## 3\./, /^## 4\./, /^## 5\./, /^## 6\./, /^## 7\./, /^## 8\./, /^## 11b\./];

function matchAnalystFixtures() {
  return (G.fixtures || []).filter(f => played(f) && f.stats && (f.h === G.club || f.a === G.club))
    .sort((a, b) => fxDate(b) - fxDate(a));
}
function matchAnalystLabel(f) {
  const date = fmtDate(f.date || fxDate(f), false);
  return `${date} · ${clubName(f.h)} ${f.hg}-${f.ag} ${clubName(f.a)}`;
}
function matchAnalystSample(rows, max) {
  if (rows.length <= max) return rows.slice();
  if (max <= 0) return [];
  if (max === 1) return [rows[0]];
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * (rows.length - 1) / (max - 1))]);
}
function matchAnalystSampleEvents(rows, max) {
  const priority = rows.filter(e => /^(goal|sub|red)$/.test(Array.isArray(e) ? e[2] : e.t));
  const picked = new Set([...matchAnalystSample(priority, max), ...matchAnalystSample(rows.filter(e => !priority.includes(e)), Math.max(0, max - priority.length))]);
  return rows.filter(e => picked.has(e));
}
function matchAnalystSnapshot(f, recording = f.evidence) {
  const teams = [f.h, f.a], totalPossession = (f.stats || []).reduce((n, s) => n + (Number(s.pos) || 0), 0);
  const stats = (f.stats || []).map((s, i) => ({ club: clubName(teams[i]), goals: i ? f.ag : f.hg,
    possessionPct: totalPossession > 0 ? Math.round(1000 * s.pos / totalPossession) / 10 : null,
    shots: s.sh, onTarget: s.sot, xG: s.xg, passes: s.pa, completed: s.pc, crosses: s.cr, corners: s.co, fouls: s.fo, offsides: s.off, yellow: s.yc, red: s.rc }));
  const players = (f.ratings || []).map((rows, side) => rows.map(([id, rating]) => {
    const p = G.players[id], ps = (f.pstats?.[side] || []).find(x => x[0] === id);
    return p ? [fullName(p), p.pos, rating, ps ? [`${ps[1]}/${ps[2]}`, ps[3], ps[4], ps[5], ps[6], ps[7], ps[8], ps[9], p.pos === 'GK' && Number.isFinite(ps[10]) ? ps[10] : null] : null] : null;
  }).map(x => x).filter(Boolean));
  const tactics = (f.engineTactics || []).map(t => ({ ...t, club: clubName(t.club), startingXI: t.startingXI.map(id => G.players[id] ? fullName(G.players[id]) : 'Unknown') }));
  const eligible = (f.timeline || []).filter(e => /shot|goal|save|block|wide|miss|cross|corner|free|tackle|duel|offside|injur|card|sub|pen|foul|restart|volley|header|red|yellow/i.test(e.t || ''));
  const timeline = matchAnalystSampleEvents(eligible, 36).map(e => {
    const extra = {};
    ['xg', 'pen', 'sp', 'volley', 'ck', 'fk', 'key', 'inj', 'wk', 'second', 'aim', 'over', 'block', 'line'].forEach(k => { if (e[k] != null) extra[k] = e[k]; });
    return [e.min, e.tt, e.t, e.side == null ? null : clubName(teams[e.side]), e.pid != null && G.players[e.pid] ? fullName(G.players[e.pid]) : null, e.aid != null && G.players[e.aid] ? fullName(G.players[e.aid]) : null, extra];
  });
  return {
    fixture: { date: fmtDate(f.date || fxDate(f)), competition: leagueName(f.comp || leagueOf(f.h)), home: clubName(f.h), away: clubName(f.a), score: `${f.hg}-${f.ag}`, weather: f.wx?.k || null },
    coordinateGuide: 'Stats are named fields; possessionPct is already normalized. Player rows: [name,naturalPosition,rating,[completed/attempted passes,keyPasses,dribbles,tackles,interceptions,aerials,shots,onTarget,matchSaves]]. null means unavailable. Natural position is NOT tactical slot. Event rows: [minute,second,type,club,player,assist,flags]. Trace: [sec,ballX,ballY,height,possessionSide,possessionSlot, then x,y for 11 home slots and 11 away slots]. x=WIDTH 0..68; y=LENGTH 0..105. Home attacks y=0 (own goal y=105); away attacks y=105 (own goal y=0). Depth and defensive lines use y, never x. Slot order starts with XI; substitutions can change occupants. Goal rows [club,minute,scorer,penalty].',
    stats, tactics, playerRatingsAndStats: players, goals: (f.goals || []).map(([side, minute, id, pen]) => [clubName(teams[side]), minute, G.players[id] ? fullName(G.players[id]) : 'Unknown', !!pen]),
    actionTimeline: timeline, twoDPositionTrace: f.trace ? matchAnalystSample(f.trace, 24) : null,
    evidenceLimits: { singleMatch: true, recordedEvents: (f.timeline || []).length, eligibleEvents: eligible.length, suppliedEvents: timeline.length, timelineIsExcerpt: true, omittedEventsAreNotEngineFailures: true, fullGoalsInSeparateList: true, sparseTraceCannotProveAnimationTiming: true, sourceIsCurrentMainNotNecessarilyMatchVersion: true },
    movementEvidence: recording && !recording.encoding && typeof evidenceSummary === 'function' ? evidenceSummary(recording) : null,
    missing: { fullMovement: !f.evidence, trace: !f.trace, timeline: !f.timeline, tactics: !f.engineTactics },
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
  return JSON.stringify({ fixture: snapshot.fixture, stats: snapshot.stats, goals: snapshot.goals, timeline: snapshot.actionTimeline, traceSamples: snapshot.twoDPositionTrace?.length || 0, movement: snapshot.movementEvidence ? { frames: snapshot.movementEvidence.recordedFrames, bySide: snapshot.movementEvidence.bySide, mentalBehavior: snapshot.movementEvidence.mentalBehavior } : null, missing: snapshot.missing });
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
  return `Independent match analyst. Review this ONE match with selected rule/source excerpts from a ${pack.index.length}-file index. Finish in 850 words maximum. Give a verdict, then cover BOTH teams in these areas: movement/marking/shape; pressing/duels/recovery; passing/through balls/first touch; dribbling/creativity/decision-making/composure; shooting/flight/outcome timing; keeper positioning/one-on-ones; corners/free kicks/aerial play. Use one short finding per area, measured evidence and timestamps where available, then 3 priorities. Say unavailable for an unobserved area instead of inventing behavior. Every finding needs exact supplied evidence; name a source/function only when its excerpt supports the claim. Do not invent code or infer a missing mechanism from omitted code. Distinguish engine behavior from limitations of this audit's excerpts. Do not claim tests, live browsing or access to proprietary Football Manager implementation.\nMovement evidence: the recorder captures every 0.5s ENGINE tick (not rendered display frames), all 22 players, ball, velocities, movement targets, facing, tactics/slot changes and decision/action logs. You receive all-tick aggregates plus selected continuous clips and selected action examples; the full archive is downloadable but is NOT all supplied to you. Respect clip boundaries and use sample counts. Assess decision alternatives and modeled mental attributes, not human thoughts; a high attribute alone proves no realistic behavior. Explain missed opportunities only when the supplied options and geometry support them. Study keeper approach from 20-30m: whether he moves toward his chosen target, narrows the angle, holds for attacker control/defensive cover or commits too late. Stationary does NOT automatically mean wrong: rushing from 25 yards is not universally correct. Counterfactual and population claims need more evidence. A deterministic replay checks repeatability, not realism. Reconcile total xG against ALL shot releases, never goals only.\nEvidence rules: possessionPct is already normalized. x is pitch WIDTH; y is LENGTH. Defensive depth uses y and the stated attacking directions. Sparse frames cannot establish motion, shot timing, marking response or a repeated tactical pattern. Null saves are unavailable, never seasonal saves. Player natural position does not identify tactical slot. The event timeline is deliberately sampled: omissions do NOT show an engine/replay bug; consult the separate full goal list. A single high-scoring match, low-xG goal or multiple 10 ratings does not prove an engine defect. Do not claim sigma/probability or numerical real-world targets without supplied distributions/calculations. Fast/direct football with a low block is a valid tactic, not inherently contradictory. Treat design documents as targets, not proof that code implements them. Label uncertainty; if evidence is insufficient, propose the measurement needed.\nReference pointers only (not fetched live): ${refs}.\nRULEBOOK EXTRACTS:\n${pack.rulebook}\nPLAN: ${pack.enginePlan}\nQA: ${pack.qaGuide}\nSOURCE EXCERPTS:\n${code}`;
}
function matchAnalystRequestBytes(messages, note, maxTokens) {
  const c = aiCfg().ds, body = { model: c.model, messages, max_tokens: maxTokens, thinking: { type: c.thinking ? 'enabled' : 'disabled' } };
  if (!c.thinking) body.temperature = c.temp;
  if (c.mode === 'relay') body.meta = aiMeta(note);
  return new TextEncoder().encode(JSON.stringify(body)).length;
}
function matchAnalystFitMessages(snapshot, pack) {
  // Clone before compaction: never alter the saved complete recording.
  const evidence = JSON.parse(JSON.stringify(snapshot));
  let system = matchAnalystSystem(pack);
  const make = () => [
    { role: 'system', content: system },
    { role: 'user', content: `Review actual movement and decisions for both teams. movementEvidence, if present, contains all-tick measurements plus selected continuous action clips. Legacy twoDPositionTrace rows are sparse snapshots only.\n${JSON.stringify(evidence)}` },
  ];
  let messages = make(), bytes = matchAnalystRequestBytes(messages, 'Match analysis officer', 3200);
  while (bytes > 29000) {
    const m = evidence.movementEvidence;
    if (evidence.twoDPositionTrace?.length > 0 && m) evidence.twoDPositionTrace = [];
    else if (evidence.twoDPositionTrace?.length > 8) evidence.twoDPositionTrace = matchAnalystSample(evidence.twoDPositionTrace, Math.max(8, Math.floor(evidence.twoDPositionTrace.length / 2)));
    else if (evidence.actionTimeline?.length > 10) evidence.actionTimeline = matchAnalystSampleEvents(evidence.actionTimeline, Math.max(10, Math.floor(evidence.actionTimeline.length / 2)));
    else if (evidence.playerRatingsAndStats?.length) evidence.playerRatingsAndStats.pop();
    else if (m?.throughPassChains?.length > 4) m.throughPassChains = matchAnalystSample(m.throughPassChains, 4);
    else if (m?.contexts?.length > 1) m.contexts.pop();
    else if (m && Object.values(m.samples).some(rows => rows.length > 2)) {
      const key = Object.keys(m.samples).find(k => m.samples[k].length > 2);
      m.samples[key] = [0, 1].flatMap(s => matchAnalystSample(m.samples[key].filter(a => a.side === s), 1));
    } else if (evidence.coordinateGuide?.length > 1800) evidence.coordinateGuide = evidence.coordinateGuide.slice(0, 1800);
    else if (system.length > 7500) {
      // Preserve action sequences across categories before reducing source excerpts.
      const at = system.indexOf('RULEBOOK EXTRACTS:');
      system = system.slice(0, at) + matchAnalystTrim(system.slice(at), Math.max(3000, system.length - at - 1500));
    } else if (m?.clips?.length > 2) {
      const keeper = m.clips.find(c => c.reason === 'keeperApproach'), through = m.clips.find(c => c.reason === 'thru');
      // Remove duplicate categories before any unique movement sequence.
      let i = m.clips.findIndex((c,n) => c !== keeper && c !== through && m.clips.findIndex(x => x.reason === c.reason) < n);
      if (i < 0) i = m.clips.findIndex(c => c !== keeper && c !== through);
      m.clips.splice(i >= 0 ? i : m.clips.length - 1, 1);
    } else throw new Error('This match evidence exceeds the relay limit. Download the full evidence for offline review.');
    evidence.evidenceLimits = { ...evidence.evidenceLimits, suppliedEvents: evidence.actionTimeline?.length || 0, suppliedTracePoints: evidence.twoDPositionTrace?.length || 0,
      suppliedPlayerSides: evidence.playerRatingsAndStats?.length || 0, fullArchiveSupplied: false,
      suppliedMovementClips: m?.clips?.length || 0, suppliedDecisionAndActionSamples: m ? Object.values(m.samples).reduce((n, a) => n + a.length, 0) : 0 };
    messages = make(); bytes = matchAnalystRequestBytes(messages, 'Match analysis officer', 3200);
  }
  return { messages, bytes, tracePoints: evidence.twoDPositionTrace?.length || 0, movementFrames: evidence.movementEvidence?.recordedFrames || 0, movementClips: evidence.movementEvidence?.clips?.length || 0 };
}
function matchAnalystPanel() {
  const matches = matchAnalystFixtures(), chosen = matches.find(f => f.id === +(ADM.matchAnalystFid ?? G.lastMatch)) || matches[0];
  const report = chosen && (G.matchAnalyses || []).find(r => r.fid === chosen.id);
  const job = ADM.matchAnalystJob, ready = aiReady('ds', 'match');
  if (!matches.length) return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">No completed match reports for your club yet. The officer can review your matches after the next full-time whistle.</p></div>`;
  const choices = matches.slice(0, 24).map(f => [f.id, matchAnalystLabel(f)]);
  const missingTrace = chosen && !chosen.trace, recording = chosen?.evidence;
  return `<div class="card"><h3>Match Analysis Officer</h3><p class="muted">DeepSeek compares match evidence with relevant rulebook excerpts and core engine code plus files selected from the complete JavaScript source index. Your match and game are never changed.</p>
      ${fld('Your match', selectHtml('maFixture', choices, chosen.id, 'matchAnalystFixture'))}
      <p class="note">${recording ? `Full movement recording: ${recording.frameCount.toLocaleString()} frames at 0.5-second intervals, both teams and ball; ${(recording.actionCount ?? recording.actions.length).toLocaleString()} action/decision records. The review uses measurements from all ticks and selected continuous sequences. Download contains every recorded tick and action. Recordings stay with this season’s fixtures and save backups.` : missingTrace ? 'This older match has no movement recording. Play a new match to capture every simulation step.' : 'This older match has only sparse position samples. Play a new match for full movement and decision capture.'} Each review makes two DeepSeek calls: source selection and analysis. Requests are compacted to fit the relay limit; cost depends on your model and budget.</p>
      <div class="btns"><button class="btn pri" data-a="matchAnalystRun" ${job?.busy ? 'disabled' : ready ? '' : 'disabled'}>${job?.busy ? esc(job.phase) : 'Analyze match'}</button><button class="btn" data-a="tab" data-key="adm" data-v="ds">DeepSeek settings</button>${recording ? `<button class="btn" data-a="matchAnalystDownload" data-id="${chosen.id}">Download full evidence</button>` : ''}</div>
      ${!ready ? '<p class="muted">Enable DeepSeek, save your key/connection, and turn on “Match analysis officer” in DeepSeek settings.</p>' : ''}
      ${job?.error ? `<p class="bad">${esc(job.error)}</p>` : ''}</div>
    ${report ? `<div class="card"><div class="btns" style="justify-content:space-between;align-items:center"><h3 style="margin:0">Officer's report <small>${esc(report.model || '')} · ${fmtDate(report.at)}</small></h3><button class="btn sm" data-a="matchAnalystCopy" data-id="${report.fid}">Copy report</button></div>${report.auditVersion !== 3 ? '<p class="note">This report used older analysis inputs. Analyze again; full movement evidence is available only for newly recorded matches.</p>' : ''}${report.truncated ? '<p class="note">The AI reached its reply limit. This report is incomplete.</p>' : ''}<p class="muted">Reviewed excerpts from ${report.sourceCount} source files in the ${report.indexCount}-file JavaScript index · ${report.movementFrames ? `${report.movementFrames.toLocaleString()} recorded movement frames measured · ${report.movementClips || 0} continuous excerpts supplied` : `${report.tracePoints} sparse 2D samples`}.</p><div class="match-analysis-text">${esc(report.text)}</div></div>` : ''}
    <div class="card"><h3>Reference library</h3><div class="list">${MATCH_ANALYST_REFERENCES.map(([n, u]) => `<div class="row"><span class="grow"><b>${esc(n)}</b><small>${esc(u)}</small></span><a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener">Open</a></div>`).join('')}</div><p class="muted">These links are provided for follow-up. DeepSeek's API cannot browse them during analysis, so reports do not pretend to have live-searched the web.</p></div>`;
}
ADMIN_TABS.match = matchAnalystPanel;
CHG.matchAnalystFixture = v => { ADM.matchAnalystFid = +v; render(); };
ACT.matchAnalystDownload = async ds => {
  const f = matchAnalystFixtures().find(f => f.id === +ds.id);
  if (!f?.evidence) return toast('This older match has no full movement recording.');
  try {
  const e = await evidenceLoad(f.evidence);
  const rows = [...evidenceRows(e)];
  const data = { fixture: matchAnalystLabel(f), ...e, blocks: undefined, schema: e.schema + ' This export contains decoded integer rows in frames instead of base64 blocks.', frames: rows, fullTimeline: f.timeline };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `match-evidence-${f.id}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000); toast('Full evidence download started.');
  } catch (e) { toast(e.message || 'Could not prepare the evidence download.'); }
};
ACT.matchAnalystCopy = async ds => {
  const report = (G.matchAnalyses || []).find(r => r.fid === +ds.id);
  if (!report?.text) return toast('Report text is unavailable.');
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(report.text);
    else throw new Error('Clipboard API unavailable');
    toast('Report copied.');
  } catch (_) {
    const box = document.createElement('textarea');
    box.value = report.text; box.setAttribute('readonly', '');
    box.style.position = 'fixed'; box.style.opacity = '0'; document.body.appendChild(box);
    box.select();
    const copied = document.execCommand('copy');
    box.remove();
    toast(copied ? 'Report copied.' : 'Could not copy automatically. Select the report text and copy it.');
  }
};
ACT.matchAnalystRun = async () => {
  const fx = matchAnalystFixtures().find(f => f.id === +(document.getElementById('maFixture')?.value || ADM.matchAnalystFid || G.lastMatch));
  if (!fx) return toast('Choose a completed match first.');
  if (!aiReady('ds', 'match')) return toast('Enable DeepSeek and Match analysis officer in Admin settings first.');
  ADM.matchAnalystFid = fx.id; ADM.matchAnalystJob = { busy: true, phase: 'Preparing match and rulebook…' }; render();
  try {
    const recording = await evidenceLoad(fx.evidence);
    const snapshot = matchAnalystSnapshot(fx, recording);
    ADM.matchAnalystJob.phase = 'Selecting source code…'; render();
    const pack = await matchAnalystSourcePack(snapshot, []);
    ADM.matchAnalystJob.phase = 'Comparing match, rulebook and engine code…'; render();
    const fit = matchAnalystFitMessages(snapshot, pack);
    const result = await dsChat(fit.messages, 'Match analysis officer', { maxTokens: 3200 });
    const history = G.matchAnalyses || [];
    G.matchAnalyses = [{ fid: fx.id, at: Date.now(), model: result.model || aiCfg().ds.model, text: result.text, auditVersion: 3, movementFrames: fit.movementFrames, movementClips: fit.movementClips, truncated: result.finishReason === 'length', sourceCount: pack.files.length, indexCount: pack.index.length, tracePoints: fit.tracePoints, requestBytes: fit.bytes }, ...history.filter(x => x.fid !== fx.id)].slice(0, 40);
    saveGame(); ADM.matchAnalystJob = null; toast('Match analysis complete.');
  } catch (e) {
    ADM.matchAnalystJob = { error: e.message || 'The match analysis could not finish.' };
  }
  if (UI.s === 'admin') render();
};
