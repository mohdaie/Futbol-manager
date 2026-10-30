'use strict';
/* ===== screens-esl.js =====
   The Euro Super League on the Competitions screen (esl.js): groups, knockout ties, prize money and past winners. */

function eslScreenHtml() {
  const E = G.esl, view = ['groups', 'ko', 'prize', 'honours'].includes(UI.tab.eslView) ? UI.tab.eslView : 'groups';
  const mine = E && !E.skipped && !jobless() && E.teams.includes(G.club) ? eslStatus(G.club) : null;
  const head = !E || E.skipped ? `<p class="note">The ${ESL_NAME} starts next season: this career began after the draw. The top six in England, Spain, Italy, Germany and France qualify, with the holders and the best seventh-placed clubs.</p>`
    : `<p class="muted">${seasonLabel()} · 32 clubs from the top divisions of England, Spain, Italy, Germany and France. ${mine ? `<b>${esc(clubName(G.club))}: ${esc(mine)}</b> · prize money so far ${money(E.prizes[G.club] || 0)}.` : jobless() ? '' : `${esc(clubName(G.club))} did not qualify this season.`}</p>`;
  let body = '';
  if (E && !E.skipped && view === 'groups') {
    body = Object.keys(E.groups).map(g => `<h4 class="lbl">Group ${g}</h4><div class="tablewrap"><table class="tbl"><thead><tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>
      ${eslGroupTable(g).map((r, i) => `<tr class="${r.id === G.club ? 'me' : ''} ${i < 2 ? 'zone-top' : ''}"><td>${i + 1}</td><td class="l"><span class="tc">${badge(r.id, 18)}${esc(clubName(r.id))}</span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div>`).join('')
      + '<p class="muted">The top two in each group reach the round of 16. Level on points: head-to-head goal difference, then goal difference, then goals scored.</p>';
  } else if (E && !E.skipped && view === 'ko') {
    const score = f => (played(f) ? `${f.hg}-${f.ag}${f.penalties ? ` (${f.penalties.join('-')} pens)` : ''}` : fmtDate(fxDate(f), false));
    const tie = t => {
      const [a, b] = t.legs.map(id => G.fixtures.find(f => f.id === id)), agg = played(a) && played(b) ? ` · aggregate ${a.hg + b.ag}-${a.ag + b.hg}` : '';
      return `<div class="row ${[a.h, a.a].includes(G.club) ? 'me' : ''}"><span class="grow"><b>${esc(clubName(a.h))} v ${esc(clubName(a.a))}</b><small>1st leg ${score(a)} · 2nd leg ${score(b)}${agg}${t.winner ? ' · ' + esc(clubName(t.winner)) + ' go through' : ''}</small></span></div>`;
    };
    const fin = E.final && G.fixtures.find(f => f.id === E.final);
    body = ['r16', 'qf', 'sf'].map(s => `<h4 class="lbl">${ESL_STAGES[s]}</h4><div class="list">${E.ties[s].map(tie).join('') || '<p class="muted">Drawn when the previous round is complete.</p>'}</div>`).join('')
      + `<h4 class="lbl">Final</h4><div class="list">${fin ? `<div class="row ${[fin.h, fin.a].includes(G.club) ? 'me' : ''}"><span class="grow"><b>${esc(clubName(fin.h))} v ${esc(clubName(fin.a))}</b><small>${score(fin)} · neutral ground${E.winner ? ' · ' + esc(clubName(E.winner)) + ' win the ' + ESL_NAME : ''}</small></span></div>` : '<p class="muted">One match at a neutral ground after the league season.</p>'}</div>`
      + '<p class="muted">Two legs; group winners play the second leg at home in the round of 16, which keeps group rivals and clubs from the same league apart. Level on aggregate: extra time, then penalties. No away goals.</p>';
  } else if (view === 'prize') {
    const rows = [['Starting fee', 'start'], ['Group win', 'win'], ['Group draw', 'draw'], ['Reaching the round of 16', 'r16'], ['Reaching the quarter-finals', 'qf'], ['Reaching the semi-finals', 'sf'], ['Reaching the final', 'final'], ['Winning the final', 'winner']];
    const earners = E && !E.skipped ? Object.entries(E.prizes).sort((a, b) => b[1] - a[1]).slice(0, 10) : [];
    body = `<div class="card"><h3>Prize money per club</h3>${rows.map(([n, k]) => `<div class="kvrow"><span>${n}</span><b>${money(eslPrize(k))} <small>(€${(ESL_PRIZE_EUR[k] / 1e6).toFixed(2)}m)</small></b></div>`).join('')}
      <div class="kvrow"><span>Value pillar (shared by club standing)</span><b>${money(eslPrize('value'))} in total</b></div>
      <p class="muted">UEFA's 2026/27 Champions League distribution per club (circular 48/2026), at €1 = £${EUR_GBP}. UEFA's value pillar (market pool and coefficient) is shared here by club reputation. A winner who wins every group match earns about ${money(eslPrize('start') + 6 * eslPrize('win') + eslPrize('r16') + eslPrize('qf') + eslPrize('sf') + eslPrize('final') + eslPrize('winner'))} before the value pillar.</p></div>
      ${earners.length ? `<h4 class="lbl">Top earners this season</h4><div class="list">${earners.map(([cid, v]) => `<div class="row ${cid === G.club ? 'me' : ''}"><span class="grow"><b>${esc(clubName(cid))}</b></span><span class="stat"><b>${money(v)}</b></span></div>`).join('')}</div>` : ''}`;
  } else if (view === 'honours') {
    body = `<div class="list">${(G.eslHistory || []).map(h => `<div class="row"><span class="grow"><b>${esc(h.season)}: ${esc(clubName(h.winner))}</b><small>Beat ${esc(clubName(h.runnerUp))} ${esc(h.score)} in the final</small></span></div>`).join('') || '<p class="muted">The first winners will be crowned at the end of this season.</p>'}</div>`;
  }
  return head + tabs('eslView', [['groups', 'Groups'], ['ko', 'Knockouts'], ['prize', 'Prize money'], ['honours', 'Winners']], view) + body;
}
