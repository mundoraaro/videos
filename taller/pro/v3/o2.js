// OPCIÓN 2 — "Maqueta de estudio": todo es una maqueta blanca de arquitectura sobre piso negro brillante, con luz dorada y cámara que gira.
let CH; function setup(){ CH=chunks(3,15); }
const ORO='#E8B04B';
function fondo(t,u=0){ const g=ctx.createRadialGradient(540,700,100,540,800,1500); g.addColorStop(0,u?'#0B0D1A':'#2A2118'); g.addColorStop(1,'#050505'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920);
  if(u){ for(let i=0;i<180;i++){ ctx.fillStyle=`rgba(255,240,220,${u*(0.2+0.6*rand(i))})`; circ(rand(i)*1080,rand(i+5)*1920,0.8+rand(i+2)*1.8); ctx.fill(); } } }
function env(){ ENV.bg='#000000'; ENV.bgA=0; ENV.sky='#3A3430'; ENV.gnd='#0A0806'; ENV.light='#FFD9A0'; ENV.lightI=1.5; ENV.dir=[0.7,-0.75,-0.35]; ENV.fog='#000000'; ENV.fogD=0.025; ENV.shadow=true; }
function piso(){ draw('cyl',chain(M4.T(0,-0.05,0),M4.S(9,0.1,9)),'#0E0C0B',{spec:0.35}); draw('cyl',chain(M4.T(0,-0.07,0),M4.S(9.05,0.06,9.05)),ORO,{spec:1,em:ORO,emI:0.15}); }
function maqueta(){ for(let i=0;i<22;i++){ const a=Math.PI+(i/22-0.5)*2.6, r=2.4+rand(i)*2.2; const x=Math.cos(a)*r, z=Math.sin(a)*r; const h=0.4+rand(i+4)*1.8; draw('box',chain(M4.T(x,h/2,z),M4.RY(a),M4.S(0.8+rand(i)*0.5,h,0.8)),'#EDEAE3',{spec:0.25}); } }
function hojaG(p,M,o={}){ draw('box',chain(M4.T(...p),M,M4.S(1.4,2.0,0.012)),'#FAF8F2',{spec:0.8,em:'#FFFFFF',emI:0.08,...o}); }
function lunaG(p,r){ draw('sphere',chain(M4.T(...p),M4.S(r,r,r)),'#F3D9A0',{spec:1,em:ORO,emI:0.5,rim:0.8}); }
function flash(k){ if(k<=0) return; ctx.fillStyle=`rgba(255,230,180,${0.35*k})`; ctx.fillRect(0,0,1080,1920); }
function drawFrame(t){ env(); let eye,tg,fov=0.75,u5=0,ini=0; ENV.shadowBox=8; ENV.shadowCenter=[0,1,0];
  if(t<S.s2){ const a=t*0.16-0.4; const R=lerp(4.2,5.4,eio(t/S.s2)); eye=[Math.sin(a)*R,lerp(1.6,2.4,eio(t/S.s2)),Math.cos(a)*R]; tg=[0,1.4,0];
    piso(); hojaG([0,1.4+Math.sin(t*1.6)*0.06,0],chain(M4.RY(t*0.8),M4.RX(0.15)));
    lunaG([0,lerp(-2,4.2,eo(pr(t,S.luna1-0.8,1.0))),-6],1.5); }
  else if(t<S.s3){ const lt=t-S.s2; ini=lt; const a=lerp(0.2,1.2,eio(lt/3)); eye=[Math.sin(a)*3.6,1.6,Math.cos(a)*3.6]; tg=[0,1.4,0]; fov=0.55;
    piso(); hojaG([0,1.4,0],M4.RY(lerp(0,Math.PI/2,eio(pr(t,S.s2+0.4,1.3))))); }
  else if(t<S.s4){ const lt=t-S.s3; ini=lt; const n=Math.min(5,Math.floor(lt/0.55)+1), capas=Math.pow(2,n), fu=(lt%0.55)/0.55; const a=lt*1.4;
    eye=[Math.sin(a)*5,lerp(1.8,2.8,lt/3),Math.cos(a)*5]; tg=[0,0.8,0]; piso();
    const h=Math.min(1.8,capas*0.055); for(let i=0;i<capas;i++) draw('box',chain(M4.T(0,(i+0.5)*h/capas,0),M4.S(1.4,h/capas*0.82,1.0)),i%2?'#EFEAE0':'#FFFFFF',{spec:0.5});
    if(n<5){ const ang=eio(clamp(fu*1.6))*Math.PI; draw('box',chain(M4.T(-0.7,h,0),M4.RZ(-ang),M4.T(0.7,0.01,0),M4.S(1.4,0.02,1.0)),'#FFFFFF',{spec:0.5}); }
    draw('cyl',chain(M4.T(0,h+0.02,0),M4.S(0.9,0.003,0.9)),ORO,{em:ORO,emI:1.5*(1-fu),shadow:false}); }
  else if(t<S.s5){ const lt=t-S.s4; ini=lt; const hT=lerp(0.3,7,eo(pr(t,S.s4,2))); eye=L3([4.5,1,4.5],[3.2,6.5,3.2],eio(lt/3.6)); tg=[0,lerp(1,5.5,eio(lt/3.6)),0]; ENV.shadowBox=10; ENV.shadowCenter=[0,3,0];
    piso(); maqueta(); draw('box',chain(M4.T(1.4,3,0.4),M4.S(1,6,1)),'#EDEAE3',{spec:0.3}); draw('box',chain(M4.T(-0.3,hT/2,0),M4.S(0.35,hT,0.35)),'#FFFFFF',{spec:0.6,em:'#FFF4DD',emI:0.25});
    draw('box',chain(M4.T(-0.3,hT,0),M4.S(0.38,0.03,0.38)),ORO,{em:ORO,emI:2,shadow:false}); }
  else { const lt=t-S.s5; ini=lt; u5=eio(lt/2.6); eye=L3([3.2,6.5,3.2],[2.5,22,4],u5); tg=L3([0,6,0],[0,24,-6],u5); ENV.fogD=0.01;
    piso(); maqueta(); draw('box',chain(M4.T(1.4,3,0.4),M4.S(1,6,1)),'#EDEAE3'); const top=lerp(7,30,eo(pr(t,S.s5,1.4))); draw('box',chain(M4.T(-0.3,top/2,0),M4.S(0.4,top,0.4)),'#FFFFFF',{em:'#FFF4DD',emI:0.4});
    lunaG([0,lerp(40,25,u5),-9],4.2); }
  fondo(t,u5); render3d(eye,tg,fov); ctx.drawImage(GLC,0,0); flash(1-pr(ini,0,0.18)*1 - (t<S.s2?1:0));
  const vg=ctx.createRadialGradient(540,900,450,540,900,1250); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.65)'); ctx.fillStyle=vg; ctx.fillRect(0,0,1080,1920);
  const ORO3={cara:'#FFE7B0',lado:'#7A5418'}, SER='"Bitstream Charter", serif';
  if(t<S.s2){ texto3d('42',540,330,260,ap(t,0,0.35),{...ORO3,fam:SER,peso:700}); texto3d('DOBLECES',540,480,60,ap(t,0.15,0.35),{prof:5}); }
  else if(t<S.s3) texto3d('0.1 mm',540,400,180,ap(t,S.dec-0.2,0.35),{...ORO3,fam:SER,peso:700});
  else if(t<S.s4){ const n=Math.min(5,Math.floor((t-S.s3)/0.55)+1); texto3d('×'+Math.pow(2,n),540,360,220,ap(t,S.s3+(n-1)*0.55,0.25),{...ORO3,fam:SER,peso:700}); }
  else if(t<S.s5){ texto3d('105 m',540,360,200,ap(t,S.s4+0.3,0.35),{...ORO3,fam:SER,peso:700}); texto3d('20 DOBLECES',540,500,54,ap(t,S.s4+0.5,0.35),{prof:5}); }
  else { const n=Math.round(lerp(20,42,eio(pr(t,S.c42-0.2,0.9)))); texto3d(n+' DOBLECES',540,1110,104,1,{...ORO3,prof:10}); texto3d('440,000 KM',540,1230,60,ap(t,S.pasa-0.1,0.35),{prof:6}); }
  subs(CH,t,{key:'#F2C462'});
}
