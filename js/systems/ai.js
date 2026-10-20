'use strict';
/* ===== ai.js =====
   Connection layer for the two AI services, configured on the admin page.
   - Jev (TypeSafe): fast structured decisions (choice / score / yes-no). No text.
   - DeepSeek: written text (press questions, player replies, reports, news).
   Settings live in their own browser storage key, never inside the game save,
   so exporting a save never leaks an API key. */

const AI_KEY = 'futbol-manager:ai';
const JEV_RELAY_URL = 'https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-jev';

// Prices in US$ per 1M tokens, checked Oct 2026. DeepSeek peak = Mon-Fri 01:00-04:00 and 06:00-10:00 UTC.
const AI_PRICES = {
  jev: { in: 0.042, out: 0 },
  'deepseek-flash': { hit: [0.003, 0.006], miss: [0.15, 0.3], out: [0.6, 1.2] },
  'deepseek-v4-pro': { hit: [0.022, 0.044], miss: [0.66, 1.32], out: [1.98, 3.96] },
};
const JEV_MODELS = [['jev-latest', 'jev-latest (stable, recommended)'], ['jev-preview', 'jev-preview (newest build)'], ['jev-1.14.0', 'jev-1.14.0 (pinned)'], ['jev-1.13.0', 'jev-1.13.0 (pinned)']];
const DS_MODELS = [['deepseek-flash', 'deepseek-flash (cheapest, recommended)'], ['deepseek-v4-pro', 'deepseek-v4-pro (stronger, ~4x price)']];

// Game features each service can drive. Saved now; wired in when each feature is built.
const AI_FEATURES = {
  jev: [['manager', 'Computer managers: in-match changes'], ['react', 'Player and press reactions to what you say'], ['transfer', 'Transfer decisions (accept, counter, join)'], ['advice', 'Assistant tactical advice']],
  ds: [['second', 'Second opinion when Jev is unsure (manager decisions)'], ['press', 'Press conference questions'], ['talks', 'Player conversation replies'], ['report', 'Match reports'], ['news', 'News stories and rumours']],
};

function aiDefaults() {
  return {
    jev: { on: false, mode: 'relay', relaySetup: 1, key: '', proxy: JEV_RELAY_URL, model: 'jev-latest', timeout: 10000, budget: 2, feat: {} },
    ds: { on: false, mode: 'direct', key: '', proxy: '', base: 'https://api.deepseek.com', model: 'deepseek-flash', thinking: false, maxTokens: 300, temp: 0.9, timeout: 20000, budget: 3, feat: {} },
    usage: {}, log: [],
  };
}
let AICFG = null;
function aiCfg() {
  if (AICFG) return AICFG;
  AICFG = aiDefaults();
  try {
    const s = JSON.parse(localStorage.getItem(AI_KEY) || 'null');
    if (s) {
      ['jev', 'ds'].forEach(k => { AICFG[k] = { ...AICFG[k], ...(s[k] || {}) }; });
      AICFG.usage = s.usage || {};
      AICFG.log = s.log || [];
      if (s.jev && !s.jev.relaySetup && s.jev.mode === 'direct') {
        AICFG.jev.mode = 'relay'; AICFG.jev.proxy = JEV_RELAY_URL; AICFG.jev.timeout = Math.max(10000, AICFG.jev.timeout);
      }
      AICFG.jev.relaySetup = 1;
    }
  } catch (e) { /* storage blocked: keep defaults for this session */ }
  return AICFG;
}
function aiSave() { try { localStorage.setItem(AI_KEY, JSON.stringify(aiCfg())); return true; } catch (e) { return false; } }

const monthKey = () => new Date().toISOString().slice(0, 7);
function aiUsage(svc) {
  const u = aiCfg().usage, m = monthKey();
  if (!u[m]) u[m] = {};
  if (!u[m][svc]) u[m][svc] = { calls: 0, fails: 0, inTok: 0, outTok: 0, cost: 0, ms: 0 };
  return u[m][svc];
}
function dsPeak(d = new Date()) {
  const day = d.getUTCDay(), h = d.getUTCHours();
  return day >= 1 && day <= 5 && ((h >= 1 && h < 4) || (h >= 6 && h < 10));
}
function dsCost(model, usage) {
  const P = AI_PRICES[model] || AI_PRICES['deepseek-flash'], i = dsPeak() ? 1 : 0;
  const hit = usage.prompt_cache_hit_tokens || 0;
  const miss = usage.prompt_cache_miss_tokens ?? Math.max(0, (usage.prompt_tokens || 0) - hit);
  return (hit * P.hit[i] + miss * P.miss[i] + (usage.completion_tokens || 0) * P.out[i]) / 1e6;
}

