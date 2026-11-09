"""python3 render.py <carpeta> preview t1 t2 ...  | python3 render.py <carpeta> all [workers]"""
import json, sys, base64, subprocess, os, math, time
from multiprocessing import Process
D=sys.argv[1]; mode=sys.argv[2]; FPS=30; ROOT='/home/claude/cine'
TL=json.load(open(os.path.join(ROOT,D,'timeline.json')))
ARGS=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def abrir(p):
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('console',lambda m:print('CON',m.text) if 'deprec' not in m.text else None); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(f'http://127.0.0.1:8765/{D}/index.html'+os.environ.get('Q','')); pg.wait_for_function('typeof window.init==="function"',timeout=60000); pg.evaluate('tl=>init(tl)',TL); pg.wait_for_function('window.listo',timeout=300000); return b,pg
def trabajo(segs):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b,pg=abrir(p)
        for (k,f0,f1) in segs:
            out=os.path.join(ROOT,D,f'_seg_{k:03d}.mp4')
            if os.path.exists(out): continue
            ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',out+'.tmp.mp4'],stdin=subprocess.PIPE)
            t0=time.time()
            for f in range(f0,f1): ff.stdin.write(base64.b64decode(pg.evaluate('t=>frame(t)',f/FPS).split(',')[1]))
            ff.stdin.close(); ff.wait(); os.rename(out+'.tmp.mp4',out); print('segmento',k,'listo',round((time.time()-t0)/(f1-f0),2),'s/f',flush=True)
        b.close()
if mode=='preview':
    from playwright.sync_api import sync_playwright
    from PIL import Image
    ts=sys.argv[3:]; ims=[]
    with sync_playwright() as p:
        b,pg=abrir(p)
        for t in ts:
            t0=time.time(); path=os.path.join(ROOT,D,f'prev_{t}.jpg'); open(path,'wb').write(base64.b64decode(pg.evaluate('t=>frame(t)',float(t)).split(',')[1])); print(t,round(time.time()-t0,2)); ims.append(Image.open(path).resize((360,640)))
        b.close()
    cols=min(6,len(ims)); rows=math.ceil(len(ims)/cols); S=Image.new("RGB",(360*cols,640*rows))
    for i,im in enumerate(ims): S.paste(im,((i%cols)*360,(i//cols)*640))
    S.save(os.path.join(ROOT,D,'contact.jpg')); print('contact listo')
else:
    N=int(TL['duration']*FPS); SEG=FPS*3; workers=int(sys.argv[3]) if len(sys.argv)>3 else 2
    segs=[(k,f0,min(N,f0+SEG)) for k,f0 in enumerate(range(0,N,SEG))]
    ps=[Process(target=trabajo,args=(segs[i::workers],)) for i in range(workers)]
    [p.start() for p in ps]; [p.join() for p in ps]
    with open(os.path.join(ROOT,D,'_lista.txt'),'w') as f:
        for k,_,_ in segs: f.write(f"file '_seg_{k:03d}.mp4'\n")
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',os.path.join(ROOT,D,'_lista.txt'),'-c','copy',os.path.join(ROOT,D,'video_mudo.mp4')],check=True)
    print('video_mudo.mp4 listo')
