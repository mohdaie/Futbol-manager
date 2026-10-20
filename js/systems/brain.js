'use strict';
/* ===== brain.js =====
   The learning engine for computer managers (teacher -> student).

   1. Record  every in-match decision a computer manager makes: the situation, the choice, who chose it.
   2. Judge   each decision by what happened afterwards (goals and points gained or lost).
   3. Learn   a table: situation bucket -> how well each option worked, plus how often the teacher picked it.
   4. Test    the learned draft against the current engine in head-to-head simulated matches.
   5. Release only versions you approve are used in real matches. You can roll back at any time.

   Teachers: Jev picks the option (fast, gives a confidence). When Jev is unsure,
   DeepSeek can give a second opinion. Without either, the training camp explores options
   and learns purely from outcomes. A local copy works offline; brain-cloud.js
   syncs compact research data to the private analysis database. */

const BRAIN_KEY = 'futbol-manager:brain';
const CHECKPOINTS = [46, 60, 70, 80];
const MGR_OPTIONS = {
  attack: 'Go more attacking and bring on an attacker',
  hold: 'Keep the current approach',
  defend: 'Drop deeper and protect the result',
  press: 'Press higher to win the ball back',
  fresh: 'Bring on fresh legs for tired players',
  restyle: 'Switch to the tactical style the players on the pitch suit best for this situation',
  counter: 'Sit deeper, regroup when the ball is lost and counter-attack when it is won',
  cpress: 'Counter-press straight after losing the ball and press high',
  protect: 'Tell the full-backs and midfielders to stay back, and tired players to press less',
  mark: 'Tell the defenders and defensive midfielders to mark tighter and stay on their feet',
};
const MGR_SAY = { attack: 'push forward and go for it', defend: 'drop deeper to protect the result', press: 'start pressing higher up the pitch', fresh: 'make changes to freshen things up',
  restyle: 'change their whole approach', counter: 'sit deeper and look to break', cpress: 'start hunting the ball the moment they lose it', protect: 'tell their full-backs to hold their positions', mark: 'tighten up at the back with closer marking' };
const STYLE_IDX = ['gegen', 'tiki', 'bal', 'counter', 'long'];
const BRAIN_MODES = [
  ['rules', 'Built-in rules', 'The original fixed rules. No AI, no learning used.'],
  ['learned', 'Learned engine', 'Uses your approved engine version. No AI calls.'],
  ['hybrid', 'Hybrid', 'Uses the approved engine when it knows the situation, asks the AI only for new or uncertain ones.'],
  ['teacher', 'Teacher', 'Asks the AI at every decision in your live matches. Most data, most calls.'],
];

let BRAIN = null;
function brainDefaults() {
  return { v: 1, mode: 'rules', minN: 8, conf: 0.6, explore: 0.3, log: [], draft: {}, versions: [], active: null, press: [], saved: { calls: 0, skipped: 0 } };
}
function brain() {
  if (BRAIN) return BRAIN;
  BRAIN = brainDefaults();
  try { const s = JSON.parse(localStorage.getItem(BRAIN_KEY) || 'null'); if (s) BRAIN = { ...BRAIN, ...s }; } catch (e) { /* storage blocked */ }
  return BRAIN;
}
function brainSave() {
  try {
    const B = brain(); brainCloudCapture(B);
    localStorage.setItem(BRAIN_KEY, JSON.stringify(B)); brainCloudSchedule(); return true;
  } catch (e) { return false; }
}
const activeVersion = () => brain().versions.find(v => v.id === brain().active) || null;

