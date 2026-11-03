// Emblema Oro y Silicio. o = {cx:offset moneda, sx:offset chip, p:progreso trazos 0..1, a:opacidad}
function emblem(id,o={}){const cx=o.cx||0,sx=o.sx||0,p=o.p===undefined?1:o.p;
const tr=[[[103,50],[122,50],[134,38],[150,38]],[[103,72],[160,72]],[[103,94],[130,94],[142,106],[176,106]],[[103,124],[146,124]],[[103,146],[118,146],[130,158],[148,158]]];
const len=pts=>pts.slice(1).reduce((s,q,i)=>s+Math.hypot(q[0]-pts[i][0],q[1]-pts[i][1]),0);
const traces=tr.map((pts,i)=>{const L=len(pts),pp=Math.max(0,Math.min(1,p*1.6-i*0.15));const end=pts[pts.length-1];
return `<polyline points="${pts.map(q=>q.join(',')).join(' ')}" stroke-dasharray="${L}" stroke-dashoffset="${L*(1-pp)}"/>`+
(pp>=0.98?`<rect x="${end[0]-4.5}" y="${end[1]-4.5}" width="9" height="9" rx="2" fill="#F3F6FA" stroke="none"/>`:'')}).join('');
const ticks=Array.from({length:30},(_,i)=>{const a=(90+i*6)*Math.PI/180;return `<line x1="${100+78*Math.cos(a)}" y1="${100+78*Math.sin(a)}" x2="${100+84*Math.cos(a)}" y2="${100+84*Math.sin(a)}"/>`}).join('');
return `<defs><radialGradient id="g${id}" gradientUnits="userSpaceOnUse" cx="70" cy="60" r="140"><stop offset="0" stop-color="#FFF0BF"/><stop offset=".45" stop-color="#EDBB4F"/><stop offset="1" stop-color="#8E5E10"/></radialGradient>
<linearGradient id="s${id}" gradientUnits="userSpaceOnUse" x1="100" y1="10" x2="190" y2="190"><stop offset="0" stop-color="#F3F6FA"/><stop offset="1" stop-color="#8994A3"/></linearGradient>
<clipPath id="L${id}"><rect x="0" y="0" width="97" height="200"/></clipPath><clipPath id="R${id}"><rect x="103" y="0" width="97" height="200"/></clipPath></defs>
<g transform="translate(${cx},0)"><g clip-path="url(#L${id})"><circle cx="100" cy="100" r="84" fill="url(#g${id})"/><circle cx="100" cy="100" r="70" fill="none" stroke="#9C6A12" stroke-width="3" opacity=".55"/><g stroke="#7a4f0c" stroke-width="2" opacity=".55">${ticks}</g></g></g>
<g transform="translate(${sx},0)"><g clip-path="url(#R${id})"><circle cx="100" cy="100" r="84" fill="#121924"/><circle cx="100" cy="100" r="84" fill="none" stroke="url(#s${id})" stroke-width="5"/>
<g fill="none" stroke="url(#s${id})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${traces}</g></g></g>`;}
if(typeof module!=='undefined')module.exports=emblem;
