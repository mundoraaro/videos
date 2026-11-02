/* Motor de animación de Mundo Raaro.
 * Canvas 1080x1920 a 30 fps. Ver taller/GUIA.md.
 * Componentes listos: background, octopus (personaje pulpo), heart, label, chip, captions, logoEye.
 * Helpers: clamp, lerp, easeOut, easeIn, easeInOut, back, at(i)=inicio de la palabra i, pop(t,t0), prog(t,t0,d), mix(colorA,colorB,u), rand(seed), rr(x,y,w,h,r).
 */
const C = document.getElementById('c'), ctx = C.getContext('2d');
const W_ = 1080, H_ = 1920;
let TL = null, W = [], SC = [], CH = [];
const COL = { bg1:'#231B52', bg2:'#0D0A24', lime:'#D7FF3D', coral:'#FF6A4D', coralD:'#D9493A', suck:'#FFC6B8', ink:'#16122E', white:'#F5F3FF', blue:'#2F7BFF', red:'#E5333F' };

// ---------- helpers ----------
const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp = (a,b,u)=>a+(b-a)*u;
const easeOut = u=>1-Math.pow(1-clamp(u),3);
const easeIn = u=>Math.pow(clamp(u),3);
const easeInOut = u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back = u=>{u=clamp(u);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
const at = i=>W[i].s;
const pop = (t,t0,d=.35)=>back((t-t0)/d)*(t>=t0?1:0);
const prog = (t,t0,d)=>clamp((t-t0)/d);
function hexToRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function mix(a,b,u){const A=hexToRgb(a),B=hexToRgb(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],clamp(u)))).join(',')})`;}
function rand(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

// ---------- background ----------
function background(t, dark=0){
  const g = ctx.createLinearGradient(0,0,0,H_); g.addColorStop(0,COL.bg1); g.addColorStop(1,COL.bg2);
  ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_);
  // light rays
  ctx.save(); ctx.globalAlpha=0.06*(1-dark);
  for(let i=0;i<5;i++){const a=-0.35+i*0.18+Math.sin(t*0.3+i)*0.04;ctx.save();ctx.translate(540,-200);ctx.rotate(a);
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30,0);ctx.lineTo(160,2400);ctx.lineTo(-160,2400);ctx.fill();ctx.restore();}
  ctx.restore();
  // bubbles
  ctx.save(); ctx.strokeStyle='rgba(245,243,255,0.22)'; ctx.lineWidth=3;
  for(let i=0;i<34;i++){const sp=40+rand(i)*90, r=4+rand(i+9)*12, x=rand(i+3)*W_+Math.sin(t*1.3+i)*14;
    const y=((rand(i+5)*2200 - t*sp)%2200+2200)%2200 - 140; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();}
  ctx.restore();
  if(dark>0){ctx.fillStyle=`rgba(5,3,15,${0.45*dark})`;ctx.fillRect(0,0,W_,H_);}
}

// ---------- octopus ----------
let ARMS = [];
function octopus(o){
  const t=o.t, s=o.s, mode=o.mode||'idle';
  const body=o.color||COL.coral, armC=o.armColor||COL.coralD, suck=o.suck||COL.suck;
  ARMS=[];
  ctx.save(); ctx.translate(o.x,o.y); ctx.scale(s,s);
  const N=28;
  for(let i=0;i<8;i++){
    const bx=-115+i*(230/7), side=i<4?1:-1;
    let ang, L=340, amp=38, spd=3;
    if(mode==='jet'){ang=(96-i*(12/7))*Math.PI/180;L=430;amp=10;spd=6;}
    else if(mode==='walk'){ang=(118-i*(56/7))*Math.PI/180;L=320;amp=26;spd=5;}
    else {ang=(122-i*(64/7))*Math.PI/180;}
    let px=bx, py=30; const pts=[];
    for(let k=0;k<=N;k++){
      const u=k/N;
      const curl=(mode==='jet'?0.3:1.7)*u*u*u*side;
      const a=ang+curl+(mode==='walk'?Math.sin(t*spd+i*1.6)*0.18*u:0);
      if(k>0){px+=Math.cos(a)*L/N;py+=Math.sin(a)*L/N;}
      const wv=Math.sin(u*4-t*spd+i*0.9)*amp*u;
      pts.push([px-Math.sin(a)*wv, py+Math.cos(a)*wv, u, a]);
    }
    ARMS.push(pts.map(p=>[o.x+p[0]*s,o.y+p[1]*s]));
    for(const [x,y,u] of pts){const r=30*(1-u)+5;ctx.fillStyle=armC;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
    for(const [x,y,u] of pts){const r=30*(1-u)+5;ctx.fillStyle=body;ctx.beginPath();ctx.arc(x-r*0.18,y-r*0.18,r*0.82,0,Math.PI*2);ctx.fill();}
    for(let k=3;k<N;k+=2){const [x,y,u,a]=pts[k];const r=(30*(1-u)+5)*0.36;
      ctx.fillStyle=suck;ctx.beginPath();ctx.arc(x+Math.sin(a)*side*r*1.2,y-Math.cos(a)*side*r*0.4,r,0,Math.PI*2);ctx.fill();}
    if(o.armGlow && o.armGlow[i]>0){const tip=pts[N];ctx.save();ctx.globalAlpha=o.armGlow[i];ctx.fillStyle=COL.lime;
      ctx.beginPath();ctx.arc(tip[0],tip[1],22+8*Math.sin(t*10),0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  // mantle
  ctx.fillStyle=armC; ctx.beginPath(); ctx.ellipse(6,-150,168,196,-0.06,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(0,-156,162,190,-0.06,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-60,-250,46,70,-0.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=armC; for(const [sx,sy,sr] of [[60,-260,16],[95,-190,11],[-20,-300,10],[40,-120,9]]){ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();}
  // eyes
  const es=o.eyeScale??1, lx=(o.look?.x??0), ly=(o.look?.y??0), blink=o.blink??1;
  for(const ex of [-62,62]){
    ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=COL.ink; ctx.lineWidth=7;
    ctx.beginPath(); ctx.ellipse(ex,-40,42*es,46*es*blink,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    if(blink>0.3){ctx.fillStyle=COL.ink; rr(ex-20*es+lx*12,-40-7.5*es+ly*10,40*es,15*es,7*es); ctx.fill();}
  }
  // smile
  ctx.strokeStyle=COL.ink; ctx.lineWidth=7; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(0,18,22,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
  ctx.restore();
}

// ---------- hearts ----------
function heartPath(s){ctx.beginPath();ctx.moveTo(0,-s*0.25);
  ctx.bezierCurveTo(-s*0.05,-s*0.55,-s*0.6,-s*0.55,-s*0.6,-s*0.15);
  ctx.bezierCurveTo(-s*0.6,s*0.2,-s*0.2,s*0.4,0,s*0.6);
  ctx.bezierCurveTo(s*0.2,s*0.4,s*0.6,s*0.2,s*0.6,-s*0.15);
  ctx.bezierCurveTo(s*0.6,-s*0.55,s*0.05,-s*0.55,0,-s*0.25);ctx.closePath();}
function heart(x,y,size,t,state){ // state: {k: appear 0..1, off: 0..1}
  const k=state.k??1; if(k<=0.001) return; const off=state.off??0;
  const beat=1+0.09*Math.max(0,Math.sin(t*9))*(1-off);
  ctx.save(); ctx.translate(x,y); ctx.scale(k*beat,k*beat);
  heartPath(size); ctx.fillStyle=mix(COL.coral,'#3A3460',off); ctx.fill();
  ctx.lineWidth=10; ctx.strokeStyle=COL.ink; ctx.stroke();
  if(off<0.5){ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.ellipse(-size*0.28,-size*0.2,size*0.1,size*0.16,-0.6,0,Math.PI*2);ctx.fill();}
  if(off>0.2){ctx.globalAlpha=clamp((off-0.2)/0.5);ctx.fillStyle=COL.white;ctx.font=`900 ${Math.round(size*0.3)}px Inter`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('OFF',0,size*0.05);}
  ctx.restore();
}

// ---------- text ----------
function label(txt,x,y,size,color,k=1,bg=null){
  if(k<=0.001) return; ctx.save(); ctx.translate(x,y); ctx.scale(k,k);
  ctx.font=`900 ${size}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
  if(bg){const w=ctx.measureText(txt).width+size*1.1, h=size*1.6; rr(-w/2,-h/2,w,h,h/2); ctx.fillStyle=bg; ctx.fill();}
  else {ctx.lineJoin='round'; ctx.lineWidth=size*0.16; ctx.strokeStyle=COL.ink; ctx.strokeText(txt,0,0);}
  ctx.fillStyle=color; ctx.fillText(txt,0,0); ctx.restore();
}
function chip(txt,t,t0){label(txt,540,215,38,COL.ink,pop(t,t0,.4),COL.lime);}

