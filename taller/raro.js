/* Identidad visual de Mundo Raaro — RARO y su mundo. Ver taller/IDENTIDAD.md.
 * Se carga DESPUÉS de engine.js:  <script src="../../engine.js"></script><script src="../../raro.js"></script>
 *
 * Personaje:   raro({x, y, s, t, expr, brazos, piernas, disfraz, sq, alto, tilt, spin, ojos, mira, rubor, wob, viento, rim, color, bufanda})
 *              gomita({...})  -> otro personaje del mundo (mismo cuerpo, color pastel, sin bufanda)
 * Movimiento:  gelatina(t,t0) brinco(t,t0,d,h) caida(t,t0,h,d) saleArriba(t,tFin,d) susto(t,t0) wobble(t,t0) popIn(t,t0,d)
 * Jugo:        nubePuf(t,t0,x,y,s) pufCambio(t,t0) chispas(t,t0,x,y,s,color) estrellitas(t,t0,x,y) flashColor(t,t0,color)
 * Mundo:       PALETAS, fondo(t,pal,tipo,cam), letrero(txt,x,y,k,tipo,opts), contador(t,t0,d,desde,hasta)
 * Disfraces:   DISFRACES.campesino / caballero / astronauta / pirata / cavernicola (o un objeto {atras,cuerpo,cabeza,frente} propio)
 *
 * Coordenadas locales de Raro (s=1): origen = entre los pies, en el suelo. Cuerpo de y=-40 a y=-376, medio ancho 150.
 * Ojos en y=-290 (x=±50), boca en y=-232, bufanda en y≈-200, hombros en (±138,-172). Cabeza (zona del sombrero) arriba de y=-330.
 */

const RARO = { base:'#FAF7F2', sombra:'#D9D4E8', brillo:'#FFFFFF', tinta:'#1E1A2E', lima:'#D7FF3D', limaD:'#9DC41C', rubor:'#FF9EBB', lagrima:'#7FD8FF', lengua:'#FF7A9A' };
const R_ANCHO = 150, R_TOP = -376, R_BOT = -40;

// ---------- paletas de fondo: claro, medio, oscuro, rim (complementario) ----------
const PALETAS = {
  turquesa: { claro:'#86F2E2', medio:'#17C6B4', oscuro:'#0B8E89', rim:'#FF5FA2' },
  magenta:  { claro:'#FF9BDD', medio:'#F0359B', oscuro:'#A9196F', rim:'#6CFFB5' },
  mandarina:{ claro:'#FFC97F', medio:'#FF8A1F', oscuro:'#D25A08', rim:'#4CC4FF' },
  limon:    { claro:'#FFF38A', medio:'#FFD51A', oscuro:'#DE9F00', rim:'#9C6BFF' },
  violeta:  { claro:'#CDA8FF', medio:'#8D4DFF', oscuro:'#5622BE', rim:'#FFD84A' },
  cielo:    { claro:'#AEE6FF', medio:'#3AB6FF', oscuro:'#1C79D2', rim:'#FF9F43' },
};
const PASTELES = ['#FFB8D2','#B8E6FF','#FFE3A3','#C9F2B8','#D9C2FF','#FFC9A8'];
let PAL_ACTUAL = PALETAS.turquesa;
const SUELO = 1440;   // línea del suelo por defecto (los pies de Raro). Captions arriba, en y≈700. Ver IDENTIDAD.md

// ---------- movimiento con resortes ----------
function gelatina(t,t0,a=0.55){ if(t<t0) return 0; const u=t-t0; return a*Math.exp(-5.2*u)*Math.cos(16*u); }
function wobble(t,t0,a=1){ if(t<t0) return 0; const u=t-t0; return a*Math.exp(-3.5*u)*Math.sin(13*u); }
function popIn(t,t0,d=0.32){ if(t<t0) return 0; const u=(t-t0)/d; if(u>=1) return 1; return u<0.6? 1.15*easeOut(u/0.6) : lerp(1.15,1,easeInOut((u-0.6)/0.4)); }
// brinco en su lugar: anticipación (se aplasta), vuelo estirado, aterrizaje de gelatina
function brinco(t,t0,d=0.55,h=260){
  if(t<t0-0.14) return {alto:0,sq:0,wob:0};
  if(t<t0){ return {alto:0,sq:0.35*easeOut((t-(t0-0.14))/0.14),wob:0}; }
  if(t<t0+d){ const u=(t-t0)/d; return {alto:h*4*u*(1-u), sq:-0.28*(1-Math.abs(2*u-1)), wob:0}; }
  return {alto:0, sq:gelatina(t,t0+d), wob:wobble(t,t0+d)};
}
// entra cayendo desde arriba (transición "salto de escena")
function caida(t,t0,h=1500,d=0.34){
  if(t<t0+d){ const u=clamp((t-t0)/d); return {alto:h*(1-u*u), sq:-0.3*u, wob:0}; }
  return {alto:0, sq:gelatina(t,t0+d,0.6), wob:wobble(t,t0+d,1.2)};
}
// sale brincando hacia arriba al final de la escena
function saleArriba(t,tFin,d=0.32){
  const t0=tFin-d; if(t<t0-0.1) return {alto:0,sq:0,wob:0};
  if(t<t0) return {alto:0,sq:0.35*easeOut((t-(t0-0.1))/0.1),wob:0};
  const u=(t-t0)/d; return {alto:1700*u*u, sq:-0.3, wob:0};
}
// salto del susto
function susto(t,t0){ const b=brinco(t,t0+0.02,0.4,170); return b; }

