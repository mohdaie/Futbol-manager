'use strict';
/* ===== transfer-ai.js =====
   AI for the transfer roles, on top of the game's own rules (which always decide when AI is off or slow).
   Words (DeepSeek, AI settings): the Director of Football's memo, the scout's summary and the Press Officer's
   advice ("Staff advice in words"), agents' messages ("Agents' messages in deals"), and journalists' and
   influencers' posts ("News stories and rumours"). Every text is checked against the facts it was given
   (staffTextValid): a number, player or club not in the facts and the built-in wording stays.
   Decisions (Jev, "Transfer decisions"): a second opinion on the DoF's verdict, whether a hesitant player
   joins, and how a selling club answers a borderline bid. Asked ahead of time and used when the step is due.
   Learning: DoF verdicts are judged by how the players did (rating over the season), statements by how the
   player's morale moved two weeks later. Results go into the staff learning tables, which sync to the cloud;
   an approved version of the table steers the DoF's threshold and the Press Officer's advice. */

const AI_VOICE = {};
// Calls per day, so the AI stays cheap.
function aiBudget(kind, max) {
  if (!G.aiDay || G.aiDay.k !== dayAbs()) G.aiDay = { k: dayAbs() };
  const n = G.aiDay[kind] || 0;
  if (n >= max) return false;
  G.aiDay[kind] = n + 1;
  return true;
}
// Staff ability already shows in which facts they see; the rating only sets how sure they sound.
const sure = r => (r >= 15 ? 'Sound sure of yourself.' : r >= 9 ? 'Be practical.' : 'Keep it simple and hedge a little.');
const VOICE = {
  Director: r => `You are the director of football at the club, briefing the manager. Dry and money-first; end with a clear yes or no. ${sure(r)}`,
  Scout: r => `You are the chief scout, summing up a scouting file for the manager. Talk about what you saw on the pitch: one strength, one doubt. ${sure(r)}`,
  Press: r => `You are the club's press officer, advising the manager on a statement. Cautious; think about tomorrow's headlines. ${sure(r)}`,
};
// One short text from facts, cached per key. Returns the text when ready, otherwise null (built-in wording shows).
function aiVoice(feat, key, persona, facts, onReady, len = '2-3 short sentences') {
  if (typeof aiReady !== 'function' || !aiReady('ds', feat) || !facts || !facts.length) return null;
  const c = AI_VOICE[key];
  if (c) return c.text || null;
  if (!aiBudget('ds', 40)) return null;
  AI_VOICE[key] = {};
  const data = { facts };
  const sys = `${persona} Write ${len}. Use ONLY the facts given. Do not add any number, player, club or event that is not in the facts. ${AI_STYLE} Reply only with JSON {"text": "..."}.`;
  dsChat([{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(data) }], 'Transfers: ' + key.split(':')[0], { json: true, maxTokens: 220 }).then(res => {
    const t = String(JSON.parse(res.text).text || '').trim();
    if (t && staffTextValid(t, data)) { AI_VOICE[key].text = t; if (onReady) onReady(t); }
  }).catch(() => { /* built-in wording stays */ });
  return null;
}
const reopen = key => () => { if (UI.popup && UI.popup.key === key && UI.sheetOpts && UI.sheetOpts.restore) UI.sheetOpts.restore(); };