/* ---------- situations ---------- */
function situation(M, S) {
  const O = M.sides[1 - S.idx], outs = onPitch(S).filter(x => x.pos !== 'GK');
  const str = (S.u.att / O.u.def) / (O.u.att / S.u.def);
  return { min: M.min, diff: S.st.g - O.st.g, home: S.idx === 0, str: Math.round(str * 100) / 100, cond: Math.round(avg(outs, x => S.cond[x.p.id])), reds: S.reds.length - O.reds.length, ment: S.ment, subs: 5 - S.subs,
    shots: S.st.sh, sot: S.st.sot, xg: Math.round(S.st.xg * 100) / 100, oppShots: O.st.sh, oppXg: Math.round(O.st.xg * 100) / 100,
    possession: Math.round(100 * S.st.pos / (S.st.pos + O.st.pos || 1)), press: S.press, line: S.line, tempo: S.tempo,
    style: styleIdx(S), oppStyle: styleIdx(O), shape: Object.keys(FORMATIONS).indexOf(S.ip), oppShape: Object.keys(FORMATIONS).indexOf(O.ip),
    fit: fitOverall(S), oppFit: fitOverall(O), passPct: Math.round(100 * (S.st.pc || 0) / (S.st.pa || 1)), oppPassPct: Math.round(100 * (O.st.pc || 0) / (O.st.pa || 1)),
    regains: S.st.cp || 0, oppRegains: O.st.cp || 0, duels: duelShare(S, O), offsides: S.st.off || 0 };
}
// 0-4 for the five styles, 5 for a custom tactic.
const styleIdx = S => { const k = styleOf(S); return k ? STYLE_IDX.indexOf(k) : 5; };
const styleKey = S => styleOf(S) || 'custom';
// Average tactic fit (%) over the areas this side's instructions switch on (50 when nothing special is asked).
function fitOverall(S) {
  const on = Object.entries(FIT_AREAS).filter(([, F]) => F.on(S)).map(([a]) => (S.fit ? S.fit[a] : 0));
  return on.length ? fitPct(on.reduce((t, v) => t + v, 0) / on.length) : 50;
}
// Share of individual contests won (dribbles, tackles, interceptions, aerial duels, blocks) by S.
function duelShare(S, O) {
  const won = X => Object.values(X.ps || {}).reduce((t, x) => t + (x.dw || 0) + (x.tk || 0) + (x.int || 0) + (x.aer || 0) + (x.blk || 0), 0);
  const a = won(S), b = won(O);
  return a + b ? Math.round(100 * a / (a + b)) : 50;
}
function sitKey(f) {
  const mb = f.min < 55 ? 'HT' : f.min < 65 ? '60' : f.min < 75 ? '70' : '80';
  const s = f.str < 0.92 ? 'weaker' : f.str > 1.08 ? 'stronger' : 'even';
  const k = [mb, clamp(f.diff, -2, 2), s, f.cond < 70 ? 'tired' : 'fresh', f.reds > 0 ? 'man down' : f.reds < 0 ? 'man up' : '11v11'];
  // The team's style is part of the situation: what works for a pressing side may not work for a possession side.
  if (f.style != null) k.push(STYLE_IDX[f.style] || 'custom');
  return k.join('|');
}
function sitLabel(key) {
  const [mb, d, s, c, r, st] = key.split('|');
  const score = +d > 0 ? `winning by ${d}` : +d < 0 ? `losing by ${-d}` : 'level';
  return `${mb === 'HT' ? 'Half-time' : mb + "'"}, ${score}, ${s}, ${c}${r === '11v11' ? '' : ', ' + r}${st ? ', ' + (STYLES[st] ? STYLES[st].n : 'custom tactic') : ''}`;
}
function sitText(M, S, f) {
  const O = M.sides[1 - S.idx], tot = S.st.pos + O.st.pos || 1;
  return `Football match, minute ${f.min}. You manage the ${clubName(S.cid)} (${f.home ? 'home' : 'away'}) against the ${clubName(O.cid)}. ` +
    `Score ${S.st.g}-${O.st.g}, you are ${f.diff > 0 ? 'winning' : f.diff < 0 ? 'losing' : 'level'}. ` +
    `Your team is ${f.str < 0.92 ? 'weaker than' : f.str > 1.08 ? 'stronger than' : 'about equal to'} the opponent (strength ratio ${f.str}). ` +
    `Your outfield players have ${f.cond}% energy left. Red cards: you ${S.reds.length}, them ${O.reds.length}. ` +
    `Shots: you ${S.st.sh} (${S.st.sot} on target), them ${O.st.sh} (${O.st.sot} on target). Possession ${Math.round(S.st.pos / tot * 100)}%. ` +
    `Current mentality ${INSTRUCTIONS[0].o[S.ment]}, pressing ${INSTRUCTIONS[4].o[S.press]}. Substitutions left: ${f.subs}. ` +
    `Your style: ${styleOf(S) ? STYLES[styleOf(S)].n : 'custom'} (players suit it ${f.fit}%); theirs: ${styleOf(O) ? STYLES[styleOf(O)].n : 'custom'} (${f.oppFit}%). ` +
    `Pass accuracy you ${f.passPct}%, them ${f.oppPassPct}%. You win ${f.duels}% of individual duels. Balls won back high: you ${f.regains}, them ${f.oppRegains}.`;
}

