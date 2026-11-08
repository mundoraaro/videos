// OPCIÓN B — "Ilustración plana editorial": mundo de formas geométricas con color vibrante, personaje adulto estilizado, sombras largas.
const P={ind:'#231C5A',ind2:'#3A2F8C',cor:'#FF6B5B',tea:'#2EC4B6',sol:'#FFC93C',cre:'#FFF4E0',piel:'#E8A87C',ink:'#16123A'};
let CHB=null; function setup(){ CHB=chunks(3,15); }
function fondoB(a,b){ const g=ctx.createLinearGradient(0,0,W_,H_); g.addColorStop(0,a); g.addColorStop(1,b); ctx.fillStyle=g; ctx.fillRect(0,0,W_,H_);
  sv(); ctx.globalAlpha=0.07; ctx.fillStyle='#fff'; for(let i=0;i<14;i++){ circ(rand(i)*W_,rand(i+9)*H_,40+rand(i+3)*160); ctx.fill(); } rs(); }
function lunaB(x,y,r){ sv(); ctx.fillStyle='rgba(255,244,224,0.12)'; circ(x,y,r*1.5); ctx.fill(); ctx.fillStyle=P.cre; circ(x,y,r); ctx.fill(); ctx.fillStyle='#EAD9BC'; [[-.3,-.2,.2],[.3,.15,.15],[0,.4,.12]].forEach(([a,b,c])=>{circ(x+a*r,y+b*r,c*r);ctx.fill();});
  ctx.save(); circ(x,y,r); ctx.clip(); ctx.fillStyle='rgba(35,28,90,0.18)'; circ(x+r*0.45,y+r*0.2,r); ctx.fill(); ctx.restore(); rs(); }
// personaje adulto estilizado (proporción alta, cara mínima). brazo: 0 abajo, 1 arriba
function persona(x,y,s,brazo=0,camisa=P.tea){ sv(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(10,4,90,16,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=P.ink; rr(-36,-190,32,190,14); ctx.fill(); rr(4,-190,32,190,14); ctx.fill();                  // pantalón
  ctx.fillStyle=camisa; rr(-56,-380,112,210,40); ctx.fill();                                                  // torso
  ctx.fillStyle=P.piel; rr(-14,-410,28,34,8); ctx.fill(); ctx.beginPath(); ctx.ellipse(0,-452,40,48,0,0,Math.PI*2); ctx.fill();   // cuello y cabeza
  ctx.fillStyle=P.ink; ctx.beginPath(); ctx.ellipse(-4,-482,46,28,-0.15,Math.PI,Math.PI*2.05); ctx.fill(); ctx.fillRect(-44,-484,14,40);   // pelo
  ctx.fillStyle=P.ink; circ(14,-452,4.5); ctx.fill(); ctx.strokeStyle=P.ink; ctx.lineWidth=4; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(10,-432,10,0.2,1.2); ctx.stroke(); // ojo y sonrisa (perfil 3/4)
  ctx.strokeStyle=camisa; ctx.lineWidth=30; ctx.beginPath(); ctx.moveTo(-44,-350); ctx.lineTo(-70,-250); ctx.lineTo(-60,-180); ctx.stroke();
  const a=lerp(0.9,-1.9,brazo); const ex=44+Math.cos(a)*90, ey=-350+Math.sin(a)*90; ctx.beginPath(); ctx.moveTo(44,-350); ctx.lineTo(ex,ey); const hx=ex+Math.cos(a-0.4)*80, hy=ey+Math.sin(a-0.4)*80; ctx.lineTo(hx,hy); ctx.stroke();
  ctx.fillStyle=P.piel; circ(hx,hy,15); ctx.fill(); ctx.fillStyle='#fff'; ctx.save(); ctx.translate(hx,hy-40); ctx.rotate(0.15); ctx.fillRect(-28,-40,56,74); ctx.strokeStyle='#D9D2C3'; ctx.lineWidth=2; for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-20,-28+i*13);ctx.lineTo(20,-28+i*13);ctx.stroke();} ctx.restore();
  rs(); return [x+hx*s,y+(hy-60)*s]; }
function edif(x,base,w,h,c,v=P.sol){ ctx.fillStyle=c; ctx.fillRect(x,base-h,w,h); ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(x+w*0.65,base-h,w*0.35,h);
  ctx.fillStyle=v; for(let r=0;r<h/50-1;r++) for(let cc=0;cc<Math.floor(w/40);cc++) if(rand(x+r*13+cc)>0.5) ctx.fillRect(x+12+cc*40,base-h+22+r*50,18,24); }
