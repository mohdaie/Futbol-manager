'use strict';
// Shared by the storage worker and the explicit, no-worker backup fallback.
function parseCareerSave(text) {
  let value;
  try { value = JSON.parse(text); } catch { value = JSON.parse(decodeURIComponent(escape(atob(text.trim())))); }
  const game = value.format === 'futbol-manager' ? value.game : value;
  if (value.format === 'futbol-manager' && value.version !== 1) throw new Error('This backup format is not supported.');
  if (!game || !game.players || !game.clubs || !game.clubs[game.club] || !Array.isArray(game.fixtures) || !game.tactics || !Number.isFinite(game.season)) throw new Error('This file is not a valid Futbol Manager career.');
  for (const [id, p] of Object.entries(game.players)) if (!p || String(p.id) !== id || !Array.isArray(p.at) || !game.clubs[p.club]) throw new Error('The player database is incomplete.');
  for (const c of Object.values(game.clubs)) {
    if (!c || !Array.isArray(c.squad) || c.squad.some(id => !game.players[id])) throw new Error('The squad database is incomplete.');
    if (c.league === 'ECH' && (c.squad.length > 36 || c.squad.some(id => game.players[id].lvl === 'Y'))) throw new Error('Championship squads have first team and reserves only, with a 36-player maximum.');
  }
  return game;
}
const careerSaveFile = game => JSON.stringify({ format: 'futbol-manager', version: 1, game });
const careerSaveCode = game => btoa(unescape(encodeURIComponent(JSON.stringify(game))));
