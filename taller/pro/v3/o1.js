// OPCIÓN 1 — "Ciudad 3D de noche": ciudad con ventanas encendidas, personaje en una plaza, Luna gigante y cámara que vuela.
let CH; function setup(){ CH=chunks(3,15); }
const LUNA=[3,17,-80], RL=15;
function cieloNoche(t,u=0){ const g=ctx.createLinearGradient(0,0,0,1920); g.addColorStop(0,lerpC('#060818','#000000',u)); g.addColorStop(0.6,lerpC('#1A1840','#05060F',u)); g.addColorStop(1,lerpC('#3B2448','#0A0D22',u)); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920);
  for(let i=0;i<160;i++){ ctx.fillStyle=`rgba(255,255,255,${(0.25+0.6*rand(i))*(0.6+0.4*Math.sin(t*3+i))})`; circ(rand(i)*1080,rand(i+7)*1400,0.8+rand(i+3)*1.8); ctx.fill(); } }
function lerpC(a,b,u){ const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16)); return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],clamp(u)))).join(',')})`; }
function halo(VP,p,r,a=0.5){ const q=proyecta(VP,p); if(q[2]<=0) return; const rp=r*1700/q[2]; const g=ctx.createRadialGradient(q[0],q[1],rp*0.6,q[0],q[1],rp*3.5); g.addColorStop(0,`rgba(255,236,200,${a})`); g.addColorStop(1,'rgba(255,236,200,0)'); ctx.fillStyle=g; circ(q[0],q[1],rp*3.5); ctx.fill(); }
function ciudad(){ const cols=['#1C2340','#232B4D','#1A1F38','#2A2F55'];
  for(let i=0;i<26;i++){ const ang=i/26*Math.PI*2, rad=11+rand(i)*9; const x=Math.cos(ang)*rad, z=Math.sin(ang)*rad-6; if(z>4) continue; if(Math.abs(x-1.5)<5&&z<-8) continue; const h=5+rand(i+3)*22; edificio(x,z,2.4+rand(i+5)*1.6,2.4,h,cols[i%4],rand(i)>0.5?'#FFD27A':'#FFB86B',i); } }
function suelo(){ draw('plane',M4.S(200,1,200),'#14182A',{spec:0.05}); draw('cyl',chain(M4.T(0,0.02,0),M4.S(6,0.04,6)),'#262C48',{spec:0.3});
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const p=[Math.cos(a)*5.6,0,Math.sin(a)*5.6]; draw('cyl',chain(M4.T(p[0],1.6,p[2]),M4.S(0.05,3.2,0.05)),'#3A3F5A'); draw('sphere',chain(M4.T(p[0],3.25,p[2]),M4.S(0.18,0.18,0.18)),'#FFE3A8',{em:'#FFD27A',emI:3,shadow:false}); } }
function setEnv(){ ENV.bg='#000000'; ENV.bgA=0; ENV.sky='#3A3F7A'; ENV.gnd='#1A1424'; ENV.light='#C9D6FF'; ENV.lightI=2.6; ENV.dir=[-0.3,-0.7,0.8]; ENV.fog='#2A2148'; ENV.fogD=0.012; ENV.shadow=true; }
function speed(k){ if(k<=0) return; ctx.save(); ctx.globalAlpha=0.18*k; for(let i=1;i<5;i++){ const s=1+i*0.035*k; ctx.drawImage(GLC,540-540*s,960-960*s,1080*s,1920*s); } ctx.restore(); }
function drawFrame(t){
  setEnv(); let eye,tg,fov=0.8,sk=0,u5=0; let sb=10, sc=[0,1,0];
  if(t<S.s2){ const u=eio(t/S.s2); eye=L3([2.4,1.1,2.4],[1.8,1.0,4.8],u); tg=L3([1.4,1.5,-0.6],[1.8,6.2,-40],eio(pr(t,0.3,2.6))); sb=8;
    suelo(); ciudad(); const mano=persona(1.4,-0.6,2.8,ap(t,0.2,1.2),t); hoja([mano[0],mano[1]+0.22,mano[2]],0.3,-0.2+Math.sin(t*2)*0.05);
    draw('sphere',chain(M4.T(...LUNA),M4.S(RL,RL,RL)),'#F2E9D5',{em:'#FFF2D6',emI:1.1,shadow:false}); }
  else if(t<S.s3){ const lt=t-S.s2; sk=1-pr(lt,0,0.25); eye=L3([0.2,1.0,3.2],[0.7,1.0,2.6],eio(lt/3)); tg=[0,0.85,0]; fov=0.6; sb=4; sc=[0,1,0];
    suelo(); ciudad(); const r=lerp(0,Math.PI/2,eio(pr(t,S.s2+0.3,1.4))); draw('box',chain(M4.T(0,0.78,0),M4.RY(r),M4.S(1.0,1.42,0.012)),'#F4F1EA',{spec:0.6,em:'#F4F1EA',emI:0.2});
    draw('box',chain(M4.T(0,0.02,0),M4.S(2.2,0.04,1)),'#2E3556'); }
  else if(t<S.s4){ const lt=t-S.s3; sk=1-pr(lt,0,0.25); const n=Math.min(5,Math.floor(lt/0.55)+1), capas=Math.pow(2,n), fu=(lt%0.55)/0.55; const a=lt*0.9+0.6;
    eye=[Math.cos(a)*3.4,2.2+lt*0.15,Math.sin(a)*3.4]; tg=[0,0.7,0]; sb=5; suelo(); ciudad();
    const h=Math.min(1.6,capas*0.05); for(let i=0;i<capas;i++) draw('box',chain(M4.T(0,0.05+(i+0.5)*h/capas,0),M4.S(1.6,h/capas*0.85,1.1)),i%2?'#ECE6D8':'#FFFFFF',{spec:0.4});
    if(n<5){ const ang=eio(clamp(fu*1.6))*Math.PI; draw('box',chain(M4.T(-0.8,0.05+h,0),M4.RZ(-ang),M4.T(0.8,0.01,0),M4.S(1.6,0.02,1.1)),'#FFFFFF',{spec:0.4}); } }
  else if(t<S.s5){ const lt=t-S.s4; sk=1-pr(lt,0,0.25); const hT=lerp(0.5,34,eo(pr(t,S.s4,2.2))); eye=L3([6,2,10],[9,26,22],eio(lt/3.6)); tg=[0,lerp(3,22,eio(lt/3.6)),-4]; sb=30; sc=[0,10,-4];
    suelo(); ciudad(); edificio(3.2,-4,3,3,30,'#2D3460','#FFD27A',99); draw('box',chain(M4.T(-0.6,hT/2,-4),M4.S(0.5,hT,0.5)),'#F4F1EA',{spec:0.5,em:'#FFF2D6',emI:0.35}); persona(-1.6,-2.5,0.6,1,t); }
  else { const lt=t-S.s5; sk=1-pr(lt,0,0.25); u5=eio(lt/2.6); eye=L3([10,30,24],[22,60,-40],u5); tg=L3([0,30,-6],[LUNA[0],LUNA[1],LUNA[2]],u5); sb=60; sc=[0,20,-6]; ENV.fogD=lerp(0.012,0.0,u5);
    suelo(); ciudad(); edificio(3.2,-4,3,3,30,'#2D3460','#FFD27A',99); const top=lerp(34,120,eo(pr(t,S.s5,1.6))); draw('box',chain(M4.T(-0.6,top/2,-4),M4.S(0.6,top,0.6)),'#F4F1EA',{em:'#FFF2D6',emI:0.6});
    draw('sphere',chain(M4.T(...LUNA),M4.S(RL,RL,RL)),'#F2E9D5',{em:'#FFF2D6',emI:1.1,shadow:false}); }
  ENV.shadowBox=sb; ENV.shadowCenter=sc;
  if(sk>0){ eye=[eye[0]+Math.sin(t*70)*0.03*sk,eye[1]+Math.cos(t*60)*0.03*sk,eye[2]]; }
  cieloNoche(t,u5); const VP=render3d(eye,tg,fov); if(t<S.s2||t>=S.s5) halo(VP,LUNA,RL,0.35+0.3*ap(t,S.luna1,0.3)*(1-pr(t,S.luna1+0.4,0.6)));
  ctx.drawImage(GLC,0,0); speed(sk);
  const vg=ctx.createRadialGradient(540,900,500,540,900,1300); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.55)'); ctx.fillStyle=vg; ctx.fillRect(0,0,1080,1920);
  // textos 3D
  if(t<S.s2){ texto3d('42',540,330,250,ap(t,0,0.35)); texto3d('DOBLECES',540,470,64,ap(t,0.15,0.35),{prof:6}); }
  else if(t<S.s3) texto3d('0.1 mm',540,420,190,ap(t,S.dec-0.2,0.35));
  else if(t<S.s4){ const n=Math.min(5,Math.floor((t-S.s3)/0.55)+1); texto3d('×'+Math.pow(2,n),540,360,220,ap(t,S.s3+(n-1)*0.55,0.25),{cara:'#FFD45C',lado:'#8A5A10'}); }
  else if(t<S.s5){ texto3d('105 m',540,360,200,ap(t,S.s4+0.3,0.35)); texto3d('20 DOBLECES',540,500,56,ap(t,S.s4+0.5,0.35),{prof:5}); }
  else { const n=Math.round(lerp(20,42,eio(pr(t,S.c42-0.2,0.9)))); texto3d(n+' DOBLECES',540,1110,110,1,{prof:10}); texto3d('440,000 KM',540,1230,64,ap(t,S.pasa-0.1,0.35),{cara:'#FFD45C',lado:'#8A5A10',prof:6}); }
  subs(CH,t);
}
