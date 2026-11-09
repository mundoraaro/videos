// chicxulub-001 — "¡El fin de los dinosaurios fue en Yucatán!" — 20 tomas CINE v2.
// Escenarios: playa de Yucatán (Poly Haven secluded_beach + island_tree_01), espacio con Tierra NASA, mapa 3D de la península,
// cráter recién formado (the_sky_is_on_fire + burned_ground_01), cenote (blue_grotto + dark_rock), invierno de impacto.
import {THREE,E,W,H,iniciar,glb,Bot,std,estrellas,TEX,clamp,lerp,L3,eo,ei,eio,es,back,pr,rand,render,palabras,WD,
  pbr,hdrLocal,modelo,tierraReal,proyecta,destello,expresionesRobot,cifra,fbm,canvasTex} from '../core.js';
let BOT; const S={}; const PI=Math.PI;
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
function sombra(l,r=6,far=80){ l.castShadow=true; l.shadow.mapSize.set(2048,2048); const s=l.shadow.camera; s.left=-r; s.right=r; s.top=r; s.bottom=-r; s.near=0.5; s.far=far; l.shadow.bias=-0.0003; l.shadow.normalBias=0.02; }
function apunta(l,dir,tg,d=25){ const n=Math.hypot(...dir); l.target.position.set(...tg); l.position.set(tg[0]-dir[0]/n*d,tg[1]-dir[1]/n*d,tg[2]-dir[2]/n*d); l.target.updateMatrixWorld(); }
function tiembla(t,a){ return [a*(Math.sin(t*31)+0.6*Math.sin(t*57+1)),a*(Math.sin(t*37+2)+0.6*Math.sin(t*71)),a*0.5*Math.sin(t*43+3)]; }
const glowM=(col,op=1)=>new THREE.SpriteMaterial({map:TEX.bola,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:op});
function humo(s,n,col='#c9c3d6'){ const arr=[]; for(let k=0;k<n;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:col,transparent:true,depthWrite:false,opacity:0})); s.add(sp); arr.push(sp); } return arr; }
function sopla(arr,t,c,{r0=0.5,v=2,sz=1,up=0.6,t0=0,op=0.6,vida=1.8}={}){ arr.forEach((sp,k)=>{ const tt=t-t0-rand(k)*0.15; if(tt<=0){ sp.material.opacity=0; return; } const a=rand(k*2)*PI*2, r=r0+tt*v*(0.6+rand(k*4)*0.8);
  sp.position.set(c[0]+Math.cos(a)*r,c[1]+tt*up+rand(k)*sz*0.3,c[2]+Math.sin(a)*r); sp.scale.setScalar(sz*(1+tt*1.5)); sp.material.opacity=op*Math.exp(-tt*2.2/vida)*clamp(tt*8); }); }
const apaga=arr=>arr.forEach(sp=>sp.material.opacity=0);
// ---------- bola de fuego (asteroide con estela) ----------
function bolaFuego(s,roca,esc=1){ const g=new THREE.Group(); const r=roca.clone(); g.add(r); const nucleo=new THREE.Sprite(glowM('#ffd9a0',1)); const halo=new THREE.Sprite(glowM('#ff7a2a',0.9)); g.add(nucleo,halo);
  const cola=[]; for(let k=0;k<26;k++){ const sp=new THREE.Sprite(glowM(k<8?'#ffc070':'#ff5a1a',0.8)); s.add(sp); cola.push(sp); } s.add(g); return {g,r,nucleo,halo,cola,esc}; }
// pone la bola en p, viajando en dirección dir; fuego 0..1
function ponFuego(B,p,dir,fuego=1,t=0,largo=1){ const {g,r,nucleo,halo,cola,esc}=B; g.visible=true; g.position.set(...p); r.rotation.set(t*0.7,t*1.1,0.3); const n=Math.hypot(...dir); const d=dir.map(v=>v/n);
  nucleo.scale.setScalar(esc*2.6*(0.6+0.4*fuego)*(1+0.06*Math.sin(t*40))); nucleo.material.opacity=0.35+0.65*fuego; halo.scale.setScalar(esc*6*fuego*(1+0.08*Math.sin(t*23))); halo.material.opacity=0.8*fuego;
  cola.forEach((sp,k)=>{ const u=k/cola.length; const L=esc*largo*(1.5+u*22); sp.visible=fuego>0.02; sp.position.set(p[0]-d[0]*L+Math.sin(k*3+t*9)*esc*0.25*u,p[1]-d[1]*L+Math.cos(k*5+t*7)*esc*0.25*u,p[2]-d[2]*L);
    sp.scale.setScalar(esc*(4.2-u*2.2)*(0.7+0.3*rand(k))); sp.material.opacity=fuego*0.75*(1-u); }); }
function escondeFuego(B){ B.g.visible=false; B.cola.forEach(c=>c.visible=false); }
// ---------- dinosaurio sencillo (saurópodo de primitivas) ----------
function dino(col='#6f8f4e'){ const g=new THREE.Group(); const m=std(col,{roughness:0.75}); const m2=std('#4e6a37',{roughness:0.8});
  const cuerpo=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),m); cuerpo.scale.set(1.5,0.95,0.85); cuerpo.position.y=1.9; g.add(cuerpo);
  const cuello=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.42,2.6,16),m); cuello.position.set(1.65,3.0,0); cuello.rotation.z=-0.75; g.add(cuello);
  const cab=new THREE.Mesh(new THREE.SphereGeometry(0.34,20,14),m); cab.scale.set(1.5,0.8,0.8); cab.position.set(2.65,4.0,0); g.add(cab);
  for(const z of [-0.12,0.12]){ const o=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),std('#111')); o.position.set(2.9,4.08,z*1.6); g.add(o); }
  const cola=new THREE.Mesh(new THREE.ConeGeometry(0.45,3.4,16),m); cola.position.set(-2.6,1.75,0); cola.rotation.z=1.75; g.add(cola);
  const patas=[]; for(const [x,z] of [[0.8,0.45],[0.8,-0.45],[-0.8,0.45],[-0.8,-0.45]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.3,1.3,14),m2); p.position.set(x,0.65,z); g.add(p); patas.push(p); }
  for(let k=0;k<6;k++){ const pl=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.35,8),m2); pl.position.set(0.9-k*0.45,2.85-Math.abs(k-1.5)*0.05,0); g.add(pl); }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); g.userData={cuello,cab,patas,cola,m}; return g; }
function animaDino(d,t,seed=0,camina=0){ const u=d.userData; u.cuello.rotation.z=-0.75+Math.sin(t*1.3+seed)*0.06; u.cab.position.y=4.0+Math.sin(t*1.3+seed)*0.12; u.cola.rotation.y=Math.sin(t*1.7+seed)*0.25;
  u.patas.forEach((p,i)=>p.rotation.z=camina*Math.sin(t*5+i*PI*(i%2?1:0)+i)*0.35); }
// ---------- mapa de la península ----------
const LON0=-89.25, LAT0=20.25, KM=20; const geo=(lon,lat)=>[(lon-LON0)*KM,-(lat-LAT0)*KM];
const COSTA=[[-90.7,19.3],[-90.55,19.8],[-90.42,20.5],[-90.38,21.0],[-90.05,21.25],[-89.5,21.32],[-88.6,21.5],[-87.6,21.56],[-87.05,21.5],[-86.8,21.2],[-86.85,20.85],[-87.25,20.45],[-87.45,19.95],[-87.6,19.45],[-87.75,18.85],[-88.15,18.45],[-88.3,18.0],
  [-92,18],[-92,18.55],[-91.6,18.62],[-91.0,18.85]];
