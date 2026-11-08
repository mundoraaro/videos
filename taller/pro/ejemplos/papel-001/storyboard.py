ACENTO='#FFB547'
CLAVES=['Luna','luna','matemáticas','duplica','cuaderno','espacio','universo','doce','Gallivan','siete','veinte']
HOOK={'ya':True,'kick':'EXPERIMENTO MENTAL','l':['Una hoja.','42 dobleces.','La Luna.'],'hi':2,'luna':True,'size':120}
SB=[
 ('Si','titulo',{**HOOK,'lb':[None,None,'b']},{'b':'llegas'},{}),
 ('No es','titulo',{'kick':'NO ES TRUCO','l':['Son','matemáticas.'],'hi':1},{},{}),
 ('Una hoja mide','cifra',{'kick':'GROSOR DE UNA HOJA','de':0,'a':0.1,'dec':1,'suf':' mm','unidad':'UNA DÉCIMA DE MILÍMETRO','dur':1.0},{},{}),
 ('Y cada','doblar',{'n':4},{'b':'cada','c':'doblas','d':'grosor','e':'duplica'},{}),
 ('Con siete','hito',{'n':7,'valor':'1.3','unidad':'centímetros','ref':'cuaderno','alt':0.12},{},{}),
 ('Con veinte','hito',{'n':20,'valor':'105','unidad':'metros','ref':'edificio','alt':0.95},{},{}),
 ('Más alta','titulo',{'kick':'MÁS ALTA QUE','l':['Un edificio','de 30 pisos.'],'hi':1},{},{}),
 ('Con 30','hito',{'n':30,'valor':'107','unidad':'kilómetros','ref':'espacio','alt':0.9},{},{}),
 ('Y en el','cifra',{'kick':'DOBLEZ 42','de':0,'a':440000,'unidad':'KILÓMETROS','dur':2.6,'size':200},{},{}),
 ('Más que','hito',{'n':42,'valor':'440,000','unidad':'km · más lejos que la Luna','ref':'luna','alt':0.97,'size':112},{},{}),
 ('¿El','titulo',{'kick':'EL PROBLEMA','l':['Nadie lo ha','logrado.'],'hi':1},{},{}),
 ('Por años','mito',{'kick':'EL LÍMITE «IMPOSIBLE»','viejo':'7','nota':'dobleces, decían'},{'b':'siete','d':'límite'},{}),
 ('Hasta','ficha',{'kick':'RÉCORD · 2002','nombre':'Britney Gallivan','lineas':[['12 dobleces','b'],['Estudiante de preparatoria','c']]},{'b':'12','c':'Gallivan'},{}),
 ('usando','rollo',{'kick':'EL PAPEL QUE USÓ','valor':'+1.2 km','sub':'Un solo pedazo, sin cortes'},{'b':'kilómetro'},{}),
 ('Porque cada','titulo',{'kick':'¿POR QUÉ ES TAN DIFÍCIL?','l':['Cada doblez pide','mucho más papel.'],'hi':1,'size':100},{},{}),
 ('¿Y si','titulo',{'kick':'¿Y SI PUDIERAS SEGUIR?','l':['Sigue','doblando…'],'hi':1},{},{}),
 ('Con 103','universo',{'n':103,'l':'Más grande que','sub':'todo el universo observable'},{'b':'universo'},{}),
 ('Todo, con','titulo',{'kick':'TODO ESO','l':['Con una','sola hoja.'],'hi':1,'hoja':True},{},{}),
 ('¿Hasta','pregunta',{'l':['¿Hasta cuántos','llegarías tú?'],'hi':1},{},{}),
 ('Porque si','titulo',{**HOOK},{},{}),
]
