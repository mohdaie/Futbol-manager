'use strict';
// Only match participants enter this worker: no career-wide copy or credentials.
self.window = { addEventListener() {} };
self.document = { hidden: true, addEventListener() {}, getElementById() { return null; } };
self.localStorage = { getItem() { return null; }, setItem() {} };
function aiCfg() { return { jev: { model: '' }, ds: { model: '' } }; }
function aiReady() { return false; }
let engineKey = '';
function brainCloudEngine() { return engineKey; }
function brainCloudUuid() { return crypto.randomUUID(); }
importScripts(...['../core/util.js', '../core/data.js', '../core/competitions.js', '../core/players.js', '../core/bio.js', '../core/state.js', '../core/calendar.js', '../engine/pitch.js', '../engine/shape.js', '../engine/intent.js', '../engine/defending.js', '../engine/transitions.js', '../engine/sim.js', '../engine/match.js', '../systems/training.js', '../systems/brain.js', '../engine/fast.js'].map(file => file + '?v=' + encodeURIComponent(new URL(self.location.href).searchParams.get('v') || '')));
self.onmessage = ({ data: { id, type, data } }) => {
  try {
    if (type === 'ping') return self.postMessage({ id, result: true });
    G = data.world; BRAIN = data.brain; engineKey = data.engineKey; Object.assign(ENG, data.engine);
    NORM = data.norm; NORM_KEY = G.season + ':' + G.week;
    const M = data.match;
    let events;
    if (type === 'minute') events = matchRandom(M, () => simMinute(M));
    else if (type === 'fast') runFastMatch(M);
    else if (type === 'full') { while (!M.ended) stepMatch(M, true); }
    else throw new Error('Unknown simulation request.');
    self.postMessage({ id, result: { match: M, events } });
  } catch (error) { self.postMessage({ id, error: error.message || String(error) }); }
};