// ---------- forma del cuerpo (frijol / gomita) ----------
function cuerpoPath(){
  const R=R_ANCHO, top=R_TOP, bot=R_BOT;
  ctx.beginPath(); ctx.moveTo(0,top);
  ctx.bezierCurveTo(R*0.92,top, R*1.02,top+112, R*0.98,-205);
  ctx.bezierCurveTo(R*0.95,-112, R*0.86,bot, 0,bot);
  ctx.bezierCurveTo(-R*0.86,bot, -R*0.95,-112, -R*0.98,-205);
  ctx.bezierCurveTo(-R*1.02,top+112, -R*0.92,top, 0,top);
  ctx.closePath();
}

// ---------- extremidades tipo manguera ----------
function manguera(x0,y0,x1,y1,cx,cy,base,sombra,grosor=26){
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=sombra; ctx.lineWidth=grosor+7;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.quadraticCurveTo(cx,cy,x1,y1); ctx.stroke();
  ctx.strokeStyle=base; ctx.lineWidth=grosor;
  ctx.beginPath(); ctx.moveTo(x0-2,y0-3); ctx.quadraticCurveTo(cx-2,cy-3,x1-2,y1-3); ctx.stroke();
}
function mano(x,y,base,sombra,r=21){ ctx.fillStyle=sombra; ctx.beginPath(); ctx.arc(x+2,y+3,r,0,Math.PI*2); ctx.fill(); ctx.fillStyle=base; ctx.beginPath(); ctx.arc(x-1,y-1,r-3,0,Math.PI*2); ctx.fill(); }

