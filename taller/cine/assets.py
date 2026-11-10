"""Descarga los assets de CINE v2 (Poly Haven CC0 + NASA dominio público). python3 assets.py <destino>"""
import json, os, sys, urllib.request, shutil
D=sys.argv[1]; UA={'User-Agent':'MundoRaaroStudio/1.0'}; os.makedirs(D,exist_ok=True)
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60))
def dl(u,p):
    p=os.path.join(D,p)
    if os.path.exists(p): return
    os.makedirs(os.path.dirname(p),exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=300) as r, open(p,'wb') as f: f.write(r.read())
HDRI=['aristea_wreck','rooftop_night','modern_buildings_night','shanghai_bund','art_studio','blue_grotto','kloofendal_48d_partly_cloudy_puresky','industrial_sunset_02_puresky','kloofendal_overcast_puresky']
MOD=['desk_lamp_arm_01','alarm_clock_01','book_encyclopedia_set_01','potted_plant_02','street_lamp_01','binder_notebook','island_tree_01','moon_rock_01','coast_rocks_01','boulder_01']
TEX=['kitchen_wood','anti_slip_concrete','asphalt_02','rectangular_facade_tiles','brushed_concrete','coast_sand_01','dark_rock','burned_ground_01','aerial_beach_01']
for h in HDRI:
    f=get(f'https://api.polyhaven.com/files/{h}'); dl(f['hdri']['4k']['hdr']['url'],f'hdri/{h}_4k.hdr')
for m in MOD:
    f=get(f'https://api.polyhaven.com/files/{m}'); g=f['gltf']['1k']['gltf']; dl(g['url'],f'models/{m}/{m}.gltf')
    for rel,inc in g.get('include',{}).items(): dl(inc['url'],f'models/{m}/{rel}')
for t in TEX:
    f=get(f'https://api.polyhaven.com/files/{t}')
    for k,kk in [('Diffuse','diff'),('nor_gl','nor'),('Rough','rough'),('arm','arm')]:
        if k in f and '2k' in f[k]: dl(f[k]['2k']['jpg']['url'],f'tex/{t}/{kk}.jpg')
# NASA: Luna LRO (SVS CGI Moon Kit) + Tierra (texturas de three.js)
os.makedirs(os.path.join(D,'nasa'),exist_ok=True)
if not os.path.exists(os.path.join(D,'nasa/luna.jpg')):
    dl('https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_4k.tif','nasa/luna.tif'); dl('https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_4.tif','nasa/luna_disp.tif')
    from PIL import Image; import numpy as np
    Image.open(os.path.join(D,'nasa/luna.tif')).convert('RGB').resize((4096,2048)).save(os.path.join(D,'nasa/luna.jpg'),quality=92)
    d=np.array(Image.open(os.path.join(D,'nasa/luna_disp.tif'))).astype(np.float32); d=(d-d.min())/(d.max()-d.min()); Image.fromarray((d*255).astype('uint8')).save(os.path.join(D,'nasa/luna_disp.png'))
P='/home/claude/ext/three/examples/textures/planets'
if not os.path.exists(os.path.join(D,'nasa/tierra.jpg')):
    from PIL import Image; import numpy as np
    shutil.copy(f'{P}/earth_day_4096.jpg',os.path.join(D,'nasa/tierra.jpg')); shutil.copy(f'{P}/earth_night_4096.jpg',os.path.join(D,'nasa/luces.jpg'))
    a=np.array(Image.open(f'{P}/earth_bump_roughness_clouds_4096.jpg').convert('RGB')); Image.fromarray(a[...,2]).save(os.path.join(D,'nasa/nubes.png')); Image.fromarray(a[...,1]).save(os.path.join(D,'nasa/tierra_rough.png'))
print('assets listos en',D)
