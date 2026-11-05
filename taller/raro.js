/* Identidad visual de Mundo Raaro — RARO y su mundo. Ver taller/IDENTIDAD.md.
 * Se carga DESPUÉS de engine.js:  <script src="../../engine.js"></script><script src="../../raro.js"></script>
 *
 * Personaje:   raro({x, y, s, t, expr, brazos, piernas, disfraz, sq, alto, tilt, spin, ojos, mira, rubor, wob, viento, rim, color, bufanda})
 *              gomita({...})  -> otro personaje del mundo (mismo cuerpo, color pastel, sin bufanda)
 * Movimiento:  gelatina(t,t0) brinco(t,t0,d,h) caida(t,t0,h,d) saleArriba(t,tFin,d) susto(t,t0) wobble(t,t0) popIn(t,t0,d)
 * Jugo:        nubePuf(t,t0,x,y,s) pufCambio(t,t0) chispas(t,t0,x,y,s,color) estrellitas(t,t0,x,y) flashColor(t,t0,color)
 * Mundo:       PALETAS, fondo(t,pal,tipo,cam), letrero(txt,x,y,k,tipo,opts), contador(t,t0,d,desde,hasta)
 * Disfraces:   DISFRACES.campesino / caballero / astronauta / pirata / cavernicola / piyama / abrigo / ingeniero / anciano / arbitro / cobrador / lobo / buzo / playero / wombat / cientifico / faraon / mantis / estudiante (o un objeto {atras,cuerpo,cabeza,frente} propio)
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
let PAL_ACTUAL = PALETAS.turquesa, TIPO_ACTUAL = 'cerros';
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
  if(!o.sinSombra){ ctx.save(); ctx.globalAlpha=0.22*clamp(1-alto/700); ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(o.x,o.y+6,165*s*(1+0.3*sq)*clamp(1-alto/1400,0.4),26*s,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }

  ctx.save(); ctx.translate(o.x,o.y-alto); ctx.rotate(o.tilt||0); ctx.scale(s*sx,s*sy);
  if(o.espejo) ctx.scale(-1,1);
  const D = typeof o.disfraz==='string'? DISFRACES[o.disfraz] : o.disfraz;
  if(typeof ocupa==='function'){ ocupa(-165,-520,165,-160,o.npc_peso??(npc?1.5:3)); ocupa(-175,-160,175,0,npc?0.6:1); }
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
  piyama: {
    cuerpo(o){ // piyama azul cielo a rayas con botones
      ctx.fillStyle='#9FD8FF'; ctx.fillRect(-200,-200,400,170);
      ctx.fillStyle='#6FB8F0'; for(let x=-190;x<200;x+=44) ctx.fillRect(x,-200,16,170);
      ctx.fillStyle='#FFFFFF'; for(const y of [-160,-118,-76]){ctx.beginPath();ctx.arc(0,y,8,0,Math.PI*2);ctx.fill();}
    },
    cabeza(o){ // gorro de dormir con pompón que se bambolea
      const w=o.wob||0, v=o.viento||0; ctx.save(); ctx.translate(0,-350);
      ctx.fillStyle='#6FB8F0'; ctx.beginPath(); ctx.ellipse(0,0,140,26,0,0,Math.PI*2); ctx.fill();
      const tx=-150-v*90+Math.sin(o.t*3)*20+w*60, ty=-40+Math.cos(o.t*2.6)*16;
      ctx.fillStyle='#9FD8FF'; ctx.beginPath(); ctx.moveTo(-120,-6); ctx.quadraticCurveTo(-40,-170,tx,ty); ctx.quadraticCurveTo(40,-90,120,-6); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(tx,ty,26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFFFFF'; rr(-146,-10,292,30,15); ctx.fill(); ctx.restore();
    }
  },
  abrigo: {
    cuerpo(o){ // parka rojo con cierre
      ctx.fillStyle='#FF4D5E'; ctx.fillRect(-200,-200,400,170);
      ctx.strokeStyle='#C7303F'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(0,-200); ctx.lineTo(0,-40); ctx.stroke();
      ctx.fillStyle='#C7303F'; for(const s of [-1,1]) rr(s*70-28,-120,56,40,10), ctx.fill();
    },
    cabeza(o){ // capucha con borde de peluche
      ctx.fillStyle='#FF4D5E'; ctx.beginPath(); ctx.moveTo(-160,-200); ctx.bezierCurveTo(-190,-470,190,-470,160,-200); ctx.lineTo(126,-210); ctx.bezierCurveTo(140,-400,-140,-400,-126,-210); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FFF4E0'; for(let i=0;i<=16;i++){ const a=Math.PI*(0.98+i/16*1.04); ctx.beginPath(); ctx.arc(Math.cos(a)*140,-282+Math.sin(a)*120,24+Math.sin(i*2.1)*4,0,Math.PI*2); ctx.fill(); }
    }
  },
  ingeniero: { // ingeniero de los años 40: camisa caqui con bolsillo y pluma, corbata, gorra de tela
    cuerpo(o){
      ctx.fillStyle='#C9B68A'; ctx.fillRect(-200,-200,400,170);
      ctx.fillStyle='#B39F72'; ctx.beginPath(); ctx.moveTo(-60,-205); ctx.lineTo(0,-150); ctx.lineTo(60,-205); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3E5C8A'; ctx.beginPath(); ctx.moveTo(-14,-176); ctx.lineTo(14,-176); ctx.lineTo(22,-70); ctx.lineTo(0,-50); ctx.lineTo(-22,-70); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#B39F72'; rr(46,-150,62,52,8); ctx.fill(); ctx.fillStyle='#2B4F7E'; ctx.fillRect(60,-172,8,40); ctx.fillStyle='#E8E2CF'; ctx.fillRect(74,-166,6,32);
      ctx.fillStyle='#8E7B52'; for(const y of [-130,-96]){ctx.beginPath();ctx.arc(-40,y,6,0,Math.PI*2);ctx.fill();}
    },
    cabeza(o){ // gorra de tela con visera
      const w=o.wob||0; ctx.save(); ctx.translate(0,-352); ctx.rotate(-0.06+w*0.06);
      ctx.fillStyle='#4A5A78'; ctx.beginPath(); ctx.ellipse(0,-10,132,62,0,Math.PI,0); ctx.fill();
      ctx.fillStyle='#5C6E90'; ctx.beginPath(); ctx.ellipse(-30,-44,50,16,-0.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2E3A52'; ctx.beginPath(); ctx.ellipse(70,-6,110,20,0.08,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.arc(0,-34,12,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  },
  anciano: { // abuelo: bigote y cejas de algodón, chaleco tejido y bastón
    cuerpo(o){ ctx.fillStyle='#8C6BB8'; ctx.fillRect(-200,-200,400,170); ctx.fillStyle='#F2EEF8'; ctx.beginPath(); ctx.moveTo(-50,-205); ctx.lineTo(0,-120); ctx.lineTo(50,-205); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#73559C'; ctx.lineWidth=5; for(let y=-180;y<-40;y+=24){ctx.beginPath();ctx.moveTo(-200,y);ctx.lineTo(200,y);ctx.stroke();} },
    cabeza(o){ ctx.fillStyle='#FFFFFF'; for(const s of [-1,1]) for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(s*(126+i*6),-300+i*26,22,0,Math.PI*2); ctx.fill(); } },
    frente(o,B){ // bigote blanco + bastón en la mano derecha
      ctx.fillStyle='#FFFFFF'; for(const s of [-1,1]){ ctx.beginPath(); ctx.ellipse(s*26,-250,30,14,s*0.25,0,Math.PI*2); ctx.fill(); }
      const h=B[1].h; ctx.strokeStyle='#7A4A22'; ctx.lineWidth=14; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(h[0],h[1]); ctx.lineTo(h[0]+10,h[1]+150); ctx.stroke();
      ctx.beginPath(); ctx.arc(h[0]-16,h[1],18,Math.PI,0); ctx.stroke(); }
  },
  arbitro: { // árbitro/cronometrista: playera a rayas, gorra negra, silbato colgando; o.crono='38:00' pone un cronómetro en la mano derecha; o.silbato=true lo lleva a la boca
    cuerpo(o){ ctx.fillStyle='#FFFFFF'; ctx.fillRect(-200,-200,400,170);
      ctx.fillStyle='#22223B'; for(let x=-196;x<200;x+=56) ctx.fillRect(x,-200,26,170);
      ctx.fillStyle='#22223B'; ctx.beginPath(); ctx.moveTo(-56,-204); ctx.lineTo(0,-160); ctx.lineTo(56,-204); ctx.closePath(); ctx.fill(); },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-352); ctx.rotate(0.05+w*0.06);
      ctx.fillStyle='#22223B'; ctx.beginPath(); ctx.ellipse(0,-8,128,58,0,Math.PI,0); ctx.fill();
      ctx.fillStyle='#3A3A5C'; ctx.beginPath(); ctx.ellipse(-34,-40,46,14,-0.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#14142A'; ctx.beginPath(); ctx.ellipse(-80,-4,100,18,-0.08,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#D7FF3D'; ctx.beginPath(); ctx.arc(0,-30,10,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    frente(o,B){
      const sil=o.silbato; ctx.strokeStyle='#FF5FA2'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-40,-196); ctx.quadraticCurveTo(0,sil?-215:-140,sil?18:10,sil?-238:-136); ctx.stroke();
      ctx.save(); ctx.translate(sil?26:14,sil?-238:-130); ctx.rotate(sil?-0.2:0.3); ctx.fillStyle='#C9CFDA'; rr(-22,-14,52,28,12); ctx.fill(); ctx.fillStyle='#9AA3B5'; ctx.beginPath(); ctx.arc(-6,0,12,0,Math.PI*2); ctx.fill(); ctx.restore();
      if(o.crono!=null){ const h=B[1].h; ctx.save(); ctx.translate(h[0]+10,h[1]-40); ctx.rotate(0.1+Math.sin(o.t*3)*0.05+(o.wob||0)*0.3);
        ctx.fillStyle='#C9CFDA'; rr(-22,-150,44,40,10); ctx.fill(); ctx.fillStyle='#FF4D6D'; ctx.beginPath(); ctx.arc(0,-152,16,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#E9ECF3'; ctx.beginPath(); ctx.arc(0,-20,104,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.arc(0,-20,86,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#1E1A2E'; ctx.font=fuente(50); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(o.crono,0,-16);
        ctx.strokeStyle='#FF4D6D'; ctx.lineWidth=6; ctx.lineCap='round'; const a=o.t*6; ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(Math.cos(a)*70,-20+Math.sin(a)*70); ctx.globalAlpha=0.35; ctx.stroke(); ctx.globalAlpha=1; ctx.restore(); }
    }
  },
  cobrador: { // cobrador/contador antiguo: camisa blanca, chaleco verde, ligas en las mangas, visera verde translúcida y lápiz en la oreja
    cuerpo(o){ ctx.fillStyle='#F4F1E8'; ctx.fillRect(-200,-200,400,170);
      ctx.fillStyle='#2E8B57'; ctx.beginPath(); ctx.moveTo(-200,-200); ctx.lineTo(-40,-200); ctx.lineTo(0,-90); ctx.lineTo(40,-200); ctx.lineTo(200,-200); ctx.lineTo(200,-30); ctx.lineTo(-200,-30); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FFD23F'; for(const y of [-150,-115,-80]){ ctx.beginPath(); ctx.arc(-24,y+30,6,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#8B1E3F'; ctx.beginPath(); ctx.moveTo(-14,-196); ctx.lineTo(14,-196); ctx.lineTo(0,-176); ctx.closePath(); ctx.fill(); },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-388); ctx.rotate(-0.04+w*0.06);
      ctx.fillStyle='#1E7A4C'; rr(-142,-24,284,22,11); ctx.fill();
      ctx.fillStyle='rgba(60,200,120,0.65)'; ctx.beginPath(); ctx.moveTo(-138,-6); ctx.lineTo(138,-6); ctx.lineTo(110,46); ctx.quadraticCurveTo(0,64,-110,46); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(128,-40); ctx.rotate(0.9); ctx.fillStyle='#FFD23F'; ctx.fillRect(-8,-50,16,90); ctx.fillStyle='#FF9EBB'; ctx.fillRect(-8,-62,16,14); ctx.fillStyle='#3A2A1A'; ctx.beginPath(); ctx.moveTo(-8,40); ctx.lineTo(8,40); ctx.lineTo(0,58); ctx.fill(); ctx.restore();
      ctx.restore(); }
  },
  lobo: { // disfraz de lobo: capucha gris con orejas, panza clara, cola esponjada que se menea
    atras(o){ const w=o.wob||0; ctx.save(); ctx.translate(120,-90); ctx.rotate(0.5+Math.sin(o.t*7)*0.25+w*0.4);
      ctx.fillStyle='#7E82A3'; ctx.beginPath(); ctx.ellipse(70,0,95,42,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#E4E2EE'; ctx.beginPath(); ctx.ellipse(140,0,34,26,0,0,Math.PI*2); ctx.fill(); ctx.restore(); },
    cuerpo(o){ ctx.fillStyle='#9A9DB8'; ctx.fillRect(-200,-210,400,190);
      ctx.fillStyle='#E4E2EE'; ctx.beginPath(); ctx.ellipse(0,-90,92,96,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7E82A3'; for(let x=-190;x<200;x+=38){ ctx.beginPath(); ctx.moveTo(x,-40); ctx.lineTo(x+19,-14); ctx.lineTo(x+38,-40); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0;
      ctx.fillStyle='#9A9DB8'; ctx.beginPath(); ctx.moveTo(-158,-210); ctx.bezierCurveTo(-190,-470,190,-470,158,-210); ctx.lineTo(126,-222); ctx.bezierCurveTo(140,-392,-140,-392,-126,-222); ctx.closePath(); ctx.fill();
      for(const s of [-1,1]){ ctx.save(); ctx.translate(s*92,-392); ctx.rotate(s*(0.28+Math.sin(o.t*5+s)*0.06)+w*0.3*s);
        ctx.fillStyle='#9A9DB8'; ctx.beginPath(); ctx.moveTo(-46,22); ctx.quadraticCurveTo(-10,-110,6,-118); ctx.quadraticCurveTo(30,-60,46,22); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#FFB8D2'; ctx.beginPath(); ctx.moveTo(-24,14); ctx.quadraticCurveTo(-4,-70,6,-78); ctx.quadraticCurveTo(20,-40,26,14); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.fillStyle='#E4E2EE'; for(let i=0;i<9;i++){ const a=Math.PI*(1.08+i/8*0.84); ctx.beginPath(); ctx.arc(Math.cos(a)*150,-300+Math.sin(a)*108,13,0,Math.PI*2); ctx.fill(); } }
  },
  buzo: { // buzo de snorkel: traje de neopreno, visor y snorkel
    cuerpo(o){ ctx.fillStyle='#2B4C9B'; ctx.fillRect(-200,-210,400,190); ctx.fillStyle='#FF8A3D'; ctx.fillRect(-200,-130,400,18); ctx.fillRect(-200,-90,400,10);
      ctx.fillStyle='#1B336E'; ctx.beginPath(); ctx.moveTo(-10,-205); ctx.lineTo(10,-205); ctx.lineTo(10,-30); ctx.lineTo(-10,-30); ctx.fill(); },
    frente(o){ ctx.save(); ctx.strokeStyle='#1E1A2E'; ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(-150,-300); ctx.lineTo(150,-300); ctx.stroke();
      ctx.fillStyle='#FF6B35'; rr(-118,-345,236,104,44); ctx.fill(); ctx.fillStyle='rgba(170,240,255,0.45)'; rr(-100,-332,200,78,34); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(-62,-318,26,9,-0.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#FFD23F'; ctx.lineWidth=18; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(40,-226); ctx.quadraticCurveTo(140,-226,150,-300); ctx.lineTo(160,-470); ctx.stroke();
      ctx.fillStyle='#FF6B35'; rr(144,-500,34,40,10); ctx.fill(); ctx.restore(); }
  },
  playero: { // turista de playa: camisa de flores, sombrero de sol, lentes oscuros y flotador
    cuerpo(o){ ctx.fillStyle='#FF5FA2'; ctx.fillRect(-200,-210,400,190);
      for(let i=0;i<9;i++){ const x=-160+rand(i)*320, y=-190+rand(i+5)*150; ctx.fillStyle=i%2?'#FFE36E':'#FFFFFF'; for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; ctx.beginPath(); ctx.arc(x+Math.cos(a)*12,y+Math.sin(a)*12,9,0,Math.PI*2); ctx.fill(); } ctx.fillStyle='#FF8A3D'; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-366); ctx.rotate(0.1+w*0.08);
      ctx.fillStyle='#F2C65A'; ctx.beginPath(); ctx.ellipse(0,0,190,36,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFE08A'; ctx.beginPath(); ctx.moveTo(-80,-4); ctx.quadraticCurveTo(-70,-92,0,-94); ctx.quadraticCurveTo(70,-92,80,-4); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#4CC9F0'; ctx.fillRect(-80,-26,160,20); ctx.restore(); },
    frente(o){ ctx.fillStyle='#1E1A2E'; for(const s of [-1,1]){ rr(s*52-44,-318,88,58,22); ctx.fill(); } ctx.fillRect(-12,-300,24,8);
      ctx.fillStyle='rgba(255,255,255,0.5)'; for(const s of [-1,1]){ ctx.beginPath(); ctx.ellipse(s*52-16,-302,14,6,-0.4,0,Math.PI*2); ctx.fill(); }
      ctx.save(); ctx.translate(0,-70+Math.sin(o.t*3)*4); ctx.lineWidth=50; for(let i=0;i<12;i++){ ctx.strokeStyle=i%2?'#FFFFFF':'#FF4D5E'; ctx.beginPath(); ctx.ellipse(0,0,178,44,0,i/12*Math.PI*2,(i+1)/12*Math.PI*2+0.02); ctx.stroke(); }
      ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=8; ctx.beginPath(); ctx.ellipse(0,-14,170,34,0,Math.PI*1.1,Math.PI*1.5); ctx.stroke(); ctx.restore(); }
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
  wombat: { // mameluco de wómbat: pelaje café con panza clara, capucha con orejitas redondas y nariz de wómbat arriba
    cuerpo(o){ ctx.fillStyle='#9A6B45'; ctx.fillRect(-200,-205,400,210);
      ctx.fillStyle='#C99A6E'; ctx.beginPath(); ctx.ellipse(0,-100,92,82,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7E5434'; ctx.lineWidth=5; ctx.lineCap='round'; for(let i=0;i<9;i++){ const x=-170+i*42, y=-180+(i%3)*44; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+8,y+16); ctx.stroke(); } },
    cabeza(o){ const w=o.wob||0;
      ctx.save(); ctx.rotate(w*0.03);
      ctx.fillStyle='#9A6B45'; ctx.beginPath(); ctx.moveTo(-162,-196); ctx.bezierCurveTo(-196,-478,196,-478,162,-196); ctx.lineTo(128,-206); ctx.bezierCurveTo(144,-398,-144,-398,-128,-206); ctx.closePath(); ctx.fill();
      for(const s of [-1,1]){ ctx.save(); ctx.translate(s*112,-392); ctx.rotate(s*(0.25+w*0.2+Math.sin(o.t*3+s)*0.04));
        ctx.fillStyle='#9A6B45'; ctx.beginPath(); ctx.ellipse(0,0,30,32,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#E7B9A0'; ctx.beginPath(); ctx.ellipse(0,4,15,18,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle='#5A3A22'; ctx.beginPath(); ctx.ellipse(0,-420,40,26,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-12,-428,12,6,-0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1E1A2E'; for(const s of [-1,1]){ ctx.beginPath(); ctx.arc(s*58,-430,9,0,Math.PI*2); ctx.fill(); }
      ctx.restore(); }
  },
  cientifico: { // bata de laboratorio azul pálido, goggles en la frente, plumas en la bolsa; o.lupa=true pone una lupa en la mano derecha
    cuerpo(o){ ctx.fillStyle='#BFE3FF'; ctx.fillRect(-200,-205,400,210);
      ctx.fillStyle='#9CCDF5'; ctx.beginPath(); ctx.moveTo(-70,-208); ctx.lineTo(0,-96); ctx.lineTo(70,-208); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FF5FA2'; ctx.beginPath(); ctx.moveTo(-40,-205); ctx.lineTo(0,-140); ctx.lineTo(40,-205); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#8BBDE6'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-96); ctx.lineTo(0,10); ctx.stroke();
      ctx.fillStyle='#9CCDF5'; rr(52,-150,70,56,10); ctx.fill(); for(const [x,c] of [[64,'#FF4D6D'],[80,'#1C79D2'],[96,'#FFD23F']]){ ctx.fillStyle=c; ctx.fillRect(x,-176,9,40); }
      ctx.fillStyle='#FFFFFF'; for(const y of [-80,-40]){ ctx.beginPath(); ctx.arc(-22,y,7,0,Math.PI*2); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-352); ctx.rotate(w*0.05);
      ctx.fillStyle='#FF8A1F'; rr(-150,-16,300,26,13); ctx.fill();
      for(const s of [-1,1]){ ctx.fillStyle='#5C6E90'; ctx.beginPath(); ctx.arc(s*52,-4,44,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#7FD8FF'; ctx.beginPath(); ctx.arc(s*52,-4,32,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(s*52-12,-16,10,5,-0.5,0,Math.PI*2); ctx.fill(); }
      ctx.restore(); },
    frente(o,B){ if(!o.lupa) return; const h=B[1].h; ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(-0.5+Math.sin(o.t*3)*0.08+(o.wob||0)*0.3);
      ctx.fillStyle='#7A4A22'; rr(-10,0,20,90,10); ctx.fill();
      ctx.strokeStyle='#3E4A66'; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(0,-62,62,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(190,235,255,0.35)'; ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-22,-84,18,8,-0.6,0,Math.PI*2); ctx.fill();
      ctx.restore(); }
  },
  faraon: { // faraón/realeza egipcia: nemes a rayas oro y azul con cobra al frente, collar ancho de colores y faldellín blanco; o.cetro=true pone un cayado en la mano derecha
    cuerpo(o){ ctx.fillStyle='#FFF6E6'; ctx.fillRect(-200,-205,400,210);
      ctx.fillStyle='#F2C14E'; ctx.fillRect(-200,-74,400,22); ctx.fillStyle='#2E5BBA'; for(let x=-190;x<200;x+=40) ctx.fillRect(x,-70,18,14);
      ctx.strokeStyle='#E8DCC4'; ctx.lineWidth=5; for(let x=-150;x<=150;x+=50){ ctx.beginPath(); ctx.moveTo(x,-50); ctx.lineTo(x*1.1,0); ctx.stroke(); }
      for(const [r,c] of [[150,'#F2C14E'],[128,'#2E5BBA'],[108,'#F2C14E'],[88,'#17C6B4'],[68,'#F2C14E']]){ ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(0,-212,r*1.25,r,0,0,Math.PI); ctx.fill(); }
      ctx.fillStyle='#FF5FA2'; for(let i=0;i<9;i++){ const a=Math.PI*(0.08+i/8*0.84); ctx.beginPath(); ctx.arc(Math.cos(a)*170,-212+Math.sin(a)*136,8,0,Math.PI*2); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.rotate(w*0.03);
      const nemes=()=>{ ctx.beginPath(); ctx.moveTo(-178,-150); ctx.lineTo(-166,-300); ctx.bezierCurveTo(-170,-450,170,-450,166,-300); ctx.lineTo(178,-150); ctx.lineTo(128,-150);
        ctx.lineTo(124,-300); ctx.bezierCurveTo(118,-352,-118,-352,-124,-300); ctx.lineTo(-128,-150); ctx.closePath(); };
      ctx.save(); nemes(); ctx.clip(); ctx.fillStyle='#F2C14E'; ctx.fillRect(-200,-470,400,330);
      ctx.fillStyle='#2E5BBA'; for(let y=-450;y<-140;y+=36) ctx.fillRect(-200,y,400,16);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-70,-400,50,16,-0.4,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.fillStyle='#F2C14E'; rr(-128,-352,256,22,11); ctx.fill();
      // cobra (uraeus)
      ctx.save(); ctx.translate(0,-356); ctx.rotate(Math.sin(o.t*4)*0.06+w*0.2); ctx.fillStyle='#E0A82E'; ctx.beginPath(); ctx.ellipse(0,-26,20,30,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FF4D6D'; ctx.beginPath(); ctx.ellipse(0,-30,8,12,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1E1A2E'; ctx.beginPath(); ctx.arc(-6,-44,3,0,Math.PI*2); ctx.arc(6,-44,3,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.restore(); },
    frente(o,B){ if(!o.cetro) return; const h=B[1].h; ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(0.15+Math.sin(o.t*3)*0.05+(o.wob||0)*0.3);
      ctx.lineCap='round'; ctx.lineWidth=18; for(let y=-150;y<120;y+=36){ ctx.strokeStyle=((y/36)|0)%2?'#2E5BBA':'#F2C14E'; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(0,y+36); ctx.stroke(); }
      ctx.strokeStyle='#F2C14E'; ctx.beginPath(); ctx.arc(-36,-150,36,0,Math.PI,true); ctx.stroke(); ctx.restore(); }
  },
  estudiante: { // universitario de toga y birrete (borla que se balancea); o.diploma=true pone un diploma enrollado en la mano derecha
    cuerpo(o){ ctx.fillStyle='#2B2140'; ctx.fillRect(-200,-205,400,210);
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.moveTo(-70,-208); ctx.lineTo(0,-130); ctx.lineTo(70,-208); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#8D4DFF'; for(const s of [-1,1]){ ctx.beginPath(); ctx.moveTo(s*70,-208); ctx.lineTo(s*20,-140); ctx.lineTo(s*20,0); ctx.lineTo(s*60,0); ctx.lineTo(s*110,-208); ctx.closePath(); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-372); ctx.rotate(-0.08+w*0.08);
      ctx.fillStyle='#2B2140'; rr(-96,-10,192,50,16); ctx.fill();
      ctx.fillStyle='#1B1530'; ctx.beginPath(); ctx.moveTo(-190,-10); ctx.lineTo(0,-62); ctx.lineTo(190,-10); ctx.lineTo(0,40); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3A2F58'; ctx.beginPath(); ctx.moveTo(-170,-12); ctx.lineTo(0,-56); ctx.lineTo(40,-46); ctx.lineTo(-130,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#F2C14E'; ctx.beginPath(); ctx.arc(0,-12,9,0,Math.PI*2); ctx.fill();
      const a=0.3+Math.sin(o.t*3.5)*0.25+w*0.8; ctx.strokeStyle='#F2C14E'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(120,-2); ctx.lineTo(120+Math.sin(a)*70,-2+Math.cos(a)*70); ctx.stroke();
      ctx.fillStyle='#F2C14E'; ctx.beginPath(); ctx.ellipse(120+Math.sin(a)*78,-2+Math.cos(a)*78,12,20,-a,0,Math.PI*2); ctx.fill();
      ctx.restore(); },
    frente(o,B){ if(!o.diploma) return; const h=B[1].h; ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(-0.6+Math.sin(o.t*3)*0.06+(o.wob||0)*0.3);
      ctx.fillStyle='#FFF4DC'; rr(-22,-90,44,170,20); ctx.fill(); ctx.fillStyle='#E9D9B0'; ctx.beginPath(); ctx.ellipse(0,-90,22,10,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FF4D6D'; ctx.fillRect(-24,-6,48,16); ctx.restore(); }
  },
  mantis: { // camarón mantis boxeador: caparazón de bandas verde/naranja/azul con motas, ojos en tallos que bailan, antenas con paletas azules y guantes de box rojos (o.guantes=false los quita; o.cinturon=true pone cinturón de campeón)
    cuerpo(o){ const bands=['#2FD47A','#FF8A1F','#2FD47A','#3AB6FF','#FF4D6D'];
      for(let i=0;i<5;i++){ const y=-212+i*40; ctx.fillStyle=bands[i]; ctx.fillRect(-200,y,400,42);
        ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.fillRect(-200,y,400,7); }
      ctx.fillStyle='rgba(30,26,46,0.22)'; for(let i=0;i<14;i++){ ctx.beginPath(); ctx.arc(-150+rand(i)*300,-196+rand(i+7)*170,5+rand(i+3)*5,0,Math.PI*2); ctx.fill(); }
      if(o.cinturon){ ctx.fillStyle='#1E1A2E'; ctx.fillRect(-200,-104,400,38); ctx.fillStyle='#FFD23F'; rr(-62,-118,124,66,18); ctx.fill();
        ctx.fillStyle='#FFF1A8'; rr(-44,-104,88,38,12); ctx.fill(); ctx.fillStyle='#FF4D6D'; ctx.beginPath(); ctx.arc(0,-85,11,0,Math.PI*2); ctx.fill(); } },
    cabeza(o){ const w=o.wob||0, t=o.t;
      for(const s of [-1,1]){ // antenas
        ctx.save(); ctx.translate(s*40,-360); ctx.rotate(s*(0.35+Math.sin(t*4+s)*0.12)+w*0.4);
        ctx.strokeStyle='#FF8A1F'; ctx.lineWidth=7; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(s*30,-90,s*10,-190); ctx.stroke();
        ctx.fillStyle='#3AB6FF'; ctx.beginPath(); ctx.ellipse(s*34,-70,16,40,s*0.5,0,Math.PI*2); ctx.fill(); ctx.restore(); }
      for(const s of [-1,1]){ // ojos en tallos
        const sw=Math.sin(t*3.2+s*1.7)*0.22+w*0.5; ctx.save(); ctx.translate(s*62,-356); ctx.rotate(s*0.22+sw);
        ctx.strokeStyle='#2FD47A'; ctx.lineWidth=20; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-70); ctx.stroke();
        ctx.save(); ctx.translate(0,-96); ctx.rotate(Math.sin(t*2+s)*0.3);
        ctx.fillStyle='#FF5FA2'; ctx.beginPath(); ctx.ellipse(0,0,30,38,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#3DDC84'; ctx.beginPath(); ctx.ellipse(0,-14,26,14,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#1E1A2E'; ctx.fillRect(-30,-4,60,9);
        ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(-10,-22,8,5,-0.4,0,Math.PI*2); ctx.fill();
        ctx.restore(); ctx.restore(); } },
    frente(o,B){ if(o.guantes===false) return;
      for(const k of [-1,1]){ const h=B[k].h; ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(k*0.3+(o.wob||0)*0.3);
        ctx.fillStyle='#FFFFFF'; rr(-30,22,60,30,10); ctx.fill();
        ctx.fillStyle='#E5333F'; ctx.beginPath(); ctx.ellipse(0,0,44,40,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#FF6B6B'; ctx.beginPath(); ctx.ellipse(-k*22,-8,20,24,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-12,-20,13,7,-0.5,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
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
  const P= typeof pal==='string'? PALETAS[pal] : pal; PAL_ACTUAL=P; TIPO_ACTUAL=tipo;
  const px=(d)=>cam*d+Math.sin(t*0.25)*14*d;
  cieloProfundo(t,P,tipo);
  if(EXTRA_FONDOS[tipo]){ EXTRA_FONDOS[tipo](t,P,px); particulas(t,tipo,P,cam); return; }
  if(tipo!=='liso') particulas(t,tipo,P,cam);
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
  if(typeof ocupa==='function') ocupa(-w/2,-h/2,w/2,h/2,2.5);
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


// =====================================================================
// PROFUNDIDAD Y AMBIENTE (nov 2026, pedido de Héctor: fondos y movimiento con más esfuerzo)
// Todo es automático vía fondo() y render(); ver IDENTIDAD.md §3 y §4.
// =====================================================================
// Cielo con degradado (claro arriba → medio en el horizonte → oscuro abajo) y halo de luz detrás del protagonista.
function cieloProfundo(t,P,tipo){
  const G=window.SUELO_Y||SUELO;
  const g=ctx.createLinearGradient(0,-200,0,2120);
  if(tipo==='espacio'){ g.addColorStop(0,mix(P.oscuro,'#000000',0.35)); g.addColorStop(0.6,P.oscuro); g.addColorStop(1,P.medio); }
  else if(tipo==='mar'){ g.addColorStop(0,P.claro); g.addColorStop(0.45,P.medio); g.addColorStop(1,mix(P.oscuro,'#000000',0.3)); }
  else { g.addColorStop(0,mix(P.medio,P.claro,0.55)); g.addColorStop(clamp((G-300)/2320),P.medio); g.addColorStop(1,mix(P.oscuro,'#000000',0.1)); }
  ctx.fillStyle=g; ctx.fillRect(-300,-300,1680,2520);
  // halo de luz detrás de donde suele estar Raro (respira lento)
  const hx=window.HALO_X||540, hy=window.HALO_Y||(G-430), r=760+Math.sin(t*1.2)*30;
  const h=ctx.createRadialGradient(hx,hy,0,hx,hy,r);
  h.addColorStop(0,'rgba(255,255,255,0.32)'); h.addColorStop(0.45,'rgba(255,255,255,0.10)'); h.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=h; ctx.fillRect(-300,-300,1680,2520);
}

// Partículas de ambiente, distintas por tipo de fondo (capa media, detrás de Raro).
function particulas(t,tipo,P,cam=0){
  if(window.PARTICULAS===false) return;
  ctx.save();
  const N= tipo==='espacio'?0 : 26;
  for(let i=0;i<N;i++){
    const d=0.3+rand(i+40)*0.9, sp=20+rand(i+41)*50;
    let x=((rand(i+42)*1400+cam*d+Math.sin(t*0.7+i)*30)%1400+1400)%1400-160;
    let y, r=3+rand(i+43)*7;
    if(tipo==='nieve'){ y=((rand(i+44)*2100+t*sp*2.2)%2100)-100; ctx.fillStyle='rgba(255,255,255,0.85)'; blob(x,y,r*1.3); continue; }
    if(tipo==='mar'){ y=((rand(i+44)*2100-t*sp*1.6)%2100+2100)%2100-100; ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(x,y,r*1.6,0,Math.PI*2); ctx.stroke(); continue; }
    if(tipo==='selva'){ y=((rand(i+44)*2100+t*sp)%2100)-100; ctx.save(); ctx.translate(x,y); ctx.rotate(t*1.5+i); ctx.fillStyle=i%2?P.claro:mix(P.claro,'#FFFFFF',0.4); ctx.beginPath(); ctx.ellipse(0,0,r*2.4,r,0,0,Math.PI*2); ctx.fill(); ctx.restore(); continue; }
    if(tipo==='desierto'){ y=((rand(i+44)*2100)%2100)-100; x=((rand(i+42)*1400+t*sp*4)%1400)-160; ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(x,y,r*8,3); continue; }
    // por defecto: motas de luz que flotan y titilan
    y=((rand(i+44)*2100-t*sp*0.6)%2100+2100)%2100-100;
    ctx.globalAlpha=0.25+0.35*(0.5+0.5*Math.sin(t*2+i)); ctx.fillStyle='#FFFFFF'; blob(x,y,r*0.8); ctx.globalAlpha=1;
  }
  ctx.restore();
}

// Fondos extra con 3-4 capas de profundidad. Usan los tonos de la paleta de la escena.
function hoja(x,y,l,a,c){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(l*0.35,-l*0.28,l,0); ctx.quadraticCurveTo(l*0.35,l*0.28,0,0); ctx.fill(); ctx.restore(); }
const EXTRA_FONDOS = {
  mar(t,P,px){ // bajo el agua: rayos de luz, algas que ondulan, arena
    const G=window.SUELO_Y||SUELO;
    ctx.save(); ctx.globalAlpha=0.16; ctx.fillStyle='#FFFFFF';
    for(let i=0;i<6;i++){ const a=-0.32+i*0.13+Math.sin(t*0.4+i)*0.05; ctx.save(); ctx.translate(540+px(0.1),-300); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-40,0); ctx.lineTo(40,0); ctx.lineTo(220,2600); ctx.lineTo(-220,2600); ctx.fill(); ctx.restore(); }
    ctx.restore();
    const alga=(x,h,c,d,ph)=>{ ctx.strokeStyle=c; ctx.lineCap='round'; ctx.lineWidth=46*d; ctx.beginPath(); ctx.moveTo(x+px(d),G+200);
      for(let k=1;k<=10;k++){const u=k/10; ctx.lineTo(x+px(d)+Math.sin(u*3+t*1.4+ph)*50*u, G+200-h*u);} ctx.stroke(); };
    for(let i=0;i<5;i++) alga(80+i*240,700+rand(i)*300,mix(P.medio,P.oscuro,0.35),0.4,i);
    ctx.fillStyle=mix(P.claro,P.medio,0.2); blob(200+px(0.5),G+380,520); blob(960+px(0.5),G+360,480);
    for(let i=0;i<4;i++) alga(-20+i*370,520+rand(i+7)*260,P.oscuro,0.8,i*2);
    ctx.fillStyle=mix(P.claro,'#FFE9B0',0.5); ctx.fillRect(-300,G-10,1680,900);
    ctx.fillStyle=mix(P.claro,'#FFE9B0',0.25); for(let i=0;i<10;i++){ const x=((rand(i)*1400+px(1.2))%1400)-160; blob(x,G+60+rand(i+3)*360,10+rand(i+5)*22); }
  },
  selva(t,P,px){ // capas de hojas grandes, troncos y lianas
    const G=window.SUELO_Y||SUELO;
    const capa=(c,d,seed,y0,n)=>{ for(let i=0;i<n;i++){ const x=-100+i*(1300/(n-1))+px(d), y=y0+rand(seed+i)*120; const sw=Math.sin(t*1.1+i+seed)*0.06;
      for(let k=0;k<5;k++) hoja(x,y,200+rand(seed+i+k)*140,-Math.PI/2+(k-2)*0.55+sw,c); } };
    ctx.fillStyle=mix(P.medio,P.claro,0.3); for(const [x,w] of [[180,70],[760,90]]) ctx.fillRect(x+px(0.25)-w/2,-200,w,G+200);
    capa(mix(P.medio,P.claro,0.35),0.25,1,G-900,6);
    ctx.strokeStyle=P.oscuro; ctx.lineWidth=10; for(let i=0;i<4;i++){ const x=150+i*260+px(0.5); ctx.beginPath(); ctx.moveTo(x,-200); ctx.quadraticCurveTo(x+Math.sin(t+i)*40,400,x+20,700+rand(i)*300); ctx.stroke(); }
    capa(P.oscuro,0.55,20,G-420,5);
    ctx.fillStyle=mix(P.oscuro,'#000000',0.15); ctx.fillRect(-300,G-10,1680,900);
    ctx.fillStyle=mix(P.oscuro,P.medio,0.4); ctx.beginPath(); ctx.ellipse(540+px(1),G-5,900,36,0,0,Math.PI*2); ctx.fill();
  },
  ciudad(t,P,px){ // skyline redondeado en 3 capas con ventanas que se prenden
    const G=window.SUELO_Y||SUELO;
    ctx.fillStyle=P.claro; nube(220+px(0.1),360,1.1); nube(860+px(0.1),520,0.8);
    const fila=(c,cv,d,base,seed,n,hmin,hmax)=>{ for(let i=0;i<n;i++){ const w=150+rand(seed+i)*90, h=hmin+rand(seed+i+50)*(hmax-hmin), x=-140+i*(1400/n)+px(d);
      ctx.fillStyle=c; rr(x,base-h,w,h+400,26); ctx.fill();
      if(cv){ for(let wy=base-h+40; wy<base-40; wy+=70) for(let wx=x+24; wx<x+w-40; wx+=52){ const on=rand(seed+i*31+wx*0.13+wy*0.07)>0.45 && Math.sin(t*0.8+wx+wy)>-0.85; if(on){ ctx.fillStyle=cv; rr(wx,wy,28,38,8); ctx.fill(); } } } } };
    fila(mix(P.medio,P.claro,0.4),null,0.2,G-150,1,7,500,900);
    fila(P.oscuro,mix(P.claro,'#FFF3A0',0.5),0.5,G+20,10,6,380,720);
    ctx.fillStyle=mix(P.oscuro,'#000000',0.18); ctx.fillRect(-300,G-10,1680,900);
    ctx.fillStyle=mix(P.claro,'#FFFFFF',0.3); for(let i=-1;i<8;i++) { rr(-120+i*190+((px(1.3)%190)+190)%190,G+150,110,18,9); ctx.fill(); }
  },
  desierto(t,P,px){ // sol enorme, dunas en capas, cactus
    const G=window.SUELO_Y||SUELO;
    ctx.fillStyle=mix(P.claro,'#FFFFFF',0.4); blob(760+px(0.08),G-820,190+Math.sin(t*2)*6);
    const duna=(c,d,y,a,f)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(-300,2300); for(let x=-300;x<=1380;x+=20) ctx.lineTo(x,y+Math.sin((x+px(d)*1.0)*f)*a); ctx.lineTo(1380,2300); ctx.fill(); };
    duna(mix(P.claro,P.medio,0.4),0.2,G-260,70,0.004);
    duna(P.medio,0.45,G-90,60,0.006);
    const cactus=(x,s)=>{ ctx.fillStyle=P.oscuro; rr(x-28*s,G-300*s,56*s,320*s,28*s); ctx.fill(); rr(x-110*s,G-220*s,44*s,120*s,22*s); ctx.fill(); rr(x-110*s,G-130*s,100*s,40*s,20*s); ctx.fill(); rr(x+66*s,G-260*s,44*s,110*s,22*s); ctx.fill(); rr(x+10*s,G-180*s,100*s,40*s,20*s); ctx.fill(); };
    cactus(130+px(0.6),0.9); cactus(960+px(0.6),0.7);
    duna(mix(P.oscuro,P.medio,0.3),1,G+20,30,0.008);
  },
  nieve(t,P,px){ // montañas con nieve, pinos, suelo blanco
    const G=window.SUELO_Y||SUELO;
    const monte=(x,w,h,c,d)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(x+px(d)-w,G); ctx.quadraticCurveTo(x+px(d)-w*0.15,G-h*1.1,x+px(d),G-h); ctx.quadraticCurveTo(x+px(d)+w*0.15,G-h*1.1,x+px(d)+w,G); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(x+px(d)-w*0.28,G-h*0.72); ctx.quadraticCurveTo(x+px(d),G-h*1.08,x+px(d)+w*0.28,G-h*0.72); ctx.quadraticCurveTo(x+px(d),G-h*0.62,x+px(d)-w*0.28,G-h*0.72); ctx.fill(); };
    monte(250,520,980,mix(P.medio,P.claro,0.45),0.15); monte(860,480,820,mix(P.medio,P.claro,0.25),0.25);
    const pino=(x,s)=>{ ctx.fillStyle=P.oscuro; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(x,G-(380-k*90)*s); ctx.quadraticCurveTo(x-(120+k*30)*s,G-(160-k*60)*s,x-(140+k*30)*s,G-(140-k*70)*s); ctx.lineTo(x+(140+k*30)*s,G-(140-k*70)*s); ctx.quadraticCurveTo(x+(120+k*30)*s,G-(160-k*60)*s,x,G-(380-k*90)*s); ctx.fill(); } };
    for(let i=0;i<5;i++) pino(-40+i*290+px(0.55),0.8+rand(i)*0.4);
    ctx.fillStyle='#F4F8FF'; ctx.fillRect(-300,G-10,1680,900);
    ctx.fillStyle='#DDE6FA'; for(let i=0;i<8;i++){ const x=((rand(i)*1400+px(1.2))%1400)-160; ctx.beginPath(); ctx.ellipse(x,G+80+rand(i+3)*340,60+rand(i+5)*60,16,0,0,Math.PI*2); ctx.fill(); }
  },
};

// Primer plano desenfocado que pasa por delante de Raro (da profundidad de cámara real). Lo llama el motor.
function primerPlano(t,cam=0){
  if(window.PRIMER_PLANO===false) return; const tipo=TIPO_ACTUAL, P=PAL_ACTUAL; if(tipo==='liso') return;
  const G=window.SUELO_Y||SUELO;
  ctx.save(); ctx.filter='blur(10px)';
  const d=2.2, sx=(x)=>((x+cam*d+t*22)%1700+1700)%1700-310;
  const c=mix(P.oscuro,'#000000',0.25);
  if(tipo==='espacio'){ ctx.fillStyle=mix(P.claro,'#FFFFFF',0.4); ctx.globalAlpha=0.5; for(let i=0;i<3;i++){ estrella4(sx(i*560),300+i*620,30,ctx.fillStyle);} }
  else if(tipo==='mar'){ ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.lineWidth=10; for(let i=0;i<3;i++){ const y=((2100-t*90*(1+i*0.3)-i*700)%2100+2100)%2100-100; ctx.beginPath(); ctx.arc(sx(i*600),y,40+i*16,0,Math.PI*2); ctx.stroke(); } }
  else if(tipo==='selva'){ for(let i=0;i<2;i++){ const x=i?1150:-60; for(let k=0;k<4;k++) hoja(x+cam*d*0.2,G+120-k*60,380,(i?-Math.PI*0.8:-Math.PI*0.2)+(k-1.5)*0.35+Math.sin(t+k)*0.05,c); } }
  else if(tipo==='nieve'){ ctx.fillStyle='rgba(255,255,255,0.9)'; for(let i=0;i<5;i++){ const y=((t*160*(1+i*0.2)+i*420)%2100)-100; blob(sx(i*340),y,16+i*3);} }
  else { ctx.filter='blur(16px)'; ctx.globalAlpha=0.7; ctx.fillStyle=mix(P.oscuro,P.medio,0.2); blob(sx(0),G+420,300); blob(sx(860),G+460,340); }
  ctx.restore();
}

// Viñeta de color (oscurece orillas con el tono de la escena; enfoca la vista al centro).
function vineta(){
  if(window.VINETA===false) return; const P=PAL_ACTUAL;
  const g=ctx.createRadialGradient(540,900,520,540,960,1250); const [r,g2,b]=hexToRgb(P.oscuro);
  g.addColorStop(0,`rgba(${r},${g2},${b},0)`); g.addColorStop(1,`rgba(${r},${g2},${b},0.5)`);
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920); ctx.restore();
}

// ---------- golpes visuales para revelaciones ----------
// Líneas de velocidad radiales tipo anime (0.35 s) en el punto (cx,cy).
function lineasVelocidad(t,t0,cx=540,cy=900,color='#FFFFFF',d=0.35){
  if(t<t0||t>t0+d) return; const u=(t-t0)/d;
  ctx.save(); ctx.globalAlpha=0.85*(1-u); ctx.fillStyle=color;
  for(let i=0;i<42;i++){ const a=i/42*Math.PI*2+rand(i)*0.1, r0=360+rand(i+3)*160-u*120, r1=1500, w=0.012+rand(i+5)*0.018;
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a-w)*r1,cy+Math.sin(a-w)*r1); ctx.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); ctx.lineTo(cx+Math.cos(a+w)*r1,cy+Math.sin(a+w)*r1); ctx.fill(); }
  ctx.restore();
}
// Onda de choque: anillo que se expande (aterrizajes fuertes, revelaciones).
function ondaChoque(t,t0,x,y,color='#FFFFFF',d=0.45){
  if(t<t0||t>t0+d) return; const u=easeOut((t-t0)/d);
  ctx.save(); ctx.globalAlpha=1-u; ctx.strokeStyle=color; ctx.lineWidth=30*(1-u)+4; ctx.beginPath(); ctx.ellipse(x,y,80+u*520,(80+u*520)*0.32,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
}
// Comparación de escala: dibuja n objetos con fn(x,y,s) apareciendo en cascada (para que los números se VEAN).
function cascada(t,t0,n,fn,{x0=140,y0=360,cols=6,dx=160,dy=170,cada=0.05}={}){
  for(let i=0;i<n;i++){ const k=popIn(t,t0+i*cada,0.25); if(k<=0) continue; fn(x0+(i%cols)*dx, y0+Math.floor(i/cols)*dy, k, i); }
}

// ---------- disfraces agregados con emperador-001 (nov 2026) ----------
// emperador: uniforme azul de gala, charreteras doradas, sombrero alto con pluma. rico: levita, copa y monóculo (o.bolsa, o.chafa).
DISFRACES.emperador = { // uniforme azul de gala con charreteras doradas, banda roja y sombrero alto con pluma
  cuerpo(o){ ctx.fillStyle='#2B3A8C'; ctx.fillRect(-200,-205,400,175); ctx.fillStyle='#22307A'; ctx.fillRect(-4,-205,8,175);
    ctx.fillStyle='#E23D5B'; ctx.save(); ctx.translate(0,-120); ctx.rotate(-0.55); ctx.fillRect(-260,-18,520,36); ctx.restore();
    ctx.fillStyle='#FFD23F'; for(const y of [-180,-140,-100,-62]) for(const x of [-34,34]){ ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill(); } },
  cabeza(o){ const w=o.wob||0, t=o.t||0; ctx.save(); ctx.translate(0,-362); ctx.rotate(-0.06+w*0.07);
    ctx.fillStyle='#1B2257'; ctx.beginPath(); ctx.ellipse(0,0,132,24,0,0,Math.PI*2); ctx.fill();
    rr(-84,-190,168,190,18); ctx.fill(); ctx.fillStyle='#2A3478'; rr(-70,-182,40,170,14); ctx.fill();
    ctx.fillStyle='#FFD23F'; ctx.fillRect(-84,-46,168,24);
    ctx.fillStyle='#E23D5B'; ctx.beginPath(); ctx.arc(-50,-34,22,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.arc(-50,-34,9,0,Math.PI*2); ctx.fill();
    // pluma de pavorreal que se mece
    ctx.save(); ctx.translate(-50,-40); ctx.rotate(-0.35+Math.sin(t*4)*0.08+w*0.35);
    ctx.fillStyle='#17C6B4'; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-70,-120,-20,-250); ctx.quadraticCurveTo(40,-120,0,0); ctx.fill();
    ctx.fillStyle='#4CC9F0'; ctx.beginPath(); ctx.ellipse(-18,-215,22,30,0.2,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#2B3A8C'; ctx.beginPath(); ctx.arc(-17,-212,11,0,Math.PI*2); ctx.fill();
    ctx.restore(); ctx.restore(); },
  frente(o,B){ const w=o.wob||0, t=o.t||0; // charreteras con flecos que rebotan + sable
    for(const s of [-1,1]){ ctx.save(); ctx.translate(s*128,-190); ctx.fillStyle='#FFD23F'; ctx.beginPath(); ctx.ellipse(0,0,52,22,s*0.25,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#F2B807'; ctx.lineWidth=7; ctx.lineCap='round'; for(let i=-3;i<=3;i++){ const sw=Math.sin(t*7+i)*4+w*14; ctx.beginPath(); ctx.moveTo(i*13,12); ctx.lineTo(i*13+sw,44); ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.translate(-120,-70); ctx.rotate(0.5); ctx.fillStyle='#C9CFDA'; rr(-6,0,12,170,6); ctx.fill(); ctx.fillStyle='#FFD23F'; rr(-22,-14,44,16,8); ctx.fill(); ctx.restore(); }
};
DISFRACES.rico = { // comerciante rico de 1850: levita negra, moño rojo, sombrero de copa y monóculo; o.bolsa=true lleva bolsa de oro
  cuerpo(o){ ctx.fillStyle='#2A2438'; ctx.fillRect(-200,-205,400,175); ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.moveTo(-56,-205); ctx.lineTo(0,-90); ctx.lineTo(56,-205); ctx.fill();
    ctx.fillStyle='#E23D5B'; ctx.beginPath(); ctx.moveTo(0,-186); ctx.lineTo(-30,-200); ctx.lineTo(-30,-172); ctx.closePath(); ctx.moveTo(0,-186); ctx.lineTo(30,-200); ctx.lineTo(30,-172); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#FFD23F'; ctx.fillRect(40,-120,60,6); },
  cabeza(o){ const w=o.wob||0; ctx.save(); ctx.translate(0,-360); ctx.rotate(0.08+w*0.08); if(o.chafa){ ctx.rotate(-0.3); }
    ctx.fillStyle='#1E1A2E'; ctx.beginPath(); ctx.ellipse(0,0,120,22,0,0,Math.PI*2); ctx.fill(); rr(-74,o.chafa?-110:-170,148,o.chafa?110:170,12); ctx.fill();
    ctx.fillStyle='#E23D5B'; ctx.fillRect(-74,-36,148,20); ctx.restore(); },
  frente(o,B){ ctx.strokeStyle='#FFD23F'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(52,-288,40,0,Math.PI*2); ctx.stroke();
    ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(88,-270); ctx.quadraticCurveTo(110,-200,80,-150); ctx.stroke();
    if(o.bolsa){ const h=B[1].h; bolsaOro(h[0]+20,h[1]+40,1,o.t); } }
};

if(typeof bolsaOro==='undefined'){ window.bolsaOro=function(x,y,k,t){ if(k<=0) return; ctx.save(); ctx.translate(x,y); ctx.scale(k,k); ctx.rotate(Math.sin((t||0)*3)*0.06);
  ctx.fillStyle='#C98A2B'; blob(0,0,60); ctx.beginPath(); ctx.moveTo(-30,-48); ctx.lineTo(30,-48); ctx.lineTo(18,-80); ctx.lineTo(-18,-80); ctx.fill();
  ctx.fillStyle='#E9B04A'; blob(-16,-12,30); ctx.fillStyle='#FFD23F'; ctx.font=fuente(56); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('$',0,8); ctx.restore(); }
}
