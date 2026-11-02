# Guía de producción — Mundo Raaro

Videos cortos 100% animados para TikTok, YouTube Shorts y Facebook Reels. Datos curiosos, historias y "¿qué pasaría si?". Cada video lo revisa Héctor en el Estudio antes de publicarse.

- Estudio (base de datos): https://claude.ai/artifact/LsmiZWxSLDCBdtJ6BUT9q3 — colecciones `ideas` y `videos` (herramienta ArtifactData).
- Repo: `mundoraaro/videos`. Los videos finales van en `videos/<id>.mp4`; su enlace público es `https://raw.githubusercontent.com/mundoraaro/videos/main/videos/<id>.mp4`.
- Ejemplo completo y aprobado: `taller/ejemplos/pulpo-001/` (le gustó mucho a Héctor).

## Lo que Héctor pidió (reglas fijas)

1. **Voz más viva.** Más energía y emoción que el piloto: frases cortas, exclamaciones, preguntas al público, cambios de tono. Que suene a alguien contándote algo increíble, no leyendo.
2. **Cero momentos muertos.** Siempre hay movimiento: nunca más de 1.2 s sin que algo nuevo aparezca, cambie o reaccione en pantalla. Que la gente no quiera quitarlo.
3. Atractivo y con gancho desde el primer segundo.

## Meta: monetización (todo se decide por esto)

- TikTok (Programa de Recompensas, México): 10,000 seguidores + 100,000 vistas en 30 días, y solo pagan videos de más de 1 minuto → todos los videos duran 62–72 s (decisión de Héctor: desde ya, para que los que peguen cuenten para monetizar). La retención se logra con ritmo, no acortando.
- YouTube Shorts: 1,000 suscriptores + 10 M vistas de Shorts en 90 días (20 M para quien solicite desde el 1 de febrero de 2027).
- Facebook Estrellas: 500 seguidores.
- Lo que más empuja: retención (que lo vean completo y lo repitan), comentarios, compartidos y constancia (2 videos diarios, 12:00 y 18:00).

## Retención (lo más importante, pedido por Héctor)

Meta mínima: que la gente vea al menos la mitad del video. El piloto del pulpo retuvo solo ~4 s. Diagnóstico: el primer cuadro salía casi vacío (el pulpo aparecía "creciendo" desde cero), el dato visual llegaba hasta el segundo 1.6, la narración era lenta, con pausas largas y relleno ("Sí, en serio"), y en 75 s tenía pocos reenganches. Reglas obligatorias:

- **Duración 62–72 s** (más de 1 minuto para monetizar en TikTok, sin pasarse). Para que se sostenga: cada 15–20 s llega un dato o giro nuevo que reengancha ("pero eso no es lo más raro"), y nunca hay un tramo explicativo largo.
- **El cuadro 0 ya es el gancho:** el personaje, el objeto y un texto grande en pantalla desde el primer cuadro. Nada aparece "creciendo desde cero" al inicio, ni fundidos, ni logo, ni fondo vacío.
- **La primera frase dice lo más impactante en menos de 2 s.** Nada de contexto, saludo ni relleno ("Sí, en serio", "Oye, ¿sabías que…?").
- **Ritmo rápido:** `tempo` 1.15–1.2 y `pausa` 0.12 en escenas.json. La voz no se detiene más de 0.3 s.
- **Un cambio de toma cada 1.5–2.5 s** (cambio de plano, zoom fuerte, objeto nuevo o corte), además de los eventos por palabra. Escenas de 2 a 4 s, nunca de 8 a 10.
- **Bucle abierto en los primeros 3 s** que se cierra hasta el final ("y lo tercero es lo más raro").
- **Barra de progreso** delgada arriba (ya la dibuja el motor): ayuda a que la gente aguante hasta el final.
- **Sin final largo:** el cierre de marca dura máximo 1.5 s y conecta con la primera frase para que el video se repita.
- Antes de renderizar, revisa la hoja de contacto de los primeros 3 s (cuadros en 0.0, 0.5, 1.0, 2.0 y 3.0 s): en todos debe haber algo grande y claro en pantalla.

## Tono: curioso y cómico (pedido por Héctor)

- El narrador es un amigo que te cuenta algo increíble y exagera con gracia. Un chiste o remate cada 10–15 s, sin tapar el dato.
- Recursos: comparaciones absurdas con la vida diaria mexicana ("duró menos que tu fila en el banco"), reacciones exageradas del personaje (ojos que se salen, sudor, cara de "¿neta?"), pausa cómica antes del remate, efectos de gag (boing, rayón de disco, grillos; sintetízalos en mix.py, nunca audio con derechos).
- **El Ojo** del logo es co-presentador recurrente: aparece en una esquina reaccionando a los datos (se sorprende, se ríe, se asusta). Da identidad de marca y hace cada video único.
- **Cero cringe (regla de Héctor, obligatoria).** El humor sale del dato mismo, no de chistes metidos a la fuerza. Suena como un amigo de 20 y tantos platicando, no como locutor de radio ni como adulto intentando sonar joven.
  - Prohibido: "¡Hola, amigos!", "¡No vas a creer esto!", "¡Wow!", "¡Increíble!", "chavos", "bro", "literal" de relleno, memes viejos o forzados, risas grabadas, repetir el mismo chiste, explicar el chiste, exclamaciones en cada frase y más de una etiqueta [laughs] por video.
  - Sí: ironía seca, remates cortos de 3 a 8 palabras, comparaciones cotidianas inesperadas y dejar que la imagen haga el chiste (el Ojo reaccionando vale más que una frase).
  - Prueba antes de grabar: lee el guion en voz alta. Si una línea te daría pena decírsela a un amigo en persona, quítala. Máximo un remate cada 10–15 s; si dudas, menos humor y más dato.
- El humor nunca cambia el dato ni se burla de personas, grupos o víctimas. En temas trágicos (guerras, desastres, muertes) el tono es respetuoso: humor solo en lo absurdo de la situación, o nada.

## Estrategia para crecer

- Gancho en el primer 1.5 s con imagen y texto en pantalla; nunca empieces con contexto.
- Bucles abiertos: "y el dato 4 es el más raro", "quédate al final". El cierre conecta con el inicio para que el video se repita.
- Series por partes cuando un tema dé para más: "Parte 2 en mi perfil". Las series hacen que la gente siga la cuenta.
- Cierra con una pregunta que provoque comentarios ("¿tú qué harías?", "¿cuál te voló la cabeza?") en voz y en el texto de la publicación.
- Títulos de YouTube con palabras que la gente busca ("datos curiosos", "qué pasaría si", el animal o lugar).
- Temas que mejor funcionan en este nicho: animales extremos, espacio, cuerpo humano (sin consejos médicos), historia rara, México curioso, "qué pasaría si".
- Mezcla semanal: la mitad del formato que más retiene según los datos, un tercio en prueba y el resto series.

## Aprendizajes de los datos

(Lo actualiza la revisión semanal. Úsalo para decidir guion, duración y formato.)
- Aún no hay datos suficientes.

## 1. Guion

- Duración de la narración: 62–72 s (ver Retención).
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

- `escenas.json`: `{"inicios": [índice de palabra donde empieza cada escena], "tempo": 1.15, "pausa": 0.12}`. Escenas de 2 a 4 s; un dato puede ocupar varias escenas cortas.
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
