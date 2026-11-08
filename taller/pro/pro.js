/* Motor "Pro" de Mundo Raaro — videos verticales 1080x1920, 30 fps.
 * Estilo: editorial y limpio. Fondo oscuro, UN color de acento por video, tipografía Inter Display grande,
 * una sola idea gráfica por escena, movimiento suave (sin rebotes infantiles), subtítulos limpios sin caja.
 * Uso: init(tl) y frame(t). Escenas en ESC[tipo](t, lt, sc, p). Beats sc.b, sc.c, sc.d (segundos absolutos).
 */
const C = document.getElementById('c'), ctx = C.getContext('2d');
const W_ = 1080, H_ = 1920;
let TL = null, WD = [], SC = [], CH = [];
const K = { bg:'#0A0B10', bg2:'#14161F', white:'#F4F5F8', gray:'#9AA0AE', dim:'#5B6170', line:'rgba(255,255,255,0.10)', card:'#161924', brand:'#D7FF3D' };
let A = '#FFB547';            // acento del video (lo fija TL.acento)
const F = (w,s)=>`${w} ${Math.round(s)}px "Inter Display", Inter, sans-serif`;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,u)=>a+(b-a)*u;
const eo=u=>1-Math.pow(1-clamp(u),3);
const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const prog=(t,t0,d)=>clamp((t-t0)/d);
const ap=(t,t0,d=.45)=>eo(prog(t,t0,d));            // aparición suave 0→1
function rand(s){let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function hexRgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function rgba(h,a){const [r,g,b]=hexRgb(h);return `rgba(${r},${g},${b},${a})`;}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function sv(){ctx.save();} function rs(){ctx.restore();}
const B=(sc,k,def)=>sc[k]!=null?sc[k]:sc.start+def;

// texto con aparición (sube 30px + fade)
function txt(s,x,y,size,color=K.white,{w=800,align='center',base='alphabetic',k=1,track=0,maxW=0}={}){
  if(k<=0.001) return; sv(); ctx.globalAlpha*=clamp(k); ctx.translate(0,(1-k)*30);
  ctx.font=F(w,size); ctx.textAlign=align; ctx.textBaseline=base; if(track) ctx.letterSpacing=track+'px';
  let sz=size; if(maxW){ while(ctx.measureText(s).width>maxW&&sz>20){ sz-=2; ctx.font=F(w,sz);} }
  ctx.fillStyle=color; ctx.fillText(s,x,y); rs(); }
function kicker(s,x,y,k=1,color=A,align='left'){ if(k<=0.001)return; sv(); ctx.globalAlpha=clamp(k);
  ctx.font=F(700,30); ctx.letterSpacing='6px'; ctx.textAlign=align; ctx.textBaseline='middle';
  const w=ctx.measureText(s).width; const x0=align==='left'?x:(align==='center'?x-w/2:x-w);
  ctx.fillStyle=color; ctx.fillRect(x0,y+26,lerp(0,Math.min(w,90),eo(k)),4);
  ctx.fillText(s,x,y); rs(); }
function fmtNum(v,dec=0){ return Number(v).toLocaleString('es-MX',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }

// ---------- fondo ----------
let NOISE=null;
function mkNoise(){ NOISE=document.createElement('canvas'); NOISE.width=NOISE.height=256; const n=NOISE.getContext('2d'); const im=n.createImageData(256,256);
  for(let i=0;i<im.data.length;i+=4){ const v=Math.random()*255; im.data[i]=im.data[i+1]=im.data[i+2]=v; im.data[i+3]=255; } n.putImageData(im,0,0); }
function fondo(t,glowY=0.32,glowA=0.20){
  ctx.fillStyle=K.bg; ctx.fillRect(0,0,W_,H_);
  const g=ctx.createRadialGradient(W_/2,H_*glowY,0,W_/2,H_*glowY,1100); g.addColorStop(0,rgba(A,glowA)); g.addColorStop(0.55,rgba(A,glowA*0.25)); g.addColorStop(1,rgba(A,0));
  ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_);
  const v=ctx.createLinearGradient(0,H_*0.62,0,H_); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.55)'); ctx.fillStyle=v; ctx.fillRect(0,0,W_,H_);
}
function grano(t){ if(!NOISE) mkNoise(); sv(); ctx.globalAlpha=0.045; ctx.globalCompositeOperation='overlay';
  const ox=Math.floor(rand(Math.floor(t*12))*256), oy=Math.floor(rand(Math.floor(t*12)+5)*256);
  for(let x=-ox;x<W_;x+=256) for(let y=-oy;y<H_;y+=256) ctx.drawImage(NOISE,x,y); rs(); }

