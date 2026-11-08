// "Si doblas una hoja 42 veces llega a la Luna" — 11 tomas, personaje robot, 17.8 s
import {THREE,E,W,H,iniciar,hdr,glb,Bot,Pila,std,luna,tierra,estrellas,cieloGrad,ciudad,edificio,TEX,bloque,
  clamp,lerp,L3,eo,ei,eio,es,pr,rand,render,palabras,chunks,subs,cifra,WD} from '../core.js';
let BOT, ENVN, CH, S={};
const PI=Math.PI;
function proj(v){ const p=new THREE.Vector3(...v).project(E.cam); return [(p.x+1)/2*W,(1-p.y)/2*H]; }
function solSombra(l,c,r=6){ l.castShadow=true; l.shadow.mapSize.set(2048,2048); const s=l.shadow.camera; s.left=-r; s.right=r; s.top=r; s.bottom=-r; s.near=0.5; s.far=80; l.shadow.bias=-0.0004; l.shadow.normalBias=0.02; }
function apunta(l,dir,tg,d=25){ l.target.position.set(...tg); l.position.set(tg[0]-dir[0]*d,tg[1]-dir[1]*d,tg[2]-dir[2]*d); l.target.updateMatrixWorld(); }
function shake(t,a,f=23){ return [a*(Math.sin(t*f)+0.5*Math.sin(t*f*2.3+1)),a*(Math.sin(t*f*1.3+2)+0.5*Math.sin(t*f*3.1)),0]; }
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
function polvo(n,box,seed){ const p=new Float32Array(n*3); for(let i=0;i<n;i++) p.set([box[0]+rand(i+seed)*box[3],box[1]+rand(i*2.1+seed)*box[4],box[2]+rand(i*3.7+seed)*box[5]],i*3);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3)); return new THREE.Points(g,new THREE.PointsMaterial({size:0.012,map:TEX.bola,transparent:true,depthWrite:false,color:'#ffe2b0',opacity:0.8,blending:THREE.AdditiveBlending})); }
// ================= ESCENA 1: AZOTEA DE NOCHE =================
function escenaAzotea(){ const s=new THREE.Scene(); s.fog=new THREE.FogExp2('#1b2444',0.0032); s.environment=ENVN; s.environmentIntensity=0.25;
  s.add(cieloGrad('#03061a','#1d2c5c','#3b2c40')); const st=estrellas(2500,7000,5); s.add(st);
  const L=luna(45); s.add(L); const city=new THREE.Group(); ciudad(city,{n:320,r0:24,r1:700,hmin:15,hmax:95,y0:-70,seed:4}); s.add(city);
  const piso=new THREE.Mesh(new THREE.BoxGeometry(16,0.4,16),std('#3a3d45',{roughness:0.95})); piso.position.y=-0.2; piso.receiveShadow=true; s.add(piso);
  const muro=std('#4a4d55',{roughness:0.9}); for(const [x,z,w,d] of [[0,-8,16,0.3],[0,8,16,0.3],[-8,0,0.3,16],[8,0,0.3,16]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.6,d),muro); m.position.set(x,0.3,z); m.castShadow=m.receiveShadow=true; s.add(m); }
  const tanque=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1.6,32),std('#6b5a4a',{roughness:0.8})); tanque.position.set(-4.5,1.6,-5); tanque.castShadow=true; s.add(tanque);
  for(const [x,z] of [[-5.2,-5.6],[-3.8,-5.6],[-5.2,-4.4],[-3.8,-4.4]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.8),std('#333')); p.position.set(x,0.4,z); s.add(p); }
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.05,5),std('#888',{metalness:0.8,roughness:0.3})); ant.position.set(4.5,2.5,-5.5); s.add(ant);
  const roja=new THREE.Mesh(new THREE.SphereGeometry(0.08),new THREE.MeshBasicMaterial({color:'#ff2a2a'})); roja.position.set(4.5,5.05,-5.5); s.add(roja); S.roja=roja;
  for(const [x,z] of [[3,-3],[4.4,-1.2]]){ const ac=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.8,0.9),std('#8a8e96',{roughness:0.6,metalness:0.3})); ac.position.set(x,0.4,z); ac.castShadow=ac.receiveShadow=true; s.add(ac); }
  // guirnalda de focos (catenaria)
  const foco=new THREE.MeshBasicMaterial({color:'#ffc27a'}); const p0=[-7,2.4,-3], p1=[7,2.4,-6];
  for(const [a,b] of [[[-7,2.4,-3],[1,2.2,-7]],[[1,2.2,-7],[7,2.4,-2]]]){ for(let i=0;i<=16;i++){ const u=i/16; const q=L3(a,b,u); q[1]-=Math.sin(u*PI)*0.7; const f=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),foco); f.position.set(...q); s.add(f); } }
  const pl=new THREE.PointLight('#ffc890',4,14,1.6); pl.position.set(0,2.0,-5); s.add(pl);
  const moon=new THREE.DirectionalLight('#c3d0ff',2.6); solSombra(moon); s.add(moon,moon.target); S.moonL=moon;
  s.add(new THREE.HemisphereLight('#7f8fc8','#6f6a66',0.9));
  const rim=new THREE.DirectionalLight('#ffc89a',0.5); rim.position.set(6,1,6); s.add(rim);
  const pila=new Pila(0.03); s.add(pila.g); const bot=new Bot(BOT,1); s.add(bot.g);
  // anillo de polvo del impacto en la Luna
  const anillo=new THREE.Mesh(new THREE.RingGeometry(0.6,1,64),new THREE.MeshBasicMaterial({color:'#fff1d6',transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); anillo.rotation.x=-PI/2; s.add(anillo);
  S.az={s,L,pila,bot,anillo,city};
}
// pila de la azotea: dobleces 1..5 y despegue
const FA=[[1.45,0.5,'x'],[2.2,0.35,'z'],[2.7,0.3,'x'],[3.15,0.27,'z'],[3.55,0.23,'x']];
function estadoPila(t,F,th){ let n=1, fu=0, eje='x', k=0; for(const [t0,d,e] of F){ if(t>=t0+d){ n*=2; k++; continue; } if(t>=t0){ fu=eio((t-t0)/d); eje=e; } else eje=e; break; }
  const nxt=F[k]; if(nxt) eje=nxt[2]; return {n,fu,eje,k}; }
function ponPila(p,st,primero=true){ const {n,fu,eje,k}=st; let Wd,Dd,off; if(k===0){ Wd=1.0;Dd=2.8;off=[0,0,0]; } else if(k===1){ Wd=1.0;Dd=1.4;off=[0,0,-0.7]; } else { Wd=1.0;Dd=1.4;off=[0,0,-0.7]; }
  if(k===1&&eje==='z'){ /* base [-1.4,0], solapa [0,1.4] */ }
  p.g.position.set(...off); const top=p.set(n,fu,Wd,Dd,eje); return {top:n*p.th,off}; }
function tomaA(t){ const {s,L,pila,bot}=S.az; L.position.set(-45,92,-330); L.rotation.y=0.6;
  const st=estadoPila(t,FA); ponPila(pila,st); const u=pr(t,0,1.2); const p=L3([-2.6,0,1.9],[-1.0,0,0.75],es(u)); bot.g.position.set(...p); bot.g.rotation.y=PI*0.62;
  bot.pose(t,[['Walking',0],['Punch',1.12,{once:true,vel:1.2}],['Idle',1.75]]); bot.cara({sorpresa:0.6*pr(t,1.6,0.3)});
  apunta(S.moonL,[0.25,-0.55,0.75],[-0.5,0.5,0.5],25);
  const k=eio(t/2.0); render(s,{eye:L3([1.2,1.0,7.0],[0.4,0.85,4.9],k),target:L3([-1.5,0.9,0.6],[-0.6,0.75,0.3],k),fov:lerp(36,32,k),bloom:[0.9,0.55,0.6],exp:1.05,t}); }
function tomaB(t){ const {s,L,pila,bot}=S.az; L.position.set(-45,92,-330);
  const st=estadoPila(t,FA); const {top,off}=ponPila(pila,st); const c=[0,0,-0.7];
  // salto inicial a la pila y saltitos en cada doblez
  let y=top, x=0, z=-0.85; const j0=pr(t,1.95,0.32); if(t<2.27){ const a=es(j0); x=lerp(-1.0,0,a); z=lerp(0.75,-0.85,a); y=lerp(0,0.06,a)+Math.sin(a*PI)*0.9; }
  for(const [t0,d] of FA.slice(1)){ if(t>=t0-0.05&&t<=t0+d+0.05){ const a=pr(t,t0-0.05,d+0.1); const nb=st.n*pila.th; y=nb*(1-a)+nb*2*a+Math.sin(a*PI)*0.55; } }
  bot.g.position.set(x,y,z); bot.g.rotation.y=lerp(PI*0.62,PI*0.15,es(pr(t,2.0,0.5)));
  const seq=[['Idle',1.75],['Jump',1.95,{once:true}]]; FA.slice(1).forEach(([t0])=>seq.push(['Jump',t0-0.12,{once:true,vel:1.3}])); seq.push(['Idle',3.95]);
  bot.pose(t,seq); bot.cara({sorpresa:clamp(0.3+0.7*pr(t,3.6,0.3))});
  apunta(S.moonL,[0.25,-0.55,0.75],[0,1,-0.7],25);
  const lt=t-2.0, a=lerp(0.35,1.35,eio(lt/2.0)), R=lerp(5.2,4.2,eio(lt/2)); const hh=top+1.25; const sh=t>3.75?shake(t,0.02*pr(t,3.75,0.2)):[0,0,0];
  render(s,{eye:add3([Math.sin(a)*R,lerp(0.5,1.2,lt/2)+top*0.6,-0.7+Math.cos(a)*R],sh),target:[0,hh,-0.7],fov:40,bloom:[0.9,0.55,0.6],exp:1.05,t});
  if(t>=S.w42) cifra('42',540,300,300,pr(t,S.w42,0.35),{sub:'DOBLECES'}); }
function tomaC(t){ const {s,L,pila,bot,anillo}=S.az; const lt=t-4.02; const u=pr(lt,0,0.7); const Hh=Math.exp(lerp(Math.log(0.96),Math.log(380),Math.pow(u,1.8)));
  pila.g.position.set(0,0,-0.7); pila.set(32,0,1.0,1.4,'x',Hh); L.position.set(0,380+44.2,-0.7); L.rotation.y=lt*0.05;
  bot.g.position.set(0,Hh,-0.7); bot.g.rotation.y=PI*0.2; bot.pose(t,[['Jump',4.0,{fijo:0.32}]]); bot.cara({sorpresa:1});
  apunta(S.moonL,[0.3,-0.4,0.8],[0,Hh,-0.7],25);
  const imp=pr(lt,0.7,0.5); anillo.position.set(0,380.5,-0.7); anillo.scale.setScalar(lerp(1,40,eo(imp))); anillo.material.opacity=imp>0?(1-imp)*0.9:0;
  const early=1-es(pr(lt,0,0.35)); const eyeF=[11,Math.max(0.7,Hh-9),9], eye0=[2.6,0.45,3.2]; const eye=L3(eyeF,eye0,early);
  const tg=L3([0,Hh+6,-0.7],[0,Math.min(Hh,30)*0.8+1,-0.7],early); const sh=shake(t,0.04*(imp>0?1-imp:0)+0.01*u);
  render(s,{eye:add3(eye,sh),target:tg,fov:lerp(50,58,u),bloom:[1.0,0.6,0.55],exp:1.05,flash:imp>0?0.85*(1-pr(lt,0.7,0.25)):0,t}); }
// ================= ESCENA 2: ESCRITORIO (MACRO) =================
function escenaMesa(){ const s=new THREE.Scene(); s.background=new THREE.Color('#0d0a0a'); s.environment=ENVN; s.environmentIntensity=0.35; s.fog=new THREE.Fog('#0d0a0a',10,40);
  const mad=TEX.madera.clone(); mad.needsUpdate=true; mad.repeat.set(3,3); const mesa=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({map:mad,roughness:0.45,metalness:0})); mesa.rotation.x=-PI/2; mesa.receiveShadow=true; s.add(mesa);
  for(let i=0;i<26;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.12+rand(i)*0.25,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.08+rand(i*3)*0.1,0.8,0.5+rand(i*7)*0.3)}));
    b.position.set(-14+rand(i*2)*28,1+rand(i*5)*7,-12-rand(i*9)*10); s.add(b); }
  // lámpara
  const pie=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,0.12,32),std('#222',{metalness:0.7,roughness:0.3})); pie.position.set(3.6,0.06,-2.5); s.add(pie);
  const brazo=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,4.4),std('#222',{metalness:0.7,roughness:0.3})); brazo.position.set(3.2,2.1,-2.1); brazo.rotation.z=0.25; s.add(brazo);
  const pant=new THREE.Mesh(new THREE.ConeGeometry(0.75,0.9,32,1,true),std('#1d3b2c',{side:THREE.DoubleSide,metalness:0.4,roughness:0.4})); pant.position.set(2.5,4.2,-1.6); pant.rotation.z=0.5; s.add(pant);
  const foco=new THREE.Mesh(new THREE.SphereGeometry(0.22),new THREE.MeshBasicMaterial({color:'#fff1cf'})); foco.position.set(2.35,3.9,-1.5); s.add(foco);
  const sp=new THREE.SpotLight('#ffe2b8',7,22,0.75,0.6,1.2); sp.position.set(2.3,3.8,-1.5); sp.target.position.set(0,0,0.5); solSombra(sp); sp.shadow.camera.far=20; s.add(sp,sp.target);
  s.add(new THREE.HemisphereLight('#6b7cae','#3a2516',0.5)); const fill=new THREE.DirectionalLight('#ffe9cc',1.3); fill.position.set(1,2.5,6); s.add(fill); const rim=new THREE.DirectionalLight('#8fb4ff',1.4); rim.position.set(-5,3,-6); s.add(rim);
  // taza y lápiz para escala
  const taza=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.8,1.8,40),std('#d9d4ca',{roughness:0.3})); taza.position.set(-3.4,0.9,-2.6); taza.castShadow=true; s.add(taza);
  const lap=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,5.5,6),std('#f0b52a',{roughness:0.5})); lap.rotation.z=PI/2; lap.rotation.y=0.4; lap.position.set(-0.3,0.12,-2.6); lap.castShadow=true; s.add(lap);
  const hoja=new THREE.Mesh(new THREE.BoxGeometry(2,0.006,2.8),[std('#f4f1ea'),std('#f4f1ea'),new THREE.MeshStandardMaterial({map:TEX.papel,roughness:0.8}),std('#eee'),std('#f4f1ea'),std('#f4f1ea')]); hoja.position.set(0,0.003,0); hoja.castShadow=hoja.receiveShadow=true; s.add(hoja);
  const pila=new Pila(0.02); pila.g.visible=false; s.add(pila.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const pv=polvo(500,[-3,0,-2,6,4,5],3); s.add(pv);
  S.me={s,hoja,pila,bot,pv};
}
function tomaD(t){ const {s,hoja,pila,bot,pv}=S.me; hoja.visible=true; pila.g.visible=false; const lt=t-5.25; const x=lerp(-1.7,0.15,lt/1.65);
  bot.g.position.set(x,0,1.62); bot.g.rotation.y=PI/2; bot.pose(lt,[['Walking',0,{vel:0.95}]]); bot.cara({}); pv.rotation.y=t*0.05;
  render(s,{eye:[x+0.1,0.75,5.4],target:[x+0.1,0.6,1.4],fov:30,dof:[4.0,0.008,0.01],bloom:[0.45,0.5,0.9],exp:1.1,t}); }