function buildChunks(){
  CH=[]; let cur=[];
  W.forEach((w,i)=>{cur.push(i); const len=cur.map(j=>W[j].t).join(' ').length;
    if(/[.,?!]$/.test(w.t)||cur.length>=3||len>16){CH.push(cur);cur=[];}});
  if(cur.length) CH.push(cur);
}
function captions(t){
  if(window.HIDE_CAPTIONS_LAST!==false && t>=SC[SC.length-1].start-0.05) return;
  let ci=-1; for(let c=0;c<CH.length;c++){ if(W[CH[c][0]].s-0.05<=t) ci=c; }
  if(ci<0) return; const ch=CH[ci]; const last=W[ch[ch.length-1]];
  if(t>last.e+0.6 && (ci+1>=CH.length || t<W[CH[ci+1][0]].s-0.05)) return;
  let size=96; ctx.font=`900 ${size}px Inter`;
  const words=ch.map(i=>W[i].t.toUpperCase());
  let total=ctx.measureText(words.join(' ')).width; if(total>840){size=Math.floor(size*840/total);ctx.font=`900 ${size}px Inter`;total=ctx.measureText(words.join(' ')).width;}
  let x=540-total/2; const y=1330, sp=ctx.measureText(' ').width;
  ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.lineJoin='round';
  ch.forEach((i,n)=>{const w=words[n], wd=ctx.measureText(w).width; const k=t<W[i].s?0.0:back((t-W[i].s)/0.18);
    const active=t>=W[i].s && (n===ch.length-1 || t<W[ch[n+1]].s);
    if(k>0){ctx.save();ctx.translate(x+wd/2,y);ctx.scale(lerp(0.7,1,k),lerp(0.7,1,k));
      ctx.lineWidth=18;ctx.strokeStyle=COL.ink;ctx.strokeText(w,-wd/2,0);
      ctx.fillStyle=active?COL.lime:COL.white;ctx.fillText(w,-wd/2,0);ctx.restore();}
    x+=wd+sp;});
}


