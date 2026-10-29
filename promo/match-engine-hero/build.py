#!/usr/bin/env python3
"""Generates index.html for the Match Engine hero film (4:3, 1440x1080). Run: python3 build.py
Clips in assets/ are cut from real recorded matches of one fixture (Tigers v Red Devils)."""
import json, math, random, subprocess, os

W, H = 1440, 1080
K = 420/390; BZ = 12
SW, SH = 420, 909
PW, PH = SW+2*BZ, SH+2*BZ          # 444 x 933
PX, PY = W//2-PW//2, H//2-PH//2    # 498, 73
CW = 380

def dur(f):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
def sp(x, y):  # stage css point -> frame point (phone at rest)
    return PX+BZ+x*K, PY+BZ+y*K
def loc(x, y):  # stage css -> phone-local
    return BZ+x*K, BZ+y*K

GAP = 0.2
# name, file, word, ...
clips = [('concede','clip-concede.mp4'),('tactics','clip-tactics.mp4'),('subs','clip-subs.mp4'),
         ('equal','clip-equaliser.mp4'),('rs','clip-redshout.mp4')]
S = {}  # start times
t = 3.4
for n,f in clips:
    p = 'assets/'+f
    if not os.path.exists(p): continue
    d = dur(p); S[n] = (round(t,2), round(d,2)); t += d + GAP
END = round(t+0.1,2); DUR = round(END+4.0,2)
print('schedule', S, END, DUR)

# clip-relative event times (seconds into each cut clip), measured from the cuts
EV = json.load(open('events.json'))
def ev(n, k): return S[n][0] + EV[n][k]

words = [('MATCH DAY.',0.0,3.6,168,'')]
def addw(txt,s_,e_,sz,cls=''): words.append((txt,s_,e_,sz,cls))
addw('SHOCK',S['concede'][0]-0.2,S['concede'][0]+S['concede'][1]+0.2,330)
addw('REACT',S['tactics'][0]-0.2,S['subs'][0]+S['subs'][1]+0.1,330)
addw('GOAL',S['equal'][0]-0.2,S['equal'][0]+S['equal'][1]+0.2,400)
addw('RED CARD',S['rs'][0]-0.2,ev('rs','sheet')-0.1,270,'red')
addw('DEMAND',ev('rs','sheet')-0.2,ev('rs','resume')+0.3,300)
addw('PUSH',ev('rs','resume')+0.2,END-0.1,380)

heads = [  # kicker, headline, start, end
 ('THE 2026/27 SEASON · FEATURE 02','Match day. Your call.',0.5,3.3),
 ('KICK-OFF + 27 MINUTES','They score first.',S['concede'][0]+0.6,S['concede'][0]+S['concede'][1]),
 ('YOUR MOVE','Rip it up. Switch the shape.',S['tactics'][0]+0.2,S['tactics'][0]+S['tactics'][1]),
 ('FRESH LEGS','Make the change.',S['subs'][0]+0.1,S['subs'][0]+S['subs'][1]),
 ('MINUTE 31','You hit back!',S['equal'][0]+0.2,S['equal'][0]+S['equal'][1]),
]
heads += [('MINUTE '+str(EV['rs']['min']),'They are down to ten.',S['rs'][0]+0.2,ev('rs','sheet')-0.1),
          ('FIRE THEM UP','Demand more.',ev('rs','sheet')-0.1,ev('rs','resume')+0.2),
          ('THEN WATCH THEM GO','Your team pushes on.',ev('rs','resume')+0.3,END-0.5)]

# callouts (wide shots only): id, side, slot-y(frame), start, end, title, sub, target(stage pt)
C = [
 ('c1','L',560, ev('concede','goal')+1.1, S['tactics'][0]-0.05, '0–1. Now what?','The pressure is on.',(195,40)),
 ('c2','R',330, S['tactics'][0]+0.2, S['tactics'][0]+2.0, 'Switch the shape.','Gegenpress. Attack. High line.',(195,260)),
 ('c3','R',560, ev('equal','goal')+1.8, ev('equal','goal')+3.6, 'You equalise.','It is level at 1–1.',(195,40)),
 ('c5','L',560, ev('rs','card')+1.4, ev('rs','card')+3.4, 'Ten men.','The game just changed.',(195,40)),
]