function texMapa(){ return canvasTex(2048,1676,(g,w,h)=>{ const X=lon=>(lon+92)/5.5*w, Y=lat=>(22.5-lat)/4.5*h;
  g.fillStyle='#0d3f6e'; g.fillRect(0,0,w,h); // mar profundo
  g.save(); g.filter='blur(60px)'; g.strokeStyle='#2fa6b8'; g.lineWidth=220; g.beginPath(); COSTA.forEach(([lo,la],i)=>i?g.lineTo(X(lo),Y(la)):g.moveTo(X(lo),Y(la))); g.closePath(); g.stroke(); g.restore(); // plataforma turquesa
  g.beginPath(); COSTA.forEach(([lo,la],i)=>i?g.lineTo(X(lo),Y(la)):g.moveTo(X(lo),Y(la))); g.closePath(); g.save(); g.clip();
  const im=g.createImageData(w,h); for(let y=0;y<h;y+=1) for(let x=0;x<w;x++){ const n=fbm(x/180,y/180,5,3), m=fbm(x/40,y/40,3,8); const i=(y*w+x)*4; const sec=y/h; im.data[i]=(58+60*n+25*m)*(1-0.15*sec)|0; im.data[i+1]=(92+60*n+20*m)|0; im.data[i+2]=(42+25*n)|0; im.data[i+3]=255; }
  const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h; tmp.getContext('2d').putImageData(im,0,0); g.drawImage(tmp,0,0); g.restore();
  g.strokeStyle='#efe3c0'; g.lineWidth=10; g.beginPath(); COSTA.slice(0,17).forEach(([lo,la],i)=>i?g.lineTo(X(lo),Y(la)):g.moveTo(X(lo),Y(la))); g.stroke(); }); }
function texAnomalia(){ return canvasTex(1024,1024,(g,w,h)=>{ const cs=['#2b39c9','#1fa3d6','#3fd17a','#f2e14a','#f28b2c','#e0322c']; for(let k=0;k<26;k++){ const r=(1-k/26)*w*0.5; g.fillStyle=cs[k%6]; g.globalAlpha=0.9; g.beginPath(); g.arc(w/2+Math.sin(k)*6,h/2+Math.cos(k*1.3)*6,r,0,PI*2); g.fill(); }
  const r=g.createRadialGradient(w/2,h/2,w*0.3,w/2,h/2,w*0.5); r.addColorStop(0,'rgba(0,0,0,0)'); r.addColorStop(1,'rgba(0,0,0,1)'); g.globalCompositeOperation='destination-out'; g.globalAlpha=1; g.fillStyle=r; g.fillRect(0,0,w,h); }); }
// perfil de cráter (radio R): cuenco, pico central y borde levantado
function perfil(r,R,prof){ const u=r/R; if(u<1){ const cuenco=-prof*(1-Math.pow(u,2.2)); const pico=prof*0.45*Math.exp(-Math.pow((u-0.32)/0.1,2)); return cuenco+pico+prof*0.25*Math.pow(u,6); } return prof*0.55*Math.exp(-(u-1)*3.2); }
function alturaC(x,z,R,prof){ const r=Math.hypot(x,z), a=Math.atan2(z,x); return perfil(r*(1+0.04*Math.sin(a*7)+0.03*Math.sin(a*13)),R,prof)+(fbm(x/R*6+5,z/R*6+5,4,2)-0.5)*prof*0.35; }
function crater(R,prof,tam,seg,mat){ const g=new THREE.PlaneGeometry(tam,tam,seg,seg); g.rotateX(-PI/2); const p=g.attributes.position; for(let i=0;i<p.count;i++){ p.setY(i,alturaC(p.getX(i),p.getZ(i),R,prof)); } g.computeVertexNormals(); const m=new THREE.Mesh(g,mat); m.receiveShadow=true; m.castShadow=true; return m; }
// =========================== PLAYA ===========================
async function rocaLOD0(alto){ const r=await modelo('moon_rock_01',null); const quita=[]; r.traverse(o=>{ if(o.isMesh&&/LOD[123]/.test(o.name+(o.parent?o.parent.name:''))) quita.push(o); }); quita.forEach(o=>o.parent.remove(o));
  const b=new THREE.Box3().setFromObject(r); r.scale.setScalar(alto/(b.max.y-b.min.y)); const w=new THREE.Group(); w.add(r); const b2=new THREE.Box3().setFromObject(w); r.position.y-=b2.min.y; return w; }
async function escenaPlaya(){ const s=new THREE.Scene(); const H1=await hdrLocal('kloofendal_48d_partly_cloudy_puresky_4k.hdr',8); const H2=await hdrLocal('kloofendal_overcast_puresky_4k.hdr',4);
  s.background=H1.raw; s.environment=H1.env; s.backgroundRotation=new THREE.Euler(0,4.9,0); s.environmentRotation=new THREE.Euler(0,4.9,0);
  const arena=new THREE.Mesh(new THREE.PlaneGeometry(220,70,1,1),pbr('coast_sand_01',[40,13],{roughness:1})); arena.rotation.x=-PI/2; arena.position.z=24; arena.receiveShadow=true; s.add(arena);
  const marG=new THREE.PlaneGeometry(4000,2000,200,60); marG.rotateX(-PI/2); const mar=new THREE.Mesh(marG,new THREE.MeshPhysicalMaterial({color:'#1f7f93',roughness:0.12,metalness:0.1,clearcoat:1,clearcoatRoughness:0.1}));
  mar.position.set(0,-0.05,-1011); mar.receiveShadow=true; s.add(mar); const p0=marG.attributes.position.array.slice();
  const orilla=new THREE.Mesh(new THREE.PlaneGeometry(220,3),new THREE.MeshStandardMaterial({color:'#f4fbff',transparent:true,opacity:0.55,roughness:0.6})); orilla.rotation.x=-PI/2; orilla.position.set(0,0.02,-11); s.add(orilla);
  const palmas=[]; const pm=await modelo('island_tree_01',9); for(const [x,z,ry,e] of [[-9,6,0.4,1],[-14,1,2.1,0.85],[10,8,4.0,1.1],[16,-1,1.2,0.9],[-22,10,3.0,1.2]]){ const p=pm.clone(); p.position.set(x,0,z); p.rotation.y=ry; p.scale.multiplyScalar(e); s.add(p); palmas.push(p); }
  const rocas=await modelo('boulder_01',1.3); rocas.position.set(6,0,-7); rocas.rotation.y=0.6; s.add(rocas); const r2=rocas.clone(); r2.position.set(-5.5,0,-8.5); r2.scale.multiplyScalar(0.7); s.add(r2);
  const sol=new THREE.DirectionalLight('#fff1d6',3.0); sombra(sol,14,120); s.add(sol,sol.target); const amb=new THREE.HemisphereLight('#bfe3ff','#c9b48a',0.35); s.add(amb);
  const roca=await rocaLOD0(1.6); roca.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.emissive=new THREE.Color('#ff5a10'); o.material.emissiveIntensity=0.6; } });
  const B=bolaFuego(s,roca,6);
  // ola gigante: muro curvo con espuma arriba (colores por vértice)
  const olaG=new THREE.PlaneGeometry(600,1,160,48); const cols=new Float32Array(olaG.attributes.position.count*3); olaG.setAttribute('color',new THREE.BufferAttribute(cols,3)); const ola0=olaG.attributes.position.array.slice();
  const ola=new THREE.Mesh(olaG,new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:0.18,clearcoat:1,clearcoatRoughness:0.15,side:THREE.DoubleSide})); ola.frustumCulled=false; s.add(ola);
  const rocio=humo(s,36,'#e8f6ff');
  const dinos=[]; for(let k=0;k<4;k++){ const d=dino(['#6f8f4e','#8a7d4f','#5f7d6a','#7d8f3e'][k]); s.add(d); dinos.push(d); }
  const nAsh=2500, aG=new THREE.BufferGeometry(); aG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nAsh*3),3)); const ceniza=new THREE.Points(aG,new THREE.PointsMaterial({size:0.09,map:TEX.bola,color:'#b9b2a8',transparent:true,depthWrite:false})); ceniza.frustumCulled=false; s.add(ceniza);
  const domo=new THREE.Mesh(new THREE.SphereGeometry(1,48,24,0,PI*2,0,PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color('#ff6a20').multiplyScalar(2.2),transparent:true,depthWrite:false,fog:false})); s.add(domo);
  const anillo=new THREE.Mesh(new THREE.RingGeometry(0.85,1,96),new THREE.MeshBasicMaterial({color:'#fff1d0',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false})); anillo.rotation.x=-PI/2; s.add(anillo);
  const bot=new Bot(BOT,1); s.add(bot.g); const polvo=humo(s,30,'#d8c7a0');
  S.niebla=new THREE.FogExp2('#3e3936',0.02); S.pl={s,H1,H2,arena,mar,marG,p0,palmas,sol,amb,B,ola,olaG,ola0,rocio,dinos,ceniza,domo,anillo,bot,polvo,orilla};
}
function olas(t){ const {marG,p0}=S.pl; const p=marG.attributes.position.array; for(let i=0;i<p.length;i+=3){ const x=p0[i], z=p0[i+2]; p[i+1]=0.18*Math.sin(x*0.08+t*1.3)+0.12*Math.sin(z*0.11-t*1.7)+0.06*Math.sin((x+z)*0.3+t*2.3); } marG.attributes.position.needsUpdate=true; marG.computeVertexNormals(); S.pl.orilla.material.opacity=0.35+0.25*Math.sin(t*1.4); }
// modo: 'dia' | 'invierno'
function playa(t,modo='dia'){ const P=S.pl; const inv=modo==='invierno'; const H_=inv?P.H2:P.H1; P.s.background=H_.raw; P.s.environment=H_.env;
  P.s.backgroundIntensity=inv?0.45:1.0; P.s.environmentIntensity=inv?0.5:1.0; P.s.fog=inv?S.niebla:null; P.sol.intensity=inv?0.8:3.0; P.sol.color.set(inv?'#ffb08a':'#fff1d6'); P.amb.intensity=inv?0.15:0.35;
  P.arena.material.color.set(inv?'#8f8a84':'#ffffff'); olas(t); escondeFuego(P.B); P.ola.visible=false; apaga(P.rocio); apaga(P.polvo); P.dinos.forEach(d=>d.visible=false); P.ceniza.visible=inv; P.domo.visible=false; P.anillo.visible=false;
  P.bot.g.position.set(0,0,0); P.bot.g.rotation.set(0,0,0); P.bot.g.scale.setScalar(1); apunta(P.sol,[0.5,-0.55,-0.65],[0,0,0],60); }
