// nutrias-001 — "Las nutrias duermen de la mano… y no es por cursis." — 19 tomas CINE v2.
// Escenarios: mar abierto (Poly Haven aristea_wreck de día, industrial_sunset_02 al atardecer, kloofendal_overcast con nieve, noche con estrellas y Luna NASA),
// bosque de kelp submarino (boulder_01 + coast_sand_01), macro del pelaje (bosque de pelos instanciados), cocina de tacos (kitchen_wood + art_studio).
import {THREE,E,W,H,iniciar,glb,Bot,std,estrellas,TEX,clamp,lerp,L3,eo,ei,eio,es,back,pr,rand,render,palabras,WD,
  pbr,hdrLocal,modelo,lunaReal,proyecta,expresionesRobot,cifra,fbm,canvasTex,cieloGrad} from '../core.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
// limpia píxeles NaN/infinito (reflejo especular del agua) antes del bloom: evita bloques negros
function pasoNaN(){ const sp=new ShaderPass({uniforms:{tDiffuse:{value:null},px:{value:new THREE.Vector2(1/1080,1/1920)}},vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 px; varying vec2 vUv; bool malo(vec3 c){ return any(isnan(c))||any(isinf(c)); }
   void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; if(malo(c)){ vec3 s=vec3(0.0); float n=0.0; for(int i=-2;i<=2;i++) for(int j=-2;j<=2;j++){ vec3 q=texture2D(tDiffuse,vUv+vec2(float(i),float(j))*px*2.0).rgb; if(!malo(q)){ s+=q; n+=1.0; } } c=n>0.0?s/n:vec3(0.2,0.4,0.5); }
     gl_FragColor=vec4(min(c,vec3(24.0)),1.0); }`}); E.comp.insertPass(sp,1); }
let BOT; const S={}; const PI=Math.PI;
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
function sombra(l,r=6,far=80){ l.castShadow=true; l.shadow.mapSize.set(2048,2048); const s=l.shadow.camera; s.left=-r; s.right=r; s.top=r; s.bottom=-r; s.near=0.5; s.far=far; l.shadow.bias=-0.0003; l.shadow.normalBias=0.02; }
function apunta(l,dir,tg,d=25){ const n=Math.hypot(...dir); l.target.position.set(...tg); l.position.set(tg[0]-dir[0]/n*d,tg[1]-dir[1]/n*d,tg[2]-dir[2]/n*d); l.target.updateMatrixWorld(); }
function tiembla(t,a){ return [a*(Math.sin(t*31)+0.6*Math.sin(t*57+1)),a*(Math.sin(t*37+2)+0.6*Math.sin(t*71)),a*0.5*Math.sin(t*43+3)]; }
const glowM=(col,op=1)=>new THREE.SpriteMaterial({map:TEX.bola,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:op});
// ---------- texturas propias ----------
function texPelo(){ return canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#b9b0a6'; g.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const x=rand(i)*w, y=rand(i*3.1)*h, l=6+rand(i*5.7)*14, a=1.35+0.5*(rand(i*7.3)-0.5); const c=150+105*rand(i*9.9)|0;
  g.strokeStyle=`rgba(${c},${c*0.97|0},${c*0.93|0},0.55)`; g.lineWidth=1+rand(i*2.2)*1.6; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } },{rep:true}); }
function texKelp(){ return canvasTex(64,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#5a4a14'); gr.addColorStop(0.5,'#a58a2c'); gr.addColorStop(1,'#5a4a14'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  for(let i=0;i<40;i++){ g.strokeStyle='rgba(60,45,10,0.35)'; g.beginPath(); const y=rand(i)*h; g.moveTo(0,y); g.quadraticCurveTo(w/2,y+8,w,y); g.stroke(); } },{rep:true}); }
// ---------- nutria marina (primitivas, boca arriba; eje local +x = cabeza) ----------
function nutria({cria=false}={}){ const g=new THREE.Group(); const m=new THREE.Group(); g.add(m);
  const pel=S.pelo; const cuerpoM=std(cria?'#8a6a4e':'#5b3b27',{roughness:0.95,map:pel,bumpMap:pel,bumpScale:0.8}); const caraM=std(cria?'#e2d4bd':'#cbb99d',{roughness:0.95,map:pel,bumpMap:pel,bumpScale:0.8});
  const oscuro=std('#120c0a',{roughness:0.25}), pataM=std('#3a2618',{roughness:0.9});
  const cu=new THREE.Mesh(new THREE.CapsuleGeometry(0.2,0.48,10,20),cuerpoM); cu.rotation.z=PI/2; cu.scale.set(0.8,1,1.05); m.add(cu);
  const pecho=new THREE.Mesh(new THREE.SphereGeometry(0.15,24,16),caraM); pecho.scale.set(1.25,0.55,0.95); pecho.position.set(0.24,0.06,0); m.add(pecho);
  const cab=new THREE.Group(); cab.position.set(0.5,0.05,0); m.add(cab);
  const cr=new THREE.Mesh(new THREE.SphereGeometry(0.15,28,20),caraM); cr.scale.set(1,0.92,1.05); cab.add(cr);
  const hoc=new THREE.Mesh(new THREE.SphereGeometry(0.07,20,14),caraM); hoc.scale.set(0.9,0.8,1.25); hoc.position.set(0.08,0.07,0); cab.add(hoc);
  const nar=new THREE.Mesh(new THREE.SphereGeometry(0.026,14,10),oscuro); nar.scale.set(0.8,0.7,1.2); nar.position.set(0.12,0.11,0); cab.add(nar);
  const ojos=[]; for(const z of [-0.058,0.058]){ const o=new THREE.Mesh(new THREE.SphereGeometry(0.019,14,10),oscuro); o.position.set(0.045,0.112,z); cab.add(o); ojos.push(o);
    const brillo=new THREE.Mesh(new THREE.SphereGeometry(0.006,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'})); brillo.position.set(0.01,0.014,0.006); o.add(brillo); }
  for(const z of [-0.105,0.105]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.024,12,8),cuerpoM); e.position.set(-0.03,0.075,z); cab.add(e); }
  const bp=[]; for(const s of [-1,1]) for(let k=0;k<4;k++){ const a=0.15+k*0.12; bp.push(0.11,0.085,s*0.04, 0.11+Math.cos(a)*0.02,0.085+Math.sin(a)*0.02+0.01,s*0.19); }
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3)); cab.add(new THREE.LineSegments(bg,new THREE.LineBasicMaterial({color:'#f4efe6',transparent:true,opacity:0.85})));
  const brazos=[]; for(const s of [-1,1]){ const b=new THREE.Group(); b.position.set(0.3,0.08,s*0.13); m.add(b); const a=new THREE.Mesh(new THREE.CapsuleGeometry(0.036,0.13,6,12),cuerpoM); a.position.y=0.08; b.add(a);
    const p=new THREE.Mesh(new THREE.SphereGeometry(0.046,14,10),pataM); p.scale.set(1,0.75,1); p.position.y=0.18; b.add(p); b.userData={s,p}; brazos.push(b); }
  const pies=[]; for(const s of [-1,1]){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.11,18,12),pataM); f.scale.set(1.05,0.28,0.62); f.position.set(-0.45,0.09,s*0.085); f.rotation.z=-0.9; m.add(f); pies.push(f); }
  const cola=new THREE.Mesh(new THREE.CapsuleGeometry(0.055,0.32,6,12),cuerpoM); cola.rotation.z=PI/2; cola.scale.set(0.45,1,1.2); cola.position.set(-0.6,-0.01,0); m.add(cola);
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
  // bolsillo bajo el brazo derecho (local -z)
  const bol=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.02,8,24,PI),std('#2a1a10',{roughness:1})); bol.position.set(0.2,0.05,-0.17); bol.rotation.set(0,0,PI); bol.visible=false; m.add(bol);
  const bolLuz=new THREE.Sprite(glowM('#ffe3a0',0)); bolLuz.position.set(0.2,0.06,-0.19); bolLuz.scale.setScalar(0.3); m.add(bolLuz);
  g.userData={m,cab,ojos,brazos,pies,cola,bol,bolLuz,cria}; return g; }
// pose de la nutria: brazos [[rx,rz],[rx,rz]] (izq=+z, der=-z), dormida 0..1, gira (rodar sobre su eje)
function animaN(n,t,{dormida=0,bL=null,bR=null,cabeza=0,mastica=0,gira=0,seed=0}={}){ const u=n.userData;
  u.cab.rotation.set(0.12*Math.sin(t*0.9+seed),0,0.15+cabeza+0.05*Math.sin(t*1.1+seed)+mastica*0.18*Math.max(0,Math.sin(t*16)));
  u.ojos.forEach(o=>o.scale.set(1,lerp(1,0.12,dormida),1)); const re=[0.35,0.55];
  u.brazos.forEach((b,i)=>{ const v=(i?bL:bR)||[-b.userData.s*0.5,-0.25]; b.rotation.set(v[0],0,v[1]); });
  u.pies.forEach((f,i)=>{ f.rotation.z=-0.9+0.12*Math.sin(t*1.6+i+seed); }); u.cola.rotation.y=0.15*Math.sin(t*1.2+seed); u.m.rotation.x=gira; }
// pon la nutria flotando en (x,z) con orientación ry (ry=-PI/2: cabeza hacia +z)
function ponN(n,x,z,ry,t,{alto=0,esc=1}={}){ n.visible=true; n.scale.set(esc,esc,-esc); const y=hW(x,z,t)+0.02*esc+alto; n.position.set(x,y,z); n.rotation.set(0,ry+PI,0);
  const dx=hW(x+0.3,z,t)-hW(x-0.3,z,t), dz=hW(x,z+0.3,t)-hW(x,z-0.3,t); n.rotation.x=dz*0.8; n.rotation.z=-dx*0.8; }
// brazo que alcanza hacia el lado (s=+1 izquierda): rx de alcance
const alcanza=(s,k)=>[s*lerp(-0.5,1.45,k),lerp(-0.25,0.1,k)];
// ---------- agua ----------
const LIM=24;
function hW(x,z,t){ const m=Math.max(Math.abs(x),Math.abs(z)); const f=1-es(clamp((m-LIM*0.7)/(LIM*0.3))); return f*(0.055*Math.sin(x*0.9+t*1.3)+0.04*Math.sin(z*1.15-t*1.7)+0.018*Math.sin((x+z)*2.3+t*2.1)); }
// espiral (alga que envuelve) a lo largo de un eje
class Helice extends THREE.Curve{ constructor(r,L,v,eje='x'){ super(); this.r=r; this.L=L; this.v=v; this.eje=eje; }
  getPoint(u,o=new THREE.Vector3()){ const a=u*this.v*PI*2, s=(u-0.5)*this.L; const rr=this.r*(1+0.06*Math.sin(u*40)); return this.eje==='x'?o.set(s,Math.cos(a)*rr,Math.sin(a)*rr):o.set(Math.cos(a)*rr,s,Math.sin(a)*rr); } }
function envoltura(r,L,v,eje){ const g=new THREE.TubeGeometry(new Helice(r,L,v,eje),260,0.028,6,false); g.scale(1,1,1); const m=new THREE.Mesh(g,S.kelpM); m.castShadow=true; m.userData.n=g.index.count; return m; }
function enrolla(m,k){ m.visible=k>0.001; m.geometry.setDrawRange(0,Math.floor(m.userData.n*clamp(k)/6)*6); }
// ---------- almeja, piedra, esquirlas ----------
function almeja(){ const g=new THREE.Group(); const mm=std('#e8dcc8',{roughness:0.5}); for(const s of [-1,1]){ const v=new THREE.Mesh(new THREE.SphereGeometry(0.05,20,10,0,PI*2,0,PI/2),mm); v.scale.set(1,0.35,0.85); v.rotation.x=s>0?0:PI; g.add(v); } g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; }
function esquirlas(s,n){ const arr=[]; const mm=std('#efe4d2',{roughness:0.5}); for(let k=0;k<n;k++){ const e=new THREE.Mesh(new THREE.TetrahedronGeometry(0.012+rand(k)*0.012),mm); s.add(e); arr.push(e); } return arr; }
function vuela(arr,t,c,{v=1.2,g=4,t0=0}={}){ arr.forEach((e,k)=>{ const tt=t-t0; e.visible=tt>0&&tt<1.2; if(!e.visible) return; const a=rand(k*3)*PI*2; const vv=v*(0.5+rand(k*5)); e.position.set(c[0]+Math.cos(a)*vv*tt,c[1]+(1.2+rand(k)*1.4)*tt-g*tt*tt,c[2]+Math.sin(a)*vv*tt); e.rotation.set(tt*9+k,tt*7,0); }); }
// =========================== MAR ===========================
async function escenaMar(){ const s=new THREE.Scene();
  S.HD=await hdrLocal('kloofendal_48d_partly_cloudy_puresky_4k.hdr',8); S.HA=await hdrLocal('industrial_sunset_02_puresky_4k.hdr',6); S.HN=await hdrLocal('kloofendal_overcast_puresky_4k.hdr',4);
  const aguaM=new THREE.MeshPhysicalMaterial({color:'#123f4f',roughness:0.1,metalness:0,clearcoat:1,clearcoatRoughness:0.08,side:THREE.FrontSide,envMapIntensity:0.75});
  const cerca=new THREE.PlaneGeometry(LIM*2,LIM*2,170,170); cerca.rotateX(-PI/2); const agua=new THREE.Mesh(cerca,aguaM); agua.receiveShadow=true; s.add(agua);
  const techo=new THREE.Mesh(new THREE.PlaneGeometry(LIM*2.2,LIM*2.2),new THREE.MeshBasicMaterial({color:'#8fe3f0',transparent:true,opacity:0.55,side:THREE.BackSide,fog:false,depthWrite:false})); techo.rotation.x=-PI/2; techo.position.y=-0.09; s.add(techo); S.techo=techo;
  const lejos=new THREE.Mesh(new THREE.RingGeometry(LIM*0.99,9000,64,1),aguaM); lejos.rotation.x=-PI/2; lejos.position.y=-0.005; s.add(lejos);
  const sol=new THREE.DirectionalLight('#fff1d6',2.8); sombra(sol,5,60); s.add(sol,sol.target); const hemi=new THREE.HemisphereLight('#cfe8ff','#1b4a55',0.35); s.add(hemi);
  // noche
  const cielo=cieloGrad('#02040c','#0b1a34','#050a14',8500); const est=estrellas(5000,8000,7); const luna=lunaReal(260,128); luna.position.set(-2600,1700,-6000);
  const lunaLuz=new THREE.Sprite(glowM('#cfe0ff',0.3)); lunaLuz.position.copy(luna.position); lunaLuz.scale.setScalar(900); const noche=new THREE.Group(); noche.add(cielo,est,luna,lunaLuz); s.add(noche);
  const lunaDir=new THREE.DirectionalLight('#bcd2ff',0); s.add(lunaDir,lunaDir.target);
  // nutrias protagonistas + cría
  const N=[]; for(let k=0;k<6;k++){ const n=nutria(); s.add(n); N.push(n); } const cria=nutria({cria:true}); s.add(cria);
  // balsa: 1000 nutrias instanciadas (geometría simplificada con color por vértice)
  const piezas=[]; const col=(g,c)=>{ const cc=new THREE.Color(c); const a=new Float32Array(g.attributes.position.count*3); for(let i=0;i<a.length;i+=3){ a[i]=cc.r; a[i+1]=cc.g; a[i+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; };
  let g1=new THREE.CapsuleGeometry(0.17,0.55,4,10); g1.rotateZ(PI/2); g1.scale(1,0.82,1.08); piezas.push(col(g1,'#5b3b27'));
  let g2=new THREE.SphereGeometry(0.135,12,8); g2.translate(0.5,0.05,0); piezas.push(col(g2,'#cbb99d')); let g3=new THREE.SphereGeometry(0.15,10,8); g3.scale(1.25,0.55,0.95); g3.translate(0.24,0.06,0); piezas.push(col(g3,'#cbb99d'));
  for(const zz of [-0.085,0.085]){ let f=new THREE.SphereGeometry(0.11,8,6); f.scale(1.05,0.28,0.62); f.rotateZ(-0.9); f.translate(-0.45,0.09,zz); piezas.push(col(f,'#3a2618')); }
  piezas.forEach(p=>{ for(const k of Object.keys(p.attributes)) if(!['position','normal','color'].includes(k)) p.deleteAttribute(k); });
  const gm=mergeGeometries(piezas.map(p=>p.index?p.toNonIndexed():p)); const balsa=new THREE.InstancedMesh(gm,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95}),1000); balsa.castShadow=true; balsa.receiveShadow=true; balsa.frustumCulled=false; s.add(balsa);
  const BP=[]; let k=0; while(BP.length<1000){ k++; const a=rand(k*1.3)*PI*2, r=1.6+Math.pow(rand(k*2.9),0.75)*21; const x=Math.cos(a)*r*1.15, z=Math.sin(a)*r*0.9-6; if(Math.hypot(x,z)<1.4) continue; BP.push([x,z,rand(k*4.1)*PI*2,0.85+rand(k*6.1)*0.3]); }
  // algas: dosel flotante + tallos al fondo + piedras del fondo
  S.kelpM=new THREE.MeshStandardMaterial({color:'#c2a24a',map:texKelp(),roughness:0.75,side:THREE.DoubleSide});
  const dosel=[]; for(let i=0;i<34;i++){ const pg=new THREE.PlaneGeometry(0.42,1.5,2,10); pg.rotateX(-PI/2); const p=new THREE.Mesh(pg,S.kelpM); const a=rand(i*2.7)*PI*2, r=3+rand(i*1.9)*14; p.userData={x:Math.cos(a)*r,z:Math.sin(a)*r-2,ry:rand(i*5.5)*PI}; p.receiveShadow=true; s.add(p); dosel.push(p); }
  const tallos=[]; const bulM=std('#8a7a2a',{roughness:0.6}); for(let i=0;i<9;i++){ const x0=[-2.5,1.6,-2.2,2.8,-3.5,0.6,4.2,-1.4,3.2][i], z0=[-2.0,-2.2,-3.0,-4.5,-1.5,-5.5,-1.2,-6.5,-7.5][i];
    const pts=[]; for(let j=0;j<=12;j++){ const u=j/12; pts.push(new THREE.Vector3(x0-0.5*u+Math.sin(u*5+i)*0.25,-u*9.5,z0-1.2*u+Math.cos(u*4+i)*0.2)); } const cv=new THREE.CatmullRomCurve3(pts);
    const tb=new THREE.Mesh(new THREE.TubeGeometry(cv,60,0.03,6,false),bulM); s.add(tb); const hojas=new THREE.Group(); for(let j=4;j<22;j++){ const u=j/22; const p=cv.getPoint(u); const hg=new THREE.PlaneGeometry(0.2,1.0,1,6); hg.translate(0,0.5,0); const h=new THREE.Mesh(hg,S.kelpM); h.position.copy(p); h.rotation.set(0.3*Math.sin(j),j*2.4,0.35+0.15*Math.sin(j*3)); hojas.add(h);
      const b=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,6),bulM); b.position.copy(p); hojas.add(b); } s.add(hojas); tallos.push({tb,hojas,cv}); }
  const fondo=new THREE.Mesh(new THREE.PlaneGeometry(80,80,1,1),pbr('coast_sand_01',[16,16],{roughness:1})); fondo.rotation.x=-PI/2; fondo.position.y=-9.6; fondo.receiveShadow=true; s.add(fondo);
  const piedra=await modelo('boulder_01',1.1); piedra.position.set(-3.0,-9.6,-3.2); s.add(piedra); for(const [x,z,e] of [[2.4,-6,1.4],[-4,-4,0.9],[4.5,-9,1.8],[-2,-9,1.2]]){ const p=piedra.clone(); p.position.set(x,-9.6,z); p.scale.multiplyScalar(e); s.add(p); }
  const rayos=[]; for(let i=0;i<6;i++){ const r=new THREE.Mesh(new THREE.ConeGeometry(1.2+rand(i)*1.5,14,24,1,true),new THREE.MeshBasicMaterial({color:'#bff4ff',transparent:true,opacity:0.07,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false})); r.position.set(-3+i*1.4,-6,-2-rand(i*3)*4); r.rotation.z=0.2; s.add(r); rayos.push(r); }
  const nieveG=new THREE.BufferGeometry(); nieveG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(2500*3),3)); const nieve=new THREE.Points(nieveG,new THREE.PointsMaterial({size:0.07,map:TEX.bola,color:'#ffffff',transparent:true,depthWrite:false})); nieve.frustumCulled=false; s.add(nieve);
  const burbG=new THREE.BufferGeometry(); burbG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(160*3),3)); const burb=new THREE.Points(burbG,new THREE.PointsMaterial({size:0.05,map:TEX.bola,color:'#e8fbff',transparent:true,depthWrite:false})); burb.frustumCulled=false; s.add(burb);
  const estelas=[]; for(let i=0;i<46;i++){ const e=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.025),new THREE.MeshBasicMaterial({color:'#e9fbff',transparent:true,opacity:0,depthWrite:false})); e.rotation.x=-PI/2; s.add(e); estelas.push(e); }
  const anillo=new THREE.Mesh(new THREE.RingGeometry(0.9,1,64),new THREE.MeshBasicMaterial({color:'#f2fbff',transparent:true,depthWrite:false,side:THREE.DoubleSide})); anillo.rotation.x=-PI/2; s.add(anillo);
  // utilería
  const alm=almeja(); s.add(alm); const almejas=[]; for(let i=0;i<6;i++){ const a=almeja(); s.add(a); almejas.push(a); } const esq=esquirlas(s,26);
  const roca=await modelo('boulder_01',0.11); s.add(roca); const roca2=roca.clone(); s.add(roca2); const chispa=new THREE.Sprite(glowM('#fff3c4',0)); s.add(chispa); const chispas=esquirlas(s,14); chispas.forEach(c=>c.material=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffd27a').multiplyScalar(2.5)}));
  const envN=envoltura(0.2,0.8,5,'x'); const envC=envoltura(0.2,0.8,5,'x'); const envR=envoltura(0.2,0.32,4,'y'); s.add(envR);
  const bot=new Bot(BOT,0.72); s.add(bot.g);
  S.niebla=new THREE.FogExp2('#93a3ad',0.03); S.subFog=new THREE.FogExp2('#0b5566',0.085);
  S.m={s,agua,cerca,p0:cerca.attributes.position.array.slice(),lejos,aguaM,sol,hemi,noche,luna,lunaDir,N,cria,balsa,BP,dosel,tallos,fondo,rayos,nieve,burb,estelas,anillo,alm,almejas,esq,roca,roca2,chispa,chispas,envN,envC,envR,bot};
  N[0].userData.m.add(envN); cria.userData.m.add(envC); envN.position.x=0.02; envC.position.x=0.02;
}
const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
function olas(t){ const {cerca,p0}=S.m; const p=cerca.attributes.position.array; for(let i=0;i<p.length;i+=3) p[i+1]=hW(p0[i],p0[i+2],t); cerca.attributes.position.needsUpdate=true; cerca.computeVertexNormals(); }
function ponBalsa(t,vis=true,dorm=1){ const {balsa,BP}=S.m; balsa.visible=vis; if(!vis) return; BP.forEach(([x,z,ry,e],i)=>{ const xx=x+Math.sin(t*0.2+i)*0.05; _e.set(Math.sin(t*1.1+i)*0.06,ry,Math.cos(t*0.9+i)*0.06); _q.setFromEuler(_e); _v.set(xx,hW(xx,z,t)+0.02,z); _s.setScalar(e); _m4.compose(_v,_q,_s); balsa.setMatrixAt(i,_m4); }); balsa.instanceMatrix.needsUpdate=true; }
// modo: 'dia' | 'tarde' | 'noche' | 'nieve'
function mar(t,modo='dia'){ const P=S.m; const s=P.s; olas(t); P.noche.visible=modo==='noche'; s.fog=null; s.backgroundIntensity=1; s.environmentIntensity=1; s.backgroundBlurriness=0;
  const Hh=modo==='tarde'?S.HA:(modo==='nieve'||modo==='noche')?S.HN:S.HD; s.environment=Hh.env; s.background=modo==='noche'?null:Hh.raw; s.backgroundRotation=new THREE.Euler(0,modo==='dia'?2.2:0.4,0); s.environmentRotation=s.backgroundRotation;
  P.sol.intensity=modo==='tarde'?2.4:modo==='nieve'?0.7:modo==='noche'?0:2.8; P.sol.color.set(modo==='tarde'?'#ffae6a':'#fff1d6'); apunta(P.sol,modo==='tarde'?[-0.3,-0.35,-0.9]:[0.45,-0.7,-0.55],[0,0,0],40);
  P.hemi.intensity=modo==='noche'?1.1:0.35; P.hemi.color.set(modo==='noche'?'#5d7fc0':'#cfe8ff'); P.lunaDir.intensity=modo==='noche'?0.9:0; P.aguaM.roughness=modo==='noche'?0.4:0.1; P.aguaM.clearcoat=modo==='noche'?0.2:1; apunta(P.lunaDir,[0.35,-0.35,0.8],[0,0,0],40);
  if(modo==='noche'){ s.environmentIntensity=0.3; } if(modo==='nieve'){ s.fog=S.niebla; s.backgroundIntensity=0.8; }
  P.aguaM.color.set(modo==='tarde'?'#24485a':modo==='noche'?'#0a1a2c':'#123f4f');
  P.N.forEach(n=>{ n.visible=false; n.scale.setScalar(1); n.userData.bol.visible=false; n.userData.bolLuz.material.opacity=0; animaN(n,t,{}); }); P.cria.visible=false; enrolla(P.envN,0); enrolla(P.envC,0); enrolla(P.envR,0);
  ponBalsa(t,false); P.nieve.visible=false; P.burb.visible=false; P.estelas.forEach(e=>e.material.opacity=0); P.anillo.visible=false; P.alm.visible=false; P.almejas.forEach(a=>a.visible=false); P.esq.forEach(e=>e.visible=false); P.chispas.forEach(e=>e.visible=false);
  P.roca.visible=false; P.roca2.visible=false; S.techo.visible=false; P.chispa.material.opacity=0; P.rayos.forEach(r=>r.visible=false);
  P.dosel.forEach((d,i)=>{ const u=d.userData; d.position.set(u.x,hW(u.x,u.z,t)+0.012,u.z); d.rotation.set(0,u.ry+0.15*Math.sin(t*0.7+i),0); d.visible=true; });
  P.tallos.forEach((tl,i)=>{ tl.hojas.children.forEach((h,j)=>{ h.rotation.x=0.3*Math.sin(j)+0.15*Math.sin(t*1.3+j*0.7+i); }); });
  const b=P.bot; b.g.visible=true; b.g.position.set(0,hW(0,0,t)-0.3,0); b.g.rotation.set(0,0,0); b.g.scale.setScalar(1); }
// robot nadando (agua al pecho)
function botAgua(x,z,ry,t){ const b=S.m.bot; b.g.position.set(x,hW(x,z,t)-0.3,z); b.g.rotation.set(0,ry,0); }
// cámara bajo el agua
function sub(on){ const P=S.m, s=P.s; if(!on) return; s.fog=S.subFog; s.background=new THREE.Color('#0d5f73'); s.environmentIntensity=0.55; P.rayos.forEach(r=>r.visible=true); S.techo.visible=true; }
function burbujas(t,c,t0,n=160){ const a=S.m.burb.geometry.attributes.position.array; S.m.burb.visible=true; for(let i=0;i<n;i++){ const tt=((t-t0)*0.9+rand(i)*2.2)%2.2; a[i*3]=c[0]+(rand(i*3)-0.5)*0.4+Math.sin(t*3+i)*0.05; a[i*3+1]=c[1]+tt*1.6; a[i*3+2]=c[2]+(rand(i*7)-0.5)*0.4; } S.m.burb.geometry.attributes.position.needsUpdate=true; }
// A — gancho y loop: dos nutrias boca arriba tomadas de la mano con el robot; atardecer
function tA(t,lt=t,fin=false){ const P=S.m; mar(t,'tarde'); const [n0,n1]=P.N; const {bot}=P;
  const sep=fin?lerp(0.85,0.5,es(pr(t,S.wvuelven2,1.3))):0.5; const k=fin?es(pr(t,S.wmano2-0.7,0.8)):1;
  ponN(n0,-sep,0.05,-PI/2,t); ponN(n1,sep,-0.05,-PI/2,t+0.6); animaN(n0,t,{dormida:fin?1-0.6*k:1,bR:alcanza(-1,k)}); animaN(n1,t,{dormida:1,bL:alcanza(1,k),seed:2});
  botAgua(0,0,0,t); const ini=!fin&&lt>=S.wy-0.02; bot.pose(t,ini?[['Idle',0],['No',S.wy-0.05,{once:true,vel:1.2}]]:[['Idle',0,{vel:0.8}]]);
  bot.cara({feliz:ini?0:0.7,mira:ini?0.15*Math.sin(lt*3):0,parpadeo:ini?null:(fin?null:1)}); if(!ini) bot.cabeza(-0.15,0);
  let eye,tg,fov=40; if(!ini){ const a=fin?eio(pr(lt,0,3.24)):eio(lt/2.45); eye=fin?L3([0.5,3.0,2.6],[0.25,2.5,2.0],a):L3([0.25,2.5,2.0],[0.15,2.2,1.7],a); tg=[0,0.05,-0.1]; }
  else { const a=eio(pr(t,S.wy,1.6)); eye=L3([0.42,0.6,1.25],[0.3,0.55,1.05],a); tg=[0,0.3,0]; fov=38; }
  render(P.s,{eye,target:tg,fov,dof:ini?[1.05,0.006,0.008]:null,bloom:[0.6,0.5,1.3],exp:1.0,t}); }
// B — cenital: una nutria se aleja sola a la deriva
function tB(t){ const P=S.m; mar(t,'dia'); const lt=t-4.09; const {N,bot}=P; const xs=[-1.3,-0.65,0.65,1.3];
  [0,1,2,3].forEach(i=>{ ponN(N[i],xs[i],0,-PI/2,t+i); animaN(N[i],t,{dormida:1,bL:i>0?alcanza(1,1):null,bR:i<3?alcanza(-1,1):null,seed:i}); });
  botAgua(0,0.15,0,t); bot.pose(t,[['Idle',0]]); bot.cara({parpadeo:1});
  const d=lerp(0,2.4,es(pr(lt,0.2,1.8))); ponN(N[4],2.4+d,0.9+d*0.4,-PI/2+lt*0.5,t); animaN(N[4],t,{dormida:1-pr(t,S.wsolas,0.25),seed:4});
  const a=eio(lt/1.91); render(P.s,{eye:L3([0.6,9.5,0.9],[1.2,7.2,0.7],a),target:[1.0,0,0],fov:42,roll:lerp(0,0.25,a),bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// C — duermen flotando; la corriente las separa (estelas en el agua, el robot gira)
function tC(t){ const P=S.m; mar(t,'dia'); const lt=t-6.0; const {N,bot,estelas}=P; const c=pr(t,S.wcorr-0.1,1.4); const sep=0.66+es(c)*1.6;
  ponN(N[0],-sep,0.1*c,-PI/2+c*0.6,t); ponN(N[1],sep,-0.3*c,-PI/2-c*0.8,t+0.7); animaN(N[0],t,{dormida:1-0.8*c,bR:alcanza(-1,1-c)}); animaN(N[1],t,{dormida:1-0.8*c,bL:alcanza(1,1-c),seed:3});
  botAgua(0.3*c,-0.5*c,c*PI*2.3,t); bot.pose(t,c>0?[['Jump',0,{fijo:0.4}]]:[['Idle',0]]); bot.cara({parpadeo:c>0?0:1,sorpresa:c});
  estelas.forEach((e,i)=>{ const z=(rand(i)-0.5)*5, x=((rand(i*3)*12+t*3.2*(0.8+rand(i*5)*0.5))%12)-6; e.position.set(x,hW(x,z,t)+0.02,z); e.material.opacity=0.55*c*Math.sin(clamp((x+6)/12)*PI); });
  const a=eio(lt/3.73); const sh=tiembla(t,0.012*c); render(P.s,{eye:add3(L3([1.9,0.28,2.3],[2.6,1.3,3.6],es(c)),sh),target:[0,0.1,0],fov:lerp(40,46,a),bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// D — se agarran de las patas (macro); el robot aprueba al fondo
function tD(t){ const P=S.m; mar(t,'dia'); const lt=t-9.73; const {N,bot}=P; const k=back(pr(t,S.wagarran-0.1,0.5));
  ponN(N[0],-0.34,0,-PI/2,t); ponN(N[1],0.34,0,-PI/2,t+0.5); animaN(N[0],t,{dormida:0.6,bR:alcanza(-1,k)}); animaN(N[1],t,{dormida:0.6,bL:alcanza(1,k),seed:5});
  botAgua(1.3,-1.1,-0.4,t); bot.pose(t,[['Idle',0],['ThumbsUp',S.wpatas,{once:true}]]); bot.cara({feliz:pr(t,S.wpatas,0.3)});
  const a=eio(lt/2); render(P.s,{eye:L3([0.55,0.95,1.55],[0.4,0.8,1.3],a),target:[0,0.1,-0.2],fov:38,dof:[1.5,0.006,0.008],bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// E — se enreda en algas; el robot hecho burrito de kelp; la cámara baja por el tallo hasta el ancla
function tE(t){ const P=S.m; mar(t,'dia'); const lt=t-11.73; const {N,bot,envN,envR}=P;
  ponN(N[0],-0.5,0.1,-PI/2,t); const w=pr(t,S.wenredan-0.1,1.4); animaN(N[0],t,{dormida:0.7,gira:es(w)*PI*4}); enrolla(envN,w);
  botAgua(0.55,-0.1,-0.2,t); const bur=t>=S.wcobija-0.05; enrolla(envR,bur?1:0); envR.position.set(0.55,hW(0.55,-0.1,t)+0.08,-0.1); envR.rotation.y=t*0.5;
  bot.pose(t,bur?[['Idle',0,{vel:0.6}]]:[['Idle',0]]); bot.cara({feliz:bur?0.9:0.3,sorpresa:bur?0:0.4*w});
  let eye,tg,fov=40; if(t<S.wcobija-0.05){ const a=eio(lt/1.7); eye=L3([0.4,1.0,1.4],[0.1,0.85,1.2],a); tg=[-0.45,0.08,0.1]; }
  else if(t<S.wancla-0.02){ const a=eio(pr(t,S.wcobija,0.8)); eye=L3([1.0,0.75,1.0],[0.95,0.7,0.85],a); tg=[0.55,0.35,-0.1]; fov=38; }
  else { const a=eio(pr(t,S.wancla-0.02,0.95)); eye=L3([1.2,0.5,1.6],[-1.4,-7.4,-0.3],a); tg=L3([-2.4,-0.4,-1.9],[-3.0,-9.2,-3.2],a); fov=lerp(44,56,a); }
  if(eye[1]<hW(eye[0],eye[2],t)) sub(true);
  render(P.s,{eye,target:tg,fov,bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// F — no son solo dos: grúa que revela una balsa de mil nutrias
function tF(t){ const P=S.m; mar(t,'dia'); const lt=t-15.18; const {N,bot}=P; ponBalsa(t,true);
  ponN(N[0],-0.66,0.05,-PI/2,t); ponN(N[1],0.66,-0.05,-PI/2,t+0.6); animaN(N[0],t,{dormida:1,bR:alcanza(-1,1)}); animaN(N[1],t,{dormida:1,bL:alcanza(1,1)});
  botAgua(0,0,0,t); bot.pose(t,[['Idle',0],['Wave',S.wvisto,{vel:1.1}]]); bot.cara({feliz:0.6,sorpresa:0.4*pr(t,S.wmil,0.3)});
  const a=eio(pr(lt,0.3,4.3)); render(P.s,{eye:L3([0.7,1.1,2.1],[9,25,26],a),target:L3([0,0.2,0],[0,0,-7],es(pr(lt,0.4,3))),fov:lerp(40,44,a),bloom:[0.5,0.5,1.3],exp:1.0,t});
  if(t>=S.wmil) cifra('+1,000',540,330,220,pr(t,S.wmil,0.3),{sub:'NUTRIAS EN UNA BALSA'}); }
// G — como el metro en hora pico… pero en paz
function tG(t){ const P=S.m; mar(t,'dia'); const lt=t-20.0; const {N,bot}=P; ponBalsa(t,true); const paz=pr(t,S.wpero,0.5); const emp=(1-paz);
  const pos=[[-0.5,0.1,-1.9],[0.5,-0.05,-1.3],[-0.15,-0.62,-1.1],[0.2,0.6,-1.8]]; pos.forEach(([x,z,ry],i)=>{ const b=emp*0.09*Math.sin(t*7+i*1.7); ponN(N[i],x+b*(x>0?1:-1),z+b,ry,t+i); animaN(N[i],t,{dormida:1,seed:i}); });
  botAgua(emp*0.06*Math.sin(t*7),0,0,t); bot.g.rotation.z=emp*0.12*Math.sin(t*7+1); bot.pose(t,[['Idle',0,{vel:1+emp}]]); bot.cara({sorpresa:emp*0.7,feliz:paz*0.9,parpadeo:paz>0.6?1:null});
  const a=eio(lt/2.45); render(P.s,{eye:L3([0.95,0.42,1.65],[1.3,0.9,2.3],es(paz)),target:[0,0.35,0],fov:lerp(42,46,a),bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// H — ¿y el frío? nieve; el robot tirita; ella ni se inmuta (sin grasa)
function nevar(t){ const P=S.m; P.nieve.visible=true; const a=P.nieve.geometry.attributes.position.array; for(let i=0;i<a.length/3;i++){ a[i*3]=(rand(i)-0.5)*8+Math.sin(t*0.9+i)*0.2; a[i*3+1]=((rand(i*7)*4-t*0.6*(0.6+rand(i*5)))%4+4)%4-0.2; a[i*3+2]=(rand(i*3)-0.5)*8; } P.nieve.geometry.attributes.position.needsUpdate=true; }
function tH(t){ const P=S.m; mar(t,'nieve'); nevar(t); const lt=t-22.45; const {N,bot}=P;
  ponN(N[0],-0.55,0.05,-PI/2+0.3,t); animaN(N[0],t,{dormida:1,cabeza:0.1}); const sh=tiembla(t,0.012); botAgua(0.35+sh[0],0+sh[2],-0.35,t); bot.pose(t,[['Idle',0,{vel:2.5}]]); bot.cara({triste:0.8,sorpresa:0.3}); bot.cabeza(0.06*Math.sin(t*40),0);
  let eye,tg,fov=40; if(t<S.wno-0.05){ const a=eio(lt/0.9); eye=L3([0.9,0.75,1.5],[0.8,0.7,1.3],a); tg=[0.35,0.4,0]; } else { const a=eio(pr(t,S.wno,2)); eye=L3([-0.2,1.15,0.95],[-0.35,1.0,0.75],a); tg=[-0.5,0.1,-0.15]; fov=40; }
  render(P.s,{eye,target:tg,fov,bloom:[0.4,0.5,1.3],exp:0.95,tint:[0.92,0.97,1.08],t});
  if(t>=S.wgrasa) cifra('SIN GRASA',540,330,150,pr(t,S.wgrasa,0.3),{sub:'SOLO PELO'}); }
// I — la cámara se mete al pelaje
function tI(t){ const P=S.m; mar(t,'dia'); const lt=t-25.36; const {N,bot}=P; ponN(N[0],0,0,-PI/2,t); animaN(N[0],t,{dormida:1}); botAgua(0.9,-0.8,-0.5,t); bot.pose(t,[['Idle',0]]); bot.cara({sorpresa:0.6});
  const c=N[0].position; const a=ei(pr(lt,0,2.54)); render(P.s,{eye:L3([c.x+0.5,c.y+1.0,c.z+0.6],[c.x+0.03,c.y+0.24,c.z-0.12],a),target:[c.x,c.y+0.1,c.z-0.25],fov:lerp(40,30,a),bloom:[0.5,0.5,1.3],exp:1.0,flash:0.8*pr(lt,2.3,0.24),t}); }
// =========================== PELAJE (macro) ===========================
async function escenaPelo(){ const s=new THREE.Scene(); const H_=await hdrLocal('art_studio_4k.hdr',4); s.environment=H_.env; s.environmentIntensity=0.5; s.background=new THREE.Color('#2a1a10'); s.fog=new THREE.FogExp2('#3a2416',0.06);
  const piel=new THREE.Mesh(new THREE.PlaneGeometry(80,80),std('#4a2f1e',{roughness:1,map:S.pelo,bumpMap:S.pelo,bumpScale:2})); piel.material.map=S.pelo.clone(); piel.material.map.repeat.set(30,30); piel.material.map.needsUpdate=true; piel.rotation.x=-PI/2; piel.receiveShadow=true; s.add(piel);
  const hg=new THREE.CylinderGeometry(0.004,0.035,1,6,6); hg.translate(0,0.5,0); const cc=new Float32Array(hg.attributes.position.count*3); for(let i=0;i<hg.attributes.position.count;i++){ const y=hg.attributes.position.getY(i); const c=new THREE.Color('#3a2414').lerp(new THREE.Color('#d8c2a0'),Math.pow(y,2.2)); cc.set([c.r,c.g,c.b],i*3); } hg.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const NH=9000; const pelos=new THREE.InstancedMesh(hg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.55,metalness:0.05}),NH); pelos.castShadow=true; pelos.receiveShadow=true; pelos.frustumCulled=false; s.add(pelos);
  const HP=[]; let k=0; while(HP.length<NH){ k++; const x=(rand(k*1.7)-0.5)*26, z=(rand(k*3.3)-0.5)*26-4; if(Math.abs(x)<0.85&&z>-9) continue; if(Math.abs(x)<3.2&&Math.abs(z+1)<3.2&&rand(k*9)>0.25) { /* dentro del cuadro: más denso, se queda */ }
    HP.push([x,z,1.6+rand(k*5)*1.8+(rand(k*7)>0.93?1.6:0),rand(k*11)*PI*2,rand(k*13)]); }
  const sol=new THREE.DirectionalLight('#ffe2bd',2.4); sombra(sol,7,60); s.add(sol,sol.target); apunta(sol,[0.4,-0.8,-0.4],[0,0,-2],30); s.add(new THREE.HemisphereLight('#ffd9b0','#2a1408',0.6));
  const cuadro=new THREE.Group(); const cm=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffd23f').multiplyScalar(2.2),transparent:true}); const L=6.2; for(let i=0;i<4;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(L,0.06,0.06),cm); const a=i*PI/2; b.position.set(Math.cos(a)*L/2,0.05,Math.sin(a)*L/2); b.rotation.y=a+PI/2; cuadro.add(b);
    for(let j=0;j<12;j++){ const d=new THREE.Mesh(new THREE.SphereGeometry(0.07,10,8),cm); const u=(j+0.5)/12-0.5; d.position.set(Math.cos(a)*L/2+Math.cos(a+PI/2)*u*L,0.05,Math.sin(a)*L/2+Math.sin(a+PI/2)*u*L); cuadro.add(d); } } cuadro.position.set(0,0.02,-1); s.add(cuadro);
  const brillo=new THREE.Sprite(glowM('#ffffff',0)); s.add(brillo);
  const bot=new Bot(BOT,1); s.add(bot.g); S.p={s,pelos,HP,sol,cuadro,cm,bot,brillo};
}
function pelaje(t){ const P=S.p; P.HP.forEach(([x,z,h,a,r],i)=>{ _e.set(0.18*Math.sin(t*1.1+x*0.6+r*3)+0.15*Math.cos(a),a,0.15*Math.sin(t*0.9+z*0.5)+0.15*Math.sin(a)); _q.setFromEuler(_e); _v.set(x,0,z); _s.set(1,h,1); _m4.compose(_v,_q,_s); P.pelos.setMatrixAt(i,_m4); }); P.pelos.instanceMatrix.needsUpdate=true;
  P.cuadro.visible=false; P.brillo.material.opacity=0; P.bot.g.position.set(0,0,0); P.bot.g.rotation.set(0,0,0); }
// J — robot diminuto entre pelos gigantes: un millón por pulgada cuadrada
function tJ(t){ const P=S.p; pelaje(t); const lt=t-27.9; const {bot}=P; const z=-lt*0.64*1.1; bot.g.position.set(0,0,z+1.5); bot.g.rotation.y=PI; bot.pose(lt,[['Walking',0,{vel:1.1}]]); bot.cara({sorpresa:0.7,mira:0.6*Math.sin(lt*1.4)}); bot.cabeza(-0.35,0);
  const a=eio(lt/3.55); render(P.s,{eye:L3([0.45,0.45,z+3.6],[0.25,1.6,z+3.4],a),target:[0,lerp(1.2,1.8,a),z-2],fov:lerp(48,56,a),bloom:[0.5,0.5,1.3],exp:1.0,flash:0.6*(1-pr(lt,0,0.25)),t});
  if(t>=S.wun) cifra('1,000,000',540,330,170,pr(t,S.wun,0.3),{sub:'DE PELOS POR PULGADA²'}); }
// K — el cuadrito del tamaño de una estampilla; y el robot… calvo
function tK(t){ const P=S.p; pelaje(t); const lt=t-31.45; const {bot,cuadro,cm,brillo}=P;
  if(t<S.wtu-0.05){ cuadro.visible=true; cm.opacity=pr(t,S.wcuadrito-0.1,0.4); const sc=back(pr(t,S.wcuadrito-0.1,0.5)); cuadro.scale.set(sc,1,sc); bot.g.position.set(0,0,-1); bot.g.rotation.y=0.4; bot.pose(t,[['Idle',0],['Yes',S.westamp,{once:true}]]); bot.cara({sorpresa:0.8}); bot.cabeza(-0.4,0);
    const a=eio(lt/3.1); render(P.s,{eye:L3([0.5,4.5,4.5],[0.3,11,5.5],a),target:[0,0,-1],fov:46,bloom:[0.6,0.5,1.2],exp:1.0,t}); }
  else { const lk=t-S.wtu; bot.g.position.set(0,0,-1); bot.g.rotation.y=0.2; bot.pose(t,[['Idle',0]]); bot.cara({triste:0.85,mira:0.3}); bot.cabeza(0.45,0); brillo.position.set(0.05,1.02,-0.95); brillo.scale.setScalar(0.22); brillo.material.opacity=0.7*Math.sin(clamp(pr(lk,0.5,0.6))*PI);
    const a=eio(lk/1.7); render(P.s,{eye:L3([0.35,1.75,0.25],[0.28,1.65,0.05],a),target:[0,0.8,-1],fov:40,dof:[1.2,0.006,0.008],bloom:[0.6,0.5,1.2],exp:1.0,t}); } }
// L — el abrigo cuesta: come sin parar (una cuarta parte de su peso al día)
function tL(t){ const P=S.m; mar(t,'dia'); const lt=t-36.36; const {N,bot,almejas}=P; ponN(N[0],0,0,-PI/2+0.4,t); const n=N[0];
  const ciclo=0.62; const ci=Math.floor(lt/ciclo), cu=(lt%ciclo)/ciclo; animaN(n,t,{dormida:0,mastica:1,bL:[-0.3,-0.9],bR:[0.3,-0.9]});
  n.updateMatrixWorld(); const boca=n.localToWorld(new THREE.Vector3(0.62,0.17,0)); almejas.forEach((a,i)=>{ const j=i-(ci%almejas.length); a.visible=false; });
  const a0=almejas[ci%almejas.length]; a0.visible=true; a0.position.copy(boca).add(new THREE.Vector3(0,0.02*Math.sin(cu*PI*6),0)); a0.rotation.set(t*2,0,0.5);
  const a1=almejas[(ci+5)%almejas.length]; a1.visible=cu<0.9; const tt=cu*ciclo; a1.position.set(boca.x+0.8*tt,boca.y+1.6*tt-5*tt*tt,boca.z+0.4*tt); a1.rotation.set(tt*12,tt*8,0);
  botAgua(0.75,-0.55,-0.6,t); bot.pose(t,[['Idle',0]]); bot.cara({sorpresa:0.4+0.5*pr(t,S.wcuarta,0.3)});
  const a=lerp(0.4,1.3,eio(lt/4.37)); render(P.s,{eye:[Math.sin(a)*1.4,0.85,Math.cos(a)*1.4],target:[0,0.15,-0.25],fov:40,bloom:[0.5,0.5,1.3],exp:1.0,t});
  if(t>=S.wcuarta) cifra('25 %',540,330,220,pr(t,S.wcuarta,0.3),{sub:'DE SU PESO, CADA DÍA'}); }
// =========================== COCINA (tacos) ===========================
function taco(){ const g=new THREE.Group(); const tor=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.24,26,1,true,PI,PI),std('#e7c27a',{roughness:0.85,side:THREE.DoubleSide})); tor.rotation.z=PI/2; tor.rotation.y=0; g.add(tor);
  const carne=new THREE.Mesh(new THREE.CapsuleGeometry(0.06,0.14,4,10),std('#6b3d22',{roughness:0.85})); carne.rotation.z=PI/2; carne.position.y=-0.045; carne.scale.set(0.85,0.9,0.75); g.add(carne);
  for(let k=0;k<5;k++){ const c=new THREE.Mesh(new THREE.SphereGeometry(0.016,6,5),std(k%3?'#3f8a2a':'#f2efe6',{roughness:0.7})); c.position.set((rand(k)-0.5)*0.2,0.025+rand(k*3)*0.02,(rand(k*7)-0.5)*0.07); g.add(c); }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); return g; }
async function escenaCocina(){ const s=new THREE.Scene(); const H_=await hdrLocal('art_studio_4k.hdr',5); s.environment=H_.env; s.background=H_.raw; s.backgroundBlurriness=0.5; s.backgroundIntensity=0.6;
  const mesa=new THREE.Mesh(new THREE.BoxGeometry(8,0.1,5),pbr('kitchen_wood',[3,2],{roughness:0.6})); mesa.position.y=-0.05; mesa.receiveShadow=true; s.add(mesa);
  const T0=taco(); const tacos=[]; const posT=[]; let k=0; for(let lv=0;lv<9;lv++){ const n=Math.max(1,9-lv); for(let i=0;i<n;i++){ for(let j=0;j<(lv<6?2:1);j++){ const t=T0.clone(); s.add(t); tacos.push(t); posT.push([(i-(n-1)/2)*0.25+rand(k)*0.03,0.065+lv*0.135,(j-1)*0.27+rand(k*3)*0.03-0.4,(rand(k*5)-0.5)*0.4]); k++; } } }
  const plato=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.4,0.04,48),std('#f1ece2',{roughness:0.35})); plato.position.set(0,0.02,-0.4); plato.receiveShadow=true; s.add(plato);
  const sol=new THREE.DirectionalLight('#fff0dc',2.6); sombra(sol,4,30); s.add(sol,sol.target); apunta(sol,[0.5,-0.8,-0.4],[0,0,0],12); const pl=new THREE.PointLight('#ffb36a',4,8,1.5); pl.position.set(-1.5,1.5,1.2); s.add(pl);
  const bot=new Bot(BOT,1); s.add(bot.g); S.c={s,tacos,posT,bot};
}
// M — veinte kilos de tacos: llueven tacos y se arma la torre junto al robot
function tM(t){ const P=S.c; const lt=t-40.73; const {tacos,posT,bot}=P; const n=tacos.length;
  tacos.forEach((tc,i)=>{ const t0=0.05+i/n*1.7; const a=pr(lt,t0,0.3); const p=posT[i]; tc.visible=a>0; tc.position.set(p[0],p[1]+(1-ei(a))*3.0*(a<1?1:0),p[2]); tc.rotation.set(0,p[3],(1-a)*2); });
  bot.g.position.set(1.15,0,0.15); bot.g.rotation.y=-0.7; bot.pose(t,[['Idle',0],['Standing',S.wveinte-0.1,{once:true}],['Idle',S.wveinte+1]]); bot.cara({sorpresa:pr(t,S.wveinte-0.1,0.3),feliz:0.3}); bot.cabeza(-0.3*pr(t,S.wveinte,0.4),0);
  const a=eio(lt/2.91); render(P.s,{eye:L3([1.2,0.55,1.6],[2.6,1.7,3.6],a),target:L3([0.2,0.4,-0.3],[0.2,0.8,-0.4],a),fov:42,bloom:[0.5,0.5,1.3],exp:1.0,t});
  if(t>=S.wveinte) cifra('20 kg',540,330,220,pr(t,S.wveinte,0.3),{sub:'DE TACOS, DIARIO'}); }
// N — el secreto: un bolsillo de piel bajo el brazo
function tN(t){ const P=S.m; mar(t,'dia'); const lt=t-43.64; const {N,bot}=P; const n=N[0]; apunta(P.sol,[-0.45,-0.7,0.55],[0,0,0],40); ponN(n,0,0,-PI/2,t); const ab=pr(t,S.wbolsillo-0.2,0.5);
  animaN(n,t,{dormida:0,cabeza:-0.1,bR:[lerp(0.5,-1.9,es(ab)),lerp(-0.25,0.2,ab)]}); n.userData.bol.visible=ab>0.1; n.userData.bolLuz.material.opacity=0.8*ab*(0.8+0.2*Math.sin(t*8)); n.userData.bolLuz.scale.setScalar(0.35);
  botAgua(-0.62,0.2,0.9,t); bot.pose(t,[['Idle',0]]); bot.cara({sorpresa:0.3+0.6*ab,mira:-0.3}); bot.cabeza(0.15,0.25);
  let eye,tg,fov=38; if(t<S.wbolsillo-0.2){ const a=eio(lt/1.45); eye=L3([1.0,1.05,-1.4],[0.85,0.95,-1.2],a); tg=[-0.1,0.15,-0.1]; } else { const a=eio(pr(t,S.wbolsillo-0.2,2.2)); eye=L3([0.85,0.95,-1.2],[0.62,0.42,-0.6],a); tg=L3([-0.1,0.15,-0.1],[0.17,0.08,-0.18],a); fov=lerp(38,32,a); }
  render(P.s,{eye,target:tg,fov,dof:[0.75,0.006,0.008],bloom:[0.6,0.5,1.2],exp:1.0,t}); }
// O — saca comida y su piedra favorita; rompe la concha; el robot imita… en su pecho
function tO(t){ const P=S.m; mar(t,'dia'); const lt=t-47.55; const {N,bot,alm,roca,roca2,chispa,esq,chispas}=P; const n=N[0]; ponN(n,0,0,-PI/2,t); n.updateMatrixWorld();
  const pocket=n.localToWorld(new THREE.Vector3(0.2,0.08,-0.2)), pecho=n.localToWorld(new THREE.Vector3(0.22,0.16,0)); const golpe=S.wconchas;
  const sale=es(pr(t,S.wguardan,0.5)); alm.visible=t<golpe+0.05; alm.position.copy(pocket.clone().lerp(pecho.clone().add(new THREE.Vector3(0,0.1+Math.max(0,Math.sin(pr(t,S.wromper,golpe-S.wromper)*PI*2))*0.12,0)),sale)); alm.rotation.set(0,t,0);
  const sr=es(pr(t,S.wpiedra-0.1,0.4)); roca.visible=t>=S.wpiedra-0.1; roca.position.copy(pocket.clone().lerp(pecho.clone().add(new THREE.Vector3(0.05,0,0)),sr)); chispa.position.copy(roca.position).add(new THREE.Vector3(0,0.08,0)); chispa.scale.setScalar(0.25); chispa.material.opacity=0.9*Math.sin(clamp(pr(t,S.wfav,0.6))*PI);
  vuela(esq,t,pecho.toArray(),{t0:golpe,v:0.8,g:3});
  animaN(n,t,{dormida:0,bL:[-0.4,-0.5],bR:[0.4,-0.5],cabeza:-0.05});
  // robot: copia el gesto y se da en el pecho (clang)
  botAgua(-0.7,-0.25,0.8,t); const cl=golpe+0.35; bot.pose(t,[['Idle',0],['Punch',cl-0.3,{once:true,vel:1.4}],['Idle',cl+0.6]]); bot.cara({feliz:t<cl?0.6:0,sorpresa:t>=cl?1:0}); roca2.visible=true; bot.g.updateMatrixWorld(); roca2.position.copy(bot.g.localToWorld(new THREE.Vector3(0,0.55,0.25)));
  vuela(chispas,t,roca2.position.toArray(),{t0:cl,v:0.9,g:2}); const sh=tiembla(t,0.01*pr(t,cl,0.05)*(1-pr(t,cl,0.4)));
  const a=eio(lt/4.27); render(P.s,{eye:add3(L3([0.6,0.85,1.1],[0.2,0.7,1.25],a),sh),target:[-0.2,0.2,0],fov:40,bloom:[0.6,0.5,1.2],exp:1.0,t}); }
// P — la cría flota como globo; el robot se hunde (bajo el agua: la cría arriba, el robot cae)
function tP(t){ const P=S.m; mar(t,'dia'); const lt=t-51.82; const {cria,bot}=P; ponN(cria,0.1,0.15,-PI/2+0.3,t,{alto:0.05+0.03*Math.sin(t*4),esc:0.48}); animaN(cria,t,{dormida:0.3,seed:7});
  const hund=pr(t,S.wtanto,2.6); bot.g.position.set(-0.45,hW(-0.45,0,t)-0.3-es(hund)*2.4,0); bot.g.rotation.set(0,0.5,0); bot.pose(t,[['Idle',0],['Jump',S.wtanto,{fijo:0.4}]]); bot.cara({sorpresa:0.6+0.4*hund}); bot.cabeza(-0.4*hund,0);
  let eye,tg,fov=40; if(t<S.wbajo-0.05){ const a=eio(lt/2); eye=L3([0.9,0.55,1.4],[0.7,0.3,1.2],a); tg=[-0.15,0.0,0.05]; }
  else { const a=eio(pr(t,S.wbajo,1.6)); burbujas(t,bot.g.position.toArray().map((v,i)=>i===1?v+0.9:v),S.wbajo,80); eye=L3([0.5,-2.6,1.4],[0.45,-2.9,1.2],a); tg=[0,0.1,-0.1]; fov=58; sub(true); }
  render(P.s,{eye,target:tg,fov,bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// Q — mamá la envuelve en algas, se va a cazar; la cría flota como corcho
function tQ(t){ const P=S.m; mar(t,'dia'); const lt=t-55.36; const {N,cria,bot,envC,anillo}=P; const n=N[0];
  const w=pr(t,S.wenvuelve-0.1,1.1); const caza=pr(t,S.wcazar-0.4,0.8); ponN(n,-0.1,-0.3,-PI/2+0.2,t,{alto:-caza*1.2}); animaN(n,t,{dormida:0,bL:[-0.6,-0.5],bR:[0.6,-0.5]}); n.rotation.z+=caza*1.4; n.visible=caza<0.95;
  anillo.visible=caza>0.3; anillo.position.set(-0.1,hW(-0.1,-0.3,t)+0.01,-0.3); anillo.scale.setScalar(0.2+pr(t,S.wcazar-0.1,1.2)*1.4); anillo.material.opacity=0.8*(1-pr(t,S.wcazar-0.1,1.2));
  const cork=pr(t,S.wcria-0.1,0.3); ponN(cria,0.25,0.2,-PI/2+0.3+cork*Math.sin(t*2)*0.6,t,{alto:0.05+cork*(0.08*Math.abs(Math.sin(t*5.5))),esc:0.48}); animaN(cria,t,{dormida:0.5,seed:7}); enrolla(envC,w);
  botAgua(0.85,-0.55,-0.6,t); bot.g.position.y-=1.4*(1-pr(t,S.wcria-0.3,0.6)); bot.pose(t,[['Idle',0],['Wave',S.wcria,{vel:1.1}]]); bot.cara({feliz:0.8});
  let eye,tg,fov=40; if(t<S.wy3-0.05){ const a=eio(lt/2.8); eye=L3([0.75,0.95,1.3],[0.55,1.3,1.1],a); tg=[0.05,0.05,-0.05]; } else { const a=eio(pr(t,S.wy3,2.1)); eye=L3([0.55,0.75,0.95],[0.75,1.0,1.4],a); tg=[0.3,0.08,0.1]; }
  render(P.s,{eye,target:tg,fov,bloom:[0.5,0.5,1.3],exp:1.0,t}); }
// R — de noche vuelven a buscar una mano
function tR(t){ const P=S.m; mar(t,'noche'); const lt=t-60.27; const {N,bot}=P; const k=es(pr(lt,0.2,2.0)); const xs=[-2.0,-1.0,1.0,2.0], z0=[0.6,-0.4,0.5,-0.5];
  xs.forEach((x,i)=>{ const xx=x*lerp(1.8,1,k), zz=z0[i]*lerp(2,1,k); ponN(N[i],xx,zz,-PI/2+(1-k)*(i%2?0.7:-0.7),t+i); animaN(N[i],t,{dormida:0.4,bL:i>0?alcanza(1,pr(lt,1.4,0.8)):null,bR:i<3?alcanza(-1,pr(lt,1.4,0.8)):null,seed:i}); });
  botAgua(0,0.9,0,t); bot.pose(t,[['Idle',0],['Wave',S.wbuscar,{vel:0.9}]]); bot.cara({feliz:0.7});
  const a=eio(lt/2.68); render(P.s,{eye:L3([0.5,5.6,4.6],[0.3,4.4,3.5],a),target:[0,0,0.1],fov:46,bloom:[0.7,0.6,1.2],exp:1.35,t}); }
// =========================== MONTAJE ===========================
const TOMAS=[[0,4.09,t=>tA(t)],[4.09,6.0,tB],[6.0,9.73,tC],[9.73,11.73,tD],[11.73,15.18,tE],[15.18,20.0,tF],[20.0,22.45,tG],[22.45,25.36,tH],[25.36,27.9,tI],[27.9,31.45,tJ],
  [31.45,36.36,tK],[36.36,40.73,tL],[40.73,43.64,tM],[43.64,47.55,tN],[47.55,51.82,tO],[51.82,55.36,tP],[55.36,60.27,tQ],[60.27,62.95,tR],[62.95,99,t=>tA(t,t-62.95,true)]];
window.init=async(tl)=>{ await iniciar(); pasoNaN(); BOT=await glb('/three/examples/models/gltf/RobotExpressive/RobotExpressive.glb'); await expresionesRobot(BOT); palabras(tl.words); S.pelo=texPelo();
  const T=(q,n=1)=>{ let c=0; for(const w of WD){ if(w.t.toLowerCase().replace(/[¡¿!?.,…:]/g,'').startsWith(q)){ c++; if(c===n) return w.s; } } console.log('FALTA',q); return 0; };
  Object.assign(S,{wy:T('y'),wsolas:T('solas'),wcorr:T('corriente'),wagarran:T('agarran'),wpatas:T('patas'),wenredan:T('enredan'),wcobija:T('cobija'),wancla:T('ancla'),wvisto:T('visto'),wmil:T('mil'),
    wpero:T('pero'),wno:T('no',4),wgrasa:T('grasa'),wun:T('un',1),wcuadrito:T('cuadrito'),westamp:T('estampilla'),wtu:T('tú'),wcuarta:T('cuarta'),wveinte:T('veinte'),wbolsillo:T('bolsillo'),
    wguardan:T('guardan'),wpiedra:T('piedra'),wfav:T('favorita'),wromper:T('romper'),wconchas:T('conchas'),wtanto:T('tanto'),wbajo:T('pelo',3),wenvuelve:T('envuelve'),wcazar:T('cazar'),wcria:T('cría',2),wy3:T('cría',2),
    wbuscar:T('buscar'),wvuelven2:T('vuelven'),wmano2:T('mano',3)});
  await escenaMar(); await escenaPelo(); await escenaCocina(); window.S=S; window.listo=true; };
window.frame=(t)=>{ const Q=location.search; E.bloom.enabled=!Q.includes('nobloom'); if(Q.includes('nocria')) S.m.cria.layers.set(5); if(Q.includes('nobot')) S.m.bot.g.traverse(o=>o.layers.set(5)); const tm=TOMAS.find(x=>t>=x[0]&&t<x[1]); tm[2](t); return E.out.toDataURL('image/jpeg',0.92); };
