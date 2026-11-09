// CINE — motor de Shorts animados en 3D (Three.js). Reutilizable para cualquier guion.
// Personaje: RobotExpressive (Quaternius, CC0) con 14 animaciones y 3 expresiones.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
export {THREE};
export const W=1080, H=1920;
// ---------- utilidades ----------
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,u)=>a+(b-a)*u;
export const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export const L3=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
export const eo=u=>1-Math.pow(1-clamp(u),3);
export const ei=u=>Math.pow(clamp(u),3);
export const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
export const es=u=>{u=clamp(u);return u*u*(3-2*u);};
export const back=u=>{u=clamp(u);const c1=1.7,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
export const pr=(t,t0,d)=>clamp((t-t0)/d);
export function rand(s){let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);}
export function noise2(x,y,seed=0){ const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi; const h=(a,b)=>rand(a*57.3+b*311.1+seed*13.7);
  const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf); return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v); }
export function fbm(x,y,o=5,seed=0){ let s=0,a=0.5,f=1; for(let i=0;i<o;i++){ s+=a*noise2(x*f,y*f,seed+i); f*=2; a*=0.5; } return s; }
// ---------- texturas procedurales ----------
export function canvasTex(w,h,draw,{srgb=true,rep=false}={}){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c);
  if(srgb) t.colorSpace=THREE.SRGBColorSpace; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } t.anisotropy=8; return t; }
