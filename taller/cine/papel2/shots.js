// "Si doblas una hoja 42 veces llega a la Luna" — versión 2: 17 tomas, escenarios Poly Haven, planetas NASA, papel flexible.
import {THREE,E,W,H,iniciar,glb,Bot,PilaFlex,std,estrellas,edificio,TEX,clamp,lerp,L3,eo,ei,eio,es,back,pr,rand,render,palabras,chunks,subs,cifra,WD,
  pbr,hdrLocal,modelo,lunaReal,tierraReal,proyecta,destello,expresionesRobot} from '../core.js';
let BOT, CH, S={}; const PI=Math.PI;
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const WALK=0.64; // unidades/seg con vel 1 (calibrado: sin patinar)
function sombra(l,r=6,far=80){ l.castShadow=true; l.shadow.mapSize.set(2048,2048); const s=l.shadow.camera; s.left=-r; s.right=r; s.top=r; s.bottom=-r; s.near=0.5; s.far=far; l.shadow.bias=-0.0003; l.shadow.normalBias=0.02; }
function apunta(l,dir,tg,d=25){ const n=Math.hypot(...dir); l.target.position.set(...tg); l.position.set(tg[0]-dir[0]/n*d,tg[1]-dir[1]/n*d,tg[2]-dir[2]/n*d); l.target.updateMatrixWorld(); }
// temblor suave (no aleatorio): solo en impactos
function tiembla(t,a){ return [a*(Math.sin(t*31)+0.6*Math.sin(t*57+1)),a*(Math.sin(t*37+2)+0.6*Math.sin(t*71)),a*0.5*Math.sin(t*43+3)]; }
function chispas(n,col,size,seed){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size,map:TEX.bola,transparent:true,depthWrite:false,color:col,blending:THREE.AdditiveBlending})); p.userData.seed=seed; p.frustumCulled=false; return p; }
function papelitos(s,n=60){ const arr=[]; const m=new THREE.MeshStandardMaterial({color:'#f4f1ea',roughness:0.8,side:THREE.DoubleSide}); for(let k=0;k<n;k++){ const q=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.16),m); q.castShadow=true; s.add(q); arr.push(q); } return arr; }
function vuela(arr,t,c,{v=3,vy=5,g=4.9,spread=1,t0=0,esc=1}={}){ arr.forEach((q,k)=>{ const tt=t-t0-rand(k*9)*0.15; q.visible=tt>0; if(tt<=0) return; const a=rand(k)*PI*2, vv=v*(0.4+rand(k*3)), vvy=vy*(0.4+rand(k*5));
  q.position.set(c[0]+Math.cos(a)*(spread*0.5+vv*tt),Math.max(c[1]-5,c[1]+vvy*tt-g*tt*tt),c[2]+Math.sin(a)*(spread*0.5+vv*tt)); q.rotation.set(tt*(4+k%5),tt*(3+k%3),tt*2); q.scale.setScalar(esc); }); }
function humo(s,n,col='#c9c3d6'){ const arr=[]; for(let k=0;k<n;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:col,transparent:true,depthWrite:false,opacity:0})); s.add(sp); arr.push(sp); } return arr; }
function sopla(arr,t,c,{r0=0.5,v=2,sz=1,up=0.6,t0=0,op=0.6,vida=1.8}={}){ arr.forEach((sp,k)=>{ const tt=t-t0-rand(k)*0.15; if(tt<=0){ sp.material.opacity=0; return; } const a=rand(k*2)*PI*2, r=r0+tt*v*(0.6+rand(k*4)*0.8);
  sp.position.set(c[0]+Math.cos(a)*r,c[1]+tt*up+rand(k)*sz*0.3,c[2]+Math.sin(a)*r); sp.scale.setScalar(sz*(1+tt*1.5)); sp.material.opacity=op*Math.exp(-tt*2.2/vida)*clamp(tt*8); }); }
// ---------- pila: secuencia de dobleces ----------
// cada doblez: [inicio, duración, eje]. Los 2 primeros dividen la hoja real; desde el 3º la solapa sale de debajo y se dobla encima (mismo tamaño).
function estado(t,F){ let n=1,k=0; for(const [t0,d] of F){ if(t>=t0+d){ n*=2; k++; } else break; } const f=F[k]; let fu=0, sale=1;
  if(f){ fu=t>=f[0]?eio((t-f[0])/f[1]):0; if(k>=2) sale=eo(pr(t,f[0]-0.14,0.14)); } return {n,k,fu,sale,eje:f?f[2]:'x'}; }
function ponPila(P,st,org=[0,0,0]){ const {n,k,fu,sale,eje}=st; let off;
  if(k===0){ P.set(1,fu,1.0,2.8,'x'); off=[-0.5,0,0]; }
  else if(k===1){ P.set(2,fu,1.4,1.0,'z'); off=[-0.5,0,-0.7]; }
  else { const e=k%2===0?'x':'z'; if(e==='x') P.set(n,fu,1.0,1.4,'x'); else P.set(n,fu,1.4,1.0,'z'); off=[-0.5,0,-0.7];
    if(fu<=0){ P.flap.visible=sale>0.01; const d=(1-sale)*(e==='x'?1.0:1.4); if(e==='x') P.flap.position.set(-d,-0.0005,0); else P.flap.position.set(0,-0.0005,-d); } }
  P.g.position.set(org[0]+off[0],org[1]+off[1],org[2]+off[2]); return n*P.th; }
