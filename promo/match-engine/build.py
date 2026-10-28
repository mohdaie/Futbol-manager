#!/usr/bin/env python3
"""Generates index.html for the Match Engine film (draft). Run: python3 build.py
All numbers on the data panels come from real runs, noted beside each table below."""
import math, json, random

K = 374/390; BZ = 12
PW, PH = 374+2*BZ, 810+2*BZ
PX, PY = 960-PW//2, 540-PH//2
CW = 440
DUR = 36.0

def loc(x, y): return BZ+x*K, BZ+y*K

# ---- scoreboard: scripts/realism/scorecard.js, SEED=1, 120 matches, current code (27 Oct 2026).
# bands are the real-football targets in scripts/realism/README.md.  (label, value, unit, scale lo/hi, band lo/hi)
SCORE = [
 ('Goals per match',   1.83, '',  0, 4,   2.5, 3.0),
 ('Shots per match',   18.5, '',  10, 35, 22, 28),
 ('Passes per team',   537.5,'',  300, 800, 450, 550),
 ('Yellow cards',      3.77, '',  0, 7,   3, 4),
 ('Ground duels / team', 59.2,'', 30, 90, 50, 60),
 ('Offsides',          3.27, '',  0, 7,   3.5, 4),
 ('Fouls',             27.8, '',  10, 40, 22, 25),
 ('Home wins',         38,  '%',  20, 70, 42, 48),
]
def status(v, lo, hi): return 'in' if lo <= v <= hi else ('below' if v < lo else 'above')

# ---- callouts: id, screen, start, end, side, slot y, ring rect (stage css) or point, title, sub
C = [
 ('c1','live1',4.8,8.0,'L',540,('pt',150,390),'22 players + the ball','Tracked every half second'),
 ('c2','live1',5.4,8.6,'R',270,('pt',195,101),'Weather and kick-off','They change fitness and results'),
 ('c3','live1',6.2,9.0,'R',640,('pt',195,636),'Real football events','Offsides, fouls, cards, corners'),
 ('c4','form',9.5,11.3,'L',540,('rect',12,270,366,300),'4-2-3-1 with the ball','Roles stay in their lanes'),
 ('c5','formw',11.7,14.0,'R',270,('rect',12,270,366,300),'4-4-2 without it','The shape changes with possession'),
 ('c6','formw',12.3,14.0,'L',640,('pt',100,460),'Roles read the play','Full-backs step in, wingers hold width'),
]
words = [('ENGINE',0.0,4.2,330),('LIVE',4.0,9.3,520),('SHAPE',9.1,14.2,430),('MEASURE',14.0,20.2,300),('FIX',20.0,26.2,620),('LEARN',26.0,32.4,470)]
heads = [  # kicker, headline, sub, start, end, left, width
 ('THE 2026/27 SEASON · FEATURE 02','Built to play by football’s rules.','',0.4,4.0,120,560),
 ('01 · SIMULATE','22 players. One ball.','Every half second, every player decides and moves.',4.2,9.0,120,560),
 ('02 · SHAPE','Tactics you can see.','One shape with the ball, another without it.',9.2,14.0,120,560),
 ('03 · MEASURE','Held to real-world numbers.','Seeded test worlds, scored against real football.',14.2,20.0,900,900),
 ('04 · FIX','Found a bug. Fixed it.','A hidden home-side edge, caught by a symmetry test.',20.2,26.0,120,900),
 ('05 · LEARN','Managers that learn.','They learn from results and only go live after beating the rules.',26.2,32.4,900,900),
]
nodes = [('Simulate',4.0),('Shape',9.0),('Measure',14.0),('Fix',20.0),('Learn',26.0)]
PHONE_X = {  # phone centre offsets (px) per time
 'c':0, 'l':-480, 'r':480,
}