html=[]; A=html.append
A('''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1440, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
:root{--bg0:#06020d;--bg1:#1b0a33;--cyan:#2de2f0;--violet:#8b5cf6;--magenta:#d946ef;--green:#35e08a;--red:#ff4d5e;--ink:#fff;--soft:rgba(255,255,255,.8);--font-display:'Archivo Black','Inter',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1440px;height:1080px;overflow:hidden;background:var(--bg0)}
#root{position:absolute;inset:0;width:1440px;height:1080px;overflow:hidden;font-family:'Inter',sans-serif;color:var(--ink);background:radial-gradient(1000px 900px at 50% 45%,#2a1052 0%,var(--bg1) 40%,var(--bg0) 100%)}
.fill{position:absolute;inset:0}
#glowA{position:absolute;left:300px;top:150px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(45,226,240,.30),rgba(45,226,240,0) 65%)}
#glowB{position:absolute;left:760px;top:380px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.42),rgba(139,92,246,0) 65%)}
#grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:90px 90px}
.dot{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--cyan);opacity:0;box-shadow:0 0 18px var(--cyan)}
#cam{position:absolute;left:0;top:0;width:1440px;height:1080px;transform-origin:720px 540px}
.word{position:absolute;left:0;top:0;width:1440px;height:1080px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);line-height:1;white-space:nowrap;letter-spacing:-.01em}
.word .mask{display:inline-block;overflow:hidden;padding:30px 0 10px}
.word .ch{display:inline-block;color:transparent;-webkit-text-stroke:3px rgba(45,226,240,.62);background:linear-gradient(180deg,rgba(45,226,240,.34),rgba(139,92,246,.10));-webkit-background-clip:text;background-clip:text}
.word.red .ch{-webkit-text-stroke-color:rgba(255,77,94,.8);background:linear-gradient(180deg,rgba(255,77,94,.4),rgba(139,92,246,.1));-webkit-background-clip:text;background-clip:text}
.head{position:absolute;left:56px;top:50px;width:430px}
.head .k{font-weight:900;font-size:26px;letter-spacing:.14em;color:var(--cyan);margin-bottom:12px}
.head h2{font-family:var(--font-display);font-size:50px;line-height:1.04;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:6px}
#phone{position:absolute;left:%PX%px;top:%PY%px;width:%PW%px;height:%PH%px;perspective:2400px}
.tilt{position:absolute;inset:0}
.device{position:absolute;inset:0;border-radius:66px;background:linear-gradient(145deg,#4a2a86,#150a2b 40%,#2a1450);padding:%BZ%px;box-shadow:0 0 0 2px rgba(45,226,240,.6),0 40px 120px rgba(0,0,0,.7),0 0 150px rgba(139,92,246,.5)}
.screen{position:relative;width:%SW%px;height:%SH%px;border-radius:54px;overflow:hidden;background:#16082a}
.stage{position:absolute;left:0;top:0;width:390px;height:844px;transform:scale(%K%);transform-origin:0 0}
.scr{position:absolute;inset:0;opacity:0;overflow:hidden}
.scr img,.scr video{position:absolute;left:0;top:0;width:390px;height:844px;object-fit:cover}
.cover{position:absolute;left:0;top:0;width:390px;height:100px;overflow:hidden}
.cover img{width:390px;height:844px}
.sweep{position:absolute;top:-100px;left:-300px;width:200px;height:1100px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);opacity:0}
.glass{position:absolute;inset:0;border-radius:54px;background:linear-gradient(125deg,rgba(255,255,255,.16),rgba(255,255,255,0) 32%);pointer-events:none}
.notch{position:absolute;left:50%;top:10px;width:96px;height:6px;margin-left:-48px;border-radius:3px;background:rgba(255,255,255,.18)}
svg.leads{position:absolute;left:-700px;top:-300px;width:2000px;height:1500px;overflow:visible;pointer-events:none}
svg.leads line{stroke:var(--cyan);stroke-width:3;stroke-linecap:round;opacity:0;filter:drop-shadow(0 0 6px rgba(45,226,240,.8))}
svg.leads circle{fill:var(--cyan);opacity:0}
.co{position:absolute;width:%CW%px;padding:20px 24px 22px;border-radius:26px;background:linear-gradient(160deg,rgba(40,16,78,.95),rgba(18,7,38,.95));border:2px solid rgba(45,226,240,.65);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 40px rgba(45,226,240,.2);opacity:0}
.co h3{font-weight:900;font-size:36px;line-height:1.08;color:#fff}
.co p{margin-top:8px;font-weight:700;font-size:26px;line-height:1.22;color:var(--soft)}
.conf{position:absolute;width:16px;height:16px;border-radius:4px;opacity:0}
#flash{position:absolute;inset:0;opacity:0;pointer-events:none}
#brand{position:absolute;right:56px;top:56px;text-align:right;font-weight:900;font-size:26px;letter-spacing:.16em}
#brand span{color:var(--cyan)}
#endcard{position:absolute;left:0;top:0;width:1440px;height:1080px}
#endcard .inner{position:absolute;left:640px;top:300px;width:760px}
#endcard .small{font-weight:900;font-size:26px;letter-spacing:.16em;color:var(--cyan)}
#endcard h1{font-family:var(--font-display);font-size:88px;line-height:1;white-space:nowrap;margin-top:16px;background:linear-gradient(90deg,#2de2f0,#8b5cf6 70%,#d946ef);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:8px}
#endcard .tag{margin-top:18px;font-size:42px;font-weight:900;line-height:1.15}
#endcard .chips{margin-top:30px;display:flex;flex-wrap:wrap;gap:14px}
#endcard .chip{padding:10px 24px;border-radius:40px;font-size:27px;font-weight:900;background:rgba(45,226,240,.12);border:2px solid rgba(45,226,240,.6)}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="%DUR%" data-width="1440" data-height="1080">''')
rnd=random.Random(5)
A('<div id="bg" class="clip fill" data-start="0" data-duration="%DUR%" data-track-index="0"><div id="glowA"></div><div id="glowB"></div><div id="grid"></div>')
for i in range(14): A(f'<span class="dot" id="dot{i}" style="left:{rnd.randint(60,1380)}px;top:{rnd.randint(100,980)}px"></span>')
A('</div>')
for i,(k,h,s_,e_) in enumerate(heads):
    A(f'<div id="head{i}" class="head clip" data-start="{s_:.2f}" data-duration="{e_-s_:.2f}" data-track-index="2"><div class="k">{k}</div><h2>{h}</h2></div>')