// centro de la pila tras el 2º doblez (en coordenadas de la escena, relativo a org)
const CENTRO=[-0.5,0,-0.7];
// altura del robot que salta en cada doblez (despega antes de que caiga la solapa, aterriza encima)
function saltoPila(t,F,st,th){ const top=st.n*th; for(const [t0,d] of F){ if(t>=t0-0.08&&t<=t0+d+0.06){ const a=pr(t,t0-0.08,d+0.14); const nb=st.n*th; return {y:nb*(1-a)+nb*2*a+Math.sin(a*PI)*0.62,aire:true,t0}; } } return {y:top,aire:false}; }
// =========================== ESCENA AZOTEA ===========================
async function escenaAzotea(){ const s=new THREE.Scene(); const H_=await hdrLocal('rooftop_night_4k.hdr'); s.background=H_.raw; s.backgroundIntensity=0.35; s.environment=H_.env; s.environmentIntensity=0.7; s.backgroundRotation=new THREE.Euler(0,2.2,0); s.environmentRotation=new THREE.Euler(0,2.2,0);
  s.fog=new THREE.FogExp2('#141a2c',0.0016);
  const piso=new THREE.Mesh(new THREE.PlaneGeometry(18,18),pbr('anti_slip_concrete',[5,5],{roughness:0.9})); piso.rotation.x=-PI/2; piso.receiveShadow=true; s.add(piso);
  const muroM=pbr('brushed_concrete',[6,0.3]); for(const [x,z,w,d] of [[0,-9,18,0.35],[0,9,18,0.35],[-9,0,0.35,18],[9,0,0.35,18]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.9,d),muroM); m.position.set(x,0.45,z); m.castShadow=m.receiveShadow=true; s.add(m); }
  const metal=std('#8c9099',{metalness:0.85,roughness:0.35}); for(const [x,z,ry] of [[3.2,-3.4,0.2],[4.6,-1.4,-0.1],[-4.6,2.8,0.4]]){ const ac=new THREE.Group(); const c=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.85,0.95),metal); c.position.y=0.43; c.castShadow=c.receiveShadow=true;
    const v=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.05,32),std('#222',{metalness:0.6,roughness:0.5})); v.position.set(0,0.87,0); ac.add(c,v); ac.position.set(x,0,z); ac.rotation.y=ry; s.add(ac); S.vent=(S.vent||[]).concat(v); }
  const tanque=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1.8,48),std('#5a4b3e',{roughness:0.75,metalness:0.2})); tanque.position.set(-4.4,1.9,-5.2); tanque.castShadow=true; s.add(tanque);
  for(const [x,z] of [[-5.1,-5.9],[-3.7,-5.9],[-5.1,-4.5],[-3.7,-4.5]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,1.0),metal); p.position.set(x,0.5,z); s.add(p); }
  // guirnaldas de focos
  const foco=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffcf8f').multiplyScalar(5)}); const cable=new THREE.LineBasicMaterial({color:'#222'});
  for(const [a,b] of [[[-8.5,2.6,-4],[0.5,2.4,-8.5]],[[0.5,2.4,-8.5],[8.5,2.6,-3]],[[-8.5,2.6,-4],[-6,2.4,6]]]){ const pts=[]; for(let i=0;i<=22;i++){ const u=i/22; const q=L3(a,b,u); q[1]-=Math.sin(u*PI)*0.75; pts.push(new THREE.Vector3(...q)); if(i%1===0){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,8),foco); f.position.copy(pts[pts.length-1]).y-=0.06; s.add(f); } }
    s.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),cable)); }
  const pl=new THREE.PointLight('#ffbf80',5,16,1.5); pl.position.set(0,2.2,-6); s.add(pl);
  const L=lunaReal(45,192); s.add(L);
  const key=new THREE.DirectionalLight('#cbd6ff',2.4); sombra(key,5); s.add(key,key.target); const rim=new THREE.DirectionalLight('#ffb27a',1.1); rim.position.set(6,2,8); s.add(rim);
  const brillo=new THREE.PointLight('#fff2d0',0,6,1.5); s.add(brillo); // luz que emana de la pila antes de despegar
  const P=new PilaFlex(0.03); s.add(P.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const pap=papelitos(s,70), hum=humo(s,26), anillo=new THREE.Mesh(new THREE.RingGeometry(0.7,1,64),new THREE.MeshBasicMaterial({color:'#fff3dc',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  anillo.rotation.x=-PI/2; s.add(anillo); const polvoL=humo(s,30,'#bfb8aa');
  S.az={s,L,P,bot,key,brillo,pap,hum,anillo,polvoL};
}
const FA=[[1.85,0.45,'x'],[2.55,0.4,'z'],[3.05,0.25],[3.38,0.22],[3.68,0.2]];
function lunaFondo(){ const {L,pap,hum,anillo,brillo}=S.az; pap.forEach(q=>q.visible=false); hum.forEach(h=>h.material.opacity=0); anillo.material.opacity=0; brillo.intensity=0; L.position.set(-60,95,-330); L.rotation.set(0.2,3.6,0); }
// 1 — picada desde el cielo hasta el robot
function t01(t){ const {s,P,bot,key}=S.az; lunaFondo(); ponPila(P,estado(t,FA)); bot.g.position.set(-1.7,0,1.3); bot.g.rotation.y=PI*0.55+Math.sin(t*2)*0.15;
  bot.pose(t,[['Idle',0]]); bot.cabeza(0,Math.sin(t*2.6)*0.35); bot.cara({mira:Math.sin(t*2.6)}); apunta(key,[0.3,-0.6,0.7],[-1,0.5,0.5]);
  const u=eio(t/1.04); const eye=L3([10,28,22],[-0.6,1.25,4.6],Math.pow(u,0.8)); const tg=L3([-4,4,-10],[-1.4,0.75,0.9],eo(t/1.04));
  render(s,{eye,target:tg,fov:lerp(55,38,u),bloom:[0.55,0.45,1.35],exp:1.0,t}); }
// 2 — el robot camina a la hoja y la golpea
function t02(t){ const {s,P,bot,key}=S.az; lunaFondo(); ponPila(P,estado(t,FA)); const lt=t-1.04; const wx=lerp(-1.7,-1.25,clamp(lt/0.62));
  bot.g.position.set(wx,0,lerp(1.3,0.75,clamp(lt/0.62))); bot.g.rotation.y=PI*0.62; bot.pose(t,[['Walking',1.04,{vel:1.0}],['Punch',1.66,{once:true,vel:1.25}],['Idle',2.25]]); bot.cara({enojo:0.6*pr(t,1.6,0.15)});
  apunta(key,[0.3,-0.6,0.7],[-1,0.5,0.5]); const k=eio(lt/0.96);
  render(s,{eye:L3([-3.3,0.95,2.9],[-2.9,0.75,2.3],k),target:L3([-1.0,0.6,0.4],[-0.6,0.35,0.2],k),fov:34,dof:[2.9,0.006,0.008],bloom:[0.55,0.45,1.35],t}); }
// 3 — 1º y 2º doblez, salta encima; órbita baja
function t03(t){ const {s,P,bot,key}=S.az; lunaFondo(); const st=estado(t,FA); const top=ponPila(P,st);
  let x=-0.9, z=0.55, y=0; if(t>=2.28){ const a=es(pr(t,2.28,0.3)); x=lerp(-1.25,CENTRO[0]-0.1,a); z=lerp(0.75,CENTRO[2]-0.35,a); y=lerp(0,top,a)+Math.sin(a*PI)*0.75; } else { x=-1.25; z=0.75; }
  const sp=saltoPila(t,FA.slice(1),st,P.th); if(t>2.6) y=sp.y; bot.g.position.set(x,y,z); bot.g.rotation.y=lerp(PI*0.62,PI*0.2,es(pr(t,2.3,0.4)));
  bot.pose(t,[['Idle',2.0],['Jump',2.22,{once:true}],['Idle',2.62],['Jump',2.45,{once:true,vel:1.3}]].sort((a,b)=>a[1]-b[1])); bot.cara({sorpresa:0.3});
  apunta(key,[0.3,-0.6,0.7],[CENTRO[0],0.5,CENTRO[2]]); const lt=t-2.0, a=lerp(-0.4,0.7,eio(lt/1.04));
  render(s,{eye:[CENTRO[0]+Math.sin(a)*3.6,0.55,CENTRO[2]+Math.cos(a)*3.6],target:[CENTRO[0],0.65,CENTRO[2]],fov:44,bloom:[0.55,0.45,1.35],t});
  cifra('42',540,300,300,pr(t,S.w42,0.32),{sub:'DOBLECES'}); }
// 4 — dobleces rápidos y acercamiento a la cara de sorpresa; luz que crece desde la pila
function t04(t){ const {s,P,bot,key,brillo}=S.az; lunaFondo(); const st=estado(t,FA); const top=ponPila(P,st); const sp=saltoPila(t,FA.slice(2),st,P.th);
  bot.g.position.set(CENTRO[0]-0.1,sp.y,CENTRO[2]-0.35); bot.g.rotation.y=PI*0.2; const seq=FA.slice(2).map(([t0])=>['Jump',t0-0.12,{once:true,vel:1.35}]); seq.unshift(['Idle',2.9]); seq.push(['Idle',3.9]); bot.pose(t,seq);
  bot.cara({sorpresa:clamp(0.3+pr(t,3.75,0.2))}); bot.cabeza(-0.25*pr(t,3.8,0.15),0);
  const g=pr(t,3.6,0.42); brillo.intensity=g*6; brillo.position.set(CENTRO[0],top+0.1,CENTRO[2]+0.8); P.base.material[2].emissiveIntensity=0.04+g*0.6; apunta(key,[0.3,-0.6,0.7],[CENTRO[0],top,CENTRO[2]]);
  const k=eio(pr(t,3.04,0.98)); const h=sp.y+0.62; const sh=tiembla(t,0.012*g);
  render(s,{eye:add3(L3([CENTRO[0]+2.6,top+1.1,CENTRO[2]+2.6],[CENTRO[0]+0.9,h+0.15,CENTRO[2]+1.55],k),sh),target:[CENTRO[0]-0.1,h-0.05,CENTRO[2]-0.35],fov:lerp(42,34,k),bloom:[0.55+g*0.5,0.5,1.35],t});
  P.base.material[2].emissiveIntensity=0.04; }
// 5 — despegue: contrapicada desde el piso
function t05(t){ const {s,P,bot,key,pap,hum,anillo}=S.az; lunaFondo(); const lt=t-4.02; const Hh=0.96+Math.pow(lt/0.61,2.2)*140; P.flap.visible=false; P.set(32,0,1.0,1.4,'x',Hh); P.g.position.set(CENTRO[0],0,CENTRO[2]);
  bot.g.position.set(CENTRO[0]-0.1,Hh,CENTRO[2]-0.35); bot.pose(t,[['Jump',4.0,{fijo:0.3}]]); bot.cara({sorpresa:1}); apunta(key,[0.3,-0.6,0.7],[CENTRO[0],2,CENTRO[2]]);
  vuela(pap,t,[CENTRO[0],0.3,CENTRO[2]],{v:4,vy:6,t0:4.02}); sopla(hum,t,[CENTRO[0],0.1,CENTRO[2]],{r0:0.8,v:4,sz:1.2,t0:4.02,op:0.5});
  anillo.position.set(CENTRO[0],0.02,CENTRO[2]); anillo.scale.setScalar(1+lt*14); anillo.material.opacity=0.7*(1-pr(lt,0,0.5));
  const sh=tiembla(t,0.05*(1-pr(lt,0,0.6))); render(s,{eye:add3([CENTRO[0]+2.4,0.18,CENTRO[2]+3.0],sh),target:[CENTRO[0],lerp(2,14,es(lt/0.61)),CENTRO[2]-1],fov:68,roll:0.08,bloom:[0.8,0.5,1.35],flash:0.5*(1-pr(lt,0,0.12)),t}); anillo.material.opacity=0; }
// =========================== ESCENA ESPACIO ===========================
async function escenaEspacio(){ const s=new THREE.Scene(); s.background=new THREE.Color('#000'); const st=estrellas(6000,9000,13); s.add(st);
  const T=tierraReal(6000); T.position.set(0,-6000,0); T.rotation.set(0.15,-1.9,0.35); s.add(T);
  const sol=new THREE.DirectionalLight('#fff4e4',2.2); sol.position.set(-1,0.6,0.5); s.add(sol); s.add(new THREE.AmbientLight('#1a2440',0.25));
  const key=new THREE.DirectionalLight('#fff0dc',1.6); sombra(key,4); s.add(key,key.target);
  const nubes=[]; for(let k=0;k<90;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:'#ffffff',transparent:true,depthWrite:false,opacity:0.95})); const a=rand(k)*PI*2, r=4+rand(k*3)*90;
    sp.position.set(Math.cos(a)*r,80+rand(k*5)*80,Math.sin(a)*r); sp.scale.setScalar(18+rand(k*7)*34); s.add(sp); nubes.push(sp); }
  const L=lunaReal(40,256); L.material.color.setScalar(0.78); s.add(L); const P=new PilaFlex(0.03); s.add(P.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const vel=[]; for(let k=0;k<70;k++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.015,5,0.015),new THREE.MeshBasicMaterial({color:'#cfe0ff',transparent:true,opacity:0.5})); s.add(m); vel.push(m); }
  const polvo=humo(s,40,'#cfc8bb'); const roca=[]; for(let k=0;k<40;k++){ const r=new THREE.Mesh(new THREE.DodecahedronGeometry(0.2+rand(k)*0.5),std('#9a9690',{roughness:1})); r.castShadow=true; s.add(r); roca.push(r); }
  S.es={s,T,L,P,bot,nubes,vel,key,sol,polvo,roca};
}
const SOLDIR=[-1,0.6,0.5];
// 6 — impacto contra la Luna (vista lateral, Luna real enorme)
function t06(t){ const {s,T,L,P,bot,key,polvo,roca,vel,nubes}=S.es; vel.forEach(m=>m.visible=false); nubes.forEach(n=>n.visible=false); T.visible=true; const lt=t-4.63;
  const C=[0,30000,0]; L.position.set(C[0],C[1]+40+0.6,C[2]); L.rotation.set(0.3,1.0,0); const imp=0.22; const Y=C[1]+lerp(-9,0,Math.min(1,lt/imp)); P.flap.visible=false; P.set(1<<30,0,1.0,1.4,'x',Y); P.g.position.set(0,0,0);
  bot.g.position.set(-0.1,Y,-0.35); bot.g.rotation.y=PI*0.3; bot.pose(lt,[['Jump',-1,{fijo:0.3}],['Jump',imp,{fijo:0.55}]]); bot.cara({sorpresa:1}); apunta(key,SOLDIR.map(v=>-v),[0,Y,0]);
  const k=pr(lt,imp,0.4); sopla(polvo,lt,[0,C[1]+1.2,0],{r0:0.5,v:7,sz:2.2,up:-0.4,t0:imp,op:0.8,vida:1.2}); roca.forEach((r,i)=>{ const tt=lt-imp; r.visible=tt>0; const a=rand(i)*PI*2, v=3+rand(i*3)*7;
    r.position.set(Math.cos(a)*v*tt,C[1]+1+tt*(rand(i*5)-0.8)*4,Math.sin(a)*v*tt); r.rotation.set(tt*3,tt*2,i); });
  const sh=tiembla(t,0.1*(1-pr(lt,imp,0.4))*(lt>imp?1:0)); render(s,{eye:add3([200,C[1]-120,170],sh),target:[0,C[1]+15,0],fov:55,bloom:[0.6,0.5,1.35],exp:0.9,flash:lt>imp?0.85*(1-pr(lt,imp,0.2)):0,t});
  polvo.forEach(p=>p.material.opacity=0); roca.forEach(r=>r.visible=false); }