html=[]; A=html.append
A('''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
:root{--bg0:#06020d;--bg1:#1b0a33;--cyan:#2de2f0;--violet:#8b5cf6;--magenta:#d946ef;--green:#35e08a;--amber:#ffb547;--ink:#ffffff;--soft:rgba(255,255,255,.78);--font-display:'Archivo Black','Inter',sans-serif;--font-body:'Inter',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--bg0)}
#root{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;font-family:var(--font-body);color:var(--ink);background:radial-gradient(1200px 900px at 50% 45%,#2a1052 0%,var(--bg1) 38%,var(--bg0) 100%)}
.fill{position:absolute;inset:0}
#glowA{position:absolute;left:560px;top:150px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(45,226,240,.30),rgba(45,226,240,0) 65%)}
#glowB{position:absolute;left:1000px;top:380px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.40),rgba(139,92,246,0) 65%)}
#grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:96px 96px}
.dot{position:absolute;width:10px;height:10px;border-radius:50%;background:var(--cyan);opacity:0;box-shadow:0 0 18px var(--cyan)}
.word{position:absolute;left:0;top:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);line-height:1;white-space:nowrap;letter-spacing:-.01em}
.word .mask{display:inline-block;overflow:hidden;padding:30px 0 10px}
.word .ch{display:inline-block;color:transparent;-webkit-text-stroke:3px rgba(45,226,240,.62);background:linear-gradient(180deg,rgba(45,226,240,.34),rgba(139,92,246,.10));-webkit-background-clip:text;background-clip:text}
.head{position:absolute;top:92px}
.head .k{font-weight:900;font-size:28px;letter-spacing:.16em;color:var(--cyan);margin-bottom:18px}
.head h2{font-family:var(--font-display);font-size:62px;line-height:1.04;letter-spacing:-.01em;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:6px}
.head p{margin-top:16px;font-size:28px;line-height:1.3;color:var(--soft);font-weight:700}
.phone{position:absolute;left:%PX%px;top:%PY%px;width:%PW%px;height:%PH%px;perspective:2400px}
.tilt{position:absolute;inset:0}
.device{position:absolute;inset:0;border-radius:64px;background:linear-gradient(145deg,#4a2a86,#150a2b 40%,#2a1450);padding:%BZ%px;box-shadow:0 0 0 2px rgba(45,226,240,.55),0 40px 120px rgba(0,0,0,.65),0 0 140px rgba(139,92,246,.45)}
.screen{position:relative;width:374px;height:810px;border-radius:52px;overflow:hidden;background:#16082a}
.stage{position:absolute;left:0;top:0;width:390px;height:844px;transform:scale(%K%);transform-origin:0 0}
.scr{position:absolute;inset:0;opacity:0;overflow:hidden}
.scr img,.scr video{position:absolute;left:0;top:0;width:390px;height:844px;object-fit:cover}
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
.panel{position:absolute;top:330px;height:630px;padding:30px 36px;border-radius:30px;background:linear-gradient(160deg,rgba(34,13,66,.92),rgba(14,5,30,.92));border:2px solid rgba(45,226,240,.45);box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 60px rgba(45,226,240,.12)}
.panel .pt{font-weight:900;font-size:34px;letter-spacing:-.005em}
.panel .ps{font-weight:700;font-size:26px;color:var(--soft);margin-top:4px}
.row{position:absolute;left:36px;width:828px;height:56px}
.row .lb{position:absolute;left:0;top:10px;width:290px;font-weight:900;font-size:28px;white-space:nowrap}
.row .tr{position:absolute;left:300px;top:20px;width:330px;height:16px;border-radius:8px;background:rgba(255,255,255,.12)}
.row .bd{position:absolute;top:-6px;height:28px;border-radius:6px;background:rgba(45,226,240,.30);border:2px solid rgba(45,226,240,.7)}
.row .mk{position:absolute;top:-8px;width:32px;height:32px;margin-left:-16px;border-radius:50%;background:var(--cyan);border:4px solid #fff;box-shadow:0 0 22px rgba(45,226,240,.9)}
.row.out .mk{background:var(--amber);box-shadow:0 0 22px rgba(255,181,71,.9)}
.row .vl{position:absolute;left:650px;top:8px;width:96px;text-align:right;font-weight:900;font-size:30px}
.row .st{position:absolute;left:756px;top:10px;font-weight:900;font-size:26px;color:var(--cyan);white-space:nowrap}
.row.out .st{color:var(--amber)}
.legend{position:absolute;left:36px;bottom:24px;width:920px;font-weight:700;font-size:26px;color:var(--soft)}
.legend b{color:var(--cyan)} .legend i{font-style:normal;color:var(--amber);font-weight:900}
.bars{position:absolute;left:36px;width:940px}
.bgrp{position:absolute;left:0;width:940px;height:200px}
.bgrp .gt{font-weight:900;font-size:30px;margin-bottom:10px}
.bar{position:relative;height:60px;margin-bottom:12px}
.bar .bl{position:absolute;left:0;top:14px;font-weight:700;font-size:27px;width:300px;color:var(--soft)}
.bar .bf{position:absolute;left:310px;top:8px;height:44px;border-radius:10px;background:linear-gradient(90deg,var(--violet),var(--cyan));transform-origin:0 50%}
.bar.bad .bf{background:linear-gradient(90deg,#ff7a45,var(--amber))}
.bar .bv{position:absolute;top:10px;font-weight:900;font-size:32px}
.steps{position:absolute;left:36px;top:116px;width:828px;height:150px}
.stp{position:absolute;top:0;width:150px;height:150px;border-radius:22px;background:rgba(45,226,240,.10);border:2px solid rgba(45,226,240,.5);text-align:center;padding-top:16px}
.stp b{display:block;font-weight:900;font-size:30px}
.stp span{display:block;margin-top:6px;font-weight:700;font-size:26px;line-height:1.15;color:var(--soft)}
.stp em{display:block;font-style:normal;font-weight:900;font-size:26px;color:var(--cyan)}
.kvs{position:absolute;left:36px;top:288px;width:828px;height:120px}
.kv{position:absolute;top:0;width:195px;height:120px;text-align:center}
.kv b{display:block;font-family:var(--font-display);font-size:60px;line-height:1.1;background:linear-gradient(90deg,#2de2f0,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent}
.kv span{display:block;font-weight:700;font-size:26px;color:var(--soft);line-height:1.1}
.guard{position:absolute;left:36px;top:432px;width:828px;height:172px;border-radius:22px;background:rgba(255,181,71,.10);border:2px solid rgba(255,181,71,.7);padding:18px 26px}
.guard .g1{font-weight:900;font-size:30px;color:var(--amber)}
.guard .g2{margin-top:6px;font-weight:900;font-size:40px}
.guard .g3{margin-top:6px;font-weight:700;font-size:27px;color:var(--soft)}
#tracker{position:absolute;left:480px;top:972px;width:960px;height:60px}
#trline{position:absolute;left:30px;top:12px;width:900px;height:6px;border-radius:3px;background:rgba(255,255,255,.14)}
#trfill{position:absolute;left:30px;top:12px;width:900px;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--cyan),var(--violet));transform-origin:0 50%}
.node{position:absolute;top:0;width:170px;margin-left:-85px;text-align:center}
.node i{display:block;margin:0 auto;width:24px;height:24px;border-radius:50%;background:#2a1552;border:3px solid rgba(255,255,255,.35)}
.node b{display:block;margin-top:6px;font-size:26px;font-weight:900;color:rgba(255,255,255,.55)}
#brand{position:absolute;right:120px;top:92px;text-align:right;font-weight:900;font-size:28px;letter-spacing:.16em;color:#fff}
#brand span{color:var(--cyan)}
#endcard{position:absolute;left:0;top:0;width:1920px;height:1080px}
#endcard .inner{position:absolute;left:960px;top:230px;width:900px}
#endcard .small{font-weight:900;font-size:30px;letter-spacing:.18em;color:var(--cyan)}
#endcard h1{font-family:var(--font-display);font-size:104px;line-height:1;white-space:nowrap;margin-top:18px;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:10px}
#endcard .tag{margin-top:20px;font-size:44px;font-weight:900;line-height:1.15}
#endcard .chips{margin-top:34px;display:flex;flex-wrap:wrap;gap:16px}
#endcard .chip{padding:12px 26px;border-radius:40px;font-size:28px;font-weight:900;background:rgba(45,226,240,.12);border:2px solid rgba(45,226,240,.6)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="%DUR%" data-width="1920" data-height="1080">
''')
rnd = random.Random(11)
A('<div id="bg" class="clip fill" data-start="0" data-duration="%DUR%" data-track-index="0"><div id="glowA"></div><div id="glowB"></div><div id="grid"></div>')
for i in range(16):
    A(f'<span class="dot" id="dot{i}" style="left:{rnd.randint(80,1840)}px;top:{rnd.randint(120,960)}px"></span>')
