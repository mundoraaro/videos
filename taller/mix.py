"""Mezcla voz + ambiente + efectos, une las escenas y exporta el video final.

Uso: python3 mix.py <carpeta> <id>
Lee timeline.json, voz_final.wav, scene_XX.mp4 y cues.json:
  {"pop": [índices de palabra o {"t": segundos}], "thud": [...], "blip": [...], "whoosh_escenas": true}
Escribe <carpeta>/<id>.mp4 (1080x1920, para publicar) y <carpeta>/<id>_720.mp4 (para el estudio).
"""
import json, wave, sys, os, subprocess
import numpy as np

D, VID = os.path.abspath(sys.argv[1]), sys.argv[2]
SR = 48000
T = json.load(open(os.path.join(D, 'timeline.json'))); W = T['words']
cues = json.load(open(os.path.join(D, 'cues.json'))) if os.path.exists(os.path.join(D, 'cues.json')) else {}
w = wave.open(os.path.join(D, 'voz_final.wav')); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
N = int(T['duration'] * SR); v = np.pad(v, (0, max(0, N - len(v))))[:N]
t = np.arange(N) / SR; rng = np.random.default_rng(7)
when = lambda c: c['t'] if isinstance(c, dict) else W[c]['s']

pad = sum(np.sin(2 * np.pi * f * t + p) for f, p in [(110, 0), (164.8, 1), (220, 2), (329.6, .5)]) / 4
pad *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * t)
amb = 0.035 * pad + 0.02 * np.convolve(rng.standard_normal(N), np.ones(400) / 400, 'same') * 3
out = np.zeros(N)
def place(sig, s, g):
    i = int(s * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += g * sig[:j - i]
def pop():
    d = np.arange(int(.12 * SR)) / SR; f = 900 * np.exp(-d * 18) + 300; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-d * 30)
def whoosh():
    n = int(.35 * SR); x = np.convolve(rng.standard_normal(n), np.ones(30) / 30, 'same'); return x * np.sin(np.linspace(0, np.pi, n)) ** 2
def thud():
    d = np.arange(int(.4 * SR)) / SR; return np.sin(2 * np.pi * (70 - 30 * d) * d) * np.exp(-d * 9)
def blip():
    d = np.arange(int(.08 * SR)) / SR; return np.sin(2 * np.pi * 1320 * d) * np.exp(-d * 40)
if cues.get('whoosh_escenas', True):
    for s in T['scenes'][1:]: place(whoosh(), s['start'] - 0.12, 0.18)
for c in cues.get('pop', []): place(pop(), when(c), 0.22)
for c in cues.get('thud', []): place(thud(), when(c), 0.5)
for c in cues.get('blip', []): place(blip(), when(c), 0.15)
env = np.convolve(np.abs(v), np.ones(4800) / 4800, 'same'); duck = 1 - 0.5 * np.clip(env / 0.05, 0, 1)
m = v + (amb + out) * duck; m = m / max(1e-6, np.abs(m).max()) * 0.89
wo = wave.open(os.path.join(D, 'mezcla.wav'), 'wb'); wo.setnchannels(2); wo.setsampwidth(2); wo.setframerate(SR)
wo.writeframes((np.stack([m, m], 1) * 32767).astype(np.int16).tobytes()); wo.close()

lst = os.path.join(D, 'list.txt')
open(lst, 'w').write(''.join(f"file 'scene_{s['n']:02d}.mp4'\n" for s in T['scenes']))
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
run('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(D, '_mudo.mp4'))
tmp = os.path.join(D, f'{VID}.tmp.mp4')
run('-i', os.path.join(D, '_mudo.mp4'), '-i', os.path.join(D, 'mezcla.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-shortest', '-movflags', '+faststart', tmp)
os.replace(tmp, os.path.join(D, f'{VID}.mp4'))
run('-i', os.path.join(D, f'{VID}.mp4'), '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', os.path.join(D, f'{VID}_720.mp4'))
for f in [f'{VID}.mp4', f'{VID}_720.mp4']:
    print(f, round(os.path.getsize(os.path.join(D, f)) / 1e6, 1), 'MB')
