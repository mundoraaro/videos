// Base común para las 3 opciones de estilo (1080x1920). Cada opción define drawFrame(t).
const C=document.getElementById('c'), ctx=C.getContext('2d'); const W_=1080,H_=1920;
let TL=null, WD=[];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)); const lerp=(a,b,u)=>a+(b-a)*u;
const eo=u=>1-Math.pow(1-clamp(u),3); const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
const back=u=>{u=clamp(u);const c1=1.4,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
const prog=(t,t0,d)=>clamp((t-t0)/d); const ap=(t,t0,d=.4)=>eo(prog(t,t0,d));
function rand(s){let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function hexRgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function rgba(h,a){const [r,g,b]=hexRgb(h);return `rgba(${r},${g},${b},${a})`;}
function mixc(a,b,u){const A=hexRgb(a),B=hexRgb(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],clamp(u)))).join(',')})`;}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
function sv(){ctx.save();} function rs(){ctx.restore();}
const F=(w,s,fam='"Inter Display", Inter, sans-serif')=>`${w} ${Math.round(s)}px ${fam}`;
// tiempo de inicio de la palabra que empieza con q (n-ésima aparición)
function T(q,n=1,exact=false){ let c=0; const nq=q.toLowerCase(); for(const w of WD){ const ww=w.t.toLowerCase().replace(/[¡¿!?.,…]/g,''); if(exact?ww===nq:ww.startsWith(nq)){ c++; if(c===n) return w.s; } } return 0; }
// escenas fijas del guion de prueba
let S={};
function chunks(maxW=3,maxL=16){ const CH=[]; let cur=[];
  WD.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>WD[j].t).join(' ').length; if(/[.,?!:…;]$/.test(w.t)||cur.length>=maxW||len>maxL){ CH.push(cur); cur=[]; } }); if(cur.length) CH.push(cur); return CH; }
function chunkEn(CH,t){ let ci=-1; for(let c=0;c<CH.length;c++) if(WD[CH[c][0]].s-0.05<=t) ci=c; if(ci<0) return null; const ch=CH[ci], last=WD[ch[ch.length-1]]; const nx=CH[ci+1];
  const fin=nx?Math.min(WD[nx[0]].s-0.04,last.e+0.5):last.e+0.6; if(t>fin) return null; return {ch, t0:WD[ch[0]].s}; }
const clave=w=>/\d|luna|doble|edificio|milímetro|papel/i.test(w);
function init(tl){ TL=tl; WD=tl.words;
  S={ s2:T('una',2), s3:T('pero'), s4:T('con',1), s5:T('y',1,true), luna1:T('luna',1), cuarenta:T('42',1), doble:T('doble'), edif:T('edificio'), c42:T('42',2), pasa:T('pasa'), luna2:T('luna',2), dobl:T('doblez'), gruesa:T('gruesa') };
  if(window.setup) setup(); }
function frame(t){ ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.letterSpacing='0px'; drawFrame(t); return C.toDataURL('image/jpeg',0.9); }