A('</div>')
for i,(w,s,e,fs) in enumerate(words):
    chars=''.join(f'<span class="mask"><span class="ch" id="w{i}c{j}">{ch}</span></span>' for j,ch in enumerate(w))
    A(f'<div id="word{i}" class="word clip" data-layout-ignore data-start="{s}" data-duration="{e-s:.2f}" data-track-index="1" style="font-size:{fs}px">{chars}</div>')
for i,(k,h,p,s,e,l,w) in enumerate(heads):
    sub=f'<p>{p}</p>' if p else ''
    A(f'<div id="head{i}" class="head clip" data-start="{s}" data-duration="{e-s:.2f}" data-track-index="2" style="left:{l}px;width:{w}px"><div class="k">{k}</div><h2>{h}</h2>{sub}</div>')
A(f'<div id="brand" class="clip" data-start="0.6" data-duration="{DUR-0.6}" data-track-index="2">FUTBOL <span>MANAGER</span></div>')

# ---- panels (below the phone in z-order is wrong: they sit beside it, so order is free)
# scoreboard
A('<div id="p-score" class="panel clip" data-start="14.4" data-duration="5.8" data-track-index="3" style="left:900px;width:900px"><div class="pt">Engine scorecard vs real football</div><div class="ps">Seeded world 1 · 120 matches · today’s code</div>')
for i,(lb,v,u,slo,shi,blo,bhi) in enumerate(SCORE):
    st = status(v,blo,bhi); out = '' if st=='in' else ' out'
    txt = {'in':'In range','below':'Below','above':'Above'}[st]
    tr = 330
    bl = (blo-slo)/(shi-slo)*tr; bw = (bhi-blo)/(shi-slo)*tr
    mk = (min(max(v,slo),shi)-slo)/(shi-slo)*tr
    vtxt = (f'{v:g}' if v<100 else f'{v:.0f}')+u
    A(f'<div id="sr{i}" class="row{out}" style="top:{124+i*50}px"><div class="lb">{lb}</div><div class="tr"><div class="bd" style="left:{bl:.0f}px;width:{bw:.0f}px"></div><div class="mk" id="sm{i}" data-x="{mk:.0f}" style="left:0px"></div></div><div class="vl">{vtxt}</div><div class="st">{txt}</div></div>')
