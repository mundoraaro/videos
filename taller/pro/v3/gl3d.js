/* Motor 3D propio (WebGL puro, sin librerías). Mallas básicas, luz direccional con sombras, luz ambiente de cielo/suelo,
 * brillo especular, emisivos y niebla. Se dibuja en modo inmediato: cada cuadro, la escena llama draw(malla, matriz, color, opciones).
 * Al final se compone con un lienzo 2D (OV) para textos y subtítulos.
 */
const W_=1080, H_=1920;
const GLC=document.createElement('canvas'); GLC.width=W_; GLC.height=H_;
const gl=GLC.getContext('webgl',{antialias:true,preserveDrawingBuffer:true,alpha:true,premultipliedAlpha:false});
const OUT=document.getElementById('c'), ctx=OUT.getContext('2d');
// ---------- matemáticas ----------
const M4={
  id:()=>[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
  mul(a,b){ const o=new Array(16); for(let c=0;c<4;c++) for(let r=0;r<4;r++){ let s=0; for(let k=0;k<4;k++) s+=a[k*4+r]*b[c*4+k]; o[c*4+r]=s; } return o; },
  persp(fov,asp,n,f){ const t=1/Math.tan(fov/2); return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]; },
  ortho(l,r,b,t,n,f){ return [2/(r-l),0,0,0, 0,2/(t-b),0,0, 0,0,-2/(f-n),0, -(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]; },
  look(e,c,u){ let z=norm3(sub3(e,c)), x=norm3(cross3(u,z)), y=cross3(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot3(x,e),-dot3(y,e),-dot3(z,e),1]; },
  T:(x,y,z)=>[1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1],
  S:(x,y,z)=>[x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1],
  RX:a=>{const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1];},
  RY:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1];},
  RZ:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1];},
};
function chain(...ms){ return ms.reduce((a,b)=>M4.mul(a,b)); }
function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];} function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross3(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];} function norm3(a){const l=Math.hypot(...a)||1;return [a[0]/l,a[1]/l,a[2]/l];}
function hexL(h){ return hex3(h).map(x=>Math.pow(x,2.2)); }
function hex3(h){h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);}
// ---------- mallas ----------
const MESH={};
function subir(name,P,N){ const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); const d=new Float32Array(P.length*2); for(let i=0;i<P.length/3;i++){ d.set(P.slice(i*3,i*3+3),i*6); d.set(N.slice(i*3,i*3+3),i*6+3);} gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW); MESH[name]={b,n:P.length/3}; }
function tri(P,N,a,b,c,n){ P.push(...a,...b,...c); if(n) N.push(...n,...n,...n); else { const nn=norm3(cross3(sub3(b,a),sub3(c,a))); N.push(...nn,...nn,...nn);} }
function mkBox(){ const P=[],N=[]; const f=(n,u,v)=>{ const c=n.map(x=>x*0.5), U=u.map(x=>x*0.5), V=v.map(x=>x*0.5); const p=(s,t)=>[c[0]+U[0]*s+V[0]*t,c[1]+U[1]*s+V[1]*t,c[2]+U[2]*s+V[2]*t];
  tri(P,N,p(-1,-1),p(1,-1),p(1,1),n); tri(P,N,p(-1,-1),p(1,1),p(-1,1),n); };
  f([1,0,0],[0,0,-1],[0,1,0]); f([-1,0,0],[0,0,1],[0,1,0]); f([0,1,0],[1,0,0],[0,0,-1]); f([0,-1,0],[1,0,0],[0,0,1]); f([0,0,1],[1,0,0],[0,1,0]); f([0,0,-1],[-1,0,0],[0,1,0]); subir('box',P,N); }
