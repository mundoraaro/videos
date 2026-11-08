"""Mezcla cinematográfica: voz + música sintetizada con estructura (intro/valle/subida/drop/final) + efectos por evento.
python3 mix.py <carpeta> <id>   (lee voz.wav, timeline.json, video_mudo.mp4, sfx.json)
sfx.json: {"musica":{"bpm":120,"secciones":[[t,"intro|valle|subida|drop|final"],...]},
           "eventos":[[t,"tipo",gain],...]}  tipos: paso, golpe, doblez, retumbo, despegue, impacto, corte, ding, pop, erupcion, viento, brillo, riser
"""
import json, sys, os, wave, subprocess, numpy as np
D=os.path.abspath(sys.argv[1]); ID=sys.argv[2]; SR=48000
TL=json.load(open(os.path.join(D,'timeline.json'))); CF=json.load(open(os.path.join(D,'sfx.json')))
DUR=TL['duration']; N=int((DUR+0.6)*SR); t=np.arange(N)/SR; rng=np.random.default_rng(3)
def rd(p):
    w=wave.open(p); ch=w.getnchannels(); sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; w.close()
    if ch==2: a=a.reshape(-1,2).mean(1)
    if sr!=SR: a=np.interp(np.arange(int(len(a)*SR/sr))*sr/SR,np.arange(len(a)),a).astype(np.float32)
    return a
voz=np.zeros(N,np.float32); v=rd(os.path.join(D,'voz.wav')); voz[:min(N,len(v))]=v[:N]
def lp(x,a):  # paso bajo de un polo
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def lpf(x,fc):
    from scipy.signal import butter,sosfilt; return sosfilt(butter(2,fc/(SR/2),output='sos'),x).astype(np.float32)
def hpf(x,fc):
    from scipy.signal import butter,sosfilt; return sosfilt(butter(2,fc/(SR/2),btype='high',output='sos'),x).astype(np.float32)
def bpf(x,f1,f2):
    from scipy.signal import butter,sosfilt; return sosfilt(butter(2,[f1/(SR/2),f2/(SR/2)],btype='band',output='sos'),x).astype(np.float32)
nota=lambda m:440*2**((m-69)/12)
# ---------------- música ----------------
M=CF['musica']; BPM=M['bpm']; beat=60/BPM; secc=M['secciones']
def seccion(x):
    s='intro'
    for t0,nm in secc:
        if x>=t0: s=nm
    return s
prog=[(45,[0,3,7]),(41,[0,4,7]),(48,[0,4,7]),(43,[0,4,7])]   # Am F C G
nivel={'intro':dict(kick=0.6,hat=0.0,bass=0.7,pad=0.8,arp=0.5,snare=0),'valle':dict(kick=0,hat=0.3,bass=0.4,pad=0.9,arp=0.8,snare=0),
       'subida':dict(kick=0.8,hat=0.8,bass=0.9,pad=0.7,arp=1.0,snare=0.5),'drop':dict(kick=1,hat=1,bass=1,pad=0.8,arp=1,snare=1),'final':dict(kick=1,hat=0.9,bass=1,pad=1,arp=1.1,snare=1)}
mus=np.zeros(N,np.float32)
def put(buf,s,t0,g=1.0):
    i=int(t0*SR)
    if i>=N or i<0: return
    L=min(len(s),N-i); buf[i:i+L]+=g*s[:L]
def kick():
    L=int(0.45*SR); tt=np.arange(L)/SR; f=48+120*np.exp(-tt*28); return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*7)+0.3*np.exp(-tt*300)*rng.standard_normal(L)).astype(np.float32)
def snare():
    L=int(0.3*SR); tt=np.arange(L)/SR; n=bpf(rng.standard_normal(L).astype(np.float32),1200,7000)*np.exp(-tt*14); return (n*0.9+0.5*np.sin(2*np.pi*190*tt)*np.exp(-tt*25)).astype(np.float32)
def hat():
    L=int(0.07*SR); tt=np.arange(L)/SR; return (hpf(rng.standard_normal(L).astype(np.float32),7000)*np.exp(-tt*60)).astype(np.float32)
def saw(f,d,det=0.006,decay=0.0):
    tt=np.arange(int(d*SR))/SR; x=sum(((tt*f*(1+k*det))%1*2-1) for k in (-1,0,1))/3; env=np.minimum(1,tt/0.02)*np.minimum(1,(d-tt)/0.08)
    if decay: env*=np.exp(-tt*decay)
    return (x*env).astype(np.float32)
K,SN,HT=kick(),snare(),hat()
nb=int(DUR/beat)+2
for b in range(nb):
    tb=b*beat; s=nivel[seccion(tb)]; bar=b//4; root,iv=prog[bar%4]
    if s['kick'] and (b%2==0 or seccion(tb) in ('drop','final')): put(mus,K,tb,0.55*s['kick'])
    if s['snare'] and b%2==1: put(mus,SN,tb,0.28*s['snare'])
    for h in range(2):
        if s['hat']: put(mus,HT,tb+h*beat/2,0.10*s['hat']*(1 if h else 0.6))
    if s['bass']:
        for h in range(2): put(mus,lpf(saw(nota(root-12),beat/2*0.9,0.004,6),700),tb+h*beat/2,0.22*s['bass'])
    if b%4==0 and s['pad']:
        pad=sum(saw(nota(root+12+i),beat*4+0.3,0.008) for i in iv); put(mus,lpf(pad,1800),tb,0.06*s['pad'])
    if s['arp']:
        for h in range(4):
            m=root+24+iv[(b*4+h)%3]+(12 if (b*4+h)%8>=6 else 0); put(mus,lpf(saw(nota(m),beat/4*0.9,0.003,10),3500),tb+h*beat/4,0.05*s['arp'])