nin = sum(1 for r in SCORE if status(r[1],r[5],r[6])=='in')
A(f'<div class="legend" id="sl"><b>Shaded = real football.</b> {nin} of {len(SCORE)} in range · <i>{len(SCORE)-nin} outside</i></div></div>')
# fix
A('''<div id="p-fix" class="panel clip" data-start="20.4" data-duration="5.8" data-track-index="3" style="left:120px;width:1000px"><div class="pt">Who wins when sides are identical?</div><div class="ps">Every fixture played both ways round, home bonus off.</div>
<div class="bgrp" id="g1" style="top:110px"><div class="gt">Before: the home side moved first</div>
<div class="bar bad"><span class="bl">Moved first</span><div class="bf" id="b1" style="width:480px"></div><span class="bv" id="v1" style="left:810px">48%</span></div>
<div class="bar bad"><span class="bl">Moved second</span><div class="bf" id="b2" style="width:300px"></div><span class="bv" id="v2" style="left:630px">28–32%</span></div></div>
<div class="bgrp" id="g2" style="top:290px"><div class="gt">After: both read the same half-second</div>
<div class="bar"><span class="bl">Moved first</span><div class="bf" id="b3" style="width:430px"></div><span class="bv" id="v3" style="left:760px">42–44%</span></div>
<div class="bar"><span class="bl">Moved second</span><div class="bf" id="b4" style="width:400px"></div><span class="bv" id="v4" style="left:730px">39–41%</span></div></div>
<div class="legend" id="fl">The home side moved first, so the away side reacted late: a hidden ~15-point edge.</div></div>''')
# learn
A('<div id="p-learn" class="panel clip" data-start="26.4" data-duration="6.0" data-track-index="3" style="left:900px;width:900px"><div class="pt">The AI Brain, from a real training run</div><div class="ps">Computer managers pick tactics at half-time and late on.</div><div class="steps">')
steps=[('Record','every decision'),('Judge','by the result'),('Learn','per situation'),('Test','vs the rules'),('Release','you approve')]
for i,(a,b) in enumerate(steps):
    A(f'<div class="stp" id="st{i}" style="left:{i*169}px"><em>{i+1}</em><b>{a}</b><span>{b}</span></div>')
A('</div><div class="kvs">')
kvs=[('100','camp matches'),('800','decisions judged'),('263','of 360 situations'),('20','trusted so far')]
for i,(a,b) in enumerate(kvs):
    A(f'<div class="kv" id="kv{i}" style="left:{i*211}px"><b>{a}</b><span>{b}</span></div>')
