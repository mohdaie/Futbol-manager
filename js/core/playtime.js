'use strict';
// Per-career active time. The clock stays outside G so Back cannot rewind it.
const PLAY_CLOCK = { game: null, at: 0, active: false, sessionStarted: false, hidden: false };
function syncPlaytime() {
  const now = performance.now();
  if (PLAY_CLOCK.game !== G) {
    Object.assign(PLAY_CLOCK, { game: G, at: now, active: false, sessionStarted: false });
  }
  if (!G) return;
  if (!G.playtime) G.playtime = { ms: 0, sessions: 0, trackedFrom: Date.now(), legacy: !G.createdAt };
  if (PLAY_CLOCK.active) {
    // A suspended browser/device must not turn a long sleep into playing time.
    G.playtime.ms += Math.max(0, Math.min(now - PLAY_CLOCK.at, 30000));
  }
  PLAY_CLOCK.at = now;
  PLAY_CLOCK.active = !PLAY_CLOCK.hidden && !document.hidden && typeof UI !== 'undefined' && !['title', 'start'].includes(UI.s);
  if (PLAY_CLOCK.active && !PLAY_CLOCK.sessionStarted) {
    G.playtime.sessions++;
    PLAY_CLOCK.sessionStarted = true;
  }
}
function playtimeLabel(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m ${seconds % 60}s`;
}
function addictionLabel(ms) {
  const hours = ms / 3600000;
  return hours >= 20 ? 'The stadium has your forwarding address' : hours >= 10 ? 'Sleep is for the assistant manager' : hours >= 3 ? 'Just one more match… again' : hours >= 1 ? 'Touchline regular' : hours >= 0.25 ? 'The tactics board is calling' : 'Just checking the score';
}
function updatePlaytimeDisplay() {
  if (!G) return;
  const time = document.getElementById('game-playtime'), level = document.getElementById('game-addiction');
  if (time) time.textContent = playtimeLabel(G.playtime.ms);
  if (level) level.textContent = addictionLabel(G.playtime.ms);
}
// Checkpoint during play and on mobile app switches / page exits.
setInterval(() => {
  syncPlaytime();
  if (G && PLAY_CLOCK.active) saveGame();
  updatePlaytimeDisplay();
}, 15000);
document.addEventListener('visibilitychange', () => { syncPlaytime(); if (G) saveGame(); });
window.addEventListener('pagehide', () => { PLAY_CLOCK.hidden = true; syncPlaytime(); if (G) { saveGame(); if (typeof SaveStorage !== 'undefined') SaveStorage.flush().catch(() => {}); } });
window.addEventListener('pageshow', () => { PLAY_CLOCK.hidden = false; syncPlaytime(); });