function cenizas(t){ const a=S.pl.ceniza.geometry.attributes.position.array; for(let i=0;i<a.length/3;i++){ const x=(rand(i)-0.5)*30, z=(rand(i*3)-0.5)*30-2; const y=((rand(i*7)*14-t*0.9*(0.6+rand(i*5)))%14+14)%14; a[i*3]=x+Math.sin(t*0.8+i)*0.3; a[i*3+1]=y; a[i*3+2]=z; } S.pl.ceniza.geometry.attributes.position.needsUpdate=true; }
// trayectoria del asteroide en el cielo de la playa (u: 0..1 → del cielo alto al horizonte)
const CIELO=u=>L3([-260,230,-700],[60,0,-1100],u);
// A — gancho: robot sentado en la arena, la bola de fuego ya cruza el cielo; voltea arriba
function tA(t,lt=t,fin=false){ const P=S.pl; playa(t); const {bot}=P; bot.g.position.set(0.3,0,1.2); bot.g.rotation.y=PI*1.08; bot.pose(t,[['Sitting',-5,{fijo:1.3}]]);
  const sorp=fin?pr(lt,1.95,0.3):clamp(0.55+pr(lt,0.9,0.4)); bot.cabeza(-0.35*sorp,0.15*Math.sin(lt*1.4)*(1-sorp)); bot.cara({sorpresa:sorp,mira:0.3});
  const u=fin?lerp(0.0,0.2,pr(lt,0,3.6)):lerp(0.18,0.32,lt/2.4); ponFuego(P.B,CIELO(u),[320,-230,-400],1,t,1.2);
  const k=eio(fin?pr(lt,0,3.6):lt/2.4); const eye=fin?L3([1.8,0.85,5.6],[1.3,0.9,4.8],k):L3([1.3,0.9,4.8],[1.1,0.95,4.3],k);
  render(P.s,{eye,target:L3([-0.6,1.7,-6],[-0.9,2.1,-6],k),fov:fin?lerp(50,46,k):lerp(46,43,k),dof:null,bloom:[0.7,0.5,1.35],exp:1.0,t}); }
// G — el impacto en el horizonte: destello, domo de fuego, onda; el robot sale volando hacia atrás
function tG(t){ const P=S.pl; playa(t); const lt=t-16.1; const {bot,domo,anillo,polvo}=P; const imp=0.25;
  if(lt<imp){ ponFuego(P.B,L3(CIELO(0.82),CIELO(1),lt/imp),[320,-230,-400],1,t,1.2); }
  domo.visible=lt>imp; domo.position.set(60,0,-1100); domo.scale.setScalar(lerp(20,260,eo(pr(lt,imp,1.4)))); domo.material.opacity=1-pr(lt,imp+0.5,1.0);
  anillo.visible=lt>imp; anillo.position.set(60,0.5,-1100); anillo.scale.setScalar(lerp(30,1300,pr(lt,imp+0.2,1.3))); anillo.material.opacity=0.8*(1-pr(lt,imp+0.2,1.3));
  const golpe=imp+0.75; bot.g.position.set(0,0,0); bot.g.rotation.y=PI; if(lt>golpe){ const a=pr(lt,golpe,0.7); bot.g.position.set(0,Math.sin(a*PI)*0.9,lerp(0,2.8,eo(a))); bot.g.rotation.x=-0.5*a; }
  bot.pose(lt,[['Idle',-1],['Death',golpe,{once:true,vel:1.4}]]); bot.cara({sorpresa:1});
  sopla(polvo,lt,[0,0.2,-1],{r0:1,v:4,sz:1.6,up:0.5,t0:golpe,op:0.55});
  const sh=tiembla(t,0.1*pr(lt,golpe-0.1,0.1)*(1-pr(lt,golpe,0.8)));
  render(P.s,{eye:add3([2.4,1.0,5.5],sh),target:[-0.4,1.2,-4],fov:46,bloom:[0.9,0.6,1.2],exp:1.0,flash:lt>imp?0.9*(1-pr(lt,imp,0.35)):0,t}); }
// J — la ola de kilómetro y medio se levanta detrás del robot (contrapicada)
function ponOla(h,z,t){ const {ola,olaG,ola0}=S.pl; ola.visible=true; const p=olaG.attributes.position.array, c=olaG.attributes.color.array;
  for(let i=0,j=0;i<p.length;i+=3,j++){ const x=ola0[i], v=ola0[i+1]+0.5; const curl=v>0.7?Math.sin((v-0.7)/0.3*PI*0.8)*0.22*h:0; p[i]=x; p[i+1]=v*h*(1+0.04*Math.sin(x*0.05+t)); p[i+2]=-Math.pow(1-v,1.5)*0.55*h+curl+Math.sin(x*0.04+t*0.7)*2;
    const f=clamp((v-0.8)/0.2); c[j*3]=lerp(0.1,0.92,f); c[j*3+1]=lerp(0.5,0.97,f); c[j*3+2]=lerp(0.58,1.0,f); }
  olaG.attributes.position.needsUpdate=true; olaG.attributes.color.needsUpdate=true; olaG.computeVertexNormals(); ola.position.set(0,0,z); }
function tJ(t){ const P=S.pl; playa(t); const lt=t-25.15; const {bot,rocio}=P; const h=lerp(6,140,es(pr(lt,0.2,2.6))); ponOla(h,lerp(-160,-120,lt/3.5),t);
  bot.g.position.set(0,0,2); bot.g.rotation.y=lerp(0,PI*0.95,es(pr(lt,1.0,0.6))); bot.pose(lt,[['Idle',-1],['Standing',0.9,{once:true}],['Idle',1.9]]); bot.cabeza(-0.3*pr(lt,1.3,0.5),0); bot.cara({sorpresa:pr(lt,1.2,0.3)});
  sopla(rocio,lt,[0,h*0.85,-125],{r0:20,v:12,sz:24,up:-2,t0:0.6,op:0.35,vida:3});
  const k=eio(lt/3.5); render(P.s,{eye:L3([0.5,0.35,5.6],[0.35,0.25,4.8],k),target:L3([0,1.2,0],[0,6,-20],es(pr(lt,0.4,2.4))),fov:lerp(50,62,k),bloom:[0.6,0.5,1.35],exp:1.0,t});
  if(t>=S.wkm) cifra('1.5 km',540,330,200,pr(t,S.wkm,0.3),{sub:'DE ALTO'}); }