function tomaE(t){ const {s,hoja,pila,bot,pv}=S.me; hoja.visible=true; pila.g.visible=false; const lt=t-6.9;
  bot.g.position.set(0.15,0,1.62); bot.g.rotation.y=lerp(PI/2,PI*0.15,es(pr(lt,0,0.5))); bot.pose(lt,[['Walking',-1],['Idle',0.15],['Yes',0.55,{once:true}],['Idle',1.35]]); bot.cara({sorpresa:0.3}); pv.rotation.y=t*0.05;
  const k=eio(lt/1.41); const eye=L3([1.9,0.07,2.6],[1.25,0.012,1.86],k);
  render(s,{eye,target:[0.85,0.004,1.4],fov:lerp(34,26,k),dof:[Math.hypot(eye[0]-0.85,eye[2]-1.4),0.04,0.02],bloom:[0.3,0.4,0.95],exp:0.72,t});
  // cota de 0.1 mm sobre el canto
  const a=proj([0.95,0.006,1.4]), b=proj([0.95,0.0,1.4]); const k2=eo(pr(t,S.wdec-0.15,0.35)); if(k2>0){ const g=E.ctx; const xm=(a[0]+b[0])/2; g.save(); g.globalAlpha=k2; g.strokeStyle='#FFD23F'; g.lineWidth=5; g.shadowColor='rgba(0,0,0,0.6)'; g.shadowBlur=12;
    const L=lerp(0,260,k2); g.beginPath(); g.moveTo(xm-90,a[1]-6); g.lineTo(xm+90,a[1]-6); g.moveTo(xm-90,b[1]+6); g.lineTo(xm+90,b[1]+6); g.moveTo(xm,a[1]-6); g.lineTo(xm,a[1]-6-L); g.stroke(); g.restore();
    cifra('0,1 mm',xm,a[1]-6-L-80,150,k2,{col:'#FFFFFF'}); } }