// =========================== ESCENA ESCRITORIO ===========================
async function escenaMesa(){ const s=new THREE.Scene(); const H_=await hdrLocal('art_studio_4k.hdr'); s.background=H_.env; s.backgroundBlurriness=0.35; s.backgroundIntensity=0.35; s.environment=H_.env; s.environmentIntensity=0.5; s.backgroundRotation=new THREE.Euler(0,1.2,0); s.environmentRotation=new THREE.Euler(0,1.2,0);
  const mesa=new THREE.Mesh(new THREE.BoxGeometry(26,0.6,16),pbr('kitchen_wood',[3,2],{roughness:0.8})); mesa.position.y=-0.3; mesa.receiveShadow=true; s.add(mesa);
  const lamp=await modelo('desk_lamp_arm_01',6.5); lamp.position.set(4.6,0,-3.6); lamp.rotation.y=-2.3; s.add(lamp);
  const reloj=await modelo('alarm_clock_01',1.15); reloj.position.set(-2.6,0,-1.9); reloj.rotation.y=0.5; s.add(reloj);
  const libros=await modelo('book_encyclopedia_set_01',2.2); libros.position.set(-5.2,0,-3.6); libros.rotation.y=0.25; s.add(libros);
  const planta=await modelo('potted_plant_02',3.4); planta.position.set(-7.5,0,-5.5); s.add(planta);
  const cuaderno=await modelo('binder_notebook',0.25); cuaderno.position.set(3.0,0,2.2); cuaderno.rotation.y=-0.4; cuaderno.scale.multiplyScalar(1); s.add(cuaderno);
  const sp=new THREE.SpotLight('#ffe0b0',22,26,0.6,0.55,1.3); sp.position.set(2.6,5.4,-1.8); sp.target.position.set(0,0,0.6); sombra(sp,6,30); s.add(sp,sp.target);
  const fill=new THREE.DirectionalLight('#dbe6ff',0.8); fill.position.set(-3,4,7); s.add(fill); const rim=new THREE.DirectionalLight('#9ec2ff',1.2); rim.position.set(-6,3,-7); s.add(rim);
  const hoja=new THREE.Mesh(new THREE.BoxGeometry(2,0.004,2.8),[std('#f2efe7'),std('#f2efe7'),new THREE.MeshStandardMaterial({map:TEX.papel,roughness:0.85}),std('#eee'),std('#f2efe7'),std('#f2efe7')]); hoja.position.set(0,0.002,0); hoja.castShadow=hoja.receiveShadow=true; s.add(hoja);
  const P=new PilaFlex(0.02); s.add(P.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const motas=chispas(400,'#ffe7c2',0.02,3); const pos=motas.geometry.attributes.position.array; for(let i=0;i<400;i++){ pos[i*3]=-3+rand(i)*7; pos[i*3+1]=rand(i*2)*4; pos[i*3+2]=-2+rand(i*3)*5; } s.add(motas);
  S.me={s,hoja,P,bot,motas};
}
function motas(t){ S.me.motas.rotation.y=t*0.04; S.me.motas.position.y=Math.sin(t*0.5)*0.1; }
// 7 — llega caminando por la orilla de la hoja (travelling lateral, sin patinar)
function t07(t){ const {s,hoja,P,bot}=S.me; hoja.visible=true; P.g.visible=false; motas(t); const lt=t-5.25; const x=-1.75+WALK*lt;
  bot.g.position.set(x,0,1.62); bot.g.rotation.y=PI/2; bot.pose(lt,[['Walking',0]]); bot.cabeza(0,-0.25);
  render(s,{eye:[x+0.2,0.55,5.6],target:[x+0.15,0.5,1.5],fov:30,dof:[4.0,0.008,0.01],bloom:[0.4,0.45,1.35],exp:1.0,t}); }
// 8 — se detiene, mira el canto de la hoja (sobre el hombro)
function t08(t){ const {s,hoja,P,bot}=S.me; hoja.visible=true; P.g.visible=false; motas(t); const lt=t-6.3; const x=-1.75+WALK*1.05+WALK*Math.min(lt,0.25)*(1-pr(lt,0,0.25)*0.5);
  bot.g.position.set(x,0,1.62); bot.g.rotation.y=lerp(PI/2,PI*0.9,es(pr(lt,0.15,0.4))); bot.pose(lt,[['Walking',-1.05],['Idle',0.2]]); bot.cabeza(0.35*es(pr(lt,0.35,0.3)),0); bot.cara({sorpresa:0.4*pr(lt,0.5,0.3)});
  const k=eio(lt/1.13); render(s,{eye:L3([x+1.9,2.2,4.6],[x+1.3,1.6,3.7],k),target:L3([x-0.1,0.35,1.3],[x-0.1,0.12,1.38],k),fov:36,dof:[1.9,0.01,0.012],bloom:[0.4,0.45,1.35],t}); }
// 9 — macro extremo del canto: 0,1 mm
function t09(t){ const {s,hoja,P,bot}=S.me; hoja.visible=true; P.g.visible=false; motas(t); const lt=t-7.43; const x=-1.75+WALK*1.3;
  bot.g.position.set(x-0.9,0,0.35); bot.g.rotation.y=PI*0.9; bot.pose(lt,[['Idle',1.13]]); bot.cabeza(0.35,0);
  const k=eio(lt/0.88); const eye=L3([x+0.62,0.03,2.3],[x+0.45,0.011,1.62],k); const tg=[x+0.3,0.002,1.4]; render(s,{eye,target:tg,fov:lerp(30,22,k),dof:[Math.hypot(eye[0]-tg[0],eye[2]-tg[2]),0.05,0.02],bloom:[0.3,0.4,1.35],exp:0.8,t});
  const a=proyecta([x+0.35,0.004,1.4]), b=proyecta([x+0.35,0.0,1.4]); const k2=eo(pr(t,S.wmil-0.2,0.3)); if(k2>0){ const g=E.ctx; const xm=(a[0]+b[0])/2; g.save(); g.globalAlpha=k2; g.strokeStyle='#FFD23F'; g.lineWidth=6; g.shadowColor='rgba(0,0,0,0.6)'; g.shadowBlur=12;
    const L=lerp(0,230,k2); g.beginPath(); g.moveTo(xm-110,a[1]-4); g.lineTo(xm+110,a[1]-4); g.moveTo(xm-110,b[1]+4); g.lineTo(xm+110,b[1]+4); g.moveTo(xm,a[1]-4); g.lineTo(xm,a[1]-4-L); g.stroke(); g.restore();
    cifra('0,1 mm',Math.min(860,Math.max(220,xm)),a[1]-L-90,160,k2); } }
const FM=[[8.48,0.5,'x'],[9.46,0.32,'z'],[9.9,0.27],[10.33,0.22],[10.62,0.2],[10.88,0.18]];
// 10 — picada cenital: empuja la esquina y la hoja se dobla curvándose
function t10(t){ const {s,hoja,P,bot}=S.me; hoja.visible=false; P.g.visible=true; motas(t); ponPila(P,estado(t,FM),[0.5,0,0.7]); // misma posición que la hoja
  bot.g.position.set(1.8,0,0.9); bot.g.rotation.y=-PI/2; bot.pose(t,[['Idle',8.0],['Punch',8.33,{once:true,vel:1.25}],['Idle',8.95]]); bot.cara({enojo:0.5*pr(t,8.3,0.15)*(1-pr(t,8.9,0.3))});
  const k=eio(pr(t,8.31,1.15)); render(s,{eye:L3([3.6,3.8,4.6],[3.0,3.1,4.0],k),target:[0.6,0.3,0.4],fov:42,roll:lerp(0.0,0.06,k),bloom:[0.4,0.45,1.35],t});
  if(t>=9.0) cifra('×2',540,300,240,pr(t,9.0,0.28)); }
// 11-12 — sube con la pila: ×4 ×8 ×16 ×32 ×64; supera el reloj y los libros
function t11(t,crane=false){ const {s,hoja,P,bot}=S.me; hoja.visible=false; P.g.visible=true; motas(t); const org=[0.5,0,0.7]; const st=estado(t,FM); const top=ponPila(P,st,org);
  const sp=saltoPila(t,FM.slice(1),st,P.th); const c=[org[0]+CENTRO[0],0,org[2]+CENTRO[2]]; let x=c[0]-0.05, z=c[2]-0.2, y=sp.y;
  if(t<9.75){ const a=es(pr(t,9.3,0.35)); x=lerp(1.8,c[0]-0.05,a); z=lerp(0.9,c[2]-0.2,a); y=Math.max(t<9.66?Math.sin(a*PI)*0.8+a*top:0,sp.y); }
  bot.g.position.set(x,y,z); bot.g.rotation.y=lerp(-PI/2,PI*0.15,es(pr(t,9.3,0.4))); const seq=[['Jump',9.3,{once:true}]]; FM.slice(1).forEach(([t0])=>{ if(t0>9.6) seq.push(['Jump',t0-0.12,{once:true,vel:1.35}]); }); seq.push(['Dance',11.06]); bot.pose(t,seq); bot.cara({sorpresa:0.5});
  const lt=crane?t-10.33:t-9.46; let eye,tg,fov=40;
  if(!crane){ const a=lerp(0.6,1.9,eio(lt/0.87)); eye=[c[0]+Math.sin(a)*3.6,top+0.9,c[2]+Math.cos(a)*3.6]; tg=[c[0],top+0.55,c[2]]; }
  else { const a=lerp(2.2,2.9,eio(lt/0.87)); eye=[c[0]+Math.sin(a)*5.0,lerp(0.6,top+1.6,eio(lt/0.87)),c[2]+Math.cos(a)*5.0]; tg=[c[0],top*0.6+0.5,c[2]]; fov=46; }
  render(s,{eye,target:tg,fov,bloom:[0.4,0.45,1.35],t});
  const ns=[4,8,16,32,64]; let cur=null, t1=0; FM.slice(1).forEach(([t0,d],i)=>{ if(t>=t0+d){ cur=ns[i]; t1=t0+d; } }); if(cur) cifra('×'+cur,540,300,240,pr(t,t1,0.22)); }
// =========================== ESCENA CALLE ===========================
async function escenaCalle(){ const s=new THREE.Scene(); const H_=await hdrLocal('modern_buildings_night_4k.hdr'); s.background=H_.raw; s.backgroundIntensity=0.45; s.environment=H_.env; s.environmentIntensity=0.4;
  s.fog=new THREE.FogExp2('#1b1830',0.0035);
  const asf=new THREE.Mesh(new THREE.PlaneGeometry(40,600),pbr('asphalt_02',[8,120],{roughness:0.45,metalness:0.1})); asf.material.roughness=0.35; asf.rotation.x=-PI/2; asf.position.z=-200; asf.receiveShadow=true; s.add(asf);
  const ace=pbr('brushed_concrete',[1,60]); for(const sx of [-1,1]){ const a=new THREE.Mesh(new THREE.BoxGeometry(5,0.25,600),ace); a.position.set(sx*11.5,0.12,-200); a.receiveShadow=true; s.add(a); }
  const lin=new THREE.MeshBasicMaterial({color:'#d8c78e'}); for(let z=20;z>-300;z-=6){ const l=new THREE.Mesh(new THREE.PlaneGeometry(0.15,2.6),lin); l.rotation.x=-PI/2; l.position.set(0,0.012,z); s.add(l); }
  const g=new THREE.Group(); let i=0; for(const sx of [-1,1]) for(let z=40;z>-420;){ const w=10+rand(i)*10, d=10+rand(i+1)*14, h=24+Math.pow(rand(i*3+sx),1.5)*95; const e=edificio(w,h,d,['#1b2030','#22283a','#262c3d'][i%3],1.0+rand(i)*0.8);
    e.position.set(sx*(14+w/2+rand(i*5)*2),h/2,z-d/2); g.add(e); z-=d+1.5; i++; } s.add(g);
  const torre=edificio(16,100,16,'#1d2333',1.3); torre.position.set(17,50,-48); s.add(torre);
  const farol=await modelo('street_lamp_01',7); const lp=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffd9a0').multiplyScalar(5)});
  for(let z=18;z>-200;z-=24) for(const sx of [-1,1]){ const f=farol.clone(); f.position.set(sx*10,0,z); f.rotation.y=sx>0?PI:0; s.add(f); const b=new THREE.Mesh(new THREE.SphereGeometry(0.22),lp); b.position.set(sx*9.0,6.6,z); s.add(b); }
  for(let z=12;z>-90;z-=24){ for(const sx of [-1,1]){ const pl=new THREE.PointLight('#ffc888',7,26,1.8); pl.position.set(sx*9,6.3,z); s.add(pl); } }
  const autos=[]; for(let k=0;k<12;k++){ const c=new THREE.Group(); const cuerpo=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.9,4.4),std(['#b8202a','#1f5fb8','#d8d8d8','#222','#e0a020'][k%5],{metalness:0.7,roughness:0.25})); cuerpo.position.y=0.7; cuerpo.castShadow=true;
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.7,2.3),std('#0c0c0e',{metalness:0.95,roughness:0.08})); cab.position.set(0,1.42,-0.2); c.add(cuerpo,cab); const dir=k%2?1:-1;
    for(const sx of [-0.65,0.65]){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.14),new THREE.MeshBasicMaterial({color:new THREE.Color('#fff6dd').multiplyScalar(6)})); f.position.set(sx,0.75,-2.2*dir); const r=new THREE.Mesh(new THREE.SphereGeometry(0.12),new THREE.MeshBasicMaterial({color:new THREE.Color('#ff2020').multiplyScalar(4)})); r.position.set(sx,0.8,2.2*dir); c.add(f,r); }
    for(const wz of [-1.4,1.4]) for(const wx of [-0.95,0.95]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.25,20),std('#111')); w.rotation.z=PI/2; w.position.set(wx,0.36,wz); c.add(w); }
    c.userData={dir,lane:dir*(2.2+(k%4>1?3.3:0)),z0:rand(k*7)*300,v:11+rand(k)*7}; s.add(c); autos.push(c); }
  s.add(new THREE.HemisphereLight('#6a78b8','#3a2a2a',0.5)); const key=new THREE.DirectionalLight('#c3ccff',1.6); sombra(key,30,300); s.add(key,key.target);
  const P=new PilaFlex(0.03); s.add(P.g); const bot=new Bot(BOT,1); s.add(bot.g); const pap=papelitos(s,90); const hum=humo(s,30,'#7d788c'); const asfR=[]; const am=pbr('asphalt_02',[0.2,0.2]);
  for(let k=0;k<40;k++){ const r=new THREE.Mesh(new THREE.BoxGeometry(0.5+rand(k)*0.8,0.25,0.5+rand(k*2)*0.8),am); r.castShadow=true; s.add(r); asfR.push(r); }
  S.ca={s,P,bot,autos,key,pap,hum,asfR};
}
const TZ=-48;
function limpiaCalle(){ const {pap,hum,asfR}=S.ca; pap.forEach(q=>q.visible=false); hum.forEach(h=>h.material.opacity=0); asfR.forEach(r=>r.visible=false); }
function autos(t){ for(const c of S.ca.autos){ const u=c.userData; c.position.set(u.lane,0,((u.z0+u.v*t)%300+300)%300*(-u.dir)+(u.dir>0?40:-260)); c.rotation.y=u.dir>0?0:PI; c.children.slice(-4).forEach(w=>w.rotation.x=t*u.v/0.36); } }
function torre(t){ const {P,bot}=S.ca; const lt=t-11.2; const Hh=Math.max(0.05,lt<1.57?150*eo(lt/1.5):150); P.flap.visible=false; P.set(1<<20,0,5,6,'x',Hh); P.g.position.set(0,0,TZ); bot.g.position.set(0,Hh,TZ); return Hh; }
// 13 — erupción en la avenida; cámara baja en travelling
function t13(t){ const {s,P,bot,key,pap,hum,asfR}=S.ca; autos(t); const lt=t-11.2; const Hh=torre(t); bot.pose(t,[['Jump',11,{fijo:0.3}]]); bot.cara({sorpresa:1}); apunta(key,[0.4,-0.6,-0.5],[0,10,TZ],80);
  vuela(pap,t,[0,0.5,TZ],{v:8,vy:12,t0:11.2,esc:3,spread:5}); sopla(hum,t,[0,0.5,TZ],{r0:3,v:7,sz:5,up:1.6,t0:11.2,op:0.3,vida:2.5});
  asfR.forEach((r,k)=>{ const tt=lt-rand(k)*0.1; r.visible=tt>0; const a=rand(k*3)*PI*2, v=5+rand(k)*9, vy=6+rand(k*4)*10; r.position.set(Math.cos(a)*(3+v*tt),Math.max(0.12,vy*tt-4.9*tt*tt),TZ+Math.sin(a)*(3+v*tt)); r.rotation.set(tt*4,tt*3,k); });
  const k=eio(lt/1.57); const sh=tiembla(t,0.15*(1-pr(lt,0,1.1)));
  render(s,{eye:add3(L3([-6,1.0,8],[-4,0.8,-4],k),sh),target:[0,lerp(5,Math.min(Hh,80)*0.75,es(pr(lt,0.15,1.3))),TZ],fov:lerp(48,58,k),bloom:[0.45,0.5,1.35],exp:0.78,t});
  if(t>=S.w20) cifra('20',540,300,280,pr(t,S.w20,0.3),{sub:'DOBLECES'}); }
