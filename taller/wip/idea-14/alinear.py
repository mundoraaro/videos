import re,json,wave,numpy as np,sys
txt=open('guion.txt').read(); txt=re.sub(r'\[[a-z ]+\]','',txt)
toks=txt.split()
SPOK={'2560':'dos mil quinientos sesenta','1969':'mil novecientos sesenta y nueve','1096':'mil noventa y seis','1325':'mil trescientos veinticinco','T.':'te'}
def syl(w):
    s=SPOK.get(w,w).lower()
    return max(1,len(re.findall(r'[aeiouáéíóúü]+',s)))
S=[syl(w) for w in toks]
w=wave.open('_v16.wav');a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
hop=160; e=np.array([np.sqrt(np.mean(a[i:i+320]**2)) for i in range(0,len(a)-320,hop)])
db=20*np.log10(e+1e-6); th=np.percentile(db,90)-35; sp=db>th
segs=[];i=0;n=len(sp)
while i<n:
  if sp[i]:
    j=i
    while j<n and sp[j]: j+=1
    segs.append([i*0.01,j*0.01]); i=j
  else: i+=1
m=[]
for s in segs:
  if m and s[0]-m[-1][1]<0.12: m[-1][1]=s[1]
  else: m.append(s)
seg=[s for s in m if s[1]-s[0]>0.06]
N,M=len(toks),len(seg)
k=sum(s[1]-s[0] for s in seg)/sum(S)
cs=np.concatenate([[0],np.cumsum(S)])
punct=[bool(re.search(r'[.,!?:]|\.\.\.$',t)) for t in toks]
INF=1e18
D=np.full((M+1,N+1),INF); B=np.zeros((M+1,N+1),dtype=int); D[0][0]=0
for j in range(1,M+1):
    dur=seg[j-1][1]-seg[j-1][0]
    for i in range(0,N+1):
        best=INF;bi=-1
        # empty segment (laugh/breath)
        c=D[j-1][i]+ (dur/0.25)**2*0.5+3
        if c<best: best,bi=c,i
        for p in range(max(0,i-40),i):
            if D[j-1][p]>=INF: continue
            sy=cs[i]-cs[p]; pred=k*sy
            c=D[j-1][p]+((dur-pred)/(0.25+0.2*pred))**2 + (0 if punct[i-1] else 4)
            if c<best: best,bi=c,p
        D[j][i]=best;B[j][i]=bi
i=N; asg=[]
for j in range(M,0,-1):
    p=B[j][i]; asg.append((j-1,p,i)); i=p
asg.reverse()
out=[None]*N
for j,p,i in asg:
    if p==i: print('seg vacío',seg[j]); continue
    s0,s1=seg[j]; tot=cs[i]-cs[p]; cur=s0
    for q in range(p,i):
        d=(s1-s0)*S[q]/tot; out[q]=[toks[q],int(cur*1000),int((cur+d)*1000)]; cur+=d
    print(round(s0,2),round(s1,2),' '.join(toks[p:i]))
json.dump(out,open('words_raw.json','w'),ensure_ascii=False)
print(N,'palabras')