// K — corre hacia la cámara; la ola lo alcanza a ver
function tK(t){ const P=S.pl; playa(t); const lt=t-28.65; const {bot}=P; ponOla(140,lerp(-118,-96,lt/2.1),t); const z=2+lt*2.6;
  bot.g.position.set(0.2*Math.sin(lt*3),0,z); bot.g.rotation.y=0; bot.pose(lt,[['Running',0,{vel:1.25}]]); bot.cara({sorpresa:0.8,triste:0.4}); bot.cabeza(0,0.4*Math.sin(lt*2.2));
  const sh=tiembla(t,0.025); render(P.s,{eye:add3([0.6,1.0,z+3.2],sh),target:[0,1.6,z-6],fov:52,bloom:[0.6,0.5,1.35],exp:1.0,t}); }
// L — el hollín tapa el Sol: el cielo se apaga, cae ceniza
function tL(t){ const P=S.pl; const lt=t-30.75; playa(t,'invierno'); cenizas(t); const {bot}=P; const k=pr(lt,0.2,2.0);
  P.s.backgroundIntensity=lerp(0.7,0.18,k); P.s.environmentIntensity=lerp(0.8,0.35,k); P.sol.intensity=lerp(2.4,0.7,k); P.s.fog.density=lerp(0.0,0.02,k);
  bot.g.position.set(0,0,1); bot.g.rotation.y=PI*0.9; bot.pose(lt,[['Idle',0]]); bot.cabeza(-0.45,0); bot.cara({triste:k*0.8,sorpresa:0.3*(1-k)});
  const e=eio(lt/2.5); render(P.s,{eye:L3([2.6,0.8,5.4],[2.0,0.85,4.6],e),target:[-0.4,1.6,-2],fov:46,bloom:[0.5,0.5,1.35],exp:lerp(1.0,0.75,k),tint:[1.0,lerp(1,0.88,k),lerp(1,0.8,k)],t});
  destello([-300,260,-900],0.9*(1-k)); }
// M — frío y oscuridad; de cuatro dinosaurios caen tres
function tM(t){ const P=S.pl; const lt=t-33.25; playa(t,'invierno'); cenizas(t); const {bot,dinos,polvo}=P;
  const pos=[[-7,-6],[-2.5,-9],[3,-7.5],[7.5,-5]]; const caida=[S.wtres+0.05,S.wtres+0.45,S.wtres+0.85]; // el 4º (más chico) sigue de pie
  dinos.forEach((d,k)=>{ d.visible=true; d.position.set(pos[k][0],0,pos[k][1]); d.rotation.set(0,PI*0.5+k*0.3,0); d.scale.setScalar(k===3?0.55:0.8); animaDino(d,t,k,0); d.userData.m.color.set(['#6f8f4e','#8a7d4f','#5f7d6a','#7d8f3e'][k]);
    if(k<3){ const a=pr(t,caida[k],0.7); d.rotation.x=lerp(0,PI/2*0.98,ei(a)); d.position.y=-a*0.4; d.userData.m.color.lerp(new THREE.Color('#6b6560'),a); } });
  sopla(polvo,t,[-2.5,0.5,-7.5],{r0:3,v:2,sz:2.5,up:0.4,t0:caida[1]+0.5,op:0.4,vida:2.5});
  bot.g.position.set(0.5+Math.sin(t*41)*0.012,0,1.5); bot.g.rotation.y=PI*1.05; bot.pose(lt,[['Idle',0,{vel:2.2}]]); bot.cara({triste:0.8}); bot.cabeza(0.1*Math.sin(t*30),0);
  let eye,tg,fov; if(t<S.wtres-0.05){ const a=eio(lt/2.1); eye=L3([2.2,1.3,3.6],[1.6,1.2,3.0],a); tg=[0.5,1.0,1.5]; fov=36; }
  else { const a=eio(pr(t,S.wtres,2.9)); eye=L3([4.5,2.2,7.5],[1.5,2.6,8.5],a); tg=[0,1.6,-6]; fov=48; }
  render(P.s,{eye,target:tg,fov,bloom:[0.4,0.5,1.35],exp:0.78,tint:[1,0.9,0.82],t});
  if(t>=S.wtres) cifra('3 de 4',540,340,190,pr(t,S.wtres,0.3),{sub:'ESPECIES, EXTINTAS'}); }
// T — "seguirían aquí... y nosotros no": playa de día con dinosaurios; el robot se encoge de hombros
function tT(t){ const P=S.pl; const lt=t-61.5; playa(t); const {bot,dinos}=P;
  dinos.forEach((d,k)=>{ d.visible=true; const x=[-9,-3,4,9][k]+lt*0.9*(k%2?1:-1)*0.5; d.position.set(x,0,[-7,-10,-8,-5][k]); d.rotation.set(0,k%2?0:PI,0); d.scale.setScalar([0.9,1.1,0.8,0.7][k]); animaDino(d,t*1.4,k,1); d.userData.m.color.set(['#6f8f4e','#8a7d4f','#5f7d6a','#7d8f3e'][k]); });
  bot.g.position.set(0,0,1.5); bot.g.rotation.y=t<S.wnos?PI*0.85:0; bot.pose(t,[['Wave',61.5],['No',S.wnos-0.1]]); bot.cara({feliz:t<S.wnos?0.8:0,triste:t>=S.wnos?0.6:0});
  let eye,tg,fov=44; if(t<S.wnos-0.1){ const a=eio(pr(lt,0,2.2)); eye=L3([3.5,1.4,6.5],[1.8,1.5,7.5],a); tg=[-0.5,2,-6]; } else { const a=eio(pr(t,S.wnos-0.1,1.2)); eye=L3([0.3,0.95,4.1],[0.25,0.95,3.7],a); tg=[0,0.8,1.5]; fov=36; }
  render(P.s,{eye,target:tg,fov,dof:t>=S.wnos-0.1?[2.3,0.006,0.008]:null,bloom:[0.6,0.5,1.35],exp:1.0,t}); }