const FM=[[8.5,0.5,'x'],[9.46,0.34,'z'],[9.9,0.3,'x'],[10.33,0.27,'z'],[10.72,0.25,'x']];
function tomaF(t){ const {s,hoja,pila,bot,pv}=S.me; hoja.visible=false; pila.g.visible=true; const st=estadoPila(t,FM); ponPila(pila,st); pila.g.position.x-=0.5;
  // en la mesa la hoja ocupa [-1,1]: base [-1,0], solapa [0,1]
  bot.g.position.set(1.75,0,0.4); bot.g.rotation.y=-PI/2; bot.pose(t,[['Idle',8.0],['Punch',8.33,{once:true,vel:1.25}],['Idle',8.95]]); bot.cara({enojo:0.5*pr(t,8.31,0.2)*(1-pr(t,8.9,0.3))});
  const k=eio(pr(t,8.31,1.15)); render(s,{eye:L3([4.6,3.6,5.6],[4.0,3.0,4.8],k),target:[0.6,0.4,0.2],fov:34,bloom:[0.45,0.5,0.9],exp:1.1,t});
  if(t>=9.0) cifra('×2',540,330,240,pr(t,9.0,0.3)); }
function tomaG(t){ const {s,hoja,pila,bot,pv}=S.me; hoja.visible=false; pila.g.visible=true; const st=estadoPila(t,FM); const {top}=ponPila(pila,st); pila.g.position.x-=0.5;
  let y=top; for(const [t0,d] of FM.slice(1)){ if(t>=t0-0.06&&t<=t0+d+0.06){ const a=pr(t,t0-0.06,d+0.12); const nb=st.n*pila.th; y=nb*(1-a)+nb*2*a+Math.sin(a*PI)*0.6; } }
  const lt=t-9.46; let x=-0.5, z=-0.85; if(lt<0.3){ const a=es(lt/0.3); x=lerp(1.75,-0.5,a); z=lerp(0.4,-0.85,a); y=Math.max(y,Math.sin(a*PI)*0.9+top*a); }
  bot.g.position.set(x,y,z); bot.g.rotation.y=lerp(-PI/2,PI*0.25,es(lt/0.4));
  const seq=[]; FM.slice(1).forEach(([t0])=>seq.push(['Jump',t0-0.12,{once:true,vel:1.3}])); seq.push(['Dance',11.0]); bot.pose(t,seq); bot.cara({sorpresa:0.4});
  const a=lerp(0.9,2.6,eio(lt/1.74)), R=lerp(4.6,4.2,lt/1.74); render(s,{eye:[-0.5+Math.sin(a)*R,top+lerp(0.9,1.4,lt/1.74),-0.7+Math.cos(a)*R],target:[-0.5,top+0.7,-0.7],fov:40,bloom:[0.45,0.5,0.9],exp:1.1,t});
  const nshow=[4,8,16,32]; FM.slice(1).forEach(([t0,d],i)=>{ if(t>=t0+d&&(i===3||t<FM[i+2][0]+FM[i+2][1])) cifra('×'+nshow[i],540,330,240,pr(t,t0+d,0.25)); }); }
