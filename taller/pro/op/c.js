// OPCIÓN C — "Papel recortado": collage de papeles con bordes rasgados, sombras reales, cinta adhesiva y animación tipo stop-motion.
const SERIF='"Bitstream Charter", "GFS Baskerville", serif', MONO='"Courier 10 Pitch", Courier, monospace';
const Q={kraft:'#C9A77C',kraft2:'#B8936A',crema:'#F3EAD8',tinta:'#1E1B18',rojo:'#D9452B',azul:'#1F3B6B',azul2:'#2E5597',noche:'#16233F'};
let CHC=null, TEX=null;
function setup(){ CHC=chunks(3,15); TEX=document.createElement('canvas'); TEX.width=TEX.height=512; const x=TEX.getContext('2d'); const im=x.createImageData(512,512);
  for(let i=0;i<im.data.length;i+=4){ const v=128+(Math.random()-0.5)*60; im.data[i]=im.data[i+1]=im.data[i+2]=v; im.data[i+3]=255; } x.putImageData(im,0,0);
  x.strokeStyle='rgba(60,40,20,0.15)'; for(let i=0;i<260;i++){ x.lineWidth=0.5+Math.random(); x.beginPath(); const a=Math.random()*512,b=Math.random()*512; x.moveTo(a,b); x.lineTo(a+(Math.random()-0.5)*40,b+(Math.random()-0.5)*40); x.stroke(); } }
const SM=t=>Math.floor(t*12)/12;                                   // tiempo "stop-motion" a 12 cuadros por segundo
const J=(i,t,a=3)=>(rand(i*31+Math.floor(t*12))-0.5)*a;            // temblor de recorte
function textura(a=0.18){ sv(); ctx.globalAlpha=a; ctx.globalCompositeOperation='multiply'; for(let x=0;x<W_;x+=512) for(let y=0;y<H_;y+=512) ctx.drawImage(TEX,x,y); rs(); }
// forma con borde rasgado: polígono con ruido en el contorno
function rasgado(pts,seed,amp=6){ ctx.beginPath(); pts.forEach((p,i)=>{ const q=pts[(i+1)%pts.length]; const n=Math.max(2,Math.floor(Math.hypot(q[0]-p[0],q[1]-p[1])/14));
  for(let k=0;k<n;k++){ const u=k/n; const x=lerp(p[0],q[0],u)+(rand(seed+i*97+k)-0.5)*amp, y=lerp(p[1],q[1],u)+(rand(seed+i*53+k+7)-0.5)*amp; (i===0&&k===0)?ctx.moveTo(x,y):ctx.lineTo(x,y); } }); ctx.closePath(); }
function papel(pts,color,seed,{sombra=true,amp=6,tex=true}={}){ sv(); if(sombra){ ctx.shadowColor='rgba(40,25,10,0.45)'; ctx.shadowBlur=18; ctx.shadowOffsetX=8; ctx.shadowOffsetY=12; }
  rasgado(pts,seed,amp); ctx.fillStyle=color; ctx.fill(); ctx.shadowColor='transparent'; if(tex){ ctx.clip(); textura(0.22); } rs(); }
function rect(x,y,w,h,color,seed,o){ papel([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color,seed,o); }
function circulo(x,y,r,color,seed,o){ const pts=[]; for(let i=0;i<40;i++){ const a=i/40*Math.PI*2; pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]); } papel(pts,color,seed,{amp:4,...o}); }
function cinta(x,y,rot,w=150){ sv(); ctx.translate(x,y); ctx.rotate(rot); ctx.fillStyle='rgba(240,232,200,0.75)'; ctx.fillRect(-w/2,-22,w,44); ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(-w/2,-22,w,10); rs(); }
function titular(s,x,y,size,k,col=Q.tinta,bg=Q.crema,rot=-0.03,seed=5){ if(k<=0)return; sv(); ctx.font=F(700,size,SERIF); const w=ctx.measureText(s).width+size*0.7, h=size*1.35;
  ctx.translate(x,y+(1-k)*-60); ctx.rotate(rot+J(seed,0,0)); rect(-w/2,-h/2,w,h,bg,seed); ctx.fillStyle=col; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=F(700,size,SERIF); ctx.fillText(s,0,size*0.05); rs(); }
