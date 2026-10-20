'use strict';
/* Incremental research uploads. The immutable in-flight batch is persisted before
   sending; server sequence checkpoints make retries safe after raw-data expiry. */
const BRAIN_CLOUD_URL = 'https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-brain';
let brainCloudTimer = 0, brainCloudBusy = false, brainCloudRetryAt = 0, brainCloudFailures = 0;
const brainCloudHash = value => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
};
// Older phone browsers lack crypto.randomUUID and AbortSignal.timeout; fall back so sync still works there.
const brainCloudUuid = () => (crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, ch => (ch ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (ch / 4)))).toString(16)));
function brainCloudSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
  if (typeof AbortController === 'undefined') return undefined;
  const ctl = new AbortController(); setTimeout(() => ctl.abort(), ms); return ctl.signal;
}
function brainCloudEngine() { return String(brain().active || 'rules') + ':' + brainCloudHash(JSON.stringify(G && G.tune || {})); }
function brainCloudEmpty() { return { stats: {}, records: [], snapshots: {}, omitted: 0 }; }
function brainCloudRow(e) {
  if (e.out == null || !Number.isFinite(e.out) || !MGR_OPTIONS[e.opt] || ['pending', 'late'].includes(e.src)) return null;
  const meta = e.cloudMeta || {};
  const details = { f: e.f || {}, match: meta.match || null, side: meta.side ?? null, at: e.at || null, score: e.score || null,
    jev: e.jev || null, second: e.second || null, mode: meta.mode || 'legacy', jevModel: meta.jevModel || null, dsModel: meta.dsModel || null };
  return { id: e.cloudId || (e.cloudId = brainCloudUuid()), t: e.t, v: meta.app || 'legacy', e: meta.engine || 'legacy', k: meta.kind || 'legacy',
    b: e.key, a: e.opt, s: e.src || 'legacy', o: e.out, c: Number.isFinite(e.conf) ? clamp(e.conf, 0, 1) : null, details };
}
function brainCloudKeepDetail(C, row) {
  C.pending.records.push(row);
  if (C.pending.records.length > 2000) { C.pending.records.shift(); C.pending.omitted++; }
}
function brainCloudInit(B) {
  if (B.cloud) return B.cloud;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const C = B.cloud = { v: 1, token: [...bytes].map(n => n.toString(16).padStart(2, '0')).join(''), seq: 0, pending: brainCloudEmpty(), inFlight: null, known: {}, lastSync: null, error: '', received: 0 };
  // The draft includes older records no longer in the 2,000-entry log. Import it
  // once as historical totals; old log rows are details only, never counted again.
  Object.entries(B.draft).forEach(([b, options]) => Object.entries(options).forEach(([a, x]) => {
    if (!(x.n > 0)) return;
    const r = { v: 'legacy', e: 'legacy', k: 'legacy', b, a, s: 'legacy', n: x.n, r: x.sum || 0, q: 0, w: 0, l: 0, c: 0, cn: 0, d: 0, tv: x.tv || 0 };
    C.pending.stats[JSON.stringify([r.v, r.e, r.k, b, a, r.s])] = r;
  }));
  B.log.forEach(e => { const row = brainCloudRow(e); if (row) brainCloudKeepDetail(C, row); });
  return C;
}
function brainCloudSnapshot(C, name, data) {
  const raw = JSON.stringify(data), hash = brainCloudHash(raw);
  if (C.known[name] === hash) return;
  C.known[name] = hash;
  C.pending.snapshots[name] = { name, data: JSON.parse(raw) };
}
function brainCloudCapture(B) {
  const C = brainCloudInit(B);
  brainCloudSnapshot(C, 'settings', { mode: B.mode, minN: B.minN, conf: B.conf, explore: B.explore, active: B.active, saved: B.saved });
  B.versions.forEach(v => brainCloudSnapshot(C, 'version:' + v.id, { id: v.id, name: v.name, date: v.date, table: v.table, tune: v.tune || {}, buckets: v.buckets, decisions: v.decisions, ab: v.ab || null }));
  brainCloudSnapshot(C, 'press', { items: B.press });
  if (G) {
    const cfg = aiCfg(), engine = brainCloudEngine();
    brainCloudSnapshot(C, 'config:' + engine, { app: GAME_VERSION, engine, tune: G.tune || {}, mode: B.mode, jevModel: cfg.jev.model, dsModel: cfg.ds.model, scoreVersion: 1 });
  }
}
function brainCloudRecord(B, e) {
  const C = brainCloudInit(B), row = brainCloudRow(e);
  if (!row) return;
  const key = JSON.stringify([row.v, row.e, row.k, row.b, row.a, row.s]);
  const r = C.pending.stats[key] || (C.pending.stats[key] = { v: row.v, e: row.e, k: row.k, b: row.b, a: row.a, s: row.s, n: 0, r: 0, q: 0, w: 0, l: 0, c: 0, cn: 0, d: 0, tv: 0 });
  r.n++; r.r += row.o; r.q += row.o * row.o; r.w += row.o > 0 ? 1 : 0; r.l += row.o < 0 ? 1 : 0;
  if (row.c !== null) { r.c += row.c; r.cn++; }
  if (e.second && e.jev && e.second !== e.jev) r.d++;
  if (['jev', 'deepseek'].includes(e.src)) r.tv++;
  brainCloudKeepDetail(C, row);
}
function brainCloudPending(C) {
  return C.inFlight || C.pending.records.length || Object.keys(C.pending.stats).length || Object.keys(C.pending.snapshots).length || C.pending.omitted;
}
function brainCloudPersist(B) {
  try { localStorage.setItem(BRAIN_KEY, JSON.stringify(B)); return true; }
  catch { B.cloud.error = 'Browser storage is full or blocked. Sync paused to protect retry checkpoints.'; return false; }
}
function brainCloudSchedule(delay = 5000) {
  if (brainCloudBusy || brainCloudTimer) return;
  brainCloudTimer = setTimeout(() => { brainCloudTimer = 0; brainCloudSync(); }, delay);
}
function brainCloudDisplay() {
  const B = brain(), C = B.cloud, el = document.getElementById('brain-cloud-status');
  if (!el || !C) return;
  const queued = C.pending.records.length + (C.inFlight ? C.inFlight.records.length : 0);
  el.textContent = brainCloudBusy ? 'Syncing learning data…' : C.error ? C.error : C.lastSync ? `Last synced ${new Date(C.lastSync).toLocaleString()} · ${C.received} detailed records received${queued ? ` · ${queued} queued` : ' · up to date'}` : C.checked ? 'Nothing to upload yet. Learning data appears after matches.' : 'Waiting for first upload…';
}
// force: the Sync now button. It always reports the outcome with a toast.
async function brainCloudSync(force = false) {
  const say = msg => { if (force && typeof toast === 'function') toast(msg); };
  if (brainCloudBusy) return say('Already syncing…');
  if (!force && Date.now() < brainCloudRetryAt) return;
  if (navigator.onLine === false) { brainCloudSchedule(30000); return say('You are offline. Learning data is kept and will upload when you reconnect.'); }
  const B = brain(); let C;
  try { brainCloudCapture(B); C = B.cloud; } catch (e) { return say('Could not prepare learning data: ' + (e.message || e)); }
  if (!brainCloudPending(C)) { C.checked = Date.now(); brainCloudDisplay(); return say(C.lastSync ? 'Everything is already synced.' : 'No learning data yet. Play or simulate matches first.'); }
  const before = C.received;
  brainCloudBusy = true; brainCloudDisplay();
  try {
    for (let i = 0; i < 8 && brainCloudPending(C); i++) {
      if (!C.inFlight) {
        const stats = Object.keys(C.pending.stats).slice(0, 80), snapshots = Object.keys(C.pending.snapshots).slice(0, 1);
        C.inFlight = { seq: C.seq + 1, stats: stats.map(k => C.pending.stats[k]), records: C.pending.records.splice(0, 100), snapshots: snapshots.map(k => C.pending.snapshots[k]), omitted: C.pending.omitted };
        stats.forEach(k => delete C.pending.stats[k]); snapshots.forEach(k => delete C.pending.snapshots[k]); C.pending.omitted = 0;
      }
      if (!brainCloudPersist(B)) throw new Error(C.error);
      const response = await fetch(BRAIN_CLOUD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + C.token }, body: JSON.stringify(C.inFlight), signal: brainCloudSignal(18000) });
      const result = await response.json().catch(() => ({ error: `Cloud server error (${response.status}). Data is kept locally and will retry.` }));
      if (!response.ok) throw new Error(result.error || 'Cloud sync failed. Data is kept locally.');
      if (result.ack !== C.inFlight.seq) throw new Error('Unexpected cloud acknowledgement. Data is kept locally.');
      // Preserve the frozen batch until the acknowledgement is durable locally.
      const batch = C.inFlight, oldSeq = C.seq;
      C.seq = result.ack; C.inFlight = null; C.lastSync = Date.now(); C.received = result.received; C.error = '';
      if (!brainCloudPersist(B)) { C.seq = oldSeq; C.inFlight = batch; throw new Error(C.error); }
    }
    brainCloudFailures = 0; brainCloudRetryAt = 0;
    say(brainCloudPending(C) ? 'Part uploaded. The rest will follow shortly.' : `Synced. ${Math.max(0, C.received - before)} new detailed record${C.received - before === 1 ? '' : 's'} uploaded.`);
  } catch (e) {
    C.error = e.message || 'Offline. Learning is kept locally and will retry.';
    brainCloudRetryAt = Date.now() + Math.min(3600000, 15000 * 2 ** Math.min(brainCloudFailures++, 8));
    brainCloudPersist(B);
    say('Sync failed: ' + C.error);
  } finally {
    brainCloudBusy = false; brainCloudDisplay();
    if (brainCloudPending(C)) brainCloudSchedule(Math.max(5000, brainCloudRetryAt - Date.now()));
  }
}
window.addEventListener('online', () => { brainCloudRetryAt = 0; brainCloudSchedule(100); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) brainCloudSchedule(100); });
window.addEventListener('DOMContentLoaded', () => { brainSave(); brainCloudSchedule(1000); });
