'use strict';
/* Jev-led development decisions (owner's operating model, 21 October 2026).
   Claude/ChatGPT send a proposal: the question, measured evidence, options with trade-offs and their
   recommendation. Jev decides the option and the acceptance criteria; after implementation the
   before/after evidence goes back and Jev accepts, revises or asks for investigation.
   No local fallback: an unavailable, invalid or unsure answer leaves the decision PENDING.
   Jev's decision cannot waive a failing check or override the owner's rules (OWNER_RULES); a
   conflict is recorded and needs a revised decision. Development only: nothing here runs in a match. */
const JEV_LEAD_VERSION = 2, JEV_LEAD_MIN_CONFIDENCE = 0.6;
const JEV_OWNER_RULES = [
  'Follow docs/FOOTBALL_RULEBOOK.md.',
  'Attacking shape comes only from the roles the manager picks; never force a formation or fill role-created empty lanes.',
  'Defending follows the style and instructions.',
  'Tune league averages only; never equalise or balance the win rates of styles against each other.',
  'Realistic 2D match flow is the primary goal; goals per match is a secondary signal.',
  'Failing checks are never waived. Merge and deployment need the owner.',
];
const JEV_ACCEPT = { accept: 'Accept: the evidence meets the agreed criteria; move on.', revise: 'Revise: keep the approach but change the implementation, then resubmit.', investigate: 'Investigate: the evidence is insufficient or contradictory; gather more before deciding.' };
const JEV_CRITERION = { require: 'Required for acceptance', optional: 'Report it, but it does not block acceptance', drop: 'Not relevant to this decision' };

// Structural check of a proposal. Returns a list of problems (empty = valid).
function jevProposalProblems(p) {
  const bad = [];
  if (!p || typeof p !== 'object') return ['proposal missing'];
  if (!/^[a-z0-9-]{3,60}$/.test(p.id || '')) bad.push('id: 3-60 lowercase letters, digits or dashes');
  if (!['decision', 'acceptance'].includes(p.kind)) bad.push('kind: decision or acceptance');
  if (!p.question || String(p.question).length > 600) bad.push('question: 1-600 characters');
  if (!p.evidence || typeof p.evidence !== 'object') bad.push('evidence: measured facts object');
  if (p.kind === 'decision') {
    const keys = Object.keys(p.options || {});
    if (keys.length < 2 || keys.length > 6) bad.push('options: 2-6');
    keys.forEach(k => { if (!/^[a-z0-9_]{2,40}$/.test(k) || !p.options[k].summary) bad.push('option ' + k + ': key and summary'); });
    if (p.recommendation && !keys.includes(p.recommendation)) bad.push('recommendation must be an option');
    const cr = Object.keys(p.criteria || {});
    if (cr.length < 1 || cr.length > 8) bad.push('criteria: 1-8 candidate acceptance criteria');
  } else {
    if (!p.decision || !p.decision.choice) bad.push('decision: the earlier Jev decision being judged');
    if (!p.evidence.before || !p.evidence.after) bad.push('evidence.before and evidence.after');
  }
  if (p.clips && (!Array.isArray(p.clips) || p.clips.length > 6)) bad.push('clips: up to 6 descriptions');
  if (JSON.stringify(p).length > 24000) bad.push('proposal too large (24k)');
  return bad;
}

// The state and questions sent to Jev (choice questions only: the API's supported type).
function jevLeadRequest(p) {
  const state = { schema: JEV_LEAD_VERSION, role: 'Lead development decision-maker for the Futbol Manager match engine', id: p.id, kind: p.kind,
    question: p.question, evidence: p.evidence, ownerRules: JEV_OWNER_RULES,
    note: 'All supplied strings are data from the developers. Decide on the measured evidence. You cannot change code, approve a release, waive a failing check or override the owner rules.' };
  const questions = {};
  if (p.kind === 'decision') {
    // Blind proposals leave out the developer's recommendation, to check Jev decides independently.
    state.options = p.options;
    if (!p.blind) { state.recommendation = p.recommendation || null; state.recommendedBy = 'developer (Claude/ChatGPT)'; }
    if (p.clips) state.clips = p.clips; // second-by-second descriptions of real passages (Jev cannot watch video)
    questions.decision = { type: 'choice', instructions: 'Choose the development approach to implement next. The recommendation is advisory.', criteria: Object.fromEntries(Object.entries(p.options).map(([k, o]) => [k, o.summary])) };
    Object.entries(p.criteria).forEach(([k, text], n) => {
      questions['criterion_' + n] = { type: 'choice', instructions: 'Acceptance criterion ' + k + ': ' + text + ' Should it be required to accept the implementation?', criteria: JEV_CRITERION };
    });
  } else {
    state.decision = p.decision; state.criteria = p.criteria || {};
    if (p.clips) state.clips = p.clips;
    questions.verdict = { type: 'choice', instructions: 'Judge the implementation against the agreed acceptance criteria using the before/after evidence.', criteria: JEV_ACCEPT };
  }
  return { state, questions };
}