/* ---------- policies ---------- */
function rulesDecision(M, S) {
  const f = situation(M, S), O = M.sides[1 - S.idx];
  if (f.diff < 0 && f.min >= 70) return 'attack';
  if (f.diff === 1 && f.min >= 80) return 'defend';
  if (f.cond < 68 && f.min >= 60) return 'fresh';
  if (f.diff > 0 && f.min >= 70 && f.cond < 75) return 'protect';
  if (f.min <= 60 && f.fit < 45 && styleKey(S) !== bestStyleFor(M, S)) return 'restyle';
  if (O.st.sh - S.st.sh >= 6 && f.duels < 45) return 'mark';
  if (f.diff < 0 && f.possession < 42 && f.min <= 70 && (S.fit ? S.fit.press : 0) > 0.1) return 'cpress';
  if (f.diff >= 0 && f.str < 0.92 && (O.line ?? 1) === 2 && (S.won ?? 1) !== 2) return 'counter';
  return 'hold';
}
// Value of each option in a bucket: average outcome shrunk toward zero, plus a small teacher bonus.
function bucketScores(table, key) {
  const b = table && table[key];
  if (!b) return null;
  const n = sum(Object.values(b), x => x.n), tv = sum(Object.values(b), x => x.tv || 0);
  const scores = {};
  Object.keys(MGR_OPTIONS).forEach(o => {
    const x = b[o] || { n: 0, sum: 0, tv: 0 };
    scores[o] = x.sum / (x.n + 3) + (tv ? 0.25 * (x.tv || 0) / tv : 0);
  });
  return { n, scores };
}
function tablePick(table, key, minN) {
  const s = bucketScores(table, key);
  if (!s || s.n < minN) return null;
  return Object.entries(s.scores).sort((a, b) => b[1] - a[1])[0][0];
}

/* ---------- applying a decision ---------- */
function bestBenchFor(S, pred, pos) {
  return S.bench.map(id => G.players[id]).filter(p => p && pred(p)).sort((a, b) => (pos ? ovrAt(b, pos) - ovrAt(a, pos) : b.ca - a.ca))[0];
}
function applyMgrOption(M, S, opt) {
  const evs = [], tired = () => onPitch(S).filter(x => x.pos !== 'GK').sort((a, b) => S.cond[a.p.id] - S.cond[b.p.id]);
  const sub = (out, inn) => { if (out && inn && canSub(M, S)) { const e = makeSub(M, S, out.p.id, inn.id); if (e) evs.push(e); } };
  if (opt === 'attack') {
    S.ment = Math.min(4, S.ment + 1);
    const out = tired().find(x => POS_GROUP[x.pos] !== 'ATT');
    sub(out, bestBenchFor(S, p => POS_GROUP[p.pos] === 'ATT'));
  } else if (opt === 'defend') {
    S.ment = Math.max(0, S.ment - 1);
    const out = tired().find(x => POS_GROUP[x.pos] === 'ATT');
    sub(out, bestBenchFor(S, p => POS_GROUP[p.pos] === 'DEF' || p.pos === 'DM'));
  } else if (opt === 'press') {
    S.press = 2;
  } else if (opt === 'fresh') {
    tired().slice(0, 2).forEach(x => sub(x, bestBenchFor(S, p => p.pos !== 'GK', x.pos)));
  } else if (opt === 'restyle') {
    const k = bestStyleFor(M, S);
    Object.assign(S, STYLES[k].ins);
    if (!S.user) { const t = { ...S, style: k }; chooseRoles(t, S.on); S.roles = t.roles; } // keeps the shape; roles suit the players on the pitch
  } else if (opt === 'counter') {
    Object.assign(S, { line: 0, press: 0, won: 2, lost: 0, ment: Math.max(1, S.ment - 1) });
  } else if (opt === 'cpress') {
    Object.assign(S, { lost: 2, press: 2 });
  } else if (opt === 'protect') {
    S.on.forEach((id, i) => {
      if (!id || !i) return;
      const pos = FORMATIONS[S.ip][i][0], pi = S.pi[i] || (S.pi[i] = {});
      if (['DL', 'DR', 'DM'].includes(pos) || (LINE[pos] === 3 && S.cond[id] < 70)) pi.fw = 0;
      if (S.cond[id] < 65) pi.pr = 0;
    });
  } else if (opt === 'mark') {
    S.on.forEach((id, i) => {
      if (!id || !i) return;
      const pos = FORMATIONS[S.ip][i][0];
      if (LINE[pos] <= 2) { const pi = S.pi[i] || (S.pi[i] = {}); pi.mk = 2; pi.tk = 0; }
    });
  }
  if (opt !== 'hold') { M.dirty = true; evs.unshift({ min: M.min, side: S.idx, t: 'tac', opt }); }
  return evs;
}