// 14 — pasa la azotea del rascacielos y saluda
function t14(t){ const {s,P,bot,key}=S.ca; limpiaCalle(); autos(t); const lt=t-12.77; const Hh=lerp(84,122,eo(pr(lt,0,1.21))); P.flap.visible=false; P.set(1<<20,0,5,6,'x',Hh); P.g.position.set(0,0,TZ); bot.g.position.set(0,Hh,TZ); bot.g.rotation.y=PI*0.6;
  bot.pose(lt,[['Jump',-1,{fijo:0.3}],['Wave',0.25,{vel:1.1}]]); bot.cara({feliz:0.9*pr(lt,0.2,0.3)}); apunta(key,[0.4,-0.6,-0.5],[0,Hh,TZ],80);
  const a=lerp(1.55,1.85,lt/1.21); render(s,{eye:[Math.sin(a)*9,Hh+1.4,TZ+Math.cos(a)*9],target:[0,Hh+0.2,TZ],fov:44,bloom:[0.45,0.5,1.35],exp:0.75,t});
  if(t>=13.3) cifra('100 m',540,300,200,pr(t,13.3,0.3)); }
// 15 — dron alto: la torre domina el horizonte de la ciudad
function t15(t){ const {s,P,bot,key}=S.ca; limpiaCalle(); autos(t); const lt=t-13.98; const Hh=lerp(122,175,eo(pr(lt,0,0.87))); P.flap.visible=false; P.set(1<<20,0,5,6,'x',Hh); P.g.position.set(0,0,TZ); bot.g.position.set(0,Hh,TZ);
  bot.pose(lt,[['Wave',0.96]]); apunta(key,[0.4,-0.6,-0.5],[0,Hh,TZ],80); const a=lerp(-0.6,-0.35,lt/0.87);
  render(s,{eye:[Math.sin(a)*70,lerp(150,165,lt/0.87),TZ+Math.cos(a)*70],target:[0,Hh*0.6,TZ],fov:50,bloom:[0.45,0.5,1.35],exp:0.75,t}); }