// =========================== ESPACIO ===========================
async function escenaEspacio(){ const s=new THREE.Scene(); s.background=new THREE.Color('#000'); s.add(estrellas(6000,9000,21));
  const T=tierraReal(1200); T.position.set(0,0,-2600); T.rotation.set(0.366,0,0); s.add(T);
  const sol=new THREE.DirectionalLight('#fff4e4',2.6); sol.position.set(0.7,0.45,1); s.add(sol); s.add(new THREE.AmbientLight('#1a2440',0.35)); const key=new THREE.DirectionalLight('#fff0dc',1.6); sombra(key,6,60); s.add(key,key.target);
  // marcador de Yucatán (en coordenadas locales de la Tierra)
  const lon=-89.5, lat=21.3, phi=(lon+180)/360*PI*2, th=lat*PI/180; const dir=new THREE.Vector3(-Math.cos(phi)*Math.cos(th),Math.sin(th),Math.sin(phi)*Math.cos(th));
  const yuc=new THREE.Group(); yuc.position.copy(dir.clone().multiplyScalar(1206)); yuc.lookAt(dir.clone().multiplyScalar(3000)); T.add(yuc);
  const punto=new THREE.Sprite(glowM('#ff3a20',1)); yuc.add(punto); const onda=new THREE.Mesh(new THREE.RingGeometry(0.9,1,128),new THREE.MeshBasicMaterial({color:'#fff0c8',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); yuc.add(onda);
  const nube=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({map:TEX.nube,color:'#8a7a6a',transparent:true,depthWrite:false,opacity:0})); nube.position.z=3; yuc.add(nube);
  // otro punto de impacto (océano Pacífico) para "si caía en otro lado"
  const lon2=-140, lat2=5, ph2=(lon2+180)/360*PI*2, th2=lat2*PI/180; const dir2=new THREE.Vector3(-Math.cos(ph2)*Math.cos(th2),Math.sin(th2),Math.sin(ph2)*Math.cos(th2));
  const otro=new THREE.Group(); otro.position.copy(dir2.clone().multiplyScalar(1206)); otro.lookAt(dir2.clone().multiplyScalar(3000)); T.add(otro); const p2=new THREE.Sprite(glowM('#9fe8ff',1)); otro.add(p2);
  // capa del 13 %: manchas de rocas ricas en hidrocarburos
  const man=canvasTex(1024,512,(g,w,h)=>{ const im=g.createImageData(w,h); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const n=fbm(x/60,y/60,5,17); const i=(y*w+x)*4; const a=n>0.62?255:0; im.data[i]=255; im.data[i+1]=80; im.data[i+2]=40; im.data[i+3]=a; } g.putImageData(im,0,0); });
  const capa=new THREE.Mesh(new THREE.SphereGeometry(1209,128,64),new THREE.MeshBasicMaterial({map:man,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); T.add(capa);
  const roca=await rocaLOD0(1); roca.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.emissive=new THREE.Color('#ff4a10'); o.material.emissiveIntensity=0; } });
  const ast=new THREE.Group(); const R=roca.clone(); R.scale.setScalar(4.2); R.position.y=-3.7; ast.add(R); s.add(ast); const B=bolaFuego(s,new THREE.Group(),3.2);
  const vel=[]; for(let k=0;k<80;k++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.03,9),new THREE.MeshBasicMaterial({color:'#ffd2a0',transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false})); s.add(m); vel.push(m); }
  const bot=new Bot(BOT,1); ast.add(bot.g);
  S.es={s,T,sol,key,yuc,punto,onda,nube,otro,p2,capa,ast,R,B,vel,bot};
}
function espacio(t){ const P=S.es; P.T.rotation.set(0.366,0,0); P.T.position.set(0,0,-2600); P.capa.material.opacity=0; P.punto.visible=false; P.onda.visible=false; P.nube.material.opacity=0; P.p2.visible=false; P.ast.visible=true; escondeFuego(P.B); P.vel.forEach(v=>v.visible=false);
  P.R.traverse(o=>{ if(o.isMesh) o.material.emissiveIntensity=0; }); P.T.userData.n.rotation.y=t*0.004; P.bot.g.position.set(0,0,0); P.bot.g.rotation.set(0,0,0); }
// B — 66 millones de años: el robot viaja parado sobre el asteroide; la Tierra al fondo
function tB(t){ const P=S.es; espacio(t); const lt=t-2.4; const {ast,bot,key}=P; ast.position.set(0,0,-lt*14); ast.rotation.set(0.1,lt*0.15,0.05);
  bot.g.rotation.y=-0.5; bot.pose(lt,[['Idle',0],['ThumbsUp',0.6,{once:true}],['Idle',1.7]]); bot.cara({feliz:0.6*pr(lt,0.6,0.3)}); apunta(key,[-0.7,-0.45,-1],[0,0,ast.position.z],20);
  const k=eio(lt/2.2); const z=ast.position.z; render(P.s,{eye:L3([16,6,z+22],[7,2.2,z+9],k),target:[-1.2,0.5,z-1.5],fov:lerp(40,36,k),bloom:[0.5,0.5,1.35],exp:1.0,t});
  if(t>=S.w66) cifra('66',540,330,230,pr(t,S.w66,0.3),{sub:'MILLONES DE AÑOS'}); }
// C — órbita pegada a la roca (10 km) y giro hasta la vista "sobre el hombro" hacia Yucatán
function tC(t){ const P=S.es; espacio(t); const lt=t-4.6; const {ast,bot,key,punto}=P; const z=-(2.2+lt)*14; ast.position.set(0,0,z); ast.rotation.set(0.1,(2.2+lt)*0.15,0.05);
  bot.g.rotation.y=lerp(-0.5,PI,es(pr(t,S.wvenia-0.3,0.6))); bot.pose(t,[['Idle',4.6],['Wave',5.0,{vel:1.1}],['Punch',S.wvenia,{once:true}],['Idle',S.wvenia+0.8]]); bot.cara({sorpresa:pr(lt,0,0.4)*0.6,enojo:0.5*pr(t,S.wvenia,0.2)}); apunta(key,[-0.7,-0.45,-1],[0,0,z],20);
  punto.visible=t>S.wvenia; punto.scale.setScalar(80*(1+0.2*Math.sin(t*9))); punto.material.opacity=pr(t,S.wvenia,0.3);
  let eye,tg,fov; if(t<S.wvenia-0.25){ const a=lerp(0.4,2.2,eio(pr(lt,0,3.4))); eye=[Math.sin(a)*7.5,1.6+0.9*Math.sin(lt),z+Math.cos(a)*7.5]; tg=[0,-0.6,z]; fov=46; }
  else { const a=eio(pr(t,S.wvenia-0.25,1.9)); eye=L3([1.3,1.6,z+3.4],[0.7,1.45,z+2.4],a); tg=L3([0,0.8,z-20],[0,-30,-2600],a); fov=lerp(42,30,a); }
  render(P.s,{eye,target:tg,fov,bloom:[0.5,0.5,1.35],exp:1.0,t});
  if(t>=S.w10km&&t<S.wvenia) cifra('10 km',540,330,210,pr(t,S.w10km,0.3),{sub:'MÁS ALTA QUE EL EVEREST'}); }
// E — 20 km/s: entra a la atmósfera; fuego alrededor, estelas de velocidad, el robot se agarra
function tE(t){ const P=S.es; espacio(t); const lt=t-9.95; const {ast,bot,key,vel,R,T}=P; T.position.set(0,-1400,-1500); const z=0; ast.position.set(0,0,z); ast.rotation.set(0.6,lt*0.4,0.2);
  const f=pr(lt,0.1,1.2); R.traverse(o=>{ if(o.isMesh) o.material.emissiveIntensity=1.2*f; }); P.B.esc=1.6; ponFuego(P.B,[0,-3.9,-0.5],[0.1,0.25,1],f,t,1.6); P.B.halo.material.opacity*=0.5;
  bot.g.rotation.y=0.3; bot.pose(lt,[['Jump',0,{fijo:0.45}]]); bot.cara({sorpresa:1}); bot.cabeza(0,0.3*Math.sin(lt*8)); apunta(key,[-0.3,-0.6,-1],[0,0,0],20);
  vel.forEach((m,k)=>{ m.visible=true; const a=rand(k)*PI*2, r=3+rand(k*3)*14; m.position.set(Math.cos(a)*r,Math.sin(a)*r*0.7,((rand(k*5)*60+lt*90*(1+rand(k)))%60)-40); m.material.opacity=0.55*pr(lt,0,0.4); });
  const sh=tiembla(t,0.08*f); const k=eio(lt/3.1); render(P.s,{eye:add3(L3([3.6,1.6,7.5],[2.6,1.2,5.6],k),sh),target:[0,-0.2,0],fov:lerp(50,44,k),bloom:[0.8,0.55,1.25],exp:1.0,tint:[1,lerp(1,0.92,f),lerp(1,0.85,f)],t});
  if(t>=S.w20) cifra('20 km/s',540,330,200,pr(t,S.w20,0.3)); }
// H — la onda del impacto recorre la Tierra desde Yucatán: 10 mil millones de bombas
function tH(t){ const P=S.es; espacio(t); const lt=t-17.8; const {T,punto,onda,nube,ast}=P; ast.visible=false; T.position.set(0,0,-1700);
  punto.visible=true; punto.scale.setScalar(lerp(260,80,pr(lt,0,0.6))); punto.material.opacity=1; onda.visible=true; onda.scale.setScalar(lerp(20,700,eo(pr(lt,0,2.8)))); onda.material.opacity=0.9*(1-pr(lt,0.6,2.2));
  nube.material.opacity=0.75*pr(lt,0,0.8); nube.scale.setScalar(lerp(30,420,eo(pr(lt,0,2.8))));
  const k=eio(lt/2.8); render(P.s,{eye:L3([500,330,1500],[260,170,900],k),target:[0,0,-1700],fov:42,bloom:[0.7,0.5,1.2],exp:1.0,flash:0.6*(1-pr(lt,0,0.25)),t});
  if(t>=S.w10mil) cifra('10 mil millones',540,330,118,pr(t,S.w10mil,0.3),{sub:'DE BOMBAS ATÓMICAS'}); }