A('<div id="cam">')
for i,(w,s,e,fs,cls) in enumerate(words):
    chars=''.join(f'<span class="mask"><span class="ch" id="w{i}c{j}">{ch}</span></span>' for j,ch in enumerate(w))
    A(f'<div id="word{i}" class="word clip {cls}" data-layout-ignore data-start="{s:.2f}" data-duration="{e-s:.2f}" data-track-index="1" style="font-size:{fs}px">{chars}</div>')
# phone
A('<div id="phone" data-layout-allow-occlusion><div id="tilt" class="tilt"><div class="device"><div class="screen"><div class="stage">')
A('<div class="scr" id="s-title"><img src="assets/title-hero.png" alt=""></div>')
A('<div class="scr" id="s-title2"><img src="assets/title-hero.png" alt=""></div>')
for n,f in clips:
    if n not in S: continue
    s,d=S[n]
    A(f'<div class="scr" id="s-{n}"><video id="v-{n}" class="clip" src="assets/{f}" muted playsinline data-start="{s}" data-duration="{d}" data-media-start="0"></video></div>')
A('<div class="sweep" id="sweep"></div></div><div class="glass"></div><div class="notch"></div></div></div></div>')
# leads + callouts
A('<svg class="leads" viewBox="-700 -300 2000 1500">')
cards=[]
for cid,side,slot,s,e,t_,sub,(tx,ty) in C:
    ex,ey=loc(tx,ty); sy=slot-PY; sx=-50 if side=='L' else PW+50
    A(f'<line id="{cid}-lead" x1="{sx}" y1="{sy}" x2="{ex:.1f}" y2="{ey:.1f}"/><circle id="{cid}-pt" cx="{ex:.1f}" cy="{ey:.1f}" r="7"/>')
    cards.append((cid,(-50-CW) if side=='L' else PW+50,sy,t_,sub,s,e))