// 16 — atraviesa las nubes y sale al espacio; Tierra real y destello del sol
function t16(t){ const {s,T,L,P,bot,key,vel,nubes}=S.es; vel.forEach(m=>m.visible=true); nubes.forEach(n=>n.visible=true); const lt=t-14.85; const u=pr(lt,0,1.32); const Y=Math.exp(lerp(Math.log(60),Math.log(3500),Math.pow(u,1.35)));
  P.flap.visible=false; P.set(1<<30,0,1.0,1.4,'x',Y); P.g.position.set(0,0,0); bot.g.position.set(-0.1,Y,-0.35); bot.g.rotation.y=PI*0.3; L.position.set(500,7000,-2500);
  bot.pose(lt,[['Jump',-1,{fijo:0.3}],['ThumbsUp',0.3,{once:true}],['Idle',1.15]]); bot.cara({sorpresa:0.5*(1-pr(lt,0.3,0.3)),feliz:0.8*pr(lt,0.3,0.3)}); apunta(key,SOLDIR.map(v=>-v),[0,Y,0],20);
  s.background.setRGB(...[0.07,0.2,0.5].map(c=>c*(1-es(pr(Y,100,900)))));
  vel.forEach((m,k)=>{ const a=rand(k)*PI*2, r=1.5+rand(k*3)*6; m.position.set(Math.cos(a)*r,Y+((rand(k*5)*40-lt*70*(1+rand(k)))%40+40)%40-20,Math.sin(a)*r); m.material.opacity=0.55*es(pr(lt,0.15,0.4)); });
  const eye=[3.4,Y+1.7,3.8]; render(s,{eye,target:[0,Y-0.7,0],fov:lerp(50,62,u),bloom:[0.45,0.5,1.35],exp:0.9,t});
  destello([-6000,Y+3600,3000],es(pr(lt,0.5,0.6))); const n=Math.round(lerp(20,42,eio(pr(t,15.0,1.1)))); cifra(String(n),540,300,280,1,{sub:'DOBLECES'}); }
