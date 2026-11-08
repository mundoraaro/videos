"""Storyboard -> timeline.json para el motor Pro (vertical, sin pantalla final).
python3 ../armar_tl.py   (desde la carpeta del video; usa words.json y storyboard.py)
storyboard.py define SB=[(ancla,tipo,params,beats,extra)], ACENTO='#hex', CLAVES=[palabras clave en acento]
"""
import json,sys
sys.path.insert(0,'.')
import storyboard as S
d=json.load(open('words.json')); W=d['words']; VOZ=d['voz']
P=lambda s:s.lower().strip('.,;:¿?¡!"…“”()')
def find(q,start):
    qs=[P(x) for x in q.split()]
    for i in range(start,len(W)):
        if all(i+j<len(W) and P(W[i+j]['t']).startswith(qs[j]) for j in range(len(qs))): return i
    raise SystemExit(f'ancla no encontrada: {q} desde {start}')
scenes=[]; cur=0
for n,(anc,tipo,p,beats,extra) in enumerate(S.SB):
    i=find(anc,cur); cur=i+1; t0=max(0,W[i]['s']-0.12) if n else 0.0
    sc={'n':n,'tipo':tipo,'p':p,'start':round(t0,3),'w':W[i]['t']}
    for k,b in beats.items(): sc[k]=round(W[find(b,i)]['s'],3)
    scenes.append(sc)
DUR=round(VOZ+0.35,3)
for k,sc in enumerate(scenes): sc['end']=scenes[k+1]['start'] if k+1<len(scenes) else DUR
json.dump({'words':W,'scenes':scenes,'duration':DUR,'acento':S.ACENTO,'claves':getattr(S,'CLAVES',[])},open('timeline.json','w'),ensure_ascii=False)
for sc in scenes:
    d_=sc['end']-sc['start']; flag=' <<< LARGA' if d_>4.5 else (' <<< CORTA' if d_<1.2 else '')
    print(f"{sc['n']:2d} {sc['start']:6.2f} {d_:4.1f}s {sc['tipo']:9s} {sc['w']}{flag}")
print('duración',DUR)