// ================= ESCENA 3: AVENIDA =================
function escenaCalle(){ const s=new THREE.Scene(); s.fog=new THREE.FogExp2('#24203a',0.006); s.environment=ENVN; s.environmentIntensity=0.5;
  s.add(cieloGrad('#060818','#2a2350','#4a3048')); s.add(estrellas(1500,7000,9));
  const asf=new THREE.Mesh(new THREE.PlaneGeometry(60,800),new THREE.MeshStandardMaterial({color:'#15161b',roughness:0.18,metalness:0.6})); asf.rotation.x=-PI/2; asf.receiveShadow=true; s.add(asf);
  const ace=std('#2b2c33',{roughness:0.8}); for(const sx of [-1,1]){ const a=new THREE.Mesh(new THREE.BoxGeometry(5,0.2,800),ace); a.position.set(sx*11.5,0.1,0); s.add(a); }
  const lin=new THREE.MeshBasicMaterial({color:'#d9c890'}); for(let z=-300;z<60;z+=6){ const l=new THREE.Mesh(new THREE.PlaneGeometry(0.15,2.5),lin); l.rotation.x=-PI/2; l.position.set(0,0.01,z); s.add(l); }
  const g=new THREE.Group(); let i=0; for(const sx of [-1,1]) for(let z=40;z>-420;z-=0){ const w=10+rand(i)*10, d=10+rand(i+1)*14, h=25+Math.pow(rand(i*3+sx),1.5)*90; const e=edificio(w,h,d,['#1b2030','#22283a','#262c3d'][i%3],1.1+rand(i));
    e.position.set(sx*(14+w/2+rand(i*5)*2),h/2,z-d/2); g.add(e); z-=d+1.5; i++; } s.add(g);
  const torre=edificio(16,100,16,'#1d2333',1.3); torre.position.set(17,50,-48); s.add(torre); S.torre=torre;
  const lp=new THREE.MeshBasicMaterial({color:'#ffd9a0'}); for(let z=20;z>-300;z-=22) for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,6),std('#333')); p.position.set(sx*9.8,3,z); s.add(p); const b=new THREE.Mesh(new THREE.SphereGeometry(0.25),lp); b.position.set(sx*9.2,6,z); s.add(b); }
  const pls=[]; for(let z=10;z>-80;z-=22){ const pl=new THREE.PointLight('#ffc888',30,30,1.8); pl.position.set(-9,5.5,z); s.add(pl); const pr2=pl.clone(); pr2.position.x=9; s.add(pr2); }
  // autos con faros
  const autos=[]; for(let k=0;k<10;k++){ const c=new THREE.Group(); const cuerpo=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.0,4.3),std(['#b8202a','#1f5fb8','#d8d8d8','#222','#e0a020'][k%5],{metalness:0.6,roughness:0.3})); cuerpo.position.y=0.7; cuerpo.castShadow=true;
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.7,2.2),std('#111',{metalness:0.9,roughness:0.1})); cab.position.set(0,1.45,-0.2); c.add(cuerpo,cab); const dir=k%2?1:-1;
    const fr=new THREE.MeshBasicMaterial({color:'#fff6dd'}), tr=new THREE.MeshBasicMaterial({color:'#ff2020'}); for(const sx of [-0.65,0.65]){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.14),fr); f.position.set(sx,0.75,-2.16*dir); const r=new THREE.Mesh(new THREE.SphereGeometry(0.12),tr); r.position.set(sx,0.8,2.16*dir); c.add(f,r); }
    c.userData={dir,lane:(dir>0?1:-1)*(2.2+(k%4>1?3.2:0)),z0:rand(k*7)*360-300,v:12+rand(k)*6}; s.add(c); autos.push(c); }
  s.add(new THREE.HemisphereLight('#7080c0','#806060',0.8)); const key=new THREE.DirectionalLight('#b8c4ff',1.6); solSombra(key,0,30); key.shadow.camera.far=300; s.add(key,key.target); S.keyC=key;
  const pila=new Pila(0.03); s.add(pila.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const restos=[]; for(let k=0;k<70;k++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.03,0.8),std('#f2efe8',{roughness:0.8})); m.castShadow=true; s.add(m); restos.push(m); }
  const humo=[]; for(let k=0;k<24;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:'#b9b3c9',transparent:true,depthWrite:false,opacity:0})); s.add(sp); humo.push(sp); }
  S.ca={s,pila,bot,autos,restos,humo};
}
function autos(t){ for(const c of S.ca.autos){ const u=c.userData; c.position.set(u.lane,0,((u.z0+u.dir*u.v*t*(u.dir>0?1:1))%360+360)%360-320); c.rotation.y=u.dir>0?PI:0; } }
const TZ=-48, TX=0;
function torreCalle(t){ const {pila,bot}=S.ca; const lt=t-11.2; const Hh=lt<0?0.05:Math.max(0.05,150*eo(pr(lt,0,1.5))); pila.g.position.set(TX,0,TZ);
  pila.set(1<<20,0,5,6,'x',Hh); bot.g.position.set(TX,Hh,TZ); return Hh; }