A('</div><div class="guard" id="gd"><div class="g1">SAFETY GATE · 200 MATCHES, SIDES SWAPPED</div><div class="g2">Draft 1.33 · Rules 1.33 points a game</div><div class="g3">No clear difference yet, so it is not released.</div></div></div>')

# ---- phone
A('<div id="phone" class="phone" data-layout-allow-occlusion><div id="tilt" class="tilt"><div class="device"><div class="screen"><div class="stage">')
A('<div class="scr" id="s-live1"><video id="vid1" class="clip" src="assets/live-match.mp4" muted playsinline data-start="1.0" data-duration="8.6" data-media-start="0"></video></div>')
A('<div class="scr" id="s-form"><img src="assets/tab-formation.png" alt="">')
A('<div class="ring" id="c4-ring" style="left:12px;top:270px;width:366px;height:300px"></div></div>')
A('<div class="scr" id="s-formw"><img src="assets/tab-formation-without.png" alt="">')
A('<div class="ring" id="c5-ring" style="left:12px;top:270px;width:366px;height:300px"></div></div>')
A('<div class="scr" id="s-stats"><img src="assets/tab-stats.png" alt=""></div>')
A('<div class="scr" id="s-live2"><video id="vid2" class="clip" src="assets/live-match.mp4" muted playsinline data-start="20.2" data-duration="6.4" data-media-start="9"></video></div>')
A('<div class="scr" id="s-brain"><img src="assets/adm-brain.png" alt=""></div>')
A('<div class="scr" id="s-end"><img src="assets/live-5.png" alt=""></div>')
A('<div class="sweep" id="sweep"></div></div><div class="glass"></div><div class="notch"></div></div></div></div>')
# leads + cards
lines=[];cards=[]
for n,(cid,scr,s,e,side,slot,tgt,t,sub) in enumerate(C,start=1):
    if tgt[0]=='rect':
        _,x,y,w,h=tgt; ex,ey=loc(x if side=='L' else x+w, y+h/2)
    else:
        _,x,y=tgt; ex,ey=loc(x,y)
    sy=slot-PY; sx=-70 if side=='L' else PW+70
    lines.append((cid,sx,sy,ex,ey)); cards.append((cid,(-70-CW) if side=='L' else PW+70,sy,n,t,sub,s,e))
A('<svg class="leads" viewBox="-700 -300 2000 1500" id="leads">')
for cid,sx,sy,ex,ey in lines:
    A(f'<line id="{cid}-lead" x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}"/><circle id="{cid}-pt" cx="{ex:.1f}" cy="{ey:.1f}" r="7"/>')
A('</svg>')
for cid,cx0,sy,n,t,sub,s,e in cards:
    A(f'<div id="{cid}-card" class="co clip" data-start="{s-0.2:.2f}" data-duration="{e-s+0.7:.2f}" data-track-index="5" data-layout-allow-overlap style="left:{cx0}px;top:{sy-80:.0f}px"><span class="n">{n}</span><h3>{t}</h3><p>{sub}</p></div>')
A('</div>')  # phone
A('<div id="tracker" class="clip" data-start="3.6" data-duration="%d" data-track-index="2"><div id="trline"></div><div id="trfill"></div>'%(32.4-3.6))
for i,(nm,t) in enumerate(nodes):
    x=30+900*i/(len(nodes)-1); A(f'<div class="node" id="nd{i}" style="left:{x:.0f}px"><i></i><b>{nm}</b></div>')
A('</div>')
A('''<div id="endcard" class="clip" data-start="32.6" data-duration="3.4" data-track-index="6"><div class="inner"><div class="small" id="e1">FUTBOL MANAGER · 2026/27</div><h1 id="e2">MATCH ENGINE.</h1><div class="tag" id="e3">Measure it. Fix it.<br>Learn from it.</div><div class="chips" id="e4"><span class="chip">22 players</span><span class="chip">Real-world bands</span><span class="chip">Learns from results</span></div></div></div>''')
A('</div>')

