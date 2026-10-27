#!/usr/bin/env python3
"""Generates index.html for the Transfers film. Run: python3 build.py"""
import math, json

K = 374 / 390            # screen scale (stage css px -> film px)
BZ = 12                  # bezel
PW, PH = 374 + 2*BZ, 810 + 2*BZ
PX, PY = 960 - PW//2, 540 - PH//2
CW = 440                 # callout width
SHEET_TOP = 101.5        # css y of the sheet top inside the stage

def loc(x, y):  # stage css -> phone-local film px
    return BZ + x*K, BZ + y*K

# ---- screens ---------------------------------------------------------
COVER = 'a03-player.png'  # clean header strip used to hide transient news banners
screens = [
  ('a01', 'a01-search-empty.png', False),
  ('a02', 'a02-results.png', False),
  ('a03', 'a03-player.png', False),
  ('a05', 'a05-configured.png', False),   # + scroller
  ('a06', 'a06-proceed.png', True),
  ('b00', 'b00_agentfee.png', True),
  ('b01', 'b01_final.png', True),
  ('b1a', 'b01_final_after.png', True),
  ('c01', 'c01-signed-profile.png', False),
]

# ---- callouts: id, screen, start, end, side, slot-y(frame), rect(stage css), title, sub, scroll
# rect = (x, y, w, h) in stage css px (for a05: sheet-space y, scroller-relative)
C = [
 ('c1','a01',4.9,6.5,'L',540,(14,283,362,281),'Filter the whole world','Position, region, age, value and rating'),
 ('c2','a01',5.5,6.5,'R',270,(199,472,114,36),'One tap to search','Every club, every league'),
 ('c3','a02',7.1,8.9,'R',270,(14,135,362,135),'Live values, real crests','Sort by price, ability or potential'),
 ('c4','a02',7.8,8.9,'L',540,(14,495,362,45),'Spot your target','João Paulo Rocha, £25.0m'),
 ('c5','a03',9.5,11.8,'R',270,(292,118,72,112),'Rated 82 · Elite','A 24-year-old Brazilian striker'),
 ('c6','a03',10.1,11.8,'L',540,(40,295,310,185),'Read the full file','Attributes, best positions, potential'),
 ('c7','a05',12.6,14.3,'L',540,(12,285,366,44),'Choose your approach','Quiet, open or leak to the press'),
 ('c8','a05',13.2,14.3,'R',270,(12,362,366,138),'Set your ceiling','£41.4m fee, £192.5k/w'),
 ('c9','a05',15.3,18.2,'L',540,(12,540,366,76),'More than a fee','2 annual payments · 50% upfront'),
 ('c10','a05',16.0,18.2,'R',640,(12,745,182,62),'Add clauses','10% sell-on to the former club'),
 ('c11','a05',19.2,21.3,'R',270,(12,1088,366,38),'Director of Football','“Proceed. I recommend we move for him.”'),
 ('c12','a05',19.8,21.3,'L',540,(12,1128,366,108),'Finance, tactics, harmony','In budget · 3 Brazil team-mates'),
 ('c13','a06',21.9,23.2,'L',540,(14,110,362,140),'Talks begin','Club and agent sounded out'),
 ('c14','b00',23.7,25.4,'R',270,(14,398,362,38),'The agent wants £3.4m','Pay the fee or walk away'),
 ('c15','b01',25.9,27.9,'L',540,(14,398,362,38),'The final call is yours','£37.8m · 4 years · £68m release clause'),
 ('c16','b1a',28.3,29.9,'R',270,(14,208,362,92),'He has signed','£37.8m · 50% upfront · 10% sell-on'),
 ('c17','c01',30.4,32.8,'R',270,(14,118,270,90),'Welcome to the squad','82 rated striker · first team'),
]
# scroll (css px) in force for the a05 callouts
SCROLL = {'c7':0,'c8':0,'c9':340,'c10':340,'c11':600,'c12':600}

