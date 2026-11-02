"""Ajusta pausas de la narración y arma la línea de tiempo del video.

Uso: python3 timeline.py <carpeta>
Lee en <carpeta>:
  voz.wav            narración (cualquier formato que ffmpeg lea)
  words_raw.json     [[texto, inicio_ms, fin_ms], ...] desde la transcripción con word_timestamps
  escenas.json       {"inicios": [índices de palabra donde empieza cada escena], "tempo": 1.10, "pausa": 0.22}
Escribe: voz_final.wav (48 kHz mono, pausas recortadas, tempo aplicado) y timeline.json
"""
import json, wave, subprocess, sys, os
import numpy as np

D = sys.argv[1]
SR = 48000
cfg = json.load(open(os.path.join(D, 'escenas.json')))
TEMPO, GAP, TAIL = cfg.get('tempo', 1.15), cfg.get('pausa', 0.12), cfg.get('cola', 0.8)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(D, 'voz.wav'), '-ac', '1', '-ar', str(SR), '-sample_fmt', 's16', os.path.join(D, '_voz48.wav')], check=True)
w = wave.open(os.path.join(D, '_voz48.wav')); audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close()
total = len(audio) / SR
words = json.load(open(os.path.join(D, 'words_raw.json')))

regs = []
for t, s, e in words:
    a, b = max(0, s / 1000 - 0.12), min(total, e / 1000 + 0.22)
    if regs and a - regs[-1][1] <= GAP + 0.05:
        regs[-1][1] = max(regs[-1][1], b)
    else:
        regs.append([a, b])
regs[-1][1] = total

pieces, mapping, cur = [], [], 0.0
for i, (a, b) in enumerate(regs):
    if i:
        pieces.append(np.zeros(int(GAP * SR), dtype=np.float32)); cur += GAP
    seg = audio[int(a * SR):int(b * SR)].copy()
    f = min(len(seg), int(0.008 * SR)); r = np.linspace(0, 1, f); seg[:f] *= r; seg[-f:] *= r[::-1]
    mapping.append((a, b, cur)); pieces.append(seg); cur += b - a
out = np.concatenate(pieces)

def remap(t):
    for a, b, c in mapping:
        if a - 0.5 <= t <= b + 0.5:
            return c + min(max(t - a, 0), b - a)
    return t

k = 1 / TEMPO
W = [{'t': t, 's': round(remap(s / 1000) * k, 3), 'e': round(remap(e / 1000) * k, 3)} for t, s, e in words]
tmp = os.path.join(D, '_tight.wav')
wo = wave.open(tmp, 'wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(SR)
wo.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes()); wo.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-filter:a', f'atempo={TEMPO}', '-ar', str(SR), '-ac', '1', os.path.join(D, 'voz_final.wav')], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(D, 'voz_final.wav')]).decode()) + TAIL

ini = cfg['inicios']
scenes = []
for n, i0 in enumerate(ini):
    scenes.append({'n': n + 1, 'w0': i0, 'start': 0.0 if n == 0 else round(W[i0]['s'] - 0.12, 3)})
for n, s in enumerate(scenes):
    s['end'] = scenes[n + 1]['start'] if n + 1 < len(scenes) else round(dur, 3)
json.dump({'words': W, 'scenes': scenes, 'duration': round(dur, 3)}, open(os.path.join(D, 'timeline.json'), 'w'), ensure_ascii=False)
print(f'narración {total:.1f}s -> {dur:.1f}s con cola; {len(scenes)} escenas')
for s in scenes: print(s['n'], s['start'], s['end'], W[s['w0']]['t'])
# huecos de voz largos (posibles momentos muertos)
for a, b in zip(W, W[1:]):
    if b['s'] - a['e'] > 0.6: print('AVISO pausa larga', round(b['s'] - a['e'], 2), 's antes de', b['t'])