// The DoF's memo in his own words.
function dofWords(d) {
  const M = d.memo;
  if (!M) return null;
  const facts = [`Player: ${fullName(G.players[d.pid])}`, `Verdict: ${M.verdict}`, ...[...M.fin, ...M.tac, ...M.har].map(x => x[1])];
  return aiVoice('staff', 'dof:' + d.id + ':' + M.date + ':' + M.verdict, VOICE.Director(Math.round(dofR())), facts, reopen('deal:' + d.id));
}
// The scout's summary of a file.
function scoutWords(p) {
  const r = scoutFile(p), fit = knowOf(p) >= 25 ? fileFit(p) : null;
  const facts = [`Player: ${fullName(p)}, ${POS_NAME[p.pos]}, age ${p.age}, ${clubName(p.club)}`, `File ${knowOf(p)}% complete`, `Grade ${r.grade}: ${GRADE_NOTE[r.grade]}`, `Recommendation: ${r.rec || 'Watch more'}`, ...scoutNotes(p), ...(fit ? [`Best role for us: ${POS_NAME[fit.pos]}`] : [])];
  return aiVoice('staff', 'sf:' + p.id + ':' + knowOf(p), VOICE.Scout(Math.round(staffAvg('Scout', 6))), facts, reopen('sfile:' + p.id));
}
// The Press Officer's advice on a statement.
function pressWords(r) {
  const p = G.players[r.pid];
  if (!p) return null;
  const opts = STATEMENTS[r.kind], adv = opts.find(x => x[0] === r.advice);
  const facts = [`About: ${fullName(p)} (${r.kind === 'ours' ? 'our player' : 'a player we are interested in'})`, ...(r.txt ? [`The story: ${r.txt}`] : []), `Advice: "${adv[1]}". ${adv[2]}`, ...opts.filter(x => x !== adv).map(x => `Other option: "${x[1]}". ${x[2]}`)];
  return aiVoice('staff', 'press:' + r.id, VOICE.Press(Math.round(pressR())), facts, () => { if (UI.s === 'news') render(); });
}
// An agent's message about the deal, in his style.
function agentWords(d) {
  const p = G.players[d.pid], a = agentOf(p);
  if (!a || d.dir === 'ai' || ['review', 'meeting'].includes(d.stage)) return null;
  const recent = d.log.filter(l => l.who === 'agent' || l.who === 'club' || l.who === 'player').slice(0, 3).map(l => l.txt);
  if (!recent.length) return null;
  const facts = [`Agent: ${a.name} of ${a.agency}, style: ${a.style} (${AGENT_STYLE[a.style]})`, `Client: ${fullName(p)}`, `Club he is talking to: ${clubName(G.club)}`, `Relationship with this club: ${relLabel(agentRel(a))}`, ...recent];
  return aiVoice('agents', 'ag:' + d.id + ':' + d.stage + ':' + d.log.length, `You are ${a.name}, a football agent, sending a short message to the manager. Pushy and flattering; you always want a little more for your client.`, facts, reopen('deal:' + d.id), '1-2 short sentences in first person');
}
// Journalists and influencers write their own posts (from the facts of the built-in post).
function postWords(p) {
  const a = mediaAcc(p.acc);
  if (!['journalist', 'tabloid', 'rumour', 'influencer'].includes(a.kind) || !aiBudget('post', 12)) return;
  const style = {
    journalist: a.tier === 1 ? 'a top transfer reporter. Short and factual, like "Understand Spurs have asked about X. No bid yet." Use "HERE WE GO" only if the facts say the deal is done' : 'a careful transfer reporter. Short; says what is and is not confirmed, like "Bid in from Spurs for X. Club yet to respond."',
    tabloid: 'a British tabloid back page. Headline style, punchy verbs (swoop, raid, plot), like "Spurs plot raid for X". No "bombshell", "shock" or "sensational"',
    rumour: 'a transfer rumour account. Claims inside knowledge ("told", "hearing"), like "Told Spurs have asked about X. More soon."',
    influencer: 'a football fan influencer. Opinionated and casual, like "X to Spurs makes sense to me tbh"',
  }[a.kind];
  const recent = G.social.filter(x => x.acc === p.acc && x.id !== p.id).slice(0, 3).map(x => x.txt);
  const facts = [`Post to rewrite: ${p.txt}`, ...(p.pid && G.players[p.pid] ? [`Player: ${fullName(G.players[p.pid])}`] : []), ...p.clubs.map(c => `Club: ${clubName(c)}`), ...recent.map(t => `Recent post by this account (do not reuse its wording): ${t}`)];
  aiVoice('news', 'post:' + p.id, `You write the social media posts for ${a.name} (@${a.handle}), ${style}. Keep every fact and add none. Do not start with the club name. At most one emoji, or none.`, facts, t => { p.txt = t; p.ai = true; }, 'one post under 220 characters');
}

