# Guía de producción — Mundo Raaro

Videos cortos 100% animados para TikTok, YouTube Shorts y Facebook Reels. Datos curiosos, historias y "¿qué pasaría si?". Cada video lo revisa Héctor en el Estudio antes de publicarse.

- Estudio (base de datos): https://claude.ai/artifact/LsmiZWxSLDCBdtJ6BUT9q3 — colecciones `ideas` y `videos` (herramienta ArtifactData).
- Repo: `mundoraaro/videos`. Los videos finales van en `videos/<id>.mp4`; su enlace público es `https://raw.githubusercontent.com/mundoraaro/videos/main/videos/<id>.mp4`.
- Ejemplo completo y aprobado: `taller/ejemplos/pulpo-001/` (le gustó mucho a Héctor).

## Lo que Héctor pidió (reglas fijas)

1. **Voz más viva.** Más energía y emoción que el piloto: frases cortas, exclamaciones, preguntas al público, cambios de tono. Que suene a alguien contándote algo increíble, no leyendo.
2. **Cero momentos muertos.** Siempre hay movimiento: nunca más de 1.2 s sin que algo nuevo aparezca, cambie o reaccione en pantalla. Que la gente no quiera quitarlo.
3. Atractivo y con gancho desde el primer segundo.

## 1. Guion

- Duración de la narración: 65–85 s (TikTok solo paga videos de más de 1 minuto).
- **Gancho**: la primera frase, de 8 palabras o menos, es una afirmación sorprendente. Nada de intro ni saludo.
- Estructura: gancho → "Sí, en serio" o reacción → 3–4 datos numerados (chip "DATO 1 DE 4") → un giro a la mitad ("Pero espérate, que se pone más raro") → cierre que regresa a la frase del gancho para que el video se repita → "Esto es Mundo Raaaro".
- Oraciones cortas, lenguaje mexicano natural ("oye", "neta", "imagínate") sin exagerar.
- **Verificación obligatoria**: cada dato con WebSearch y abriendo la fuente con WebFetch. Si un dato no se puede confirmar, se quita. Guarda las fuentes (nombre del medio y del artículo) en el campo `fuentes`.
- Prohibido: personajes con derechos (Disney, Marvel, Pokémon…), personas reales dibujadas, música comercial, temas médicos o políticos, desinformación. Historias delicadas (guerras, tragedias) se cuentan con respeto, sin morbo.

## 2. Voz (Speko → ElevenLabs)

- `audio_synthesize` con `model: "eleven_v3_conversational"`, `constraints.allowedProviders.tts: ["elevenlabs"]`, `intent: {"language":"es"}`.
  - **Mizael** (principal; datos y "qué pasaría si"): voice `HRUUrQrYM9LfgDbWoMXS`.
  - **Carito** (historias y series con otro tono): voice `NNuHMQa2acKEytgZ6uvw`.
- Etiquetas de emoción dentro del texto, al menos una cada dos frases: `[excited]`, `[curious]`, `[surprised]`, `[whispers]`, `[laughs softly]`. Usa "¡...!" y "¿...?" para dar energía. Escribe el cierre como "Esto es Mundo Raaaro."
- Genera **2 tomas** y quédate con la que dure menos (suele ser la más enérgica), siempre que la transcripción confirme que no leyó las etiquetas.
- El resultado es grande y se guarda en un archivo JSON: decodifica `audio_base64` con Python a `voz.wav`. Su `url` firmada dura 15 minutos.
- `audio_transcribe` con esa url, `language: "es-MX"`, `word_timestamps: true` → guarda `words_raw.json` como `[[texto, inicio_ms, fin_ms], ...]`. Corrige la ortografía con tu guion (acentos, "Sí,"), y la última palabra como "Raaaro".

## 3. Animación

Trabaja en `taller/trabajo/<id>/` (no se sube a git). Copia `ejemplos/pulpo-001/scene.html` como base: carga `../../engine.js`, que ya trae fondo submarino animado, cámara (punch-in por escena y deriva lenta), captions palabra por palabra, chips, el personaje `octopus()`, `heart()`, `label()` y `logoEye()`.

- `escenas.json`: `{"inicios": [índice de palabra donde empieza cada escena], "tempo": 1.10, "pausa": 0.22}`. Una escena por idea o dato, de 4 a 10 s.
- `python3 ../../timeline.py .` → `voz_final.wav` y `timeline.json`. Revisa los avisos de pausas largas.
- En `scene.html` escribe una función por escena `S1..Sn(t, sc)` y define `SCENES`, `CHIPS`, `SHAKES` (palabras de impacto) y `DARK_SCENES` (para "lo más raro").
- **Regla de cero momentos muertos**: antes de dibujar, haz una lista de eventos visuales ligados a palabras clave (`pop(t, at(i))`, `prog(t, at(i), d)`). Cada palabra importante dispara algo: un objeto que entra, un número que crece, el personaje que reacciona, un icono, un cambio de color. Nunca dejes un hueco de más de 1.2 s sin evento. Los personajes siempre se mueven (respiran, parpadean, ondulan) y la cámara nunca está quieta: agrega paneos o zooms propios dentro de cada escena.
- Estilo: formas simples dibujadas en canvas 2D, contorno `#16122E` de 7 a 10 px, colores de marca (fondo índigo `#231B52`→`#0D0A24`, lima `#D7FF3D`, coral `#FF6A4D`, blanco `#F5F3FF`), tipografía Inter 900. Para otros animales u objetos, crea tus propios dibujos con el mismo estilo que el pulpo.
- Zonas seguras del lienzo 1080×1920: arriba de y=180 lo tapan las pestañas de la app; abajo de y=1500 y a la derecha de x=940, los botones. Chips en y=215, títulos de escena entre y=300 y y=560, captions en y=1330 (ya lo hace el motor).
- `python3 ../../render.py . preview <8 a 10 tiempos con más cosas en pantalla>` y mira `contact.jpg`. Corrige textos encimados o cortados, y huecos sin movimiento. Una sola ronda de correcciones.
- `python3 ../../render.py . all` (unos 2 minutos).
- `cues.json` con efectos en índices de palabra: `pop` (algo aparece), `thud` (impacto), `blip` (etiquetas). Luego `python3 ../../mix.py . <id>` → `<id>.mp4` (para publicar) y `<id>_720.mp4` (para el Estudio).
- Mira 2 cuadros del video final con ffmpeg antes de entregar.

## 4. Entrega

1. Copia `<id>.mp4` a `videos/<id>.mp4` en el repo, haz commit con autor `Mundo Raaro <mundoraaro@gmail.com>` y push a `main`.
2. Sube `<id>_720.mp4` al Estudio: Artifact `publish` con `url` del Estudio, `file_path` del archivo y `asset: true` → anota el id.
3. ArtifactData `set` en `videos/<id>` con: `titulo`, `formato` (dato | quepasaria | historia | serie), `duracion` ("1:15"), `voz`, `gancho`, `caption` (máx. 150 caracteres, termina con una pregunta para comentarios, máximo 1 emoji), `hashtags` (5, incluye #mundoraaro), `guion`, `fuentes`, `estado: "en_revision"`, `assetId`, `videoUrl` (enlace raw), `ideaId`, `creado` (ISO con -06:00).
4. En la idea: `update` con `estado: "producida"` y `videoId`.

Ids de video: tema corto en minúsculas más número, por ejemplo `venus-002`. Si es una nueva versión por cambios, agrega `-v2`.