// The style the players on the pitch suit best, leaning attacking when chasing a game and safer when ahead.
function bestStyleFor(M, S) {
  const f = situation0(M, S), r = {};
  Object.keys(STYLES).forEach(k => {
    const t = { ...S, ...STYLES[k].ins };
    const fit = tacticFit(t, (i, a) => av(S, i, a)).area;
    const on = Object.entries(FIT_AREAS).filter(([, F]) => F.on(t)).map(([a]) => fit[a]);
    let sc = on.length ? fitPct(on.reduce((x, v) => x + v, 0) / on.length) : 50;
    if (f.diff < 0 && STYLES[k].ins.ment >= 3) sc += 6;
    if (f.diff > 0 && STYLES[k].ins.ment <= 1) sc += 6;
    r[k] = sc;
  });
  return Object.entries(r).sort((a, b) => b[1] - a[1])[0][0];
}
const situation0 = (M, S) => ({ diff: S.st.g - M.sides[1 - S.idx].st.g });

/* ---------- recording ---------- */
function logDecision(M, S, f, opt, src, extra = {}) {
  const cfg = aiCfg();
  const e = { t: Date.now(), key: sitKey(f), f, opt, src, at: [S.st.g, M.sides[1 - S.idx].st.g], out: null,
    cloudMeta: { app: GAME_VERSION, engine: brainCloudEngine(), kind: M.camp ? 'camp' : M.instant ? 'instant' : M.live ? 'live' : 'background',
      match: M.brainId || (M.brainId = brainCloudUuid()), side: S.idx, mode: brain().mode, jevModel: cfg.jev.model, dsModel: cfg.ds.model }, ...extra };
  (M.dec = M.dec || []).push([S.idx, e]);
  return e;
}

// Decision for a computer-managed side in a normal league match (synchronous).
function brainDecide(M, S) {
  const B = brain(), f = situation(M, S), key = sitKey(f), V = activeVersion();
  const learned = V ? tablePick(V.table, key, B.minN) : null;
  const fallback = () => (learned ? [learned, 'learned'] : [rulesDecision(M, S), 'rules']);
  if (B.mode === 'rules') { const o = rulesDecision(M, S); logDecision(M, S, f, o, 'rules'); return applyMgrOption(M, S, o); }
  const wantTeacher = M.live && teacherReady() && (B.mode === 'teacher' || (B.mode === 'hybrid' && !learned));
  if (B.mode === 'hybrid' && learned && M.live && teacherReady()) B.saved.skipped++;
  if (!wantTeacher) { const [o, src] = fallback(); logDecision(M, S, f, o, src); return applyMgrOption(M, S, o); }
  // Live match: ask the teacher in the background, keep playing, apply the answer when it arrives.
  const e = logDecision(M, S, f, 'hold', 'pending');
  B.saved.calls++;
  askTeacher(M, S, f).then(r => {
    if (M.ended) { e.src = 'late'; return; }
    Object.assign(e, { opt: r.opt, src: r.src, conf: r.conf, second: r.second || null, jev: r.jev || null });
    const evs = applyMgrOption(M, S, r.opt);
    if (M.onAsync) M.onAsync(evs);
  }).catch(() => {
    if (M.ended) return;
    const [o, src] = fallback();
    Object.assign(e, { opt: o, src });
    const evs = applyMgrOption(M, S, o);
    if (M.onAsync) M.onAsync(evs);
  });
  return [];
}

const teacherReady = () => aiReady('jev', 'manager');
const brainModeAvailable = mode => mode === 'rules' || (mode === 'learned' ? !!activeVersion() : mode === 'teacher' ? teacherReady() : mode === 'hybrid' && (!!activeVersion() || teacherReady()));