// ---------- marca y progreso ----------
function marca(t){ sv(); ctx.globalAlpha=0.9; ctx.fillStyle=K.brand; circ(98,232,9); ctx.fill();
  ctx.font=F(800,26); ctx.letterSpacing='5px'; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillStyle=K.white; ctx.fillText('MUNDO RAARO',122,233); rs();
  ctx.fillStyle='rgba(255,255,255,0.10)'; ctx.fillRect(90,262,W_-180,3); ctx.fillStyle=A; ctx.fillRect(90,262,(W_-180)*clamp(t/TL.duration),3); }

// ---------- subtítulos ----------
let KEY=new Set();
function buildChunks(){ CH=[]; let cur=[];
  WD.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>WD[j].t).join(' ').length; const fin=/[.,?!:…;]$/.test(w.t);
    if(fin||cur.length>=3||len>16){ CH.push(cur); cur=[]; } }); if(cur.length) CH.push(cur); }
const norm=s=>s.toLowerCase().replace(/[.,;:¿?¡!"…“”()]/g,'');
function esClave(w){ const n=norm(w); return KEY.has(n)||/\d/.test(n); }
function captions(t){
  let ci=-1; for(let c=0;c<CH.length;c++) if(WD[CH[c][0]].s-0.05<=t) ci=c; if(ci<0) return;
  const ch=CH[ci], last=WD[ch[ch.length-1]]; const nx=CH[ci+1]; const fin=nx?Math.min(WD[nx[0]].s-0.05,last.e+0.6):last.e+0.6; if(t>fin) return;
  const words=ch.map(i=>WD[i].t); const size=74; ctx.font=F(900,size); const sp=ctx.measureText(' ').width;
  const ws=words.map(w=>ctx.measureText(w).width); const tot=ws.reduce((a,b)=>a+b,0)+sp*(words.length-1);
  const k=ap(t,WD[ch[0]].s-0.05,0.16); const y=1260+(1-k)*14;
  let x=W_/2-tot/2; sv(); ctx.globalAlpha=k; ctx.textBaseline='middle'; ctx.textAlign='left';
  ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=24; ctx.shadowOffsetY=4;
  ch.forEach((i,n)=>{ const on=t>=WD[i].s-0.03; ctx.font=F(900,size);
    ctx.fillStyle=esClave(words[n])?A:(on?K.white:'rgba(244,245,248,0.55)'); ctx.fillText(words[n],x,y); x+=ws[n]+sp; }); rs(); }

// ---------- ilustraciones simples (planas, líneas limpias) ----------
function hojaPapel(x,y,w,h,k=1,rot=0){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); ctx.translate(x,y); ctx.rotate(rot);
  ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=40; ctx.shadowOffsetY=18; ctx.fillStyle='#F2F1EC'; rr(-w/2,-h/2,w,h,8); ctx.fill(); ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  ctx.strokeStyle='rgba(60,80,120,0.18)'; ctx.lineWidth=2; for(let i=1;i<14;i++){ const yy=-h/2+i*h/14; ctx.beginPath(); ctx.moveTo(-w/2+30,yy); ctx.lineTo(w/2-24,yy); ctx.stroke(); }
  ctx.strokeStyle='rgba(220,80,80,0.35)'; ctx.beginPath(); ctx.moveTo(-w/2+60,-h/2); ctx.lineTo(-w/2+60,h/2); ctx.stroke(); rs(); }
function luna(x,y,r,k=1){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); const g=ctx.createRadialGradient(x-r*0.35,y-r*0.35,r*0.1,x,y,r); g.addColorStop(0,'#E9E7E0'); g.addColorStop(1,'#8E8C86');
  ctx.shadowColor='rgba(233,231,224,0.35)'; ctx.shadowBlur=60; ctx.fillStyle=g; circ(x,y,r); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(90,88,82,0.35)'; [[-.3,-.2,.18],[.25,.1,.12],[-.05,.35,.1],[.35,-.35,.07]].forEach(([a,b,c])=>{circ(x+a*r,y+b*r,c*r);ctx.fill();}); rs(); }
function tierra(x,y,r,k=1){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); const g=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r); g.addColorStop(0,'#5BA8FF'); g.addColorStop(1,'#123A7A');
  ctx.fillStyle=g; circ(x,y,r); ctx.fill(); ctx.save(); circ(x,y,r); ctx.clip(); ctx.fillStyle='rgba(120,200,140,0.75)';
  [[-.3,-.1,.35,.22],[.3,.25,.28,.18],[.1,-.45,.2,.12]].forEach(([a,b,c,d])=>{ctx.beginPath();ctx.ellipse(x+a*r,y+b*r,c*r,d*r,0.4,0,Math.PI*2);ctx.fill();}); ctx.restore();
  ctx.strokeStyle='rgba(140,200,255,0.35)'; ctx.lineWidth=r*0.06; circ(x,y,r*1.04); ctx.stroke(); rs(); }
