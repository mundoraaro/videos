/* Motor de animación de Mundo Raaro.
 * Canvas 1080x1920 a 30 fps. Ver taller/GUIA.md e IDENTIDAD.md. El personaje RARO y su mundo están en raro.js.
 * Escena: SCENES, FONDOS ({n:{pal,tipo,pp}}), TOMAS ({n:{mov,z,foco}}), TRANS ({n:'bufanda'|'latigazo'|'zoom'}), KEYWORDS (índices de palabra en lima), SHAKES, FLASHES, CHIPS.
 * Componentes del motor: label, chip, captions (Fredoka). Heredados del piloto (estilo viejo, no usar en videos nuevos): background, octopus, heart, logoEye.
 * Helpers: clamp, lerp, easeOut, easeIn, easeInOut, back, at(i)=inicio de la palabra i, pop(t,t0), prog(t,t0,d), mix(colorA,colorB,u), rand(seed), rr(x,y,w,h,r).
 */
const C = document.getElementById('c'), ctx = C.getContext('2d');
const W_ = 1080, H_ = 1920;
let TL = null, W = [], SC = [], CH = [];
let FONT = 'Fredoka', FW = 700;   // fuente de marca; si no carga, cae a Inter 900 y render.py avisa
const fuente = (size)=>`${FW} ${Math.round(size)}px ${FONT}`;
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
  if(off>0.2){ctx.globalAlpha=clamp((off-0.2)/0.5);ctx.fillStyle=COL.white;ctx.font=fuente(size*0.3);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('OFF',0,size*0.05);}
  ctx.restore();
}

// ---------- text ----------
function label(txt,x,y,size,color,k=1,bg=null){
  if(k<=0.001) return; ctx.save(); ctx.translate(x,y); ctx.scale(k,k);
  ctx.font=fuente(size); ctx.textAlign='center'; ctx.textBaseline='middle';
  if(bg){const w=ctx.measureText(txt).width+size*1.1, h=size*1.6; rr(-w/2,-h/2,w,h,h/2); ctx.fillStyle=bg; ctx.fill();}
  else {ctx.lineJoin='round'; ctx.lineWidth=size*0.16; ctx.strokeStyle=COL.ink; ctx.strokeText(txt,0,0);}
  ctx.fillStyle=color; ctx.fillText(txt,0,0); ctx.restore();
}
function chip(txt,t,t0){ const k=typeof popIn==='function'?popIn(t,t0,.35):pop(t,t0,.4); if(k<=0) return; ctx.save(); ctx.translate(540,222); ctx.rotate(-0.04+Math.sin(t*3)*0.02);
  label(txt,0,0,40,'#1E1A2E',k,COL.lime); ctx.restore(); }

// ---------- zonas ocupadas (para que los captions no tapen a Raro ni los datos) ----------
// raro() y letrero() registran solas su caja; una escena puede marcar otra zona importante con ocupa(x0,y0,x1,y1,peso) en sus coordenadas.
let OCUP=[], CAPPOS={};
function ocupa(x0,y0,x1,y1,peso=1){ const m=ctx.getTransform(); const P=[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([x,y])=>[m.a*x+m.c*y+m.e, m.b*x+m.d*y+m.f]);
  const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]); OCUP.push([Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),peso]); }
function lugarCaption(w,h){ // elige la y del caption que menos tape (preferencia: CAPTION_Y, tercio central)
  const pref=window.CAPTION_Y||700, x0=540-w/2-24, x1=540+w/2+24; let best=pref, bs=1e9;
  for(let y=560;y<=1440;y+=20){ const y0=y-h/2-18, y1=y+h/2+18; let sc=0;
    for(const [a,b,c,d,p] of OCUP){ const ox=Math.max(0,Math.min(x1,c)-Math.max(x0,a)), oy=Math.max(0,Math.min(y1,d)-Math.max(y0,b)); sc+=p*ox*oy/((x1-x0)*(y1-y0)); }
    sc+=Math.abs(y-pref)*0.0011 + (y>1280?0.25:0);
    if(sc<bs){bs=sc;best=y;} }
  return best;
}

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
  const KW=window.KEYWORDS||[];
  let size=window.CAPTION_SIZE||80; const words=ch.map(i=>W[i].t.toUpperCase());
  const big=i=>KW.includes(i)?1.22:1;
  const widths=()=>ch.map((i,n)=>{ctx.font=fuente(size*big(i));return ctx.measureText(words[n]).width;});
  ctx.font=fuente(size); let sp=ctx.measureText(' ').width, ws=widths(), total=ws.reduce((a,b)=>a+b,0)+sp*1.25*(ch.length-1);
  if(total>800){size=Math.floor(size*800/total); ctx.font=fuente(size); sp=ctx.measureText(' ').width; ws=widths(); total=ws.reduce((a,b)=>a+b,0)+sp*1.25*(ch.length-1);}
  if(CAPPOS[ci]==null) CAPPOS[ci]=lugarCaption(total,size*1.25);
  const y=CAPPOS[ci];
  let x=540-total/2;
  ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.lineJoin='round';
  ch.forEach((i,n)=>{const w=words[n], wd=ws[n], kw=KW.includes(i);
    const k=t<W[i].s?0:(kw?popIn(t,W[i].s,0.22):back((t-W[i].s)/0.16));
    if(k>0){ const sz=size*big(i); ctx.save(); ctx.translate(x+wd/2,y); const sc=lerp(0.6,1,k)*(kw?1:1); ctx.scale(sc,sc); if(kw) ctx.rotate(Math.sin(t*5+i)*0.03);
      ctx.font=fuente(sz);
      ctx.fillStyle='rgba(20,14,40,0.45)'; ctx.fillText(w,0,sz*0.09);            // sombra
      ctx.lineWidth=sz*0.19; ctx.strokeStyle='#1E1A2E'; ctx.strokeText(w,0,0);       // contorno grueso
      ctx.fillStyle=kw?COL.lime:'#FFFFFF'; ctx.fillText(w,0,0); ctx.restore(); }
    x+=wd+sp*1.25;});
}