// R1 — solo el 13 % del planeta: manchas rojas sobre la Tierra; el robot flota junto a ella
function tR1(t){ const P=S.es; espacio(t); const lt=t-52.7; const {T,capa,ast,bot,R,key}=P; T.position.set(0,0,-4200); T.rotation.set(0.366,lt*0.05-0.4,0);
  capa.material.opacity=0.85*pr(t,S.w13-0.1,0.5); R.visible=false; ast.position.set(0.2,-0.5,0); ast.rotation.set(0,0,0); bot.g.rotation.set(0.15*Math.sin(lt),PI*1.15,0.1*Math.sin(lt*0.7)); bot.g.position.y=0.15*Math.sin(lt*1.3);
  bot.pose(lt,[['Idle',0],['Yes',1.2]]); bot.cara({sorpresa:0.4,mira:-0.5}); apunta(key,[-0.6,-0.4,-1],[-1.2,0,0],20);
  const k=eio(lt/4.55); render(P.s,{eye:L3([1.6,0.9,4.4],[1.0,0.9,3.5],k),target:L3([0.2,0.0,0],[0,-2,-12],es(pr(lt,0.8,2.5))),fov:lerp(40,44,k),dof:null,bloom:[0.5,0.5,1.35],exp:1.0,t}); R.visible=true;
  if(t>=S.w13) cifra('13%',540,330,240,pr(t,S.w13,0.3),{sub:'DEL PLANETA'}); }
// R2 — Yucatán en rojo; "si caía en otro lado": el asteroide fantasma cae en el océano
function tR2(t){ const P=S.es; espacio(t); const lt=t-57.25; const {T,capa,punto,ast,p2}=P; ast.visible=false; T.position.set(0,0,-2400); T.rotation.set(0.366,lerp(-0.18,0.9,eio(pr(t,S.wsicaia,1.6))),0);
  capa.material.opacity=0.85; punto.visible=true; punto.scale.setScalar(150*(1+0.25*Math.sin(t*8))); punto.material.opacity=1-pr(t,S.wsicaia,0.6);
  const a=pr(t,S.wsicaia+0.6,0.7); p2.visible=a>0; p2.scale.setScalar(lerp(10,260,eo(a))); p2.material.opacity=1-pr(t,S.wsicaia+1.3,1.4);
  const k=eio(lt/4.25); render(P.s,{eye:L3([700,450,1600],[400,250,1000],k),target:[0,0,-2400],fov:38,bloom:[0.6,0.5,1.25],exp:1.0,t}); }
// =========================== CRÁTER ===========================
async function escenaCrater(){ const s=new THREE.Scene(); const H_=await hdrLocal('industrial_sunset_02_puresky_4k.hdr',6); s.background=H_.raw; s.environment=H_.env; s.backgroundIntensity=0.9; s.environmentIntensity=0.8; s.fog=new THREE.FogExp2('#7a4a35',0.0016);
  const C=crater(120,30,700,320,pbr('burned_ground_01',[22,22],{roughness:1})); C.material.color.set('#9a7f6e'); s.add(C);
  
  const pool=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshBasicMaterial({color:new THREE.Color('#ff4a10').multiplyScalar(1.6),transparent:true,opacity:0.5})); pool.rotation.x=-PI/2; pool.position.y=-16; s.add(pool);
  const sol=new THREE.DirectionalLight('#ffb27a',2.2); sombra(sol,8,80); s.add(sol,sol.target); const pl=new THREE.PointLight('#ff6a20',30,200,1.2); pl.position.set(0,10,0); s.add(pl);
  const hum=humo(s,40,'#4a4040'); const bot=new Bot(BOT,1); s.add(bot.g); S.cr={s,sol,hum,bot};
}
// I — grúa desde el borde del cráter (200 km) y, en "aquí viene lo feo", primer plano del robot
function tI(t){ const P=S.cr; const lt=t-20.6; const {bot,hum,sol}=P; const yb=alturaC(0,122,120,30); bot.g.position.set(0,yb-0.05,122); bot.g.rotation.y=t<S.wfeo-0.1?PI:0;
  bot.pose(t,[['Idle',20.6],['Yes',21.2],['Idle',22.6],['Standing',S.wfeo-0.1,{once:true}]]); bot.cara({sorpresa:t<S.wfeo?0.5:0,triste:t>=S.wfeo?0.9:0}); apunta(sol,[-0.4,-0.5,-0.7],[0,yb,122],30);
  hum.forEach((sp,k)=>{ const a=rand(k)*PI*2, r=20+rand(k*3)*90, tt=(t*0.5+rand(k*5)*6)%6; sp.position.set(Math.cos(a)*r,-4+tt*8,Math.sin(a)*r); sp.scale.setScalar(25+tt*9); sp.material.opacity=0.45*Math.sin(tt/6*PI); });
  let eye,tg,fov; if(t<S.wfeo-0.1){ const k=eio(pr(lt,0,3.0)); eye=L3([2.0,yb+1.3,125.5],[60,yb+120,230],k); tg=L3([0,yb+0.6,119],[0,-12,0],es(pr(lt,0.2,2.4))); fov=lerp(42,55,k); }
  else { const k=eio(pr(t,S.wfeo-0.1,1.5)); eye=L3([0.4,yb+0.95,125.2],[0.3,yb+0.9,124.7],k); tg=[0,yb+0.75,122]; fov=34; }
  render(P.s,{eye,target:tg,fov,dof:t>=S.wfeo-0.1?[3.0,0.006,0.01]:null,bloom:[0.7,0.5,1.25],exp:0.95,t});
  if(t>=S.w200&&t<S.wfeo-0.1) cifra('200 km',540,330,210,pr(t,S.w200,0.3),{sub:'DE CRÁTER'}); }