// ---------- marca ----------
function logoEye(x,y,s){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.beginPath(); ctx.moveTo(-146,0); ctx.quadraticCurveTo(0,-125,146,0); ctx.quadraticCurveTo(0,125,-146,0); ctx.closePath();
  ctx.fillStyle='#FFFFFF'; ctx.fill(); ctx.lineWidth=10; ctx.strokeStyle=COL.ink; ctx.stroke();
  ctx.fillStyle=COL.ink; ctx.beginPath(); ctx.arc(0,0,64,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=COL.lime; ctx.lineWidth=5;
  ctx.beginPath(); ctx.arc(0,0,54,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,0,24,54,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-54,0); ctx.lineTo(54,0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-46,-27); ctx.quadraticCurveTo(0,-15,46,-27); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-46,27); ctx.quadraticCurveTo(0,15,46,27); ctx.stroke();
  ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(26,-25,10,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// ---------- motor: cámara, escenas, captions ----------
// La escena define: SCENES (array de funciones (t,sc)), CHIPS ({n:"texto"}), SHAKES (índices de palabra), DARK_SCENES ([n]).
function render(t){
  let si=0; for(let i=0;i<SC.length;i++) if(t>=SC[i].start) si=i;
  const sc=SC[si], lt=t-sc.start;
  ctx.setTransform(1,0,0,1,0,0);
  // camera: punch-in at scene start, slow drift, shakes
  const punch=si>0?1.07-0.07*easeOut(lt/0.28):1, drift=1+0.025*clamp(lt/(sc.end-sc.start));
  let sx=0,sy=0; for(const wi of (window.SHAKES||[])){const d=t-at(wi); if(d>0&&d<0.4){const a=(1-d/0.4)*16;sx+=Math.sin(d*90)*a;sy+=Math.cos(d*77)*a;}}
  background(t, (window.DARK_SCENES||[]).includes(si+1)?easeOut(lt/0.4):0);
  ctx.save(); ctx.translate(540+sx,960+sy); ctx.scale(punch*drift,punch*drift); ctx.translate(-540,-960);
  SCENES[si](t,sc);
  ctx.restore();
  if(CHIPS[si+1]) chip(CHIPS[si+1],t,sc.start+0.1);
  captions(t);
  if(si>0&&lt<0.12){ctx.fillStyle=`rgba(255,255,255,${0.35*(1-lt/0.12)})`;ctx.fillRect(0,0,W_,H_);}
}
async function init(tl){TL=tl;W=tl.words;SC=tl.scenes;buildChunks();await document.fonts.load('900 96px Inter');await document.fonts.load('800 34px Inter');return true;}
function frame(t){render(t);return C.toDataURL('image/jpeg',0.92);}