function deb(t){ const {restos,humo}=S.ca; const lt=t-11.2; restos.forEach((m,k)=>{ const a=rand(k)*PI*2, v=6+rand(k*3)*10, vy=6+rand(k*5)*14; const tt=Math.max(0,lt-rand(k*9)*0.3);
    const y=Math.max(0.03,vy*tt-4.9*tt*tt); m.visible=lt>0; m.position.set(TX+Math.cos(a)*(3+v*tt),y,TZ+Math.sin(a)*(3+v*tt)); m.rotation.set(tt*(3+k%5),tt*2,tt*(k%3)); });
  humo.forEach((sp,k)=>{ const a=rand(k*2)*PI*2; const tt=Math.max(0,lt-rand(k)*0.3); const r=3+tt*(5+rand(k*4)*6); sp.position.set(TX+Math.cos(a)*r,1+tt*1.5+rand(k)*2,TZ+Math.sin(a)*r); sp.scale.setScalar(4+tt*7); sp.material.opacity=lt>0?0.55*Math.exp(-tt*0.6):0; }); }
function tomaH(t){ const {s,bot}=S.ca; autos(t); const Hh=torreCalle(t); deb(t); const lt=t-11.2; bot.pose(t,[['Jump',11.0,{fijo:0.3}]]); bot.cara({sorpresa:1}); apunta(S.keyC,[0.4,-0.6,-0.5],[0,10,TZ],60);
  const k=eio(lt/1.57); const tg=[TX,lerp(6,Math.min(Hh,90)*0.75+4,es(pr(lt,0.1,1.3))),TZ]; const sh=shake(t,0.12*(1-pr(lt,0,1.2)));
  render(s,{eye:add3(L3([-3.5,1.1,6],[-4.5,0.7,2],k),sh),target:tg,fov:lerp(46,54,k),bloom:[0.9,0.55,0.6],exp:1.0,t});
  if(t>=S.w20) cifra('20',540,300,280,pr(t,S.w20,0.3),{sub:'DOBLECES'}); }
