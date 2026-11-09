#!/usr/bin/env bash
# Prepara el entorno CINE v2 en una sesión nueva (≈5 min). Uso: bash taller/cine/setup.sh  (desde la raíz del repo)
set -e
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; CINE="$REPO/taller/cine"; EXT=/home/claude/ext
mkdir -p "$EXT"
# 1) Three.js (clon disperso con modelos y texturas de ejemplo)
if [ ! -d "$EXT/three/build" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/mrdoob/three.js "$EXT/three"
  (cd "$EXT/three" && git sparse-checkout set build examples/jsm examples/models/gltf examples/textures/equirectangular examples/textures/planets)
fi
ln -sfn "$EXT/three" "$CINE/three"
# 2) Assets Poly Haven + NASA
python3 "$CINE/assets.py" "$EXT/assets"
ln -sfn "$EXT/assets" "$CINE/assets"
mkdir -p "$EXT/assets/personajes" && cp "$CINE/robot_expresiones.json" "$EXT/assets/personajes/"
# 3) Ruta fija que usan render.py y los scripts
ln -sfn "$CINE" /home/claude/cine
# 4) Remotion (npm por el proxy)
export NO_PROXY=localhost,127.0.0.1 no_proxy=localhost,127.0.0.1
npm config set proxy "$HTTPS_PROXY" >/dev/null; npm config set https-proxy "$HTTPS_PROXY" >/dev/null; npm config set cafile /root/.ccr/ca-bundle.crt >/dev/null
(cd "$CINE/remotion" && [ -d node_modules ] || npm install --no-audit --no-fund >/dev/null)
echo "CINE listo. Ahora arranca el servidor en segundo plano: cd /home/claude/cine && python3 -m http.server 8765 --bind 127.0.0.1"
