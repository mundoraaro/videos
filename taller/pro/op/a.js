// OPCIÓN A — "Cinemático": noche, luz y profundidad. Siluetas con luz de contorno, Luna enorme, cámara que sube.
const Y='#FFD45C';
let CHA=null; function setup(){ CHA=chunks(3,15); }
function cielo(top,bot){ const g=ctx.createLinearGradient(0,0,0,H_); g.addColorStop(0,top); g.addColorStop(1,bot); ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_); }
function estrellas(t,n,alpha=1,dy=0){ for(let i=0;i<n;i++){ const x=rand(i)*W_, y=((rand(i+40)*H_*1.2+dy)%(H_*1.2))-H_*0.1; const a=alpha*(0.3+0.7*rand(i+3))*(0.6+0.4*Math.sin(t*3+i));
  ctx.fillStyle=`rgba(255,255,255,${a})`; circ(x,y,0.8+rand(i+7)*2); ctx.fill(); } }
function luna(x,y,r,glow=1){ sv(); const h=ctx.createRadialGradient(x,y,r*0.8,x,y,r*3.2); h.addColorStop(0,`rgba(255,240,210,${0.35*glow})`); h.addColorStop(1,'rgba(255,240,210,0)'); ctx.fillStyle=h; circ(x,y,r*3.2); ctx.fill();
  const g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r); g.addColorStop(0,'#FFF8E8'); g.addColorStop(.7,'#E2D9C4'); g.addColorStop(1,'#A89F8C'); ctx.fillStyle=g; circ(x,y,r); ctx.fill();
  ctx.fillStyle='rgba(120,110,95,0.28)'; [[-.3,-.15,.2],[.28,.12,.14],[-.02,.38,.12],[.38,-.35,.08],[-.45,.25,.07],[.1,-.45,.09]].forEach(([a,b,c])=>{circ(x+a*r,y+b*r,c*r);ctx.fill();}); rs(); }
function ciudad(base,t,par=0,col='#0B1020',luces=1){ sv(); ctx.fillStyle=col; let x=-40; let i=0;
  while(x<W_+40){ const w=70+rand(i+par*13)*120, h=180+rand(i*3+par)*420; ctx.fillRect(x,base-h,w,h+400);
    if(luces){ for(let r=0;r<h/36-1;r++) for(let c=0;c<Math.floor(w/26);c++){ if(rand(i*91+r*7+c+par)>0.62){ ctx.fillStyle=`rgba(255,${190+rand(r+c)*40|0},120,${0.5+0.4*Math.sin(t*0.7+r+c)*0.3})`; ctx.fillRect(x+8+c*26,base-h+16+r*36,12,16); ctx.fillStyle=col; } } }
    x+=w+6; i++; } rs(); }
function persona(x,y,s,brazo=0,rim='#FFD9A0'){ // silueta adulta de pie, brazo levantado sosteniendo una hoja
  sv(); ctx.translate(x,y); ctx.scale(s,s); ctx.fillStyle='#05070D'; ctx.shadowColor=rim; ctx.shadowBlur=18;
  ctx.beginPath(); ctx.ellipse(0,-372,34,40,0,0,Math.PI*2); ctx.fill();            // cabeza
  rr(-52,-330,104,190,40); ctx.fill();                                              // torso (sudadera)
  rr(-46,-160,40,170,18); ctx.fill(); rr(6,-160,40,170,18); ctx.fill();             // piernas
  ctx.lineCap='round'; ctx.strokeStyle='#05070D'; ctx.lineWidth=30;
  ctx.beginPath(); ctx.moveTo(-40,-300); ctx.lineTo(-62,-200); ctx.lineTo(-58,-130); ctx.stroke();   // brazo izq
  const a=lerp(0.2,-2.2,brazo); ctx.beginPath(); ctx.moveTo(40,-300); const ex=40+Math.cos(a)*80, ey=-300+Math.sin(a)*80; ctx.lineTo(ex,ey); const hx=ex+Math.cos(a-0.3)*78, hy=ey+Math.sin(a-0.3)*78; ctx.lineTo(hx,hy); ctx.stroke();
  ctx.shadowBlur=30; ctx.shadowColor='rgba(255,255,255,0.7)'; ctx.fillStyle='#F4F1EA'; ctx.save(); ctx.translate(hx,hy); ctx.rotate(-0.2); ctx.fillRect(-26,-70,52,68); ctx.restore(); rs(); return [x+hx*s,y+hy*s]; }