function estrellas(t,n=140,zoom=1,alpha=1){ sv(); for(let i=0;i<n;i++){ const x=(rand(i)*1.6-0.3)*W_, y=(rand(i+50)*1.3-0.15)*H_;
  const cx=W_/2+(x-W_/2)*zoom, cy=H_*0.42+(y-H_*0.42)*zoom; ctx.globalAlpha=alpha*(0.25+0.6*rand(i+9))*(0.7+0.3*Math.sin(t*2+i));
  ctx.fillStyle=i%9?K.white:A; circ(cx,cy,1+rand(i+3)*2.2); ctx.fill(); } rs(); }
function edificio(x,base,w,h,k=1){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); const hh=h*eo(k);
  ctx.fillStyle='#2A2F3D'; ctx.fillRect(x-w/2,base-hh,w,hh); ctx.fillStyle='rgba(255,214,140,0.55)';
  const cols=4, rows=Math.floor(hh/34); for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(rand(r*7+c)>0.35) ctx.fillRect(x-w/2+16+c*(w-32)/cols,base-hh+14+r*34,(w-32)/cols-12,16); rs(); }
function cuaderno(x,y,w,h,k=1){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); ctx.fillStyle='#3B4256'; rr(x-w/2,y-h/2,w,h,10); ctx.fill();
  ctx.fillStyle='#F2F1EC'; ctx.fillRect(x-w/2+10,y-h/2+8,w-20,h-16); for(let i=0;i<6;i++){ ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(x-w/2+10,y-h/2+14+i*((h-24)/6),w-20,2);} rs(); }

// ---------- motor ----------
function escenaEn(t){ let si=0; for(let i=0;i<SC.length;i++) if(t>=SC[i].start) si=i; return si; }
function dibujaEscena(si,t){ const sc=SC[si], lt=t-sc.start; const p=sc.p||{};
  const u=clamp(lt/Math.max(sc.end-sc.start,0.5)); const z=lerp(1,1.035,eio(u));
  sv(); ctx.translate(W_/2,H_*0.42); ctx.scale(z,z); ctx.translate(-W_/2,-H_*0.42); (ESC[sc.tipo]||ESC.titulo)(t,lt,sc,p); rs(); }