function mkSphere(name,seg=48,ruido=0,seed=1){ const P=[],N=[]; const v=(i,j)=>{ const th=i/seg*Math.PI, ph=j/seg*2*Math.PI; let d=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];
    let r=1; if(ruido){ for(let k=0;k<14;k++){ const cx=Math.sin(seed*13+k*7.1),cy=Math.cos(seed*5+k*3.3),cz=Math.sin(seed*2+k*1.7); const c=norm3([cx,cy,cz]); const dd=1-dot3(c,d); const rad=0.05+0.12*Math.abs(Math.sin(k*9.7)); if(dd<rad){ const u=dd/rad; r-=ruido*(1-u*u)*0.6; if(u>0.75) r+=ruido*0.25; } } }
    return d.map(x=>x*r); };
  for(let i=0;i<seg;i++) for(let j=0;j<seg;j++){ const a=v(i,j),b=v(i+1,j),c=v(i+1,j+1),d=v(i,j+1); if(ruido){ const fx=(p,q,r)=>{ let nn=norm3(cross3(sub3(q,p),sub3(r,p))); const m=[(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3,(p[2]+q[2]+r[2])/3]; if(dot3(nn,m)<0) nn=nn.map(x=>-x); const sm=norm3(m); const mixn=norm3([nn[0]*0.6+sm[0]*0.4,nn[1]*0.6+sm[1]*0.4,nn[2]*0.6+sm[2]*0.4]); P.push(...p,...q,...r); N.push(...mixn,...mixn,...mixn); }; fx(a,b,c); fx(a,c,d); } else { P.push(...a,...b,...c,...a,...c,...d); N.push(...norm3(a),...norm3(b),...norm3(c),...norm3(a),...norm3(c),...norm3(d)); } }
  subir(name,P,N); }
function mkCyl(name,seg=32,r1=1,r2=1){ const P=[],N=[]; for(let j=0;j<seg;j++){ const a0=j/seg*2*Math.PI,a1=(j+1)/seg*2*Math.PI; const p=(a,y,r)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  const n0=norm3([Math.cos(a0),(r1-r2)*0.5,Math.sin(a0)]), n1=norm3([Math.cos(a1),(r1-r2)*0.5,Math.sin(a1)]);
  P.push(...p(a0,-0.5,r1),...p(a1,-0.5,r1),...p(a1,0.5,r2),...p(a0,-0.5,r1),...p(a1,0.5,r2),...p(a0,0.5,r2)); N.push(...n0,...n1,...n1,...n0,...n1,...n0);
  tri(P,N,[0,0.5,0],p(a1,0.5,r2),p(a0,0.5,r2),[0,1,0]); tri(P,N,[0,-0.5,0],p(a0,-0.5,r1),p(a1,-0.5,r1),[0,-1,0]); } subir(name,P,N); }
function mkPlane(){ const P=[],N=[]; tri(P,N,[-0.5,0,-0.5],[-0.5,0,0.5],[0.5,0,0.5],[0,1,0]); tri(P,N,[-0.5,0,-0.5],[0.5,0,0.5],[0.5,0,-0.5],[0,1,0]); subir('plane',P,N); }
// ---------- shaders ----------
function prog(vs,fs){ const p=gl.createProgram(); for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){ const sh=gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p,sh);} gl.linkProgram(p); return p; }
const VS=`attribute vec3 aP; attribute vec3 aN; uniform mat4 uM,uV,uP,uL; varying vec3 vN; varying vec3 vW; varying vec4 vL;
void main(){ vec4 w=uM*vec4(aP,1.); vW=w.xyz; vN=mat3(uM)*aN; vL=uL*w; gl_Position=uP*uV*w; }`;
const FS=`precision highp float; varying vec3 vN; varying vec3 vW; varying vec4 vL; uniform vec3 uC,uLd,uLc,uSky,uGnd,uEye,uFog,uEm; uniform float uSpec,uFogD,uShad,uRim; uniform sampler2D uSm;
float sm(vec2 uv,float z){ return z-0.006>texture2D(uSm,uv).r?0.:1.; }
void main(){ vec3 n=normalize(vN); vec3 L=normalize(-uLd); float d=max(dot(n,L),0.);
 vec3 p=vL.xyz/vL.w*0.5+0.5; float s=1.; if(uShad>0.5&&p.x>0.&&p.x<1.&&p.y>0.&&p.y<1.){ float tx=1./2048.; s=0.; for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) s+=sm(p.xy+vec2(i,j)*tx,p.z); s/=9.; }
 vec3 v=normalize(uEye-vW); vec3 h=normalize(L+v); float sp=pow(max(dot(n,h),0.),40.)*uSpec*s;
 vec3 amb=mix(uGnd,uSky,n.y*0.5+0.5); float rim=pow(1.-max(dot(n,v),0.),3.)*uRim;
 vec3 col=uC*(amb+uLc*d*s)+uLc*sp+uEm+rim*uLc*0.6;
 float f=1.-exp(-uFogD*length(uEye-vW)); col=mix(col,uFog,clamp(f,0.,1.));
 col=(col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14); gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(1./2.2)),1.); }`;
