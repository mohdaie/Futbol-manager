'use strict';
/* ===== admin-services.js =====
   Admin page only. AI keys, AI settings and AI usage, stored in Supabase through the futbol-admin edge
   function (supabase/functions/futbol-admin). A saved key is write-only: this page only ever sees the last
   four characters. Sign-in: Google through Supabase Auth; the futbol-admin function accepts only the emails in its
   ADMIN_EMAILS secret. */

/* ---------- Sign-in: Google via Supabase Auth (implicit flow; the access token lasts an hour) ---------- */
const ADM_AUTH_KEY = 'fm-admin-auth', SUPABASE_URL = ADMIN_API_URL.replace(/\/functions\/v1\/.*$/, '');
const ADM_AUTH = { token: null, email: '', exp: 0, error: '' };
(function admAuthInit() {
  const h = new URLSearchParams(location.hash.slice(1)), q = new URLSearchParams(location.search);
  const err = h.get('error_description') || q.get('error_description');
  if (err) ADM_AUTH.error = err.replace(/\+/g, ' ');
  let saved = null;
  if (h.get('access_token')) {
    try { const p = JSON.parse(atob(h.get('access_token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); saved = { token: h.get('access_token'), email: p.email || '', exp: p.exp * 1000 }; } catch (e) { /* malformed token */ }
    try { if (saved) sessionStorage.setItem(ADM_AUTH_KEY, JSON.stringify(saved)); } catch (e) { /* storage blocked: this tab only */ }
  } else { try { saved = JSON.parse(sessionStorage.getItem(ADM_AUTH_KEY) || 'null'); } catch (e) { /* none */ } }
  if (h.get('access_token') || err) history.replaceState(null, '', location.pathname); // keep the token out of the address bar
  if (saved && saved.exp > Date.now() + 60000) Object.assign(ADM_AUTH, saved);
})();
const admSignedIn = () => !!ADM_AUTH.token && ADM_AUTH.exp > Date.now();
function admSignOut(why = '') {
  Object.assign(ADM_AUTH, { token: null, email: '', exp: 0, error: why });
  try { sessionStorage.removeItem(ADM_AUTH_KEY); } catch (e) { /* none */ }
  Object.assign(ADM_SVC, { state: null, error: '', usage: null }); Object.assign(ADM_DASH, { data: null, error: '' });
}
ACT.admSignIn = () => { location.href = SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(location.origin + location.pathname); };
ACT.admSignOut = () => { admSignOut(); render(); };
function admSignInHtml() {
  return `<div class="main admin-page"><h1 class="h1">Admin</h1><div class="card"><h3>Sign in</h3>
    <p class="muted">The admin tools are for the game's owner. Sign in with an admin Google account.</p>
    ${ADM_AUTH.error ? `<div class="aitest bad" role="alert">${esc(ADM_AUTH.error)}</div>` : ''}
    <div class="btns"><button class="btn pri" data-a="admSignIn">Sign in with Google</button></div></div>
    <p class="muted"><a href="./" data-nolink>Back to the game</a></p></div>`;
}

const ADM_SERVICES = {
  jev: { name: 'Jev (TypeSafe)', role: 'Fast structured decisions (choose, score, yes/no). It does not write text.', console: 'console.typesafe.ai/keys', models: JEV_MODELS,
    features: AI_FEATURES.jev },
  ds: { name: 'DeepSeek', role: 'Written text: press questions, replies, reports, news and the match analysis officer.', console: 'platform.deepseek.com/api_keys', models: DS_MODELS,
    features: AI_FEATURES.ds },
};
const ADM_SVC = { state: null, error: '', loading: false, test: {}, usage: null, usageBusy: false };

async function admApi(path, method = 'GET', body) {
  if (!admSignedIn()) { admSignOut('Your sign-in has expired. Sign in again.'); render(); throw new Error('Signed out.'); }
  const headers = { Authorization: 'Bearer ' + ADM_AUTH.token, ...(body ? { 'Content-Type': 'application/json' } : {}) };
  const res = await fetch(ADMIN_API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) { admSignOut(data.error || 'Sign in again.'); render(); throw new Error(data.error || 'Signed out.'); }
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ').');
  return data;
}
async function admSvcLoad(force) {
  if (ADM_SVC.loading || (ADM_SVC.state && !force) || (ADM_SVC.error && !force)) return;
  ADM_SVC.loading = true; ADM_SVC.error = '';
  try { ADM_SVC.state = await admApi('/state'); } catch (e) { ADM_SVC.error = e.message; }
  ADM_SVC.loading = false;
  if (UI.s === 'admin') render();
}

function admSvcCard(id) {
  const S = ADM_SERVICES[id], c = ADM_SVC.state.settings[id], k = ADM_SVC.state.keys[id], T = ADM_SVC.test[id];
  const live = c.on && k.set;
  return `<div class="card"><h3>${S.name} <em class="tag ${k.set ? 'good' : ''}">${k.set ? 'Key saved ••••' + esc(k.last4) : 'No key'}</em> <em class="tag ${live ? 'good' : ''}">${live ? 'On in the game' : 'Off in the game'}</em></h3>
    <p class="muted">${S.role}</p>
    <h4 class="lbl">API key</h4>
    ${fld(`Paste a key to save or replace it <small>(get one at ${S.console})</small>`, `<input id="svc-${id}-key" type="password" autocomplete="off" spellcheck="false" placeholder="${k.set ? 'Saved. Paste a new key to replace it' : 'Paste API key'}">`)}
    <div class="btns"><button class="btn pri" data-a="svcKeySave" data-svc="${id}">Save key</button>
      <button class="btn" data-a="svcTest" data-svc="${id}" ${k.set && !(T && T.pending) ? '' : 'disabled'}>${T && T.pending ? 'Testing…' : 'Test saved key'}</button>
      <button class="btn ghost" data-a="svcKeyDel" data-svc="${id}" ${k.set ? '' : 'disabled'}>Remove key</button></div>
    ${T && !T.pending ? `<div class="aitest ${T.ok ? 'ok' : 'bad'}" role="status">${esc(T.text)}</div>` : ''}
    <h4 class="lbl">Game settings</h4>
    <label class="tgl"><input id="svc-${id}-on" type="checkbox" ${c.on ? 'checked' : ''}><span>Use ${S.name} in the game for all players (needs a saved key)</span></label>
    <div class="two">
      ${fld('Model', selectHtml(`svc-${id}-model`, S.models, c.model, ''))}
      ${fld('Timeout (ms)', num(`svc-${id}-timeout`, c.timeout, 500, 'min="500" max="60000"'))}
      ${fld('Monthly budget per player device (US$)', num(`svc-${id}-budget`, c.budget, 0.5, 'min="0"'))}
      ${id === 'ds' ? fld('Max reply length (tokens)', num('svc-ds-maxTokens', c.maxTokens, 50, 'min="50" max="4000"')) + fld('Creativity (temperature 0-2)', num('svc-ds-temp', c.temp, 0.1, 'min="0" max="2"')) : ''}
    </div>
    ${id === 'ds' ? `<label class="tgl"><input id="svc-ds-think" type="checkbox" ${c.thinking ? 'checked' : ''}><span>Thinking mode (slower, costs more; not recommended)</span></label>` : ''}
    <h4 class="lbl">Use it for</h4>
    ${S.features.map(([f, n]) => `<label class="tgl"><input type="checkbox" class="svc-${id}-feat" data-k="${f}" ${c.feat[f] ? 'checked' : ''}><span>${n}</span></label>`).join('')}
    <div class="btns"><button class="btn pri" data-a="svcSave" data-svc="${id}">Save settings</button></div></div>`;
}

function admUsageHtml() {
  const d = ADM_SVC.usage, usd = n => '$' + Number(n || 0).toFixed(4), tok = n => Number(n || 0).toLocaleString('en-GB'), prov = p => (p === 'jev' ? 'Jev' : 'DeepSeek');
  if (!d) return '';
  return `<h4 class="lbl">This month</h4><div class="kv">${d.month.map(x => `<div><small>${prov(x.provider)}</small><b>${x.calls} calls · ${usd(x.cost)}</b><small>${tok(x.input)} in / ${tok(x.output)} out · ${x.ms} ms avg${+x.fails ? ` · ${x.fails} failed` : ''} · ${x.installs} device${+x.installs === 1 ? '' : 's'} with stats</small></div>`).join('') || '<div><small>No calls yet</small><b>-</b></div>'}</div>
    <h4 class="lbl">All time</h4><div class="kv">${d.total.map(x => `<div><small>${prov(x.provider)}</small><b>${x.calls} calls · ${usd(x.cost)}</b></div>`).join('') || '<div><small>None yet</small><b>-</b></div>'}</div>
    <h4 class="lbl">By feature (last 30 days)</h4><div class="list">${d.features.map(x => `<div class="row sm"><span class="grow"><b>${esc(x.feature)}</b><small>${prov(x.provider)} · ${x.calls} calls · ${tok(x.tokens)} tokens</small></span><span class="stat"><b>${usd(x.cost)}</b></span></div>`).join('') || '<p class="muted">No calls in the last 30 days.</p>'}</div>
    <h4 class="lbl">By day (last 14 days)</h4><div class="list">${d.days.map(x => `<div class="row sm"><span class="grow"><b>${x.day} · ${prov(x.provider)}</b><small>${x.calls} calls</small></span><span class="stat"><b>${usd(x.cost)}</b></span></div>`).join('') || '<p class="muted">No calls in the last 14 days.</p>'}</div>`;
}

ADMIN_TABS.svc = () => {
  if (ADM_SVC.error) return `<div class="card"><h3>AI keys</h3><p class="bad">Could not load: ${esc(ADM_SVC.error)}</p><div class="btns"><button class="btn" data-a="svcReload">Try again</button></div></div>`;
  if (!ADM_SVC.state) return '<div class="card"><p class="muted" role="status">Loading…</p></div>';
  return `<p class="note"><b>No sign-in yet.</b> Anyone who finds this page can change these settings or replace the keys. Saved keys can never be read back, only replaced or removed. Players get the settings next time the game opens.</p>
    ${admSvcCard('jev')}${admSvcCard('ds')}
    <div class="card"><h3>AI usage</h3><p class="muted">Every relay call from every player, from the database log (no keys, prompts or personal data).</p>
      <div class="btns"><button class="btn" data-a="svcUsage" ${ADM_SVC.usageBusy ? 'disabled' : ''}>${ADM_SVC.usageBusy ? 'Loading…' : ADM_SVC.usage ? 'Refresh' : 'Load usage'}</button></div>${admUsageHtml()}</div>`;
};

ACT.svcReload = () => admSvcLoad(true);
ACT.svcKeySave = async ds => {
  const el = document.getElementById(`svc-${ds.svc}-key`), value = el.value.trim();
  if (!value) return toast('Paste a key first.');
  try { ADM_SVC.state.keys = (await admApi('/secret', 'PUT', { service: ds.svc, value })).keys; ADM_SVC.test[ds.svc] = null; toast('Key saved.'); }
  catch (e) { toast(e.message); }
  render();
};
ACT.svcKeyDel = async ds => {
  if (!confirm('Remove the saved ' + ADM_SERVICES[ds.svc].name + ' key? The game will stop using it.')) return;
  try { ADM_SVC.state.keys = (await admApi('/secret?service=' + ds.svc, 'DELETE')).keys; ADM_SVC.test[ds.svc] = null; toast('Key removed.'); }
  catch (e) { toast(e.message); }
  render();
};
ACT.svcTest = async ds => {
  ADM_SVC.test[ds.svc] = { pending: true }; render();
  try { const r = await admApi('/test', 'POST', { service: ds.svc }); ADM_SVC.test[ds.svc] = { ok: r.ok, text: (r.ok ? 'Connected' : 'Failed') + (r.ms ? ' · ' + r.ms + ' ms' : '') + ' · ' + r.detail }; }
  catch (e) { ADM_SVC.test[ds.svc] = { ok: false, text: e.message }; }
  render();
};
function admReadSettings(id) {
  const el = x => document.getElementById(`svc-${id}-${x}`), n = x => Number(el(x).value), feat = {};
  document.querySelectorAll(`.svc-${id}-feat`).forEach(x => { feat[x.dataset.k] = x.checked; });
  const s = { on: el('on').checked, model: el('model').value, timeout: n('timeout'), budget: n('budget'), feat };
  if (id === 'ds') Object.assign(s, { thinking: el('think').checked, maxTokens: n('maxTokens'), temp: n('temp') });
  return s;
}
ACT.svcSave = async ds => {
  try { ADM_SVC.state.settings = (await admApi('/settings', 'PUT', { [ds.svc]: admReadSettings(ds.svc) })).settings; toast('Settings saved. Players get them next time the game opens.'); }
  catch (e) { toast(e.message); }
  render();
};
ACT.svcUsage = async () => {
  ADM_SVC.usageBusy = true; render();
  try { ADM_SVC.usage = await admApi('/usage'); } catch (e) { toast(e.message); }
  ADM_SVC.usageBusy = false; render();
};


/* ---------- Dashboard: anonymous play statistics (js/systems/telemetry.js, futbol-admin GET /players) ---------- */
const ADM_DASH = { data: null, error: '', loading: false, days: 30, metric: 'players' };
const DASH_METRICS = [['players', 'Players'], ['new', 'New players'], ['minutes', 'Minutes played'], ['matches', 'Matches'], ['sessions', 'Sessions']];
async function admDashLoad(force) {
  if (ADM_DASH.loading || (ADM_DASH.data && !force) || (ADM_DASH.error && !force)) return;
  ADM_DASH.loading = true; ADM_DASH.error = '';
  if (UI.s === 'admin' && force) render();
  try { ADM_DASH.data = await admApi('/players?days=' + ADM_DASH.days); } catch (e) { ADM_DASH.error = e.message; }
  ADM_DASH.loading = false;
  if (UI.s === 'admin') render();
}
const dashN = n => Number(n || 0).toLocaleString('en-GB');
const dashDay = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const dashTile = (label, value, sub = '') => `<div><small>${label}</small><b>${value}</b>${sub ? `<small class="dash-sub">${sub}</small>` : ''}</div>`;
// One series, one hue: bars from the baseline, a light grid, labels in text colours, a tooltip on each bar.
function dashChart(rows, key, label) {
  const W = 420, H = 180, padL = 30, padB = 20, padT = 8, n = rows.length || 1, max = Math.max(1, ...rows.map(r => +r[key] || 0));
  const step = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / step) * step, ticks = [0, top / 2, top];
  const bw = (W - padL) / n, gap = Math.min(2, bw * 0.2), y = v => padT + (H - padT - padB) * (1 - v / top);
  const every = Math.ceil(n / 8);
  return `<svg class="dash-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} per day">
    ${ticks.map(t => `<line x1="${padL}" x2="${W}" y1="${y(t)}" y2="${y(t)}" class="dash-grid"/><text x="${padL - 6}" y="${y(t) + 3}" text-anchor="end" class="dash-ax">${dashN(Math.round(t))}</text>`).join('')}
    ${rows.map((r, i) => { const v = +r[key] || 0, x = padL + i * bw + gap / 2, h = Math.max(v ? 2 : 0, y(0) - y(v)), w = Math.max(1, bw - gap), rad = Math.min(4, w / 2, h);
      return `<g class="dash-bar"><rect x="${padL + i * bw}" y="${padT}" width="${bw}" height="${H - padT - padB}" fill="transparent"/>${v ? `<path d="M${x},${y(0)} v${-(h - rad)} q0,${-rad} ${rad},${-rad} h${w - 2 * rad} q${rad},0 ${rad},${rad} v${h - rad} z"/>` : ''}<title>${dashDay(r.day)}: ${dashN(v)} ${esc(label.toLowerCase())}</title>${i % every === 0 ? `<text x="${padL + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle" class="dash-ax">${dashDay(r.day)}</text>` : ''}</g>`; }).join('')}
  </svg>`;
}
const dashList = (obj, name = k => k) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="row sm"><span class="grow"><b>${esc(name(k))}</b></span><span class="stat"><b>${dashN(v)}</b></span></div>`).join('') || '<p class="muted">None yet.</p>';

ADMIN_TABS.dash = () => {
  const D = ADM_DASH.data;
  const head = `<div class="card"><h3>Players dashboard</h3><p class="muted">Anonymous statistics from every player's game: a random id per browser, no names or saves. Days are Malaysia time. Players can turn this off in the game's Settings, so the numbers are a minimum.</p>
    <div class="seg">${[7, 30, 90].map(d => `<button class="${ADM_DASH.days === d ? 'on' : ''}" data-a="dashDays" data-v="${d}">${d} days</button>`).join('')}</div>
    <div class="btns"><button class="btn sm" data-a="dashReload" ${ADM_DASH.loading ? 'disabled' : ''}>${ADM_DASH.loading ? 'Loading…' : 'Refresh'}</button></div></div>`;
  if (ADM_DASH.error) return head + `<div class="card"><p class="bad">Could not load: ${esc(ADM_DASH.error)}</p></div>`;
  if (!D) return head + '<div class="card"><p class="muted" role="status">Loading…</p></div>';
  const P = D.players, T = D.totals, rows = D.daily || [], days = D.days, active = Math.max(1, P.period);
  const metric = DASH_METRICS.find(m => m[0] === ADM_DASH.metric) || DASH_METRICS[0];
  const results = T.matches ? `${T.wins}W ${T.draws}D ${T.losses}L · ${Math.round(100 * T.wins / T.matches)}% won` : 'No matches yet';
  return head + `<div class="card"><div class="kv dash-kv">
      ${dashTile('Players today', dashN(P.today), dashN(P.newToday) + ' new')}
      ${dashTile('Last 7 days', dashN(P.week))}
      ${dashTile(`Last ${days} days`, dashN(P.period), dashN(P.newPeriod) + ' new · ' + dashN(P.returning) + ' came back')}
      ${dashTile('All time', dashN(P.allTime))}
      ${dashTile('Minutes played', dashN(T.minutes), Math.round(T.minutes / active) + ' per player')}
      ${dashTile('Sessions', dashN(T.sessions), (T.sessions / active).toFixed(1) + ' per player')}
      ${dashTile('Matches', dashN(T.matches), dashN(T.watched) + ' watched · ' + dashN(T.instant) + ' instant')}
      ${dashTile('Results', results, T.matches ? (T.goalsFor / T.matches).toFixed(1) + ' scored · ' + (T.goalsAgainst / T.matches).toFixed(1) + ' conceded per match' : '')}
    </div></div>
    <div class="card"><h3>${metric[1]} per day</h3>
      <div class="seg">${DASH_METRICS.map(([k, n]) => `<button class="${metric[0] === k ? 'on' : ''}" data-a="dashMetric" data-v="${k}">${n}</button>`).join('')}</div>
      ${dashChart(rows, metric[0], metric[1])}</div>
    <div class="card"><h3>By day</h3><div class="tablewrap"><table class="tbl"><tr><th>Day</th><th>Players</th><th>New</th><th>Sessions</th><th>Minutes</th><th>Matches</th><th>New careers</th></tr>
      ${rows.slice().reverse().map(r => `<tr><td>${dashDay(r.day)}</td><td>${dashN(r.players)}</td><td>${dashN(r.new)}</td><td>${dashN(r.sessions)}</td><td>${dashN(r.minutes)}</td><td>${dashN(r.matches)}</td><td>${dashN(r.careers)}</td></tr>`).join('')}</table></div></div>
    <div class="card"><h3>Clubs managed</h3><p class="muted">Players per club in the period.</p><div class="list">${(D.clubs || []).map(c => `<div class="row sm"><span class="grow"><b>${esc(c.name)}</b><small>${esc(c.country || '')}</small></span><span class="stat"><b>${dashN(c.players)}</b></span></div>`).join('') || '<p class="muted">None yet.</p>'}</div></div>
    <div class="card"><h3>Countries</h3><div class="list">${dashList(D.countries)}</div></div>
    <div class="card"><h3>Devices</h3><div class="list">${dashList(D.devices, k => k[0].toUpperCase() + k.slice(1))}</div></div>
    <div class="card"><h3>Game versions</h3><div class="list">${dashList(D.versions, k => 'v' + k)}</div></div>`;
};
ACT.dashReload = () => admDashLoad(true);
ACT.dashDays = ds => { ADM_DASH.days = +ds.v; ADM_DASH.data = null; admDashLoad(true); };
ACT.dashMetric = ds => { ADM_DASH.metric = ds.v; render(); };