words = [  # text, start, end, font-size
 ('TRANSFERS',0.0,4.2,262),('SEARCH',4.0,9.2,400),('SCOUT',9.0,12.2,440),('OFFER',12.0,18.7,440),
 ('MEMO',18.5,21.7,470),('DEAL',21.5,25.7,470),('SIGN',25.5,30.2,470),('SQUAD',30.0,33.2,430),
]
heads = [  # kicker, headline, sub, start, end
 ('THE 2026/27 SEASON · FEATURE 01','Find the players to take your club forward.','',0.4,4.0),
 ('01 · SEARCH','Find your target.','Filter the whole database or follow the trending stories.',4.2,9.0),
 ('02 · SCOUT','Know him before you bid.','Open the file: rating, attributes, potential.',9.2,12.0),
 ('03 · OFFER','Make your move.','Set your price and decide how you approach the deal.',12.2,15.6),
 ('03 · OFFER','More than a fee.','Choose payment terms, explore a player exchange and add clauses.',15.6,18.5),
 ('04 · ADVICE','Your Director of Football weighs in.','Finance, tactics and harmony. You make the final call.',18.7,21.5),
 ('05 · NEGOTIATE','The deal moves.','Club, agent and player each have their say.',21.7,25.5),
 ('06 · SIGN','The final decision is yours.','Review the details, then complete the transfer.',25.7,30.0),
 ('07 · SQUAD','Shape your squad.','Review the details and decide your next move.',30.2,33.0),
]
nodes = [('Search',4.0),('Scout',9.0),('Offer',12.0),('Advice',18.5),('Deal',21.5),('Sign',25.5),('Squad',30.0)]
DUR = 37.0