// 17 — pasa junto a la Luna, saluda y baila; la Tierra al fondo
function t17(t){ const {s,T,L,P,bot,key,vel,nubes}=S.es; vel.forEach(m=>m.visible=false); nubes.forEach(n=>n.visible=false); s.background.setRGB(0,0,0); const lt=t-16.17;
  const C=[0,20000,0]; L.position.set(C[0]+34,C[1]+3,C[2]-46); L.rotation.set(0.2,0.9+lt*0.03,0); const Y=C[1]+lerp(-14,1.5,eo(pr(lt,0,1.4)));
  P.flap.visible=false; P.set(1<<30,0,1.0,1.4,'x',Y); P.g.position.set(0,0,0); bot.g.position.set(-0.1,Y,-0.35); bot.g.rotation.y=PI*0.15; bot.pose(lt,[['Jump',-1,{fijo:0.3}],['Wave',0.1,{vel:1.2}],['Dance',0.95]]); bot.cara({sorpresa:lerp(0.8,0,pr(lt,0.8,0.4)),feliz:pr(lt,0.8,0.4)});
  T.position.set(-2500,C[1]-9000,-12000); apunta(key,SOLDIR.map(v=>-v),[0,Y,0],20); const k=eio(lt/1.63);
  render(s,{eye:L3([-4.2,Y-1.2,8.2],[-2.8,Y+0.3,5.4],k),target:L3([2,Y+1,-6],[0.6,Y+0.7,-2],k),fov:46,bloom:[0.4,0.5,1.35],exp:0.8,t});
  T.position.set(0,-6000,0); destello([-6000+0,Y+3600,3000],0.6);
  cifra('42',540,300,280,1,{sub:'DOBLECES'}); if(t>=S.wpasa) cifra('440,000 km',540,640,110,pr(t,S.wpasa,0.3),{col:'#FFD23F'}); }
