import json,sys,base64
d=json.load(open(sys.argv[1])); n=sys.argv[2]
open(f'{n}.raw','wb').write(base64.b64decode(d['audio_base64']))
print(d['content_type'],d['duration_seconds'],d['url'])
