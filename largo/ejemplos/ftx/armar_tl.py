import json,sys
sys.path.insert(0,'.')
from storyboard import SB
d=json.load(open('words.json')); W=d['words']; VOZ=d['voz']
P=lambda s:s.lower().strip('.,;:¿?¡!"…“”()')
idx_by_part={}
for i,w in enumerate(W): idx_by_part.setdefault(w['p'],[]).append(i)
cursor={}
def find(anchor,start_from=None,advance=False):
    part,q=anchor.split('|',1); qs=[P(x) for x in q.split()]
    ids=idx_by_part[part]; st=start_from if start_from is not None else cursor.get(part,ids[0])
    for i in ids:
        if i<st: continue
        if all(i+j<len(W) and W[i+j]['p']==part and P(W[i+j]['t']).startswith(qs[j]) for j in range(len(qs))):
            if advance: cursor[part]=i+1
            return i
    raise SystemExit(f'ancla no encontrada: {anchor} desde {st}')
scenes=[]
for n,(anc,tipo,p,beats,extra) in enumerate(SB):
    i=find(anc,advance=True); t0=max(0,W[i]['s']-0.15) if n else 0.0
    sc={'n':n,'tipo':tipo,'p':p,'start':round(t0,3),'w':W[i]['t']}
    for k,b in beats.items(): sc[k]=round(W[find(b,start_from=i)]['s'],3)
    if extra.get('tr'): sc['tr']=extra['tr']
    if extra.get('sh'): sc['sh']=[round(W[find(a,start_from=i)]['s'],3) for a in extra['sh']]
    scenes.append(sc)
END=VOZ+0.8
scenes.append({'n':len(scenes),'tipo':'final','p':{'l1':'¿Qué historia quieres que contemos?','l2':'Déjala en los comentarios','cta':'SUSCRÍBETE'},'start':round(END,3)})
DUR=END+6.0
for k,sc in enumerate(scenes): sc['end']=scenes[k+1]['start'] if k+1<len(scenes) else DUR
caps=[{'t':scenes[k]['start']+0.3,'n':SB[k][4]['cap'][0],'s':SB[k][4]['cap'][1]} for k in range(len(SB)) if SB[k][4].get('cap')]
json.dump({'words':W,'scenes':scenes,'duration':round(DUR,3),'caps':caps},open('timeline.json','w'),ensure_ascii=False)
for sc in scenes:
    d_=sc['end']-sc['start']; flag=' <<< LARGA' if d_>11 else (' <<< CORTA' if d_<2 else '')
    print(f"{sc['n']:2d} {sc['start']:7.2f} {d_:5.1f}s {sc['tipo']:10s} {sc.get('w','')}{flag}")
print('duración',round(DUR,1))
for c in caps: print(round(c['t'],1),c['n'],c['s'])