// =========================== MAPA (YUCATÁN) ===========================
async function escenaMapa(){ const s=new THREE.Scene(); const H_=await hdrLocal('kloofendal_48d_partly_cloudy_puresky_4k.hdr',8); s.background=new THREE.Color('#9cc7e8'); s.environment=H_.env; s.environmentIntensity=0.8; s.fog=new THREE.Fog('#a9cde9',220,600);
  const mapaM=new THREE.MeshStandardMaterial({map:texMapa(),roughness:0.85,transparent:true}); const mapa=new THREE.Mesh(new THREE.PlaneGeometry(110,90),mapaM); mapa.rotation.x=-PI/2; mapa.receiveShadow=true; s.add(mapa);
  const marF=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),new THREE.MeshStandardMaterial({color:'#0d3f6e',roughness:0.4})); marF.rotation.x=-PI/2; marF.position.y=-0.05; s.add(marF); S.marF=marF;
  const cx=geo(-89.5,21.3); const enterrado=crater(19,6,60,160,new THREE.MeshStandardMaterial({color:'#c46a2a',roughness:0.8,emissive:'#5a2208',emissiveIntensity:0.6})); enterrado.position.set(cx[0],-7,cx[1]); s.add(enterrado);
  const corte=new THREE.Mesh(new THREE.BoxGeometry(110,7,90),new THREE.MeshStandardMaterial({color:'#c9b089',roughness:1,transparent:true,opacity:0,depthWrite:false})); corte.position.y=-3.6; s.add(corte);
  const anom=new THREE.Mesh(new THREE.CircleGeometry(24,96),new THREE.MeshBasicMaterial({map:texAnomalia(),transparent:true,opacity:0,depthWrite:false})); anom.rotation.x=-PI/2; anom.position.set(cx[0],0.3,cx[1]); anom.renderOrder=5; anom.material.depthTest=false; s.add(anom);
  const pin=(col)=>{ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,12),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(2.5)})); b.position.y=3; const e=new THREE.Mesh(new THREE.SphereGeometry(0.6,20,14),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(3)})); e.position.y=6; g.add(b,e); s.add(g); return g; };
  const merida=pin('#ffd23f'), cancun=pin('#ffd23f'); merida.userData.e=2.6; cancun.userData.e=2.6; const pm=geo(-89.62,20.97), pc=geo(-86.85,21.16); merida.position.set(pm[0],0,pm[1]); cancun.position.set(pc[0],0,pc[1]);
  const cen=[]; const cm=new THREE.MeshBasicMaterial({color:new THREE.Color('#4ff0ff').multiplyScalar(2)}); for(let k=0;k<34;k++){ const a=lerp(0.1,PI-0.1,k/33); const r=17.5+Math.sin(k*2.3)*0.6; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.12,20),cm); c.position.set(cx[0]+Math.cos(a)*r,0.06,cx[1]+Math.sin(a)*r); s.add(c); cen.push(c); }
  const nubes=[]; for(let k=0;k<26;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.nube,color:'#ffffff',transparent:true,depthWrite:false,opacity:0.85})); sp.position.set((rand(k)-0.5)*120,10+rand(k*3)*8,(rand(k*5)-0.5)*100); sp.scale.setScalar(10+rand(k*7)*12); s.add(sp); nubes.push(sp); }
  // avioneta del levantamiento aeromagnético
  const av=new THREE.Group(); const bl=std('#eef2f5',{roughness:0.4,metalness:0.2}), rj=std('#c8302a',{roughness:0.5}); const fus=new THREE.Mesh(new THREE.CapsuleGeometry(0.5,4,8,16),bl); fus.rotation.x=PI/2; av.add(fus);
  const ala=new THREE.Mesh(new THREE.BoxGeometry(7,0.12,1.1),bl); ala.position.set(0,0.35,-0.3); av.add(ala); const cola=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.1,0.6),rj); cola.position.set(0,0.2,2.3); av.add(cola); const der=new THREE.Mesh(new THREE.BoxGeometry(0.1,1,0.7),rj); der.position.set(0,0.65,2.35); av.add(der);
  const hel=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.08,0.12),std('#222')); hel.position.z=-2.6; av.add(hel); av.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); s.add(av);
  // torre de perforación
  const torre=new THREE.Group(); const tm=std('#d9d2c0',{metalness:0.6,roughness:0.4}); for(let k=0;k<4;k++){ const a=k*PI/2+PI/4; const l=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,6.2,6),tm); l.position.set(Math.cos(a)*0.6,3,Math.sin(a)*0.6); l.rotation.set(Math.sin(a)*0.18,0,-Math.cos(a)*0.18); torre.add(l); }
  for(let y=0.6;y<6;y+=0.9){ const w=1.2*(1-y/7.5); const r=new THREE.Mesh(new THREE.TorusGeometry(w,0.04,4,4),tm); r.rotation.x=PI/2; r.rotation.z=PI/4; r.position.y=y; torre.add(r); } torre.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); const pt=geo(-89.75,20.85); torre.position.set(pt[0],0,pt[1]); s.add(torre);
  const B=bolaFuego(s,new THREE.Group(),3.2);
  const sol=new THREE.DirectionalLight('#fff1d6',2.6); sombra(sol,60,300); s.add(sol,sol.target); apunta(sol,[0.4,-0.7,-0.5],[0,0,0],150); s.add(new THREE.HemisphereLight('#cfe8ff','#3a5a30',0.5));
  const bot=new Bot(BOT,1); s.add(bot.g); S.ma={s,mapa,mapaM,corte,enterrado,anom,merida,cancun,pm,pc,cen,nubes,av,hel,torre,B,bot,cx};
}
function mapa(t){ const P=S.ma; S.marF.visible=true; P.mapaM.opacity=1; P.corte.material.opacity=0; P.enterrado.visible=false; P.anom.material.opacity=0; P.merida.visible=P.cancun.visible=false; P.cen.forEach(c=>c.visible=false); P.av.visible=false; P.torre.visible=false; escondeFuego(P.B); P.bot.g.visible=false; P.bot.g.scale.setScalar(1);
  P.nubes.forEach((n,k)=>{ n.visible=false; n.position.x=((rand(k)-0.5)*120+t*1.2+60)%120-60; }); }
// F — de Mérida a Cancún en 15 segundos: la bola de fuego cruza la península; contador
function tF(t){ const P=S.ma; mapa(t); const lt=t-13.05; const {merida,cancun,pm,pc,B}=P; merida.visible=cancun.visible=true; merida.scale.setScalar(2.6*back(pr(lt,0.1,0.3))); cancun.scale.setScalar(2.6*back(pr(lt,0.5,0.3)));
  const u=pr(t,S.wcancun-0.6,1.9); const a=[pm[0],12,pm[1]], b=[pc[0],12,pc[1]]; ponFuego(B,L3(a,b,es(u)),[1,-0.05,0.04],1,t,1);
  const bx=lerp(pm[0],pc[0],es(u)); render(P.s,{eye:[bx-3,lerp(34,30,lt/3),pm[1]+30],target:[bx+2,2,pm[1]-3],fov:50,bloom:[0.6,0.5,1.3],exp:1.0,t});
  const n=Math.round(15*es(u)); cifra(n+' s',540,330,220,pr(t,S.wcancun-0.6,0.3),{sub:'MÉRIDA → CANCÚN'}); }
// N — "¿Y el cráter? Sigue enterrado ahí": la península se vuelve transparente y aparece el cráter bajo tierra
function tN(t){ const P=S.ma; mapa(t); const lt=t-38.3; const {mapaM,corte,enterrado,cx}=P; const k=pr(t,S.wsigue-0.2,0.8); mapaM.opacity=1-0.7*k; corte.material.opacity=0.3*k; enterrado.visible=true; S.marF.visible=k<0.05;
  const e=eio(lt/2.3); render(P.s,{eye:L3([cx[0]+34,46,cx[1]+56],[cx[0]+26,20,cx[1]+40],e),target:[cx[0],lerp(0,-5,k),cx[1]],fov:40,bloom:[0.4,0.5,1.35],exp:1.0,t}); }
// O — 1978: avioneta de Pemex con el robot arriba; el mapa magnético revela el anillo; torre de petróleo
function tO(t){ const P=S.ma; mapa(t); const lt=t-40.6; const {av,hel,bot,anom,torre,cx}=P; av.visible=true; P.nubes.forEach(n=>n.visible=lt<2.3); bot.g.visible=true; const x=cx[0]-30+lt*12; av.position.set(x,7,cx[1]+4); av.rotation.set(0,-PI/2,Math.sin(lt*1.5)*0.08); hel.rotation.z=t*60;
  bot.g.position.set(x+0.4,7.65,cx[1]+4); bot.g.rotation.set(0,-PI/2+0.4,Math.sin(lt*1.5)*0.08); bot.g.scale.setScalar(0.9); bot.pose(lt,[['Idle',0],['Wave',0.3],['Yes',2.4],['ThumbsUp',S.wbusc-40.6,{once:true}]]); bot.cara({feliz:0.7});
  anom.material.opacity=0.55*pr(lt,1.0,1.6); anom.scale.setScalar(lerp(0.3,1,eo(pr(lt,1.0,1.8)))); torre.visible=t>=S.wbusc-0.1; torre.scale.setScalar(back(pr(t,S.wbusc-0.1,0.35))*2.6);
  let eye,tg,fov; if(lt<2.3){ const k=eio(lt/2.3); eye=L3([x-9,10.5,cx[1]+15],[x-6,9.5,cx[1]+13],k); tg=[x+1,7.5,cx[1]+4]; fov=42; } else { const k=eio(pr(lt,2.3,2.45)); eye=L3([cx[0]-6,62,cx[1]+62],[cx[0]-2,72,cx[1]+50],k); tg=[cx[0],0,cx[1]+8]; fov=46; }
  render(P.s,{eye,target:tg,fov,bloom:[0.5,0.5,1.35],exp:1.0,t});
  if(t>=S.w1978) cifra('1978',540,330,220,pr(t,S.w1978,0.3),{sub:'PEMEX'}); }