function nube(x,y,s,a=0.5){ sv(); ctx.globalAlpha=a; for(let i=0;i<6;i++){ const g=ctx.createRadialGradient(x+(i-2.5)*60*s,y+Math.sin(i)*20*s,0,x+(i-2.5)*60*s,y,110*s); g.addColorStop(0,'rgba(200,210,235,0.9)'); g.addColorStop(1,'rgba(200,210,235,0)'); ctx.fillStyle=g; circ(x+(i-2.5)*60*s,y,110*s); ctx.fill(); } rs(); }
function flare(x,y,k){ if(k<=0)return; sv(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,0,x,y,500*k); g.addColorStop(0,`rgba(255,220,150,${0.5*k})`); g.addColorStop(1,'rgba(255,220,150,0)'); ctx.fillStyle=g; circ(x,y,500*k); ctx.fill();
  ctx.fillStyle=`rgba(255,230,180,${0.35*k})`; ctx.fillRect(0,y-3,W_,6); rs(); }
function columna(x,base,top,w=26){ sv(); const g=ctx.createLinearGradient(0,base,0,top); g.addColorStop(0,'#F4F1EA'); g.addColorStop(1,'#FFE7A8'); ctx.fillStyle=g; ctx.shadowColor='rgba(255,220,150,0.9)'; ctx.shadowBlur=40; ctx.fillRect(x-w/2,top,w,base-top); rs(); }
function bigNum(s,x,y,size,k=1,col='#fff'){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); ctx.font=F(900,size); ctx.textAlign='center'; ctx.textBaseline='alphabetic'; ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=30;
  ctx.translate(x,y); const sc=lerp(1.25,1,eo(k)); ctx.scale(sc,sc); ctx.fillStyle=col; ctx.fillText(s,0,0); rs(); }
function label(s,x,y,k=1,size=34,col='rgba(255,255,255,0.75)'){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); ctx.font=F(700,size); ctx.letterSpacing='6px'; ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(s,x,y); rs(); }
function capsA(t){ const c=chunkEn(CHA,t); if(!c) return; const ws=c.ch.map(i=>WD[i].t); ctx.font=F(900,86); const sp=ctx.measureText(' ').width; const wd=ws.map(w=>ctx.measureText(w).width); const tot=wd.reduce((a,b)=>a+b,0)+sp*(ws.length-1);
  let x=W_/2-tot/2; sv(); ctx.textBaseline='middle'; ctx.shadowColor='rgba(0,0,0,0.85)'; ctx.shadowBlur=26; ctx.shadowOffsetY=6;
  c.ch.forEach((i,n)=>{ const on=t>=WD[i].s-0.03; const k=eo(prog(t,WD[i].s-0.03,0.14)); sv(); ctx.translate(x+wd[n]/2,1360); const s=on?lerp(1.18,1,k):1; ctx.scale(s,s);
    ctx.font=F(900,86); ctx.textAlign='center'; ctx.fillStyle=clave(ws[n])?Y:(on?'#fff':'rgba(255,255,255,0.45)'); ctx.fillText(ws[n],0,0); rs(); x+=wd[n]+sp; }); rs(); }
function vineta(){ const g=ctx.createRadialGradient(W_/2,H_*0.45,400,W_/2,H_*0.45,1300); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.6)'); ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_); }