async function askTeacher(M, S, f) {
  const B = brain();
  const res = await jevAsk(sitText(M, S, f), { decision: { type: 'choice', instructions: 'The single best change this manager should make right now to get the best result', criteria: MGR_OPTIONS } }, 'Manager decision');
  const a = res.answers && res.answers.decision;
  if (!a || !MGR_OPTIONS[a.choice]) throw new Error('Unexpected Jev answer');
  const out = { opt: a.choice, conf: a.confidence ?? 1, src: 'jev', jev: a.choice };
  if (out.conf < B.conf && aiReady('ds', 'second')) {
    try {
      const r = await dsChat([
        { role: 'system', content: 'You are an experienced football manager. Pick exactly one option. Reply only with JSON like {"choice":"attack"}. Options: ' + Object.entries(MGR_OPTIONS).map(([k, v]) => `${k} = ${v}`).join('; ') + '.' },
        { role: 'user', content: sitText(M, S, f) },
      ], 'Second opinion', { json: true, maxTokens: 30 });
      const c = JSON.parse(r.text).choice;
      if (MGR_OPTIONS[c]) { out.second = c; out.opt = c; out.src = 'deepseek'; }
    } catch (e) { /* keep Jev's answer */ }
  }
  return out;
}

/* ---------- judging ---------- */
const ptsOf = d => (d > 0 ? 3 : d === 0 ? 1 : 0);
function brainScore(M) {
  if (!M.dec || !M.dec.length || M.noLog || M.brainScored) return;
  const B = brain();
  brainCloudInit(B); M.brainScored = true;
  M.dec.forEach(([si, e]) => {
    if (e.src === 'pending' || e.src === 'late') return;
    const S = M.sides[si], O = M.sides[1 - si];
    const gf = S.st.g - e.at[0], ga = O.st.g - e.at[1];
    e.out = Math.round(((gf - ga) + 1.5 * (ptsOf(S.st.g - O.st.g) - ptsOf(e.at[0] - e.at[1]))) * 100) / 100;
    e.score = [S.st.g, O.st.g];
    const b = B.draft[e.key] || (B.draft[e.key] = {});
    const x = b[e.opt] || (b[e.opt] = { n: 0, sum: 0, tv: 0 });
    x.n++; x.sum = Math.round((x.sum + e.out) * 100) / 100;
    if (e.src === 'jev' || e.src === 'deepseek') x.tv++;
    B.log.push(e);
    brainCloudRecord(B, e);
  });
  if (B.log.length > 2000) B.log.splice(0, B.log.length - 2000);
  if (!M.camp) brainSave();
}

/* ---------- versions ---------- */
function saveVersion(name) {
  const B = brain();
  const v = { id: Date.now(), name: name || 'v' + (B.versions.length + 1), date: Date.now(), table: JSON.parse(JSON.stringify(B.draft)), tune: G && G.tune ? { ...G.tune } : {}, buckets: Object.keys(B.draft).length, decisions: sum(Object.values(B.draft), b => sum(Object.values(b), x => x.n)), ab: null };
  B.versions.unshift(v);
  brainSave();
  return v;
}
function activateVersion(id) {
  const B = brain();
  B.active = id;
  const v = activeVersion();
  if (v && G) G.tune = { ...v.tune };
  if (!v && B.mode === 'learned') B.mode = 'rules';
  brainSave(); saveGame();
}

/* ---------- head-to-head test (A vs B) ---------- */
// Each pairing is played twice with sides swapped, so club strength cancels out.
function headToHead(tableA, tableB, pairs = 100) {
  const B = brain(), ids = plClubs().filter(id => id !== G.club);
  let ptsA = 0, ptsB = 0, gdA = 0, games = 0;
  for (let i = 0; i < pairs; i++) {
    const h = pick(ids); let a = pick(ids); while (a === h) a = pick(ids);
    [[tableA, tableB], [tableB, tableA]].forEach(([th, ta], swap) => {
      const M = createMatch({ id: -1, h, a });
      M.noLog = true;
      const pol = [th, ta];
      while (!M.ended) {
        simMinute(M);
        M.sides.forEach(S => {
          injurySubs(M, S);
          if (CHECKPOINTS.includes(M.min)) {
            const key = sitKey(situation(M, S));
            applyMgrOption(M, S, (pol[S.idx] && tablePick(pol[S.idx], key, B.minN)) || rulesDecision(M, S));
          }
        });
      }
      const [H, W] = M.sides, aSide = swap ? W : H, bSide = swap ? H : W;
      ptsA += ptsOf(aSide.st.g - bSide.st.g); ptsB += ptsOf(bSide.st.g - aSide.st.g); gdA += aSide.st.g - bSide.st.g; games++;
    });
  }
  return { games, ppgA: Math.round(ptsA / games * 100) / 100, ppgB: Math.round(ptsB / games * 100) / 100, gdA };
}