export function pixTex(w,h,f,opts){ return canvasTex(w,h,(g)=>{ const im=g.createImageData(w,h); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const c=f(x/w,y/h,x,y); const i=(y*w+x)*4; im.data[i]=c[0]; im.data[i+1]=c[1]; im.data[i+2]=c[2]; im.data[i+3]=c[3]??255; } g.putImageData(im,0,0); },opts); }
export const TEX={};
export function texturas(){
  TEX.ventanas=canvasTex(128,256,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); for(let r=0;r<16;r++) for(let c=0;c<8;c++){ const k=rand(r*13+c*7.3); if(k>0.42){ const warm=rand(r+c*3)>0.25; const b=0.45+0.55*rand(r*5+c);
    g.fillStyle=warm?`rgba(255,${190+40*b|0},${110+60*b|0},${b})`:`rgba(150,200,255,${b*0.8})`; g.fillRect(c*16+3,r*16+4,10,9); } } },{rep:true});
  TEX.papel=pixTex(256,256,(u,v)=>{ const n=0.93+0.07*fbm(u*40,v*40,3,2); const c=246*n; return [c,c*0.99,c*0.965]; },{rep:true});
  TEX.capas=canvasTex(16,256,(g,w,h)=>{ for(let i=0;i<32;i++){ g.fillStyle=i%2?'#F4F1EA':'#FBF9F4'; g.fillRect(0,i*8,w,8); g.fillStyle='rgba(120,110,95,0.55)'; g.fillRect(0,i*8+7,w,1); } },{rep:true});
  TEX.madera=pixTex(512,512,(u,v)=>{ const n=fbm(u*3,v*30,4,9); const veta=0.5+0.5*Math.sin((u*60+n*9)); const k=0.55+0.25*veta+0.2*n; return [150*k,92*k,55*k]; },{rep:true});
  TEX.luna=pixTex(1024,512,(u,v)=>{ let k=0.62+0.38*fbm(u*8,v*4,6,4); const mar=fbm(u*2.2,v*1.3,4,21); if(mar>0.55) k*=0.72;
    for(let i=0;i<70;i++){ const cu=rand(i*3.1), cv=0.12+0.76*rand(i*7.7), r=0.008+0.035*Math.pow(rand(i*1.9),2); const du=(Math.min(Math.abs(u-cu),1-Math.abs(u-cu)))*2, dv=v-cv; const d=Math.hypot(du,dv)/r;
      if(d<1) k*=0.78+0.18*d*d; else if(d<1.25) k*=1.12; } const c=228*k; return [c,c*0.98,c*0.94]; });
  TEX.tierra=pixTex(1024,512,(u,v)=>{ const lat=Math.abs(v-0.5)*2; const n=fbm(u*6,v*3,6,7)+0.12*(1-lat); if(lat>0.86) return [235,240,248];
    if(n>0.56){ const d=fbm(u*20,v*10,3,3); return lat<0.35&&d>0.55?[196,170,110]:[60+50*d,120+30*d,62]; } const o=0.6+0.4*n; return [18*o,62*o,140*o]; });
  TEX.nubes=pixTex(1024,512,(u,v)=>{ const n=fbm(u*9,v*5,6,31); const a=clamp((n-0.52)*4); return [255,255,255,255*a]; });
  TEX.bola=canvasTex(128,128,(g,w,h)=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.35,'rgba(255,255,255,0.5)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
  TEX.nube=pixTex(256,256,(u,v)=>{ const d=Math.hypot(u-0.5,v-0.5)*2; const n=fbm(u*5,v*5,5,11); const a=clamp((1-d)*1.6*(0.4+n)-0.25); return [255,255,255,255*a]; });
}
// ---------- motor ----------
export const E={};
export async function iniciar(){
  const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}); R.setSize(W,H,false); R.setPixelRatio(1);
  R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFShadowMap; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.0;
  E.R=R; E.cam=new THREE.PerspectiveCamera(35,W/H,0.05,20000);
  const comp=new EffectComposer(R); comp.setSize(W,H); E.rp=new RenderPass(new THREE.Scene(),E.cam); comp.addPass(E.rp);
  E.ao=new GTAOPass(new THREE.Scene(),E.cam,W/2,H/2); E.ao.enabled=false; comp.addPass(E.ao);
  E.bokeh=new BokehPass(new THREE.Scene(),E.cam,{focus:5,aperture:0.002,maxblur:0.008}); E.bokeh.enabled=false; comp.addPass(E.bokeh);
  E.bloom=new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.6,0.5,0.85); comp.addPass(E.bloom);
  comp.addPass(new OutputPass());
  E.grade=new ShaderPass({uniforms:{tDiffuse:{value:null},t:{value:0},vig:{value:0.35},grain:{value:0.035},ca:{value:0.0015},flash:{value:0},tint:{value:new THREE.Vector3(1,1,1)}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform sampler2D tDiffuse; uniform float t,vig,grain,ca,flash; uniform vec3 tint; varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+t*61.7)*43758.5453);}
      void main(){ vec2 d=vUv-0.5; vec3 c; c.r=texture2D(tDiffuse,vUv+d*ca).r; c.g=texture2D(tDiffuse,vUv).g; c.b=texture2D(tDiffuse,vUv-d*ca).b;
        c*=tint; c=mix(c,c*c*(3.0-2.0*c),0.25); float v=1.0-vig*smoothstep(0.25,0.85,length(d*vec2(1.0,0.75)));
        c*=v; c+=(h(vUv*vec2(1080.0,1920.0))-0.5)*grain; c=mix(c,vec3(1.0,0.97,0.92),flash); gl_FragColor=vec4(c,1.0);} `});
  comp.addPass(E.grade); E.comp=comp;
  E.pmrem=new THREE.PMREMGenerator(R);
  E.out=document.createElement('canvas'); E.out.width=W; E.out.height=H; E.ctx=E.out.getContext('2d');
  texturas();
}
export async function hdr(name){ const t=await new HDRLoader().loadAsync('/three/examples/textures/equirectangular/'+name); t.mapping=THREE.EquirectangularReflectionMapping; return E.pmrem.fromEquirectangular(t).texture; }
export async function glb(path){ return await new GLTFLoader().loadAsync(path); }
// ---------- personaje ----------
export class Bot{
  constructor(gltf,alto=1){ if(!gltf.userData.alto){ const b0=new THREE.Box3().setFromObject(gltf.scene); gltf.userData.alto=b0.max.y-b0.min.y; } this.root=SkeletonUtils.clone(gltf.scene); const b={max:{y:gltf.userData.alto},min:{y:0}}; const s=alto/(b.max.y-b.min.y); this.root.scale.setScalar(s);
    this.g=new THREE.Group(); this.g.add(this.root); this.mx=new THREE.AnimationMixer(this.root); this.A={}; this.heads=[]; this.bones={};
    for(const c of gltf.animations){ const a=this.mx.clipAction(c); a.play(); a.enabled=false; this.A[c.name]=a; }
    this.root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; o.frustumCulled=false; if(o.material){ o.material=o.material.clone(); o.material.envMapIntensity=0.8; } }
      if(o.morphTargetDictionary) this.heads.push(o); if(o.isBone) this.bones[o.name]=o; }); }
  // seq: [[clip, inicio, {once,vel,offset}], ...] ordenado por inicio; mezcla de 0.18 s entre clips
  pose(t,seq,fade=0.18){ this.tb=t; for(const k in this.A){ this.A[k].enabled=false; }
    seq.forEach(([c,t0,o={}],i)=>{ const t1=i+1<seq.length?seq[i+1][1]:1e9; if(t<t0-0.0001||t>t1+fade) return; const a=this.A[c]; const d=a.getClip().duration;
      let w=Math.min(1,(t-t0)/fade+(i===0?1:0)); if(t>t1) w=Math.min(w,1-(t-t1)/fade); w=clamp(w); if(w<=0) return;
      let lt=(t-t0)*(o.vel||1)+(o.offset||0); lt=o.once?Math.min(lt,d-0.001):lt%d; if(o.fijo!==undefined) lt=o.fijo; a.enabled=true; a.time=lt; a.setEffectiveWeight(w); });
    this.mx.update(0); this.cara(); }
  cara({enojo=0,sorpresa=0,triste=0,feliz=0,parpadeo=null,mira=0}={}){ if(parpadeo===null) parpadeo=Bot.blink(this.tb||0,this.seed||1)*(1-sorpresa*0.6); for(const h of this.heads){ const d=h.morphTargetDictionary, I=h.morphTargetInfluences; const put=(k,v)=>{ if(d[k]!==undefined) I[d[k]]=v; };
    put('Angry',enojo); put('Surprised',sorpresa); put('Sad',triste); put('Feliz',feliz); put('Parpadeo',parpadeo); put('MiraIzq',Math.max(0,mira)); put('MiraDer',Math.max(0,-mira)); } }
  // parpadeo natural: cada 1.2–3.2 s, 4 cuadros (determinista por semilla)
  static blink(t,seed=1){ let tb=0.4+rand(seed)*1.5, k=0; while(tb<t){ const d=t-tb; if(d<0.14) return Math.sin(d/0.14*Math.PI); tb+=1.2+rand(seed+(++k)*7.3)*2.0; } return 0; }
  cabeza(rx=0,ry=0){ const b=this.bones.Head; if(b){ b.rotation.x+=rx; b.rotation.y+=ry; } }
}
// ---------- piezas ----------
export function std(color,o={}){ return new THREE.MeshStandardMaterial({color,roughness:0.7,metalness:0,...o}); }
export function luna(r){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,96,64),new THREE.MeshStandardMaterial({map:TEX.luna,bumpMap:TEX.luna,bumpScale:3,roughness:1,emissive:'#e8ecf5',emissiveMap:TEX.luna,emissiveIntensity:0.9,fog:false})); return m; }
export function tierra(r){ const g=new THREE.Group(); const m=new THREE.Mesh(new THREE.SphereGeometry(r,128,96),new THREE.MeshStandardMaterial({map:TEX.tierra,roughness:0.6,metalness:0.0}));
  const n=new THREE.Mesh(new THREE.SphereGeometry(r*1.006,128,96),new THREE.MeshStandardMaterial({map:TEX.nubes,transparent:true,depthWrite:false,roughness:1}));
  const atm=new THREE.Mesh(new THREE.SphereGeometry(r*1.06,96,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
    vertexShader:'varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.0); vP=p.xyz; gl_Position=projectionMatrix*p; }',
    fragmentShader:'varying vec3 vN; varying vec3 vP; void main(){ float f=pow(1.0-abs(dot(normalize(-vP),vN)),2.0); gl_FragColor=vec4(vec3(0.35,0.65,1.0)*f*2.2,f); }'}));
  g.add(m,n,atm); g.userData={m,n}; return g; }
export function estrellas(n=3000,r=3000,seed=1){ const p=new Float32Array(n*3), c=new Float32Array(n*3); for(let i=0;i<n;i++){ const u=rand(i+seed)*2-1, a=rand(i*3.3+seed)*Math.PI*2, s=Math.sqrt(1-u*u);
    p.set([Math.cos(a)*s*r,u*r,Math.sin(a)*s*r],i*3); const b=0.4+0.6*Math.pow(rand(i*9.1),3); c.set([b,b,b*1.05],i*3); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3)); g.setAttribute('color',new THREE.BufferAttribute(c,3));
  return new THREE.Points(g,new THREE.PointsMaterial({size:2.2,sizeAttenuation:false,vertexColors:true,fog:false})); }
export function cieloGrad(top,mid,bot,r=8000){ return new THREE.Mesh(new THREE.SphereGeometry(r,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{a:{value:new THREE.Color(top)},b:{value:new THREE.Color(mid)},c:{value:new THREE.Color(bot)}},
  vertexShader:'varying vec3 vW; void main(){ vW=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform vec3 a,b,c; varying vec3 vW; void main(){ float y=vW.y; vec3 col=y>0.0?mix(b,a,pow(clamp(y*1.6,0.0,1.0),0.7)):mix(b,c,clamp(-y*4.0,0.0,1.0)); gl_FragColor=vec4(col,1.0);} '})); }
// edificio con ventanas (UV escaladas al tamaño para que las ventanas no se estiren)
const techo=std('#15171d',{roughness:0.9});
export function edificio(w,h,d,col='#1b2030',luz=1.4){ const g=new THREE.BoxGeometry(w,h,d); const uv=g.attributes.uv; const n=g.attributes.normal;
  for(let i=0;i<uv.count;i++){ const nx=Math.abs(n.getX(i)); uv.setXY(i,uv.getX(i)*(nx>0.5?d:w)/4,uv.getY(i)*h/8); }
  const m=new THREE.MeshStandardMaterial({color:col,roughness:0.55,metalness:0.2,emissive:'#ffffff',emissiveMap:TEX.ventanas,emissiveIntensity:luz*2.2,map:null});
  const e=new THREE.Mesh(g,[m,m,techo,techo,m,m]); e.castShadow=true; e.receiveShadow=true; return e; }
export function ciudad(grp,{n=260,r0=30,r1=500,hmin=10,hmax=90,y0=-60,seed=3,hueco=null}={}){ for(let i=0;i<n;i++){ const a=rand(i*1.7+seed)*Math.PI*2, r=r0+(r1-r0)*Math.pow(rand(i*2.3+seed),0.7);
    const x=Math.cos(a)*r, z=Math.sin(a)*r; if(hueco&&hueco(x,z)) continue; const w=6+rand(i*4.1)*14, d=6+rand(i*5.3)*14, h=hmin+(hmax-hmin)*Math.pow(rand(i*6.7+seed),1.6);
    const e=edificio(w,h,d,['#1b2030','#22283a','#171b26','#262c3d'][i%4],0.9+rand(i)*0.9); e.position.set(x,y0+h/2,z); grp.add(e); } }
// bloque de capas de papel (lados rayados por capa, tapa lisa)
export function bloque(){ const st=TEX.capas.clone(); st.needsUpdate=true; const sm=new THREE.MeshStandardMaterial({color:'#e2ded5',roughness:0.85,map:st});
  const tp=TEX.papel.clone(); tp.needsUpdate=true; const top=new THREE.MeshStandardMaterial({color:'#e6e2d9',roughness:0.8,map:tp,emissive:'#fff6e8',emissiveIntensity:0.0});
  const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),[sm,sm,top,top,sm,sm]); m.castShadow=true; m.receiveShadow=true; m.userData.st=st; return m; }
// Pila de papel que se dobla: n capas, doblez en curso fu (0..1), eje 'x' o 'z'
export class Pila{
  constructor(th=0.03){ this.th=th; this.g=new THREE.Group(); this.base=bloque(); this.piv=new THREE.Group(); this.flap=bloque(); this.piv.add(this.flap); this.g.add(this.base,this.piv); }
  set(n,fu,Wd,Dd,eje='x',alto=null){ const th=this.th, h=alto??n*th; const capas=(m,nn,hh)=>{ m.userData.st.repeat.set(1,(hh>4?hh/0.35:Math.min(nn,hh/0.012))/32); };
    this.base.scale.set(Wd,h,Dd); this.base.position.set(0,h/2,0); capas(this.base,n,h);
    if(fu<=0&&alto!==null){ this.piv.visible=false; return h; } this.piv.visible=fu>0||true; this.flap.scale.set(Wd,h,Dd); capas(this.flap,n,h);
    if(eje==='x'){ this.piv.position.set(Wd/2,h,0); this.piv.rotation.set(0,0,fu*Math.PI); this.flap.position.set(Wd/2,-h/2,0); }
    else { this.piv.position.set(0,h,Dd/2); this.piv.rotation.set(-fu*Math.PI,0,0); this.flap.position.set(0,-h/2,Dd/2); }
    return fu>=1?2*h:h; }
}
// ---------- capa 2D: subtítulos y cifras ----------
export let WD=[];
export function palabras(w){ WD=w; }
const FONT=(w,s)=>`${w} ${Math.round(s)}px "Inter Display", Inter, sans-serif`;
export function chunks(maxW=3,maxL=16){ const CH=[]; let cur=[]; WD.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>WD[j].t).join(' ').length; if(/[.,?!:…;]$/.test(w.t)||cur.length>=maxW||len>maxL){ CH.push(cur); cur=[]; } }); if(cur.length) CH.push(cur); return CH; }
export function subs(CH,t,{y=1460,size=86,key='#FFD23F',clave=/\d|luna|doble|edificio|milímetro|gruesa/i}={}){ const g=E.ctx; let ci=-1; for(let c=0;c<CH.length;c++) if(WD[CH[c][0]].s-0.06<=t) ci=c; if(ci<0) return;
  const ch=CH[ci], last=WD[ch[ch.length-1]], nx=CH[ci+1]; const fin=nx?Math.min(WD[nx[0]].s-0.04,last.e+0.45):last.e+0.6; if(t>fin) return;
  const ws=ch.map(i=>WD[i].t.replace(/[¡¿]/g,'').toUpperCase()); g.save(); g.font=FONT(900,size); const sp=g.measureText(' ').width; const wd=ws.map(w=>g.measureText(w).width); const tot=wd.reduce((a,b)=>a+b,0)+sp*1.35*(ws.length-1);
  let x=540-tot/2; g.textBaseline='middle'; g.lineJoin='round';
  ch.forEach((i,n)=>{ const on=t>=WD[i].s-0.04; const k=eo(pr(t,WD[i].s-0.04,0.14)); g.save(); g.translate(x+wd[n]/2,y-(on?(1-k)*18:0)); const s=on?lerp(1.18,1,k):1; g.scale(s,s); g.textAlign='center';
    g.lineWidth=14; g.strokeStyle='rgba(0,0,0,0.85)'; g.strokeText(ws[n],0,0); g.fillStyle=on?(clave.test(ws[n])?key:'#FFFFFF'):'rgba(255,255,255,0.55)'; g.shadowColor='rgba(0,0,0,0.5)'; g.shadowBlur=18; g.fillText(ws[n],0,0); g.restore(); x+=wd[n]+sp*1.35; });
  g.restore(); }
export function cifra(txt,x,y,size,k,{col='#FFFFFF',sub=null,subCol='#FFD23F'}={}){ if(k<=0) return; const g=E.ctx; g.save(); g.globalAlpha=clamp(k*2); g.translate(x,y); const s=back(k); g.scale(s,s);
  g.font=FONT(900,size); g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.lineWidth=size*0.12; g.strokeStyle='rgba(0,0,0,0.55)'; g.strokeText(txt,0,0);
  g.shadowColor='rgba(0,0,0,0.45)'; g.shadowBlur=30; g.fillStyle=col; g.fillText(txt,0,0);
  if(sub){ g.shadowBlur=0; g.font=FONT(800,size*0.3); g.lineWidth=8; g.strokeText(sub,0,size*0.68); g.fillStyle=subCol; g.fillText(sub,0,size*0.68); } g.restore(); }
// render de un fotograma: escena + cámara + post + capa 2D
export function render(scene,{eye,target,fov=35,roll=0,bloom=[0.6,0.5,0.85],dof=null,exp=1,flash=0,tint=[1,1,1],t=0,ao=null}){ const c=E.cam; c.fov=fov; c.position.set(...eye); c.up.set(Math.sin(roll),Math.cos(roll),0); c.lookAt(...target); c.updateProjectionMatrix();
  E.rp.scene=scene; E.R.toneMappingExposure=exp; const useAO=ao??E.aoDefault??false; E.ao.enabled=useAO; if(useAO){ E.ao.scene=scene; E.ao.camera=c; if(E.ao.gtaoMaterial) E.ao.updateGtaoMaterial({radius:0.35,distanceExponent:1.5,thickness:1,scale:1}); E.ao.blendIntensity=1; } E.bloom.strength=bloom[0]; E.bloom.radius=bloom[1]; E.bloom.threshold=bloom[2];
  if(dof){ E.bokeh.enabled=true; E.bokeh.scene=scene; E.bokeh.camera=c; const u=E.bokeh.uniforms; u.focus.value=dof[0]; u.aperture.value=dof[1]; u.maxblur.value=dof[2]; u.nearClip.value=c.near; u.farClip.value=c.far; } else E.bokeh.enabled=false;
  E.grade.uniforms.t.value=t; E.grade.uniforms.flash.value=flash; E.grade.uniforms.tint.value.set(...tint); E.comp.render();
  E.ctx.setTransform(1,0,0,1,0,0); E.ctx.globalAlpha=1; E.ctx.drawImage(E.R.domElement,0,0,W,H); }

// ======================= v2: assets reales, papel flexible, planetas NASA =======================
const TL_=new THREE.TextureLoader(); const A='/assets/';
const _cache={};
export function tx(path,{srgb=true,rep=null}={}){ const k=path+srgb; if(_cache[k]) return _cache[k]; const t=TL_.load(A+path); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8;
  if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(...rep); } return _cache[k]=t; }
export function pbr(name,rep=[1,1],o={}){ const r=(f,s)=>{ const t=tx(`tex/${name}/${f}.jpg`,{srgb:s}).clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(...rep); t.needsUpdate=true; return t; };
  return new THREE.MeshStandardMaterial({map:r('diff',true),normalMap:r('nor',false),roughnessMap:r('rough',false),roughness:1,metalness:0,...o}); }
export async function hdrLocal(name,tope=3){ const ld=new HDRLoader(); ld.setDataType(THREE.FloatType); const t=await ld.loadAsync(A+'hdri/'+name); t.mapping=THREE.EquirectangularReflectionMapping;
  const env=E.pmrem.fromEquirectangular(t).texture; const d=t.image.data; for(let i=0;i<d.length;i++){ if(d[i]>tope) d[i]=tope; } t.needsUpdate=true; return {raw:t,env}; }
export async function modelo(name,alto=null){ const g=await new GLTFLoader().loadAsync(`${A}models/${name}/${name}.gltf`); const o=g.scene;
  o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); if(alto){ const b=new THREE.Box3().setFromObject(o); o.scale.setScalar(alto/(b.max.y-b.min.y)); }
  const w=new THREE.Group(); w.add(o); const b2=new THREE.Box3().setFromObject(w); o.position.y-=b2.min.y; return w; }
export function lunaReal(r,seg=256){ const g=new THREE.SphereGeometry(r,seg,seg/2); const m=new THREE.MeshStandardMaterial({map:tx('nasa/luna.jpg'),displacementMap:tx('nasa/luna_disp.png',{srgb:false}),displacementScale:r*0.012,displacementBias:-r*0.006,
  bumpMap:tx('nasa/luna_disp.png',{srgb:false}),bumpScale:2,roughness:1,metalness:0,fog:false}); return new THREE.Mesh(g,m); }
export function tierraReal(r){ const g=new THREE.Group();
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,192,96),new THREE.MeshStandardMaterial({map:tx('nasa/tierra.jpg'),roughnessMap:tx('nasa/tierra_rough.png',{srgb:false}),roughness:1,metalness:0.0,
    emissiveMap:tx('nasa/luces.jpg'),emissive:'#ffcf8a',emissiveIntensity:0.0}));
  const n=new THREE.Mesh(new THREE.SphereGeometry(r*1.008,192,96),new THREE.MeshStandardMaterial({color:'#ffffff',alphaMap:tx('nasa/nubes.png',{srgb:false}),transparent:true,depthWrite:false,roughness:1}));
  const atm=new THREE.Mesh(new THREE.SphereGeometry(r*1.05,128,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,uniforms:{sol:{value:new THREE.Vector3(-1,0.6,0.5).normalize()}},
    vertexShader:'varying vec3 vN; varying vec3 vP; varying vec3 vW; void main(){ vN=normalize(normalMatrix*normal); vW=normalize((modelMatrix*vec4(normal,0.0)).xyz); vec4 p=modelViewMatrix*vec4(position,1.0); vP=p.xyz; gl_Position=projectionMatrix*p; }',
    fragmentShader:'uniform vec3 sol; varying vec3 vN; varying vec3 vP; varying vec3 vW; void main(){ float f=pow(1.0-abs(dot(normalize(-vP),vN)),3.0); float d=clamp(dot(vW,sol)*0.8+0.4,0.05,1.0); gl_FragColor=vec4(vec3(0.3,0.6,1.0)*f*2.5*d,f*d); }'}));
  g.add(m,n,atm); g.userData={m,n,atm}; return g; }
// Papel flexible: base rígida + solapa que se curva en el pliegue (curvatura máxima a mitad del doblez, plano al terminar)
export class PilaFlex{
  constructor(th=0.03,seg=56){ this.th=th; this.g=new THREE.Group(); this.base=bloque(); this.g.add(this.base);
    const mats=this.base.material.map(m=>{ const c=m.clone(); if(c.map){ c.map=c.map.clone(); c.map.needsUpdate=true; } return c; }); mats.forEach(m=>m.side=THREE.DoubleSide);
    this.geo=new THREE.BoxGeometry(1,1,1,seg,2,1); this.p0=this.geo.attributes.position.array.slice(); this.flap=new THREE.Mesh(this.geo,mats); this.flap.castShadow=this.flap.receiveShadow=true; this.flap.frustumCulled=false;
    this.flap.userData.st=mats[0].map; this.g.add(this.flap); }
  // n capas en la base, fu progreso del doblez, Wd largo de la solapa en dirección del doblez, Dd ancho, eje 'x'|'z', alto (forzado) para torres
  set(n,fu,Wd,Dd,eje='x',alto=null){ const h=alto??n*this.th; const capas=(st,hh)=>st.repeat.set(1,(hh>4?hh/0.35:Math.min(n,hh/0.012))/32);
    this.base.scale.set(eje==='x'?Wd:Dd,h,eje==='x'?Dd:Wd); this.base.position.set(0,h/2,0); capas(this.base.userData.st,h);
    if(alto!==null&&fu<=0){ this.flap.visible=false; return h; } this.flap.visible=true; capas(this.flap.userData.st,h);
    const th=fu*Math.PI, b=Math.max(1e-4,Wd*(0.08+0.55*Math.sin(Math.PI*clamp(fu)))*(fu>0.999?0:1)+1e-4); const pos=this.geo.attributes.position.array, p0=this.p0;
    // integra la curva del pliegue en 200 pasos
    const N=200, cx=[0], cy=[0], ph=[0]; for(let i=1;i<=N;i++){ const s=i/N*Wd; const f=th*es(Math.min(1,s/b)); const ds=Wd/N; cx.push(cx[i-1]+Math.cos(f)*ds); cy.push(cy[i-1]+Math.sin(f)*ds); ph.push(f); }
    for(let i=0;i<pos.length;i+=3){ const u=p0[i]+0.5, yl=(p0[i+1]-0.5)*h, w=p0[i+2]*Dd; const k=Math.min(N,Math.round(u*N)); const f=ph[k];
      const x=cx[k]-Math.sin(f)*yl, y=cy[k]+Math.cos(f)*yl; // yl ∈ [-h,0]
      if(eje==='x'){ pos[i]=Wd/2+x; pos[i+1]=h+y; pos[i+2]=w; } else { pos[i]=w; pos[i+1]=h+y; pos[i+2]=Wd/2+x; } }
    this.geo.attributes.position.needsUpdate=true; this.geo.computeVertexNormals(); this.flap.position.set(0,0,0); return h; }
}
export function proyecta(v){ const p=new THREE.Vector3(...v).project(E.cam); return [(p.x+1)/2*W,(1-p.y)/2*H,p.z]; }
// destello de lente simple (2D) para el sol
export function destello(pos3,k=1){ if(k<=0) return; const [x,y,z]=proyecta(pos3); if(z>1||x<-400||x>W+400||y<-400||y>H+400) return; const g=E.ctx; g.save(); g.globalCompositeOperation='lighter';
  const r=g.createRadialGradient(x,y,0,x,y,520); r.addColorStop(0,`rgba(255,250,235,${0.9*k})`); r.addColorStop(0.08,`rgba(255,230,190,${0.5*k})`); r.addColorStop(1,'rgba(255,200,150,0)'); g.fillStyle=r; g.fillRect(x-520,y-520,1040,1040);
  const cx=W/2, cy=H/2; [[0.35,40,'120,170,255'],[0.6,80,'255,190,120'],[1.3,26,'160,255,200'],[1.7,120,'120,140,255']].forEach(([f,s,c])=>{ const px=x+(cx-x)*f*2, py=y+(cy-y)*f*2; const q=g.createRadialGradient(px,py,0,px,py,s); q.addColorStop(0,`rgba(${c},${0.22*k})`); q.addColorStop(1,`rgba(${c},0)`); g.fillStyle=q; g.fillRect(px-s,py-s,2*s,2*s); });
  g.fillStyle=`rgba(255,240,220,${0.25*k})`; g.fillRect(x-700,y-1.5,1400,3); g.restore(); }
// Inyecta expresiones calculadas en Blender (blender_robot.py → robot_expresiones.json) al modelo original, sin re-exportarlo.
export async function expresionesRobot(gltf){ if(gltf.userData.expr) return; const J=await (await fetch('/assets/personajes/robot_expresiones.json')).json();
  const cuenta=[0,0,0]; J.mat_por_vert.forEach(m=>cuenta[m]++); const off=[0,cuenta[0],cuenta[0]+cuenta[1]];
  gltf.scene.traverse(o=>{ if(!o.isMesh||!o.morphTargetDictionary) return; const g=o.geometry, n=g.attributes.position.count; const mi=cuenta.indexOf(n); if(mi<0) return;
    for(const [nm,lista] of Object.entries(J.claves)){ const arr=new Float32Array(n*3); for(const [i,dx,dy,dz] of lista){ const j=i-off[mi]; if(j>=0&&j<n){ arr[j*3]=dx; arr[j*3+1]=dy; arr[j*3+2]=dz; } }
      const at=new THREE.Float32BufferAttribute(arr,3); at.name=nm; g.morphAttributes.position.push(at); if(g.morphAttributes.normal) g.morphAttributes.normal.push(new THREE.Float32BufferAttribute(new Float32Array(n*3),3)); }
    o.updateMorphTargets(); }); gltf.userData.expr=true; }