function badge(s,x,y,k,bg=P.cor,fg='#fff',size=150){ if(k<=0)return; sv(); ctx.translate(x,y); const sc=back(k); ctx.scale(sc,sc); ctx.rotate(-0.04); ctx.font=F(900,size); const w=ctx.measureText(s).width+size*0.6, h=size*1.25;
  ctx.fillStyle='rgba(0,0,0,0.25)'; rr(-w/2+14,-h/2+16,w,h,h*0.25); ctx.fill(); ctx.fillStyle=bg; rr(-w/2,-h/2,w,h,h*0.25); ctx.fill(); ctx.fillStyle=fg; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s,0,size*0.06); rs(); }
function etiq(s,x,y,k,col=P.cre,size=38){ if(k<=0)return; sv(); ctx.globalAlpha=clamp(k); ctx.translate(0,(1-k)*20); ctx.font=F(800,size); ctx.letterSpacing='4px'; ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(s,x,y); rs(); }
function capsB(t){ const c=chunkEn(CHB,t); if(!c) return; const ws=c.ch.map(i=>WD[i].t); const size=80; ctx.font=F(900,size); const sp=ctx.measureText(' ').width; const wd=ws.map(w=>ctx.measureText(w).width); const tot=wd.reduce((a,b)=>a+b,0)+sp*(ws.length-1);
  let x=W_/2-tot/2; const y=1370; const k=eo(prog(t,c.t0,0.18)); sv(); ctx.translate(0,(1-k)*24); ctx.globalAlpha=k; ctx.textBaseline='middle';
  c.ch.forEach((i,n)=>{ const on=t>=WD[i].s-0.03; if(clave(ws[n])&&on){ const u=eo(prog(t,WD[i].s,0.2)); ctx.fillStyle=P.cor; rr(x-14,y-52,(wd[n]+28)*u,104,18); ctx.fill(); }
    ctx.font=F(900,size); ctx.fillStyle=on?'#fff':'rgba(255,255,255,0.5)'; ctx.shadowColor='rgba(0,0,0,0.35)'; ctx.shadowBlur=12; ctx.fillText(ws[n],x,y); ctx.shadowBlur=0; x+=wd[n]+sp; }); rs(); }