function aiRecord(svc, ok, ms, inTok, outTok, cost, note) {
  const u = aiUsage(svc);
  u.calls++; if (!ok) u.fails++;
  u.inTok += inTok; u.outTok += outTok; u.cost += cost; u.ms += ms;
  const L = aiCfg().log;
  L.unshift({ t: Date.now(), svc, ok, ms, inTok, outTok, cost, note: String(note).slice(0, 140) });
  L.length = Math.min(L.length, 30);
  aiSave();
}

async function aiFetch(url, body, headers, timeout) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctl.signal });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { /* not JSON */ }
    if (!r.ok) {
      const msg = (data && (data.error && (data.error.message || data.error) || data.detail || data.message)) || text.slice(0, 160);
      throw new Error(`HTTP ${r.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg).slice(0, 160)}`);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`No reply within ${timeout / 1000}s.`);
    if (e instanceof TypeError) throw new Error('Could not reach the AI server. Check your internet connection and URL. Direct browser requests may be blocked (CORS); use a relay you control.');
    throw e;
  } finally { clearTimeout(timer); }
}

// True when a service is switched on, has a key or proxy, and (optionally) a feature is ticked.
function aiReady(svc, feat) {
  const c = aiCfg()[svc];
  return !!(c.on && (c.mode === 'direct' ? c.key : c.mode === 'relay' ? c.key && c.proxy : c.proxy) && (!feat || c.feat[feat]));
}

function aiGuard(svc) {
  const c = aiCfg()[svc];
  if (c.mode !== 'proxy' && !c.key) throw new Error('Add an API key first.');
  if (c.mode !== 'direct' && !c.proxy) throw new Error('Add a proxy URL first.');
  if (aiUsage(svc).cost >= c.budget) throw new Error(`Monthly budget of $${c.budget} reached. Raise it to continue.`);
}

// Jev: questions = { id: { type: 'choice'|'score'|'noul', instructions, criteria } }
async function jevAsk(state, questions, note = 'request', opts = {}) {
  const c = aiCfg().jev;
  aiGuard('jev');
  const url = c.mode === 'direct' ? 'https://api.typesafe.ai/v1/systemone' : c.proxy.replace(/\/$/, '').replace(/\/v1\/systemone$/, '') + '/v1/systemone';
  const headers = c.mode === 'proxy' ? {} : { Authorization: 'Bearer ' + c.key };
  const t0 = performance.now();
  try {
    const res = await aiFetch(url, { model: c.model, state, questions }, headers, opts.timeout || c.timeout);
    const ms = Math.round(performance.now() - t0), inTok = (res.usage && res.usage.input_tokens) || 0;
    aiRecord('jev', true, ms, inTok, (res.usage && res.usage.output_tokens) || 0, inTok * AI_PRICES.jev.in / 1e6, note);
    return { ...res, ms };
  } catch (e) { aiRecord('jev', false, Math.round(performance.now() - t0), 0, 0, 0, note + ': ' + e.message); throw e; }
}

// DeepSeek chat completion (OpenAI format). Returns { text, usage, cost, ms }.
async function dsChat(messages, note = 'request', opts = {}) {
  const c = aiCfg().ds;
  aiGuard('ds');
  const base = (c.mode === 'proxy' ? c.proxy : c.base).replace(/\/$/, '');
  const headers = c.mode === 'proxy' ? {} : { Authorization: 'Bearer ' + c.key };
  const body = { model: c.model, messages, max_tokens: opts.maxTokens || c.maxTokens, thinking: { type: c.thinking ? 'enabled' : 'disabled' } };
  if (!c.thinking) body.temperature = c.temp;
  if (opts.json) body.response_format = { type: 'json_object' };
  const t0 = performance.now();
  try {
    const res = await aiFetch(base + '/chat/completions', body, headers, c.timeout);
    const ms = Math.round(performance.now() - t0), u = res.usage || {}, cost = dsCost(c.model, u);
    aiRecord('ds', true, ms, u.prompt_tokens || 0, u.completion_tokens || 0, cost, note);
    return { text: (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content || '').trim(), usage: u, cost, ms, model: res.model };
  } catch (e) { aiRecord('ds', false, Math.round(performance.now() - t0), 0, 0, 0, note + ': ' + e.message); throw e; }
}

// Rough season cost estimate from typical call sizes.
function aiSeasonEstimate() {
  const jevCalls = 380 * 3 + 38 * 4 + 120, jevTok = 1500;
  const ds = aiCfg().ds, P = AI_PRICES[ds.model] || AI_PRICES['deepseek-flash'];
  const dsCalls = 38 * 3 + 80, dsIn = 700, dsOut = ds.thinking ? 900 : 250;
  return {
    jevCalls, jevCost: jevCalls * jevTok * AI_PRICES.jev.in / 1e6,
    dsCalls, dsCostLow: dsCalls * (dsIn * P.miss[0] + dsOut * P.out[0]) / 1e6, dsCostHigh: dsCalls * (dsIn * P.miss[1] + dsOut * P.out[1]) / 1e6,
  };
}
