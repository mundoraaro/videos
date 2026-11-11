"""Mezcla voz + ambiente + efectos, une las escenas y exporta el video final.

Uso: python3 mix.py <carpeta> <id>
Lee timeline.json, voz_final.wav, scene_XX.mp4 y cues.json:
  {"pop": [índices de palabra o {"t": segundos}], "thud": [...], "blip": [...], "whoosh_escenas": true,
   "puf": [...], "boing": [...], "click": [...], "chispa": [...], "whoosh": [...],
   "musica": [{"t": 0, "estilo": "jugueton"}, {"w": 40, "estilo": "medieval"}], "corte": [índices de remates]}
Sonidos de marca (siempre los mismos, ver IDENTIDAD.md): "puf" = cambio de disfraz, "boing" = aterrizaje de Raro.
Estilos de música (sintetizados, sin derechos): jugueton, medieval, espacio, misterio, aventura.
"corte" silencia la música ~0.7 s en cada remate cómico.
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

# ---------- música de fondo por época/lugar ----------
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def tono(f, d, tipo):
    tt = np.arange(int(d * SR)) / SR
    if tipo == 'pluck':   x = sum(np.sin(2*np.pi*k*f*tt) / k * np.exp(-tt*(3+2.2*k)) for k in range(1, 7))
    elif tipo == 'marimba': x = np.sin(2*np.pi*f*tt) * np.exp(-tt*7) + 0.3*np.sin(2*np.pi*4*f*tt) * np.exp(-tt*22)
    elif tipo == 'synth': x = sum(np.sin(2*np.pi*k*f*tt*(1+0.003*(k%2))) / k for k in range(1, 9)) * np.minimum(1, tt/0.01) * np.exp(-tt*4)
    elif tipo == 'campana': x = (np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*2.76*f*tt)) * np.exp(-tt*3)
    elif tipo == 'bajo':  x = np.sin(2*np.pi*f*tt) * np.exp(-tt*3.5) + 0.2*np.sin(4*np.pi*f*tt) * np.exp(-tt*6)
    else:                 x = np.sin(2*np.pi*f*tt) * np.exp(-tt*4)
    return x / (np.abs(x).max() + 1e-9)
ESTILOS = {  # bpm, acordes (raíz midi + intervalos), instrumento melódico, patrón de arpegio, notas por tiempo
    'jugueton': (116, [(60,[0,4,7]),(57,[0,3,7]),(65,[0,4,7]),(67,[0,4,7])], 'marimba', [0,1,2,1,3,2,1,2], 2),
    'medieval': (100, [(62,[0,3,7]),(60,[0,4,7]),(62,[0,3,7]),(57,[0,4,7])], 'pluck',   [0,2,1,2,0,2,3,2], 2),
    'espacio':  (104, [(57,[0,3,7,10]),(53,[0,4,7,11]),(55,[0,4,7]),(52,[0,3,7])], 'synth', [0,1,2,3,2,1,2,3], 2),
    'misterio': (84,  [(57,[0,3,6]),(56,[0,4,7]),(57,[0,3,6]),(53,[0,4,8])], 'campana', [0,2,1,3], 1),
    'aventura': (128, [(55,[0,3,7]),(51,[0,4,7]),(53,[0,4,7]),(50,[0,4,7])], 'pluck',   [0,1,2,3,2,1,0,2], 2),
}
def pista(estilo, dur):
    bpm, acordes, inst, pat, sub = ESTILOS.get(estilo, ESTILOS['jugueton'])
    beat = 60 / bpm; n = int(dur * SR) + SR; y = np.zeros(n); step = beat / sub; k = 0; tt = 0.0
    while tt < dur:
        compas = int(tt / (beat * 4)) % len(acordes); raiz, ints = acordes[compas]
        if k % (4 * sub) == 0:
            b = tono(NOTE(raiz - 12), beat * 2, 'bajo'); i = int(tt * SR); y[i:i+len(b)] += 0.55 * b[:n-i]
        iv = ints[pat[k % len(pat)] % len(ints)] + (12 if pat[k % len(pat)] >= len(ints) else 0)
        nt = tono(NOTE(raiz + 12 + iv), step * 1.8, inst); i = int(tt * SR); y[i:i+len(nt)] += 0.35 * nt[:n-i]
        tt += step; k += 1
    return y[:int(dur * SR)]
mus = np.zeros(N)
plan = cues.get('musica', [{'t': 0, 'estilo': 'jugueton'}])
puntos = sorted([(c['t'] if 't' in c else W[c['w']]['s'], c['estilo']) for c in plan])
for j, (a, est) in enumerate(puntos):
    b = puntos[j+1][0] if j + 1 < len(puntos) else T['duration']
    seg = pista(est, b - a + 0.05); i0 = int(a * SR); seg = seg[:max(0, min(len(seg), N - i0))]
    f = min(len(seg), int(0.03 * SR)); r = np.linspace(0, 1, f); seg[:f] *= r; seg[-f:] *= r[::-1]
    mus[i0:i0+len(seg)] += seg
gain = np.ones(N)
for c in cues.get('corte', []):  # silencio de música en cada remate cómico
    a = int(when(c) * SR); b = min(N, a + int(0.7 * SR)); gain[a:b] = 0
    up = min(N - b, int(0.12 * SR)); gain[b:b+up] = np.linspace(0, 1, up)
gain = np.convolve(gain, np.ones(240) / 240, 'same')
amb = 0.11 * mus * gain
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
def puf():   # firma: cambio de disfraz
    d = np.arange(int(.45 * SR)) / SR; ns = np.convolve(rng.standard_normal(len(d)), np.ones(60) / 60, 'same')
    return 2.2 * ns * np.exp(-d * 9) + 0.7 * np.sin(2 * np.pi * np.cumsum(220 * np.exp(-d * 6) + 50) / SR) * np.exp(-d * 10)
def boing(): # firma: aterrizaje gelatinoso de Raro
    d = np.arange(int(.55 * SR)) / SR; f = 180 * (1 + 0.45 * np.sin(2 * np.pi * 11 * d) * np.exp(-d * 4)) + 60 * d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-d * 5.5) * np.minimum(1, d / 0.005)
def click():
    d = np.arange(int(.03 * SR)) / SR; return np.sin(2 * np.pi * 2400 * d) * np.exp(-d * 160)
def chispa():
    y = np.zeros(int(.3 * SR))
    for k in range(5):
        d = np.arange(int(.08 * SR)) / SR; f = 2600 + 1400 * rng.random(); i = int(k * .045 * SR)
        y[i:i+len(d)] += np.sin(2 * np.pi * f * d) * np.exp(-d * 45)
    return y
def blip():
    d = np.arange(int(.08 * SR)) / SR; return np.sin(2 * np.pi * 1320 * d) * np.exp(-d * 40)
def splash():  # chapuzón: ruido filtrado con caída + burbujitas (agregado con hielo-001)
    n = int(.6 * SR); d = np.arange(n) / SR
    x = np.convolve(rng.standard_normal(n), np.ones(18) / 18, 'same') * np.exp(-d * 7) * np.minimum(1, d / 0.01) * 2.0
    for k in range(4):
        dd = np.arange(int(.06 * SR)) / SR; i = int((0.08 + k * 0.07) * SR); f = 500 + 500 * rng.random()
        x[i:i+len(dd)] += 0.5 * np.sin(2 * np.pi * np.cumsum(f * (1 + 3 * dd)) / SR) * np.exp(-dd * 50)
    return x
def gota():    # gotita que cae (blup)
    d = np.arange(int(.12 * SR)) / SR; return np.sin(2 * np.pi * np.cumsum(600 + 2200 * d / .12) / SR) * np.exp(-d * 35)
for c in cues.get('splash', []): place(splash(), when(c), 0.3)
for c in cues.get('gota', []): place(gota(), when(c), 0.18)
if cues.get('whoosh_escenas', True):
    for s in T['scenes'][1:]: place(whoosh(), s['start'] - 0.12, 0.18)
for c in cues.get('pop', []): place(pop(), when(c), 0.22)
for c in cues.get('thud', []): place(thud(), when(c), 0.5)
for c in cues.get('blip', []): place(blip(), when(c), 0.15)
for c in cues.get('puf', []): place(puf(), when(c), 0.35)
for c in cues.get('boing', []): place(boing(), when(c), 0.4)
for c in cues.get('click', []): place(click(), when(c), 0.3)
for c in cues.get('chispa', []): place(chispa(), when(c), 0.12)
for c in cues.get('whoosh', []): place(whoosh(), when(c) - 0.1, 0.25)
env = np.convolve(np.abs(v), np.ones(4800) / 4800, 'same'); duck = 1 - 0.5 * np.clip(env / 0.05, 0, 1)
m = v + (amb + out) * duck; m = m / max(1e-6, np.abs(m).max()) * 0.89
wo = wave.open(os.path.join(D, 'mezcla.wav'), 'wb'); wo.setnchannels(2); wo.setsampwidth(2); wo.setframerate(SR)
wo.writeframes((np.stack([m, m], 1) * 32767).astype(np.int16).tobytes()); wo.close()

lst = os.path.join(D, 'list.txt')
open(lst, 'w').write(''.join(f"file 'scene_{s['n']:02d}.mp4'\n" for s in T['scenes']))
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
run('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(D, '_mudo.mp4'))
tmp = os.path.join(D, f'{VID}.tmp.mp4')
run('-i', os.path.join(D, '_mudo.mp4'), '-i', os.path.join(D, 'mezcla.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-shortest', '-movflags', '+faststart', tmp)
os.replace(tmp, os.path.join(D, f'{VID}.mp4'))
run('-i', os.path.join(D, f'{VID}.mp4'), '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', os.path.join(D, f'{VID}_720.mp4'))
for f in [f'{VID}.mp4', f'{VID}_720.mp4']:
    print(f, round(os.path.getsize(os.path.join(D, f)) / 1e6, 1), 'MB')
