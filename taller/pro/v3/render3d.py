"""Render de videos largos 1080x1920 (vertical).
python3 render_largo.py <carpeta> preview t1 t2 ...   -> prev_<t>.jpg + contact.jpg
python3 render_largo.py <carpeta> all [workers]       -> video_mudo.mp4
"""
import json, sys, base64, subprocess, os, math
from multiprocessing import Process
D=os.path.abspath(sys.argv[1]); mode=sys.argv[2]; FPS=30
TL=json.load(open(os.path.join(D,'timeline.json')))
def abrir(p):
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.goto('file://'+os.path.join(D,'scene.html')); pg.evaluate('tl=>init(tl)',TL); return b,pg
def trabajo(segs):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b,pg=abrir(p)
        for (k,f0,f1) in segs:
            out=os.path.join(D,f'_seg_{k:03d}.mp4')
            if os.path.exists(out): continue
            ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',out+'.tmp.mp4'],stdin=subprocess.PIPE)
            for f in range(f0,f1):
                ff.stdin.write(base64.b64decode(pg.evaluate('t=>frame(t)',f/FPS).split(',')[1]))
            ff.stdin.close(); ff.wait(); os.rename(out+'.tmp.mp4',out); print('segmento',k,'listo',flush=True)
        b.close()
if mode=='preview':
    from playwright.sync_api import sync_playwright
    from PIL import Image
    ts=sys.argv[3:]; ims=[]
    with sync_playwright() as p:
        b,pg=abrir(p)
        for t in ts:
            path=os.path.join(D,f'prev_{t}.jpg'); open(path,'wb').write(base64.b64decode(pg.evaluate('t=>frame(t)',float(t)).split(',')[1])); ims.append(Image.open(path).resize((270,480)))
        b.close()
    cols=min(6,len(ims)); rows=math.ceil(len(ims)/cols); S=Image.new("RGB",(270*cols,480*rows))
    for i,im in enumerate(ims): S.paste(im,((i%cols)*270,(i//cols)*480))
    S.save(os.path.join(D,'contact.jpg')); print('contact.jpg listo')
else:
    N=int(TL['duration']*FPS); SEG=FPS*20; workers=int(sys.argv[3]) if len(sys.argv)>3 else 2
    segs=[(k,f0,min(N,f0+SEG)) for k,f0 in enumerate(range(0,N,SEG))]
    ps=[Process(target=trabajo,args=(segs[i::workers],)) for i in range(workers)]
    [p.start() for p in ps]; [p.join() for p in ps]
    with open(os.path.join(D,'_lista.txt'),'w') as f:
        for k,_,_ in segs: f.write(f"file '_seg_{k:03d}.mp4'\n")
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',os.path.join(D,'_lista.txt'),'-c','copy',os.path.join(D,'video_mudo.mp4')],check=True)
    print('video_mudo.mp4 listo')