/* ---------- decisions (Jev) ---------- */
const jevOn = () => typeof aiReady === 'function' && aiReady('jev', 'transfer');
async function jevChoice(state, instructions, criteria, note) {
  const res = await jevAsk(state, { decision: { type: 'choice', instructions, criteria } }, note);
  const a = res.answers && res.answers.decision;
  if (!a || !criteria[a.choice]) throw new Error('Unexpected Jev answer');
  return { choice: a.choice, conf: a.confidence ?? 1 };
}
// A second opinion on the DoF's verdict. If he is not a strong DoF and the AI is confident, he takes it.
function dofSecondOpinion(d) {
  const M = d.memo;
  if (!M || !jevOn() || M.jev || !aiBudget('jev', 8)) return;
  M.jev = { pending: true };
  const p = G.players[d.pid];
  const state = `Football club deciding whether to pursue a transfer target.\nPlayer: ${fullName(p)}, ${POS_NAME[p.pos]}, age ${p.age}, at ${clubName(p.club)}.\nScouting file ${M.k}% complete.\nFinance: ${M.fin.map(x => x[1]).join(' ')}\nTactics: ${M.tac.map(x => x[1]).join(' ')}\nHarmony: ${M.har.map(x => x[1]).join(' ')}\nDirector of Football's own verdict: ${M.verdict}.`;
  jevChoice(state, 'Should the club pursue this player now?', { Proceed: 'Go for him now', Monitor: 'Keep watching, do not move yet', Drop: 'Do not pursue him' }, 'DoF review').then(r => {
    M.jev = r;
    if (r.choice !== M.verdict && r.conf >= 0.7 && dofR() < 13 && dealOpen(d) && d.stage === 'meeting') { M.rules = M.verdict; M.verdict = r.choice; dealLog(d, `After an AI review, the Director of Football changes his verdict to ${r.choice}.`); }
    reopen('deal:' + d.id)();
  }).catch(() => { M.jev = null; });
}
// Ask ahead: will a hesitant player join? Used by the player step if the answer is back in time.
function askPlayerDecision(d) {
  const p = G.players[d.pid];
  if (!jevOn() || !p || (d.ai && d.ai.player) || !aiBudget('jev', 8)) return;
  (d.ai = d.ai || {}).player = { pending: true };
  const from = G.clubs[p.club], me = userClub();
  const state = `A footballer decides whether to accept a transfer.\nPlayer: ${fullName(p)}, age ${p.age}, ${p.pers} character, ambition ${p.amb}/20, morale ${p.mor}/100.\nCurrent club: ${from ? from.name + ' (reputation ' + from.rep + ')' : 'none'}, his role there: ${isKeyPlayer(p) ? 'key player' : 'squad player'}.\nOffer: ${me.name} (reputation ${me.rep}), wage ${wageFmt(d.wage)} for ${d.years} years, role ${d.status}.\nHis attitude so far: ${WILL_TXT[d.will || 'open']}.`;
  jevChoice(state, 'Does the player accept the move?', { Join: 'Accepts the move', Stay: 'Stays at his club' }, 'Player decision').then(r => { d.ai.player = r; }).catch(() => { d.ai.player = null; });
}
// Ask ahead: how does the selling club answer a borderline offer?
function askClubAnswer(d, ask) {
  const p = G.players[d.pid];
  if (!jevOn() || !p || !aiBudget('jev', 8)) return;
  (d.ai = d.ai || {}).club = { pending: true, fee: d.fee };
  const c = G.clubs[p.club];
  const state = `A football club answers a transfer offer for one of its players.\nPlayer: ${fullName(p)}, age ${p.age}, ${isKeyPlayer(p) ? 'a key player' : 'a squad player'}, contract until ${p.con}, value ${money(pValue(p))}.\nSelling club: ${c.name}, balance ${money(c.bal)}, reputation ${c.rep}.\nTheir valuation: ${money(ask)}.\nOffer: ${money(d.fee)}${d.add ? ' plus ' + money(d.add) + ' add-ons' : ''}${d.inst ? ', paid over ' + (d.inst + 1) + ' years' : ''}. Round ${d.round + 1}.`;
  jevChoice(state, 'How does the selling club answer?', { Accept: 'Accept the offer', Counter: 'Ask for more', Reject: 'Reject and end talks' }, 'Club answer').then(r => { d.ai.club = { ...r, fee: d.fee }; }).catch(() => { d.ai.club = null; });
}
const aiAnswer = (d, k, min = 0.6) => { const x = d.ai && d.ai[k]; return x && !x.pending && x.conf >= min ? x.choice : null; };

