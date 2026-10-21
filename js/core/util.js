'use strict';
/* ===== util.js =====
   Randomness, maths and formatting helpers. Holds no game state. */

const R = Math.random;
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const rf = (a, b) => a + R() * (b - a);
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sum = (a, f = x => x) => a.reduce((s, x) => s + f(x), 0);
const avg = (a, f = x => x) => (a.length ? sum(a, f) / a.length : 0);

function gauss() {
  let u = 0, v = 0;
  while (!u) u = R();
  while (!v) v = R();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function wpick(arr, wf) {
  let t = 0;
  const ws = arr.map(x => { const w = Math.max(0, wf(x)); t += w; return w; });
  if (t <= 0) return pick(arr);
  let r = R() * t;
  for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Stable 0..1 value for a string; used so scouting ranges don't jump between renders.
function hash01(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}

function money(n) {
  const s = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n >= 1e9) return s + '£' + (n / 1e9).toFixed(2) + 'bn';
  if (n >= 1e6) return s + '£' + (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + 'm';
  if (n >= 1e3) return s + '£' + Math.round(n / 1e3) + 'k';
  return s + '£' + Math.round(n);
}
const wageFmt = n => money(n) + '/w';
// Editable limits show every pound so small button presses remain visible.
const moneyExact = n => '£' + Math.round(n).toLocaleString('en-GB');
const roundMoney = v => (v >= 1e6 ? Math.round(v / 1e5) * 1e5 : Math.round(v / 25e3) * 25e3);
const roundWage = v => (v >= 1e4 ? Math.round(v / 500) * 500 : Math.round(v / 100) * 100);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function fmtDate(d, withDay = true) {
  d = new Date(d);
  return (withDay ? WDAYS[d.getDay()] + ' ' : '') + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
