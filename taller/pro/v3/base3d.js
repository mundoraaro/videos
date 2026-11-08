// Utilidades comunes para las opciones 3D: tiempos de palabras, subtítulos, texto con volumen, personaje y piezas 3D.
let TL=null, WD=[], S={};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)); const lerp=(a,b,u)=>a+(b-a)*u; const L3=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const eo=u=>1-Math.pow(1-clamp(u),3); const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back=u=>{u=clamp(u);const c1=1.6,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
const pr=(t,t0,d)=>clamp((t-t0)/d); const ap=(t,t0,d=.4)=>eo(pr(t,t0,d));
function rand(s){let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
const F=(w,s,fam='"Inter Display", Inter, sans-serif')=>`${w} ${Math.round(s)}px ${fam}`;
function T(q,n=1,exact=false){ let c=0; const nq=q.toLowerCase(); for(const w of WD){ const ww=w.t.toLowerCase().replace(/[¡¿!?.,…]/g,''); if(exact?ww===nq:ww.startsWith(nq)){ c++; if(c===n) return w.s; } } return 0; }
function chunks(maxW=3,maxL=15){ const CH=[]; let cur=[]; WD.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>WD[j].t).join(' ').length; if(/[.,?!:…;]$/.test(w.t)||cur.length>=maxW||len>maxL){ CH.push(cur); cur=[]; } }); if(cur.length) CH.push(cur); return CH; }
function chunkEn(CH,t){ let ci=-1; for(let c=0;c<CH.length;c++) if(WD[CH[c][0]].s-0.05<=t) ci=c; if(ci<0) return null; const ch=CH[ci], last=WD[ch[ch.length-1]]; const nx=CH[ci+1]; const fin=nx?Math.min(WD[nx[0]].s-0.04,last.e+0.5):last.e+0.6; if(t>fin) return null; return {ch,t0:WD[ch[0]].s}; }
const clave=w=>/\d|luna|doble|edificio|milímetro|papel/i.test(w);
// texto con volumen (extrusión en capas) — números y titulares "3D"
function texto3d(s,x,y,size,k,{cara='#FFFFFF',lado='#9A6B1F',prof=14,rot=0,fam,peso=900,sombra=true}={}){ if(k<=0)return; ctx.save(); ctx.globalAlpha=clamp(k*1.5); ctx.translate(x,y); ctx.rotate(rot); const sc=back(k); ctx.scale(sc,sc);
  ctx.font=F(peso,size,fam); ctx.textAlign='center'; ctx.textBaseline='middle'; if(sombra){ ctx.shadowColor='rgba(0,0,0,0.55)'; ctx.shadowBlur=30; ctx.shadowOffsetY=prof+10; }
  for(let i=prof;i>0;i--){ ctx.fillStyle=lado; ctx.fillText(s,0,i); if(i===prof) ctx.shadowColor='transparent'; }
  const g=ctx.createLinearGradient(0,-size/2,0,size/2); g.addColorStop(0,cara); g.addColorStop(1,shade(cara,0.82)); ctx.fillStyle=g; ctx.fillText(s,0,0); ctx.restore(); }
function shade(h,f){ h=h.replace('#',''); const v=[0,2,4].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*f)); return `rgb(${v.join(',')})`; }
// subtítulos con rebote por palabra
function subs(CH,t,{y=1380,size=84,col='#fff',key='#FFD45C',caja=null}={}){ const c=chunkEn(CH,t); if(!c) return; const ws=c.ch.map(i=>WD[i].t); ctx.font=F(900,size); const sp=ctx.measureText(' ').width; const wd=ws.map(w=>ctx.measureText(w).width); const tot=wd.reduce((a,b)=>a+b,0)+sp*(ws.length-1);
  let x=540-tot/2; ctx.save(); if(caja){ ctx.fillStyle=caja; rr(540-tot/2-30,y-size*0.75,tot+60,size*1.5,size*0.4); ctx.fill(); }
  ctx.textBaseline='middle'; ctx.shadowColor='rgba(0,0,0,0.85)'; ctx.shadowBlur=caja?0:24; ctx.shadowOffsetY=caja?0:6;
  c.ch.forEach((i,n)=>{ const on=t>=WD[i].s-0.03; const k=eo(pr(t,WD[i].s-0.03,0.16)); ctx.save(); ctx.translate(x+wd[n]/2,y-(on?(1-k)*26:0)); const s=on?lerp(1.25,1,k):1; ctx.scale(s,s); ctx.font=F(900,size); ctx.textAlign='center';
    ctx.fillStyle=clave(ws[n])?key:(on?col:'rgba(255,255,255,0.45)'); ctx.fillText(ws[n],0,0); ctx.restore(); x+=wd[n]+sp; }); ctx.restore(); }