function maquina(s,x,y,size,k,col=Q.tinta){ if(k<=0)return; const n=Math.floor(s.length*clamp(k)); sv(); ctx.font=F(700,size,MONO); ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(s.slice(0,n),x,y); rs(); }
function lunaC(x,y,r,seed=3){ circulo(x,y,r,'#EFE6D0',seed); sv(); ctx.globalAlpha=0.9; [[-.3,-.2,.2],[.3,.15,.15],[0,.42,.12],[.4,-.35,.08]].forEach(([a,b,c],i)=>circulo(x+a*r,y+b*r,c*r,'#D8CCB0',seed+i+1,{sombra:false,amp:3})); rs(); cinta(x-r*0.6,y-r*0.85,-0.5,120); }
function personaC(x,y,s,brazo,t){ sv(); ctx.translate(x,y); ctx.scale(s,s); const a=lerp(0.6,-2.0,brazo);
  rect(-34,-190,30,190,Q.tinta,11,{amp:4}); rect(6,-190,30,190,Q.tinta,12,{amp:4});
  sv(); ctx.translate(40,-350); ctx.rotate(a+Math.PI/2); rect(-15,0,30,95,Q.rojo,13,{amp:3}); ctx.translate(0,90); ctx.rotate(-0.5); rect(-14,0,28,85,Q.rojo,14,{amp:3}); ctx.translate(0,80); rect(-35,0,70,90,'#FFFFFF',15,{amp:3}); rs();
  papel([[-56,-380],[56,-380],[60,-170],[-60,-170]],Q.rojo,16); rect(-14,-414,28,40,'#D9A27A',17,{amp:2}); circulo(0,-455,46,'#D9A27A',18);
  papel([[-48,-470],[-20,-505],[30,-505],[50,-470],[40,-480],[-40,-480]],Q.tinta,19,{amp:4});
  sv(); ctx.translate(-44,-350); ctx.rotate(0.25); rect(-15,0,30,170,Q.rojo,20,{amp:3}); rs(); rs(); }
function capsC(t){ const c=chunkEn(CHC,t); if(!c) return; const s=c.ch.map(i=>WD[i].t).join(' '); const seed=c.ch[0]; const k=t>=c.t0?1:0; if(!k) return;
  sv(); ctx.font=F(800,72); const w=ctx.measureText(s).width+70; ctx.translate(W_/2+J(seed,t,4),1370); ctx.rotate((rand(seed)-0.5)*0.06);
  rect(-w/2,-58,w,116,'#FFFFFF',seed*7,{amp:5}); let x=-w/2+35; ctx.textBaseline='middle';
  c.ch.forEach(i=>{ const wd=WD[i].t; const on=t>=WD[i].s-0.03; ctx.font=F(800,72); ctx.fillStyle=clave(wd)?Q.rojo:(on?Q.tinta:'rgba(30,27,24,0.35)'); ctx.textAlign='left'; ctx.fillText(wd,x,4); x+=ctx.measureText(wd+' ').width; }); rs(); }

