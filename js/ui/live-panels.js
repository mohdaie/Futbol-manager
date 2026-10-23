'use strict';
const MATCH_VIEWS = [['2d', '2D'], ['formation', 'Formation'], ['lineup', 'Line up'], ['stats', 'Match stats']];
// Team identity never changes: bottom remains the manager's side. Only the
// projection changes when a new period starts, for canvas, hit testing and maps.
function livePeriod(L) {
  const minute = L.mq?.min ?? L.M?.min ?? 0, start = L.M?.extraStart;
  if (L.M?.extra && minute > start) return minute > start + 15 ? 3 : 2;
  return minute >= 46 ? 1 : 0;
}
function liveViewFlipped(L) { return !!((L.bottom || 0) ^ (livePeriod(L) % 2)); }
function liveAttackArrow(L, side) { return (side === 0) !== liveViewFlipped(L) ? '↑' : '↓'; }
function matchViewsHtml(L) {
  const active = MATCH_VIEWS.some(([k]) => k === L.matchView) ? L.matchView : '2d'; L.matchView = active;
  return `<div class="match-tabs" role="tablist" aria-label="Live match views">${MATCH_VIEWS.map(([k,n])=>`<button id="matchTab-${k}" role="tab" aria-controls="matchPanel-${k}" aria-selected="${active===k}" tabindex="${active===k?0:-1}" class="${active===k?'on':''}" data-a="matchView" data-v="${k}">${n}</button>`).join('')}</div>
    <p id="matchEnds" class="match-ends"></p><div class="match-viewport">
    <section id="matchPanel-2d" class="pitchwrap match-view-panel" role="tabpanel" aria-labelledby="matchTab-2d" ${active==='2d'?'':'hidden'}><canvas id="pitch" aria-label="Live match view"></canvas></section>
    ${MATCH_VIEWS.slice(1).map(([k])=>`<section id="matchPanel-${k}" class="match-view-panel match-data-panel" role="tabpanel" aria-labelledby="matchTab-${k}" tabindex="0" ${active===k?'':'hidden'}></section>`).join('')}</div>`;
}
function matchLineupRow(L, S, id, i, status) {
  const p=G.players[id];if(!p)return '';
  const pos=i>=0?FORMATIONS[S.ip][i][0]:p.pos;
  return `<button class="row act match-lineup-player ${status==='On pitch'?'live-watch-player':''}" data-a="livePl" data-id="${id}" data-player-id="${id}"><span class="pos">${pitchPosLabel(pos)}</span><span class="grow"><b>${esc(pname(p))}</b><small>${status}${i>=0?' · '+esc(roleName(S,i)):''}${S.cap===id?' · Captain':''} <span data-match-cards="${id}" data-match-side="${S.idx}"></span></small><small>Morale: <span data-match-morale="${id}" data-match-side="${S.idx}">${morLabel(liveMor(S,p))}</span></small></span>${liveFitnessHtml(S,id)}</button>`;
}
function matchLineupsHtml(L) {
  return L.M.sides.map(S=>`<section class="match-team" data-lineup-side="${S.idx}"><h3>${badge(S.cid,20)} ${esc(clubName(S.cid))} <small>${S.user?'Your team':S.idx===0?'Home':'Away'} · ${S.on.filter(Boolean).length} on pitch</small></h3><p class="muted">${S.ip} with the ball · ${S.oop} without it</p>
    <h4 class="lbl">On pitch · Condition & fatigue</h4><div id="${S.user?'liveWatchPlayers':'liveOppositionPlayers'}" class="list">${S.on.map((id,i)=>id?matchLineupRow(L,S,id,i,'On pitch'):`<div class="row match-empty"><span class="pos">${pitchPosLabel(FORMATIONS[S.ip][i][0])}</span><span class="muted">Empty position</span></div>`).join('')}</div>
    <h4 class="lbl">Substitutes</h4><div class="list">${S.bench.map(id=>matchLineupRow(L,S,id,-1,'Available substitute')).join('')||'<p class="muted">No substitutes available.</p>'}</div>
    ${S.off.length?`<h4 class="lbl">Substituted</h4><div class="list">${S.off.map(id=>matchLineupRow(L,S,id,-1,'Substituted')).join('')}</div>`:''}
    ${S.reds.length?`<h4 class="lbl bad">Sent off</h4><div class="list">${S.reds.map(id=>matchLineupRow(L,S,id,-1,'Sent off')).join('')}</div>`:''}</section>`).join('');
}
function matchFormationsHtml(L) {
  const phase=L.formationPhase==='oop'?'oop':'ip';
  return `<div class="seg" aria-label="Formation phase"><button class="${phase==='ip'?'on':''}" data-a="matchFormationPhase" data-v="ip">With the ball</button><button class="${phase==='oop'?'on':''}" data-a="matchFormationPhase" data-v="oop">Without the ball</button></div><div class="match-formations">${L.M.sides.map((S,side)=>{
    const coords=positions({...S,fam:100},phase==='ip',.5,phase==='ip' ? 0.45 : 0.55),map=shapeMap(S.ip,S.oop),color=L.colors[side===L.bottom?0:1].f;
    return `<section class="match-team" data-formation-side="${side}"><h3>${badge(S.cid,20)} ${esc(clubName(S.cid))} <small>Attacks ${liveAttackArrow(L,side)}</small></h3><p class="muted">${S.ip} with the ball · ${S.oop} without it</p><div class="tpitch match-team-pitch ${phase}" style="--team-color:${color};--team-ink:${isLight(color)?'#161222':'#fff'}"><div class="tp-lines"></div>${S.on.map((id,i)=>{
      const slot=FORMATIONS[phase==='ip'?S.ip:S.oop][phase==='ip'?i:map[i]],q=coords[i]||slot.slice(1),canonical=side===0?q:[1-q[0],1-q[1]],v=view(L,canonical[0]*PW,canonical[1]*PL),p=G.players[id],label=pitchPosLabel(slot[0]);
      return p?`<button class="tok" style="left:${8+v[0]/PW*84}%;top:${7+v[1]/PL*81}%" data-a="livePl" data-id="${id}" aria-label="${esc(fullName(p))}: ${label}"><span class="tk-c">${label}</span><span class="tk-n">${esc(p.ln)}</span><span class="tk-r">${phase==='ip'?esc(roleName(S,i)):label}</span></button>`:`<span class="tok live-gap-token" style="left:${8+v[0]/PW*84}%;top:${7+v[1]/PL*81}%"><span class="tk-c">${label}</span><span class="tk-n">Empty</span></span>`;
    }).join('')}</div></section>`;
  }).join('')}</div>`;
}
function matchStatsHtml(L) {
  const [H,A]=L.M.sides,tot=H.st.pos+A.st.pos||1;
  const rows=[['Score',L.disp[0],L.disp[1]],['Possession',Math.round(H.st.pos/tot*100)+'%',Math.round(A.st.pos/tot*100)+'%'],['Shots',H.st.sh,A.st.sh],['On target',H.st.sot,A.st.sot],['Expected goals',H.st.xg.toFixed(2),A.st.xg.toFixed(2)],['Passes',H.st.pc+'/'+H.st.pa,A.st.pc+'/'+A.st.pa],['Pass accuracy',Math.round(H.st.pc/(H.st.pa||1)*100)+'%',Math.round(A.st.pc/(A.st.pa||1)*100)+'%'],['Corners',H.st.co,A.st.co],['Offsides',H.st.off||0,A.st.off||0],['Fouls',H.st.fo,A.st.fo],['Yellow cards',H.st.yc,A.st.yc],['Red cards',H.st.rc,A.st.rc]];
  return `<div class="match-stats"><div class="cmp head"><b>${esc(clubName(H.cid))}</b><span>Live match stats</span><b>${esc(clubName(A.cid))}</b></div>${rows.map(([label,h,a])=>`<div class="cmp" data-match-stat="${label}"><b>${h}</b><span>${label}</span><b>${a}</b></div>`).join('')}</div>`;
}
function updateMatchPanels(L) {
  if(!L||UI.s!=='match')return;
  const ends=document.getElementById('matchEnds');if(!ends)return;
  const period=livePeriod(L),flip=liveViewFlipped(L);
  if(L.displayFlip!==flip){if(L.displayFlip!==undefined){L.trail=[];L.fx=[];L.fade=1;}L.displayFlip=flip;if(L.W&&L.H)moveCam(L,0,true);}
  ends.textContent=L.M.sides.map((S,i)=>clubName(S.cid)+' '+liveAttackArrow(L,i)).join(' · ');
  const active=L.matchView||'2d',panel=document.getElementById('matchPanel-'+active);if(!panel||active==='2d')return;
  let key,html;
  if(active==='lineup'){
    key=JSON.stringify(L.M.sides.map(S=>[S.ip,S.oop,S.on,S.bench,S.off,S.reds,S.roles,S.cap]));html=()=>matchLineupsHtml(L);
  }else if(active==='formation'){
    key=JSON.stringify([period,L.formationPhase,L.M.sides.map(S=>[S.ip,S.oop,S.on,S.roles,INSTRUCTIONS.map(x=>S[x.k]),S.lost,S.won])]);html=()=>matchFormationsHtml(L);
  }else{key=JSON.stringify([L.disp,L.M.sides.map(S=>S.st)]);html=()=>matchStatsHtml(L);}
  if(panel.dataset.state!==key){panel.innerHTML=html();panel.dataset.state=key;}
  panel.querySelectorAll('[data-match-morale]').forEach(el=>{const S=L.M.sides[+el.dataset.matchSide],p=G.players[+el.dataset.matchMorale];if(p)el.textContent=morLabel(liveMor(S,p));});
  panel.querySelectorAll('[data-match-cards]').forEach(el=>{const S=L.M.sides[+el.dataset.matchSide],id=+el.dataset.matchCards;el.textContent=S.reds.includes(id)?' · RED':S.yc[id]?' · YC '+S.yc[id]:'';});
}
ACT.matchView=ds=>{
  const L=LIVE;if(!L||!MATCH_VIEWS.some(([k])=>k===ds.v))return;L.matchView=ds.v;
  for(const[k]of MATCH_VIEWS){const b=document.getElementById('matchTab-'+k),p=document.getElementById('matchPanel-'+k);if(!b||!p)continue;b.classList.toggle('on',k===ds.v);b.setAttribute('aria-selected',String(k===ds.v));b.tabIndex=k===ds.v?0:-1;p.hidden=k!==ds.v;}
  updateBoard(L);if(ds.v==='2d')bindLive();
};
ACT.matchFormationPhase=ds=>{if(!LIVE||!['ip','oop'].includes(ds.v))return;LIVE.formationPhase=ds.v;updateBoard(LIVE);};
document.addEventListener('keydown',e=>{
  if(!e.target.matches('.match-tabs [role=tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
  const i=MATCH_VIEWS.findIndex(([k])=>k===e.target.dataset.v),n=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;
  ACT.matchView({v:MATCH_VIEWS[n][0]});document.getElementById('matchTab-'+MATCH_VIEWS[n][0]).focus();
});
