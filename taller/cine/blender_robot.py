# Agrega expresiones al robot (Blender 5.2): Parpadeo, Feliz, MiradaIzq/Der; conserva Angry/Surprised/Sad y las 14 animaciones.
import bpy, bmesh, mathutils
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/home/claude/ext/three/examples/models/gltf/RobotExpressive/RobotExpressive.glb')
ob=bpy.data.objects['Head']; me=ob.data; M=ob.matrix_world; Mi=M.inverted()
black=[i for i,m in enumerate(me.materials) if m.name=='Black'][0]
vb=set(i for poly in me.polygons if poly.material_index==black for i in poly.vertices)
kd=mathutils.kdtree.KDTree(len(vb)); idx=list(vb)
for j,i in enumerate(idx): kd.insert(M@me.vertices[i].co,j)
kd.balance(); par=list(range(len(idx)))
def fd(x):
    while par[x]!=x: par[x]=par[par[x]]; x=par[x]
    return x
for j,i in enumerate(idx):
    for (co,k,d) in kd.find_range(M@me.vertices[i].co,0.0015): par[fd(j)]=fd(k)
pos={i:j for j,i in enumerate(idx)}
for poly in me.polygons:
    if poly.material_index==black:
        vv=[pos[i] for i in poly.vertices]
        for x in vv[1:]: par[fd(x)]=fd(vv[0])
grupos={}
for j,i in enumerate(idx): grupos.setdefault(fd(j),set()).add(i)
islas=list(grupos.values())
info=[]
for vs in islas:
    P=[M@me.vertices[i].co for i in vs]; c=sum(P,mathutils.Vector())/len(P); ext=[max(p[k] for p in P)-min(p[k] for p in P) for k in range(3)]
    info.append((vs,c,ext)); print('isla',len(vs),[round(x,3) for x in c],[round(x,3) for x in ext])
# ojos = islas con extensión parecida en los 3 ejes (esferas); cejas = alargadas
ojos=[x for x in info if max(x[2])/max(1e-6,min(x[2]))<2.2]; ojos=sorted(ojos,key=lambda x:-len(x[0]))[:2]; print([ (round(o[1].x,3),round(o[1].y,3),round(o[1].z,3)) for o in ojos]); print('ojos',[len(o[0]) for o in ojos])
basis=me.shape_keys.key_blocks['Basis']
def clave(nombre,fn):
    k=ob.shape_key_add(name=nombre,from_mix=False)
    for vs,c,ext in ojos:
        for i in vs:
            p=M@basis.data[i].co; q=fn(p,c,ext); k.data[i].co=Mi@q
    return k
# Parpadeo: aplana los ojos en vertical (eje Z del mundo de Blender)
clave('Parpadeo',lambda p,c,e: mathutils.Vector((p.x,p.y,c.z+(p.z-c.z)*0.08)))
# Feliz: ojos en forma de arco (la mitad inferior sube y se aplana)
def feliz(p,c,e):
    dz=p.z-c.z
    return mathutils.Vector((p.x,p.y,c.z+(dz*0.35 if dz<0 else dz*0.75)+e[2]*0.12))
clave('Feliz',feliz)
# Mirada: desplaza los ojos lateralmente
clave('MiraIzq',lambda p,c,e: p+mathutils.Vector((e[0]*0.25,0,0)))
clave('MiraDer',lambda p,c,e: p-mathutils.Vector((e[0]*0.25,0,0)))
import json
# Exporta solo los desplazamientos (glTF: x, z, -y) para inyectarlos al modelo original en Three.js
out={'n':len(me.vertices),'claves':{}}
for nm in ['Parpadeo','Feliz','MiraIzq','MiraDer']:
    kb=me.shape_keys.key_blocks[nm]; d=[]
    for i,v in enumerate(basis.data):
        dv=kb.data[i].co-v.co
        if dv.length>1e-7: d.append([i,round(dv.x,6),round(dv.z,6),round(-dv.y,6)])
    out['claves'][nm]=d
# orden de vértices por material, para mapear a las primitivas glTF
out['mat_por_vert']=[0]*len(me.vertices)
for poly in me.polygons:
    for i in poly.vertices: out['mat_por_vert'][i]=poly.material_index
out['materiales']=[m.name for m in me.materials]
json.dump(out,open('/home/claude/cine/assets/personajes/robot_expresiones.json','w'))
print('json',{k:len(v) for k,v in out['claves'].items()})