const DVS=`attribute vec3 aP; uniform mat4 uM,uL; void main(){ gl_Position=uL*uM*vec4(aP,1.); }`;
const DFS=`precision highp float; void main(){ gl_FragColor=vec4(gl_FragCoord.z,0.,0.,1.); }`;
let PR,PD,SMT,SMF;
function glInit(){ PR=prog(VS,FS); PD=prog(DVS,DFS); gl.enable(gl.DEPTH_TEST); gl.getExtension('OES_texture_float');
  SMT=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,SMT); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,2048,0,gl.RGBA,gl.FLOAT,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  SMF=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,SMF); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,SMT,0);
  const rb=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,rb); gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,2048,2048); gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb); gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  mkBox(); mkSphere('sphere',48); mkCyl('cyl',40); mkCyl('cone',40,1,0); mkPlane(); }
// ---------- escena inmediata ----------
let LIST=[]; const ENV={sky:'#334',gnd:'#111',light:'#fff',lightI:2.2,dir:[-0.4,-1,-0.3],fog:'#000',fogD:0.0,bg:'#000',shadow:true,shadowBox:20,shadowCenter:[0,0,0]};
function draw(mesh,M,color,o={}){ LIST.push({mesh,M,c:hexL(color),em:o.em?hexL(o.em).map(x=>x*(o.emI??1)):[0,0,0],spec:o.spec??0.3,rim:o.rim??0,shadow:o.shadow??true}); }
function setAttr(p){ const s=24; const aP=gl.getAttribLocation(p,'aP'); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP,3,gl.FLOAT,false,s,0); const aN=gl.getAttribLocation(p,'aN'); if(aN>=0){ gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN,3,gl.FLOAT,false,s,12);} }
function render3d(eye,target,fov=0.8,up=[0,1,0]){
  const V=M4.look(eye,target,up), P=M4.persp(fov,W_/H_,0.1,400);
  const ld=norm3(ENV.dir), c=ENV.shadowCenter, sb=ENV.shadowBox; const le=[c[0]-ld[0]*60,c[1]-ld[1]*60,c[2]-ld[2]*60];
  const LV=M4.look(le,c,Math.abs(ld[1])>0.95?[0,0,1]:[0,1,0]), LP=M4.ortho(-sb,sb,-sb,sb,1,160), LM=M4.mul(LP,LV);
  if(ENV.shadow){ gl.bindFramebuffer(gl.FRAMEBUFFER,SMF); gl.viewport(0,0,2048,2048); gl.clearColor(1,1,1,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.useProgram(PD);
    gl.uniformMatrix4fv(gl.getUniformLocation(PD,'uL'),false,LM);
    for(const o of LIST){ if(!o.shadow) continue; const m=MESH[o.mesh]; gl.bindBuffer(gl.ARRAY_BUFFER,m.b); setAttr(PD); gl.uniformMatrix4fv(gl.getUniformLocation(PD,'uM'),false,o.M); gl.drawArrays(gl.TRIANGLES,0,m.n); } }
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,W_,H_); const bg=hex3(ENV.bg); gl.clearColor(bg[0],bg[1],bg[2],ENV.bgA??1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(PR); const U=n=>gl.getUniformLocation(PR,n);
  gl.uniformMatrix4fv(U('uV'),false,V); gl.uniformMatrix4fv(U('uP'),false,P); gl.uniformMatrix4fv(U('uL'),false,LM);
  gl.uniform3fv(U('uLd'),ld); gl.uniform3fv(U('uLc'),hexL(ENV.light).map(x=>x*ENV.lightI)); gl.uniform3fv(U('uSky'),hexL(ENV.sky)); gl.uniform3fv(U('uGnd'),hexL(ENV.gnd));
  gl.uniform3fv(U('uEye'),eye); gl.uniform3fv(U('uFog'),hexL(ENV.fog)); gl.uniform1f(U('uFogD'),ENV.fogD); gl.uniform1f(U('uShad'),ENV.shadow?1:0);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,SMT); gl.uniform1i(U('uSm'),0);
  for(const o of LIST){ const m=MESH[o.mesh]; gl.bindBuffer(gl.ARRAY_BUFFER,m.b); setAttr(PR); gl.uniformMatrix4fv(U('uM'),false,o.M); gl.uniform3fv(U('uC'),o.c); gl.uniform3fv(U('uEm'),o.em); gl.uniform1f(U('uSpec'),o.spec); gl.uniform1f(U('uRim'),o.rim); gl.drawArrays(gl.TRIANGLES,0,m.n); }
  LIST=[]; return {V,P}; }
// proyectar un punto 3D a pantalla (para colocar textos sobre objetos)
function proyecta(VP,p){ const m=M4.mul(VP.P,VP.V); const x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]; return [(x/w*0.5+0.5)*W_,(1-(y/w*0.5+0.5))*H_,w]; }