function posBrazos(o){
  const t=o.t, p=o.brazos||'idle', w=o.wob||0, res={};
  for(const s of [-1,1]){
    const sh=[s*136,-172]; let h, bend=s*50;
    const sway=Math.sin(t*2.2+s)*8;
    switch(p){
      case 'arriba': h=[s*(118+Math.sin(t*22+s)*14), -360+Math.cos(t*19+s)*12]; bend=s*70; break;          // pánico
      case 'saluda': h= s>0? [190+Math.sin(t*9)*30,-330] : [s*175,-60+sway]; bend=s*60; break;
      case 'jarras': h=[s*112,-110]; bend=s*120; break;                                                     // orgullo
      case 'cara':   h=[s*82,-236+Math.sin(t*14)*4]; bend=s*110; break;                                    // manos en la cara
      case 'senala': h= s>0? [300,-250] : [s*170,-60+sway]; bend= s>0? -20 : s*60; break;
      case 'corre':  { const ph=Math.sin(t*16+(s>0?0:Math.PI)); h=[s*150+ph*55,-95-ph*40]; bend=s*70; break; }
      case 'carga':  h=[s*70,-420]; bend=s*95; break;                                                       // sostiene algo arriba
      case 'frente': h=[s*58,-120]; bend=s*95; break;                                                       // sostiene algo al frente
      default:       h=[s*178+sway*0.4, -62+sway+w*12]; bend=s*65;
    }
    if(o.manos && o.manos[s>0?'d':'i']) h=o.manos[s>0?'d':'i'];
    const mx=(sh[0]+h[0])/2, my=(sh[1]+h[1])/2;
    // control de la curva: empuja el codo hacia afuera
    res[s]={sh,h}; res[s].c=[mx+s*Math.abs(bend)*0.9, my+ (p==='arriba'||p==='carga'?30:-10)];
  }
  return res;
}
function piernas(o,base,sombra){
  const t=o.t, mode=o.piernas||'quieto';
  for(const s of [-1,1]){
    let fx=s*62, fy=0, lift=0;
    if(mode==='corre'){ const ph=Math.sin(t*16+(s>0?0:Math.PI)); fx=s*62+ph*50; lift=Math.max(0,ph)*55; }
    else if(mode==='flota'){ fy=-10+Math.sin(t*3+s)*14; fx=s*70+Math.sin(t*2.4+s)*16; }
    else if(mode==='camina'){ const ph=Math.sin(t*9+(s>0?0:Math.PI)); fx=s*62+ph*26; lift=Math.max(0,ph)*26; }
    manguera(s*52,R_BOT+8,fx,fy-lift-14,s*60,(R_BOT+fy-lift)/2,base,sombra,28);
    ctx.fillStyle=sombra; ctx.beginPath(); ctx.ellipse(fx+s*10,fy-lift-6,38,18,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=base; ctx.beginPath(); ctx.ellipse(fx+s*8,fy-lift-10,34,15,0,0,Math.PI*2); ctx.fill();
  }
}

// ---------- parpadeo automático ----------
function parpadeo(t,seed=0){ const per=2.6+rand(seed)*1.6, ph=((t+rand(seed+3)*per)%per); return ph<0.13? Math.abs(Math.cos(ph/0.13*Math.PI)) : 1; }

// ---------- expresiones ----------
// cejas: [dy, ángulo (positivo = interior arriba / preocupado; negativo = enojado)] por lado [izq, der]
const EXPR = {
  neutral:  {ojos:1,   cejas:[[0,0],[0,0]],          boca:'sonrisa'},
  feliz:    {ojos:1.05,cejas:[[-8,-0.1],[-8,-0.1]],  boca:'grande', rubor:0.8},
  asombro:  {ojos:1.9, cejas:[[-26,-0.15],[-26,-0.15]], boca:'o'},
  terror:   {ojos:1.75,cejas:[[-22,0.45],[-22,0.45]],boca:'grito', sudor:1, tiembla:1},
  asco:     {ojos:0.9, cejas:[[2,-0.35],[-12,0.25]], boca:'asco', lid:0.3},
  risa:     {ojos:0.35,cejas:[[-14,-0.05],[-14,-0.05]], boca:'risa', rubor:1, ojosCerrados:1},
  llanto:   {ojos:1.2, cejas:[[-6,0.55],[-6,0.55]],  boca:'llanto', lagrimas:1},
  orgullo:  {ojos:1,   cejas:[[-8,-0.25],[-8,-0.25]],boca:'sonrisilla', lid:0.45, rubor:0.6},
  sospecha: {ojos:1,   cejas:[[8,-0.35],[-22,0.12]], boca:'linea', lid:0.5, mira:{x:0.8,y:0}},
  yavalio:  {ojos:0.95,cejas:[[4,0],[4,0]],          boca:'recta', lid:0.55, sudor:1},
  apenado:  {ojos:1.1, cejas:[[-6,0.35],[-6,0.35]],  boca:'temblorosa', rubor:1},
};

function cara(o,base,sombra){
  const t=o.t, e=EXPR[o.expr||'neutral']||EXPR.neutral, k=o.ojos??e.ojos, mira=o.mira||e.mira||{x:0,y:0};
  const tiem=e.tiembla? Math.sin(t*60)*3 : 0;
  ctx.save(); ctx.translate(tiem,0);
  // rubor
  const rub=o.rubor??e.rubor??0;
  if(rub>0){ ctx.save(); ctx.globalAlpha=0.75*rub; ctx.fillStyle=RARO.rubor; for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*92,-246,26,15,0,0,Math.PI*2);ctx.fill();} ctx.restore(); }
  // ojos
  const bl=Math.min(parpadeo(t,o.seed||0), 1);
  for(const s of [-1,1]){
    const ex=s*50+mira.x*9, ey=-290+mira.y*8;
    if(e.ojosCerrados){ // ^ ^ de risa
      ctx.strokeStyle=RARO.tinta; ctx.lineWidth=9; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(ex-18,ey+6); ctx.quadraticCurveTo(ex,ey-20,ex+18,ey+6); ctx.stroke(); continue;
    }
    const rx=20*k, ry=30*k*bl, lid=o.lid??e.lid??0;
    ctx.save();
    ctx.fillStyle=RARO.tinta; ctx.beginPath(); ctx.ellipse(ex,ey,rx,Math.max(ry,2),0,0,Math.PI*2); ctx.fill();
    if(bl>0.4){ ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(ex-rx*0.32,ey-ry*0.42,Math.max(4,6.5*k),0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex+rx*0.3,ey+ry*0.35,Math.max(2,2.8*k),0,Math.PI*2); ctx.fill(); }
    if(lid>0){ // párpado (color de la piel) que tapa la parte de arriba
      const ly=ey-ry+(ry*2)*lid;
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex,ey,rx+1.5,Math.max(ry,2)+1.5,0,0,Math.PI*2); ctx.clip();
      ctx.fillStyle=o.color||base; ctx.fillRect(ex-rx-4,ey-ry-6,rx*2+8,ly-(ey-ry-6)); ctx.restore();
      ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(ex-rx-6,ly); ctx.lineTo(ex+rx+6,ly); ctx.stroke(); }
    ctx.restore();
  }
  // cejas flotantes
  ctx.strokeStyle=RARO.tinta; ctx.lineWidth=11; ctx.lineCap='round';
  e.cejas.forEach(([dy,ang],i)=>{ const s=i?1:-1; const lift=(k>1.3?-(k-1)*24:0);
    ctx.save(); ctx.translate(s*52,-346+dy+lift+(o.wob||0)*-6); ctx.rotate(s*ang); ctx.beginPath(); ctx.moveTo(-19,0); ctx.lineTo(19,0); ctx.stroke(); ctx.restore(); });
  // boca
  const by=-228; ctx.lineCap='round'; ctx.lineJoin='round';
  const oscuro='#3A1430';
  switch(o.boca||e.boca){
    case 'sonrisa': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(0,by-10,16,0.2*Math.PI,0.8*Math.PI); ctx.stroke(); break;
    case 'grande': ctx.fillStyle=oscuro; ctx.beginPath(); ctx.moveTo(-28,by-8); ctx.quadraticCurveTo(0,by+38,28,by-8); ctx.closePath(); ctx.fill();
      ctx.fillStyle=RARO.lengua; ctx.beginPath(); ctx.ellipse(0,by+12,11,6,0,0,Math.PI*2); ctx.fill(); break;
    case 'o': { const r=13+Math.sin(t*8)*1.5; ctx.fillStyle=oscuro; ctx.beginPath(); ctx.ellipse(0,by,r,r*1.35,0,0,Math.PI*2); ctx.fill(); break; }
    case 'grito': { ctx.fillStyle=oscuro; ctx.beginPath(); ctx.moveTo(-30,by-14);
      for(let x=-30;x<=30;x+=10) ctx.lineTo(x,by-14+Math.sin(x*0.3+t*40)*3); ctx.quadraticCurveTo(34,by+44,0,by+46); ctx.quadraticCurveTo(-34,by+44,-30,by-14); ctx.fill();
      ctx.fillStyle='#FFFFFF'; ctx.fillRect(-22,by-12,44,8); ctx.fillStyle=RARO.lengua; ctx.beginPath(); ctx.ellipse(0,by+34,14,7,0,0,Math.PI*2); ctx.fill(); break; }
    case 'asco': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-26,by);
      for(let x=-26;x<=26;x+=4) ctx.lineTo(x,by+Math.sin(x*0.35)*5); ctx.stroke();
      ctx.fillStyle=RARO.lengua; ctx.beginPath(); ctx.ellipse(8,by+12+Math.sin(t*6)*2,9,13,0.2,0,Math.PI*2); ctx.fill(); break;
    case 'risa': ctx.fillStyle=oscuro; ctx.beginPath(); ctx.moveTo(-36,by-14); ctx.quadraticCurveTo(0,by+56+Math.sin(t*24)*5,36,by-14); ctx.closePath(); ctx.fill();
      ctx.fillStyle=RARO.lengua; ctx.beginPath(); ctx.ellipse(0,by+20,16,9,0,0,Math.PI*2); ctx.fill(); break;
    case 'llanto': ctx.fillStyle=oscuro; ctx.beginPath(); ctx.moveTo(-32,by+22); ctx.quadraticCurveTo(0,by-30+Math.sin(t*20)*4,32,by+22); ctx.quadraticCurveTo(0,by+10,-32,by+22); ctx.fill(); break;
    case 'sonrisilla': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-18,by); ctx.quadraticCurveTo(6,by+10,24,by-10); ctx.stroke(); break;
    case 'linea': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(4,by+2); ctx.lineTo(26,by-2); ctx.stroke(); break;
    case 'recta': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-18,by); ctx.lineTo(18,by); ctx.stroke(); break;
    case 'temblorosa': ctx.strokeStyle=RARO.tinta; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(-20,by);
      for(let x=-20;x<=20;x+=5) ctx.lineTo(x,by+((x/5)%2?4:-2)); ctx.stroke(); break;
  }
  // lágrimas a chorro
  if(o.lagrimas??e.lagrimas){ ctx.fillStyle=RARO.lagrima;
    for(const s of [-1,1]) for(let i=0;i<9;i++){ const ph=((t*2.2+i/9)%1); const x=s*(60+ph*150), y=-280-Math.sin(ph*Math.PI)*70+ph*170;
      ctx.globalAlpha=1-ph*0.6; ctx.beginPath(); ctx.arc(x,y,12-ph*5,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha=1; }
  // gota de sudor
  if(o.sudor??e.sudor){ const sy=-350+((t*0.8)%1)*50; ctx.fillStyle=RARO.lagrima; ctx.beginPath(); ctx.moveTo(120,sy-26); ctx.quadraticCurveTo(138,sy,120,sy+8); ctx.quadraticCurveTo(102,sy,120,sy-26); ctx.fill(); }
  ctx.restore();
}

// ---------- bufanda verde lima (firma) ----------
function bufanda(o){
  const t=o.t, w=o.wob||0, v=o.viento||0;
  // banda
  ctx.fillStyle=RARO.limaD; ctx.beginPath(); ctx.moveTo(-150,-222); ctx.quadraticCurveTo(0,-170,150,-222); ctx.lineTo(150,-186); ctx.quadraticCurveTo(0,-132,-150,-186); ctx.closePath(); ctx.fill();
  ctx.fillStyle=RARO.lima; ctx.beginPath(); ctx.moveTo(-152,-230); ctx.quadraticCurveTo(0,-178,152,-230); ctx.lineTo(150,-196); ctx.quadraticCurveTo(0,-142,-150,-196); ctx.closePath(); ctx.fill();
  // rayas tejidas
  ctx.strokeStyle=RARO.limaD; ctx.lineWidth=4; for(let x=-120;x<=120;x+=30){const y=-206+ (x*x)/ (150*150)*-40 + 26; ctx.beginPath(); ctx.moveTo(x,y-16); ctx.lineTo(x+6,y+12); ctx.stroke();}
  // colas con movimiento secundario
  const kx=78, ky=-182;
  for(const [len,off,ph] of [[150,0.15,0],[118,-0.25,1.3]]){
    const pts=[]; let x=kx, y=ky;
    for(let i=0;i<=10;i++){ const u=i/10; const a=Math.PI/2 - 0.55 + off - v*0.9*u + (Math.sin(t*3.2+ph-u*3)*0.22 + w*0.9)*u;
      if(i){ x+=Math.cos(a)*len/10; y+=Math.sin(a)*len/10; } pts.push([x,y]); }
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=RARO.limaD; ctx.lineWidth=34; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0]+3,p[1]+3):ctx.moveTo(p[0]+3,p[1]+3)); ctx.stroke();
    ctx.strokeStyle=RARO.lima; ctx.lineWidth=28; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
    const e=pts[10], p9=pts[8], ang=Math.atan2(e[1]-p9[1],e[0]-p9[0]);
    ctx.strokeStyle=RARO.limaD; ctx.lineWidth=5; for(let f=-2;f<=2;f++){ const bx=e[0]+Math.cos(ang+Math.PI/2)*f*6, by=e[1]+Math.sin(ang+Math.PI/2)*f*6;
      ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+Math.cos(ang)*16,by+Math.sin(ang)*16); ctx.stroke(); }
  }
  // nudo
  ctx.fillStyle=RARO.limaD; ctx.beginPath(); ctx.arc(kx+3,ky+3,25,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=RARO.lima; ctx.beginPath(); ctx.arc(kx,ky,23,0,Math.PI*2); ctx.fill();
}