// =========================== MONTAJE ===========================
const TOMAS=[[0,1.04,t01],[1.04,2.0,t02],[2.0,3.04,t03],[3.04,4.02,t04],[4.02,4.63,t05],[4.63,5.25,t06],[5.25,6.3,t07],[6.3,7.43,t08],[7.43,8.31,t09],
  [8.31,9.46,t10],[9.46,10.33,t=>t11(t,false)],[10.33,11.2,t=>t11(t,true)],[11.2,12.77,t13],[12.77,13.98,t14],[13.98,14.85,t15],[14.85,16.17,t16],[16.17,99,t17]];
window.init=async(tl)=>{ await iniciar(); BOT=await glb('/three/examples/models/gltf/RobotExpressive/RobotExpressive.glb'); await expresionesRobot(BOT); palabras(tl.words); CH=chunks(3,16);
  const T=(q,n=1)=>{ let c=0; for(const w of WD){ if(w.t.toLowerCase().replace(/[¡¿!?.,…]/g,'').startsWith(q)){ c++; if(c===n) return w.s; } } return 0; };
  S.w42=T('42'); S.wmil=T('milímetro'); S.w20=T('20'); S.wpasa=T('pasa');
  await escenaAzotea(); await escenaEspacio(); await escenaMesa(); await escenaCalle(); window.S=S; window.listo=true; };
window.frame=(tn)=>{ let t=tn; if(window.MAPA){ const m=window.MAPA.find(x=>tn>=x[0]&&tn<x[1])||window.MAPA[window.MAPA.length-1]; t=m[2]+(tn-m[0])/(m[1]-m[0])*(m[3]-m[2]); } const tm=TOMAS.find(x=>t>=x[0]&&t<x[1]); tm[2](t); if(window.SUBS!==false) subs(CH,t); return E.out.toDataURL('image/jpeg',0.92); };