// P — los cenotes forman un anillo: marcan la orilla del cráter
function tP(t){ const P=S.ma; mapa(t); const lt=t-45.35; const {cen,cx,anom}=P; cen.forEach((c,k)=>{ const a=pr(t,S.wforman-0.2+k*0.04,0.25); c.visible=a>0; c.scale.set(back(a),1,back(a)); });
  anom.material.opacity=0.0; const ring=pr(t,S.wmarcan,0.8); P.mapaM.opacity=1; P.enterrado.visible=ring>0; P.mapaM.opacity=1-0.45*ring; S.marF.visible=ring<0.05;
  const a=lerp(0.9,1.6,eio(lt/4)); render(P.s,{eye:[cx[0]+Math.cos(a)*50,lerp(64,44,eio(lt/4)),cx[1]+Math.sin(a)*50],target:[cx[0],0,cx[1]+8],fov:46,bloom:[0.7,0.5,1.2],exp:1.0,t}); }
// =========================== CENOTE ===========================
async function escenaCenote(){ const s=new THREE.Scene(); const H_=await hdrLocal('blue_grotto_4k.hdr',5); s.background=H_.raw; s.backgroundBlurriness=0.2; s.environment=H_.env; s.backgroundIntensity=0.7;
  const roca=pbr('dark_rock',[8,3],{roughness:0.9}); roca.side=THREE.BackSide; roca.color.set('#d5e4df'); const pared=new THREE.Mesh(new THREE.CylinderGeometry(6,6.6,14,96,24,true),roca); pared.position.y=-1; pared.receiveShadow=true;
  const pp=pared.geometry.attributes.position; for(let i=0;i<pp.count;i++){ const x=pp.getX(i), z=pp.getZ(i), y=pp.getY(i); const a=Math.atan2(z,x); const d=1+0.08*fbm(a*3+5,y*0.3,4,7)-0.04; pp.setX(i,x*d); pp.setZ(i,z*d); } pared.geometry.computeVertexNormals(); s.add(pared);
  const borde=new THREE.Mesh(new THREE.RingGeometry(6,40,96,4),pbr('coast_sand_01',[16,16])); borde.rotation.x=-PI/2; borde.position.y=6; borde.receiveShadow=true; s.add(borde);
  const agua=new THREE.Mesh(new THREE.CircleGeometry(6.3,96),new THREE.MeshPhysicalMaterial({color:'#0aa3b8',roughness:0.05,metalness:0,clearcoat:1,emissive:'#0a5a70',emissiveIntensity:0.4})); agua.rotation.x=-PI/2; agua.position.y=-4; s.add(agua);
  const rayo=new THREE.Mesh(new THREE.ConeGeometry(4.5,12,48,1,true),new THREE.MeshBasicMaterial({color:'#bff4ff',transparent:true,opacity:0.12,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); rayo.position.set(0.8,1.5,0); rayo.rotation.z=0.1; 
  const sol=new THREE.DirectionalLight('#fff1d6',3.2); sombra(sol,10,60); s.add(sol,sol.target); apunta(sol,[-0.15,-1,0.1],[0,-3,0],30); s.add(new THREE.AmbientLight('#6ab8c8',0.9)); const pa=new THREE.PointLight('#5fe0ff',25,14,1.5); pa.position.set(0,-3.2,0); s.add(pa);
  const pl=await modelo('island_tree_01',7); pl.position.set(-8.5,6,-3); s.add(pl); const rk=await modelo('boulder_01',1.6); rk.position.set(6.8,6,2.5); s.add(rk);
  const gotas=[]; const gm=new THREE.MeshStandardMaterial({color:'#dff8ff',roughness:0.1,transparent:true,opacity:0.85}); for(let k=0;k<70;k++){ const g=new THREE.Mesh(new THREE.SphereGeometry(0.06+rand(k)*0.07,8,6),gm); s.add(g); gotas.push(g); }
  const onda=new THREE.Mesh(new THREE.RingGeometry(0.9,1,64),new THREE.MeshBasicMaterial({color:'#e8fbff',transparent:true,depthWrite:false,side:THREE.DoubleSide})); onda.rotation.x=-PI/2; onda.position.y=-3.98; s.add(onda);
  const bot=new Bot(BOT,1); s.add(bot.g); S.ce={s,agua,gotas,onda,bot};
}
// Q — "te bañas en la cicatriz del asteroide": el robot se avienta al cenote
function tQ(t){ const P=S.ce; const lt=t-49.35; const {bot,gotas,onda,agua}=P; const t0=1.0, dur=0.95; const tj=lt-t0; let p=[4.6,6,0.6], vis=true;
  if(tj>0){ const a=clamp(tj/dur); p=[lerp(4.6,0.5,a),6+3.2*a-13.2*a*a,lerp(0.6,0.3,a)]; if(a>=1){ p=[0.5,-4-0.6*pr(tj,dur,0.3),0.3]; vis=tj<dur+0.25; } }
  bot.g.visible=vis; bot.g.position.set(...p); bot.g.rotation.set(tj>0?clamp(tj/dur)*1.2:0,-PI/2+0.3,0); bot.pose(lt,[['Idle',0],['Yes',0.15],['Jump',t0-0.15,{once:true}]]); bot.cara({feliz:0.9});
  const ts=tj-dur; gotas.forEach((g,k)=>{ const tt=ts-rand(k)*0.08; g.visible=tt>0&&tt<1.6; if(!g.visible) return; const a=rand(k*3)*PI*2, v=1+rand(k)*2.5, vy=4+rand(k*5)*5; g.position.set(0.5+Math.cos(a)*v*tt,-4+vy*tt-9.8*tt*tt*0.5,0.3+Math.sin(a)*v*tt); if(g.position.y<-4) g.visible=false; });
  onda.visible=ts>0; onda.scale.setScalar(0.5+ts*4); onda.material.opacity=0.8*(1-pr(ts,0,1.5)); agua.material.emissiveIntensity=0.4+0.2*Math.sin(t*2);
  const k=eio(lt/3.35); render(P.s,{eye:L3([-3.4,-2.2,3.2],[-3.0,-2.9,2.6],k),target:L3([3.0,5.6,0.4],[0.6,-2.0,0.3],es(pr(lt,0.9,1.2))),fov:lerp(62,54,k),bloom:[0.4,0.5,1.4],exp:0.9,t}); }
// =========================== MONTAJE ===========================
const TOMAS=[[0,2.4,t=>tA(t)],[2.4,4.6,tB],[4.6,9.95,tC],[9.95,13.05,tE],[13.05,16.1,tF],[16.1,17.8,tG],[17.8,20.6,tH],[20.6,25.15,tI],[25.15,28.65,tJ],[28.65,30.75,tK],
  [30.75,33.25,tL],[33.25,38.3,tM],[38.3,40.6,tN],[40.6,45.35,tO],[45.35,49.35,tP],[49.35,52.7,tQ],[52.7,57.25,tR1],[57.25,61.5,tR2],[61.5,64.95,tT],[64.95,99,t=>tA(t,t-64.95,true)]];
window.init=async(tl)=>{ await iniciar(); BOT=await glb('/three/examples/models/gltf/RobotExpressive/RobotExpressive.glb'); await expresionesRobot(BOT); palabras(tl.words);
  const T=(q,n=1)=>{ let c=0; for(const w of WD){ if(w.t.toLowerCase().replace(/[¡¿!?.,…:]/g,'').startsWith(q)){ c++; if(c===n) return w.s; } } console.log('FALTA',q); return 0; };
  Object.assign(S,{w66:T('66'),w10km:T('10'),wvenia:T('venía'),w20:T('20'),wcancun:T('cancún'),w10mil:T('10',2),w200:T('200'),wfeo:T('aquí'),wkm:T('kilómetro'),wtres:T('tres'),wsigue:T('sigue'),
    w1978:T('1978'),wbusc:T('buscando'),wforman:T('forman'),wmarcan:T('marcan'),w13:T('13'),wsicaia:T('caía'),wnos:T('nosotros')});
  await escenaPlaya(); await escenaEspacio(); await escenaCrater(); await escenaMapa(); await escenaCenote(); window.S=S; window.listo=true; };
window.frame=(t)=>{ const tm=TOMAS.find(x=>t>=x[0]&&t<x[1]); tm[2](t); return E.out.toDataURL('image/jpeg',0.92); };
