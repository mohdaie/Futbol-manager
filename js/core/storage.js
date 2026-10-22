'use strict';
// Autosaves are coalesced; explicit Save/Return/Import wait for durable storage.
// Small metadata and optional AI settings can still use localStorage.
const SaveStorage = {
  worker: null, next: 0, jobs: new Map(), cached: null, current: null,
  dirty: 0, written: 0, epoch: 0, timer: 0, flight: null, error: null, file: null,
  request(type, data) {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Explicit backups remain possible when workers/storage are blocked.
        try {
          if (type === 'export') return resolve(careerSaveFile(data));
          if (type === 'exportCode') return resolve(careerSaveCode(data));
          if (type === 'import') return resolve(parseCareerSave(data));
        } catch (error) { return reject(error); }
        return reject(new Error('Browser save storage is unavailable. Export a backup.'));
      }
      const id = ++this.next; this.jobs.set(id, { resolve, reject });
      try { this.worker.postMessage({ id, type, data }); } catch (error) { this.jobs.delete(id); reject(error); }
    });
  },
  snapshot(game = G) {
    if (!game) return null;
    // Live frames and callback functions are transient, never career records.
    return { ...game, live: game.live ? { ...game.live, M: cleanMatch(game.live.M) } : null };
  },
  enqueue(game) {
    if (this.replacing) return false;
    this.current = game; this.dirty++;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush().catch(() => {}), 150);
    return !!this.worker && !this.blocked;
  },
  async flush() {
    await this.ready;
    if (this.blocked) throw this.error || new Error('Save storage could not be opened safely.');
    clearTimeout(this.timer);
    if (this.brainTimer) { clearTimeout(this.brainTimer); this.brainTimer = 0; await this.request('saveBrain', this.brainCurrent); }
    if (this.flight) { await this.flight; if (this.dirty > this.written) return this.flush(); return true; }
    if (!this.current || this.written === this.dirty) return !this.error;
    const revision = this.dirty, epoch = this.epoch, game = this.current;
    const snapshot = this.snapshot(game);
    this.flight = this.request('save', snapshot).then(result => {
      if (epoch === this.epoch) { this.written = revision; this.cached = game; this.error = null; this.status('Saved on this device.'); }
      return result;
    }).catch(error => { this.error = error; this.status(error.message.startsWith('Another tab') ? error.message : 'Saving failed. Export a backup before leaving.', true); throw error; });
    try { await this.flight; } finally { this.flight = null; }
    if (this.dirty > this.written) return this.flush();
    return true;
  },
  status(message, failed = false) {
    const el = document.getElementById('saveStatus'); if (el) { el.textContent = message; el.className = failed ? 'bad' : 'muted'; }
    if (failed && typeof toast === 'function') toast(message);
  },
  enqueueBrain(value) {
    this.brainCurrent = value;
    clearTimeout(this.brainTimer);
    this.brainTimer = setTimeout(() => { this.brainTimer = 0; this.request('saveBrain', value).catch(() => {}); }, 200);
  },
  async clear() {
    await this.ready;
    clearTimeout(this.timer); this.epoch++; this.replacing = true;
    // The worker's ordered queue puts this deletion after any in-flight checkpoint.
    try { await this.request('delete'); } finally { this.replacing = false; }
    this.current = this.cached = null; this.written = this.dirty;
    try { localStorage.removeItem(SAVE_KEY); } catch { /* legacy storage can be blocked */ }
    this.error = null; this.blocked = false; this.file = null;
  },
};
function cleanMatch(M) { return M ? { ...M, frames: null, onAsync: undefined } : null; }
function captureLiveCheckpoint() {
  if (typeof LIVE !== 'undefined' && LIVE && LIVE.G === G && !LIVE.done && JSON.stringify(cleanMatch(LIVE.M)) !== JSON.stringify(G.live?.M)) liveKeep(LIVE);
}
SaveStorage.ready = (async () => {
  try {
    const url = new URL('../workers/storage.js', document.currentScript.src); url.searchParams.set('v', GAME_VERSION);
    SaveStorage.worker = new Worker(url);
    SaveStorage.worker.onmessage = ({ data }) => {
      const job = SaveStorage.jobs.get(data.id); if (!job) return;
      SaveStorage.jobs.delete(data.id); data.error ? job.reject(new Error(data.error)) : job.resolve(data.result);
    };
    SaveStorage.worker.onerror = event => {
      const error = new Error(event.message || 'Save worker failed.'); SaveStorage.error = error;
      for (const job of SaveStorage.jobs.values()) job.reject(error); SaveStorage.jobs.clear(); SaveStorage.worker.terminate(); SaveStorage.worker = null;
    };
    SaveStorage.cached = await SaveStorage.request('load');
    SaveStorage.brain = await SaveStorage.request('loadBrain');
    if (!SaveStorage.brain) {
      try {
        const oldBrain = localStorage.getItem('futbol-manager:brain');
        if (oldBrain) { SaveStorage.brain = JSON.parse(oldBrain); await SaveStorage.request('saveBrain', SaveStorage.brain); }
      } catch { /* the original optional learning-engine backup is untouched */ }
    }
    if (!SaveStorage.cached) {
      let old; try { old = localStorage.getItem(SAVE_KEY); } catch { /* no legacy access */ }
      if (old) {
        const game = await SaveStorage.request('import', old);
        await SaveStorage.request('save', game);
        const verified = await SaveStorage.request('verify', game);
        SaveStorage.cached = verified;
        // Keep the original legacy save as a recovery copy; never overwrite it.
      }
    }
  } catch (error) {
    SaveStorage.error = error; SaveStorage.blocked = true;
    // Storage failure must not hide an existing career or prevent exporting it.
    try { const old = localStorage.getItem(SAVE_KEY); if (old) SaveStorage.cached = JSON.parse(old); } catch { /* malformed legacy backup is untouched */ }
  }
})();
window.addEventListener('beforeunload', event => {
  captureLiveCheckpoint();
  if (SaveStorage.current && (SaveStorage.dirty > SaveStorage.written || SaveStorage.flight)) {
    SaveStorage.flush().catch(() => {});
    // Async writes cannot be guaranteed after a document is destroyed. Only
    // interrupt closing while an actual, uncommitted checkpoint exists.
    event.preventDefault(); event.returnValue = '';
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { captureLiveCheckpoint(); SaveStorage.flush().catch(() => {}); }
});
