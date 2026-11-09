import React from 'react'; import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
export type Palabra={t:string;s:number;e:number};
const CLAVE=/\d|luna|doble|edificio|gruesa|milímetro/i;
// Agrupa en bloques de hasta 3 palabras / 16 caracteres, cortando en signos de puntuación
export function bloques(W:Palabra[]){ const B:number[][]=[]; let cur:number[]=[]; W.forEach((w,i)=>{ cur.push(i); const len=cur.map(j=>W[j].t).join(' ').length; if(/[.,?!:…;]$/.test(w.t)||cur.length>=3||len>16){ B.push(cur); cur=[]; } }); if(cur.length) B.push(cur); return B; }
export const Subtitulos:React.FC<{palabras:Palabra[];y?:number;clave?:string}>=({palabras,y=1440,clave})=>{ const RX=clave?new RegExp(clave,'i'):CLAVE; const f=useCurrentFrame(); const {fps}=useVideoConfig(); const t=f/fps; const B=bloques(palabras);
  let bi=-1; B.forEach((b,i)=>{ if(palabras[b[0]].s-0.06<=t) bi=i; }); if(bi<0) return null; const b=B[bi], last=palabras[b[b.length-1]], nx=B[bi+1];
  const fin=nx?Math.min(palabras[nx[0]].s-0.04,last.e+0.45):last.e+0.6; if(t>fin) return null;
  const entra=spring({frame:f-Math.round((palabras[b[0]].s-0.06)*fps),fps,config:{damping:14,stiffness:220}});
  return <div style={{position:'absolute',top:y-70,left:0,width:1080,display:'flex',justifyContent:'center',gap:22,transform:`scale(${interpolate(entra,[0,1],[0.85,1])})`,opacity:entra}}>
    {b.map(i=>{ const w=palabras[i]; const on=t>=w.s-0.04; const k=spring({frame:f-Math.round((w.s-0.04)*fps),fps,config:{damping:12,stiffness:260}}); const txt=w.t.replace(/[¡¿]/g,'').toUpperCase();
      return <span key={i} style={{fontFamily:'"Inter Display", Inter, sans-serif',fontWeight:900,fontSize:88,lineHeight:1,display:'inline-block',color:on?(RX.test(txt)?'#FFD23F':'#FFFFFF'):'rgba(255,255,255,0.5)',
        WebkitTextStroke:'14px rgba(0,0,0,0.85)',paintOrder:'stroke fill',textShadow:'0 6px 18px rgba(0,0,0,0.55)',transform:`translateY(${on?(1-k)*18:0}px) scale(${on?interpolate(k,[0,1],[1.22,1]):1})`}}>{txt}</span>; })}
  </div>; };