function tomaI(t){ const {s,pila,bot}=S.ca; autos(t); deb(t); const lt=t-12.77; const Hh=lerp(70,128,eo(pr(lt,0,1.9))); pila.g.position.set(TX,0,TZ); pila.set(1<<20,0,5,6,'x',Hh); bot.g.position.set(TX,Hh,TZ); bot.g.rotation.y=PI*0.35;
  bot.pose(lt,[['Jump',-1,{fijo:0.3}],['Wave',0.35,{vel:1.1}],['ThumbsUp',1.45,{once:true}]]); bot.cara({sorpresa:0.2}); apunta(S.keyC,[0.4,-0.6,-0.5],[0,Hh,TZ],60);
  const a=lerp(1.45,1.7,lt/2.08); render(s,{eye:[TX-Math.sin(a)*9,Hh+1.8,TZ+Math.cos(a)*9],target:[TX,Hh+0.2,TZ],fov:44,bloom:[0.9,0.55,0.6],exp:1.0,t});
  if(t>=13.4){ const p=proj([TX+8.2,100.2,TZ+8.2]); cifra('100 m',540,300,200,pr(t,13.4,0.35)); } }
// ================= ESCENA 4: ESPACIO =================
function escenaEspacio(){ const s=new THREE.Scene(); s.background=new THREE.Color('#000'); s.environment=ENVN; s.environmentIntensity=0.15; const st=estrellas(5000,9000,13); s.add(st);
  const RT=6000; const T=tierra(RT); T.position.set(0,-RT,0); T.rotation.set(0.3,1.2,0.2); s.add(T);
  const sol=new THREE.DirectionalLight('#fff4e0',1.8); sol.position.set(-1,0.6,0.5); s.add(sol); s.add(new THREE.HemisphereLight('#2a4c9a','#000',0.35));
  const key=new THREE.DirectionalLight('#fff0dc',1.5); solSombra(key,0,4); s.add(key,key.target); S.keyE=key;
  const nubes=[]; for(let k=0;k<70;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:'#ffffff',transparent:true,depthWrite:false,opacity:0.9})); const a=rand(k)*PI*2, r=6+rand(k*3)*70;
    sp.position.set(Math.cos(a)*r,90+rand(k*5)*60,Math.sin(a)*r); sp.scale.setScalar(20+rand(k*7)*30); s.add(sp); nubes.push(sp); }
  const L=luna(30); s.add(L); const pila=new Pila(0.03); s.add(pila.g); const bot=new Bot(BOT,1); s.add(bot.g);
  const vel=[]; for(let k=0;k<60;k++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.02,6,0.02),new THREE.MeshBasicMaterial({color:'#bcd6ff',transparent:true,opacity:0.5})); s.add(m); vel.push(m); }
  S.es={s,T,L,pila,bot,nubes,vel,st};
}
function tomaJ(t){ const {s,T,L,pila,bot,vel}=S.es; vel.forEach(m=>m.visible=true); L.material.emissiveIntensity=0.3; const lt=t-14.85; const u=pr(lt,0,1.32); const Y=Math.exp(lerp(Math.log(110),Math.log(3200),Math.pow(u,1.4)));
  pila.set(1<<30,0,1.0,1.4,'x',Y); pila.g.position.set(0,0,0); bot.g.position.set(0,Y,0); bot.g.rotation.y=PI*0.3; L.position.set(400,6000,-2000);
  bot.pose(lt,[['Jump',-1,{fijo:0.3}],['ThumbsUp',0.25,{once:true}],['Idle',1.1]]); bot.cara({sorpresa:0.6}); apunta(S.keyE,[1,-0.6,-0.5],[0,Y,0],20);
  s.background.setRGB(...[0.06,0.16,0.42].map(c=>c*(1-es(pr(Y,120,900)))));
  vel.forEach((m,k)=>{ const a=rand(k)*PI*2, r=2+rand(k*3)*6; m.position.set(Math.cos(a)*r,Y+((rand(k*5)*40-lt*60*(1+rand(k)))%40+40)%40-20,Math.sin(a)*r); m.material.opacity=0.6*es(pr(lt,0.2,0.4)); });
  const eye=[3.2,Y+1.6,3.6]; render(s,{eye,target:[0,Y-0.6,0],fov:lerp(55,62,u),bloom:[0.5,0.5,0.85],exp:0.9,t});
  const n=Math.round(lerp(20,42,eio(pr(t,15.0,1.1)))); cifra(String(n),540,300,280,1,{sub:'DOBLECES'}); }