// ---------- RARO ----------
function raro(o){
  const t=o.t, s=o.s??1, npc=!!o.color, base=o.color||RARO.base, sombra=npc? mix(o.color,'#5B4B8A',0.28) : RARO.sombra;
  const rim=o.rim||(window.RIM)||PAL_ACTUAL.rim;
  let sq=o.sq||0; const breath=1+0.014*Math.sin(t*2.6+(o.seed||0));
  const sx=(1+0.3*sq)*(o.spin? Math.max(0.06,Math.abs(Math.cos(o.spin*Math.PI*2))) : 1), sy=(1-0.3*sq)*breath;
  const alto=o.alto||0;
  // sombra en el suelo
  ctx.save(); ctx.globalAlpha=0.22*clamp(1-alto/700); ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(o.x,o.y+6,165*s*(1+0.3*sq)*clamp(1-alto/1400,0.4),26*s,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  ctx.save(); ctx.translate(o.x,o.y-alto); ctx.rotate(o.tilt||0); ctx.scale(s*sx,s*sy);
  if(o.espejo) ctx.scale(-1,1);
  const D = typeof o.disfraz==='string'? DISFRACES[o.disfraz] : o.disfraz;
  if(D&&D.atras) D.atras(o);
  piernas(o,base,sombra);
  // rim light (contraluz del color complementario)
  ctx.save(); ctx.shadowColor=rim; ctx.shadowBlur=46; cuerpoPath(); ctx.fillStyle=rim; ctx.fill(); ctx.restore();
  // cuerpo con sombreado plano de 2 tonos
  ctx.save(); cuerpoPath(); ctx.clip();
  ctx.fillStyle=rim; ctx.fillRect(-200,-420,400,420);
  ctx.save(); ctx.translate(7,5); cuerpoPath(); ctx.clip();
  ctx.fillStyle=sombra; ctx.fillRect(-200,-420,400,420);
  ctx.translate(-30,-20); ctx.scale(0.97,0.99); cuerpoPath(); ctx.fillStyle=base; ctx.fill();
  ctx.restore();
  // brillo pequeño arriba (look de vinil)
  ctx.fillStyle=RARO.brillo; ctx.globalAlpha=npc?0.55:0.95;
  ctx.beginPath(); ctx.ellipse(-62,-332,30,15,-0.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(-24,-352,7,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  if(D&&D.cuerpo){ D.cuerpo(o);
    // re-aplica el volumen sobre la ropa
    ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=0.35; ctx.translate(-30,-20); ctx.beginPath(); ctx.rect(-260,-460,520,520); cuerpoPath(); ctx.fillStyle=RARO.sombra; ctx.fill('evenodd'); }
  ctx.restore();
  cara(o,base,sombra);
  if(D&&D.cabeza) D.cabeza(o);
  // brazos
  const B=posBrazos(o);
  for(const k of [-1,1]){ const b=B[k]; manguera(b.sh[0],b.sh[1],b.h[0],b.h[1],b.c[0],b.c[1],base,sombra,25); mano(b.h[0],b.h[1],base,sombra); }
  if(!npc && o.bufanda!==false) bufanda(o);
  if(D&&D.frente) D.frente(o, B);
  ctx.restore();
}
function gomita(o){ return raro({...o, color:o.color||PASTELES[(o.seed||0)%PASTELES.length], bufanda:false}); }

// ---------- disfraces ----------
// Cada disfraz recibe o (con o.t, o.wob). Coordenadas locales de Raro. "cuerpo" se dibuja recortado a la silueta.
const DISFRACES = {
  campesino: {
    cuerpo(o){ // harapos café con parches y orilla rota
      ctx.fillStyle='#A8754A'; ctx.beginPath(); ctx.moveTo(-200,-200);
      ctx.lineTo(200,-200); ctx.lineTo(200,-92); for(let x=200;x>=-200;x-=25) ctx.lineTo(x,-92+((x/25)%2?18:-6)+Math.sin(o.t*5+x)*3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#7A4F2C'; ctx.lineWidth=5; for(const x of [-70,10,80]){ctx.beginPath();ctx.moveTo(x,-196);ctx.lineTo(x+8,-110);ctx.stroke();}
      for(const [px,py,c] of [[-82,-160,'#C99B62'],[52,-130,'#6E8B3D']]){ ctx.fillStyle=c; ctx.fillRect(px,py,40,34);
        ctx.strokeStyle='#4A2F17'; ctx.lineWidth=3; ctx.setLineDash([6,5]); ctx.strokeRect(px+3,py+3,34,28); ctx.setLineDash([]); }
    },
    cabeza(o){ // sombrero de paja
      const w=o.wob||0; ctx.save(); ctx.translate(0,-362); ctx.rotate(-0.12+w*0.08);
      ctx.fillStyle='#D9A441'; ctx.beginPath(); ctx.ellipse(0,0,150,30,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#E9BD5C'; ctx.beginPath(); ctx.moveTo(-72,-4); ctx.quadraticCurveTo(-60,-86,0,-88); ctx.quadraticCurveTo(60,-86,72,-4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#B8822A'; ctx.lineWidth=4; for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*28,-6);ctx.lineTo(i*20,-80);ctx.stroke();}
      ctx.fillStyle='#B8822A'; for(let i=0;i<8;i++){ctx.save();ctx.rotate(-0.1);ctx.fillRect(-150+i*42+rand(i)*10,18,4,16+rand(i+4)*14);ctx.restore();}
      ctx.restore();
    }
  },
  caballero: {
    cuerpo(o){ // peto de metal
      ctx.fillStyle='#AEB8C8'; ctx.fillRect(-200,-200,400,140);
      ctx.fillStyle='#D5DCE8'; ctx.beginPath(); ctx.ellipse(-30,-150,70,40,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7D889C'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-198); ctx.lineTo(0,-70); ctx.stroke();
      ctx.fillStyle='#7D889C'; for(const [x,y] of [[-110,-180],[110,-180],[-120,-90],[120,-90]]){ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#C8323C'; ctx.fillRect(-200,-78,400,16);
    },
    cabeza(o){ // casco con plumas (las plumas siguen moviéndose)
      const w=o.wob||0;
      ctx.fillStyle='#AEB8C8'; ctx.beginPath(); ctx.moveTo(-148,-318); ctx.bezierCurveTo(-150,-420,150,-420,148,-318); ctx.lineTo(120,-326); ctx.quadraticCurveTo(0,-346,-120,-326); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#D5DCE8'; ctx.beginPath(); ctx.ellipse(-60,-376,34,14,-0.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7D889C'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(-140,-322); ctx.quadraticCurveTo(0,-344,140,-322); ctx.stroke();
      for(const [c,ang,len] of [['#FF4D6D',-0.25,150],['#FFD23F',0.05,170],['#4CC9F0',0.32,140]]){
        ctx.save(); ctx.translate(0,-402); ctx.rotate(ang+Math.sin(o.t*3+ang*5)*0.12+w*0.5);
        ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-34,-len*0.5,8,-len); ctx.quadraticCurveTo(30,-len*0.5,0,0); ctx.fill(); ctx.restore(); }
      ctx.fillStyle='#7D889C'; ctx.beginPath(); ctx.arc(0,-402,12,0,Math.PI*2); ctx.fill();
    }
  },
  astronauta: {
    atras(o){ ctx.fillStyle='#C9CFDA'; rr(-130,-330,260,230,40); ctx.fill(); ctx.fillStyle='#FF7A1A'; rr(-110,-300,40,90,14); ctx.fill(); },
    cuerpo(o){ // traje naranja con panel
      ctx.fillStyle='#FF8A2B'; ctx.fillRect(-200,-196,400,170);
      ctx.fillStyle='#FFFFFF'; rr(-46,-160,92,58,12); ctx.fill();
      for(const [i,c] of [[0,'#FF4D6D'],[1,'#3AB6FF'],[2,'#D7FF3D']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(-24+i*24,-131,8,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#D86A12'; ctx.fillRect(-200,-66,400,12);
    },
    frente(o){ // escafandra de vidrio (o.roto = estrellada)
      ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=10; ctx.fillStyle='rgba(190,235,255,0.22)';
      ctx.beginPath(); ctx.arc(0,-292,168,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-80,-380,40,16,-0.7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#C9CFDA'; rr(-150,-150,300,26,13); ctx.fill();
      if(o.roto){ ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=4; const cx=70,cy=-330; for(let i=0;i<7;i++){const a=i/7*Math.PI*2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*(40+rand(i)*50),cy+Math.sin(a)*(40+rand(i)*50)); ctx.stroke();} }
      ctx.restore();
    }
  },
  pirata: {
    cuerpo(o){ // camisa a rayas
      for(let i=0;i<8;i++){ ctx.fillStyle=i%2?'#FFFFFF':'#E63946'; ctx.fillRect(-200,-200+i*20,400,20); }
      ctx.fillStyle='#2B2D42'; ctx.fillRect(-200,-62,400,24); ctx.fillStyle='#FFD23F'; rr(-22,-66,44,32,6); ctx.fill();
    },
    cabeza(o){ // sombrero pirata con calavera simple
      const w=o.wob||0; ctx.save(); ctx.translate(0,-360); ctx.rotate(0.08+w*0.1);
      ctx.fillStyle='#22223B'; ctx.beginPath(); ctx.moveTo(-160,10); ctx.quadraticCurveTo(-120,-120,0,-96); ctx.quadraticCurveTo(120,-120,160,10); ctx.quadraticCurveTo(0,-30,-160,10); ctx.fill();
      ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.moveTo(-150,4); ctx.quadraticCurveTo(0,-34,150,4); ctx.lineTo(146,-6); ctx.quadraticCurveTo(0,-44,-146,-6); ctx.fill();
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(0,-60,18,0,Math.PI*2); ctx.fill(); ctx.fillRect(-10,-48,20,12);
      ctx.fillStyle='#22223B'; ctx.beginPath(); ctx.arc(-7,-62,5,0,Math.PI*2); ctx.arc(7,-62,5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    },
    frente(o){ // parche en el ojo izquierdo
      ctx.strokeStyle='#22223B'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-145,-330); ctx.lineTo(140,-262); ctx.stroke();
      ctx.fillStyle='#22223B'; ctx.beginPath(); ctx.ellipse(-50,-290,34,38,0,0,Math.PI*2); ctx.fill();
    }
  },
  cavernicola: {
    cuerpo(o){ // piel de leopardo de un solo hombro
      ctx.fillStyle='#F4A52B'; ctx.beginPath(); ctx.moveTo(-200,-120); ctx.lineTo(160,-215); ctx.lineTo(200,-205); ctx.lineTo(200,-70);
      for(let x=200;x>=-200;x-=30) ctx.lineTo(x,-70+((x/30)%2?16:0)); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#7A3E0E'; for(let i=0;i<14;i++){ const x=-170+rand(i)*340, y=-190+rand(i+7)*120; if(y<-200+ (x+200)*0.27-5) continue;
        ctx.beginPath(); ctx.ellipse(x,y,12,8,rand(i+2)*3,0,Math.PI*2); ctx.fill(); }
    },
    cabeza(o){ // pelo desordenado
      ctx.fillStyle='#5B3A1E'; for(let i=0;i<7;i++){ const x=-90+i*30; ctx.save(); ctx.translate(x,-364); ctx.rotate((i-3)*0.18+Math.sin(o.t*4+i)*0.06+(o.wob||0)*0.3);
        ctx.beginPath(); ctx.moveTo(-16,10); ctx.quadraticCurveTo(0,-60,16,10); ctx.fill(); ctx.restore(); }
    },
    frente(o,B){ // hueso en la mano derecha
      const h=B[1].h; ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(-0.8+Math.sin(o.t*3)*0.1);
      ctx.fillStyle='#FFF1D6'; ctx.fillRect(-8,-70,16,90); for(const y of [-70,20]) for(const x of [-10,10]){ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
  },
};

// ---------- jugo ----------
const DULCES=['#FF5FA2','#4CC9F0','#FFD23F','#D7FF3D','#B388FF','#FF8A3D'];
function nubePuf(t,t0,x,y,s=1){ // nube de polvo de colores en anillo alrededor de Raro (no le tapa la cara)
  const u=(t-t0)/0.55; if(u<0||u>1) return;
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  for(let i=0;i<18;i++){ const a=i/18*Math.PI*2+rand(i)*0.3, d=(150+rand(i+1)*60)+150*easeOut(u), r=(30+rand(i+2)*34)*(u<0.25? easeOut(u/0.25) : 1-0.6*(u-0.25)/0.75);
    ctx.globalAlpha=0.95*(1-easeIn(u)); ctx.fillStyle=DULCES[i%DULCES.length];
    ctx.beginPath(); ctx.arc(Math.cos(a)*d*0.9,Math.sin(a)*d*1.15-170,r,0,Math.PI*2); ctx.fill(); }
  ctx.globalAlpha=1-u; for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+0.4; estrella4(Math.cos(a)*(120+120*u),Math.sin(a)*(150+150*u)-170,28*(1-u)+8,'#FFFFFF'); }
  ctx.restore();
}
// giro + puf: devuelve spin (0..1) para raro() y si ya va el disfraz nuevo
function pufCambio(t,t0,d=0.34){ if(t<t0) return {spin:0,despues:false}; if(t>t0+d) return {spin:0,despues:true}; const u=(t-t0)/d; return {spin:u*2, despues:u>0.5}; }
function estrella4(x,y,r,c){ ctx.fillStyle=c; ctx.beginPath(); for(let i=0;i<8;i++){const a=i/8*Math.PI*2, rr_=i%2?r*0.28:r; ctx.lineTo(x+Math.cos(a)*rr_,y+Math.sin(a)*rr_);} ctx.closePath(); ctx.fill(); }
function chispas(t,t0,x,y,s=1,color='#FFFFFF'){
  const u=(t-t0)/0.45; if(u<0||u>1) return;
  ctx.save(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+rand(i)*0.3, d=(40+rand(i)*120)*easeOut(u)*s;
    ctx.globalAlpha=1-u; estrella4(x+Math.cos(a)*d,y+Math.sin(a)*d,(16+rand(i+3)*14)*(1-u*0.5)*s, i%3?color:RARO.lima); }
  ctx.restore();
}
function estrellitas(t,t0,x,y){ // estrellitas girando (mareo después de un golpe)
  if(t<t0) return; const u=t-t0; if(u>1.6) return;
  for(let i=0;i<4;i++){ const a=u*6+i*Math.PI/2; estrella4(x+Math.cos(a)*90,y+Math.sin(a)*24,18,i%2?'#FFD23F':'#FFFFFF'); }
}
function flashColor(t,t0,color='#FFFFFF'){ if(t>=t0&&t<t0+0.067){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=0.55; ctx.fillStyle=color; ctx.fillRect(0,0,1080,1920); ctx.restore(); } }

// ---------- fondos de dulce ----------
// tipo: cerros | cielo | olas | espacio | interior | liso.  cam = desplazamiento de cámara en x (parallax).
function blob(x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
function nube(x,y,s){ blob(x,y,60*s); blob(x+60*s,y+10*s,48*s); blob(x-58*s,y+14*s,44*s); ctx.fillRect(x-100*s,y+10*s,200*s,48*s); }
function fondo(t,pal,tipo='cerros',cam=0){
  const P= typeof pal==='string'? PALETAS[pal] : pal; PAL_ACTUAL=P;
  ctx.fillStyle=P.medio; ctx.fillRect(-200,-200,1480,2320);
  const px=(d)=>cam*d+Math.sin(t*0.25)*14*d;
  if(tipo==='espacio'){
    ctx.fillStyle=P.claro; for(let i=0;i<60;i++){ const x=((rand(i)*1300+px(0.2))%1300)-100, y=rand(i+9)*1920, r=2+rand(i+3)*6;
      ctx.globalAlpha=0.5+0.5*Math.sin(t*3+i); estrella4(x,y,r*2.4,P.claro); } ctx.globalAlpha=1;
    ctx.fillStyle=P.oscuro; blob(860+px(0.4),420,230); ctx.fillStyle=P.claro; ctx.globalAlpha=0.5; blob(800+px(0.4),360,60); ctx.globalAlpha=1;
    ctx.strokeStyle=P.claro; ctx.lineWidth=18; ctx.beginPath(); ctx.ellipse(860+px(0.4),420,330,60,-0.3,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle=P.oscuro; blob(150+px(0.7),1700,420);
    return;
  }
  const G=window.SUELO_Y||SUELO;
  if(tipo==='olas'){
    ctx.fillStyle=P.claro; nube(220+px(0.2),380,1.1); nube(830+px(0.2),560,0.8);
    for(const [y,c,a,d] of [[G-40,P.claro,40,0.4],[G+110,P.oscuro,50,0.7],[G+300,mix(P.oscuro,'#000000',0.15),60,1]]){
      ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(-200,2200); for(let x=-200;x<=1280;x+=20) ctx.lineTo(x,y+Math.sin((x+px(d))*0.012+t*1.6*d+d*3)*a); ctx.lineTo(1280,2200); ctx.fill(); }
    return;
  }
  if(tipo==='interior'){ // salón: ventana en arco, estandartes y piso
    ctx.fillStyle=P.oscuro; rr(300+px(0.3),G-1010,480,700,240); ctx.fill();
    ctx.fillStyle=P.claro; rr(330+px(0.3),G-980,420,640,210); ctx.fill();
    ctx.fillStyle=P.oscuro; ctx.fillRect(530+px(0.3),G-980,20,640); ctx.fillRect(330+px(0.3),G-700,420,20);
    for(const bx of [110,970]){ ctx.fillStyle=P.rim; ctx.beginPath(); ctx.moveTo(bx-70+px(0.5),G-1000); ctx.lineTo(bx+70+px(0.5),G-1000); ctx.lineTo(bx+70+px(0.5),G-560); ctx.lineTo(bx+px(0.5),G-620); ctx.lineTo(bx-70+px(0.5),G-560); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle=P.oscuro; ctx.fillRect(-200,G-20,1480,900);
    ctx.fillStyle=mix(P.oscuro,'#000000',0.14); for(let r=0;r<4;r++) for(let i=-1;i<8;i++) { rr(-160+i*180+(r%2)*90+px(1+r*0.2)%180,G+30+r*110,150,60,26); ctx.fill(); }
    return;
  }
  // nubes/cielo arriba
  ctx.fillStyle=P.claro; nube(200+px(0.15),330,1.2); nube(860+px(0.15),470,0.9); nube(560+px(0.25),G-640,0.6);
  if(tipo==='cielo'||tipo==='liso'){ if(tipo==='liso') return;
    ctx.globalAlpha=0.7; nube(120+px(0.5),G+60,1.5); nube(900+px(0.5),G+260,1.7); nube(400+px(0.8),G+420,1.3); ctx.globalAlpha=1; return; }
  // cerros en 3 capas (parallax) + suelo con detalles
  ctx.fillStyle=mix(P.claro,P.medio,0.35); blob(150+px(0.3),G+60,440); blob(820+px(0.3),G+90,500);
  ctx.fillStyle=P.oscuro; blob(-80+px(0.6),G+300,520); blob(1040+px(0.6),G+280,500);
  ctx.fillStyle=mix(P.oscuro,P.medio,0.25); ctx.fillRect(-200,G-10,1480,900);
  ctx.fillStyle=mix(P.oscuro,P.medio,0.5); ctx.beginPath(); ctx.ellipse(540+px(1),G-5,900,36,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=mix(P.oscuro,'#000000',0.1); for(let i=0;i<9;i++){ const x=((rand(i)*1400+px(1.3))%1400)-160, y=G+70+rand(i+4)*380; blob(x,y,14+rand(i+2)*26); }
  ctx.fillStyle=P.claro; ctx.globalAlpha=0.5; for(let i=0;i<6;i++){ const x=((rand(i+20)*1400+px(1.3))%1400)-160, y=G+60+rand(i+30)*360;
    for(const dx of [-14,0,14]){ ctx.beginPath(); ctx.ellipse(x+dx,y-18,7,22,dx*0.03,0,Math.PI*2); ctx.fill(); } } ctx.globalAlpha=1;
}

// ---------- datos como objetos del mundo ----------
// tipo: madera | panel | pergamino | piedra.  opts: {ancho, tam, color}
function letrero(txt,x,y,k,tipo='madera',opts={}){
  if(k<=0.001) return; const tam=opts.tam||72; ctx.save(); ctx.translate(x,y);
  const sw=opts.t!=null&&opts.t0!=null? wobble(opts.t,opts.t0,0.25):0; ctx.rotate(sw); ctx.scale(k,k);
  ctx.font=fuente(tam); const w=Math.max(opts.ancho||0, ctx.measureText(txt).width+tam*1.2), h=tam*1.7;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  if(tipo==='madera'){
    ctx.fillStyle='#7A4A22'; ctx.fillRect(-14,h/2-6,28,260);
    ctx.fillStyle='#5E3716'; rr(-w/2+6,-h/2+8,w,h,18); ctx.fill();
    ctx.fillStyle='#B97A3E'; rr(-w/2,-h/2,w,h,18); ctx.fill();
    ctx.strokeStyle='#9C6230'; ctx.lineWidth=4; for(const yy of [-h*0.22,h*0.18]){ctx.beginPath();ctx.moveTo(-w/2+20,yy);ctx.bezierCurveTo(-w/6,yy-10,w/6,yy+10,w/2-20,yy);ctx.stroke();}
    ctx.fillStyle='#5E3716'; for(const xx of [-w/2+22,w/2-22]){ctx.beginPath();ctx.arc(xx,-h/2+20,7,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=opts.color||'#FFF4DC'; ctx.fillText(txt,0,4);
  } else if(tipo==='panel'){
    ctx.fillStyle='#1B1F3B'; rr(-w/2,-h/2,w,h,26); ctx.fill(); ctx.strokeStyle='#4CC9F0'; ctx.lineWidth=8; ctx.stroke();
    ctx.shadowColor='#4CC9F0'; ctx.shadowBlur=24; ctx.fillStyle=opts.color||'#8FF0FF'; ctx.fillText(txt,0,4);
  } else if(tipo==='pergamino'){
    ctx.fillStyle='#F3DDAA'; rr(-w/2,-h/2,w,h,10); ctx.fill(); ctx.fillStyle='#D9BB7A'; for(const xx of [-w/2,w/2]){rr(xx-18,-h/2-12,36,h+24,18);ctx.fill();}
    ctx.fillStyle=opts.color||'#5A3A12'; ctx.fillText(txt,0,4);
  } else { // piedra
    ctx.fillStyle='#8E8AA3'; rr(-w/2,-h/2,w,h,40); ctx.fill(); ctx.fillStyle='#A9A5BE'; rr(-w/2+12,-h/2+10,w-24,h*0.4,30); ctx.fill();
    ctx.fillStyle=opts.color||'#2E2A40'; ctx.fillText(txt,0,4);
  }
  ctx.restore();
}
function contador(t,t0,d,desde,hasta,sufijo=''){ const v=Math.round(lerp(desde,hasta,easeOut(prog(t,t0,d)))); return v.toLocaleString('es-MX')+sufijo; }