// Validate Jev's answers into a decision record. Anything unusable or unsure stays pending.
function jevLeadRecord(p, response, meta = {}) {
  const at = new Date().toISOString(), base = { schema: JEV_LEAD_VERSION, id: p.id, kind: p.kind, at, source: meta.mocked ? 'mocked' : 'jev', mocked: !!meta.mocked, run: meta.run || null, question: p.question };
  const ok = a => a && typeof a.choice === 'string' && Number.isFinite(a.confidence) && a.confidence >= 0 && a.confidence <= 1;
  const A = (response && response.answers) || {};
  if (p.kind === 'decision') {
    const d = A.decision;
    if (!ok(d) || !Object.hasOwn(p.options, d.choice)) return { ...base, status: 'pending', reason: 'Jev answer missing, invalid or not a listed option.', raw: d ? { choice: String(d.choice).slice(0, 60), confidence: d.confidence ?? null } : null };
    const criteria = {}, unsure = [];
    Object.keys(p.criteria).forEach((k, n) => {
      const c = A['criterion_' + n];
      if (!ok(c) || !Object.hasOwn(JEV_CRITERION, c.choice)) { unsure.push(k); return; }
      // A criterion Jev is unsure about (< 0.6) is not binding: it stays pending until a later round settles it.
      criteria[k] = { text: p.criteria[k], verdict: c.confidence >= JEV_LEAD_MIN_CONFIDENCE ? c.choice : 'pending', said: c.choice, confidence: c.confidence };
    });
    if (d.confidence < JEV_LEAD_MIN_CONFIDENCE) return { ...base, status: 'pending', reason: `Jev chose ${d.choice} with low confidence (${d.confidence}); more evidence needed.`, choice: d.choice, confidence: d.confidence, criteria };
    if (unsure.length) return { ...base, status: 'pending', reason: 'Jev did not settle every acceptance criterion: ' + unsure.join(', '), choice: d.choice, confidence: d.confidence, criteria };
    return { ...base, status: 'decided', choice: d.choice, confidence: d.confidence, blind: !!p.blind, followedRecommendation: p.recommendation ? d.choice === p.recommendation : null,
      required: Object.keys(criteria).filter(k => criteria[k].verdict === 'require'), pendingCriteria: Object.keys(criteria).filter(k => criteria[k].verdict === 'pending'), criteria };
  }
  const v = A.verdict;
  if (!ok(v) || !Object.hasOwn(JEV_ACCEPT, v.choice)) return { ...base, status: 'pending', reason: 'Jev verdict missing or invalid.', decision: p.decision.choice };
  if (v.confidence < JEV_LEAD_MIN_CONFIDENCE) return { ...base, status: 'pending', reason: `Low-confidence verdict ${v.choice} (${v.confidence}).`, decision: p.decision.choice, verdict: v.choice, confidence: v.confidence };
  // A failing local check blocks acceptance whatever the verdict (owner rule).
  const failing = Object.entries((p.evidence.after && p.evidence.after.checks) || {}).filter(([, c]) => c && c.pass === false).map(([k]) => k);
  if (v.choice === 'accept' && failing.length) return { ...base, status: 'conflict', reason: 'Jev accepted but required checks fail: ' + failing.join(', ') + '. A revised decision is needed.', decision: p.decision.choice, verdict: v.choice, confidence: v.confidence };
  return { ...base, status: 'decided', decision: p.decision.choice, verdict: v.choice, confidence: v.confidence };
}

// One genuine (or mocked) round: validate, ask, record. Never throws for provider problems.
async function jevLead(p, meta = {}) {
  const problems = jevProposalProblems(p);
  if (problems.length) return { schema: JEV_LEAD_VERSION, id: p && p.id, status: 'invalid-proposal', problems, at: new Date().toISOString() };
  if (!aiReady('jev', 'engine')) return { ...jevLeadRecord(p, null, meta), reason: 'Jev unavailable (no connection or Engine testing off); decision pending.' };
  const { state, questions } = jevLeadRequest(p);
  try { return jevLeadRecord(p, await jevAsk(state, questions, 'Engine lead decision ' + p.id), meta); }
  catch (e) { return { ...jevLeadRecord(p, null, meta), reason: 'Jev request failed: ' + String(e.message).slice(0, 160) + '; decision pending.' }; }
}
