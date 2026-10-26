'use strict';
importScripts('../core/save-format.js?v=' + encodeURIComponent(new URL(self.location.href).searchParams.get('v') || ''));
// A single queue owns the database. Each checkpoint atomically updates changed
// records; a failed transaction leaves the previous complete career intact.
const DB_NAME = 'futbol-manager', DB_VERSION = 1;
let dbPromise, fingerprints = new Map(), revision = 0, queue = Promise.resolve();
function openSaveDB() {
  return dbPromise || (dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => { for (const name of ['world', 'players', 'clubs']) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name); };
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close another game tab to finish updating save storage.'));
  }));
}
async function readCareer() {
  const db = await openSaveDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['world', 'players', 'clubs'], 'readonly'), result = {};
    const meta = tx.objectStore('world').get('career'); meta.onsuccess = () => result.meta = meta.result;
    const version = tx.objectStore('world').get('revision'); version.onsuccess = () => result.revision = version.result || 0;
    for (const name of ['players', 'clubs']) {
      result[name] = {};
      const cursor = tx.objectStore(name).openCursor();
      cursor.onsuccess = () => { const c = cursor.result; if (c) { result[name][c.key] = c.value; c.continue(); } };
    }
    tx.oncomplete = () => { revision = result.revision; resolve(result.meta ? { ...result.meta, players: result.players, clubs: result.clubs } : null); };
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('Save could not be read.'));
  });
}
async function writeCareer(game) {
  // Serialization stays in this worker. It also normalizes Dates and transient
  // Maps exactly as the previous JSON saves did, preserving portable exports.
  const clean = JSON.parse(JSON.stringify(game));
  const records = new Map();
  for (const name of ['players', 'clubs']) for (const [id, value] of Object.entries(clean[name])) records.set(name + ':' + id, JSON.stringify(value));
  const { players, clubs, ...world } = clean;
  records.set('world:career', JSON.stringify(world));
  const db = await openSaveDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(['world', 'players', 'clubs'], 'readwrite');
    let failure;
    const version = tx.objectStore('world').get('revision');
    version.onsuccess = () => {
    if ((version.result || 0) !== revision) { failure = new Error('Another tab saved this career. Reload this tab or export a backup before continuing.'); tx.abort(); return; }
    try {
    for (const [key, json] of records) {
      if (fingerprints.get(key) === json) continue;
      const split = key.indexOf(':'), store = key.slice(0, split), id = key.slice(split + 1);
      tx.objectStore(store).put(store === 'world' ? world : clean[store][id], id);
    }
    for (const key of fingerprints.keys()) if (!records.has(key)) { const at = key.indexOf(':'); tx.objectStore(key.slice(0, at)).delete(key.slice(at + 1)); }
    tx.objectStore('world').put(revision + 1, 'revision');
    } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { revision++; resolve(); };
    tx.onabort = tx.onerror = () => reject(failure || tx.error || new Error('Save transaction failed.'));
  });
  fingerprints = records;
  return { savedAt: clean.savedAt };
}
// Clock checkpoints change only the career metadata. Players and clubs keep their last full checkpoint.
async function writeWorld(data) {
  const { players, clubs, ...world } = JSON.parse(JSON.stringify(data)), json = JSON.stringify(world);
  if (!fingerprints.has('world:career')) throw new Error('Career has not been saved in full yet.');
  if (fingerprints.get('world:career') === json) return { savedAt: world.savedAt };
  const db = await openSaveDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('world', 'readwrite');
    let failure;
    const version = tx.objectStore('world').get('revision');
    version.onsuccess = () => {
      if ((version.result || 0) !== revision) { failure = new Error('Another tab saved this career. Reload this tab or export a backup before continuing.'); tx.abort(); return; }
      tx.objectStore('world').put(world, 'career');
      tx.objectStore('world').put(revision + 1, 'revision');
    };
    tx.oncomplete = () => { revision++; resolve(); };
    tx.onabort = tx.onerror = () => reject(failure || tx.error || new Error('Save transaction failed.'));
  });
  fingerprints.set('world:career', json);
  return { savedAt: world.savedAt };
}
async function storageJob(type, data) {
  if (type === 'loadBrain' || type === 'saveBrain') {
    const db = await openSaveDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('world', type === 'saveBrain' ? 'readwrite' : 'readonly');
      const request = type === 'saveBrain' ? tx.objectStore('world').put(data, 'brain') : tx.objectStore('world').get('brain');
      tx.oncomplete = () => resolve(type === 'saveBrain' ? true : request.result || null);
      tx.onabort = tx.onerror = () => reject(tx.error);
    });
  }
  if (type === 'verify') {
    const saved = await readCareer();
    const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, ordered(value[k])])) : value;
    if (JSON.stringify(ordered(saved)) !== JSON.stringify(ordered(data))) throw new Error('Legacy save verification failed; the original backup has been kept.');
    return saved;
  }
  if (type === 'load') {
    const game = await readCareer();
    fingerprints.clear();
    if (game) {
      const { players, clubs, ...world } = game;
      fingerprints.set('world:career', JSON.stringify(world));
      for (const name of ['players', 'clubs']) for (const [id, value] of Object.entries(game[name])) fingerprints.set(name + ':' + id, JSON.stringify(value));
    }
    return game;
  }
  if (type === 'save') return writeCareer(data);
  if (type === 'saveWorld') return writeWorld(data);
  if (type === 'delete') {
    const db = await openSaveDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['world', 'players', 'clubs'], 'readwrite');
      let failure;
      const version = tx.objectStore('world').get('revision');
      version.onsuccess = () => {
        if ((version.result || 0) !== revision) { failure = new Error('Another tab saved this career. Reload before deleting it.'); tx.abort(); return; }
        tx.objectStore('world').delete('career');
        for (const name of ['players', 'clubs']) tx.objectStore(name).clear();
        tx.objectStore('world').put(revision + 1, 'revision');
      };
      tx.oncomplete = () => { revision++; resolve(); }; tx.onabort = tx.onerror = () => reject(failure || tx.error);
    });
    fingerprints.clear(); return true;
  }
  if (type === 'export') return careerSaveFile(data);
  if (type === 'exportCode') return careerSaveCode(data);
  if (type === 'import') return parseCareerSave(data);
  throw new Error('Unknown save operation.');
}
self.onmessage = ({ data: { id, type, data } }) => {
  queue = queue.then(() => storageJob(type, data)).then(result => self.postMessage({ id, result }), error => self.postMessage({ id, error: error.message || String(error) }));
};