html = []
A = html.append
A('''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
:root{--bg0:#06020d;--bg1:#1b0a33;--cyan:#2de2f0;--violet:#8b5cf6;--magenta:#d946ef;--green:#35e08a;--ink:#ffffff;--soft:rgba(255,255,255,.78);--font-display:'Archivo Black','Inter',sans-serif;--font-body:'Inter',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--bg0)}
#root{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;font-family:var(--font-body);color:var(--ink);background:radial-gradient(1200px 900px at 50% 45%,#2a1052 0%,var(--bg1) 38%,var(--bg0) 100%)}
.fill{position:absolute;inset:0}
#glowA{position:absolute;left:560px;top:150px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(45,226,240,.30),rgba(45,226,240,0) 65%)}
#glowB{position:absolute;left:1000px;top:380px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.40),rgba(139,92,246,0) 65%)}
#grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:96px 96px}
.dot{position:absolute;width:10px;height:10px;border-radius:50%;background:var(--cyan);opacity:.0;box-shadow:0 0 18px var(--cyan)}
.word{position:absolute;left:0;top:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);line-height:1;white-space:nowrap;letter-spacing:-.01em}
.word .mask{display:inline-block;overflow:hidden;padding:30px 0 10px}
.word .ch{display:inline-block;color:transparent;-webkit-text-stroke:3px rgba(45,226,240,.62);background:linear-gradient(180deg,rgba(45,226,240,.34),rgba(139,92,246,.10));-webkit-background-clip:text;background-clip:text}
.head{position:absolute;left:120px;top:92px;width:560px}
.head .k{font-weight:900;font-size:28px;letter-spacing:.16em;color:var(--cyan);margin-bottom:18px}
.head h2{font-family:var(--font-display);font-size:62px;line-height:1.04;letter-spacing:-.01em;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:6px}
.head p{margin-top:16px;font-size:28px;line-height:1.3;color:var(--soft);font-weight:700}
.phone{position:absolute;left:%PX%px;top:%PY%px;width:%PW%px;height:%PH%px;perspective:2400px}
.tilt{position:absolute;inset:0}
.device{position:absolute;inset:0;border-radius:64px;background:linear-gradient(145deg,#4a2a86,#150a2b 40%,#2a1450);padding:%BZ%px;box-shadow:0 0 0 2px rgba(45,226,240,.55),0 40px 120px rgba(0,0,0,.65),0 0 140px rgba(139,92,246,.45)}
.screen{position:relative;width:374px;height:810px;border-radius:52px;overflow:hidden;background:#16082a}
.stage{position:absolute;left:0;top:0;width:390px;height:844px;transform:scale(%K%);transform-origin:0 0}
.scr{position:absolute;inset:0;opacity:0;overflow:hidden}
.scr img.base{position:absolute;left:0;top:0;width:390px;height:844px}
.cover{position:absolute;left:0;top:0;width:390px;height:100px;overflow:hidden}
.cover img{width:390px;height:844px}
.scroller{position:absolute;left:0;top:%SHEET_TOP%px;width:390px;height:%SH%px;overflow:hidden}
.sc-inner{position:absolute;left:0;top:0;width:390px}
.sc-inner img{display:block;width:390px}
.ring{position:absolute;border-radius:14px;border:3px solid var(--cyan);box-shadow:0 0 0 3px rgba(45,226,240,.18),0 0 26px rgba(45,226,240,.65),inset 0 0 22px rgba(45,226,240,.18);opacity:0}
.sweep{position:absolute;top:-100px;left:-300px;width:200px;height:1100px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);opacity:0}
.glass{position:absolute;inset:0;border-radius:52px;background:linear-gradient(125deg,rgba(255,255,255,.14),rgba(255,255,255,0) 32%);pointer-events:none}
.notch{position:absolute;left:50%;top:10px;width:96px;height:6px;margin-left:-48px;border-radius:3px;background:rgba(255,255,255,.18)}
svg.leads{position:absolute;left:-700px;top:-300px;width:2000px;height:1500px;overflow:visible;pointer-events:none}
svg.leads line{stroke:var(--cyan);stroke-width:3;stroke-linecap:round;opacity:0;filter:drop-shadow(0 0 6px rgba(45,226,240,.8))}
svg.leads circle{fill:var(--cyan);opacity:0}
.co{position:absolute;width:%CW%px;padding:22px 26px 24px;border-radius:26px;background:linear-gradient(160deg,rgba(40,16,78,.94),rgba(18,7,38,.94));border:2px solid rgba(45,226,240,.6);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 40px rgba(45,226,240,.18);opacity:0}
.co .n{display:inline-block;min-width:44px;height:44px;line-height:44px;text-align:center;border-radius:22px;background:linear-gradient(135deg,var(--cyan),var(--violet));color:#0b0418;font-weight:900;font-size:26px;margin-bottom:10px}
.co h3{font-weight:900;font-size:38px;line-height:1.08;letter-spacing:-.01em;color:#fff}
.co p{margin-top:8px;font-weight:700;font-size:27px;line-height:1.25;color:var(--soft)}
.co.good{border-color:rgba(53,224,138,.75);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 44px rgba(53,224,138,.3)}
.co.good .n{background:linear-gradient(135deg,#35e08a,#2de2f0)}
.conf{position:absolute;width:16px;height:16px;border-radius:4px;opacity:0}
#tracker{position:absolute;left:300px;top:972px;width:1320px;height:60px}
#trline{position:absolute;left:30px;top:12px;width:1260px;height:6px;border-radius:3px;background:rgba(255,255,255,.14)}
#trfill{position:absolute;left:30px;top:12px;width:1260px;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--cyan),var(--violet));transform-origin:0 50%}
.node{position:absolute;top:0;width:150px;margin-left:-75px;text-align:center}
.node i{display:block;margin:0 auto;width:24px;height:24px;border-radius:50%;background:#2a1552;border:3px solid rgba(255,255,255,.35)}
.node b{display:block;margin-top:6px;font-size:26px;font-weight:900;color:rgba(255,255,255,.55)}
#brand{position:absolute;right:120px;top:92px;text-align:right;font-weight:900;font-size:28px;letter-spacing:.16em;color:#fff}
#brand span{color:var(--cyan)}
#endcard{position:absolute;left:0;top:0;width:1920px;height:1080px}
#endcard .inner{position:absolute;left:960px;top:250px;width:900px}
#endcard .small{font-weight:900;font-size:30px;letter-spacing:.18em;color:var(--cyan)}
#endcard h1{font-family:var(--font-display);font-size:122px;white-space:nowrap;line-height:1;margin-top:18px;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:10px}
#endcard .tag{margin-top:20px;font-size:44px;font-weight:900}
#endcard .chips{margin-top:34px;display:flex;flex-wrap:wrap;gap:16px}
#endcard .chip{padding:12px 26px;border-radius:40px;font-size:28px;font-weight:900;background:rgba(45,226,240,.12);border:2px solid rgba(45,226,240,.6)}
#endcard .cta{display:inline-block;margin-top:44px;padding:20px 44px;border-radius:44px;font-size:36px;font-weight:900;color:#06020d;background:linear-gradient(90deg,var(--cyan),#6ee7ff);box-shadow:0 0 50px rgba(45,226,240,.6)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="%DUR%" data-width="1920" data-height="1080">
''')

A('<div id="bg" class="clip fill" data-start="0" data-duration="%DUR%" data-track-index="0"><div id="glowA"></div><div id="glowB"></div><div id="grid"></div>')
import random
rnd = random.Random(7)
for i in range(16):
    A(f'<span class="dot" id="dot{i}" style="left:{rnd.randint(80,1840)}px;top:{rnd.randint(120,960)}px"></span>')
A('</div>')

