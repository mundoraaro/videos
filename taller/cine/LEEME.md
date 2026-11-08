# CINE — motor de Shorts animados 3D (Three.js)
- Three.js: `git clone --depth 1 --filter=blob:none --sparse https://github.com/mrdoob/three.js /home/claude/ext/three && cd /home/claude/ext/three && git sparse-checkout set build examples/jsm examples/models/gltf examples/textures/equirectangular`, luego `ln -s /home/claude/ext/three /home/claude/cine/three`.
- Personaje: RobotExpressive (Quaternius, CC0): 14 animaciones + caras (enojo, sorpresa, triste).
- Servir: `cd /home/claude/cine && python3 -m http.server 8765 --bind 127.0.0.1`.
- Vista previa: `python3 render.py papel preview 0.5 2 4`; video: `python3 render.py papel all 2`; audio: `python3 mix.py papel <id>` (sfx.json define música por secciones y efectos por evento).
- Cada video = carpeta con shots.js (tomas), timeline.json (voz con tiempos por palabra), voz.wav, sfx.json.
