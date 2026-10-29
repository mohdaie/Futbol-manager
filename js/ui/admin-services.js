'use strict';
/* ===== admin-services.js =====
   Admin page only. AI keys, AI settings and AI usage, stored in Supabase through the futbol-admin edge
   function (supabase/functions/futbol-admin). A saved key is write-only: this page only ever sees the last
   four characters. No sign-in yet. */

const ADM_SERVICES = {
  jev: { name: 'Jev (TypeSafe)', role: 'Fast structured decisions (choose, score, yes/no). It does not write text.', console: 'console.typesafe.ai/keys', models: JEV_MODELS,
    features: AI_FEATURES.jev },
  ds: { name: 'DeepSeek', role: 'Written text: press questions, replies, reports, news and the match analysis officer.', console: 'platform.deepseek.com/api_keys', models: DS_MODELS,
    features: AI_FEATURES.ds },
};
const ADM_SVC = { state: null, error: '', loading: false, test: {}, usage: null, usageBusy: false };

async function admApi(path, method = 'GET', body) {
  const res = await fetch(ADMIN_API_URL + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
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