function drawFrame(t){
  if(t<S.s2){ // 1) azotea de noche: alguien levanta una hoja hacia una Luna enorme
    const u=t/S.s2; cielo('#070A1C','#2A1E3A'); estrellas(t,120,0.9);
    luna(800,520-u*30,190,1+0.6*ap(t,S.luna1,0.3)); ciudad(1650,t,1,'#0D1328',1); ciudad(1780,t,2,'#070A16',1);
    sv(); ctx.fillStyle='#04060C'; ctx.fillRect(0,1700,W_,300); rs();
    const [hx,hy]=persona(330,1700,1.05,eo(prog(t,0.0,0.8)));
    const k=ap(t,0.5,0.6); sv(); ctx.setLineDash([4,18]); ctx.lineCap='round'; ctx.strokeStyle=`rgba(255,220,150,${0.8*k})`; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(hx,hy-60); ctx.lineTo(lerp(hx,800,k),lerp(hy-60,560,k)); ctx.stroke(); rs();
    const n=42; bigNum(n+'',W_/2,900,230,1); label('DOBLECES',W_/2,980,1);
    flare(800,520,ap(t,S.luna1,0.25)*(1-prog(t,S.luna1+0.3,0.6))); }
  else if(t<S.s3){ // 2) macro: el borde de la hoja con un calibrador
    const lt=t-S.s2; cielo('#0C0F18','#1C2233'); sv(); const z=lerp(1,1.08,lt/3); ctx.translate(W_/2,900); ctx.scale(z,z); ctx.translate(-W_/2,-900);
    const g=ctx.createLinearGradient(0,860,0,940); g.addColorStop(0,'#FFFFFF'); g.addColorStop(1,'#CFCBC0'); ctx.fillStyle=g; ctx.shadowColor='rgba(255,240,200,0.6)'; ctx.shadowBlur=50; ctx.fillRect(-100,884,W_+200,22); ctx.shadowBlur=0;
    ctx.strokeStyle=Y; ctx.lineWidth=4; const k=ap(t,S.s2+0.6,0.5); ctx.globalAlpha=k; ctx.beginPath(); ctx.moveTo(540,760); ctx.lineTo(540,872); ctx.moveTo(540,918); ctx.lineTo(540,1030); ctx.moveTo(500,872); ctx.lineTo(580,872); ctx.moveTo(500,918); ctx.lineTo(580,918); ctx.stroke(); rs();
    bigNum('0.1 mm',W_/2,680,190,ap(t,T('décima')-0.2,0.4)); label('MÁS DELGADA QUE UNA UÑA',W_/2,1140,ap(t,T('milímetro'),0.4)); }
  else if(t<S.s4){ // 3) la hoja se dobla una y otra vez: capas que se duplican
    const lt=t-S.s3; cielo('#0F1222','#26203C'); const n=Math.min(5,Math.floor(lt/0.55)+1); const capas=Math.pow(2,n);
    sv(); ctx.translate(W_/2,1000); const fu=(lt%0.55)/0.55; const ang=eio(clamp(fu*1.6))*Math.PI;
    const h=Math.min(520,capas*14); for(let i=0;i<capas;i++){ ctx.fillStyle=i%2?'#E9E5DA':'#FFFFFF'; ctx.fillRect(-260,-h+i*(h/capas),520,Math.max(2,h/capas-1)); }
    if(n<5){ ctx.save(); ctx.translate(0,-h); ctx.scale(1,Math.cos(ang)); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(-260,-h,520,h); ctx.restore(); }
    rs(); bigNum('×'+capas,W_/2,560,200,1,Y); label(n+(n===1?' DOBLEZ':' DOBLECES'),W_/2,640,1); }
  else if(t<S.s5){ // 4) atardecer: la torre de papel pasa a un rascacielos
    const lt=t-S.s4; cielo('#1B2350','#E8875A'); nube(260,560,1.2,0.35); nube(820,760,1,0.3);
    ciudad(1700,t,5,'#141A33',1); const hT=lerp(0,1150,eo(prog(t,S.s4,1.6))); sv(); ctx.fillStyle='#0B1024'; ctx.fillRect(560,1700-1000,220,1000); for(let r=0;r<26;r++) for(let c=0;c<5;c++){ if(rand(r*5+c)>0.4){ ctx.fillStyle='rgba(255,210,140,0.7)'; ctx.fillRect(578+c*40,720+r*36,22,18);} } rs();
    columna(400,1700,1700-hT,34); sv(); ctx.fillStyle='#05070F'; ctx.fillRect(0,1700,W_,300); rs();
    bigNum('105 m',W_/2,480,170,ap(t,S.s4+0.3,0.4)); label('20 DOBLECES',W_/2,560,ap(t,S.s4+0.5,0.4)); flare(400,1700-hT,0.5*ap(t,S.edif,0.3)); }
  else { // 5) espacio: la columna atraviesa todo y pasa junto a la Luna
    const lt=t-S.s5; cielo('#02030A','#0A0F2A'); estrellas(t,200,1,lt*260);
    sv(); const ey=lerp(1900,2600,eio(lt/2.4)); const g=ctx.createRadialGradient(W_/2,ey+1300,1200,W_/2,ey+1300,1420); g.addColorStop(0,'#2E78D8'); g.addColorStop(0.92,'#7FC3FF'); g.addColorStop(1,'rgba(127,195,255,0)'); ctx.fillStyle=g; circ(W_/2,ey+1300,1420); ctx.fill(); rs();
    const my=lerp(-300,640,eio(prog(t,S.s5,1.3))); luna(760,my,240,1.3);
    columna(400,H_+50,lerp(1600,-50,eio(prog(t,S.s5,1.5))),30);
    const n=Math.round(lerp(20,42,eio(prog(t,S.c42-0.2,0.9)))); bigNum(n+' DOBLECES',W_/2,1080,110,1,'#fff'); label('440,000 KM',W_/2,1160,ap(t,S.pasa-0.1,0.4),40,Y);
    flare(760,my,ap(t,S.luna2,0.3)); }
  vineta(); capsA(t);
}