# cortes de música para impactos (silencio breve antes del golpe)
for c in M.get('huecos',[]):
    i0,i1=int((c-0.28)*SR),int(c*SR); mus[i0:i1]*=np.linspace(1,0.15,i1-i0)
mus*=np.minimum(1,t/0.3)*np.clip((DUR+0.5-t)/1.0,0,1)
# ducking
from scipy.ndimage import uniform_filter1d
env=uniform_filter1d(np.abs(voz),int(0.25*SR)); mus*=1-0.5*np.clip(env/0.05,0,1)
# ---------------- efectos ----------------
fx=np.zeros(N,np.float32)
def ruido(L): return rng.standard_normal(L).astype(np.float32)
def swish(d=0.35,f1=800,f2=5000):  # papel / aire
    L=int(d*SR); tt=np.arange(L)/SR; n=ruido(L); fc=np.linspace(f1,f2,L); out=np.zeros(L,np.float32); blk=1024
    for i in range(0,L,blk): out[i:i+blk]=bpf(n[i:i+blk],max(60,fc[i]*0.5),min(SR/2-100,fc[i]*1.5))
    return out*np.sin(np.pi*tt/d)**1.5
def boom(d=1.6,f0=55):
    L=int(d*SR); tt=np.arange(L)/SR; f=f0+60*np.exp(-tt*6); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*2.2); n=lpf(ruido(L),400)*np.exp(-tt*3)*0.8
    return (s+n).astype(np.float32)
def paso():
    L=int(0.09*SR); tt=np.arange(L)/SR; return (bpf(ruido(L),800,3000)*np.exp(-tt*55)*0.6+np.sin(2*np.pi*140*tt)*np.exp(-tt*40)*0.5).astype(np.float32)
def golpe():
    L=int(0.35*SR); tt=np.arange(L)/SR; return (np.sin(2*np.pi*(90+150*np.exp(-tt*30))*tt)*np.exp(-tt*12)+lpf(ruido(L),2500)*np.exp(-tt*25)*0.6).astype(np.float32)
def retumbo(d=0.6):
    L=int(d*SR); tt=np.arange(L)/SR; return (lpf(ruido(L),180)*np.minimum(1,tt/(d*0.8))*3).astype(np.float32)
def ding():
    L=int(0.9*SR); tt=np.arange(L)/SR; return ((np.sin(2*np.pi*1568*tt)+0.4*np.sin(2*np.pi*2350*tt))*np.exp(-tt*5)).astype(np.float32)
def pop():
    L=int(0.12*SR); tt=np.arange(L)/SR; return (np.sin(2*np.pi*(500+900*tt*8)*tt)*np.exp(-tt*35)).astype(np.float32)
def riser(d):
    L=int(d*SR); tt=np.arange(L)/SR; f=200*np.exp(tt/d*2.5); s=np.sin(2*np.pi*np.cumsum(f)/SR)*0.3+swish(d,300,9000)*1.2; return (s*(tt/d)**2).astype(np.float32)
def brillo():
    L=int(1.4*SR); tt=np.arange(L)/SR; x=sum(np.sin(2*np.pi*nota(m)*tt)*np.exp(-np.maximum(0,tt-i*0.06)*4)*(tt>i*0.06) for i,m in enumerate([81,84,88,93,96])); return (x*0.4).astype(np.float32)
GEN={'paso':(paso,0.25),'golpe':(golpe,0.6),'doblez':(lambda:swish(0.32,600,4500),0.5),'retumbo':(lambda:retumbo(0.5),0.6),'despegue':(lambda:np.concatenate([swish(1.0,200,7000)*1.5,np.zeros(int(0.4*SR),np.float32)])+boom(1.4,45)*0.8,0.8),
     'impacto':(lambda:boom(2.0,40),1.0),'corte':(lambda:swish(0.28,500,6000),0.22),'ding':(ding,0.18),'pop':(pop,0.2),'erupcion':(lambda:boom(2.2,38)*1.0+np.concatenate([retumbo(1.5),np.zeros(int(0.7*SR),np.float32)])*0.7,0.9),
     'viento':(lambda:swish(1.4,300,2500)*1.4,0.5),'brillo':(brillo,0.35),'riser':(lambda:riser(0.9),0.35)}
for e in CF['eventos']:
    t0,tipo=e[0],e[1]; g=e[2] if len(e)>2 else 1.0; f,base=GEN[tipo]; put(fx,f(),t0,base*g)
fx*=1-0.25*np.clip(env/0.05,0,1)
# ---------------- master ----------------
mix=voz*1.0+mus*0.9+fx*0.75
st=np.stack([mix,mix],1); st/= max(1e-6,np.abs(st).max())/0.95
out=os.path.join(D,'_mezcla.wav'); w=wave.open(out,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
vid=os.path.join(D,'video_mudo.mp4')
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',vid,'-i',out,'-filter_complex','[1:a]loudnorm=I=-14:TP=-1.5:LRA=9[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',os.path.join(D,ID+'.mp4')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',os.path.join(D,ID+'.mp4'),'-vf','scale=720:1280','-c:v','libx264','-preset','veryfast','-crf','21','-c:a','copy',os.path.join(D,ID+'_720.mp4')],check=True)
print('listo',ID)
