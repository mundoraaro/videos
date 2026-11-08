"""Mezcla de audio (motor Pro, Shorts verticales): voz + música sintetizada por ánimo de escena + efectos.
python3 mix_largo.py <carpeta> <id>   (usa voz.wav, timeline.json, video_mudo.mp4)
Salida: <id>.mp4 (1080p, -14 LUFS) y <id>_720.mp4
"""
import json, sys, os, wave, subprocess, numpy as np
D=os.path.abspath(sys.argv[1]); ID=sys.argv[2]; SR=48000
TL=json.load(open(os.path.join(D,'timeline.json'))); DUR=TL['duration']; N=int(DUR*SR)+SR
rng=np.random.default_rng(7)
def media(x,k):
    c=np.cumsum(np.concatenate([np.zeros(1,np.float64),x.astype(np.float64)])); y=(c[k:]-c[:-k])/k
    pad=(len(x)-len(y)); return np.concatenate([np.full(pad//2,y[0]),y,np.full(pad-pad//2,y[-1])]).astype(np.float32)
def rd(p):
    w=wave.open(p); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; w.close(); return a
voz=np.zeros(N,np.float32); v=rd(os.path.join(D,'voz.wav')); voz[:len(v)]=v[:N]
t=np.arange(N)/SR
def nota(m): return 440*2**((m-69)/12)
# ---------- música: 3 ánimos (neutral, tenso, brillante) con acordes que cambian cada 4 compases ----------
BPM=96; beat=60/BPM
prog_neutral=[[45,52,57,60],[41,48,53,57],[43,50,55,59],[40,47,52,55]]   # Am F G Em
prog_tenso=[[45,52,57,60],[46,53,58,61],[45,52,57,60],[44,51,56,60]]     # Am Bb Am G#
prog_brillo=[[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57]]    # C G Am F
def pad(prog,amp):
    out=np.zeros(N,np.float32); bar=beat*4*2
    for i in range(int(DUR/bar)+1):
        ch=prog[i%len(prog)]; s0=int(i*bar*SR); s1=min(N,int((i+1)*bar*SR)+SR//2)
        tt=np.arange(s1-s0)/SR; env=np.minimum(1,tt/0.8)*np.minimum(1,np.maximum(0,(s1-s0)/SR-tt)/0.8)
        for m in ch:
            f=nota(m+12); out[s0:s1]+=amp*env*(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*f*2.003*tt)+0.15*np.sin(2*np.pi*f*0.5*tt))
    return out
def pulso(prog,amp,sub=2):
    out=np.zeros(N,np.float32); step=beat/sub
    for i in range(int(DUR/step)):
        bar=int(i*step/(beat*8)); m=prog[bar%len(prog)][0]; s0=int(i*step*SR); L=int(0.18*SR)
        if s0+L>N: break
        tt=np.arange(L)/SR; out[s0:s0+L]+=amp*np.exp(-tt*18)*np.sin(2*np.pi*nota(m)*tt)*(1.0 if i%sub==0 else 0.55)
    return out
def arpegio(prog,amp):
    out=np.zeros(N,np.float32); step=beat/2
    for i in range(int(DUR/step)):
        bar=int(i*step/(beat*8)); ch=prog[bar%len(prog)]; m=ch[[1,2,3,2][i%4]]+24; s0=int(i*step*SR); L=int(0.35*SR)
        if s0+L>N: break
        tt=np.arange(L)/SR; out[s0:s0+L]+=amp*np.exp(-tt*7)*np.sin(2*np.pi*nota(m)*tt)
    return out
M={'neutral':pad(prog_neutral,0.020)+pulso(prog_neutral,0.05)+arpegio(prog_neutral,0.012),
   'tenso':pad(prog_tenso,0.022)+pulso(prog_tenso,0.07,4)+arpegio(prog_tenso,0.010),
   'brillo':pad(prog_brillo,0.022)+pulso(prog_brillo,0.05)+arpegio(prog_brillo,0.016)}
# ánimo por escena con crossfade de 1.2 s
pesos={k:np.zeros(N,np.float32) for k in M}
for sc in TL['scenes']:
    p=sc.get('p',{}); tono=p.get('tono','cyan'); m='tenso' if (p.get('alarma') or tono in ('red','violet')) else ('brillo' if tono in ('gold','green') else 'neutral')
    s0=int(sc['start']*SR); s1=min(N,int(sc['end']*SR)); pesos[m][s0:s1]=1
k=int(1.2*SR); ker=np.ones(k)/k
for m in pesos: pesos[m]=media(pesos[m],k)
mus=sum(M[m]*pesos[m] for m in M)
# fade in/out
mus*=np.minimum(1,t/1.5)*np.minimum(1,np.maximum(0,DUR-t)/3)
# ducking bajo la voz
env=media(np.abs(voz),int(0.3*SR)); duck=1-0.55*np.clip(env/0.04,0,1)
mus*=duck
# ---------- efectos ----------
fx=np.zeros(N,np.float32)
def add(s,t0,g=1.0):
    i=int(t0*SR);
    if i<0 or i>=N: return
    L=min(len(s),N-i); fx[i:i+L]+=g*s[:L]
def whoosh(d=0.35,g=0.18):
    L=int(d*SR); n=rng.standard_normal(L).astype(np.float32); tt=np.arange(L)/SR
    env=np.sin(np.pi*tt/d)**2; c=np.cumsum(n); c-=np.convolve(c,np.ones(200)/200,mode='same'); return g*env*c/ (np.abs(c).max()+1e-6)
def boom(g=0.5):
    L=int(0.7*SR); tt=np.arange(L)/SR; f=60*np.exp(-tt*3)+35; return g*np.exp(-tt*5)*np.sin(2*np.pi*np.cumsum(f)/SR)
def tick(g=0.12):
    L=int(0.05*SR); tt=np.arange(L)/SR; return g*np.exp(-tt*120)*np.sin(2*np.pi*1800*tt)
def ding(g=0.10):
    L=int(0.6*SR); tt=np.arange(L)/SR; return g*np.exp(-tt*6)*(np.sin(2*np.pi*1320*tt)+0.5*np.sin(2*np.pi*1980*tt))
for i,sc in enumerate(TL['scenes']):
    if i==0: continue
    add(whoosh(0.3 if sc.get('tr')=='latigo' else 0.4, 0.22 if sc.get('tr')=='latigo' else 0.12), sc['start']-0.15)
    for b in ('b','c','d','e'):
        if sc.get(b) is not None: add(tick(),sc[b])
    for s in sc.get('sh',[]): add(boom(),s)
    if sc['tipo'] in ('cifra','hito') : add(ding(0.05),sc['start']+0.05)
mix=voz*1.0+mus+fx
mix=np.tanh(mix*1.1)/1.1
wo=wave.open(os.path.join(D,'_mezcla.wav'),'wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(SR); wo.writeframes((np.clip(mix,-1,1)*32767).astype(np.int16).tobytes()); wo.close()
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',os.path.join(D,'video_mudo.mp4'),'-i',os.path.join(D,'_mezcla.wav'),'-filter_complex','[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ac','2','-shortest',os.path.join(D,f'{ID}.mp4')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',os.path.join(D,f'{ID}.mp4'),'-vf','scale=720:1280','-c:v','libx264','-preset','veryfast','-crf','26','-c:a','aac','-b:a','128k',os.path.join(D,f'{ID}_720.mp4')],check=True)
print('listo',ID)