/* ---------- learning ---------- */
function logDof(d, decision) {
  const M = d.memo;
  if (!M) return;
  logStaff({ k: 'dof', key: 'dof|' + M.verdict + '|' + decision + (M.rules ? '|ai' : ''), pid: d.pid, season: G.season, score: M.score, fee: d.fee || 0 });
}
function logStatement(r, p) { logStaff({ k: 'press', key: 'press|' + r.kind + '|' + r.choice, pid: p.id, mor0: p.mor, day: dayAbs(), season: G.season }); }
// Weekly: statements judged two weeks later on the player's morale.
function transferLearnWeekly() {
  (G.staffLog || []).forEach(e => {
    if (e.k !== 'press' || e.res || dayAbs() - e.day < 14) return;
    const p = G.players[e.pid];
    if (!p) { e.res = { gone: true }; return; }
    const delta = p.mor - e.mor0;
    e.res = { delta };
    staffOf('Press').forEach(s => { s.xp = (s.xp || 0) + (delta > 0 ? 1 : 0); });
    staffLearnAdd(e.key, delta / 10);
  });
}
// Season end: signings judged on how they played; players you passed on judged on how they did elsewhere.
function transferLearnSeason() {
  (G.staffLog || []).forEach(e => {
    if (e.k !== 'dof' || e.res || e.season !== G.season) return;
    const p = G.players[e.pid];
    if (!p) { e.res = { gone: true }; return; }
    const rt = p.st.a ? avgRating(p) : null;
    e.res = { signed: p.club === G.club, apps: p.st.a, rt: rt ? Math.round(rt * 10) / 10 : null };
    if (p.st.a >= 8) { staffLearnAdd(e.key, rt - 6.8); if (p.club === G.club && rt >= 6.9) staffOf('Director').forEach(s => { s.xp = (s.xp || 0) + 3; }); }
  });
}
// The approved learning table steers the DoF's bar for Proceed and the Press Officer's advice.
function dofBar() {
  const ok = staffEvidence('dof|Proceed|proceed'), missed = staffEvidence('dof|Drop|drop');
  let bar = 3;
  if (ok) bar += ok.mean < -0.15 ? 1 : ok.mean > 0.2 ? -0.5 : 0;
  if (missed && missed.mean > 0.3) bar -= 0.5;
  return bar;
}
function learnedStatement(kind, best) {
  if (pressR() < 10) return best;
  const ev = STATEMENTS[kind].map(([k]) => [k, staffEvidence('press|' + kind + '|' + k)]).filter(x => x[1]);
  if (ev.length < 2) return best;
  const top = ev.sort((a, b) => b[1].mean - a[1].mean)[0], mine = ev.find(x => x[0] === best);
  return !mine || top[1].mean > mine[1].mean + 0.2 ? top[0] : best;
}
// Summary that goes to the cloud with the staff learning tables.
function transferSummary() {
  const done = (G.deals || []).filter(d => d.closed);
  return { deals: { done: done.filter(d => d.closed.ok).length, off: done.filter(d => !d.closed.ok).length, mine: done.filter(d => d.dir === 'in' && d.closed.ok).length },
    dof: (G.staffLog || []).filter(e => e.k === 'dof').length, press: (G.staffLog || []).filter(e => e.k === 'press').length, agents: G.agents ? Object.keys(G.agents).length : 0 };
}
