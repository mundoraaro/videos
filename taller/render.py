"""Renderiza escenas de un video con Chrome headless.

Uso:
  python3 render.py <carpeta> preview 5.8 13.5 ...   -> <carpeta>/prev_<t>.jpg y contact.jpg (hoja de contacto)
  python3 render.py <carpeta> scenes 1 4 ...         -> re-renderiza solo esas escenas
  python3 render.py <carpeta> all                    -> todas las escenas
La carpeta debe tener scene.html (que carga ../engine.js) y timeline.json.
"""
import json, sys, base64, subprocess, os
from playwright.sync_api import sync_playwright

D = os.path.abspath(sys.argv[1]); mode = sys.argv[2]
TL = json.load(open(os.path.join(D, 'timeline.json'))); FPS = 30
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto('file://' + os.path.join(D, 'scene.html'))
    font = pg.evaluate('tl => init(tl)', TL)
    if font != 'Fredoka':
        print('AVISO: no se encontró taller/fuentes/Fredoka-Bold.ttf; se usó Inter como respaldo. Ver IDENTIDAD.md', flush=True)
    if mode == 'preview':
        from PIL import Image
        ts = sys.argv[3:]; ims = []
        for t in ts:
            path = os.path.join(D, f'prev_{t}.jpg')
            open(path, 'wb').write(base64.b64decode(pg.evaluate('t => frame(t)', float(t)).split(',')[1]))
            ims.append(Image.open(path).resize((270, 480)))
        cols = min(5, len(ims)); rows = (len(ims) + cols - 1) // cols
        S = Image.new('RGB', (270 * cols, 480 * rows))
        for i, im in enumerate(ims): S.paste(im, ((i % cols) * 270, (i // cols) * 480))
        S.save(os.path.join(D, 'contact.jpg'), quality=90); print('contact.jpg listo')
    else:
        nums = [s['n'] for s in TL['scenes']] if mode == 'all' else [int(x) for x in sys.argv[3:]]
        for s in TL['scenes']:
            if s['n'] not in nums: continue
            f0, f1 = round(s['start'] * FPS), round(s['end'] * FPS)
            tmp, out = os.path.join(D, f'scene_{s["n"]:02d}.tmp.mp4'), os.path.join(D, f'scene_{s["n"]:02d}.mp4')
            ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
            for f in range(f0, f1):
                ff.stdin.write(base64.b64decode(pg.evaluate('t => frame(t)', f / FPS).split(',')[1]))
            ff.stdin.close()
            if ff.wait() == 0:
                os.replace(tmp, out); print('escena', s['n'], f1 - f0, 'cuadros', flush=True)
            else:
                print('escena', s['n'], 'FALLÓ', flush=True)
    b.close()