J=[]
J.append('const tl = gsap.timeline({ paused: true });')
J.append(f'const C = {json.dumps([dict(id=c[0],s=c[2],e=c[3],side=c[4],ring=(c[6][0]=="rect")) for c in C])};')
J.append(f'const WORDS = {json.dumps([(w[1],w[2],len(w[0])) for w in words])};')
J.append(f'const NODES = {json.dumps([n[1] for n in nodes])};')
J.append('''
const EASE = "expo.out";
tl.fromTo("#glowA", { x: -80, y: 0 }, { x: 160, y: 60, duration: 36, ease: "sine.inOut" }, 0);
tl.fromTo("#glowB", { x: 80, y: 0 }, { x: -200, y: -80, duration: 36, ease: "sine.inOut" }, 0);
for (let i = 0; i < 16; i++) {
  const s = (i * 1.7) % 29, d = 5 + (i % 4);
  tl.fromTo("#dot" + i, { opacity: 0, y: 0 }, { opacity: 0.8, y: -120 - (i % 5) * 30, duration: d / 2, ease: "sine.out" }, s);
  tl.to("#dot" + i, { opacity: 0, y: -260 - (i % 5) * 30, duration: d / 2, ease: "sine.in" }, s + d / 2);
}
WORDS.forEach(([s, e, n], i) => {
  for (let j = 0; j < n; j++) {
    tl.fromTo("#w" + i + "c" + j, { yPercent: 115, rotation: 6 }, { yPercent: 0, rotation: 0, duration: 0.8, ease: "expo.out" }, s + 0.07 * j);
    tl.to("#w" + i + "c" + j, { yPercent: -115, duration: 0.45, ease: "power3.in" }, e - 0.55 + 0.04 * j);
  }
  tl.fromTo("#word" + i, { x: 60 }, { x: -60, duration: e - s, ease: "none" }, s);
});
%HEADS%
tl.fromTo("#brand", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0.6);
tl.to("#brand", { opacity: 0, duration: 0.3 }, 19.9);
tl.to("#brand", { opacity: 1, duration: 0.4 }, 26.0);
/* phone: entrance, float, sway, slides between scenes */
tl.set("#phone", { x: 0, y: 0 }, 0);
tl.fromTo("#tilt", { y: 1100, rotationX: 28, rotationY: -42, scale: 0.7 }, { y: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 1.7, ease: "expo.out" }, 0.2);
for (let t = 1.9, k = 0; t < 33; t += 2.6, k++) tl.to("#phone", { y: k % 2 ? 12 : -14, duration: 2.6, ease: "sine.inOut" }, t);
for (let t = 1.9, k = 0; t < 32.9; t += 3.3, k++) tl.to("#tilt", { rotationY: k % 2 ? -7 : 7, rotationX: k % 2 ? 2 : -2, duration: 3.3, ease: "sine.inOut" }, t);
tl.to("#phone", { x: -480, duration: 1.1, ease: "expo.inOut" }, 13.8);
tl.to("#phone", { x: 480, duration: 1.1, ease: "expo.inOut" }, 19.8);
tl.to("#phone", { x: -480, duration: 1.1, ease: "expo.inOut" }, 25.8);
tl.to("#phone", { x: -330, duration: 1.1, ease: "expo.inOut" }, 32.4);
tl.to("#tilt", { scale: 0.86, duration: 1.1, ease: "expo.inOut" }, 32.4);
/* screens */
const SCR = [["live1", 0.9, 9.2], ["form", 9.2, 11.4], ["formw", 11.4, 14.0], ["stats", 14.0, 20.2], ["live2", 20.2, 26.2], ["brain", 26.2, 32.5], ["end", 32.5, 37]];
SCR.forEach(([id, s, e], i) => {
  const first = i === 0, last = i === SCR.length - 1;
  tl.fromTo("#s-" + id, { opacity: 0 }, { opacity: 1, duration: first ? 0.7 : 0.35, ease: "power2.out" }, first ? s : s - 0.15);
  if (!last) tl.to("#s-" + id, { opacity: 0, duration: 0.2, ease: "none" }, e + 0.2);
  if (!first) tl.fromTo("#sweep", { x: -300, opacity: 0.9 }, { x: 760, opacity: 0, duration: 0.7, ease: "power2.inOut" }, s - 0.1);
});
/* callouts */
C.forEach((c) => {
  const dir = c.side === "L" ? -1 : 1;
  tl.fromTo("#" + c.id + "-card", { opacity: 0, x: 60 * dir, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" }, c.s - 0.2);
  if (c.ring) {
    tl.fromTo("#" + c.id + "-ring", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.4, ease: EASE }, c.s);
    tl.to("#" + c.id + "-ring", { scale: 1.035, duration: 0.45, yoyo: true, repeat: 1, ease: "sine.inOut" }, c.s + 0.5);
    tl.to("#" + c.id + "-ring", { opacity: 0, duration: 0.3 }, c.e);
  }
  tl.fromTo("#" + c.id + "-lead", { opacity: 0, strokeDasharray: 700, strokeDashoffset: 700 }, { opacity: 1, strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, c.s);
  tl.fromTo("#" + c.id + "-pt", { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, c.s + 0.35);
  tl.to("#" + c.id + "-card", { opacity: 0, x: 40 * dir, duration: 0.35, ease: "power2.in" }, c.e);
  tl.to("#" + c.id + "-lead", { opacity: 0, duration: 0.3 }, c.e);
  tl.to("#" + c.id + "-pt", { opacity: 0, duration: 0.3 }, c.e);
});
/* scoreboard */
tl.fromTo("#p-score", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.7, ease: EASE }, 14.4);
tl.to("#p-score", { opacity: 0, x: 60, duration: 0.4, ease: "power2.in" }, 19.75);
for (let i = 0; i < 8; i++) {
  const el = document.querySelector("#sm" + i), x = +el.dataset.x;
  tl.fromTo("#sr" + i, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: EASE }, 15.0 + i * 0.22);
  tl.fromTo("#sm" + i, { x: 0 }, { x: x, duration: 0.9, ease: "power3.out" }, 15.3 + i * 0.22);
}
tl.fromTo("#sl", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 16.6);
/* fix */
tl.fromTo("#p-fix", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.7, ease: EASE }, 20.4);
tl.to("#p-fix", { opacity: 0, x: -60, duration: 0.4, ease: "power2.in" }, 25.75);
tl.fromTo("#g1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 21.0);
tl.fromTo("#g2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 23.0);
[["b1","v1",21.3],["b2","v2",21.6],["b3","v3",23.3],["b4","v4",23.6]].forEach(([b, v, t]) => {
    tl.fromTo("#" + b, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.out" }, t);
  tl.fromTo("#" + v, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, t + 0.4);
});
tl.fromTo("#fl", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 22.2);
/* learn */
tl.fromTo("#p-learn", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.7, ease: EASE }, 26.4);
tl.to("#p-learn", { opacity: 0, x: 60, duration: 0.4, ease: "power2.in" }, 31.95);
for (let i = 0; i < 5; i++) tl.fromTo("#st" + i, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, 27.0 + i * 0.28);
for (let i = 0; i < 4; i++) tl.fromTo("#kv" + i, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 28.0 + i * 0.2);
tl.fromTo("#gd", { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, 29.0);
/* tracker */
tl.fromTo("#tracker", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 3.6);
tl.fromTo("#trfill", { scaleX: 0 }, { scaleX: 0, duration: 0.01 }, 3.6);
NODES.forEach((t, i) => {
  tl.to("#trfill", { scaleX: i / (NODES.length - 1), duration: 0.6, ease: "power2.inOut" }, t);
  tl.to("#nd" + i + " i", { backgroundColor: "#2de2f0", borderColor: "#ffffff", scale: 1.35, duration: 0.35, ease: "back.out(2)" }, t + 0.1);
  tl.to("#nd" + i + " b", { color: "#ffffff", duration: 0.3 }, t + 0.1);
});
tl.to("#tracker", { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" }, 32.0);
/* end card */
tl.to("#brand", { opacity: 0, duration: 0.3 }, 32.5);
["e1", "e2", "e3", "e4"].forEach((id, i) => tl.fromTo("#" + id, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE }, 33.2 + i * 0.2));
tl.set({}, {}, %DUR%);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
''')
hj=[]
for i,(k,h,p,s,e,l,w) in enumerate(heads):
    hj.append(f'tl.fromTo("#head{i}", {{ opacity: 0, y: 40, filter: "blur(10px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: EASE }}, {s});')
    hj.append(f'tl.to("#head{i}", {{ opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }}, {e-0.45});')
body='\n'.join(J).replace('%HEADS%','\n'.join(hj))
A('<script>\n'+body+'\n</script></body></html>')
out='\n'.join(html)
for k,v in {'%PX%':PX,'%PY%':PY,'%PW%':PW,'%PH%':PH,'%BZ%':BZ,'%K%':f'{K:.5f}','%CW%':CW,'%DUR%':DUR}.items(): out=out.replace(k,str(v))
open('index.html','w').write(out); print('ok',len(out))
