/* Motor de documentales animados (videos largos horizontales 1920x1080, 30 fps).
 * Estilo "expediente": fondo azul noche con retícula, acentos cian/oro/rojo, pictogramas (nunca caricaturas de personas reales).
 * La escena se declara en storyboard (ver armar_tl.py): cada escena = {tipo, p:{...}, start, end, b, c, d (tiempos de beats)}.
 * Uso: init(tl) y frame(t). Cada tipo de escena está en ESC[tipo](t, lt, sc, p).
 */
const C = document.getElementById('c'), ctx = C.getContext('2d');
const W_ = 1920, H_ = 1080;
let TL = null, WD = [], SC = [], CH = [];
const K = { bg0:'#070B1A', bg1:'#101936', grid:'rgba(110,140,255,0.07)', cyan:'#35D7FF', gold:'#FFC83D', red:'#FF4A5C', green:'#3DF5A0',
  white:'#EEF1FF', muted:'#8A93B8', ink:'#0A0E1F', card:'#17213F', card2:'#1E2A50', violet:'#9B7BFF', orange:'#FF8A3D' };
const F = (w,s)=>`${w} ${Math.round(s)}px Inter`;

// ---------- helpers ----------
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,u)=>a+(b-a)*u;
const eo=u=>1-Math.pow(1-clamp(u),3);
const ei=u=>Math.pow(clamp(u),3);
const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back=u=>{u=clamp(u);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
const pop=(t,t0,d=.32)=>t<t0?0:(t-t0>=d?1:back((t-t0)/d));
const prog=(t,t0,d)=>clamp((t-t0)/d);
function rand(s){let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function hexRgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function mix(a,b,u){const A=hexRgb(a),B=hexRgb(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],clamp(u)))).join(',')})`;}
function rgba(h,a){const [r,g,b]=hexRgb(h);return `rgba(${r},${g},${b},${a})`;}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function sv(){ctx.save();} function rs(){ctx.restore();}
function at(x,y,s=1,rot=0){ctx.translate(x,y);if(rot)ctx.rotate(rot);if(s!==1)ctx.scale(s,s);}
function glow(c,b){ctx.shadowColor=c;ctx.shadowBlur=b;}
function noGlow(){ctx.shadowBlur=0;}
function fmt(n){return Math.round(n).toLocaleString('en-US');}

// ---------- texto ----------
function txt(s,x,y,size,color=K.white,{w=900,align='center',base='middle',k=1,stroke=0,glowC=null,track=0}={}){
  if(k<=0.001) return; sv(); at(x,y,k); ctx.font=F(w,size); ctx.textAlign=align; ctx.textBaseline=base;
  if(track) ctx.letterSpacing=track+'px';
  if(glowC) glow(glowC,size*0.35);
  if(stroke){ctx.lineJoin='round';ctx.lineWidth=stroke;ctx.strokeStyle=K.ink;ctx.strokeText(s,0,0);}
  ctx.fillStyle=color; ctx.fillText(s,0,0); rs();
}
function lineas(arr,x,y,size,color,gap=1.15,opts={}){arr.forEach((l,i)=>txt(l,x,y+i*size*gap,size,color,opts));}
function chip(s,x,y,k=1,bg=K.cyan,fg=K.ink,size=34){ if(k<=0.001)return; sv(); at(x,y,k); ctx.font=F(800,size);
  const w=ctx.measureText(s).width+size*1.2,h=size*1.7; rr(-w/2,-h/2,w,h,h/2); ctx.fillStyle=bg; ctx.fill();
  ctx.fillStyle=fg; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s,0,2); rs(); }
function card(x,y,w,h,k=1,{bg=K.card,border=null,r=28,shadow=true}={}){ if(k<=0.001)return false;
  sv(); at(x,y,k); if(shadow){ctx.shadowColor='rgba(0,0,0,0.45)';ctx.shadowBlur=40;ctx.shadowOffsetY=16;}
  rr(-w/2,-h/2,w,h,r); ctx.fillStyle=bg; ctx.fill(); noGlow(); ctx.shadowOffsetY=0;
  if(border){ctx.lineWidth=4;ctx.strokeStyle=border;ctx.stroke();} rs(); return true; }
function sello(s,x,y,t,t0,color=K.red,size=96,rot=-0.12){ if(t<t0)return; const u=prog(t,t0,0.22); const k=lerp(2.2,1,eo(u));
  sv(); at(x,y,k,rot); ctx.globalAlpha=clamp(u*2); ctx.font=F(900,size); const w=ctx.measureText(s).width+size*0.8,h=size*1.45;
  ctx.lineWidth=size*0.09; ctx.strokeStyle=color; rr(-w/2,-h/2,w,h,size*0.18); ctx.stroke();
  ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s,0,size*0.04); rs(); }

// ---------- fondo ----------
let TONO=K.cyan;
function fondo(t,tono=K.cyan,alarma=0){
  TONO=tono;
  const g=ctx.createLinearGradient(0,0,0,H_); g.addColorStop(0,mix(K.bg1,tono,0.08+0.18*alarma)); g.addColorStop(1,K.bg0);
  ctx.fillStyle=g; ctx.fillRect(-200,-200,W_+400,H_+400);
  // retícula que se desplaza lento
  sv(); ctx.strokeStyle=alarma?rgba(K.red,0.08):K.grid; ctx.lineWidth=2; const off=(t*12)%80;
  for(let x=-80+off;x<W_+80;x+=80){ctx.beginPath();ctx.moveTo(x,-100);ctx.lineTo(x,H_+100);ctx.stroke();}
  for(let y=-80+off*0.5;y<H_+80;y+=80){ctx.beginPath();ctx.moveTo(-100,y);ctx.lineTo(W_+100,y);ctx.stroke();} rs();
  // halo del color del tono
  const h=ctx.createRadialGradient(W_/2,H_*0.45,0,W_/2,H_*0.45,900); h.addColorStop(0,rgba(tono,0.16)); h.addColorStop(1,rgba(tono,0));
  ctx.fillStyle=h; ctx.fillRect(-200,-200,W_+400,H_+400);
  // partículas
  for(let i=0;i<40;i++){ const sp=8+rand(i)*20, x=(rand(i+3)*W_+t*sp*(i%2?1:-1)+W_*3)%W_, y=(rand(i+7)*H_-t*sp*0.6+H_*5)%H_;
    ctx.fillStyle=rgba(i%5?K.white:tono,0.10+0.25*(0.5+0.5*Math.sin(t*1.5+i))); circ(x,y,1.5+rand(i+9)*2.5); ctx.fill(); }
}
function vineta(){ const g=ctx.createRadialGradient(W_/2,H_/2,500,W_/2,H_/2,1250); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.55)'); ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_); }

// ---------- pictogramas ----------
// persona: pictograma (cabeza + cuerpo cápsula), nunca un retrato. expr: neutral|feliz|serio|susto|nervioso|dormido|triste
function persona(x,y,s,o={}){
  const t=o.t||0, c=o.color||K.cyan, k=o.k??1; if(k<=0.001) return;
  const bob=Math.sin(t*2.2+(o.seed||0))*4;
  sv(); at(x,y+bob*s,s*k);
  ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0,8,90,16,0,0,Math.PI*2); ctx.fill();
  // cuerpo
  rr(-62,-190,124,190,58); ctx.fillStyle=c; ctx.fill();
  if(o.ropa==='shorts'){ ctx.fillStyle=mix(c,'#000000',0.35); rr(-62,-70,124,70,22); ctx.fill(); ctx.fillStyle=K.ink; ctx.fillRect(-3,-62,6,62);
    ctx.strokeStyle=mix(c,'#ffffff',0.35); ctx.lineWidth=4; for(const yy of [-160,-130,-104]){ctx.beginPath();ctx.moveTo(-40,yy);ctx.quadraticCurveTo(0,yy+10,40,yy-4);ctx.stroke();} }
  if(o.ropa==='traje'){ ctx.fillStyle=mix(c,'#000000',0.45); ctx.beginPath(); ctx.moveTo(-62,-150); ctx.lineTo(0,-60); ctx.lineTo(62,-150); ctx.lineTo(62,-10); ctx.lineTo(-62,-10); ctx.closePath(); ctx.fill();
    ctx.fillStyle=K.white; ctx.beginPath(); ctx.moveTo(-16,-182); ctx.lineTo(0,-120); ctx.lineTo(16,-182); ctx.fill(); ctx.fillStyle=K.red; ctx.fillRect(-6,-170,12,50); }
  if(o.ropa==='capucha'){ ctx.fillStyle=mix(c,'#000000',0.3); circ(0,-232,74); ctx.fill(); }
  // cabeza
  const hy=-246; circ(0,hy,58); ctx.fillStyle=mix(c,'#ffffff',0.25); ctx.fill();
  if(o.pelo==='rizos'){ ctx.fillStyle=mix(c,'#000000',0.55); for(let i=0;i<9;i++){ const a=Math.PI*(1.05+i*0.11); circ(Math.cos(a)*54,hy+Math.sin(a)*50,22); ctx.fill(); } }
  if(o.pelo==='liso'){ ctx.fillStyle=mix(c,'#000000',0.55); ctx.beginPath(); ctx.arc(0,hy-4,60,Math.PI*1.05,Math.PI*1.95); ctx.quadraticCurveTo(30,hy-40,-50,hy-20); ctx.fill(); }
  if(o.pelo==='largo'){ ctx.fillStyle=mix(c,'#000000',0.55); ctx.beginPath(); ctx.arc(0,hy-2,62,Math.PI,0); ctx.lineTo(62,hy+60); ctx.lineTo(40,hy+60); ctx.lineTo(40,hy-10); ctx.lineTo(-40,hy-10); ctx.lineTo(-40,hy+60); ctx.lineTo(-62,hy+60); ctx.closePath(); ctx.fill(); }
  if(o.casco){ ctx.fillStyle=K.gold; ctx.beginPath(); ctx.arc(0,hy-10,62,Math.PI,0); ctx.fill(); ctx.fillRect(-74,hy-14,148,12); }
  if(o.ropa==='capucha'){ ctx.fillStyle=K.ink; circ(0,hy+6,44); ctx.fill(); }
  // ojos
  const e=o.expr||'neutral'; const blink=((t+(o.seed||0))%3.4)<0.12?0.15:1; const lx=(o.mira||0)*8;
  ctx.fillStyle=o.ropa==='capucha'?K.white:K.ink;
  if(e==='dormido'){ ctx.strokeStyle=K.ink; ctx.lineWidth=5; for(const ex of [-20,20]){ctx.beginPath();ctx.arc(ex,hy+2,10,0.1*Math.PI,0.9*Math.PI);ctx.stroke();} }
  else { const es=e==='susto'?1.5:1; for(const ex of [-20,20]){ ctx.beginPath(); ctx.ellipse(ex+lx,hy,7*es,10*es*blink,0,0,Math.PI*2); ctx.fill(); } }
  // boca
  ctx.strokeStyle=K.ink; ctx.lineWidth=5; ctx.lineCap='round'; ctx.beginPath();
  if(e==='feliz') ctx.arc(0,hy+18,14,0.15*Math.PI,0.85*Math.PI);
  else if(e==='susto'){ ctx.ellipse(0,hy+28,8,11,0,0,Math.PI*2); }
  else if(e==='triste'||e==='nervioso') ctx.arc(0,hy+34,12,1.15*Math.PI,1.85*Math.PI);
  else if(e==='serio'){ ctx.moveTo(-12,hy+26); ctx.lineTo(12,hy+26); }
  else if(e!=='dormido'){ ctx.moveTo(-10,hy+24); ctx.quadraticCurveTo(0,hy+30,10,hy+24); }
  ctx.stroke();
  if(e==='nervioso'){ ctx.fillStyle='#7FD8FF'; ctx.beginPath(); ctx.ellipse(48,hy-20,7,12,0,0,Math.PI*2); ctx.fill(); }
  if(e==='dormido'){ for(let i=0;i<3;i++){ const u=((t*0.6+i/3)%1); txt('z',60+u*60,hy-50-u*90,26+u*20,rgba(K.white,1-u),{w:800}); } }
  rs();
  if(o.label) chip(o.label,x,y+48*s,k*clamp(s,0.6,1),o.labelBg||K.card2,K.white,30);
}
function puf(x,y,s,c=K.violet){ sv(); at(x,y,s); ctx.fillStyle=mix(c,'#000000',0.3); ctx.beginPath(); ctx.ellipse(0,0,170,70,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(0,-30,160,80,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle=rgba('#ffffff',0.18); ctx.beginPath(); ctx.ellipse(-60,-60,50,22,-0.3,0,Math.PI*2); ctx.fill(); rs(); }
function moneda(x,y,r,label='$',c=K.gold,t=0,spin=0){ const sx=spin?Math.abs(Math.cos(t*spin)):1; sv(); at(x,y); ctx.scale(Math.max(0.08,sx),1);
  circ(0,0,r); ctx.fillStyle=mix(c,'#000000',0.25); ctx.fill(); circ(0,-r*0.06,r*0.94); ctx.fillStyle=c; ctx.fill();
  ctx.lineWidth=r*0.08; ctx.strokeStyle=mix(c,'#ffffff',0.35); circ(0,-r*0.06,r*0.72); ctx.stroke();
  if(sx>0.35){ ctx.fillStyle=mix(c,'#000000',0.5); ctx.font=F(900,r*(label.length>2?0.55:0.9)); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,0,0); } rs(); }
function billete(x,y,s,rot=0,c=K.green){ sv(); at(x,y,s,rot); rr(-70,-36,140,72,10); ctx.fillStyle=c; ctx.fill(); ctx.strokeStyle=mix(c,'#000000',0.3); ctx.lineWidth=4; rr(-60,-26,120,52,6); ctx.stroke();
  ctx.fillStyle=mix(c,'#000000',0.35); ctx.font=F(900,34); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('$',0,2); rs(); }
function edificio(x,y,w,h,c,label,k=1,t=0){ if(k<=0.001)return; sv(); at(x,y,k); rr(-w/2,-h,w,h,18); ctx.fillStyle=c; ctx.fill();
  ctx.fillStyle=rgba('#ffffff',0.12); rr(-w/2,-h,w*0.18,h,18); ctx.fill();
  for(let yy=-h+50;yy<-60;yy+=58) for(let xx=-w/2+34;xx<w/2-50;xx+=58){ const on=rand(xx*0.3+yy*0.7)>0.35&&Math.sin(t*0.7+xx+yy)>-0.9; ctx.fillStyle=on?rgba(K.gold,0.85):rgba('#000000',0.25); rr(xx,yy,30,36,6); ctx.fill(); }
  ctx.fillStyle=mix(c,'#000000',0.35); rr(-36,-64,72,64,8); ctx.fill();
  if(label){ rr(-w/2+20,-h-70,w-40,58,14); ctx.fillStyle=K.ink; ctx.fill(); ctx.fillStyle=K.white; ctx.font=F(900,36); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,0,-h-40); }
  rs(); }
function telefono(x,y,s,o={}){ const k=o.k??1; if(k<=0.001)return; sv(); at(x,y,s*k,o.rot||0);
  rr(-110,-210,220,420,34); ctx.fillStyle='#0C1022'; ctx.fill(); ctx.lineWidth=6; ctx.strokeStyle='#2B3666'; ctx.stroke();
  rr(-96,-190,192,380,24); ctx.fillStyle=o.pant||K.card; ctx.fill();
  ctx.fillStyle=K.muted; ctx.font=F(700,20); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(o.app||'Mi cuenta',0,-150);
  txt(o.saldo??'$ 12,480',0,-80,o.saldoSize||38,o.saldoC||K.white,{w:900});
  if(o.banner){ rr(-84,-10,168,70,14); ctx.fillStyle=o.bannerC||K.red; ctx.fill(); lineas(o.banner.split('|'),0,o.banner.includes('|')?12:25,22,K.white,1.15,{w:800}); }
  if(o.boton){ rr(-70,100,140,52,26); ctx.fillStyle=o.botonC||K.cyan; ctx.fill(); txt(o.boton,0,126,22,K.ink,{w:800}); }
  rs(); }
function candado(x,y,s,abierto=0,c=K.gold){ sv(); at(x,y,s); ctx.lineWidth=18; ctx.strokeStyle=K.muted; ctx.beginPath(); ctx.arc(0,-40-abierto*50,52,Math.PI,0); ctx.stroke();
  rr(-80,-40,160,130,22); ctx.fillStyle=c; ctx.fill(); ctx.fillStyle=K.ink; circ(0,10,16); ctx.fill(); ctx.fillRect(-6,10,12,40); rs(); }
function relojArena(x,y,s,t){ sv(); at(x,y,s); circ(0,0,110); ctx.fillStyle=K.card2; ctx.fill(); ctx.lineWidth=10; ctx.strokeStyle=K.white; ctx.stroke();
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; ctx.beginPath(); ctx.moveTo(Math.cos(a)*86,Math.sin(a)*86); ctx.lineTo(Math.cos(a)*98,Math.sin(a)*98); ctx.stroke(); }
  ctx.lineCap='round'; ctx.lineWidth=10; const a1=t*2.5-Math.PI/2, a2=t*0.4-Math.PI/2; ctx.strokeStyle=K.gold;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a1)*80,Math.sin(a1)*80); ctx.stroke(); ctx.strokeStyle=K.white; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a2)*55,Math.sin(a2)*55); ctx.stroke(); rs(); }
function mazo(x,y,s,golpe){ sv(); at(x,y,s); ctx.fillStyle='#6B4A2E'; rr(-160,60,320,40,12); ctx.fill(); ctx.rotate(-0.9+golpe*0.9);
  ctx.fillStyle='#8A5E3A'; rr(-12,-200,24,200,10); ctx.fill(); rr(-80,-250,160,70,22); ctx.fillStyle='#A8754B'; ctx.fill(); rs(); }

// ---------- gráficas ----------
// serie: [[x(0..1), y(valor)], ...]; dibuja hasta u (0..1) en una caja
function grafica(x,y,w,h,serie,u,{ymin=0,ymax=1,color=K.cyan,grosor=8,relleno=true,etiquetas=[]}={}){
  sv(); at(x,y); ctx.strokeStyle=rgba(K.white,0.12); ctx.lineWidth=2;
  for(let i=0;i<=4;i++){ ctx.beginPath(); ctx.moveTo(0,-h*i/4); ctx.lineTo(w,-h*i/4); ctx.stroke(); }
  const P=serie.map(([a,b])=>[a*w,-(b-ymin)/(ymax-ymin)*h]); const n=Math.max(1,Math.floor(u*(P.length-1)));
  const fr=u*(P.length-1)-n+1; const pts=P.slice(0,n+1); if(n+1<P.length&&fr<1&&n>=0){ const a=P[n],b=P[n+1]||a; pts[n+1]=[lerp(a[0],b[0],fr),lerp(a[1],b[1],fr)]; }
  if(relleno&&pts.length>1){ const g=ctx.createLinearGradient(0,-h,0,0); g.addColorStop(0,rgba(color,0.35)); g.addColorStop(1,rgba(color,0)); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(pts[0][0],0); pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(pts[pts.length-1][0],0); ctx.fill(); }
  ctx.strokeStyle=color; ctx.lineWidth=grosor; ctx.lineJoin='round'; ctx.lineCap='round'; glow(color,20); ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke(); noGlow();
  const last=pts[pts.length-1]; ctx.fillStyle=K.white; circ(last[0],last[1],12); ctx.fill(); ctx.fillStyle=color; circ(last[0],last[1],7); ctx.fill();
  for(const e of etiquetas){ if(u<e.u) continue; const p=P[e.i]; chip(e.s,p[0]+(e.dx||0),p[1]+(e.dy||-60),e.k??eo((u-e.u)*6),e.bg||K.card2,e.fg||K.white,34); }
  rs(); return last;
}
function barra(x,y,w,h,u,color,label,valor,{k=1,lblC=K.white}={}){ if(k<=0)return; sv(); at(x,y); ctx.globalAlpha=k;
  rr(0,-h/2,w*eo(u),h,h/2); ctx.fillStyle=color; glow(color,18); ctx.fill(); noGlow();
  txt(label,0,-h/2-30,30,K.muted,{w:700,align:'left'}); if(valor) txt(valor,w*eo(u)+20,0,40,lblC,{w:900,align:'left'}); rs(); }

// ---------- captions ----------
function buildChunks(){ CH=[]; let cur=[];
  WD.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>WD[j].t).join(' ').length; const fin=/[.,?!:…"]$/.test(w.t);
    if(fin||cur.length>=5||len>26||(i+1<WD.length&&WD[i+1].p!==w.p)){ CH.push(cur); cur=[]; } }); if(cur.length) CH.push(cur); }
function captions(t){ if(window.CAPTIONS===false) return;
  let ci=-1; for(let c=0;c<CH.length;c++) if(WD[CH[c][0]].s-0.04<=t) ci=c; if(ci<0) return;
  const ch=CH[ci], last=WD[ch[ch.length-1]]; if(t>last.e+0.5) return;
  const words=ch.map(i=>WD[i].t.replace(/^~/,'')); ctx.font=F(800,50); const sp=ctx.measureText(' ').width;
  const ws=words.map(w=>ctx.measureText(w).width); const tot=ws.reduce((a,b)=>a+b,0)+sp*(words.length-1);
  const y=1000; sv(); rr(W_/2-tot/2-28,y-40,tot+56,80,40); ctx.fillStyle='rgba(7,11,26,0.72)'; ctx.fill(); rs();
  let x=W_/2-tot/2; ctx.textBaseline='middle'; ctx.textAlign='left';
  ch.forEach((i,n)=>{ const on=t>=WD[i].s, act=on&&(n===ch.length-1||t<WD[ch[n+1]].s); ctx.font=F(800,50);
    ctx.fillStyle=act?K.gold:(on?K.white:rgba(K.white,0.38)); ctx.fillText(words[n],x,y+2); x+=ws[n]+sp; }); }

// ---------- capítulo (etiqueta abajo-izquierda) ----------
function etiquetaCap(t){ for(const c of (window.CAPS||[])){ const d=t-c.t; if(d<0||d>4.2) continue; const k=d<0.4?eo(d/0.4):(d>3.7?1-eo((d-3.7)/0.5):1);
  sv(); ctx.globalAlpha=k; at(70+(1-k)*-60,92); ctx.fillStyle=K.gold; ctx.fillRect(0,-30,8,60); txt(c.n,30,-12,22,K.gold,{w:800,align:'left',track:4}); txt(c.s,30,18,34,K.white,{w:900,align:'left'}); rs(); } }

// ---------- motor ----------
function escenaEn(t){ let si=0; for(let i=0;i<SC.length;i++) if(t>=SC[i].start) si=i; return si; }
function render(t){
  const si=escenaEn(t), sc=SC[si], lt=t-sc.start, dur=sc.end-sc.start;
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.filter='none';
  const p=sc.p||{}; const tono=p.tono?K[p.tono]||p.tono:K.cyan;
  // cámara: empuje lento + deriva, golpe al cortar
  const u=clamp(lt/Math.max(dur,0.5)); const mov=p.cam||['push','izq','pull','der'][si%4];
  let z=1, ox=0, oy=0; if(mov==='push') z=lerp(1,1.06,eio(u)); else if(mov==='pull') z=lerp(1.06,1,eio(u)); else if(mov==='izq'){z=1.04;ox=lerp(30,-30,eio(u));} else if(mov==='der'){z=1.04;ox=lerp(-30,30,eio(u));}
  const punch=si>0?1+0.05*(1-eo(lt/0.3)):1; let tx=0; const dir=si%2?1:-1;
  if(si>0&&lt<0.22&&sc.tr==='latigo') tx=dir*lerp(-260,0,eo(lt/0.22));
  let sx=0,sy=0; for(const s of (sc.sh||[])){ const d=t-s; if(d>0&&d<0.35){const a=(1-d/0.35)*14; sx+=Math.sin(d*90)*a; sy+=Math.cos(d*70)*a;} }
  sv(); ctx.translate(W_/2+sx+ox+tx,H_/2+sy+oy); ctx.scale(z*punch,z*punch); ctx.translate(-W_/2,-H_/2);
  fondo(t,tono,p.alarma?1:0);
  (ESC[sc.tipo]||ESC.texto)(t,lt,sc,p);
  rs();
  vineta();
  if(si>0&&lt<0.12&&sc.tr!=='latigo'){ ctx.fillStyle=`rgba(255,255,255,${0.18*(1-lt/0.12)})`; ctx.fillRect(0,0,W_,H_); }
  if(si>0&&lt<0.22&&sc.tr==='latigo'){ sv(); ctx.globalAlpha=0.5*Math.sin(lt/0.22*Math.PI); ctx.fillStyle=K.white; for(let i=0;i<22;i++){ const y=rand(i)*H_, w=200+rand(i+1)*600; ctx.fillRect((rand(i+2)*W_+dir*lt*9000)%W_-200,y,w,4+rand(i+3)*8);} rs(); }
  etiquetaCap(t); captions(t);
  // barra de progreso discreta
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(0,H_-6,W_,6); ctx.fillStyle=K.gold; ctx.fillRect(0,H_-6,W_*clamp(t/TL.duration),6);
}

// =====================================================================
// ESCENAS. Cada una: (t, lt, sc, p). sc.b, sc.c, sc.d = tiempos de beats (o undefined).
// =====================================================================
const B=(sc,k,def)=>sc[k]!=null?sc[k]:sc.start+def;
const ESC={
  // texto grande (remates). p.l = líneas; p.l2 en beat b; p.color
  texto(t,lt,sc,p){ const k=pop(t,sc.start+0.05,0.4);
    const L=p.l||['']; lineas(L,W_/2,H_/2-(L.length-1)*(p.size||120)*0.55-(p.l2?60:0),p.size||120,p.color?K[p.color]||p.color:K.white,1.1,{k,w:900,glowC:p.glow?K[p.glow]:null});
    if(p.l2&&sc.b!=null){ const k2=pop(t,sc.b,0.4); lineas(p.l2,W_/2,H_/2+(L.length)*(p.size||120)*0.55+20,p.size2||90,p.color2?K[p.color2]:K.gold,1.1,{k:k2,w:900}); }
    if(p.sello&&sc.c!=null) sello(p.sello,W_/2,H_/2,t,sc.c,K.red,110);
    if(p.luna){ sv(); ctx.globalAlpha=pop(t,sc.start,0.6); ctx.fillStyle='#F4F1D8'; glow('#F4F1D8',60); circ(1500,240,90); ctx.fill(); noGlow(); ctx.fillStyle=K.bg1; circ(1540,215,80); ctx.fill(); rs(); }
  },
  // cifra con contador. p.de,p.a,p.pre,p.suf,p.sub,p.color ; beat b: cae a p.cae (rojo)
  cifra(t,lt,sc,p){ const k=p.ya?1:pop(t,sc.start+0.05,0.4); let v=lerp(p.de||0,p.a,eo(prog(t,sc.start+0.1,p.dur||1.4))); let col=p.color?K[p.color]:K.green;
    if(p.cae!=null&&sc.b!=null&&t>=sc.b){ const u=eo(prog(t,sc.b,0.9)); v=lerp(p.a,p.cae,u); col=mix(col.startsWith('#')?col:K.green,K.red,u*1.5); }
    const s=(v<0?'−':'')+(p.pre||'')+(p.fmt==='raw'?Math.abs(v).toFixed(p.dec||0):fmt(Math.abs(v)))+(p.suf||'');
    const glitch=(p.cae!=null&&sc.b!=null&&t>=sc.b&&t<sc.b+0.5)?Math.sin(t*90)*12:0;
    txt(s,W_/2+glitch,H_/2-30,p.size||190,col,{k,w:900,glowC:col});
    if(p.sub) txt(p.sub,W_/2,H_/2+120,48,K.muted,{k:p.subYa?1:pop(t,sc.start+0.4,0.4),w:800,track:6});
    if(p.sub2&&sc.c!=null) chip(p.sub2,W_/2,H_/2+210,pop(t,sc.c),K.gold,K.ink,40);
    if(p.corona){ sv(); at(W_/2,H_/2-200,pop(t,sc.start+0.8,0.4)); ctx.fillStyle=K.gold; glow(K.gold,30); ctx.beginPath(); ctx.moveTo(-90,40); ctx.lineTo(-110,-40); ctx.lineTo(-50,0); ctx.lineTo(0,-60); ctx.lineTo(50,0); ctx.lineTo(110,-40); ctx.lineTo(90,40); ctx.closePath(); ctx.fill(); rs(); }
  },
  // días que se tachan. p.dias = [etiquetas], p.titulo
  dias(t,lt,sc,p){ const D=p.dias||[]; const n=D.length; const w=Math.min(170,1500/n);
    if(p.titulo) txt(p.titulo,W_/2,220,90,K.white,{k:pop(t,sc.start,0.4),w:900});
    D.forEach((d,i)=>{ const x=W_/2+(i-(n-1)/2)*(w+16), k=pop(t,sc.start+0.15+i*0.07,0.3); if(k<=0) return;
      card(x,560,w,w*1.25,k,{bg:K.card2}); sv(); at(x,560,k); ctx.fillStyle=K.red; rr(-w/2,-w*0.625,w,w*0.28,14); ctx.fill();
      txt(p.mes||'NOV',0,-w*0.49,w*0.16,K.white,{w:800}); txt(d,0,w*0.12,w*0.42,K.white,{w:900}); rs();
      const tx=sc.b!=null?sc.b+i*0.09:1e9; if(t>tx){ sv(); at(x,560); ctx.strokeStyle=K.red; ctx.lineWidth=12; ctx.lineCap='round'; const u=eo(prog(t,tx,0.15));
        ctx.beginPath(); ctx.moveTo(-w*0.4,-w*0.4); ctx.lineTo(lerp(-w*0.4,w*0.4,u),lerp(-w*0.4,w*0.45,u)); ctx.stroke(); rs(); } });
    if(p.sello&&sc.c!=null) sello(p.sello,W_/2,820,t,sc.c,K.red,80,-0.05);
  },
  // calendario de una fecha + texto. p.mes,p.dia,p.anio,p.texto (líneas), p.icono
  fecha(t,lt,sc,p){ const k=pop(t,sc.start,0.4); card(560,520,380,420,k,{bg:K.card2}); sv(); at(560,520,k);
    ctx.fillStyle=p.mesC?K[p.mesC]:K.red; rr(-190,-210,380,110,28); ctx.fill(); ctx.fillRect(-190,-130,380,30);
    txt(p.mes,0,-155,54,K.white,{w:900,track:6}); txt(p.dia,0,40,170,K.white,{w:900}); txt(p.anio||'',0,160,40,K.muted,{w:800}); rs();
    const L=p.texto||[]; L.forEach((l,i)=>{ const kk=pop(t,(i===0?sc.start+0.3:(sc.b??sc.start+1)+(i-1)*0.4),0.35); txt(l,1320,430+i*110,i===0?72:56,i===0?K.white:(p.texC?K[p.texC]:K.gold),{k:kk,w:900}); });
    if(p.sello&&sc.c!=null) sello(p.sello,1320,800,t,sc.c,K.red,70,-0.06);
  },
  // perfil: pictograma + nombre + chips que aparecen en beats. p.persona, p.nombre, p.chips:[[texto,beat]]
  perfil(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(560,560,600,700,k,{bg:K.card});
    persona(560,690,1.25,{...(p.persona||{}),t,k});
    txt(p.nombre,560,840,48,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    (p.chips||[]).forEach(([s,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.6+i*0.5):sc.start+0.6+i*0.5; const kk=pop(t,t0,0.35); if(kk<=0)return;
      card(1300,300+i*150,700,120,kk,{bg:K.card2,r:24}); sv(); at(1300,300+i*150,kk); ctx.fillStyle=[K.cyan,K.gold,K.green,K.violet][i%4]; rr(-350,-60,16,120,8); ctx.fill(); rs();
      txt(s,1300,300+i*150,46,K.white,{k:kk,w:800}); });
  },
  // persona sola en escena con objeto. p.persona,p.objeto ('puf','laptop'), p.burbuja (en beat b), p.titulo
  persona(t,lt,sc,p){ const k=pop(t,sc.start,0.45); const x=p.x||W_/2;
    if(p.objeto==='puf') puf(x,800,1.2);
    if(p.titulo) txt(p.titulo,W_/2,170,70,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    persona(x,p.objeto==='puf'?770:860,p.s||1.5,{...(p.persona||{}),t,k});
    if(p.etiquetas) p.etiquetas.forEach(([s,bk,dx,dy],i)=>{ const t0=bk?(sc[bk]??sc.start+0.5):sc.start+0.6+i*0.5; chip(s,x+dx,dy,pop(t,t0,0.35),K.gold,K.ink,36); });
    if(p.burbuja){ const t0=sc.b??sc.start+0.8, kk=pop(t,t0,0.4); if(kk>0){ sv(); at(x+360,330,kk); rr(-300,-90,600,180,40); ctx.fillStyle=K.white; ctx.fill(); ctx.beginPath(); ctx.moveTo(-200,80); ctx.lineTo(-260,150); ctx.lineTo(-140,85); ctx.fill(); rs();
      lineas(p.burbuja,x+360,330-(p.burbuja.length-1)*26,48,K.ink,1.1,{k:kk,w:900}); } }
  },
  // empresas: edificios con etiquetas. p.e:[[label,color,anio]], beat b: transformar en banco (p.banco)
  empresa(t,lt,sc,p){ const E=p.e||[]; E.forEach(([lab,col,anio],i)=>{ const x=E.length===1?W_/2:(i?1350:570); const k=pop(t,sc.start+i*0.3,0.45);
      edificio(x,850,360,470,K[col]||col,lab,k,t); if(anio) chip(anio,x,920,pop(t,sc.start+0.4+i*0.3),K.gold,K.ink,38);
      if(p.trading&&i===0){ for(let j=0;j<5;j++){ const u=((t*0.8+j/5)%1); const up=j%2===0; txt(up?'▲':'▼',x-220+j*110,600-u*240,50,up?K.green:K.red,{w:900,k:k*(1-u)}); } } });
    if(p.banco&&sc.b!=null){ const kk=pop(t,sc.b,0.5); sv(); at(W_/2,370,kk); ctx.fillStyle=K.white; ctx.beginPath(); ctx.moveTo(-240,0); ctx.lineTo(0,-110); ctx.lineTo(240,0); ctx.closePath(); ctx.fill(); rs(); moneda(W_/2,330,60,'₿',K.gold,t,0); }
    if(p.titulo) txt(p.titulo,W_/2,p.tituloY||200,64,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
  },
  // flujo entre dos empresas. p.flujo: 'entra'|'secreto'; beats: b = muro "independientes", c = muro con hueco
  dos(t,lt,sc,p){ const kA=pop(t,sc.start,0.45), kB=pop(t,sc.start+0.25,0.45);
    edificio(520,860,360,420,K.cyan,'FTX',kA,t); edificio(1400,860,360,420,K.violet,'ALAMEDA',kB,t);
    chip(p.subA||'Aquí guardas tu dinero',520,930,pop(t,sc.start+0.5),K.card2,K.white,28); chip(p.subB||'Hace apuestas con cripto',1400,930,pop(t,sc.start+0.7),K.card2,K.white,28);
    // muro
    if(sc.b!=null){ const kw=pop(t,sc.b,0.4); sv(); at(960,860,kw); ctx.fillStyle='#6B7398'; for(let r=0;r<8;r++) for(let c=0;c<2;c++){ if(sc.c!=null&&t>sc.c&&r>=3&&r<=4) continue; rr(-60+c*62+(r%2)*-30+15,-60*(r+1),56,52,8); ctx.fill(); } rs();
      txt('INDEPENDIENTES',960,300,40,K.white,{k:kw,w:900,track:3}); if(sc.c!=null&&t>sc.c) sello('¿SEGURO?',960,240,t,sc.c,K.red,50,0.05); }
    // flujo de monedas
    if(p.flujo){ const t0=p.flujo==='secreto'?(sc.d??sc.c??sc.start+0.8):sc.start+0.8; if(t>t0){ for(let i=0;i<10;i++){ const u=((t-t0)*0.7+i/10)%1;
      if(p.flujo==='entra'){ moneda(lerp(80,460,u),lerp(500,700,u)-Math.sin(u*Math.PI)*120,26,'$',K.gold); }
      else { const x=lerp(620,1300,u), y=600-Math.sin(u*Math.PI)*160*(p.tubo?0:1)+(p.tubo?170:0); moneda(x,y,26,'$',K.gold); } } }
      if(p.tubo){ sv(); ctx.globalAlpha=pop(t,t0,0.4)*0.85; ctx.strokeStyle=rgba(K.red,0.7); ctx.lineWidth=60; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(640,770); ctx.lineTo(1280,770); ctx.stroke(); rs(); } }
    if(p.titulo) txt(p.titulo,W_/2,150,66,K.white,{k:pop(t,sc.start+0.3,0.4),w:900});
    if(p.clientes){ for(let i=0;i<5;i++) persona(80+i*90,860,0.42,{t,k:pop(t,sc.start+0.4+i*0.08),color:[K.green,K.gold,K.cyan,K.orange,K.violet][i],seed:i}); }
  },
  // logos de inversionistas + monedas entrando. p.lista
  inversion(t,lt,sc,p){ edificio(1450,880,360,460,p.edC?K[p.edC]:K.cyan,p.edif||'FTX',pop(t,sc.start,0.45),t); if(p.titulo) txt(p.titulo,W_/2,120,56,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    (p.lista||[]).forEach((s,i)=>{ const kk=pop(t,sc.start+0.4+i*0.45,0.35); card(540,330+i*180,720,130,kk,{bg:K.card2,r:30}); txt(s,540,330+i*180,i===2?38:50,K.white,{k:kk,w:900});
      if(kk>0.9) for(let j=0;j<4;j++){ const u=((t*0.9+j/4+i*0.3)%1); moneda(lerp(920,1290,u),330+i*180+lerp(0,120-i*90,u)-Math.sin(u*Math.PI)*60,20,'$',K.gold); } });
  },
  // patrocinios: p.cual = 'arena'|'uniforme'|'tv'
  patrocinio(t,lt,sc,p){ const k=pop(t,sc.start,0.45);
    if(p.cual==='arena'){ sv(); at(W_/2,820,k); ctx.fillStyle=K.card2; ctx.beginPath(); ctx.ellipse(0,0,620,150,0,Math.PI,0); ctx.lineTo(620,60); ctx.lineTo(-620,60); ctx.closePath(); ctx.fill();
      ctx.fillStyle=mix(K.card2,'#ffffff',0.08); ctx.beginPath(); ctx.ellipse(0,-120,560,200,0,Math.PI,0); ctx.fill(); rr(-420,-300,840,110,24); ctx.fillStyle=K.ink; ctx.fill();
      for(let i=0;i<12;i++){ const a=Math.PI+i/11*Math.PI; ctx.fillStyle=Math.sin(t*6+i)>0?K.gold:mix(K.gold,'#000',0.5); circ(Math.cos(a)*590,Math.sin(a)*170-20,10); ctx.fill(); } rs();
      txt('FTX ARENA',W_/2,820-245,78,K.cyan,{k,w:900,glowC:K.cyan,track:6}); chip('$135 MILLONES · 19 AÑOS',W_/2,240,pop(t,sc.start+0.6),K.gold,K.ink,44); }
    if(p.cual==='uniforme'){ sv(); at(W_/2,600,k); ctx.fillStyle='#E9EBF5'; ctx.beginPath(); ctx.moveTo(-200,-260); ctx.lineTo(-380,-140); ctx.lineTo(-300,-20); ctx.lineTo(-220,-80); ctx.lineTo(-220,300); ctx.lineTo(220,300); ctx.lineTo(220,-80); ctx.lineTo(300,-20); ctx.lineTo(380,-140); ctx.lineTo(200,-260); ctx.quadraticCurveTo(0,-180,-200,-260); ctx.fill();
      ctx.fillStyle='#1B2448'; ctx.fillRect(-220,-40,440,24); rs();
      const kp=pop(t,sc.start+0.6,0.35); sv(); at(W_/2+260,480,kp); circ(0,0,70); ctx.fillStyle=K.ink; ctx.fill(); ctx.strokeStyle=K.cyan; ctx.lineWidth=6; ctx.stroke(); txt('FTX',0,2,44,K.cyan,{w:900}); rs();
      chip('ÁRBITROS DE GRANDES LIGAS',W_/2,170,pop(t,sc.start+0.3),K.card2,K.white,40); }
    if(p.cual==='tv'){ sv(); at(W_/2,520,k); rr(-560,-330,1120,640,40); ctx.fillStyle='#0C1022'; ctx.fill(); rr(-520,-290,1040,560,24); const g=ctx.createLinearGradient(0,-290,0,270); g.addColorStop(0,'#24357A'); g.addColorStop(1,'#101936'); ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle='#0C1022'; ctx.fillRect(-60,310,120,60); ctx.fillRect(-200,360,400,24); rs();
      persona(W_/2-200,780,1.05,{t,k,color:K.orange,expr:'serio',seed:3,label:'El comediante escéptico'});
      txt('SUPER BOWL',W_/2+230,330,58,K.gold,{k:pop(t,sc.start+0.4,0.4),w:900,track:4}); txt('Anuncio de FTX',W_/2+230,410,40,K.white,{k:pop(t,sc.start+0.6,0.4),w:800});
      if(sc.b!=null) txt('“No te lo pierdas”',W_/2+230,560,62,K.cyan,{k:pop(t,sc.b,0.4),w:900,glowC:K.cyan}); }
  },
  // departamento en Bahamas: p.precio
  depto(t,lt,sc,p){ const k=pop(t,sc.start,0.45); sv(); at(W_/2,900,k); ctx.fillStyle='#E9EBF5'; rr(-520,-560,1040,560,20); ctx.fill(); ctx.fillStyle='#BFE9FF'; rr(-480,-520,960,380,14); ctx.fill();
    ctx.fillStyle='#8FD3F4'; ctx.fillRect(-480,-260,960,120); ctx.fillStyle=K.gold; circ(330,-430,50); ctx.fill();
    ctx.fillStyle='#2D7F5E'; for(const px of [-380,380]){ ctx.fillRect(px-10,-300,20,160); for(let j=0;j<5;j++){ ctx.save(); ctx.translate(px,-300); ctx.rotate(-1.2+j*0.6+Math.sin(t+j)*0.05); ctx.beginPath(); ctx.ellipse(60,0,70,18,0,0,Math.PI*2); ctx.fill(); ctx.restore(); } } rs();
    puf(W_/2-120,830,0.7*k); persona(W_/2-120,810,0.7,{t,k,color:K.gold,pelo:'rizos',ropa:'shorts',expr:'dormido',seed:1});
    for(let i=0;i<9;i++) persona(W_/2+60+i*52,850,0.38,{t,k:pop(t,sc.start+0.6+i*0.06),color:[K.cyan,K.green,K.violet,K.orange][i%4],seed:i+4});
    chip('Departamento de $35 millones',W_/2,200,pop(t,sc.start+0.3),K.gold,K.ink,46); chip('Bahamas · 10 personas viviendo ahí',W_/2,290,pop(t,sc.start+0.8),K.card2,K.white,34);
  },
  // barras comparativas. p.items:[[label,frac,color,valor,beat]]
  barras(t,lt,sc,p){ if(p.titulo) txt(p.titulo,W_/2,170,64,K.white,{k:pop(t,sc.start,0.4),w:900});
    (p.items||[]).forEach(([lab,f,col,val,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.4):sc.start+0.4+i*0.5; if(t<t0) return; const u=prog(t,t0,p.lento?1.8:0.9);
      barra(260,380+i*(p.gap||200),1400*f,90,u,K[col]||col,lab,val,{k:pop(t,t0,0.3)}); });
    if(p.desborda&&sc.b!=null&&t>sc.b+1.2){ txt('→ sigue y sigue',1600,820,40,K.red,{k:pop(t,sc.b+1.2,0.3),w:800}); }
  },
  // cita textual. p.cita (líneas), p.quien
  cita(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(W_/2,500,1500,560,k,{bg:K.card}); txt('“',W_/2-640,330,260,K.gold,{k,w:900});
    const L=p.cita||[]; L.forEach((l,i)=>{ const ch=Math.floor(l.length*clamp((t-sc.start-0.4-i*0.9)/0.9)); txt(l.slice(0,Math.max(0,ch)),W_/2,420+i*90,60,K.white,{w:800}); });
    txt('— '+p.quien,W_/2+520,720,40,K.gold,{k:pop(t,sc.start+0.5+L.length*0.8,0.4),w:800,align:'right'}); },
  // pantalla de código con línea en rojo en beat b
  codigo(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(1180,500,1100,700,k,{bg:'#0B1124',border:'#2B3666'});
    for(let i=0;i<14;i++){ const y=200+i*44, w=200+rand(i+(Math.floor(t*2)%3))*600; const red=sc.b!=null&&t>sc.b&&i===7; sv(); ctx.globalAlpha=k;
      ctx.fillStyle=red?rgba(K.red,0.25):'transparent'; if(red) ctx.fillRect(660,y-20,1040,40);
      ctx.fillStyle=red?K.red:[K.cyan,K.violet,K.green,K.muted][i%4]; rr(700+((i*37)%120),y-8,w,16,8); ctx.fill(); rs(); }
    if(sc.b!=null) txt('alameda.saldo = −8,000,000,000',1180,508,40,K.red,{k:pop(t,sc.b,0.3),w:900});
    persona(360,880,1.15,{t,k:pop(t,sc.start+0.2,0.4),color:K.green,pelo:'liso',expr:sc.b!=null&&t>sc.b?'susto':'neutral',seed:2,label:p.quien}); },
  // titular de medio. p.medio,p.fecha,p.lineas, beat b resalta
  titular(t,lt,sc,p){ const k=pop(t,sc.start,0.45); sv(); at(W_/2,540,k,-0.02); ctx.fillStyle='#F3F1EA'; ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=50; rr(-620,-380,1240,760,18); ctx.fill(); noGlow();
    ctx.fillStyle='#16122E'; ctx.font=F(900,64); ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(p.medio,-560,-300); ctx.fillStyle='#777'; ctx.font=F(700,30); ctx.fillText(p.fecha,-560,-235);
    ctx.fillStyle='#16122E'; ctx.fillRect(-560,-200,1120,6);
    (p.lineas||[]).forEach((l,i)=>{ const hl=sc.b!=null&&t>sc.b&&p.resalta===i; if(hl){ ctx.fillStyle=rgba(K.gold,0.8); ctx.fillRect(-570,-150+i*90-36,1140*eo(prog(t,sc.b,0.4)),72);} ctx.fillStyle='#16122E'; ctx.font=F(900,58); ctx.fillText(l,-560,-150+i*90); });
    for(let i=0;i<5;i++){ ctx.fillStyle='#C9C6BD'; rr(-560,140+i*44,i===4?600:1120,18,9); ctx.fill(); } rs();
    if(p.brillo){ sv(); ctx.globalAlpha=0.25+0.15*Math.sin(t*4); glow(K.gold,80); ctx.strokeStyle=K.gold; ctx.lineWidth=8; rr(W_/2-640,160,1280,780,20); ctx.stroke(); rs(); } },
  // composición de activos: barra apilada. p.total, p.parte
  activos(t,lt,sc,p){ txt('Activos de Alameda',W_/2,200,60,K.white,{k:pop(t,sc.start,0.4),w:900});
    const u=eo(prog(t,sc.start+0.3,0.9)); sv(); rr(210,430,1500*u,170,30); ctx.fillStyle=K.cyan; ctx.fill(); rs(); txt('$14,600 millones',W_/2,360,56,K.cyan,{k:pop(t,sc.start+0.4,0.3),w:900});
    if(sc.b!=null){ const u2=eo(prog(t,sc.b,0.8)); sv(); rr(210,430,1500*0.41*u2,170,30); ctx.fillStyle=K.red; glow(K.red,30); ctx.fill(); rs(); txt('casi $6,000 M en FTT',210+300,700,52,K.red,{k:pop(t,sc.b+0.3,0.3),w:900}); if(t>sc.b+0.3) moneda(210+640,700,46*pop(t,sc.b+0.3,0.3),'FTT',K.red,t,0); } },
  // moneda FTT con sello. beat b: sello
  ftt(t,lt,sc,p){ const k=pop(t,sc.start,0.5); moneda(W_/2,500,240*k||1,'FTT',K.cyan,t,1.6); txt('FTT',W_/2,860,70,K.white,{k:pop(t,sc.start+0.3,0.4),w:900,track:8});
    if(sc.b!=null) sello('HECHA POR FTX',W_/2,500,t,sc.b,K.gold,80,-0.1); },
  // bóveda: b abre (vales), c todo se cae
  boveda(t,lt,sc,p){ const ab=sc.b!=null?eo(prog(t,sc.b,0.8)):0; const cae=sc.c!=null?prog(t,sc.c,1.2):0;
    sv(); at(W_/2,560,pop(t,sc.start,0.45)); ctx.fillStyle='#2B3666'; rr(-420,-380,840,760,40); ctx.fill(); ctx.fillStyle='#0B1124'; rr(-360,-320,720,640,30); ctx.fill();
    // vales
    if(ab>0.2) for(let i=0;i<14;i++){ const x=-280+(i%5)*140, y=-220+Math.floor(i/5)*170 + cae*cae*(900+rand(i)*500); sv(); at(x,y,1,(rand(i)-0.5)*0.4+cae*(rand(i+1)-0.5)*3);
      ctx.fillStyle='#F3E9C6'; rr(-60,-40,120,80,8); ctx.fill(); ctx.setLineDash([6,6]); ctx.strokeStyle='#B59A4A'; ctx.lineWidth=3; rr(-52,-32,104,64,6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#8A6D1F'; ctx.font=F(900,24); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('VALE',0,-8); ctx.fillText('FTT',0,18); rs(); }
    // puerta
    sv(); ctx.translate(-360,0); ctx.scale(Math.cos(ab*1.35),1); ctx.fillStyle='#8892B8'; rr(0,-320,720,640,30); ctx.fill(); ctx.strokeStyle='#5D668F'; ctx.lineWidth=14; circ(360,0,150); ctx.stroke();
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+t*0.3; ctx.beginPath(); ctx.moveTo(360,0); ctx.lineTo(360+Math.cos(a)*140,Math.sin(a)*140); ctx.stroke(); } rs(); rs();
    if(p.texto) txt(p.texto,W_/2,120,56,K.white,{k:pop(t,sc.start+0.2,0.4),w:900}); },
  // anuncio de empresa (post genérico). p.autor,p.texto (líneas), b: borrado
  post(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(W_/2,520,1200,520,k,{bg:K.card});
    sv(); at(W_/2,520,k); ctx.fillStyle=p.avatarC?K[p.avatarC]:K.gold; circ(-500,-170,50); ctx.fill(); txt(p.autor,-420,-185,46,K.white,{w:900,align:'left'}); txt(p.handle||'publicación',-420,-135,30,K.muted,{w:700,align:'left'});
    (p.texto||[]).forEach((l,i)=>txt(l,-540,-30+i*80,58,K.white,{w:800,align:'left'})); rs();
    if(sc.b!=null&&t>sc.b){ const u=eo(prog(t,sc.b,0.6)); sv(); ctx.fillStyle=rgba(K.bg0,0.85*u); rr(W_/2-600,260,1200*u,520,28); ctx.fill(); rs(); sello('BORRADO',W_/2,520,t,sc.b+0.4,K.red,100); } },
  // muchos teléfonos. p.n, p.banner, b: banner cambia/aparece, contador p.contador
  telefonos(t,lt,sc,p){ const n=p.n||8; for(let i=0;i<n;i++){ const col=i%4, row=Math.floor(i/4); const x=300+col*440, y=330+row*470; const kk=pop(t,sc.start+i*0.06,0.35);
      const on=sc.b!=null&&t>sc.b+i*0.05; telefono(x,y,0.95,{k:kk,rot:(rand(i)-0.5)*0.12,saldo:on?(p.saldoB||'$ 0.00'):fmt(2000+rand(i)*20000).replace(/^/,'$ '),saldoC:on?(p.saldoC?K[p.saldoC]:K.red):K.white,banner:on?p.banner:null,boton:on?null:'Retirar',botonC:K.cyan}); }
    if(p.contador&&sc.c!=null) { card(W_/2,540,900,240,pop(t,sc.c,0.4),{bg:K.ink,border:K.red}); txt(p.contador,W_/2,540,90,K.red,{k:pop(t,sc.c,0.4),w:900,glowC:K.red}); } },
  // precio que se desploma. p.serie,p.ymax,p.etqs, p.titulo
  precio(t,lt,sc,p){ if(p.titulo) txt(p.titulo,W_/2,140,60,K.white,{k:pop(t,sc.start,0.4),w:900});
    const u=prog(t,sc.start+0.3,p.dur||2.6); const col=p.color?K[p.color]:K.red;
    const et=(p.etqs||[]).map(e=>({...e,k:pop(t,sc.start+0.3+(p.dur||2.6)*e.u,0.35)}));
    grafica(260,900,1400,600,p.serie,u,{ymin:p.ymin||0,ymax:p.ymax,color:col,etiquetas:et}); },
  // trato que se rompe: dos logos + apretón. b: "1 día", c: se rompe
  trato(t,lt,sc,p){ const br=sc.c!=null?eo(prog(t,sc.c,0.5)):0; const k=pop(t,sc.start,0.45);
    card(560-br*120,480,420,240,k,{bg:K.gold,shadow:true}); txt('BINANCE',560-br*120,480,64,K.ink,{k,w:900});
    card(1360+br*120,480,420,240,pop(t,sc.start+0.2,0.45),{bg:K.cyan}); txt('FTX',1360+br*120,480,80,K.ink,{k:pop(t,sc.start+0.2,0.45),w:900});
    txt(br>0?'✕':'+',W_/2,480,140,br>0?K.red:K.white,{k:pop(t,sc.start+0.5,0.4),w:900});
    chip('“Vamos a comprar FTX”',W_/2,760,pop(t,sc.start+0.7),K.card2,K.white,44);
    if(sc.b!=null) sello('DURÓ 1 DÍA',W_/2,240,t,sc.b,K.red,70,-0.04); },
  // mapa Bahamas. p.pin, p.hielo (congelado en beat b), p.avion (b)
  mapa(t,lt,sc,p){ const k=pop(t,sc.start,0.5); sv(); at(W_/2,520,k); ctx.fillStyle='#123A63'; rr(-800,-420,1600,840,40); ctx.fill();
    ctx.fillStyle='#2E8B6A'; for(const [x,y,a,b,r] of [[-120,-60,180,60,0.6],[60,40,120,40,0.3],[-260,80,90,30,-0.2],[220,-120,100,34,0.8],[300,120,60,24,0.2]]){ ctx.beginPath(); ctx.ellipse(x,y,a,b,r,0,Math.PI*2); ctx.fill(); }
    if(p.usa){ ctx.fillStyle='#3B6E54'; ctx.beginPath(); ctx.moveTo(-800,-420); ctx.lineTo(-300,-420); ctx.quadraticCurveTo(-380,-250,-520,-200); ctx.lineTo(-800,-180); ctx.fill(); txt('EE. UU.',-620,-330,44,K.white,{w:900}); } rs();
    txt('BAHAMAS',W_/2,520+260,60,K.white,{k,w:900,track:8});
    const pk=pop(t,sc.start+0.4,0.4); if(pk>0){ sv(); at(W_/2-120,520-140,pk); ctx.fillStyle=K.red; ctx.beginPath(); ctx.arc(0,-40,40,Math.PI,0); ctx.lineTo(0,40); ctx.closePath(); ctx.fill(); ctx.fillStyle=K.white; circ(0,-40,16); ctx.fill(); rs(); }
    if(p.hielo&&sc.b!=null){ const u=eo(prog(t,sc.b,0.6)); sv(); ctx.globalAlpha=0.55*u; ctx.fillStyle='#BFF4FF'; rr(W_/2-500,200,1000,640,60); ctx.fill(); rs(); sello('ACTIVOS CONGELADOS',W_/2,520,t,sc.b+0.3,'#3DB8FF',70,-0.06); }
    if(p.avion&&sc.b!=null){ const u=eio(prog(t,sc.b,2.2)); const x=lerp(W_/2-120,W_/2-700,u), y=lerp(380,180,u)-Math.sin(u*Math.PI)*80; txt('✈',x,y,90,K.white,{w:900}); chip('Arresto · diciembre 2022',W_/2+300,260,pop(t,sc.start+0.6),K.red,K.white,38); } },
  // hackeo: monedas que salen por la noche. p.monto
  robo(t,lt,sc,p){ edificio(560,880,380,480,'#2A3460',p.etiqueta||'FTX',pop(t,sc.start,0.45),t); if(p.quebrada) sello('EN QUIEBRA',560,560,t,sc.start+0.3,K.red,56,-0.1);
    const t0=sc.start+0.4; if(t>t0) for(let i=0;i<16;i++){ const u=((t-t0)*0.6+i/16)%1; moneda(lerp(700,1820,u),lerp(620,240,u)+Math.sin(u*9+i)*30,24,'$',K.gold); }
    const a=Math.sin(t*10)>0; sv(); ctx.globalAlpha=0.25*(a?1:0.3); ctx.fillStyle=K.red; ctx.fillRect(0,0,W_,H_); rs();
    if(p.monto) txt(p.monto,1360,860,110,K.red,{k:pop(t,sc.start+0.6,0.4),w:900,glowC:K.red}); },
  // SIM swap: número pasa de un celular a otro; b: código y candado se abre
  sim(t,lt,sc,p){ const u=eio(prog(t,sc.start+0.6,1.4));
    telefono(520,560,1.1,{k:pop(t,sc.start,0.4),app:'Empleado',saldo:u>0.5?'Sin señal':'+1 ··· 2847',saldoC:u>0.5?K.red:K.white,saldoSize:30});
    persona(1500,880,1.1,{t,k:pop(t,sc.start+0.2,0.4),color:'#3A4470',ropa:'capucha',seed:7,label:'Estafadores'});
    telefono(1200,560,1.1,{k:pop(t,sc.start+0.3,0.4),app:'Celular falso',saldo:u>0.5?'+1 ··· 2847':'—',saldoC:K.gold,saldoSize:30,banner:sc.b!=null&&t>sc.b?'Código:|482 913':null,bannerC:K.violet});
    sv(); const x=lerp(620,1100,u), y=330-Math.sin(u*Math.PI)*140; at(x,y); ctx.fillStyle=K.gold; ctx.beginPath(); ctx.moveTo(-40,-50); ctx.lineTo(20,-50); ctx.lineTo(40,-30); ctx.lineTo(40,50); ctx.lineTo(-40,50); ctx.closePath(); ctx.fill(); ctx.fillStyle='#B58A1E'; rr(-24,-16,48,40,6); ctx.fill(); rs();
    chip('Compañía telefónica engañada',W_/2-90,150,pop(t,sc.start+0.4),K.card2,K.white,36);
    if(sc.c!=null) { candado(860,820,0.8,eo(prog(t,sc.c,0.5))); } },
  // acusados: siluetas
  acusados(t,lt,sc,p){ for(let i=0;i<3;i++) persona(660+i*300,840,1.05,{t,k:pop(t,sc.start+i*0.15,0.4),color:'#3A4470',ropa:'capucha',seed:i});
    chip(p.texto||'3 acusados · enero 2024',W_/2,220,pop(t,sc.start+0.5),K.gold,K.ink,48); },
  // lista con palomas o tachas. p.items:[[texto,ok,beat]]
  lista(t,lt,sc,p){ if(p.titulo) txt(p.titulo,W_/2,170,64,K.white,{k:pop(t,sc.start,0.4),w:900});
    (p.items||[]).forEach(([s,ok,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.4):sc.start+0.4+i*0.6; const kk=pop(t,t0,0.35); card(W_/2,380+i*170,1100,130,kk,{bg:K.card2,r:30});
      txt(s,W_/2-60,380+i*170,48,K.white,{k:kk,w:800}); if(t>t0+0.3) txt(ok?'✓':'✕',W_/2+470,380+i*170,80,ok?K.green:K.red,{k:pop(t,t0+0.3,0.3),w:900}); }); },
  // chat de grupo con emojis (dibujados) y mensajes que se borran (p.borra en beat b)
  chat(t,lt,sc,p){ const k=pop(t,sc.start,0.45); telefono(W_/2,560,2.3,{k,app:'Grupo · Gastos',saldo:'',banner:null});
    const msgs=p.msgs||[]; msgs.forEach(([s,der],i)=>{ const t0=sc.start+0.5+i*0.55; let kk=pop(t,t0,0.3); if(p.borra&&sc.b!=null&&t>sc.b+i*0.25) kk*=1-eo(prog(t,sc.b+i*0.25,0.4));
      if(kk<=0.01) return; const y=330+i*120, x=der?W_/2+90:W_/2-90; sv(); at(x,y,kk); ctx.font=F(800,34); const w=ctx.measureText(s).width+60; rr(-w/2,-40,w,80,30); ctx.fillStyle=der?K.green:K.card2; ctx.fill();
      ctx.fillStyle=der?K.ink:K.white; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s,0,2); rs();
      if(der&&p.likes){ sv(); at(x+(ctx.measureText(s).width/2+70),y+20,kk); circ(0,0,30); ctx.fillStyle=K.gold; ctx.fill(); ctx.fillStyle=K.ink; ctx.font=F(900,30); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('👍'.length>1?'✓':'✓',0,2); rs(); } });
    if(p.borra&&sc.b!=null) { sv(); at(W_/2+330,180,pop(t,sc.b,0.3)); relojArena(0,0,0.45,t); rs(); txt('Mensajes que se borran solos',W_/2,980-90,40,K.gold,{k:pop(t,sc.b,0.3),w:800}); } },
  // juzgado: mazo golpea en beat b + sello
  juicio(t,lt,sc,p){ const k=pop(t,sc.start,0.45); sv(); at(W_/2,0,k); ctx.fillStyle='#5A3E28'; rr(-500,560,1000,300,20); ctx.fill(); ctx.fillStyle='#6B4A2E'; rr(-560,520,1120,60,14); ctx.fill(); rs();
    txt('⚖',W_/2,330,180,K.gold,{k,w:900});
    (p.testigos||[]).forEach(([nom,col,pelo,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.5):sc.start+0.5+i*0.5; persona(i?1560:360,860,1.05,{t,k:pop(t,t0,0.4),color:K[col]||col,pelo,expr:'serio',seed:i+11,label:nom}); });
    const g=sc.b!=null?(t<sc.b?0:Math.min(1,(t-sc.b)/0.08)*(t<sc.b+0.25?1:Math.max(0,1-(t-sc.b-0.25)/0.3))):0; if(p.mazo) mazo(W_/2+260,520,0.9,g);
    if(p.sello&&sc.c!=null) sello(p.sello,W_/2,560,t,sc.c,K.red,96,-0.08); },
  // reloj de horas
  reloj(t,lt,sc,p){ relojArena(W_/2,480,pop(t,sc.start,0.45)*2.2||0.01,t*3); txt(p.texto||'',W_/2,880,72,K.white,{k:pop(t,sc.start+0.3,0.4),w:900}); },
  // destino del dinero: 4 íconos
  destino(t,lt,sc,p){ txt(p.titulo||'¿A dónde fue el dinero?',W_/2,150,60,K.white,{k:pop(t,sc.start,0.4),w:900});
    const I=p.items||[]; I.forEach(([s,ic],i)=>{ const x=300+i*440, t0=(sc[['b','c','d','e'][i]]??sc.start+0.5+i*0.6); const kk=pop(t,t0,0.4); card(x,560,380,380,kk,{bg:K.card2});
      txt(ic,x,500,130,K.gold,{k:kk,w:900}); txt(s,x,680,36,K.white,{k:kk,w:800});
      if(kk>0.9) for(let j=0;j<3;j++){ const u=((t*0.8+j/3+i*0.2)%1); billete(lerp(W_/2,x,u),lerp(220,380,u)-Math.sin(u*Math.PI)*60,0.5,u*3); } }); },
  // cárcel: barras que bajan + años; beat b: monto decomisado
  carcel(t,lt,sc,p){ const u=eo(prog(t,sc.start+0.2,0.6)); txt(p.anios||'25 AÑOS',W_/2,460,200,K.white,{k:pop(t,sc.start,0.4),w:900});
    sv(); ctx.fillStyle='#596288'; for(let i=0;i<9;i++){ rr(140+i*205,-900+u*900,46,1080,23); ctx.fill(); } ctx.fillRect(100,-900+u*900+150,1720,40); rs();
    if(sc.b!=null){ card(W_/2,800,980,170,pop(t,sc.b,0.4),{bg:K.ink,border:K.gold}); txt(p.monto||'',W_/2,800,62,K.gold,{k:pop(t,sc.b,0.4),w:900}); } },
  // comparación de dos montos (bitcoin). p.a=[label,valor,frac], p.b2=[label,valor,frac]
  compara(t,lt,sc,p){ txt(p.titulo||'',W_/2,160,58,K.white,{k:pop(t,sc.start,0.4),w:900});
    const A=p.a, Bv=p.b2; const ua=eo(prog(t,sc.start+0.4,0.9)); const ub=sc.b!=null?eo(prog(t,sc.b,1.2)):0;
    const BY=820,BH=520; sv(); rr(560,BY-BH*A[2]*ua,280,BH*A[2]*ua,24); ctx.fillStyle=K.gold; ctx.fill(); rr(1080,BY-BH*Bv[2]*ub,280,BH*Bv[2]*ub,24); ctx.fillStyle=K.green; glow(K.green,30); ctx.fill(); rs();
    txt(A[0],700,BY+45,36,K.muted,{w:800}); txt(A[1],700,BY-BH*A[2]*ua-50,60,K.gold,{k:ua,w:900});
    txt(Bv[0],1220,BY+45,36,K.muted,{k:pop(t,sc.b??1e9,0.3),w:800}); txt(Bv[1],1220,BY-BH*Bv[2]*ub-50,60,K.green,{k:ub,w:900});
    if(p.btc) moneda(320,520,110,'₿',K.gold,t,1.2); },
  // ======== escenas añadidas para Bybit (reutilizables) ========
  // pantalla de firma tipo billetera. p.dest, p.monto; b: firmado; c: se revela la orden real
  firma(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(W_/2,470,1240,700,k,{bg:'#0E1530',border:'#2B3666'});
    sv(); at(W_/2,470,k); ctx.fillStyle='#1B2448'; rr(-620,-350,1240,90,28); ctx.fill(); ctx.fillRect(-620,-290,1240,30);
    ctx.fillStyle=K.green; circ(-570,-305,12); ctx.fill(); txt(p.url||'app.safe.global',-540,-305,32,K.muted,{w:700,align:'left'});
    txt('Nueva transacción',-560,-200,46,K.white,{w:900,align:'left'});
    txt('Enviar a',-560,-110,32,K.muted,{w:700,align:'left'}); rr(-560,-80,1120,90,20); ctx.fillStyle=K.card2; ctx.fill();
    txt(p.dest||'Billetera de Bybit',-520,-35,42,K.white,{w:800,align:'left'}); txt('✓ verificada',470,-35,32,K.green,{w:800,align:'right'});
    txt('Monto',-560,60,32,K.muted,{w:700,align:'left'}); txt(p.monto||'ETH · fondos propios',-560,110,44,K.white,{w:800,align:'left'}); rs();
    const firmado=sc.b!=null&&t>sc.b; const bk=firmado?pop(t,sc.b,0.3):0;
    sv(); at(W_/2+380,470+230,k); rr(-170,-45,340,90,45); ctx.fillStyle=firmado?K.green:K.cyan; ctx.fill(); txt(firmado?'✓ FIRMADO':'APROBAR',0,2,38,K.ink,{w:900}); rs();
    for(let i=0;i<3;i++) persona(380+i*190,1000,0.55,{t,k:pop(t,sc.start+0.3+i*0.1),color:[K.cyan,K.green,K.violet][i],seed:20+i,expr:firmado?'feliz':'neutral'});
    if(sc.c!=null&&t>sc.c){ const u=eo(prog(t,sc.c,0.6)); const g=t<sc.c+0.4?Math.sin(t*80)*14:0;
      sv(); ctx.globalAlpha=u; at(W_/2+g,470); rr(-600,-250,1200*u,520,24); ctx.fillStyle='rgba(60,8,18,0.96)'; ctx.fill(); ctx.strokeStyle=K.red; ctx.lineWidth=6; ctx.stroke(); rs();
      txt('LO QUE REALMENTE FIRMARON',W_/2,330,44,K.red,{k:pop(t,sc.c+0.3,0.3),w:900,track:3});
      lineas(p.real||['Cambiar las reglas de la billetera','→ el control pasa al atacante'],W_/2,450,54,K.white,1.3,{k:pop(t,sc.c+0.6,0.4),w:900}); }
  },
  // caja fuerte de varias llaves (multifirma). b: llaves entran; c: se abre
  multifirma(t,lt,sc,p){ const k=pop(t,sc.start,0.45); const ab=sc.c!=null?eo(prog(t,sc.c,0.7)):0;
    sv(); at(W_/2,540,k); ctx.fillStyle='#2B3666'; rr(-380,-360,760,720,40); ctx.fill(); ctx.fillStyle='#8892B8'; rr(-340,-320,680,640,30); ctx.fill();
    for(let i=0;i<3;i++){ const x=-200+i*200; ctx.fillStyle='#3B4470'; circ(x,0,56); ctx.fill(); ctx.fillStyle=K.ink; rr(x-10,-20,20,50,6); ctx.fill();
      const t0=(sc.b??sc.start+0.8)+i*0.35; if(t>t0){ const u=eo(prog(t,t0,0.4)); sv(); at(x,lerp(-300,-10,u)); ctx.rotate(ab*Math.PI/2); ctx.fillStyle=[K.cyan,K.green,K.violet][i]; circ(0,-80,34); ctx.fill(); ctx.fillRect(-8,-60,16,70); rs(); } }
    rs(); if(ab>0){ sv(); ctx.globalAlpha=ab*0.6; glow(K.gold,90); ctx.strokeStyle=K.gold; ctx.lineWidth=10; rr(W_/2-380,180,760,720,40); ctx.stroke(); rs(); }
    txt(p.titulo||'Billetera fría',W_/2,110,64,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    chip(p.sub||'Desconectada de internet',300,540,pop(t,sc.start+0.6),K.card2,K.white,34); chip(p.sub2||'Varias firmas para abrir',1620,540,pop(t,(sc.b??sc.start+1)),K.gold,K.ink,34); },
  // laptop: descarga de archivo; b: abre; c: aparece el intruso
  laptop(t,lt,sc,p){ const k=pop(t,sc.start,0.45); sv(); at(W_/2,560,k); ctx.fillStyle='#C9CEE6'; ctx.beginPath(); ctx.moveTo(-560,300); ctx.lineTo(560,300); ctx.lineTo(620,350); ctx.lineTo(-620,350); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#262E52'; rr(-500,-340,1000,640,30); ctx.fill(); ctx.fillStyle='#0B1124'; rr(-470,-310,940,580,18); ctx.fill(); rs();
    const intr=sc.c!=null&&t>sc.c; const ab=sc.b!=null&&t>sc.b;
    if(!ab){ const u=eo(prog(t,sc.start+0.4,1.6)); card(W_/2,520,760,230,k,{bg:K.card2,r:20}); txt('⬇ '+(p.archivo||'simulador-de-inversiones.zip'),W_/2,470,34,K.white,{k,w:800});
      sv(); rr(W_/2-320,540,640,26,13); ctx.fillStyle=K.ink; ctx.fill(); rr(W_/2-320,540,640*u,26,13); ctx.fillStyle=K.cyan; ctx.fill(); rs(); }
    else { const kk=pop(t,sc.b,0.4); grafica(W_/2-380,700,760,330,[[0,0.3],[0.2,0.45],[0.4,0.38],[0.6,0.62],[0.8,0.55],[1,0.8]],eo(prog(t,sc.b,1)),{ymax:1,color:K.green,grosor:7}); txt(p.app||'Simulador de bolsa',W_/2,300,40,K.white,{k:kk,w:900}); }
    if(intr){ const u=pop(t,sc.c,0.5); sv(); ctx.globalAlpha=0.35*u; ctx.fillStyle=K.red; rr(W_/2-470,250,940,580,18); ctx.fill(); rs(); persona(W_/2+300,800,0.9,{t,k:u,color:'#3A4470',ropa:'capucha',seed:9});
      chip(p.alerta||'Los atacantes ya estaban adentro',W_/2,180,u,K.red,K.white,40); }
    if(p.fecha) chip(p.fecha,W_/2-640,170,pop(t,sc.start+0.2),K.gold,K.ink,40); },
  // dos horarios iguales (sigilo). p.filas
  horario(t,lt,sc,p){ txt(p.titulo||'Mismo horario',W_/2,150,64,K.white,{k:pop(t,sc.start,0.4),w:900});
    const F=p.filas||[['Programador',K.green],['Atacantes',K.red]]; F.forEach(([n,c],i)=>{ const y=420+i*260, kk=pop(t,sc.start+0.3+i*0.5,0.4); txt(n,330,y,44,K.white,{k:kk,w:900,align:'right'});
      sv(); ctx.globalAlpha=kk; rr(400,y-40,1200,80,20); ctx.fillStyle=K.card2; ctx.fill(); const u=eo(prog(t,sc.start+0.5+i*0.5,0.8)); rr(400+1200*9/24,y-40,1200*9/24*u,80,20); ctx.fillStyle=c; ctx.fill(); rs();
      ['0','6','12','18','24'].forEach((h,j)=>txt(h+'h',400+j*300,y+70,26,K.muted,{k:kk,w:700})); });
    txt('☀',400+1200*13.5/24,250,70,K.gold,{k:pop(t,sc.start+1.2,0.4),w:900}); },
  // filtro: muchos pasan, uno queda atrapado. b: atrapa
  filtro(t,lt,sc,p){ txt(p.titulo||'El código esperaba a una sola empresa',W_/2,130,56,K.white,{k:pop(t,sc.start,0.4),w:900});
    sv(); ctx.globalAlpha=pop(t,sc.start,0.4); ctx.fillStyle='#2B3666'; rr(900,260,120,600,30); ctx.fill(); rs(); txt('</>',960,560,60,K.cyan,{k:pop(t,sc.start,0.4),w:900});
    const L=['Usuario','Empresa','Fondo','Usuario','Empresa']; for(let i=0;i<L.length;i++){ const u=((t-sc.start)*0.35+i/L.length)%1; const x=lerp(120,1820,u), y=330+i*110; chip(L[i],x,y,1,K.card2,K.white,30); if(x>1060) txt('✓',x+120,y,40,K.green,{w:900}); }
    const tb=sc.b??sc.start+1.5; const u=eo(prog(t,sc.start+0.3,Math.max(0.5,tb-sc.start-0.3))); const x=lerp(200,820,u); const atrap=t>tb;
    chip(p.blanco||'BYBIT',x,860,1,atrap?K.red:K.gold,K.ink,46); if(atrap){ sello(p.sello||'TRAMPA',W_/2,720,t,tb,K.red,80,-0.06); sv(); ctx.globalAlpha=0.2*(Math.sin(t*10)>0?1:0.3); ctx.fillStyle=K.red; ctx.fillRect(0,0,W_,H_); rs(); } },
  // transmisión en vivo con frases. p.persona, p.frases [[texto,beat]]
  directo(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(620,540,860,820,k,{bg:'#0B1124',border:'#2B3666'});
    persona(620,860,1.2,{...(p.persona||{}),t,k}); sv(); at(300,190,k); rr(-90,-30,180,60,30); ctx.fillStyle=K.red; ctx.fill(); txt('● EN VIVO',0,2,28,K.white,{w:900}); rs();
    (p.frases||[]).forEach(([s,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.6+i*0.6):sc.start+0.6+i*0.6; const kk=pop(t,t0,0.35); card(1440,330+i*190,760,150,kk,{bg:K.card2,r:30}); txt(s,1440,330+i*190,44,K.white,{k:kk,w:900}); }); },
  // ramificación: 1 → 42 → miles. b: explota
  ramas(t,lt,sc,p){ const k=pop(t,sc.start,0.4); moneda(220,540,70*k||1,p.sim||'Ξ',K.violet,t,0);
    const u=eo(prog(t,sc.start+0.4,1.2)); for(let i=0;i<42;i++){ const y=120+i*20; sv(); ctx.globalAlpha=0.5*u; ctx.strokeStyle=K.violet; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(290,540); ctx.lineTo(lerp(290,820,u),lerp(540,y,u)); ctx.stroke(); rs(); if(u>0.95){ ctx.fillStyle=K.violet; circ(820,y,7); ctx.fill(); } }
    if(u>0.5) chip('42 billeteras',820,60,pop(t,sc.start+1,0.3),K.violet,K.white,36);
    if(sc.b!=null&&t>sc.b){ const v=eo(prog(t,sc.b,1.4)); for(let i=0;i<600;i++){ const y0=120+(i%42)*20; const x=lerp(830,960+rand(i)*880,v), y=lerp(y0,60+rand(i+7)*900,v); ctx.fillStyle=rgba(K.gold,0.8); circ(x,y,4); ctx.fill(); }
      chip('miles',1400,60,pop(t,sc.b+0.6,0.3),K.gold,K.ink,40); }
    if(p.titulo) txt(p.titulo,W_/2,60,0.1,K.white,{k:0}); },
  // máquina que convierte monedas. p.nombre, p.de, p.a
  convertir(t,lt,sc,p){ const k=pop(t,sc.start,0.45); card(W_/2,520,460,460,k,{bg:K.card2,border:K.cyan,r:40}); txt(p.nombre||'THORChain',W_/2,520,56,K.cyan,{k,w:900});
    for(let i=0;i<8;i++){ const u=((t-sc.start)*0.5+i/8)%1; if(u<0.45) moneda(lerp(120,700,u/0.45),520+Math.sin(i)*120,34,p.de||'Ξ',K.violet,t,0); else if(u>0.55) moneda(lerp(1220,1800,(u-0.55)/0.45),520+Math.cos(i)*120,34,p.a||'₿',K.gold,t,0); }
    chip(p.sub||'No pide identificación',W_/2,870,pop(t,sc.start+0.6),K.gold,K.ink,40); if(p.titulo) txt(p.titulo,W_/2,140,60,K.white,{k:pop(t,sc.start+0.2,0.4),w:900}); },
  // clic final: cursor sobre archivo. b: clic
  clic(t,lt,sc,p){ const k=pop(t,sc.start,0.45); sv(); at(W_/2,520,k); ctx.fillStyle='#E9EBF5'; ctx.beginPath(); ctx.moveTo(-110,-150); ctx.lineTo(60,-150); ctx.lineTo(110,-100); ctx.lineTo(110,150); ctx.lineTo(-110,150); ctx.closePath(); ctx.fill(); ctx.fillStyle='#B8BEDA'; ctx.beginPath(); ctx.moveTo(60,-150); ctx.lineTo(60,-100); ctx.lineTo(110,-100); ctx.fill(); txt('.zip',0,40,56,K.ink,{w:900}); rs();
    const tb=sc.b??sc.start+1; const u=eio(prog(t,sc.start+0.2,Math.max(0.3,tb-sc.start-0.2))); const x=lerp(1500,W_/2+40,u), y=lerp(900,560,u);
    if(t>tb){ const r=eo(prog(t,tb,0.5)); sv(); ctx.globalAlpha=1-r; ctx.strokeStyle=K.gold; ctx.lineWidth=8; circ(W_/2+40,560,40+r*160); ctx.stroke(); rs(); }
    sv(); at(x,y,t>tb&&t<tb+0.15?0.85:1); ctx.fillStyle=K.white; ctx.strokeStyle=K.ink; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,80); ctx.lineTo(20,62); ctx.lineTo(36,96); ctx.lineTo(50,90); ctx.lineTo(34,56); ctx.lineTo(60,56); ctx.closePath(); ctx.fill(); ctx.stroke(); rs();
    if(p.arriba) txt(p.arriba,W_/2,150,80,K.gold,{k:pop(t,sc.start+0.2,0.4),w:900,glowC:K.gold});
    if(p.abajo&&t>tb) txt(p.abajo,W_/2,880,90,K.white,{k:pop(t,tb+0.1,0.4),w:900}); },

  // ======== escenas añadidas para Nvidia (reutilizables) ========
  // restaurante: mesa con personas y tazas. p.n (1-3), p.letrero, p.colores, p.platos (pila que crece), p.chips [[texto,beat]], p.monto (beat b)
  restaurante(t,lt,sc,p){ const k=pop(t,sc.start,0.45); const n=p.n||3; const cols=p.colores||[K.cyan,K.green,K.violet];
    // letrero de neón
    if(p.letrero){ const on=0.75+0.25*(Math.sin(t*7)>-0.6?1:0); sv(); ctx.globalAlpha=k*on; rr(W_/2-330,150,660,110,24); ctx.strokeStyle=K.red; ctx.lineWidth=6; glow(K.red,30); ctx.stroke(); noGlow(); rs();
      txt(p.letrero,W_/2,206,58,K.red,{k:k*on,w:900,glowC:K.red,track:6}); }
    // ventana con noche
    sv(); ctx.globalAlpha=k*0.8; ctx.fillStyle='#0B1430'; rr(260,300,1400,330,30); ctx.fill(); for(let i=0;i<30;i++){ ctx.fillStyle=rgba(K.white,0.3+0.3*Math.sin(t*2+i)); circ(300+rand(i)*1320,330+rand(i+5)*260,2+rand(i+2)*2); ctx.fill(); } rs();
    // asientos y personas
    sv(); ctx.globalAlpha=k; ctx.fillStyle='#8E2B3A'; rr(330,560,1260,140,40); ctx.fill(); rs();
    for(let i=0;i<n;i++){ const x=n===1?W_/2:lerp(620,1300,i/(n-1)); persona(x,830,0.95,{t,k:pop(t,sc.start+0.2+i*0.15,0.4),color:cols[i%cols.length],seed:i+31,expr:p.expr||'neutral',pelo:i===0?'liso':(i===1?'rizos':null)}); }
    // mesa
    sv(); at(W_/2,0,k); ctx.fillStyle='#C9CEE6'; rr(-620,760,1240,46,18); ctx.fill(); ctx.fillStyle='#596288'; ctx.fillRect(-20,806,40,150); rs();
    for(let i=0;i<n;i++){ const x=n===1?W_/2+200:lerp(620,1300,i/(n-1))+90; sv(); at(x,760,k); ctx.fillStyle=K.white; rr(-30,-60,60,60,10); ctx.fill(); ctx.strokeStyle=K.white; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(32,-32,16,-Math.PI/2,Math.PI/2); ctx.stroke();
      for(let j=0;j<2;j++){ const u=((t*0.6+j*0.5+i*0.3)%1); ctx.strokeStyle=rgba(K.white,0.5*(1-u)); ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-8+j*14,-70-u*60); ctx.quadraticCurveTo(6+j*14,-90-u*60,-8+j*14,-110-u*60); ctx.stroke(); } rs(); }
    if(p.platos){ const m=Math.min(9,Math.floor(prog(t,sc.start+0.4,2.5)*9)+1); for(let j=0;j<m;j++){ sv(); at(W_/2-330,760-j*16,k); ctx.fillStyle=j%2?'#E9EBF5':'#D5DAF0'; ctx.beginPath(); ctx.ellipse(0,0,90,14,0,0,Math.PI*2); ctx.fill(); rs(); } }
    (p.chips||[]).forEach(([s,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.8+i*0.6):sc.start+0.8+i*0.6; chip(s,i%2?1500:420,330+Math.floor(i/2)*110,pop(t,t0,0.35),i%2?K.gold:K.card2,i%2?K.ink:K.white,40); });
    if(p.monto&&sc.b!=null){ const kk=pop(t,sc.b,0.4); card(W_/2,440,640,150,kk,{bg:K.ink,border:K.gold}); txt(p.monto,W_/2,440,84,K.gold,{k:kk,w:900,glowC:K.gold}); } },
  // viaje: avión de A a B con arco punteado. p.a, p.b2 (nombres), p.titulo, p.sub (beat b)
  viaje(t,lt,sc,p){ const k=pop(t,sc.start,0.45); const A=[400,640], Bp=[1520,600]; const u=eio(prog(t,sc.start+0.4,p.dur||2.2));
    for(const [x,y,lab,c] of [[A[0],A[1],p.a,K.cyan],[Bp[0],Bp[1],p.b2,K.gold]]){ sv(); at(x,y,k); circ(0,0,26); ctx.fillStyle=c; glow(c,30); ctx.fill(); noGlow(); ctx.strokeStyle=rgba(c,0.5); ctx.lineWidth=4; circ(0,0,26+((t*30)%40)); ctx.stroke(); rs(); txt(lab,x,y+90,60,K.white,{k,w:900}); }
    const pt=v=>[lerp(A[0],Bp[0],v),lerp(A[1],Bp[1],v)-Math.sin(v*Math.PI)*300];
    sv(); ctx.setLineDash([16,16]); ctx.strokeStyle=rgba(K.white,0.5); ctx.lineWidth=5; ctx.beginPath(); for(let i=0;i<=40;i++){ const q=pt(i/40*u); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); } ctx.stroke(); ctx.setLineDash([]); rs();
    if(u>0.01){ const q=pt(u), q2=pt(Math.min(1,u+0.01)); sv(); at(q[0],q[1],1,Math.atan2(q2[1]-q[1],q2[0]-q[0])); ctx.fillStyle=K.white; ctx.beginPath(); ctx.moveTo(50,0); ctx.lineTo(-30,-14); ctx.lineTo(-40,0); ctx.lineTo(-30,14); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-14,-46); ctx.lineTo(-24,-46); ctx.lineTo(-10,0); ctx.lineTo(-24,46); ctx.lineTo(-14,46); ctx.closePath(); ctx.fill(); rs(); }
    if(p.titulo) txt(p.titulo,W_/2,170,66,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    if(p.sub){ const t0=sc.b??sc.start+1.4; chip(p.sub,W_/2,860,pop(t,t0,0.4),p.subC?K[p.subC]:K.gold,K.ink,42); } },
  // formas: curvas contra triángulos. b: sello "ESTÁNDAR" en triángulos; c: tacha en curvas
  formas(t,lt,sc,p){ const kA=pop(t,sc.start,0.45), kB=pop(t,sc.start+0.3,0.45);
    card(560,540,640,560,kA,{bg:K.card}); card(1360,540,640,560,kB,{bg:K.card});
    sv(); at(560,520,kA); ctx.strokeStyle=K.violet; ctx.lineWidth=8; glow(K.violet,20); for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(0,0,200-i*40,130-i*26,Math.sin(t*0.6)*0.3,0,Math.PI*2); ctx.stroke(); } noGlow(); rs();
    sv(); at(1360,520,kB); ctx.strokeStyle=K.cyan; ctx.lineWidth=5; glow(K.cyan,14); const R=200; for(let i=0;i<6;i++){ const a0=i/6*Math.PI*2+t*0.3, a1=(i+1)/6*Math.PI*2+t*0.3; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a0)*R,Math.sin(a0)*R*0.7); ctx.lineTo(Math.cos(a1)*R,Math.sin(a1)*R*0.7); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(Math.cos(a0)*R,Math.sin(a0)*R*0.7); ctx.lineTo(Math.cos(a0+0.5)*R*0.55,Math.sin(a0+0.5)*R*0.39); ctx.lineTo(Math.cos(a1)*R,Math.sin(a1)*R*0.7); ctx.stroke(); } noGlow(); rs();
    txt(p.a||'CURVAS',560,740,52,K.violet,{k:kA,w:900,track:4}); txt(p.b2||'TRIÁNGULOS',1360,740,52,K.cyan,{k:kB,w:900,track:4});
    if(p.etqA) chip(p.etqA,560,320,pop(t,sc.start+0.6),K.card2,K.white,34); if(p.etqB) chip(p.etqB,1360,320,pop(t,sc.start+0.8),K.card2,K.white,34);
    if(sc.b!=null) sello(p.sello||'ESTÁNDAR',1360,520,t,sc.b,K.green,64,-0.08);
    if(sc.c!=null&&t>sc.c){ const u=eo(prog(t,sc.c,0.3)); sv(); ctx.strokeStyle=K.red; ctx.lineWidth=22; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(360,340); ctx.lineTo(lerp(360,760,u),lerp(340,700,u)); ctx.stroke(); if(u>0.5){ const v=(u-0.5)*2; ctx.beginPath(); ctx.moveTo(760,340); ctx.lineTo(lerp(760,360,v),lerp(340,700,v)); ctx.stroke(); } rs(); }
    if(p.titulo) txt(p.titulo,W_/2,150,60,K.white,{k:pop(t,sc.start+0.2,0.4),w:900}); },
  // procesador: chip grande con patas que brillan. p.nombre, p.sub, p.color; b: p.chip2 (etiqueta) ; c: p.chip3
  procesador(t,lt,sc,p){ const k=pop(t,sc.start,0.5); const col=p.color?K[p.color]:K.green; const S=p.s||1;
    sv(); at(W_/2,500,k*S); for(let s=0;s<4;s++){ sv(); ctx.rotate(s*Math.PI/2); for(let i=0;i<9;i++){ const x=-240+i*60; const on=0.5+0.5*Math.sin(t*5-i*0.7+s); ctx.fillStyle=mix('#8892B8',col,on*0.8); rr(x-12,-330,24,70,6); ctx.fill(); } rs(); }
    ctx.fillStyle='#1B2448'; rr(-270,-270,540,540,40); ctx.fill(); ctx.strokeStyle=col; ctx.lineWidth=6; glow(col,30); rr(-230,-230,460,460,26); ctx.stroke(); noGlow();
    ctx.strokeStyle=rgba(col,0.25); ctx.lineWidth=3; for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(-200,i*55); ctx.lineTo(200,i*55); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i*55,-200); ctx.lineTo(i*55,200); ctx.stroke(); }
    const pul=((t*0.9)%1); ctx.fillStyle=rgba(col,0.6*(1-pul)); circ(0,0,40+pul*180); ctx.fill(); rs();
    txt(p.nombre||'',W_/2,500,(p.nombre||'').length>8?70:96,K.white,{k,w:900,glowC:col});
    if(p.sub) txt(p.sub,W_/2,890,46,K.muted,{k:pop(t,sc.start+0.4,0.4),w:800,track:4});
    if(p.chip2&&sc.b!=null) chip(p.chip2,W_/2-560,300,pop(t,sc.b,0.4),K.gold,K.ink,42);
    if(p.chip3&&sc.c!=null) chip(p.chip3,W_/2+560,300,pop(t,sc.c,0.4),p.chip3C?K[p.chip3C]:K.cyan,K.ink,42); },
  // núcleos: CPU (pocos, grandes) contra GPU (muchos, pequeños). b: aparece la GPU; c: la GPU se enciende en ola
  nucleos(t,lt,sc,p){ const kA=pop(t,sc.start,0.45); const tb=sc.b??sc.start+1.2; const kB=pop(t,tb,0.45);
    card(500,520,620,620,kA,{bg:K.card}); sv(); at(500,520,kA); for(let i=0;i<4;i++){ const x=-130+(i%2)*260, y=-130+Math.floor(i/2)*260; const on=0.5+0.5*Math.sin(t*2+i); ctx.fillStyle=mix(K.card2,K.cyan,0.4+on*0.5); rr(x-110,y-110,220,220,24); ctx.fill(); } rs();
    txt(p.a||'CPU',500,880,50,K.cyan,{k:kA,w:900,track:4}); if(p.subA) txt(p.subA,500,160,40,K.white,{k:kA,w:800});
    card(1420,520,620,620,kB,{bg:K.card}); const tc=sc.c??tb+0.8;
    sv(); at(1420,520,kB); for(let r=0;r<20;r++) for(let c=0;c<20;c++){ const x=-270+c*28.4, y=-270+r*28.4; const d=Math.hypot(c-9.5,r-9.5); const on=t>tc?clamp((t-tc)*12-d*0.9):0; const fl=0.6+0.4*Math.sin(t*9+r*1.3+c*0.7);
      ctx.fillStyle=on>0?mix(K.card2,K.green,on*fl):K.card2; rr(x,y,22,22,5); ctx.fill(); } rs();
    txt(p.b2||'GPU',1420,880,50,K.green,{k:kB,w:900,track:4}); if(p.subB) txt(p.subB,1420,160,40,K.white,{k:kB,w:800}); },
  // tarjetas de video: p.n tarjetas con ventiladores; p.titulo, p.etq (chip abajo), b: brillo
  tarjeta(t,lt,sc,p){ const n=p.n||2; const on=sc.b!=null&&t>sc.b?eo(prog(t,sc.b,0.6)):0;
    for(let i=0;i<n;i++){ const y=n===1?520:400+i*260; const k=pop(t,sc.start+i*0.25,0.45); sv(); at(W_/2,y,k);
      ctx.fillStyle='#262E52'; rr(-520,-110,1040,220,26); ctx.fill(); ctx.fillStyle=K.gold; for(let j=0;j<16;j++) ctx.fillRect(-440+j*40,110,24,26);
      for(const fx of [-250,90]){ ctx.fillStyle='#0B1124'; circ(fx,0,88); ctx.fill(); sv(); at(fx,0,1,t*(6+on*14)); ctx.fillStyle='#596288'; for(let b=0;b<7;b++){ ctx.rotate(Math.PI*2/7); ctx.beginPath(); ctx.ellipse(40,0,42,14,0.4,0,Math.PI*2); ctx.fill(); } rs(); }
      ctx.fillStyle=mix('#1B2448',K.green,on*0.6); rr(250,-70,220,140,16); ctx.fill(); if(on>0){ glow(K.green,40*on); ctx.strokeStyle=K.green; ctx.lineWidth=5; rr(-520,-110,1040,220,26); ctx.stroke(); noGlow(); }
      rs(); }
    if(p.titulo) txt(p.titulo,W_/2,150,62,K.white,{k:pop(t,sc.start+0.2,0.4),w:900});
    if(p.etq) chip(p.etq,W_/2,n===1?820:900,pop(t,(sc.c??sc.start+0.9),0.4),K.gold,K.ink,40); },
  // escalera: escalones que suben con valor y fecha. p.items:[[valor,fecha,beat]], p.titulo, p.color
  escalera(t,lt,sc,p){ const I=p.items||[]; const n=I.length; const w=Math.min(380,1560/n); const col=p.color?K[p.color]:K.gold;
    if(p.titulo) txt(p.titulo,W_/2,150,60,K.white,{k:pop(t,sc.start,0.4),w:900});
    let last=-1; I.forEach(([v,f,bk],i)=>{ const t0=bk?(sc[bk]??sc.start+0.4+i*0.5):sc.start+0.4+i*0.5; if(t<t0) return; last=i; const u=eo(prog(t,t0,0.5));
      const x=W_/2-(n*w)/2+i*w, h=100+i*(440/Math.max(1,n-1)); sv(); rr(x+8,880-h*u,w-16,h*u,18); ctx.fillStyle=i===n-1?col:mix(K.card2,col,0.25+0.5*i/n); if(i===n-1) glow(col,30); ctx.fill(); noGlow(); rs();
      txt(v,x+w/2,880-h*u-50,w>300?58:46,i===n-1?col:K.white,{k:pop(t,t0+0.2,0.3),w:900}); txt(f,x+w/2,920,30,K.muted,{k:pop(t,t0+0.2,0.3),w:800}); });
    if(last>=0&&p.bandera){ const x=W_/2-(n*w)/2+last*w+w/2, h=100+last*(440/Math.max(1,n-1)); sv(); at(x,880-h-130); ctx.fillStyle=K.white; ctx.fillRect(-3,-20,6,80); ctx.fillStyle=K.red; ctx.beginPath(); ctx.moveTo(3,-20); ctx.lineTo(60,0); ctx.lineTo(3,20); ctx.fill(); rs(); } },
  // ranking: barras horizontales que se reordenan en beat b. p.items:[[nombre,valor,color]], p.items2 (nuevos valores en b), p.titulo, p.fmt (sufijo)
  ranking(t,lt,sc,p){ if(p.titulo) txt(p.titulo,W_/2,150,60,K.white,{k:pop(t,sc.start,0.4),w:900});
    const A=p.items||[], B2=p.items2||A; const u=sc.b!=null?eo(prog(t,sc.b,0.9)):0; const max=p.max||Math.max(...A.map(a=>a[1]),...B2.map(a=>a[1]));
    const val=i=>lerp(A[i][1],B2[i][1],u); const ordA=[...A.keys()].sort((a,b)=>A[b][1]-A[a][1]), ordB=[...A.keys()].sort((a,b)=>B2[b][1]-B2[a][1]);
    A.forEach(([nom,_,c],i)=>{ const ra=ordA.indexOf(i), rb=ordB.indexOf(i); const r=lerp(ra,rb,u); const y=330+r*170; const k=pop(t,sc.start+0.3+ra*0.15,0.4); const g=eo(prog(t,sc.start+0.3+ra*0.15,0.8));
      txt(nom,420,y,44,K.white,{k,w:900,align:'right'}); sv(); ctx.globalAlpha=k; rr(460,y-45,1100*val(i)/max*g,90,24); ctx.fillStyle=K[c]||c; ctx.fill(); rs();
      txt((p.pre||'$')+val(i).toFixed(p.dec??2)+(p.suf||' B'),470+1100*val(i)/max*g+20,y,42,K.white,{k,w:900,align:'left'});
      const top=(u<0.5?ra:rb)===0; if(top&&k>0.5){ sv(); at(470+1100*val(i)/max*g+(p.coronaDx||290),y-10,0.55); ctx.fillStyle=K.gold; glow(K.gold,30); ctx.beginPath(); ctx.moveTo(-90,40); ctx.lineTo(-110,-40); ctx.lineTo(-50,0); ctx.lineTo(0,-60); ctx.lineTo(50,0); ctx.lineTo(110,-40); ctx.lineTo(90,40); ctx.closePath(); ctx.fill(); rs(); } });
    if(p.nota&&sc.b!=null) chip(p.nota,W_/2,880,pop(t,sc.b+0.5,0.4),K.card2,K.white,36); },

  // final / suscripción
  final(t,lt,sc,p){ txt(p.l1||'',W_/2,420,80,K.white,{k:pop(t,sc.start,0.4),w:900}); txt(p.l2||'',W_/2,540,56,K.gold,{k:pop(t,sc.start+0.4,0.4),w:800});
    chip(p.cta||'SUSCRÍBETE',W_/2,720,pop(t,sc.start+0.8),K.red,K.white,48); },
};

async function init(tl){ TL=tl; WD=tl.words; SC=tl.scenes; window.CAPS=tl.caps||[]; buildChunks(); await document.fonts.load('900 96px Inter'); await document.fonts.load('800 50px Inter'); return 'Inter'; }
function frame(t){ render(t); return C.toDataURL('image/jpeg',0.9); }
