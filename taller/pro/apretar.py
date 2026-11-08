"""Quita silencios largos de la voz y ajusta los tiempos de palabra.
python3 apretar.py <carpeta> [maxgap=0.32] [tempo=1.0]
Lee voz_orig.wav y words_raw.json ([[texto, ms_ini, ms_fin], ...]).
Escribe voz.wav (48 kHz mono) y words.json ({voz, words:[{t,s,e,p}]}).
"""
import json, sys, os, wave, subprocess, numpy as np
D = os.path.abspath(sys.argv[1]); MAXGAP = float(sys.argv[2]) if len(sys.argv) > 2 else 0.32
TEMPO = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
SR = 48000
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(D, 'voz_orig.wav'), '-ar', str(SR), '-ac', '1',
                os.path.join(D, '_v48.wav')], check=True)
w = wave.open(os.path.join(D, '_v48.wav')); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close()
W = json.load(open(os.path.join(D, 'words_raw.json')))
segs = []; out = []; shift = 0.0; prev_end = 0.0; FADE = int(0.01 * SR)
for i, (t, s, e) in enumerate(W):
    s /= 1000; e /= 1000
    gap = s - prev_end
    if gap > MAXGAP:
        cut = gap - MAXGAP
        c0 = prev_end + MAXGAP / 2
        segs.append((c0, c0 + cut)); shift += cut
    out.append({'t': t, 's': round(s - shift, 3), 'e': round(e - shift, 3), 'p': 'P1'})
    prev_end = e
# construir audio sin los cortes
keep = []; cur = 0.0
for c0, c1 in segs:
    keep.append((cur, c0)); cur = c1
keep.append((cur, len(a) / SR))
parts = []
for k0, k1 in keep:
    x = a[int(k0 * SR):int(k1 * SR)].copy()
    if len(x) > 2 * FADE:
        x[:FADE] *= np.linspace(0, 1, FADE); x[-FADE:] *= np.linspace(1, 0, FADE)
    parts.append(x)
b = np.concatenate(parts)
tmp = os.path.join(D, '_tight.wav')
ww = wave.open(tmp, 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes(np.clip(b, -32768, 32767).astype(np.int16).tobytes()); ww.close()
if TEMPO != 1.0:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-filter:a', f'atempo={TEMPO}', '-ar', str(SR), os.path.join(D, 'voz.wav')], check=True)
    for o in out: o['s'] = round(o['s'] / TEMPO, 3); o['e'] = round(o['e'] / TEMPO, 3)
else:
    os.replace(tmp, os.path.join(D, 'voz.wav'))
dur = len(b) / SR / TEMPO
json.dump({'voz': round(dur, 3), 'words': out}, open(os.path.join(D, 'words.json'), 'w'), ensure_ascii=False)
print('voz', round(dur, 2), 's; cortes', len(segs))
