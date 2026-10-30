const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const root=path.resolve(__dirname,'..'),checks=[],errors=[];
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://x').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 let b;const check=(n,v)=>{assert.ok(v,n);checks.push(n);};
 try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));b=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);await p.locator('[data-a=titleNew]').click();
 await p.locator('#mgr').fill('Coach Amir');await p.locator('[data-a=pickAvatar]').last().click();check('Manager name survives immediate avatar choice',await p.locator('#mgr').inputValue()==='Coach Amir');
 await p.locator('[data-a=pickClub][data-id=CIT]').click();check('Manager name survives immediate club choice',await p.locator('#mgr').inputValue()==='Coach Amir');
 await p.locator('[data-a=pickLeague][data-id=ECH]').click();await p.locator('[data-a=pickLeague][data-id=EPL]').click();await p.locator('[data-a=pickClub][data-id=GUN]').click();check('Manager name survives both league selections',await p.locator('#mgr').inputValue()==='Coach Amir');
 await p.locator('#mgr').press('Enter');await p.locator('[data-a=startGame]').click();check('Career starts with the entered name rather than The Boss',await p.evaluate(()=>G.manager==='Coach Amir'));

 await p.evaluate(()=>{
  window.packageBase=structuredClone(G);
  window.resetPackage=()=>{G=structuredClone(packageBase);G.deals=[];G.payments=[];G.addOns=[];G.fin.tb=1e9;G.fin.wb=1e9;for(const c of Object.values(G.clubs))if(!c.backgroundOnly&&!c.fa)c.bal=1e9;};
  window.packageDeal=(overrides={})=>{
   const player=seniorSquad(leagueClubs('ECH').find(id=>id!==G.club)).find(p=>!p.inj),seller=G.clubs[player.club];player.pers='Professional';
   const d={id:G.nextId++,dir:'in',pid:player.id,from:seller.id,to:G.club,stage:'final',need:{k:'final'},fee:20e6,wage:30000,years:4,status:'First team',agentFee:0,bonus:0,log:[],created:today().getTime(),proposal:{...TRANSFER_TERMS_DEFAULT},...overrides};G.deals.push(d);return d;
  };
 });
 const core=await p.evaluate(()=>{
  const out={};resetPackage();let d=packageDeal({fee:500000,proposal:{...TRANSFER_TERMS_DEFAULT,years:3,upfrontPct:25}});
  out.smallReject=!reviewTransferPackage(d).ok&&/75%/.test(reviewTransferPackage(d).reason);
  d.proposal.years=1;d.proposal.upfrontPct=75;out.smallAccept=reviewTransferPackage(d).ok;
  d.fee=2e6;d.proposal.years=2;d.proposal.upfrontPct=50;out.champTerms=reviewTransferPackage(d).ok;
  d.fee=30e6;d.proposal.years=3;d.proposal.upfrontPct=25;out.largeTerms=reviewTransferPackage(d).ok;
  G.clubs[d.from].bal=-1;out.distressed=!reviewTransferPackage(d).ok&&/cash now/.test(reviewTransferPackage(d).reason);
  resetPackage();d=packageDeal();let q=seniorSquad(G.club).filter(x=>!x.inj).sort((a,b)=>a.ca-b.ca)[0];q.pers='Professional';q.listed=true;q.wage=5000;d.proposal.exchangePid=q.id;d.proposal.exchangeValue=pValue(q)*2;
  out.inflatedExchange=!reviewTransferPackage(d).ok&&/valuation/.test(reviewTransferPackage(d).reason);
  d.proposal.exchangeValue=pValue(q);out.fairExchange=reviewTransferPackage(d).ok;
  const dest=G.clubs[d.from];q.pers='Loyal';q.listed=false;dest.rep=G.clubs[q.club].rep-10;
  out.agentRefusal=!reviewTransferPackage(d).ok&&/agent refuse/.test(reviewTransferPackage(d).reason);
  resetPackage();d=packageDeal();d.proposal.buyBackPrice=1;out.lowBuyBackRejected=!reviewTransferPackage(d).ok;
  d.proposal.buyBackPrice=Math.max(pValue(G.players[d.pid])*2,d.fee*2);out.fairBuyBack=reviewTransferPackage(d).ok;
  d.proposal.sellOnPct=NaN;out.invalidNumbers=!!transferTermsError(d);
  resetPackage();d=packageDeal({fee:30000001,proposal:{...TRANSFER_TERMS_DEFAULT,years:3,upfrontPct:25}});approveTransferPackage(d);
  const buyer=userClub(),seller=G.clubs[d.from],cash0=buyer.bal,seller0=seller.bal,budget0=G.fin.tb,ledger0=G.ledger.buys;
  completeIn(d);const upfront=Math.round(d.fee*.25),remaining=d.fee-upfront;
  out.upfront=buyer.bal===cash0-upfront&&seller.bal===seller0+upfront;
  out.exactSchedule=G.payments.length===3&&sum(G.payments,x=>x.amount)===remaining&&G.payments.every(x=>x.from===buyer.id&&x.to===seller.id&&x.due>today().getTime());
  out.budgetReserved=G.fin.tb===budget0-d.fee&&G.ledger.buys===ledger0+upfront;
  const saved=JSON.stringify([buyer.bal,seller.bal,G.fin.tb,G.payments]);completeIn(d);out.noDoubleComplete=saved===JSON.stringify([buyer.bal,seller.bal,G.fin.tb,G.payments]);
  payInstalments();out.notEarly=G.payments.length===3;
  for(const row of G.payments)row.due=today().getTime();payInstalments();const allPaid=JSON.stringify([buyer.bal,seller.bal,G.fin.tb,G.ledger]);payInstalments();
  out.exactSettlement=buyer.bal===cash0-d.fee&&seller.bal===seller0+d.fee&&G.payments.length===0;
  out.noDoublePayment=allPaid===JSON.stringify([buyer.bal,seller.bal,G.fin.tb,G.ledger]);
  out.noDoubleBudget=G.fin.tb===budget0-d.fee&&G.ledger.buys===ledger0+d.fee;
  resetPackage();d=packageDeal({fee:1000000});const orig=G.players[d.pid],former=G.clubs.CIT;orig.sellOn={club:former.id,pct:20};const former0=former.bal,from0=G.clubs[d.from].bal;approveTransferPackage(d);completeIn(d);
  out.sellOnConservation=former.bal===former0+200000&&G.clubs[d.from].bal===from0+800000&&!orig.sellOn;
  resetPackage();d=packageDeal();approveTransferPackage(d);d.proposal.sellOnPct=10;const before=JSON.stringify([G.players,G.payments,G.ledger,G.fin]);const msg=completeIn(d);out.tamperBlocked=/changed/.test(msg)&&before===JSON.stringify([G.players,G.payments,G.ledger,G.fin]);
  resetPackage();d=packageDeal();q=seniorSquad(G.club).find(x=>!x.inj);q.pers='Professional';q.listed=true;q.wage=5000;d.proposal.exchangePid=q.id;d.proposal.exchangeValue=pValue(q);approveTransferPackage(d);const owners=[q.club,G.players[d.pid].club];moveClub(q,'FA');const afterMove=JSON.stringify([G.payments,G.ledger,G.fin]);out.staleSwapBlocked=/exchange player/.test(completeIn(d))&&afterMove===JSON.stringify([G.payments,G.ledger,G.fin])&&G.players[d.pid].club===owners[1];
  resetPackage();G.payments=[{season:G.season,amount:123456,to:'CIT',pid:1}];const oldClub=G.club,oldBal=G.clubs[oldClub].bal;ensureDeals();G.club='BLU';payInstalments(true);out.legacyDebtor=G.clubs[oldClub].bal===oldBal-123456&&G.clubs.BLU.bal===1e9&&G.payments.length===0;
  resetPackage();d=packageDeal();const pl=G.players[d.pid];pl.buyBack={club:G.club,holder:pl.club,price:1000000,expires:today().getTime()+864e5};G.deals=[];const activated=activateBuyBack(pl.id);out.buyBackActivation=!!activated.deal&&activated.deal.memo.max===1000000&&activated.deal.stage==='meeting';
  pl.buyBack.expires=today().getTime()-1;out.expiry=!activeBuyBack(pl)&&!!activateBuyBack(pl.id).error;
  resetPackage();d=packageDeal();const other=G.players[d.pid];other.buyBack={club:G.club,holder:other.club,price:1000000,expires:today().getTime()+864e5};moveClub(other,'CIT');out.thirdClubEndsBuyBack=!other.buyBack;
  return out;
 });
 console.log('package core',JSON.stringify(core));for(const [n,v]of Object.entries(core))check(n,v);
 const selling=await p.evaluate(()=>{
  const out={};
  { resetPackage();newGame(leagueClubs('EPL')[0],'Reinvest bands',1);const c=userClub(),year=clubWageBill(c)*52;G.board.conf=50;
    const at=bal=>{c.bal=bal;return saleReinvest();};
    out.reinvestBands=[at(-1).pct,at(year*.2).pct,at(year*.6).pct,at(year*1.1).pct,at(year*3).pct].join()==='30,40,50,65,80';
    G.board.conf=80;out.reinvestConfidentBoard=at(year*.6).pct===55;G.board.conf=20;out.reinvestDoubtingBoard=at(-1).pct===25;
    G.board.conf=50;c.bal=-1;const tb=G.fin.tb;transferCash('CIT',G.club,1e6);out.reinvestInDebtSale=G.fin.tb===tb+300000; }
  { resetPackage();newGame(leagueClubs('EPL')[0],'Reinvest ask',1);const c=userClub(),year=clubWageBill(c)*52;c.bal=year*.6;G.board.conf=60;G.board.reinvestAsk=null;
    const mr=Math.random;Math.random=()=>0;const a=askBoardReinvest(10);out.reinvestAskGranted=a.got===10&&saleReinvest().pct===60;
    out.reinvestAskCooldown=!askBoardReinvest(10).ok&&reinvestAskWait()===8;
    G.board.reinvestAsk.day-=57;Math.random=()=>0.999;const conf0=G.board.conf;out.reinvestAskRefusedKeepsAgreement=askBoardReinvest(10).got===0&&saleReinvest().pct===60&&G.board.conf===conf0;
    c.bal=-1;out.reinvestAskSuspendedInDebt=saleReinvest().pct===30;c.bal=year*.6;
    G.season++;out.reinvestAskEndsWithSeason=saleReinvest().pct===50;G.season--;
    G.board.conf=90;const hi=reinvestAskOdds(10);G.board.conf=40;const lo=reinvestAskOdds(10);G.board.conf=60;out.reinvestAskOddsFollowConfidence=hi>lo&&reinvestAskOdds(20)<reinvestAskOdds(10);
    G.board.reinvestAsk=null;G.board.conf=40;Math.random=()=>0.999;askBoardReinvest(20);out.reinvestAskDoubtingBoardCostsConfidence=G.board.conf===38;
    Math.random=mr;G.board.conf=50; }
  for(const comp of ['EPL','ECH']){
   resetPackage();const cid=leagueClubs(comp)[0];newGame(cid,'Sale simulation',1);G.fin.tb=1e8;G.fin.wb=1e8;for(const c of Object.values(G.clubs))if(!c.fa&&!c.backgroundOnly)c.bal=500e6;G.deals=[];G.payments=[];
   const player=seniorSquad(cid).find(p=>!p.inj),buyer=G.clubs.CIT;delete player.rc;player.listed=true;
   if(!squadSpace(buyer))moveClub(seniorSquad(buyer.id).at(-1),'FA');
   bidForUser(buyer,player,2e6);const d=activeDeal(player.id,'out');
   setTransferProposal(d,{...TRANSFER_TERMS_DEFAULT,years:2,upfrontPct:50,sellOnPct:10,buyBackPrice:Math.max(pValue(player)*2,4e6)});
   const balance=userClub().bal,budget=G.fin.tb,share=saleReinvest().pct/100;answerOffer(d,'accept');for(let i=0;i<10&&!d.need&&!d.closed;i++)dealTick(d,true);
   out[comp+' saleReady']=d.need?.k==='finalout';completeOut(d);
   out[comp+' upfrontSale']=d.closed?.ok&&userClub().bal===balance+1e6&&G.fin.tb===budget+Math.round(1e6*share)&&G.payments.length===2&&player.sellOn?.club===cid&&activeBuyBack(player);
   for(const row of G.payments)row.due=today().getTime();payInstalments();out[comp+' saleSettled']=G.payments.length===0&&userClub().bal===balance+2e6&&G.fin.tb===budget+2*Math.round(1e6*share);
   out[comp+' wealthyClubReinvestsMore']=share>=0.8;
   const activation=activateBuyBack(player.id),bb=activation.deal;
   if(bb){dealProceed(bb,'quiet',player.buyBack.price,1e6);bb.will='keen';bb.add=0;for(let i=0;i<25&&!bb.closed;i++){if(bb.need){if(bb.need.k==='final'){completeIn(bb);break;}if(['agentfee','wagelimit','bidlimit','notforsale'].includes(bb.need.k))dealRaise(bb,bb.need.wage||bb.need.fee||bb.agentFee);else break;}else dealTick(bb,true);}}
   out[comp+' buyBackCompletes']=!!bb?.closed?.ok&&player.club===cid&&!player.buyBack;
  }
  resetPackage();let d=packageDeal(),q=seniorSquad(G.club).filter(p=>!p.inj).sort((a,b)=>a.ca-b.ca)[0];q.listed=true;q.pers='Professional';q.wage=5000;d.proposal.exchangePid=q.id;d.proposal.exchangeValue=pValue(q);approveTransferPackage(d);q.inj={w:8,n:'Test injury'};const before=JSON.stringify([G.players,G.clubs,G.fin,G.payments]);out.failedExchangeMedicalAtomic=/medical/.test(completeIn(d))&&before===JSON.stringify([G.players,G.clubs,G.fin,G.payments]);
  resetPackage();d=packageDeal({fee:2e6,proposal:{...TRANSFER_TERMS_DEFAULT,years:2,upfrontPct:50}});approveTransferPackage(d);G.fin.tb=1e6;const b0=JSON.stringify([G.players,G.clubs,G.payments]);out.budgetChecksAllCommitment=/guaranteed/.test(completeIn(d))&&b0===JSON.stringify([G.players,G.clubs,G.payments]);
  resetPackage();d=packageDeal({dir:'ai',to:'CIT',stage:'terms',need:null,fee:3000000});while(hash01(d.id+'b')<.1)d.id++;let aiPlayer=G.players[d.pid];aiPlayer.sellOn={club:G.club,pct:15};const beforeAI=userClub().bal;DEAL_STEP.ai.terms(d,aiPlayer);out.aiSalePaysFormerClub=d.closed?.ok&&userClub().bal===beforeAI+450000&&aiPlayer.club==='CIT'&&!aiPlayer.sellOn;
  resetPackage();d=packageDeal({fee:0,proposal:{...TRANSFER_TERMS_DEFAULT,years:1,upfrontPct:50}});out.zeroFeeCannotDefer=!!transferTermsError(d);
  return out;
 });for(const[n,v]of Object.entries(selling))check(n,v);
 // Play the shipped negotiation stages through to completion for each division, then settle future years.
 for(const comp of ['EPL','ECH']){
  const result=await p.evaluate(comp=>{
   resetPackage();const cid=leagueClubs(comp)[0];newGame(cid,'Transfer simulation',1);G.fin.tb=500e6;G.fin.wb=5e6;for(const c of Object.values(G.clubs))if(!c.fa&&!c.backgroundOnly)c.bal=500e6;G.deals=[];G.payments=[];
   if(comp==='ECH')moveClub(seniorSquad(cid).at(-1),'FA');
   const me=userClub(),sellerId=leagueClubs(comp).find(id=>id!==cid),player=seniorSquad(sellerId).find(p=>!p.inj&&p.ca<=me.rep+2)||seniorSquad(sellerId).find(p=>!p.inj);player.listed=true;player.pers='Professional';
   const fee=comp==='EPL'?30e6:2e6,years=comp==='EPL'?3:2,pct=comp==='EPL'?25:50;G.pitches=[{pid:player.id,ask:fee}];
   const d=startDeal(player,'review');DEAL_STEP.in.review(d,player);d.memo.open=fee;d.memo.max=fee;d.add=0;d.will='keen';
   const initial=me.bal,budget=G.fin.tb,seller=G.clubs[player.club],sellerBal=seller.bal;dealProceed(d,'quiet',fee,500000,{...TRANSFER_TERMS_DEFAULT,years,upfrontPct:pct,sellOnPct:10,buyBackPrice:Math.max(fee*2,pValue(player)*2)});
   for(let i=0;i<30&&!d.closed;i++){
    if(d.need){if(d.need.k==='final'){completeIn(d);break;}else if(['agentfee','wagelimit','bidlimit','notforsale'].includes(d.need.k))dealRaise(d,d.need.wage||d.need.fee||d.agentFee);else break;}
    else dealTick(d,true);
   }
   const extra=(d.agentFee||0)+(d.bonus||0),ok=!!d.closed?.ok,upfront=Math.round(d.fee*pct/100),atSigning=me.bal===initial-upfront-extra&&seller.bal===sellerBal+upfront;
   const schedule=G.payments.length===years&&sum(G.payments,x=>x.amount)===d.fee-upfront,clauses=player.sellOn?.pct===10&&player.buyBack?.holder===cid;
   const state=JSON.stringify(G);G=JSON.parse(state);ensureWorld();const retained=G.payments.length===years&&G.players[player.id].buyBack.price===d.proposal.buyBackPrice;
   for(let y=0;y<years+1;y++){G.season++;G.week=2;G.day=0;payInstalments();}
   return{comp,club:cid,player:fullName(player),ok,reason:d.need||d.closed,atSigning,schedule,clauses,retained,settled:G.payments.length===0&&userClub().bal===initial-d.fee-extra&&G.clubs[seller.id].bal===sellerBal+d.fee,budgetOnce:G.fin.tb===budget-d.fee-extra};
  },comp);
  console.log('division simulation',JSON.stringify(result));for(const k of ['ok','atSigning','schedule','clauses','retained','settled','budgetOnce'])check(comp+' '+k,result[k]);
 }
 const swap=await p.evaluate(()=>{
  resetPackage();const ids=leagueClubs('ECH');G.club=ids[0];G.fin.tb=500e6;G.fin.wb=5e6;G.tactics={...G.clubs[G.club].tac,slots:autoPick(G.club,'4-4-2').xi,bench:autoPick(G.club,'4-4-2').bench};
  const player=seniorSquad(ids[1]).find(p=>!p.inj),q=seniorSquad(G.club).find(p=>!p.inj&&p.ca>=G.clubs[ids[1]].rep-16);q.listed=true;q.pers='Professional';q.wage=5000;
  const d=packageDeal({pid:player.id,from:player.club,to:G.club,fee:2e6,wage:5000,proposal:{...TRANSFER_TERMS_DEFAULT,exchangePid:q.id,exchangeValue:pValue(q),years:2,upfrontPct:50}});const counts=[squadOf(G.club).length,squadOf(player.club).length],from=player.club;
  const review=reviewTransferPackage(d);approveTransferPackage(d);const message=completeIn(d);
  return{counts,review,message,ok:d.closed?.ok&&player.club===G.club&&q.club===from&&squadOf(G.club).length===36&&squadOf(from).length===36&&new Set(G.clubs[G.club].squad).size===36};
 });console.log('full Championship exchange',JSON.stringify(swap));check('Two full Championship squads exchange players atomically',swap.ok);
 // Phone controls: drafts, rejection/resubmission, finance, durable save and first XI.
 await p.evaluate(()=>{resetPackage();const player=seniorSquad(leagueClubs('ECH')[0])[0],d=startDeal(player,'review');DEAL_STEP.in.review(d,player);dealSheet(d.id);});
 check('Every paid-player meeting exposes package controls',await p.locator('#dt-years').count()===1&&await p.locator('#dt-buyBackPrice').count()===1);
 check('Transfer package form fits the phone screen',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('#layer .sheet').scrollWidth<=document.querySelector('#layer .sheet').clientWidth+1));
 const exchangeId=await p.locator('#dt-exchangePid option').nth(1).getAttribute('value');await p.locator('#dt-exchangePid').selectOption(exchangeId);await p.waitForFunction(id=>+document.querySelector('#dt-exchangeValue').value===pValue(G.players[id]),+exchangeId);check('Choosing an exchange player fills the real proposed valuation',await p.locator('#dt-exchangeValue').inputValue().then(v=>+v>0));
 await p.locator('#dt-exchangePid').selectOption('0');await p.waitForFunction(()=>+document.querySelector('#dt-exchangeValue').value===0);await p.locator('.transfer-package').scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/futbol-transfer-package-form.png'});

 await p.locator('#dt-years').selectOption('2');await p.locator('#dt-upfrontPct').selectOption('50');await p.locator('#dt-sellOnPct').fill('10');await p.locator('[data-a=dealGo][data-k=proceed]').click();
 check('Proceed reads latest unblurred clause fields',await p.evaluate(()=>G.deals[0].proposal.years===2&&G.deals[0].proposal.upfrontPct===50&&G.deals[0].proposal.sellOnPct===10));
 await p.evaluate(()=>{const d=G.deals[0];d.fee=500000;d.stage='bid';d.bidOut=true;d.need=null;DEAL_STEP.in.bid(d,G.players[d.pid]);dealSheet(d.id);});
 check('Rejected schedule explains the counterparty policy',/75%/.test(await p.locator('#layer').textContent())&&await p.locator('[data-a=dealGo][data-k=package]').count()===1);
 await p.locator('#dt-years').selectOption('1');await p.locator('#dt-upfrontPct').selectOption('75');await p.locator('[data-a=dealGo][data-k=package]').click();
 check('Revised package returns to negotiation without signing',await p.evaluate(()=>!G.deals[0].need&&G.deals[0].stage==='bid'&&G.players[G.deals[0].pid].club!==G.club));
 await p.evaluate(async()=>{closeSheet(true);const d=G.deals[0];G.payments=[{id:999,from:G.club,to:d.from,pid:d.pid,name:fullName(G.players[d.pid]),amount:123456,due:today().getTime()+366*864e5,reserved:true}];await saveGameAsync();go('finance');});
 check('Finances exposes commitments and payment dates',await p.locator('.transfer-commitments').count()===1&&/Future payments owed/.test(await p.locator('.main').textContent()));
 check('Finance commitment screen fits the phone',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.evaluate(()=>{G.board.reinvestAsk=null;G.board.conf=70;render();});check('Finance offers to ask the board for a higher sale share',await p.locator('[data-a=askReinvest]').count()===2);
 await p.evaluate(()=>{Math.random=()=>0;});await p.locator('[data-a=askReinvest][data-v="10"]').click();
 check('The board answer updates the share and starts the wait',await p.evaluate(()=>saleReinvest().extra===10&&reinvestAskWait()===8)&&await p.locator('[data-a=askReinvest]').count()===0&&/ask the board again in 8 weeks/.test(await p.locator('.reinvest').textContent()));await p.screenshot({path:'/tmp/futbol-transfer-finance.png'});

 await p.reload();await p.waitForFunction(()=>G?.payments?.some(x=>x.id===999));check('Scheduled obligations survive durable save and reload',await p.evaluate(()=>G.payments.some(x=>x.id===999&&x.amount===123456&&x.from===G.club)));
 await p.evaluate(()=>go('tactics'));check('First XI appears above substitutes with condition and natural positions',await p.locator('.tactics-first-xi [data-a=slot]').count()===11&&/Natural:/.test(await p.locator('.tactics-first-xi').textContent()));
 check('Mobile controls fit and have no nested buttons',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await p.locator('button button,button a').count()===0);check('No browser errors',errors.length===0);
 console.log(JSON.stringify({passed:checks.length,checks},null,2));
 }finally{if(b)await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
