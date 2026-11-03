"""Une las partes de voz, recorta palabras marcadas con ~ y comprime silencios largos.
Salida: voz.wav (48 kHz mono, tempo aplicado) y words.json [{t,s,e,p}] en segundos finales."""
import json, wave, subprocess, numpy as np, os
SR=48000; TEMPO=1.05; MAXGAP=0.42; PARTGAP=0.75; PRE=0.06
partes=['P1','P2','P3','P4','P5','P6']
out=[]; words=[]; cur=0.0
def load(n):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{n}.raw','-ac','1','-ar',str(SR),'-sample_fmt','s16',f'_{n}.wav'],check=True)
    w=wave.open(f'_{n}.wav'); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32); w.close(); return a
for pi,n in enumerate(partes):
    a=load(n); tot=len(a)/SR
    toks=open(f'w_{n}.txt').read().split()
    W=[]; 
    for tk in toks:
        txt,ds=tk.rsplit('@',1); W.append([txt,int(ds)/10])
    end=min(W[-1][1],tot); W=W[:-1]
    # regiones por palabra: [inicio-PRE, inicio de la siguiente]
    regs=[]
    for i,(txt,s) in enumerate(W):
        e=max(0,W[i+1][1]-PRE) if i+1<len(W) else end
        regs.append([txt,max(0,s-PRE),min(e,tot)])
    if pi>0:
        out.append(np.zeros(int(PARTGAP*SR),dtype=np.float32)); cur+=PARTGAP
    for txt,a0,a1 in regs:
        if txt.startswith('~'): continue
        seg=a[int(a0*SR):int(a1*SR)].copy()
        # si el tramo tiene silencio largo al final (pausa), recórtalo a MAXGAP
        dur=a1-a0
        # estima fin de voz: último punto con energía
        if len(seg)==0:
            words.append({'t':txt,'s':cur,'p':n}); continue
        env=np.abs(seg); thr=max(300,env.max()*0.04)
        idx=np.where(env>thr)[0]
        vend=(idx[-1]/SR+0.08) if len(idx) else dur
        keep=min(dur, vend+MAXGAP) if dur-vend>MAXGAP else dur
        seg=seg[:int(keep*SR)]
        f=min(len(seg),int(0.006*SR)); 
        if f>1: r=np.linspace(0,1,f); seg[:f]*=r; seg[-f:]*=r[::-1]
        words.append({'t':txt,'s':cur+PRE if a0>0 else cur,'p':n})
        out.append(seg); cur+=len(seg)/SR
    words[-1]['e_part']=cur
au=np.concatenate(out)
wo=wave.open('_tight.wav','wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(SR); wo.writeframes(np.clip(au,-32768,32767).astype(np.int16).tobytes()); wo.close()
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','_tight.wav','-filter:a',f'atempo={TEMPO}','-ar',str(SR),'-ac','1','voz.wav'],check=True)
k=1/TEMPO
for i,w in enumerate(words):
    w['s']=round(w['s']*k,3)
for i,w in enumerate(words):
    w['e']=round(words[i+1]['s'],3) if i+1<len(words) else round(cur*k,3)
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','voz.wav']).decode())
json.dump({'words':words,'voz':round(dur,3)},open('words.json','w'),ensure_ascii=False)
print('palabras',len(words),'duración voz',round(dur,1),'s')
