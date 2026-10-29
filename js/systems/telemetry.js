'use strict';
/* ===== telemetry.js =====
   Anonymous play statistics for the admin Dashboard: a random id for this browser (not linked to any person or
   account), the game version, phone/tablet/computer, sessions, minutes actively played, careers started (country,
   division, club) and the user's match results. No names, saves or personal data. Sent to the futbol-admin edge
   function (POST /report); players can turn it off in Settings. Never sent from the admin page or a worker. */
const STATS_ID_KEY = 'fm_stats_id', STATS_OFF_KEY = 'fm_stats_off';
const STATS = { session: null, opened: false, at: 0, sec: 0 };

function statsOn() {
  if (typeof window === 'undefined' || window.ADMIN_PAGE || typeof fetch !== 'function') return false;
  try { return localStorage.getItem(STATS_OFF_KEY) !== '1'; } catch (e) { return false; }
}
function statsSetOn(on) { try { on ? localStorage.removeItem(STATS_OFF_KEY) : localStorage.setItem(STATS_OFF_KEY, '1'); } catch (e) { /* storage blocked */ } }
function statsToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function statsDevice() {
  try {
    let id = localStorage.getItem(STATS_ID_KEY);
    if (!/^[0-9a-f]{32}$/.test(id || '')) { id = statsToken(); localStorage.setItem(STATS_ID_KEY, id); }
    return id;
  } catch (e) { return null; }
}
function statsForm() {
  const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches, w = Math.min(screen.width || 0, screen.height || 0);
  return !coarse ? 'computer' : w >= 600 ? 'tablet' : 'phone';
}
// The career being played, for the club/country breakdowns.
function statsCareer() {
  if (typeof G === 'undefined' || !G || !G.club) return {};
  return { club: G.clubs[G.club] ? G.clubs[G.club].name : String(G.club), country: G.country || 'ENG', div: typeof leagueOf === 'function' ? leagueOf(G.club) : null, season: G.season };
}
// Plain-text body: a simple cross-origin request (no preflight), so it also works with keepalive as the page closes.
function statsEvent(kind, data = {}, keepalive = false) {
  if (!statsOn()) return;
  const device = statsDevice();
  if (!device) return;
  if (!STATS.session) STATS.session = statsToken();
  const body = JSON.stringify({ kind, device, session: STATS.session, version: typeof GAME_VERSION === 'string' ? GAME_VERSION : '?', data });
  fetch(ADMIN_API_URL + '/report', { method: 'POST', body, keepalive, cache: 'no-store', credentials: 'omit' }).catch(() => {});
}
// Active minutes: counted while a career screen is visible, sent every few minutes and when the page is hidden.
function statsTick(flush = false) {
  const now = Date.now(), playing = !document.hidden && typeof G !== 'undefined' && G && typeof UI !== 'undefined' && !['title', 'start'].includes(UI.s);
  if (STATS.at) STATS.sec += Math.min(now - STATS.at, 30000) / 1000; // since the last check, while playing; a sleeping device is not playing
  STATS.at = playing ? now : 0;
  if (playing && !STATS.opened) { STATS.opened = true; statsEvent('open', { form: statsForm(), ...statsCareer() }); }
  if (STATS.sec >= (flush ? 5 : 180)) { statsEvent('play', { sec: Math.round(STATS.sec), ...statsCareer() }, flush); STATS.sec = 0; }
}
function statsMatch(M, fx) {
  if (typeof G === 'undefined' || !G || (fx.h !== G.club && fx.a !== G.club)) return;
  const home = fx.h === G.club, gf = home ? fx.hg : fx.ag, ga = home ? fx.ag : fx.hg;
  const res = gf > ga ? 'W' : gf < ga ? 'L' : fx.winner === G.club ? 'W' : fx.winner != null ? 'L' : 'D';
  statsEvent('match', { mode: M.live ? 'watched' : 'instant', comp: fx.comp || null, gf, ga, res, ...statsCareer() });
}
if (typeof document !== 'undefined' && typeof window !== 'undefined' && !window.ADMIN_PAGE) {
  setInterval(() => statsTick(), 15000);
  document.addEventListener('visibilitychange', () => statsTick(document.hidden));
  window.addEventListener('pagehide', () => statsTick(true));
}