// --- piezas 3D ---
// cilindro de a→b con radio r (extremidades del personaje, columnas)
function alinea(y){ let ax=cross3([0,1,0],y); const s=Math.hypot(...ax); const c=dot3([0,1,0],y); if(s<1e-5) return c<0?M4.RX(Math.PI):M4.id(); ax=ax.map(x=>x/s); const an=Math.atan2(s,c); const [x,yy,z]=ax, C=Math.cos(an), Sn=Math.sin(an), t=1-C; return [t*x*x+C,t*x*yy+Sn*z,t*x*z-Sn*yy,0, t*x*yy-Sn*z,t*yy*yy+C,t*yy*z+Sn*x,0, t*x*z+Sn*yy,t*yy*z-Sn*x,t*z*z+C,0, 0,0,0,1]; }
function barra(a,b,r,color,o){ const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]]; const len=Math.hypot(...d)||1e-4; const y=d.map(x=>x/len); let ax=cross3([0,1,0],y); const s=Math.hypot(...ax); const c=dot3([0,1,0],y);
  let R=M4.id(); if(s>1e-5){ ax=ax.map(x=>x/s); const an=Math.atan2(s,c); const [x,yy,z]=ax, C=Math.cos(an), Sn=Math.sin(an), t=1-C; R=[t*x*x+C,t*x*yy+Sn*z,t*x*z-Sn*yy,0, t*x*yy-Sn*z,t*yy*yy+C,t*yy*z+Sn*x,0, t*x*z+Sn*yy,t*yy*z-Sn*x,t*z*z+C,0, 0,0,0,1]; } else if(c<0) R=M4.RX(Math.PI);
  draw('cyl',chain(M4.T((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),R,M4.S(r,len,r)),color,o); draw('sphere',chain(M4.T(...a),M4.S(r,r,r)),color,o); draw('sphere',chain(M4.T(...b),M4.S(r,r,r)),color,o); }
// personaje adulto estilizado (1.75 de alto) en (x,0,z), mirando hacia ry. brazo: 0 abajo → 1 arriba. Devuelve la posición de la mano.
function persona(x,z,ry,brazo,t,{piel='#D9A27A',ropa='#2E86AB',pant='#1D2433',pelo='#1B1512'}={}){ const R=(p)=>{ const c=Math.cos(ry),s=Math.sin(ry); return [x+p[0]*c+p[2]*s,p[1],z-p[0]*s+p[2]*c]; };
  const resp=Math.sin(t*2.2)*0.01; barra(R([-0.11,0.05,0]),R([-0.11,0.85,0]),0.075,pant); barra(R([0.11,0.05,0]),R([0.11,0.85,0]),0.075,pant);
  draw('box',chain(M4.T(...R([-0.11,0.04,0.06])),M4.RY(ry),M4.S(0.14,0.08,0.28)),'#111111'); draw('box',chain(M4.T(...R([0.11,0.04,0.06])),M4.RY(ry),M4.S(0.14,0.08,0.28)),'#111111');
  barra(R([0,0.95,0]),R([0,1.35+resp,0]),0.2,ropa,{spec:0.1}); draw('sphere',chain(M4.T(...R([0,1.62+resp,0])),M4.S(0.14,0.17,0.15)),piel,{spec:0.2});
  draw('sphere',chain(M4.T(...R([0,1.70+resp,-0.02])),M4.S(0.15,0.12,0.15)),pelo,{spec:0.4}); barra(R([0,1.4,0]),R([0,1.5,0]),0.06,piel);
  barra(R([-0.26,1.36,0]),R([-0.3,1.0,0.05]),0.06,ropa); barra(R([-0.3,1.0,0.05]),R([-0.28,0.74,0.1]),0.055,piel);
  const a=lerp(-1.3,1.25,eio(brazo)); const codo=R([0.26+0.06*Math.cos(a),1.36+0.32*Math.sin(a),0.12]); const mano=R([0.3+0.08*Math.cos(a),1.36+0.62*Math.sin(a)+0.05,0.22]);
  barra(R([0.26,1.36,0]),codo,0.06,ropa); barra(codo,mano,0.055,piel); return mano; }
function hoja(p,ry,rx,s=1){ draw('box',chain(M4.T(...p),M4.RY(ry),M4.RX(rx),M4.S(0.3*s,0.42*s,0.006)),'#F4F1EA',{spec:0.5,em:'#F4F1EA',emI:0.15}); }
function edificio(x,z,w,d,h,col,ven,seed,{luz=0.9}={}){ draw('box',chain(M4.T(x,h/2,z),M4.S(w,h,d)),col,{spec:0.15});
  const nx=Math.max(1,Math.floor(w/0.45)), ny=Math.floor(h/0.5); for(let r=0;r<ny;r++) for(let c=0;c<nx;c++){ if(rand(seed*31+r*7+c)>0.55){ const yy=0.4+r*0.5, xx=x-w/2+(c+0.5)*w/nx;
    draw('box',chain(M4.T(xx,yy,z+d/2+0.005),M4.S(w/nx*0.55,0.24,0.01)),ven,{em:ven,emI:luz,shadow:false}); } } }
function init(tl){ TL=tl; WD=tl.words; S={ s2:T('una',2), s3:T('pero'), s4:T('con',1), s5:T('y',1,true), luna1:T('luna',1), c1:T('42',1), dec:T('décima'), mil:T('milímetro'), doble:T('doble'), edif:T('edificio'), c42:T('42',2), pasa:T('pasa'), luna2:T('luna',2), dobl:T('doblez'), gruesa:T('gruesa'), veinte:T('20') }; glInit(); if(window.setup) setup(); }
function frame(t){ ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.shadowBlur=0; drawFrame(t); return OUT.toDataURL('image/jpeg',0.9); }
window.ready=true;
