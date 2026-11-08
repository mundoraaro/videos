// OPCIÓN 3 — "Viaje espacial": la Tierra, la Luna con cráteres y una tira de papel que crece hasta tocarla. Cámara en órbita, rápida.
let CH; const CONT=[];
function setup(){ CH=chunks(3,15); mkSphere('luna',72,0.1,4); for(let i=0;i<34;i++){ const th=0.5+rand(i)*2.1, ph=rand(i+9)*Math.PI*2; CONT.push([th,ph,0.18+rand(i+3)*0.3]); } }
const TIERRA=[0,-6,0], RT=6, LUN=[6,11,-24], RLU=3.2;
function estrellas(t,dy=0){ ctx.fillStyle='#02030A'; ctx.fillRect(0,0,1080,1920); const g=ctx.createRadialGradient(300,500,0,300,500,900); g.addColorStop(0,'rgba(70,60,150,0.25)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1920);
  for(let i=0;i<260;i++){ ctx.fillStyle=`rgba(255,255,255,${(0.2+0.7*rand(i))*(0.7+0.3*Math.sin(t*2+i))})`; circ(rand(i)*1080,(rand(i+4)*1920+dy*(0.3+rand(i)))%1920,0.6+rand(i+2)*1.8); ctx.fill(); } }
function env(){ ENV.bg='#000000'; ENV.bgA=0; ENV.sky='#2A3566'; ENV.gnd='#0A0C18'; ENV.light='#FFF3E0'; ENV.lightI=3.0; ENV.dir=[-0.5,-0.7,-0.5]; ENV.fogD=0; ENV.shadow=false; }
function tierra(rot){ draw('sphere',chain(M4.T(...TIERRA),M4.S(RT,RT,RT)),'#1F5FB8',{spec:1.2,rim:0.9});
  for(const [th,ph,s] of CONT){ const p=ph+rot; const n=[Math.sin(th)*Math.cos(p),Math.cos(th),Math.sin(th)*Math.sin(p)]; const c=TIERRA.map((v,k)=>v+n[k]*RT*0.985);
    draw('sphere',chain(M4.T(...c),alinea(n),M4.S(s*RT*0.55,0.025*RT,s*RT*0.42)),rand(th*99)>0.3?'#3E8E4E':'#B79A63',{spec:0.1}); }
}
function lunaE(p,r,rot){ draw('luna',chain(M4.T(...p),M4.RY(rot),M4.S(r,r,r)),'#CFC8BA',{spec:0.05,rim:0.4}); }
function atm(VP){ const q=proyecta(VP,TIERRA); if(q[2]<=0) return; const rp=RT*1700/q[2]*1.02; const g=ctx.createRadialGradient(q[0],q[1],rp*0.92,q[0],q[1],rp*1.18); g.addColorStop(0,'rgba(120,180,255,0)'); g.addColorStop(0.35,'rgba(120,180,255,0.55)'); g.addColorStop(1,'rgba(120,180,255,0)'); ctx.fillStyle=g; circ(q[0],q[1],rp*1.18); ctx.fill(); }
function tira(base,dir,len,w=0.08){ const b=[base[0]+dir[0]*len,base[1]+dir[1]*len,base[2]+dir[2]*len]; barra(base,b,w,'#FFFFFF',{em:'#FFF4DD',emI:0.7,spec:0.5}); return b; }
function streak(k){ if(k<=0) return; ctx.save(); ctx.globalAlpha=0.5*k; ctx.strokeStyle='#FFFFFF'; for(let i=0;i<40;i++){ const x=rand(i)*1080, y=rand(i+3)*1920, l=200+rand(i+5)*600; ctx.lineWidth=1+rand(i)*3; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+l*k); ctx.stroke(); } ctx.restore(); }
function drawFrame(t){ env(); let eye,tg,fov=0.8,ini=0,dy=0;
  const top=[TIERRA[0],TIERRA[1]+RT,TIERRA[2]]; const dirL=norm3(sub3(LUN,top));
  if(t<S.s2){ eye=L3([-1,1.6,9.5],[0.5,2.2,8],eio(t/S.s2)); tg=L3([3,1.6,-20],[4,3,-20],eio(t/S.s2)); dy=t*40;
    tierra(t*0.05); lunaE(LUN,RLU,t*0.1); const k=eo(pr(t,S.c1-0.3,1.2))*(1-0*0); tira(top,dirL,lerp(0,Math.hypot(...sub3(LUN,top))-RLU,k)); }
  else if(t<S.s3){ const lt=t-S.s2; ini=lt; const p=[0,0,0]; eye=L3([0.3,0.1,4.4],[2.4,0.4,2.6],eio(lt/3)); tg=p; fov=0.6;
    draw('box',chain(M4.T(...p),M4.RY(lerp(0.3,Math.PI/2,eio(pr(t,S.s2+0.3,1.4)))),M4.RX(Math.sin(t)*0.1),M4.S(1.2,1.7,0.012)),'#FAF8F2',{spec:0.8,em:'#FFFFFF',emI:0.1}); dy=lt*80; }
  else if(t<S.s4){ const lt=t-S.s3; ini=lt; const n=Math.min(5,Math.floor(lt/0.55)+1), capas=Math.pow(2,n), fu=(lt%0.55)/0.55; const a=lt*1.6;
    eye=[Math.sin(a)*3.6,Math.cos(a*0.7)*1.2+0.6,Math.cos(a)*3.6]; tg=[0,0,0]; const h=Math.min(1.8,capas*0.055);
    for(let i=0;i<capas;i++) draw('box',chain(M4.RY(lt*0.6),M4.T(0,-h/2+(i+0.5)*h/capas,0),M4.S(1.3,h/capas*0.82,0.95)),i%2?'#ECE7DC':'#FFFFFF',{spec:0.6});
    if(n<5){ const ang=eio(clamp(fu*1.6))*Math.PI; draw('box',chain(M4.RY(lt*0.6),M4.T(-0.65,h/2,0),M4.RZ(-ang),M4.T(0.65,0.01,0),M4.S(1.3,0.02,0.95)),'#FFFFFF',{spec:0.6}); } dy=lt*120; }
  else if(t<S.s5){ const lt=t-S.s4; ini=lt; // cerca de la superficie: la tira sube junto a un rascacielos diminuto
    eye=L3([top[0]+1.4,top[1]+0.25,top[2]+1.6],[top[0]+2.4,top[1]+1.6,top[2]+3.4],eio(lt/3.6)); tg=L3([top[0],top[1]+0.2,top[2]],[top[0],top[1]+1.2,top[2]],eio(lt/3.6)); fov=0.7;
    tierra(0.4); for(let i=0;i<14;i++){ const x=top[0]-0.6+rand(i)*1.2, z=top[2]-0.6+rand(i+3)*1.2; const h=0.05+rand(i+5)*0.25; draw('box',chain(M4.T(x,top[1]+h/2-0.03,z),M4.S(0.07,h,0.07)),'#9AA6C8',{em:'#FFD27A',emI:0.15}); }
    draw('box',chain(M4.T(top[0]+0.25,top[1]+0.32,top[2]),M4.S(0.09,0.7,0.09)),'#C9D2EA',{em:'#FFD27A',emI:0.2}); tira([top[0]-0.05,top[1]-0.05,top[2]],[0,1,0],lerp(0.05,0.85,eo(pr(t,S.s4,2))),0.03); }
  else { const lt=t-S.s5; ini=lt; const u=eio(lt/2.6); eye=L3([top[0]+6,top[1]+3,top[2]+9],[LUN[0]+5,LUN[1]-1,LUN[2]+7],u); tg=L3([top[0],top[1]+3,top[2]],LUN,u); dy=lt*300;
    tierra(0.4+lt*0.05); lunaE(LUN,RLU,lt*0.2); tira(top,dirL,lerp(4,Math.hypot(...sub3(LUN,top))-RLU*0.9,eo(pr(t,S.s5,1.6))),0.1); }
  estrellas(t,dy); const VP=render3d(eye,tg,fov); if(t<S.s2||t>=S.s4) atm(VP); ctx.drawImage(GLC,0,0); streak(t>=S.s2?1-pr(ini,0,0.3):0);
  const B={cara:'#FFFFFF',lado:'#2B4E9C'};
  if(t<S.s2){ texto3d('42',540,820,250,ap(t,0,0.35),B); texto3d('DOBLECES',540,960,62,ap(t,0.15,0.35),{...B,prof:6}); }
  else if(t<S.s3) texto3d('0.1 mm',540,420,190,ap(t,S.dec-0.2,0.35),B);
  else if(t<S.s4){ const n=Math.min(5,Math.floor((t-S.s3)/0.55)+1); texto3d('×'+Math.pow(2,n),540,360,220,ap(t,S.s3+(n-1)*0.55,0.25),{cara:'#7FD3FF',lado:'#1B3F86'}); }
  else if(t<S.s5){ texto3d('105 m',540,360,200,ap(t,S.s4+0.3,0.35),B); texto3d('20 DOBLECES',540,500,56,ap(t,S.s4+0.5,0.35),{...B,prof:5}); }
  else { const n=Math.round(lerp(20,42,eio(pr(t,S.c42-0.2,0.9)))); texto3d(n+' DOBLECES',540,1110,108,1,{...B,prof:10}); texto3d('440,000 KM',540,1230,62,ap(t,S.pasa-0.1,0.35),{cara:'#7FD3FF',lado:'#1B3F86',prof:6}); }
  subs(CH,t,{key:'#7FD3FF'});
}