function tomaK(t){ const {s,T,L,pila,bot,vel}=S.es; const lt=t-16.17; vel.forEach(m=>m.visible=false); s.background.setRGB(0,0,0); L.material.emissiveIntensity=0.12;
  const C=[0,20000,0]; L.position.set(C[0]+34,C[1]+4,C[2]-48); L.rotation.y=0.8+lt*0.03; const Y=C[1]+lerp(-16,2,eo(pr(lt,0,1.5)));
  pila.set(1<<30,0,1.0,1.4,'x',Y); bot.g.position.set(0,Y,0); bot.g.rotation.y=PI*0.15; bot.pose(lt,[['Jump',-1,{fijo:0.3}],['Wave',0.15,{vel:1.2}],['Dance',1.0]]); bot.cara({sorpresa:lerp(0.8,0.1,pr(lt,0.8,0.4))});
  apunta(S.keyE,[1,-0.3,-0.6],[0,Y,0],20); const k=eio(lt/1.63);
  render(s,{eye:L3([-3.6,Y-0.8,7.5],[-2.6,Y+0.2,5.2],k),target:L3([2,Y+1,-6],[0.6,Y+0.6,-2],k),fov:48,bloom:[0.6,0.5,0.8],exp:0.95,flash:0.7*(1-pr(lt,0,0.2)),t});
  cifra('42',540,300,280,1,{sub:'DOBLECES'}); if(t>=S.wpasa) cifra('440,000 km',540,660,110,pr(t,S.wpasa,0.35),{col:'#FFD23F'}); }