/* ---------- training camp (simulated matches with no effect on your save) ---------- */
async function campMatch(useTeacher) {
  const B = brain(), ids = plClubs().filter(id => id !== G.club);
  const h = pick(ids); let a = pick(ids); while (a === h) a = pick(ids);
  const M = createMatch({ id: -1, h, a });
  M.camp = true; M.dec = [];
  let calls = 0;
  while (!M.ended) {
    simMinute(M);
    for (const S of M.sides) {
      injurySubs(M, S);
      if (!CHECKPOINTS.includes(M.min)) continue;
      const f = situation(M, S), key = sitKey(f);
      let opt = null, src = null, extra = {};
      if (useTeacher) {
        try { const r = await askTeacher(M, S, f); opt = r.opt; src = r.src; extra = { conf: r.conf, second: r.second || null, jev: r.jev }; calls++; } catch (e) { /* fall through to exploring */ }
      }
      if (!opt && R() < B.explore) { opt = pick(Object.keys(MGR_OPTIONS)); src = 'explore'; }
      if (!opt) { opt = tablePick(B.draft, key, B.minN); src = 'learned'; }
      if (!opt) { opt = rulesDecision(M, S); src = 'rules'; }
      logDecision(M, S, f, opt, src, extra);
      applyMgrOption(M, S, opt);
    }
  }
  brainScore(M);
  return { calls, decisions: M.dec.length };
}

/* ---------- reports for the admin page ---------- */
function brainStats() {
  const B = brain(), bySrc = {};
  B.log.forEach(e => { if (e.out == null) return; const s = bySrc[e.src] || (bySrc[e.src] = { n: 0, sum: 0 }); s.n++; s.sum += e.out; });
  const keys = Object.keys(B.draft), total = sum(keys, k => sum(Object.values(B.draft[k]), x => x.n));
  const confident = keys.filter(k => sum(Object.values(B.draft[k]), x => x.n) >= B.minN).length;
  const disagree = B.log.filter(e => e.second && e.jev && e.second !== e.jev).length;
  return { bySrc, buckets: keys.length, confident, total, disagree };
}

/* ---------- DeepSeek text library: press conference questions ---------- */
function pressPool() { return PRESS.concat(brain().press.filter(p => p.ok)); }
function pickPress() { const pool = pressPool(), q = pick(pool); if (q.id) { q.used = (q.used || 0) + 1; brainSave(); } return JSON.parse(JSON.stringify({ q: q.q, a: q.a })); }

async function generatePress(n = 5) {
  const r = await dsChat([
    { role: 'system', content: 'You write content for a mobile football manager game set in an English top division with nickname clubs (Gunners, Reds, Citizens and so on). Reply only with JSON.' },
    { role: 'user', content: `Write ${n} different pre-match press conference questions a journalist might ask the manager. For each, give exactly 3 possible manager answers and the effect of each answer on squad morale (mor), fan confidence (fan) and board confidence (board), each an integer from -3 to 3. Vary the tone: confident, cautious, combative. Keep questions under 25 words and answers under 15 words. JSON shape: {"questions":[{"q":"...","answers":[{"text":"...","mor":0,"fan":0,"board":0}]}]}` },
  ], 'Press library', { json: true, maxTokens: 1500 });
  let data;
  try { data = JSON.parse(r.text); } catch (e) { throw new Error('DeepSeek did not return valid JSON. Try again.'); }
  const B = brain(), clean = v => clamp(Math.round(Number(v) || 0), -3, 3), added = [];
  (data.questions || []).forEach(x => {
    if (!x || typeof x.q !== 'string' || !Array.isArray(x.answers) || x.answers.length !== 3) return;
    const a = x.answers.map(y => [String(y.text || '').slice(0, 120), { mor: clean(y.mor), fan: clean(y.fan), board: clean(y.board) }]);
    if (a.some(y => !y[0])) return;
    const item = { id: Date.now() + added.length, q: x.q.slice(0, 200), a, ok: false, used: 0, date: Date.now() };
    B.press.unshift(item); added.push(item);
  });
  brainSave();
  return added.length;
}
