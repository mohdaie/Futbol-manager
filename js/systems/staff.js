'use strict';
/* ===== staff.js =====
   AI-assisted staff, stage 1: the assistant manager.
   - Pre-match prediction: the assistant plays the coming match many times with the game's own engine
     (nothing is saved), using both teams' real squads, tactics, fatigue, morale and conditions.
   - Tactic advice: the same simulations for the current tactic and other styles; the best one is recommended.
   - The assistant's rating limits him: fewer simulations, fewer tactics tried, rougher numbers and fewer reasons.
   - Optional wording by DeepSeek, from the computed facts only. The game checks the text: any number or
     name that is not in the facts makes it fall back to the built-in wording.
   - Every piece of advice is recorded with whether you followed it and the result (G.staffLog). */

const STAFF_LOG_MAX = 300;
const assistantRating = () => staffAvg('Assistant', 6);
const styleKeyT = T => styleOf(T) || 'custom';
const styleName = k => (STYLES[k] ? STYLES[k].n : 'your own tactic');

// Play the fixture n times with the current G.tactics. Nothing in the game state changes.
function simFixture(fx, n) {
  const out = { n, w: 0, d: 0, l: 0, gf: 0, ga: 0, xf: 0, xa: 0, pos: 0 };
  for (let k = 0; k < n; k++) {
    const M = createMatch({ id: -1, h: fx.h, a: fx.a, w: fx.w, d: fx.d, t: fx.t, wx: fx.wx });
    M.noLog = true;
    while (!M.ended) stepMatch(M, true);
    const S = M.sides.find(x => x.user), O = M.sides.find(x => !x.user);
    out.gf += S.st.g; out.ga += O.st.g; out.xf += S.st.xg; out.xa += O.st.xg; out.pos += S.st.pos / (S.st.pos + O.st.pos || 1);
    if (S.st.g > O.st.g) out.w++; else if (S.st.g === O.st.g) out.d++; else out.l++;
  }
  out.pts = (3 * out.w + out.d) / n;
  return out;
}
const tick = () => new Promise(res => setTimeout(res, 0));