function render(t){
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.letterSpacing='0px';
  const si=escenaEn(t), sc=SC[si], lt=t-sc.start; const p=sc.p||{};
  fondo(t,p.glowY||0.32,p.glowA??0.20);
  const TR=0.22;
  if(si>0&&lt<TR){ const u=eio(lt/TR); sv(); ctx.globalAlpha=1-u; dibujaEscena(si-1,t); rs(); sv(); ctx.globalAlpha=u; ctx.translate(0,(1-u)*40); dibujaEscena(si,t); rs(); }
  else dibujaEscena(si,t);
  marca(t); captions(t); grano(t);
}

// =====================================================================
// ESCENAS
// =====================================================================
const ESC={
  // titular editorial. p.kick, p.l (líneas), p.hi (índice de línea en acento), p.sub (en beat b)
  titulo(t,lt,sc,p){ const L=p.l||[]; const size=p.size||118; const y0=p.y||840-(L.length-1)*size*0.55;
    if(p.kick) kicker(p.kick,90,y0-size-30,p.ya?1:ap(t,sc.start,0.4));
    L.forEach((l,i)=>{ const t0=(p.lb&&p.lb[i])?B(sc,p.lb[i],0.08+i*0.12):sc.start+0.08+i*0.12; const kk=(p.ya&&!(p.lb&&p.lb[i]))?1:ap(t,t0,0.5); txt(l,90,y0+i*size*1.04,size,i===p.hi?A:K.white,{w:900,align:'left',k:kk,maxW:900}); });
    if(p.sub) txt(p.sub,90,y0+L.length*size*1.04+30,48,K.gray,{w:600,align:'left',k:ap(t,B(sc,'b',0.6),0.5),maxW:900});
    if(p.hoja) hojaPapel(820,y0-size*2.2,200,270,ap(t,sc.start+0.2,0.6),0.12+Math.sin(t*0.8)*0.02);
    if(p.luna) luna(860,y0-size*2.3,120,p.ya?1:ap(t,sc.start+0.2,0.7));
  },
  // cifra gigante con contador. p.kick, p.de, p.a, p.dec, p.suf (unidad grande), p.unidad (debajo), p.dur, p.sub (beat b)
  cifra(t,lt,sc,p){ const k=ap(t,sc.start,0.4); if(p.kick) kicker(p.kick,W_/2,620,k,A,'center');
    const v=lerp(p.de||0,p.a,eio(prog(t,sc.start+0.1,p.dur||1.2)));
    txt(fmtNum(v,p.dec||0)+(p.suf||''),W_/2,880,p.size||230,K.white,{w:900,k,maxW:960});
    if(p.unidad) txt(p.unidad,W_/2,980,62,A,{w:800,k:ap(t,sc.start+0.25,0.4),track:2});
    if(p.sub) txt(p.sub,W_/2,1080,44,K.gray,{w:600,k:ap(t,B(sc,'b',0.8),0.45),maxW:900});
  },
  // la hoja se dobla: capas que se duplican. p.n (dobleces a mostrar, ≤6), beats b,c,d… cada doblez
  doblar(t,lt,sc,p){ const n=p.n||5; const beats=['b','c','d','e','f','g']; let hechos=0;
    for(let i=0;i<n;i++){ const tb=sc[beats[i]]!=null?sc[beats[i]]:sc.start+0.5+i*0.45; if(t>=tb) hechos=i+1; }
    const capas=Math.pow(2,hechos); const k=ap(t,sc.start,0.4);
    kicker('CADA DOBLEZ = EL DOBLE',W_/2,500,k,A,'center');
    const base=1120, ancho=560, alto=Math.min(460,28*capas); sv(); ctx.globalAlpha=k;
    for(let i=0;i<Math.min(capas,64);i++){ const y=base-(i+1)*(alto/Math.min(capas,64)); ctx.fillStyle=i%2?'#E6E4DD':'#F2F1EC'; ctx.fillRect(W_/2-ancho/2,y,ancho,Math.max(1.5,alto/Math.min(capas,64)-1)); }
    rs(); txt('×'+fmtNum(capas),W_/2,base-alto-50,96,A,{w:900,k}); txt(hechos+' '+(hechos===1?'doblez':'dobleces'),W_/2,590,46,K.gray,{w:700,k});
  },
  // hito de altura: columna de papel + objeto de referencia. p.n (dobleces), p.valor, p.unidad, p.ref, p.alt (0..1)
  hito(t,lt,sc,p){ const k=ap(t,sc.start,0.45); const top=440, base=1160; const alt=(p.alt||0.6)*eo(prog(t,sc.start+0.1,0.9));
    // regla
    sv(); ctx.globalAlpha=0.5*k; ctx.strokeStyle=K.line; ctx.lineWidth=2; for(let i=0;i<=10;i++){ const y=base-(base-top)*i/10; ctx.beginPath(); ctx.moveTo(150,y); ctx.lineTo(i%5?180:200,y); ctx.stroke(); } rs();
    // columna de papel (gradiente del acento)
    const h=(base-top)*alt; sv(); ctx.globalAlpha=k; const g=ctx.createLinearGradient(0,base,0,base-h); g.addColorStop(0,'#F2F1EC'); g.addColorStop(1,A);
    ctx.fillStyle=g; rr(230,base-h,70,h,6); ctx.fill(); ctx.shadowColor=rgba(A,0.6); ctx.shadowBlur=30; ctx.fillStyle=A; ctx.fillRect(230,base-h-3,70,6); rs();
    // referencia
    const kr=ap(t,sc.start+0.35,0.6);
    if(p.ref==='cuaderno') cuaderno(450,base-60,240,120,kr);
    if(p.ref==='edificio') edificio(470,base,170,(base-top)*0.9,kr);
    if(p.ref==='espacio'){ sv(); ctx.globalAlpha=kr; const y=base-(base-top)*0.82; ctx.setLineDash([14,12]); ctx.strokeStyle=rgba(A,0.8); ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(150,y); ctx.lineTo(W_-90,y); ctx.stroke(); ctx.setLineDash([]);
      ctx.font=F(700,30); ctx.fillStyle=K.gray; ctx.textAlign='right'; ctx.fillText('Límite del espacio · 100 km',W_-90,y-18); rs(); estrellas(t,60,1,kr*0.6); }
    if(p.ref==='luna'){ luna(470,top+60,95,kr); sv(); ctx.globalAlpha=kr; ctx.font=F(700,30); ctx.fillStyle=K.gray; ctx.textAlign='left'; ctx.fillText('La Luna está a 384,400 km',350,top+200); rs(); }
    // datos
    const kd=ap(t,sc.start+0.15,0.5); kicker((p.n)+' DOBLECES',600,p.ref==='luna'?700:660,kd,A,'left');
    txt(p.valor,600,800,p.size||132,K.white,{w:900,align:'left',k:kd,maxW:400});
    if(p.unidad) txt(p.unidad,600,870,46,K.gray,{w:700,align:'left',k:ap(t,sc.start+0.3,0.5),maxW:400});
  },
  // mito vs. realidad: número tachado → número nuevo. p.kick, p.viejo, p.nuevo, p.nota ; beat b = tacha, c = nuevo
  mito(t,lt,sc,p){ const k=ap(t,sc.start,0.4); kicker(p.kick||'EL LÍMITE',W_/2,520,k,A,'center');
    const tb=B(sc,'b',0.8), tc=B(sc,'c',1.6); const ku=eo(prog(t,tb,0.35));
    txt(p.viejo,W_/2-(p.nuevo&&t>=tc?220:0)*eo(prog(t,tc,0.5)),860,300,t>=tb?K.dim:K.white,{w:900,k});
    if(t>=tb){ sv(); const cx=W_/2-(p.nuevo&&t>=tc?220:0)*eo(prog(t,tc,0.5)); ctx.strokeStyle='#FF5A5A'; ctx.lineWidth=16; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(cx-120,830); ctx.lineTo(cx-120+240*ku,830-170*ku); ctx.stroke(); rs(); }
    if(p.nuevo&&t>=tc){ const kn=ap(t,tc,0.5); txt('→',W_/2,830,90,K.gray,{w:700,k:kn}); txt(p.nuevo,W_/2+220,860,300,A,{w:900,k:kn}); }
    if(p.nota) txt(p.nota,W_/2,1020,46,K.gray,{w:600,k:ap(t,B(sc,'d',2.2),0.5),maxW:900});
  },
  // ficha (persona real SIN dibujarla): nombre, año, logro. p.kick, p.nombre, p.lineas [[texto,beat]]
  ficha(t,lt,sc,p){ const k=ap(t,sc.start,0.45); sv(); ctx.globalAlpha=k; ctx.translate(0,(1-k)*40);
    ctx.fillStyle=K.card; rr(90,480,W_-180,560,32); ctx.fill(); ctx.strokeStyle=K.line; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle=A; ctx.fillRect(90,520,8,90); rs();
    kicker(p.kick||'RÉCORD',140,560,k,A,'left'); txt(p.nombre,140,680,82,K.white,{w:900,align:'left',k:ap(t,sc.start+0.1,0.5),maxW:800});
    (p.lineas||[]).forEach(([s,bk],i)=>{ const kk=ap(t,B(sc,bk||'x',0.5+i*0.5),0.45); sv(); ctx.globalAlpha=kk; ctx.fillStyle=K.line; ctx.fillRect(140,742+i*110,W_-280,2); rs();
      txt(s,140,810+i*110,52,i===0?A:K.white,{w:i===0?800:600,align:'left',k:kk,maxW:800}); });
  },
  // rollo de papel que se estira (longitud). p.kick, p.valor, p.sub
  rollo(t,lt,sc,p){ const k=ap(t,sc.start,0.4); kicker(p.kick||'EL PAPEL',W_/2,520,k,A,'center');
    const u=eo(prog(t,sc.start+0.2,1.4)); sv(); ctx.globalAlpha=k; ctx.fillStyle='#F2F1EC'; ctx.fillRect(160,820,(W_-320)*u,46);
    ctx.fillStyle='#D9D7D0'; circ(160,843,70); ctx.fill(); ctx.fillStyle='#B9B7B0'; circ(160,843,28); ctx.fill(); rs();
    txt(p.valor,W_/2,760,140,K.white,{w:900,k:ap(t,sc.start+0.3,0.5)}); if(p.sub) txt(p.sub,W_/2,980,46,K.gray,{w:600,k:ap(t,B(sc,'b',0.9),0.5),maxW:900});
  },
  // el universo: zoom hacia afuera. p.n, p.l
  universo(t,lt,sc,p){ const u=eio(prog(t,sc.start,Math.max(1.5,sc.end-sc.start))); const zoom=lerp(2.2,0.7,u);
    estrellas(t,220,zoom,1); sv(); ctx.globalAlpha=ap(t,sc.start,0.6); ctx.strokeStyle=rgba(A,0.7); ctx.lineWidth=3; ctx.setLineDash([10,10]); circ(W_/2,H_*0.42,lerp(900,330,u)); ctx.stroke(); ctx.setLineDash([]); rs();
    kicker((p.n||103)+' DOBLECES',W_/2,560,ap(t,sc.start+0.2,0.4),A,'center');
    txt(p.l||'Más grande que el universo',W_/2,820,86,K.white,{w:900,k:ap(t,sc.start+0.4,0.5),maxW:900});
    if(p.sub) txt(p.sub,W_/2,900,46,K.gray,{w:600,k:ap(t,B(sc,'b',1),0.5),maxW:900});
  },
  // pregunta final / cierre que conecta con el inicio. p.l (líneas), p.hoja, p.luna
  pregunta(t,lt,sc,p){ ESC.titulo(t,lt,sc,{...p,kick:p.kick||'¿Y TÚ?'}); }
};

// ---------- inicio ----------
function init(tl){ TL=tl; WD=tl.words; SC=tl.scenes; if(tl.acento) A=tl.acento; (tl.claves||[]).forEach(w=>KEY.add(norm(w))); buildChunks(); }
function frame(t){ render(t); return C.toDataURL('image/jpeg',0.9); }