// ---------- grano sutil ----------
let GRAIN=null;
function grano(t){
  if(window.GRANO===false) return;
  if(!GRAIN){ GRAIN=document.createElement('canvas'); GRAIN.width=GRAIN.height=384; const g=GRAIN.getContext('2d'), d=g.createImageData(384,384);
    for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255;} g.putImageData(d,0,0); }
  const f=Math.round(t*30); ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=0.06; ctx.globalCompositeOperation='overlay';
  const ox=-rand(f)*384, oy=-rand(f+1)*384; for(let x=ox;x<1080;x+=384) for(let y=oy;y<1920;y+=384) ctx.drawImage(GRAIN,x,y);
  ctx.restore();
}

// ---------- transición de firma "bufanda" (motor) ----------
function barridoBufanda(u, entra){ // u 0..1; entra=true cubre de izq a der, false descubre hacia la der
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const x0 = entra? lerp(-1500,0,easeIn(u)) : lerp(0,1500,easeOut(u));
  ctx.translate(x0+540,960); ctx.rotate(-0.18);
  ctx.fillStyle='#9DC41C'; ctx.fillRect(-760,-1300,1500,2600);
  ctx.fillStyle=COL.lime; ctx.fillRect(-740,-1300,1460,2600);
  ctx.strokeStyle='#9DC41C'; ctx.lineWidth=14; for(let x=-700;x<720;x+=70){ctx.beginPath();ctx.moveTo(x,-1300);ctx.lineTo(x+30,1300);ctx.stroke();}
  ctx.fillStyle=COL.lime; for(const sd of [-1,1]) for(let y=-1300;y<1300;y+=46){ctx.fillRect(sd>0?720:-790,y,70,14);}
  ctx.restore();
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
// Tomas de cámara por escena: window.TOMAS={n:{mov, z, foco:[x,y]}}.
//   mov: push (acerca) | pull (aleja) | paneo-izq | paneo-der | sube | baja | orbita | fija ; z: zoom base (>=1); foco: punto que encuadra.
// Si una escena no declara toma, el motor alterna movimientos para que dos escenas seguidas nunca se muevan igual.
const MOV_AUTO=['push','paneo-der','pull','paneo-izq','sube','orbita'];
function camara(si,lt,dur){
  const TM=(window.TOMAS||{})[si+1]||{}; const mov=TM.mov||MOV_AUTO[si%MOV_AUTO.length];
  const u=easeInOut(clamp(lt/Math.max(dur,0.5))); let z=Math.max(1,TM.z||1), ox=0, oy=0, rot=0;
  if(mov==='push') z*=lerp(1,1.13,u); else if(mov==='pull') z*=lerp(1.13,1,u);
  else if(mov==='paneo-izq'){ z*=1.06; ox=lerp(70,-70,u); } else if(mov==='paneo-der'){ z*=1.06; ox=lerp(-70,70,u); }
  else if(mov==='sube'){ z*=1.06; oy=lerp(60,-60,u); } else if(mov==='baja'){ z*=1.06; oy=lerp(-60,60,u); }
  else if(mov==='orbita'){ z*=1.08; ox=Math.sin(u*Math.PI)*-50; rot=lerp(-0.025,0.025,u); }
  const f=TM.foco||[540,960];
  return {z,ox,oy,rot,fx:f[0],fy:f[1]};
}
// Transiciones: TRANS={n:'bufanda'|'latigazo'|'zoom'}. latigazo = paneo de látigo con estelas; zoom = entra atravesando con líneas de velocidad.
function estelas(u,dir){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=0.7*Math.sin(u*Math.PI); ctx.fillStyle='#FFFFFF';
  for(let i=0;i<26;i++){ const y=rand(i)*1920, w=300+rand(i+1)*700, x=((rand(i+2)*1600+dir*u*2400)%1600+1600)%1600-300; ctx.fillRect(x,y,w,6+rand(i+3)*16);} ctx.restore(); }
function render(t){
  let si=0; for(let i=0;i<SC.length;i++) if(t>=SC[i].start) si=i;
  const sc=SC[si], lt=t-sc.start, n=si+1, dur=sc.end-sc.start, TR=window.TRANS||{};
  OCUP=[];
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.filter='none';
  // cámara viva: toma por escena + punch-in al cortar + sacudidas en palabras de impacto
  const cam=camara(si,lt,dur);
  let punch=si>0?1.07-0.07*easeOut(lt/0.28):1, tx=0;
  if(TR[n]==='zoom' && lt<0.24) punch*=lerp(1.9,1,easeOut(lt/0.24));
  const dir=si%2?-1:1;
  if(TR[n]==='latigazo' && lt<0.2) tx=-dir*lerp(900,0,easeOut(lt/0.2));
  if(si+1<SC.length && TR[n+1]==='latigazo' && t>SC[si+1].start-0.14) tx=dir*lerp(0,900,easeIn((t-(SC[si+1].start-0.14))/0.14));
  let sx=0,sy=0; for(const wi of (window.SHAKES||[])){const d=t-at(wi); if(d>0&&d<0.35){const a=(1-d/0.35)*18;sx+=Math.sin(d*90)*a;sy+=Math.cos(d*77)*a;}}
  const pan=cam.ox*0.8+Math.sin(t*0.45)*12;
  const F=(window.FONDOS||{})[n];
  ctx.save(); ctx.translate(540+sx+cam.ox+tx,960+sy+cam.oy); ctx.rotate(cam.rot); ctx.scale(punch*cam.z,punch*cam.z); ctx.translate(-cam.fx,-cam.fy);
  if(F) fondo(t,F.pal,F.tipo||'cerros',pan); else if(typeof fondo==='function') fondo(t,'turquesa','cerros',pan); else background(t,(window.DARK_SCENES||[]).includes(n)?easeOut(lt/0.4):0);
  ctx.save(); ctx.translate(pan*0.5,0);
  SCENES[si](t,sc);
  ctx.restore();
  if(typeof primerPlano==='function' && !(F&&F.pp===false)) primerPlano(t,pan);
  ctx.restore();
  if(typeof vineta==='function') vineta();
  if(TR[n]==='latigazo' && lt<0.2) estelas(lt/0.2,-dir);
  if(si+1<SC.length && TR[n+1]==='latigazo' && t>SC[si+1].start-0.14) estelas((t-(SC[si+1].start-0.14))/0.14,dir);
  if(TR[n]==='zoom' && typeof lineasVelocidad==='function') lineasVelocidad(t,sc.start,540,900,'#FFFFFF',0.3);
  for(const [wi,c] of (window.FLASHES||[]).map(f=>Array.isArray(f)?f:[f,'#FFFFFF'])) flashColor(t,at(wi),c);
  if(CHIPS[n]) chip(CHIPS[n],t,sc.start+0.1);
  captions(t);
  // transición de firma: la bufanda cruza la pantalla
  if(si+1<SC.length && TR[n+1]==='bufanda' && t>SC[si+1].start-0.2) barridoBufanda((t-(SC[si+1].start-0.2))/0.2,true);
  if(TR[n]==='bufanda' && lt<0.22) barridoBufanda(lt/0.22,false);
  if(window.PROGRESS!==false){const p=clamp(t/TL.duration);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(0,0,W_,10);ctx.fillStyle=COL.lime;ctx.fillRect(0,0,W_*p,10);}
  grano(t);
}
async function init(tl){TL=tl;W=tl.words;SC=tl.scenes;buildChunks();
  await document.fonts.load('900 96px Inter');
  FONT='Inter'; FW=900;
  for(const u of (window.FONT_URLS||['../../fuentes/Fredoka-Bold.ttf','../../fuentes/Fredoka.ttf','../fuentes/Fredoka-Bold.ttf','../fuentes/Fredoka.ttf'])){
    try{ const f=new FontFace('Fredoka',`url(${u})`,{weight:u.includes('Bold')?'700':'300 700'}); await f.load(); document.fonts.add(f); FONT='Fredoka'; FW=700; break; }catch(e){}
  }
  return FONT;}
function frame(t){render(t);return C.toDataURL('image/jpeg',0.92);}