# giant words
for i,(w,s,e,fs) in enumerate(words):
    chars = ''.join(f'<span class="mask"><span class="ch" id="w{i}c{j}">{ch}</span></span>' for j,ch in enumerate(w))
    suffix = '.' if i==0 else ''
    A(f'<div id="word{i}" class="word clip" data-layout-ignore data-start="{s}" data-duration="{e-s:.2f}" data-track-index="1" data-layout-allow-overflow style="font-size:{fs}px">{chars}</div>')

# headlines
for i,(k,h,p,s,e) in enumerate(heads):
    sub = f'<p>{p}</p>' if p else ''
    A(f'<div id="head{i}" class="head clip" data-start="{s}" data-duration="{e-s:.2f}" data-track-index="2"><div class="k">{k}</div><h2>{h}</h2>{sub}</div>')

A(f'<div id="brand" class="clip" data-start="0.6" data-duration="{DUR-0.6}" data-track-index="2">FUTBOL <span>MANAGER</span></div>')

# phone
A(f'<div id="phone" class="phone clip" data-layout-allow-occlusion data-start="0" data-duration="{DUR}" data-track-index="3"><div id="tilt" class="tilt"><div class="device"><div class="screen"><div class="stage">')
for sid, img, cover in screens:
    A(f'<div class="scr" id="s-{sid}"><img class="base" src="assets/{img}" alt="">')
    if sid == 'a05':
        A('<div class="scroller" id="scroller"><div class="sc-inner" id="scin"><img src="assets/a05-configured-tall.png" alt="">')
        for cid,scr,s,e,side,slot,rect,t,sub in C:
            if scr=='a05':
                x,y,w,h = rect
                A(f'<div class="ring" id="{cid}-ring" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>')
        A('</div></div>')
    if cover:
        A(f'<div class="cover"><img src="assets/{COVER}" alt=""></div>')
    if sid != 'a05':
        for cid,scr,s,e,side,slot,rect,t,sub in C:
            if scr==sid:
                x,y,w,h = rect
                A(f'<div class="ring" id="{cid}-ring" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>')
    A('</div>')
A('<div class="sweep" id="sweep"></div></div><div class="glass"></div><div class="notch"></div></div></div></div>')

# leads + callouts (siblings of tilt, so they stay upright)
lines = []; cards = []
for n,(cid,scr,s,e,side,slot,rect,t,sub) in enumerate(C, start=1):
    x,y,w,h = rect
    if scr=='a05':
        y = SHEET_TOP + y - SCROLL[cid]
    # end point on the ring edge facing the card
    ex, ey = loc(x if side=='L' else x+w, y + h/2)
    ph_slot = slot - PY
    if side=='L':
        cx0 = -70 - CW; sx = -70
    else:
        cx0 = PW + 70; sx = PW + 70
    lines.append((cid, sx, ph_slot, ex, ey))
    good = ' good' if cid in ('c16','c17') else ''
    cards.append((cid, cx0, ph_slot, n, t, sub, good))
A(f'<svg class="leads" viewBox="-700 -300 2000 1500" id="leads">')
for cid,sx,sy,ex,ey in lines:
    A(f'<line id="{cid}-lead" x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}"/><circle id="{cid}-pt" cx="{ex:.1f}" cy="{ey:.1f}" r="7"/>')
A('</svg>')
for cid,cx0,sy,n,t,sub,good in cards:
    s,e = [(c[2],c[3]) for c in C if c[0]==cid][0]
    A(f'<div id="{cid}-card" class="co{good} clip" data-start="{s-0.2:.2f}" data-duration="{e-s+0.7:.2f}" data-track-index="4" data-layout-allow-overlap style="left:{cx0}px;top:{sy-80:.0f}px"><span class="n">{n}</span><h3>{t}</h3><p>{sub}</p></div>')
for i in range(30):
    a = rnd.uniform(0,2*math.pi); r = rnd.uniform(220,520)
    col = rnd.choice(['#2de2f0','#8b5cf6','#35e08a','#ffffff','#d946ef'])
    A(f'<span class="conf" id="cf{i}" style="left:{PW//2}px;top:{PH//2-100}px;background:{col}" data-dx="{math.cos(a)*r:.0f}" data-dy="{math.sin(a)*r-120:.0f}" data-rot="{rnd.randint(-500,500)}"></span>')
A('</div>')  # /phone

# tracker
A('<div id="tracker" class="clip" data-start="3.6" data-duration="%d" data-track-index="2"><div id="trline"></div><div id="trfill"></div>' % (33.3-3.6))
for i,(nm,t) in enumerate(nodes):
    x = 30 + 1260*i/(len(nodes)-1)
    A(f'<div class="node" id="nd{i}" style="left:{x:.0f}px"><i></i><b>{nm}</b></div>')