A('</svg>')
for cid,cx0,sy,t_,sub,s,e in cards:
    A(f'<div id="{cid}-card" class="co clip" data-start="{s-0.2:.2f}" data-duration="{e-s+0.7:.2f}" data-track-index="5" data-layout-allow-overlap style="left:{cx0}px;top:{sy-60:.0f}px"><h3>{t_}</h3><p>{sub}</p></div>')
for i in range(30):
    a=rnd.uniform(0,2*math.pi); r=rnd.uniform(200,520); col=rnd.choice(['#2de2f0','#8b5cf6','#35e08a','#ffffff','#d946ef'])
    A(f'<span class="conf" id="cf{i}" style="left:{PW//2}px;top:{PH//2-80}px;background:{col}" data-dx="{math.cos(a)*r:.0f}" data-dy="{math.sin(a)*r-100:.0f}" data-rot="{rnd.randint(-500,500)}"></span>')
A('</div></div>')  # phone, cam
A('<div id="flash" style="background:#fff"></div>')
A(f'<div id="brand" class="clip" data-start="0.8" data-duration="{END-0.8:.2f}" data-track-index="2">FUTBOL <span>MANAGER</span></div>')
A(f'<div id="endcard" class="clip" data-start="{END}" data-duration="{DUR-END:.2f}" data-track-index="6"><div class="inner"><div class="small" id="e1">FUTBOL MANAGER · 2026/27</div><h1 id="e2">MATCH ENGINE.</h1><div class="tag" id="e3">Football that plays back.</div><div class="chips" id="e4"><span class="chip">Live</span><span class="chip">Tactical</span><span class="chip">Alive</span></div></div></div>')
A(f'<audio id="music" src="assets/music.mp3" data-start="0" data-duration="{DUR}" data-volume="1" data-track-index="7"></audio>')
A('</div>')