function drawFrame(t){ const ts=SM(t);
  ctx.fillStyle=Q.kraft; ctx.fillRect(0,0,W_,H_); textura(0.35);
  if(t<S.s2){ // 1) collage nocturno: cielo de papel azul, Luna con cinta, edificios recortados y alguien levantando su hoja
    rect(40,180,1000,1300,Q.noche,1,{amp:10}); for(let i=0;i<26;i++){ circulo(80+rand(i)*920,240+rand(i+3)*700,4+rand(i+5)*6,'#F3EAD8',100+i,{sombra:false,amp:1}); }
    lunaC(760+J(1,ts),520+J(2,ts),170,3);
    rect(60,1050,180,430,Q.azul,21); rect(250,960,150,520,Q.azul2,22); rect(700,1000,170,480,Q.azul,23); rect(880,1120,150,360,Q.azul2,24);
    for(let i=0;i<18;i++) rect(80+(i%6)*150+rand(i)*30,1100+Math.floor(i/6)*110,26,34,'#F2C14E',300+i,{sombra:false,amp:2});
    personaC(480,1500,0.95,eo(prog(ts,0,0.8)),ts); cinta(140,190,-0.3); cinta(960,200,0.35);
    const n=42; titular(n+' dobleces',W_/2,330,96,1,Q.tinta,Q.crema,-0.04,41);
  }
  else if(t<S.s3){ // 2) la hoja bajo una lupa de papel con regla
    rect(120,520,840,480,'#FFFFFF',51,{amp:8}); sv(); ctx.strokeStyle='rgba(31,59,107,0.25)'; ctx.lineWidth=3; for(let i=0;i<9;i++){ ctx.beginPath(); ctx.moveTo(170,580+i*48); ctx.lineTo(920,580+i*48); ctx.stroke(); } rs();
    rect(160,1060,760,90,'#E9C46A',52); sv(); ctx.fillStyle=Q.tinta; for(let i=0;i<30;i++) ctx.fillRect(180+i*25,1060,3,i%5?26:46); rs(); cinta(200,540,-0.4); cinta(880,1000,0.3);
    circulo(720+J(3,ts),760,170,'rgba(200,225,240,0.55)',53,{amp:3}); rect(820,880,50,220,Q.tinta,54);
    titular('0.1 mm',W_/2,360,120,ap(ts,T('décima')-0.2,0.3),Q.crema,Q.rojo,0.03,55); maquina('una décima de milímetro',W_/2,1260,40,prog(ts,T('décima'),1.0)); }
  else if(t<S.s4){ // 3) se dobla: papeles apilados que se duplican, con contador en etiqueta
    const lt=ts-S.s3; const n=Math.min(5,Math.floor(lt/0.55)+1); const capas=Math.pow(2,n); const h=Math.min(560,capas*16);
    for(let i=0;i<Math.min(capas,32);i++){ const y=1200-(i+1)*(h/Math.min(capas,32)); rect(260+J(i,ts,6),y,560,Math.max(10,h/Math.min(capas,32)+4),i%2?Q.crema:'#FFFFFF',60+i,{amp:4}); }
    titular('×'+capas,W_/2,420,150,1,Q.crema,Q.azul,-0.05,61); maquina(n+(n===1?' doblez':' dobleces'),W_/2,1300,46,1); }
  else if(t<S.s5){ // 4) la torre de papel junto a un rascacielos recortado
    rect(40,180,1000,1300,'#E8A971',71,{amp:10}); circulo(820,420,90,'#F4D06F',72); rect(560,600,220,880,Q.azul,73); for(let r=0;r<12;r++) for(let c=0;c<3;c++) rect(585+c*65,640+r*68,34,40,'#F2C14E',400+r*3+c,{sombra:false,amp:2});
    const hT=lerp(0,980,eo(prog(ts,S.s4,1.5))); rect(360,1480-hT,70,hT,'#FFFFFF',74,{amp:5}); rect(40,1440,1000,80,Q.kraft2,75);
    titular('105 metros',W_/2,330,96,ap(ts,S.s4+0.2,0.3),Q.tinta,Q.crema,0.03,76); maquina('20 dobleces',360+35,1420-hT,34,ap(ts,S.s4+0.4,0.3)); cinta(120,200,-0.3); }
  else { // 5) espacio de papel: la tira de papel cruza hasta la Luna
    rect(40,180,1000,1300,'#101A33',81,{amp:10}); for(let i=0;i<40;i++) circulo(80+rand(i)*920,(240+rand(i+3)*1150+SM(t)*120)%1400+150,3+rand(i+5)*6,'#F3EAD8',500+i,{sombra:false,amp:1});
    circulo(W_/2,1900+lerp(0,300,eio((ts-S.s5)/2.4)),700,'#3D7CC9',82);
    const my=lerp(-250,560,eio(prog(ts,S.s5,1.3))); lunaC(740,my,200,83);
    const top=lerp(1480,200,eio(prog(ts,S.s5,1.5))); rect(380,top,60,1480-top,'#FFFFFF',84,{amp:5});
    titular(Math.round(lerp(20,42,eio(prog(ts,S.c42-0.2,0.9))))+' dobleces',W_/2,1180,90,1,Q.crema,Q.rojo,-0.03,85); maquina('440,000 km — pasa la Luna',W_/2,1290,38,prog(ts,S.pasa-0.2,1)); cinta(120,200,-0.3); cinta(960,200,0.35); }
  capsC(t);
}