// Facts about the match from game data, worded with the precision the assistant's rating allows.
function matchFacts(fx, r, oppTac) {
  const home = fx.h === G.club, opp = home ? fx.a : fx.h, T = G.tactics;
  const ours = T.slots.map(id => G.players[id]).filter(Boolean), theirXi = autoPick(opp, oppTac.ip).xi.map(id => G.players[id]).filter(Boolean);
  const avgCa = xs => xs.reduce((t, p) => t + p.ca, 0) / Math.max(1, xs.length);
  const ourFit = tacticReport(T).overall, theirFit = tacticReport({ ...oppTac, slots: autoPick(opp, oppTac.ip).xi }).overall;
  const cond = Math.round(ours.reduce((t, p) => t + p.cond, 0) / Math.max(1, ours.length)), mor = Math.round(ours.reduce((t, p) => t + p.mor, 0) / Math.max(1, ours.length));
  const rest = restDays(G.club, fx), oRest = restDays(opp, fx);
  const missing = seniorSquad(G.club).filter(p => !available(p)).sort((a, b) => b.ca - a.ca).slice(0, 3);
  const out = [];
  const sd = avgCa(ours) - avgCa(theirXi);
  out.push({ w: Math.abs(sd) * 2, t: Math.abs(sd) < 1.5 ? 'The two line-ups are evenly matched on paper.' : sd > 0 ? (r >= 10 ? `Our starting eleven is stronger: average rating ${avgCa(ours).toFixed(0)} against ${avgCa(theirXi).toFixed(0)}.` : 'We have the stronger players.') : (r >= 10 ? `They have the stronger eleven: ${avgCa(theirXi).toFixed(0)} against our ${avgCa(ours).toFixed(0)}.` : 'Their players are better than ours.') });
  if (ourFit != null || theirFit != null) out.push({ w: Math.abs((ourFit || 50) - (theirFit || 50)) / 4 + 1, t: r >= 8 ? `Tactic fit: our players suit ${styleName(styleKeyT(T))} ${ourFit ?? 50}%; theirs suit ${styleName(oppTac.style)} ${theirFit ?? 50}%.` : (ourFit ?? 50) >= (theirFit ?? 50) ? 'Our players suit our tactic better than theirs suit their tactic.' : 'Their players look more comfortable in their system than ours do.' });
  if (cond < 88) out.push({ w: (92 - cond) / 2, t: r >= 9 ? `Our starters average ${cond}% condition${rest != null ? ` after ${rest} days' rest` : ''}.` : 'Some of our players are still tired.' });
  if (rest != null && oRest != null && Math.abs(rest - oRest) >= 2) out.push({ w: 3, t: rest > oRest ? `We are fresher: ${rest} days' rest against their ${oRest}.` : `They have had more rest: ${oRest} days against our ${rest}.` });
  if (mor < 55 || mor > 72) out.push({ w: 2, t: mor > 72 ? 'Morale in the squad is high.' : r >= 9 ? `Morale is low (average ${mor}).` : 'Confidence is low in the dressing room.' });
  missing.forEach(p => out.push({ w: p.ca / 25, t: `We are without ${pname(p)} (${p.inj ? p.inj.n.toLowerCase() : 'suspended'}).` }));
  if ((oppTac.line ?? 1) === 2 && r >= 9) { const pace = ours.filter(p => LINE[p.pos] >= 4).reduce((t, p) => t + p.at[A.pac], 0) / Math.max(1, ours.filter(p => LINE[p.pos] >= 4).length); out.push({ w: 2.5, t: pace >= 15 ? 'They play a high line, and our forwards are quick enough to get in behind it.' : 'They play a high line, but our forwards lack the pace to punish it.' }); }
  if ((oppTac.press ?? 1) === 2 && r >= 11) out.push({ w: 2, t: 'They press high, so we need to play through or over the press.' });
  if (fx.wx && (fx.wx.k === 'hot' || fx.wx.k === 'rain' || fx.wx.k === 'wind') && r >= 12) out.push({ w: 1.5, t: `${WEATHER[fx.wx.k].n} is forecast: ${fx.wx.k === 'hot' ? 'heavy pressing will tire us quickly' : fx.wx.k === 'wind' ? 'long balls and crosses will be less accurate' : 'finishing will be harder'}.` });
  out.push({ w: 1, t: home ? 'We have home advantage.' : 'We are away from home.' });
  return out.sort((a, b) => b.w - a.w).slice(0, 1 + Math.floor(r / 4)).map(x => x.t);
}

// The assistant's full advice for a fixture. Runs in the background; onStep(text) reports progress.
async function assistantAdvice(fx, onStep = () => {}) {
  const r = assistantRating(), home = fx.h === G.club, opp = home ? fx.a : fx.h;
  const n = Math.round(6 + r * 1.5), K = 1 + Math.floor(r / 5);
  const saved = JSON.stringify(G.tactics), fixedWas = G.flags.fixedTac;
  ensureUserLineup();
  const oppTac = aiChooseTactic(opp, G.club);
  G.clubs[opp].tac = oppTac; G.flags.fixedTac = true;
  try {
    onStep('Studying the opposition…');
    await tick();
    const cur = simFixture(fx, n * 2), curKey = styleKeyT(G.tactics), results = [{ k: curKey, cur: true, res: cur }];
    // Other styles, best-suited first; better assistants try more of them.
    const cands = Object.keys(STYLES).filter(k => k !== curKey).map(k => {
      const t = JSON.parse(saved); applyStyle(t, k);
      const pk = autoPick(G.club, t.ip); t.slots = pk.xi; t.bench = pk.bench; t.cap = t.pk = t.fk = t.ck = null; t.pi = {};
      return { k, t, fit: tacticReport(t).overall ?? 50 };
    }).sort((a, b) => b.fit - a.fit).slice(0, K);
    for (const c of cands) {
      onStep(`Trying ${STYLES[c.k].n.toLowerCase()}…`);
      await tick();
      G.tactics = c.t; autoSetPieces();
      results.push({ k: c.k, t: c.t, res: simFixture(fx, n) });
      G.tactics = JSON.parse(saved);
    }
    G.tactics = JSON.parse(saved);
    const best = results.slice().sort((a, b) => b.res.pts - a.res.pts)[0];
    // Low-rated assistants read the numbers less accurately.
    const noise = (20 - r) * 0.6, jig = v => clamp(Math.round(v * 100 + rf(-noise, noise)), 1, 98);
    let pw = jig(cur.w / cur.n), pd = jig(cur.d / cur.n), pl = Math.max(1, 100 - pw - pd);
    const facts = matchFacts(fx, r, oppTac);
    const ev = typeof staffEvidence === 'function' ? staffEvidence('assist|switch') : null;
    const switchIt = best.k !== curKey && best.res.pts - cur.pts >= (ev && ev.mean < -0.15 ? 0.25 : 0.1);
    const adv = {
      fid: fx.id, week: G.week, season: G.season, r: Math.round(r), n, tried: results.map(x => x.k),
      pred: { w: pw, d: pd, l: pl, gf: +(cur.gf / cur.n).toFixed(1), ga: +(cur.ga / cur.n).toFixed(1) },
      cur: curKey, rec: switchIt ? best.k : curKey, gain: switchIt ? +(best.res.pts - cur.pts).toFixed(2) : 0,
      opp: { style: oppTac.style, ip: oppTac.ip }, facts, text: null, src: 'rules',
    };
    adv.text = assistantWords(adv);
    return adv;
  } finally {
    G.tactics = JSON.parse(saved); G.flags.fixedTac = fixedWas;
  }
}

function assistantWords(a) {
  const r = a.r, lead = a.pred.w >= a.pred.l + 15 ? 'I fancy our chances' : a.pred.l >= a.pred.w + 15 ? 'This will be difficult' : 'This one is finely balanced';
  const rec = a.rec !== a.cur ? ` I would switch to ${styleName(a.rec)}${r >= 10 ? `: in my run-throughs it was worth about ${a.gain.toFixed(1)} points more per match` : ', it suits the players better for this game'}.` : ` I would stick with ${styleName(a.cur)}.`;
  return `${lead}.${rec}`;
}

// Optional: DeepSeek words the advice, from the facts only. Rejected if it adds numbers or names.
async function assistantAiWords(a) {
  if (!aiReady('ds', 'staff')) return;
  const facts = { assistantRating: a.r, prediction: a.pred, currentStyle: styleName(a.cur), recommendedStyle: styleName(a.rec), pointsGain: a.gain, opponentStyle: styleName(a.opp.style), reasons: a.facts, playersMentioned: a.facts.join(' ') };
  const sys = `You are the assistant manager of a football club in a management game. Your ability is ${a.r}/20: ${a.r >= 15 ? 'be precise and confident' : a.r >= 9 ? 'be clear but not too detailed' : 'speak simply, you are not very insightful'}. ` +
    'Write 2-3 short sentences of advice to the manager. Use ONLY the facts given. Do not add any number, player, club or event that is not in the facts. Reply only with JSON {"text": "..."}.';
  try {
    const res = await dsChat([{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(facts) }], 'Assistant advice', { json: true, maxTokens: 220 });
    const t = String(JSON.parse(res.text).text || '').trim();
    if (t && staffTextValid(t, facts)) { a.text = t; a.src = 'ai'; }
  } catch (e) { /* keep the built-in wording */ }
}
// Every number and every player or club name in the text must come from the facts.
function staffTextValid(t, facts) {
  const raw = JSON.stringify(facts);
  const nums = raw.match(/\d+(\.\d+)?/g) || [];
  if ((t.match(/\d+(\.\d+)?/g) || []).some(x => !nums.includes(x) && !nums.some(y => Math.abs(+y - +x) < 0.051))) return false;
  const names = new Set();
  Object.values(G.players).forEach(p => { if (p.ln && p.ln.length > 3) names.add(p.ln); });
  Object.values(G.clubs).forEach(c => { if (c.name) names.add(c.name); });
  for (const nm of names) if (t.includes(nm) && !raw.includes(nm)) return false;
  return true;
}

/* ---------- record and outcome ---------- */
function logAdvice(a) {
  G.staffLog = G.staffLog || [];
  G.staffLog = G.staffLog.filter(x => !(x.k === 'assist' && x.fid === a.fid));
  G.staffLog.push({ k: 'assist', fid: a.fid, season: a.season, week: a.week, r: a.r, pred: a.pred, cur: a.cur, rec: a.rec, gain: a.gain, opp: a.opp, followed: null, used: null, res: null });
  if (G.staffLog.length > STAFF_LOG_MAX) G.staffLog.splice(0, G.staffLog.length - STAFF_LOG_MAX);
}
// At kick-off: did the manager follow the advice?
function adviceAtKickoff(fx) {
  const e = (G.staffLog || []).find(x => x.k === 'assist' && x.fid === fx.id && x.followed == null);
  if (e) { e.used = styleKeyT(G.tactics); e.followed = e.used === e.rec; }
}
// At full time: what happened.
function adviceResult(fx, us, them, xgUs, xgThem) {
  const e = (G.staffLog || []).find(x => x.k === 'assist' && x.fid === fx.id);
  if (!e || e.res) return;
  e.res = { pts: us > them ? 3 : us === them ? 1 : 0, gf: us, ga: them, xgd: +(xgUs - xgThem).toFixed(2) };
}
// The assistant's track record: prediction accuracy and how advice that was followed turned out.
function assistantRecord() {
  const done = (G.staffLog || []).filter(x => x.k === 'assist' && x.res);
  if (!done.length) return null;
  // Called it right: the outcome he rated most likely is what happened.
  const hits = done.filter(x => { const o = x.res.pts === 3 ? 0 : x.res.pts === 1 ? 1 : 2, p = [x.pred.w, x.pred.d, x.pred.l]; return p.indexOf(Math.max(...p)) === o; }).length;
  const avgPts = xs => (xs.length ? +(xs.reduce((t, x) => t + x.res.pts, 0) / xs.length).toFixed(2) : null);
  const changed = done.filter(x => x.rec !== x.cur);
  return { n: done.length, accuracy: Math.round(hits / done.length * 100), followed: avgPts(changed.filter(x => x.followed)), ignored: avgPts(changed.filter(x => !x.followed)), nf: changed.filter(x => x.followed).length, ni: changed.filter(x => !x.followed).length };
}