// ================= MONTAJE =================
const TOMAS=[[0,2.0,tomaA],[2.0,4.02,tomaB],[4.02,5.25,tomaC],[5.25,6.9,tomaD],[6.9,8.31,tomaE],[8.31,9.46,tomaF],[9.46,11.2,tomaG],[11.2,12.77,tomaH],[12.77,14.85,tomaI],[14.85,16.17,tomaJ],[16.17,99,tomaK]];
window.init=async(tl)=>{ await iniciar(); ENVN=await hdr('moonless_golf_1k.hdr'); BOT=await glb('/three/examples/models/gltf/RobotExpressive/RobotExpressive.glb'); palabras(tl.words); CH=chunks(3,16);
  const T=(q,n=1)=>{ let c=0; for(const w of WD){ if(w.t.toLowerCase().replace(/[¡¿!?.,…]/g,'').startsWith(q)){ c++; if(c===n) return w.s; } } return 0; };
  S.w42=T('42'); S.wdec=T('décima'); S.w20=T('20'); S.wpasa=T('pasa');
  escenaAzotea(); escenaMesa(); escenaCalle(); escenaEspacio(); window.S=S; window.THREE=THREE; window.listo=true; };
window.frame=(t)=>{ const tm=TOMAS.find(x=>t>=x[0]&&t<x[1]); tm[2](t); subs(CH,t); return E.out.toDataURL('image/jpeg',0.92); };