function drawFrame(t){
  if(t<S.s2){ // 1) cuarto de noche: alguien con su hoja frente a la ventana con la Luna
    fondoB(P.ind,P.ind2); sv(); ctx.fillStyle='#2B2470'; rr(170,330,740,820,40); ctx.fill(); ctx.fillStyle='#120E3A'; rr(200,360,680,760,30); ctx.fill();
    for(let i=0;i<40;i++){ ctx.fillStyle=`rgba(255,255,255,${0.4+0.4*Math.sin(t*3+i)})`; circ(220+rand(i)*640,380+rand(i+5)*500,2); ctx.fill(); }
    lunaB(700,560,120); edif(220,1120,120,260,'#1D1755'); edif(350,1120,150,360,'#241C66'); edif(520,1120,110,220,'#1D1755'); edif(650,1120,200,300,'#241C66');
    ctx.fillStyle='#2B2470'; ctx.fillRect(530,360,20,760); ctx.fillRect(200,730,680,20); rs();
    sv(); ctx.fillStyle='#14103F'; ctx.fillRect(0,1560,W_,400); ctx.fillStyle=P.cor; rr(640,1420,320,24,10); ctx.fill(); ctx.fillRect(660,1444,20,140); ctx.fillRect(920,1444,20,140); rs();
    const [hx,hy]=persona(380,1580,1.05,eo(prog(t,0,0.7)),P.tea);
    const k=ap(t,0.4,0.9); sv(); ctx.setLineDash([2,20]); ctx.lineCap='round'; ctx.strokeStyle=P.sol; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.quadraticCurveTo(560,700,lerp(hx,700,k),lerp(hy,600,k)); ctx.stroke(); rs();
    const n=42; badge(n+'',W_/2,240,1,P.cor,'#fff',140); etiq('DOBLECES',W_/2,350,1,P.sol);
  }
  else if(t<S.s3){ // 2) personaje diminuto junto al borde gigante de la hoja y una regla
    const lt=t-S.s2; fondoB('#1E7F86',P.tea); sv(); ctx.fillStyle='#fff'; ctx.fillRect(0,1040,W_,46); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(0,1086,W_,30);
    ctx.fillStyle=P.sol; rr(820,520,120,560,16); ctx.fill(); ctx.fillStyle=P.ink; for(let i=0;i<14;i++){ ctx.fillRect(820,540+i*38,i%2?30:56,6); } rs();
    persona(300,1040,0.55,0.15,P.cor); badge('0.1 mm',W_/2-60,520,ap(t,T('décima')-0.2,0.45),P.ind,'#fff',130); etiq('UNA HOJA DE PAPEL',W_/2-60,680,ap(t,S.s2+0.2,0.4),'#fff'); }
  else if(t<S.s4){ // 3) se dobla: rectángulos que se duplican
    const lt=t-S.s3; fondoB(P.cor,'#FF9A5B'); const n=Math.min(5,Math.floor(lt/0.55)+1); const capas=Math.pow(2,n); const fu=(lt%0.55)/0.55;
    sv(); ctx.translate(W_/2,1180); const h=Math.min(560,capas*16); ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(-250,-h+20,540,h);
    for(let i=0;i<capas;i++){ ctx.fillStyle=i%2?'#FFF4E0':'#FFFFFF'; ctx.fillRect(-270,-h+i*(h/capas),540,Math.max(2,h/capas-1.5)); }
    if(n<5){ const ang=eio(clamp(fu*1.5))*Math.PI; ctx.save(); ctx.translate(0,-h); ctx.scale(1,Math.cos(ang)); ctx.fillStyle=ang>Math.PI/2?'#F3E6CC':'#fff'; ctx.fillRect(-270,-h,540,h); ctx.restore(); } rs();
    badge('×'+capas,W_/2,420,1,P.ind,'#fff',150); etiq(n+(n===1?' DOBLEZ':' DOBLECES'),W_/2,560,1,'#fff'); }
  else if(t<S.s5){ // 4) ciudad plana: la torre de papel contra un rascacielos, con aves y avión
    const lt=t-S.s4; fondoB('#5B8DEF','#FFC1A1'); sv(); ctx.fillStyle='rgba(255,255,255,0.8)'; [[200,420],[760,600],[420,820]].forEach(([x,y],i)=>{ const dx=(lt*30*(i+1))%200; rr(x+dx-90,y,180,50,25); ctx.fill(); rr(x+dx-50,y-30,100,60,30); ctx.fill(); }); rs();
    edif(60,1600,170,420,'#3B4CA8'); edif(820,1600,200,520,'#3B4CA8'); edif(560,1600,230,980,P.ind,'#FFE29A');
    const hT=lerp(0,1000,eo(prog(t,S.s4,1.6))); sv(); ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(400,1600-hT+20,60,hT); ctx.fillStyle='#fff'; ctx.fillRect(380,1600-hT,60,hT); ctx.fillStyle=P.cor; ctx.fillRect(380,1600-hT,60,10); rs();
    sv(); ctx.fillStyle='#2A2266'; ctx.fillRect(0,1600,W_,400); rs(); persona(300,1600,0.28,1,P.cor);
    sv(); ctx.strokeStyle=P.ink; ctx.lineWidth=5; for(let i=0;i<3;i++){ const bx=(lt*160+i*80)%1200-60, by=700+i*40; ctx.beginPath(); ctx.moveTo(bx-14,by); ctx.lineTo(bx,by+10); ctx.lineTo(bx+14,by); ctx.stroke(); } rs();
    badge('105 m',W_/2,330,ap(t,S.s4+0.2,0.45),P.cor,'#fff',140); etiq('20 DOBLECES',W_/2,470,ap(t,S.s4+0.4,0.4),P.ind); }
  else { // 5) espacio plano: Tierra, la columna y la Luna; un astronauta saluda
    const lt=t-S.s5; fondoB('#0E0A33',P.ind); for(let i=0;i<90;i++){ ctx.fillStyle=`rgba(255,255,255,${0.3+0.5*rand(i)})`; circ(rand(i)*W_,(rand(i+4)*H_+lt*200)%H_,1.5+rand(i+2)*2); ctx.fill(); }
    sv(); ctx.fillStyle=P.tea; circ(W_/2,2300+lerp(0,500,eio(lt/2.4)),900); ctx.fill(); ctx.fillStyle='#24A89B'; circ(W_/2-200,1500+lerp(0,500,eio(lt/2.4)),160); ctx.fill(); rs();
    const my=lerp(-260,560,eio(prog(t,S.s5,1.3))); lunaB(760,my,200);
    sv(); const top=lerp(1700,-40,eio(prog(t,S.s5,1.5))); ctx.fillStyle='#fff'; ctx.fillRect(380,top,50,H_); ctx.fillStyle=P.cor; ctx.fillRect(380,top,50,10); rs();
    sv(); const ax=560+Math.sin(t*1.5)*20, ay=lerp(1300,950,eio(prog(t,S.s5,2)))+Math.cos(t*1.2)*14; ctx.translate(ax,ay); ctx.rotate(Math.sin(t)*0.15); ctx.fillStyle='#fff'; rr(-40,-40,80,100,30); ctx.fill(); circ(0,-70,44); ctx.fill(); ctx.fillStyle=P.ind2; rr(-28,-90,56,36,16); ctx.fill(); ctx.fillStyle=P.sol; rr(-10,-80,30,10,5); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=20; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(34,-20); ctx.lineTo(70,-60+Math.sin(t*8)*14); ctx.stroke(); rs();
    badge(Math.round(lerp(20,42,eio(prog(t,S.c42-0.2,0.9))))+' DOBLECES',W_/2,1120,1,P.cor,'#fff',90); etiq('440,000 KM · PASA LA LUNA',W_/2,1230,ap(t,S.pasa-0.1,0.4),P.sol,36); }
  capsB(t);
}