A('</div>')

# end card
A('''<div id="endcard" class="clip" data-start="33.0" data-duration="4.0" data-track-index="5"><div class="inner"><div class="small" id="e1">FUTBOL MANAGER · 2026/27</div><h1 id="e2">TRANSFERS.</h1><div class="tag" id="e3">Your club. Your call.</div><div class="chips" id="e4"><span class="chip">Search</span><span class="chip">Scout</span><span class="chip">Negotiate</span><span class="chip">Sign</span></div><div class="cta" id="e5">Play in your browser</div></div></div>''')

A('</div>')  # /root

# ---------------- timeline script -----------------
js = []
J = js.append
J('const tl = gsap.timeline({ paused: true });')
J(f'const C = {json.dumps([dict(id=c[0],scr=c[1],s=c[2],e=c[3],side=c[4]) for c in C])};')
J(f'const WORDS = {json.dumps([(w[1],w[2],len(w[0])) for w in words])};')
J(f'const NODES = {json.dumps([n[1] for n in nodes])};')
J('''
const $ = (s) => document.querySelector(s);
const EASE = "expo.out";
/* background drift */
tl.fromTo("#glowA", { x: -80, y: 0 }, { x: 160, y: 60, duration: 37, ease: "sine.inOut" }, 0);
tl.fromTo("#glowB", { x: 80, y: 0 }, { x: -200, y: -80, duration: 37, ease: "sine.inOut" }, 0);
for (let i = 0; i < 16; i++) {
  const s = (i * 1.7) % 30, d = 5 + (i % 4);
  tl.fromTo("#dot" + i, { opacity: 0, y: 0 }, { opacity: 0.8, y: -120 - (i % 5) * 30, duration: d / 2, ease: "sine.out" }, s);
  tl.to("#dot" + i, { opacity: 0, y: -260 - (i % 5) * 30, duration: d / 2, ease: "sine.in" }, s + d / 2);
}
/* giant words */
WORDS.forEach(([s, e, n], i) => {
  for (let j = 0; j < n; j++) {
    tl.fromTo("#w" + i + "c" + j, { yPercent: 115, rotation: 6 }, { yPercent: 0, rotation: 0, duration: 0.8, ease: "expo.out" }, s + 0.08 * j);
    tl.to("#w" + i + "c" + j, { yPercent: -115, duration: 0.45, ease: "power3.in" }, e - 0.55 + 0.04 * j);
  }
  tl.fromTo("#word" + i, { x: 60 }, { x: -60, duration: e - s, ease: "none" }, s);
});
/* headlines */
%HEADS%
tl.fromTo("#brand", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0.6);
/* phone entrance, float, sway */
tl.set("#phone", { x: 0, y: 0 }, 0);
tl.fromTo("#tilt", { y: 1100, rotationX: 28, rotationY: -42, scale: 0.7 }, { y: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 1.7, ease: "expo.out" }, 0.2);
for (let t = 1.9, k = 0; t < 33; t += 2.6, k++) {
  tl.to("#phone", { y: k % 2 ? 12 : -14, duration: 2.6, ease: "sine.inOut" }, t);
}
for (let t = 1.9, k = 0; t < 32.9; t += 3.3, k++) {
  tl.to("#tilt", { rotationY: k % 2 ? -7 : 7, rotationX: k % 2 ? 2 : -2, duration: 3.3, ease: "sine.inOut" }, t);
}
/* screens */
const SCR = [["a01", 0.9, 6.6], ["a02", 6.6, 9.0], ["a03", 9.0, 12.0], ["a05", 12.0, 21.6], ["a06", 21.6, 23.4], ["b00", 23.4, 25.6], ["b01", 25.6, 28.0], ["b1a", 28.0, 30.0], ["c01", 30.0, 37]];
SCR.forEach(([id, s, e], i) => {
  const first = i === 0, last = i === SCR.length - 1;
  tl.fromTo("#s-" + id, { opacity: first ? 0 : 0 }, { opacity: 1, duration: first ? 0.7 : 0.35, ease: "power2.out" }, first ? s : s - 0.15);
  if (!last) tl.to("#s-" + id, { opacity: 0, duration: 0.2, ease: "none" }, e + 0.2);
  if (!first) tl.fromTo("#sweep", { x: -300, opacity: 0.9 }, { x: 760, opacity: 0, duration: 0.7, ease: "power2.inOut" }, s - 0.1);
});
/* scroll the offer sheet */
tl.fromTo("#scin", { y: 0 }, { y: -340, duration: 0.8, ease: "power3.inOut" }, 14.4);
tl.to("#scin", { y: -600, duration: 0.8, ease: "power3.inOut" }, 18.4);
/* callouts */
C.forEach((c) => {
  const dir = c.side === "L" ? -1 : 1;
  tl.fromTo("#" + c.id + "-card", { opacity: 0, x: 60 * dir, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" }, c.s - 0.2);
  tl.fromTo("#" + c.id + "-ring", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.4, ease: EASE }, c.s);
  tl.fromTo("#" + c.id + "-lead", { opacity: 0, strokeDasharray: 600, strokeDashoffset: 600 }, { opacity: 1, strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, c.s);
  tl.fromTo("#" + c.id + "-pt", { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, c.s + 0.35);
  tl.to("#" + c.id + "-ring", { scale: 1.035, duration: 0.45, yoyo: true, repeat: 1, ease: "sine.inOut" }, c.s + 0.5);
  const x = c.e;
  tl.to("#" + c.id + "-card", { opacity: 0, x: 40 * dir, duration: 0.35, ease: "power2.in" }, x);
  tl.to("#" + c.id + "-ring", { opacity: 0, duration: 0.3 }, x);
  tl.to("#" + c.id + "-lead", { opacity: 0, duration: 0.3 }, x);
  tl.to("#" + c.id + "-pt", { opacity: 0, duration: 0.3 }, x);
});
/* confetti when he signs */
for (let i = 0; i < 30; i++) {
  const el = $("#cf" + i);
  const dx = +el.dataset.dx, dy = +el.dataset.dy, rot = +el.dataset.rot;
  tl.fromTo("#cf" + i, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 28.15);
  tl.fromTo("#cf" + i, { x: 0, y: 0, rotation: 0 }, { x: dx, y: dy, rotation: rot, duration: 0.9, ease: "power3.out" }, 28.15);
  tl.to("#cf" + i, { y: dy + 260, opacity: 0, duration: 0.9, ease: "power2.in" }, 29.05);
}
/* tracker */
tl.fromTo("#tracker", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 3.6);
tl.fromTo("#trfill", { scaleX: 0 }, { scaleX: 0, duration: 0.01 }, 3.6);
NODES.forEach((t, i) => {
  tl.to("#trfill", { scaleX: i / (NODES.length - 1), duration: 0.6, ease: "power2.inOut" }, t);
  tl.to("#nd" + i + " i", { backgroundColor: "#2de2f0", borderColor: "#ffffff", scale: 1.35, duration: 0.35, ease: "back.out(2)" }, t + 0.1);
  tl.to("#nd" + i + " b", { color: "#ffffff", duration: 0.3 }, t + 0.1);
});
tl.to("#tracker", { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" }, 32.6);
/* end card */
tl.to("#phone", { x: -330, duration: 1.1, ease: "expo.inOut" }, 32.7);
tl.to("#tilt", { scale: 0.86, duration: 1.1, ease: "expo.inOut" }, 32.7);
tl.to("#brand", { opacity: 0, duration: 0.3 }, 32.8);
["e1", "e2", "e3", "e4", "e5"].forEach((id, i) => {
  tl.fromTo("#" + id, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE }, 33.5 + i * 0.18);
});
tl.fromTo("#e5", { scale: 1 }, { scale: 1.06, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 35.0);
tl.set({}, {}, %DUR%);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
''')
head_js = []
for i,(k,h,p,s,e) in enumerate(heads):
    head_js.append(f'tl.fromTo("#head{i}", {{ opacity: 0, y: 40, filter: "blur(10px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: EASE }}, {s});')
    head_js.append(f'tl.to("#head{i}", {{ opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }}, {e-0.45});')
body = '\n'.join(js).replace('%HEADS%', '\n'.join(head_js))
A('<script>\n' + body + '\n</script></body></html>')

out = '\n'.join(html)
for k,v in {'%PX%':PX,'%PY%':PY,'%PW%':PW,'%PH%':PH,'%BZ%':BZ,'%K%':f'{K:.5f}','%SHEET_TOP%':SHEET_TOP,'%SH%':844-SHEET_TOP,'%CW%':CW,'%DUR%':DUR}.items():
    out = out.replace(k, str(v))
open('index.html','w').write(out)
print('ok', len(out))
