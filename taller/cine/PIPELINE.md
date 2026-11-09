# CINE v2 — pipeline de producción de Shorts (predeterminado desde el 8 nov 2026)

Decisión de Héctor (8 nov 2026): todos los Shorts nuevos se producen con este pipeline.
No volver al motor 2D, al estilo "Raro" ni a imágenes con zoom, salvo que haya una limitación técnica real.

## Estudio (roles → herramienta)
| Rol | Herramienta | Archivo |
|---|---|---|
| Guion / gancho | skills `hook-writer`, `short-form-video-script`, `youtube-shorts` (Social Media Skills) + reglas de GUIA.md | `<video>/guion.md` |
| Voz | Speko → ElevenLabs v3, Mizael `HRUUrQrYM9LfgDbWoMXS`, 1 toma | `voz_orig.wav` → `apretar.py <dir> 0.2 <tempo>` → `voz.wav`, `words.json` |
| Personaje | RobotExpressive (Quaternius, CC0) + expresiones hechas en Blender (`cine/blender_robot.py` → `assets/personajes/robot_expresiones.json`) | `core.js: Bot`, `expresionesRobot()` |
| Escenarios | Three.js r18x + Poly Haven (HDRI, modelos, texturas PBR, CC0) + NASA (Tierra y Luna) | `cine/assets/`, `core.js` |
| Animación | clips del robot con mezcla (`Bot.pose`), parpadeo automático, cara (`Bot.cara`), papel flexible (`PilaFlex`), partículas, humo, escombros | `<video>/shots.js` |
| Fotografía | cámaras por toma (travelling, órbita, picada, contrapicada, macro con DOF), bloom solo en luces (umbral 1.35), grading con viñeta y grano | `core.js: render()` |
| Composición | Remotion 4: capa 3D + subtítulos animados (spring) + audio | `/home/claude/remo/src/short/` |
| Sonido | `cine/mix.py`: música sintetizada por secciones + efectos por evento (`sfx.json`), ducking bajo la voz, −14 LUFS | `<video>/sfx.json` |
| Exportación | FFmpeg (H.264 1080×1920 + versión 720p para el Studio) | — |

## Reglas visuales (MASTER PROMPT de Héctor)
- 12–20 tomas; cambio visual cada 1–3 s; gancho fuerte en los primeros 3 s (acción imposible, nunca título).
- El personaje nunca está quieto; cada toma tiene acción, trayectoria de cámara y transición motivada.
- Nada de texto dentro de la escena salvo cifras clave como gráficos; subtítulos en Remotion.
- Bloom solo en emisivos (focos, ventanas, faros). Papel con albedo ~0.88 (no blanco puro).
- Limpiar efectos (humo, papelitos) al inicio de cada toma: los renders arrancan a mitad del video.
- Caminata sin patinar: 0.64 u/s con `Walking` a vel 1 (correr ≈ 1.0 u/s).

## Pasos para un Short nuevo
1. Guion (≤ 40 palabras para 15 s) siguiendo GUIA.md + hook-writer. Guardar en `<video>/guion.md`.
2. Voz: 1 toma en Speko; transcribir con `word_timestamps`; `words_raw.json`; `apretar.py <dir> 0.2 <tempo>` (tempo ≤ 1.1).
3. `timeline.json` = {duration, words}. Copiar `papel2/shots.js` como plantilla: escenas reutilizables (azotea, escritorio, calle, espacio) y tomas `tNN(t)`.
4. Vista previa: `python3 render.py <video> preview t1 t2 …` → `contact.jpg`; corregir exposición y encuadre.
5. Render 3D: `python3 render.py <video> all 2` (≈5–7 s/cuadro en CPU) → `video_mudo.mp4`.
6. Audio: `sfx.json` con eventos alineados a palabras → `python3 mix.py <video> <id>` → `_mezcla.wav`.
7. Remotion: copiar `video_mudo.mp4`, `_mezcla.wav` y `timeline.json` a `remo/public/<video>/`; registrar composición en `Root.tsx`;
   `npx remotion render src/index.ts <Comp> out/<id>.mp4 --browser-executable=/usr/bin/google-chrome --crf 18`.
8. QA: hoja de contacto de 12 fotogramas + checklist de autoevaluación (abajo). Si falla, corregir y volver a renderizar.

## Autoevaluación obligatoria
¿Movimiento real en todo momento? ¿Personaje natural? ¿Cámara cinematográfica? ¿Profundidad? ¿Calidad consistente (sin quemados)?
¿Variedad de planos? ¿Cada toma acompaña la frase? ¿Parece producción profesional?

## Entorno
- Servidor local: `cd /home/claude/cine && python3 -m http.server 8765 --bind 127.0.0.1` (correr en segundo plano persistente).
- Three.js: clon disperso en `/home/claude/ext/three` (ver `LEEME.md`). Assets: `cine/assets/` (Poly Haven + NASA; volver a descargar con User-Agent propio si faltan).
- Blender 5.2 como módulo: `pip install bpy` con `--proxy $HTTPS_PROXY` y `NO_PROXY=localhost`.
- Remotion: `npm` con proxy configurado (`npm config set proxy/https-proxy $HTTPS_PROXY`, `cafile /root/.ccr/ca-bundle.crt`).
- Skills instaladas en el repo: `.claude/skills/threejs-*`, `.claude/skills/blender-*`.

## Limitaciones conocidas
- Sin GPU: render ~5–7 s por cuadro; GTAO (oclusión ambiental) añade ~50 % y produce artefactos en el papel doblado: apagado.
- Exportar el robot desde Blender rompe sus piezas rígidas: las expresiones se inyectan en tiempo de carga desde JSON.
- El robot no tiene boca (sin sincronía de labios); expresiones: enojo, sorpresa, tristeza, feliz, parpadeo, mirada.