# ---------- timeline ----------
J=[]
J.append('const tl = gsap.timeline({ paused: true });')
J.append('const EASE = "expo.out";')
J.append(f'const WORDS = {json.dumps([(w[1],w[2],len(w[0])) for w in words])};')
J.append(f'const C = {json.dumps([dict(id=c[0],s=c[3],e=c[4],side=c[1]) for c in C])};')
J.append(f'const PX0={PX}, PY0={PY}, K={K:.5f}, BZ={BZ};')
J.append(f'const S = {json.dumps({k:v for k,v in S.items()})}; const END = {END}; const GOAL1 = {ev("concede","goal"):.2f}; const GOAL2 = {ev("equal","goal"):.2f}; const RED = {ev("rs","card"):.2f}; const TAP = {ev("rs","tap"):.2f}; const SHEET = {ev("rs","sheet"):.2f}; const RESUME = {ev("rs","resume"):.2f};')
J.append(r'''
const fp = (sx, sy) => [PX0 + BZ + sx * K + 0, PY0 + BZ + sy * K];   // stage point -> frame point
/* camera: focus a stage point at scale s, centred on the frame */
function cam(t, d, s, sx, sy, rot, ease) {
  const [fx, fy] = fp(sx, sy);
  tl.to("#cam", { scale: s, x: -s * (fx - 720), y: -s * (fy - 540), rotation: rot || 0, duration: d, ease: ease || "power3.inOut" }, t);
}
function camHome(t, d, rot) { tl.to("#cam", { scale: 1, x: 0, y: 0, rotation: rot || 0, duration: d, ease: "power3.inOut" }, t); }
function shake(t, amp) { for (let i = 0; i < 7; i++) tl.to("#cam", { x: (i % 2 ? 1 : -1) * amp * (1 - i / 8), y: (i % 3 ? -1 : 1) * amp * 0.7 * (1 - i / 8), duration: 0.05, ease: "none" }, t + i * 0.05); }
function flash(t, col, a) { tl.fromTo("#flash", { opacity: 0, backgroundColor: col }, { opacity: a, duration: 0.08, ease: "none" }, t); tl.to("#flash", { opacity: 0, duration: 0.5, ease: "power2.out" }, t + 0.08); }
function confetti(t) {
  for (let i = 0; i < 30; i++) {
    const el = document.querySelector("#cf" + i), dx = +el.dataset.dx, dy = +el.dataset.dy, rot = +el.dataset.rot;
    tl.fromTo("#cf" + i, { opacity: 0 }, { opacity: 1, duration: 0.05 }, t);
    tl.fromTo("#cf" + i, { x: 0, y: 0, rotation: 0 }, { x: dx, y: dy, rotation: rot, duration: 0.9, ease: "power3.out" }, t);
    tl.to("#cf" + i, { y: dy + 240, opacity: 0, duration: 0.9, ease: "power2.in" }, t + 0.9);
  }
}
/* background drift */
tl.fromTo("#glowA", { x: -60, y: 0 }, { x: 140, y: 60, duration: %DUR%, ease: "sine.inOut" }, 0);
tl.fromTo("#glowB", { x: 60, y: 0 }, { x: -160, y: -80, duration: %DUR%, ease: "sine.inOut" }, 0);
for (let i = 0; i < 14; i++) {
  const s = (i * 2.1) % 30, d = 5 + (i % 4);
  tl.fromTo("#dot" + i, { opacity: 0, y: 0 }, { opacity: 0.8, y: -120 - (i % 5) * 30, duration: d / 2, ease: "sine.out" }, s);
  tl.to("#dot" + i, { opacity: 0, y: -260 - (i % 5) * 30, duration: d / 2, ease: "sine.in" }, s + d / 2);
}
/* hero words */
WORDS.forEach(([s, e, n], i) => {
  for (let j = 0; j < n; j++) {
    tl.fromTo("#w" + i + "c" + j, { yPercent: 115, rotation: 6 }, { yPercent: 0, rotation: 0, duration: 0.8, ease: "expo.out" }, s + 0.06 * j);
    tl.to("#w" + i + "c" + j, { yPercent: -115, duration: 0.4, ease: "power3.in" }, e - 0.5 + 0.03 * j);
  }
  tl.fromTo("#word" + i, { x: 70 }, { x: -70, duration: e - s, ease: "none" }, s);
});
%HEADS%
tl.fromTo("#brand", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0.8);
/* PHONE: dramatic fly-in */
tl.set("#phone", { x: 0, y: 0 }, 0);
tl.fromTo("#tilt", { x: -620, y: 1500, rotationX: 40, rotationY: -160, rotationZ: -25, scale: 0.4 }, { x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, duration: 2.0, ease: "expo.out" }, 0.1);
cam(0, 0.01, 1.25, 195, 422, 0); camHome(0.2, 2.6);
/* float + sway between moves */
for (let t = 2.4, k = 0; t < END; t += 2.6, k++) tl.to("#phone", { y: k % 2 ? 10 : -12, duration: 2.6, ease: "sine.inOut" }, t);
/* screens */
const SC = [["title", 0.9, S.concede[0]], ["concede", S.concede[0], S.concede[0] + S.concede[1]], ["tactics", S.tactics[0], S.tactics[0] + S.tactics[1]], ["subs", S.subs[0], S.subs[0] + S.subs[1]], ["equal", S.equal[0], S.equal[0] + S.equal[1]], ["rs", S.rs[0], S.rs[0] + S.rs[1]], ["title2", END - 0.2, END + 5]];
SC.forEach(([id, s, e], i) => {
  const first = i === 0, last = i === SC.length - 1;
  tl.fromTo("#s-" + id, { opacity: 0 }, { opacity: 1, duration: first ? 0.6 : 0.25, ease: "power2.out" }, first ? s : s - 0.12);
  if (!last) tl.to("#s-" + id, { opacity: 0, duration: 0.2, ease: "none" }, e + 0.12);
  if (!first) tl.fromTo("#sweep", { x: -300, opacity: 0.9 }, { x: 700, opacity: 0, duration: 0.6, ease: "power2.inOut" }, s - 0.1);
});
/* ---- SHOCK: push in, they score, shake ---- */
tl.to("#tilt", { rotationY: 14, rotationX: -4, duration: 1.2, ease: "power2.inOut" }, S.concede[0] - 0.4);
cam(S.concede[0] - 0.2, GOAL1 - S.concede[0] + 0.1, 1.45, 195, 330, -2, "power2.in");
tl.to("#tilt", { rotationY: 0, rotationX: 0, duration: 0.4 }, GOAL1);
shake(GOAL1 + 0.05, 22); flash(GOAL1 + 0.05, "#ff4d5e", 0.35);
camHome(GOAL1 + 0.55, 0.9, 0);
/* ---- REACT: swoop, dive on tactics ---- */
tl.to("#phone", { x: 30, duration: 0.8, ease: "power3.inOut" }, S.tactics[0] - 0.3);
tl.to("#tilt", { rotationY: -16, rotationZ: 2, duration: 0.8, ease: "power3.inOut" }, S.tactics[0] - 0.3);
tl.to("#phone", { x: 0, duration: 0.7, ease: "power3.inOut" }, S.tactics[0] + 1.5);
tl.to("#tilt", { rotationY: 0, rotationZ: 0, duration: 0.7, ease: "power3.inOut" }, S.tactics[0] + 1.5);
cam(S.tactics[0] + 1.6, 0.7, 1.75, 195, 330, 0);
cam(S.tactics[0] + 2.9, 0.8, 1.9, 195, 560, 0);
camHome(S.tactics[0] + S.tactics[1] - 0.3, 0.7);
/* subs: quick dive */
cam(S.subs[0] + 0.1, 0.6, 1.6, 195, 330, 0);
camHome(S.subs[0] + S.subs[1] - 0.3, 0.6);
/* ---- GOAL: orbit + zoom on the scoreboard ---- */
tl.to("#tilt", { rotationY: 360, duration: 1.5, ease: "power3.inOut" }, GOAL2 - 0.15);
tl.fromTo("#tilt", { scale: 1 }, { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut" }, GOAL2 - 0.15);
cam(GOAL2 - 0.2, 0.5, 1.5, 195, 60, 0, "power3.out");
flash(GOAL2 + 0.02, "#ffffff", 0.5); confetti(GOAL2 + 0.05); shake(GOAL2 + 0.1, 10);
camHome(GOAL2 + 1.6, 0.8);
tl.set("#tilt", { rotationY: 0 }, GOAL2 + 1.8);
/* ---- RED CARD ---- */
tl.to("#phone", { x: -50, duration: 0.7, ease: "power3.inOut" }, S.rs[0] - 0.2);
tl.to("#tilt", { rotationY: 16, duration: 0.7, ease: "power3.inOut" }, S.rs[0] - 0.2);
cam(RED - 0.3, 0.45, 1.55, 195, 330, 3, "power3.out"); shake(RED + 0.05, 14); flash(RED + 0.05, "#ff4d5e", 0.4);
camHome(RED + 1.0, 0.8, 0);
tl.to("#phone", { x: 0, duration: 0.7, ease: "power3.inOut" }, RED + 1.0);
tl.to("#tilt", { rotationY: 0, duration: 0.7, ease: "power3.inOut" }, RED + 1.0);
/* ---- DEMAND MORE: dive on the shouts sheet, tap ---- */
cam(SHEET + 0.1, 0.8, 1.7, 195, 600, 0);
camHome(RESUME - 0.1, 0.8);
/* ---- THE TEAM PUSHES ON: follow the players, swing around the phone ---- */
tl.to("#tilt", { rotationY: -18, rotationX: 4, duration: 1.4, ease: "power2.inOut" }, RESUME + 0.4);
cam(RESUME + 0.5, 1.6, 1.45, 195, 330, -2, "power2.inOut");
tl.to("#tilt", { rotationY: 12, rotationX: -3, duration: 1.8, ease: "power2.inOut" }, RESUME + 2.0);
cam(RESUME + 2.2, 1.6, 1.15, 195, 330, 2, "power2.inOut");
/* callouts */
C.forEach((c) => {
  const dir = c.side === "L" ? -1 : 1;
  tl.fromTo("#" + c.id + "-card", { opacity: 0, x: 60 * dir, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, c.s - 0.2);
  tl.fromTo("#" + c.id + "-lead", { opacity: 0, strokeDasharray: 700, strokeDashoffset: 700 }, { opacity: 1, strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, c.s);
  tl.fromTo("#" + c.id + "-pt", { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, c.s + 0.35);
  tl.to("#" + c.id + "-card", { opacity: 0, x: 40 * dir, duration: 0.35, ease: "power2.in" }, c.e);
  tl.to("#" + c.id + "-lead", { opacity: 0, duration: 0.3 }, c.e);
  tl.to("#" + c.id + "-pt", { opacity: 0, duration: 0.3 }, c.e);
});
/* exit: phone flies off, end card */
tl.to("#phone", { x: -640, y: -60, duration: 0.9, ease: "power3.in" }, END - 0.9);
tl.to("#tilt", { rotationY: -50, rotationZ: -8, scale: 0.7, duration: 0.9, ease: "power3.in" }, END - 0.9);
tl.to("#brand", { opacity: 0, duration: 0.3 }, END - 0.9);
tl.to("#phone", { x: -330, y: 0, duration: 0.01 }, END + 0.01);
tl.fromTo("#phone", { x: -1100 }, { x: -330, duration: 1.0, ease: "expo.out" }, END + 0.0);
tl.set("#tilt", { rotationY: 0, rotationZ: 0, scale: 0.86 }, END + 0.0);
["e1", "e2", "e3", "e4"].forEach((id, i) => tl.fromTo("#" + id, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE }, END + 0.5 + i * 0.2));
tl.set({}, {}, %DUR%);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
''')
hj=[]
for i,(k,h,s,e) in enumerate(heads):
    hj.append(f'tl.fromTo("#head{i}", {{ opacity: 0, y: 40, filter: "blur(10px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EASE }}, {s:.2f});')
    hj.append(f'tl.to("#head{i}", {{ opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }}, {e-0.4:.2f});')
body='\n'.join(J).replace('%HEADS%','\n'.join(hj))
A('<script>\n'+body+'\n</script></body></html>')
out='\n'.join(html)
for k,v in {'%PX%':PX,'%PY%':PY,'%PW%':PW,'%PH%':PH,'%BZ%':BZ,'%K%':f'{K:.5f}','%CW%':CW,'%DUR%':DUR,'%SW%':SW,'%SH%':SH}.items(): out=out.replace(k,str(v))
open('index.html','w').write(out); print('ok',len(out))
