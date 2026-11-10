# Guía de producción — Mundo Raaro

Videos cortos 100% animados para TikTok, YouTube Shorts y Facebook Reels. Datos curiosos, historias y "¿qué pasaría si?". Cada video lo revisa el **agente revisor** (`taller/revisor/REVISOR.md`), muy estricto, antes de publicarse; Héctor ya no aprueba. Produce pensando en pasar ese filtro: gancho que le hable al espectador, Raro en acción desde el cuadro 0, cero fallas.

- Estudio (base de datos): https://claude.ai/artifact/LsmiZWxSLDCBdtJ6BUT9q3 — colecciones `ideas` y `videos` (herramienta ArtifactData).
- Repo: `mundoraaro/videos`. Los videos finales van en `videos/<id>.mp4`; su enlace público es `https://raw.githubusercontent.com/mundoraaro/videos/main/videos/<id>.mp4`.
## ⚠️ SISTEMA DE PRODUCCIÓN VIGENTE: estilo Raro 2D (decisión de Héctor, 10 nov 2026)

Héctor regresó al diseño anterior porque "me empezó a funcionar bien": **personaje Raro disfrazado, motor 2D (`engine.js` + `raro.js`), fondos de dulce, captions Fredoka con palabra clave en lima**, todo según `IDENTIDAD.md` y la sección "3. Animación" de esta guía (base: `ejemplos/raro-demo/scene.html`).
- **CINE v2 (robot 3D) queda en pausa**: no lo uses salvo que Héctor lo pida para un video concreto. Su manual sigue en `taller/cine/PIPELINE.md`.
- **Skills por etapa** (cárgalas con la herramienta Skill antes de cada paso):
  - Ideas: `social-media-skills:idea-generation-and-ideation`, `trend-jacking`, `viral-reverse-engineering`. **Variedad obligatoria (pedido de Héctor):** mezcla categorías — animales, cuerpo humano, historia, tecnología, México, comida, ingeniería y récords, naturaleza y clima, espacio. Máximo 1 de cada 4 ideas puede ser de espacio, y nunca dos ideas seguidas de la misma categoría.
  - Guion y gancho: `hook-writer` (5–10 ganchos con mecanismos distintos, elige 1), `short-form-video-script`, `tiktok-script`, `youtube-shorts`, `storytelling-and-narrative`.
  - Voz: `ai-voiceover` (escribir para el oído; Mizael por Speko). Audio: `ai-music-and-sound` (solo música original/sintetizada, nunca canciones con derechos).
  - Publicación: `caption-writer`, `hashtag-strategy`, `youtube-publishing-and-metadata`, `platform-specs-and-validation` (revisar formato antes de entregar).
- Requisitos de cada video para poder monetizar (TikTok Recompensas, YouTube Shorts, Facebook): **62–72 s**, 1080×1920, 30 fps, sin marcas de agua de otras apps, **contenido original** (guion, narración y animación propios; cada video cambia disfraz, fondos, tomas y acciones), etiqueta de contenido generado con IA en TikTok (`isAigc: true`), música sin derechos de terceros, datos verificados con fuente, nada engañoso en el gancho.
- **Meta de Héctor: siempre 2 días próximos completos programados** (todos los horarios de mañana y pasado mañana ocupados). La producción corre 6 veces al día y solo produce cuando falta para cubrir esa meta.
- **Ritmo de publicación: 3 videos diarios** (lun–sáb 10:00 · 12:00 · 16:00; domingo 10:00 · 16:00 · 18:00, hora de Monterrey/CDMX), elegidos con los mejores horarios de Metricool por red.

## Lo que Héctor pidió (reglas fijas)

1. **Voz más viva.** Más energía y emoción que el piloto: frases cortas, exclamaciones, preguntas al público, cambios de tono. Que suene a alguien contándote algo increíble, no leyendo.
2. **Cero momentos muertos.** Siempre hay movimiento: nunca más de 1.2 s sin que algo nuevo aparezca, cambie o reaccione en pantalla. Que la gente no quiera quitarlo.
3. Atractivo y con gancho desde el primer segundo.

## Meta: monetización (todo se decide por esto)

- TikTok (Programa de Recompensas, México): 10,000 seguidores + 100,000 vistas en 30 días, y solo pagan videos de más de 1 minuto → todos los videos duran 62–72 s (decisión de Héctor: desde ya, para que los que peguen cuenten para monetizar). La retención se logra con ritmo, no acortando.
- YouTube Shorts: 1,000 suscriptores + 10 M vistas de Shorts en 90 días (20 M para quien solicite desde el 1 de febrero de 2027).
- Facebook Estrellas: 500 seguidores.
- Lo que más empuja: retención (que lo vean completo y lo repitan), comentarios, compartidos y constancia (3 videos diarios; horarios arriba).

## Retención (lo más importante, pedido por Héctor)

Meta mínima: que la gente vea al menos la mitad del video. El piloto del pulpo retuvo solo ~4 s. Diagnóstico: el primer cuadro salía casi vacío (el pulpo aparecía "creciendo" desde cero), el dato visual llegaba hasta el segundo 1.6, la narración era lenta, con pausas largas y relleno ("Sí, en serio"), y en 75 s tenía pocos reenganches. Reglas obligatorias:

- **Duración 62–72 s** (más de 1 minuto para monetizar en TikTok, sin pasarse). Para que se sostenga: cada 15–20 s llega un giro que cambia lo que el espectador creía (ver "Cómo enganchar sin anunciarlo"), y nunca hay un tramo explicativo largo.
- **El cuadro 0 ya es el gancho:** Raro ya disfrazado en plena situación, con el objeto o el letrero del dato desde el primer cuadro. Nada aparece "creciendo desde cero" al inicio, ni fundidos, ni logo, ni fondo vacío.
- **La primera frase dice lo más impactante en menos de 2 s.** Nada de contexto, saludo ni relleno ("Sí, en serio", "Oye, ¿sabías que…?").
- **Ritmo rápido:** `tempo` 1.15–1.2 y `pausa` 0.12 en escenas.json. La voz no se detiene más de 0.3 s.
- **Un cambio de toma cada 1.5–2.5 s** (cambio de plano, zoom fuerte, objeto nuevo o corte), además de los eventos por palabra. Escenas de 2 a 4 s, nunca de 8 a 10.
- **Pregunta abierta en los primeros 3 s**, sembrada por la imagen y la primera frase (no anunciada): el espectador se queda porque quiere saber por qué. Se responde por completo hasta el final.
- **Barra de progreso** delgada arriba (ya la dibuja el motor): ayuda a que la gente aguante hasta el final.
- **Sin final largo:** el cierre dura máximo 1.5 s: gesto cómico de Raro que conecta con el primer cuadro para que el video se repita.
- Antes de renderizar, revisa la hoja de contacto de los primeros 3 s (cuadros en 0.0, 0.5, 1.0, 2.0 y 3.0 s): en todos debe haber algo grande y claro en pantalla.

## Tono: curioso y cómico (pedido por Héctor)

- El narrador es un amigo que te cuenta algo increíble y exagera con gracia. Un chiste o remate cada 10–15 s, sin tapar el dato.
- Recursos: comparaciones absurdas con la vida diaria mexicana ("duró menos que tu fila en el banco"), reacciones exageradas de Raro (ojos al doble, sudor, cara de "¿neta?"), pausa cómica antes del remate, efectos de gag (boing, rayón de disco, grillos; sintetízalos en mix.py, nunca audio con derechos).
- **Raro** es el protagonista de todos los videos: vive el dato disfrazado y reacciona a todo (ver `IDENTIDAD.md`). El Ojo del logo ya no aparece en los videos.
- **Cero cringe (regla de Héctor, obligatoria).** El humor sale del dato mismo, no de chistes metidos a la fuerza. Suena como un amigo de 20 y tantos platicando, no como locutor de radio ni como adulto intentando sonar joven.
  - Prohibido: "¡Hola, amigos!", "¡No vas a creer esto!", "¡Wow!", "¡Increíble!", "chavos", "bro", "literal" de relleno, memes viejos o forzados, risas grabadas, repetir el mismo chiste, explicar el chiste, exclamaciones en cada frase y más de una etiqueta [laughs] por video.
  - Sí: ironía seca, remates cortos de 3 a 8 palabras, comparaciones cotidianas inesperadas y dejar que la imagen haga el chiste (Raro reaccionando vale más que una frase).
  - Prueba antes de grabar: lee el guion en voz alta. Si una línea te daría pena decírsela a un amigo en persona, quítala. Máximo un remate cada 10–15 s; si dudas, menos humor y más dato.
- El humor nunca cambia el dato ni se burla de personas, grupos o víctimas. En temas trágicos (guerras, desastres, muertes) el tono es respetuoso: humor solo en lo absurdo de la situación, o nada.

## Cómo enganchar sin anunciarlo (decisión de Héctor, 2 nov 2026)

Prohibido anunciar listas o cuentas: nada de "DATO 1 DE 4", "el cuarto es el mejor", "quédate al final", "espera al final", "el último te va a volar la cabeza". Suena a fórmula y la gente lo detecta. La retención sale de la historia misma:

1. **Gancho = imagen + frase.** En el cuadro 0, Raro ya está metido en la situación absurda (con un letrero que la resume para quien ve sin sonido) y la primera frase afirma algo que provoca un "¿por qué?". La pregunta se la hace el espectador solo; no la decimos por él.
2. **Cadena de consecuencias.** Cada frase responde a la anterior y abre algo nuevo. Conectores naturales: "y por eso…", "o sea que…", "el problema es que…", "y aquí viene lo feo…", "¿y para qué quiere tres?". Nunca "dato número dos".
3. **Escalada.** Cada giro es peor, más raro o más cercano a la vida del espectador que el anterior. Raro reacciona cada vez más exagerado.
4. **Revelación fuerte cerca del final (75–90 %)**, sin anunciarla: es la respuesta completa a la pregunta del gancho o el giro que le cambia el sentido.
5. **Loop.** La última frase desemboca en la primera ("…y por eso nadar le cuesta un corazón." → "Si fueras pulpo, nadar te apagaría el corazón."), y el último cuadro se parece al primero (misma posición de Raro y mismo fondo). Nada de pantalla final con logo.

Ejemplo (pulpo). Antes: "El pulpo tiene tres corazones… DATO 1 DE 4". Ahora: "Si fueras pulpo, nadar te apagaría el corazón. [Raro pulpo nadando, un corazón se apaga] Tienes tres, y uno se detiene cada vez que nadas. O sea que nadar te cansa muchísimo… por eso los pulpos prefieren caminar. Sí, caminan. Y tu sangre sería azul…"

## Fórmula viral (investigación, nov 2026)

Lo que más pesa en TikTok, Shorts y Reels, y cómo lo aplicamos:
- **Que lo repitan (loop) y lo vean completo.** Hoy es la señal número uno, por encima de los seguidores. Por eso es obligatorio el loop de frase e imagen.
- **Los primeros 3 s deciden todo:** si menos del ~65 % pasa del segundo 3, el video se queda en unos cientos de vistas. Abrir con intro o logo pierde a la mayoría. Cuadro 0 = gancho, siempre.
- **Cambio visual cada ~2.5 s como máximo** (toma, zoom, objeto nuevo), con texto en pantalla porque muchos ven sin sonido.
- **Compartidos y comentarios** pesan mucho. Los temas que más se comparten son los que el espectador siente que "le pasan a él" (formato "si fueras…", "esto te pasaría si…") y los que uno quiere mandarle a alguien. Escoge ideas con ese ángulo y cierra el caption con una pregunta fácil de contestar.
- **Series por partes** hacen que vean el siguiente y sigan la cuenta.
- **Videos de 60–120 s** sí se distribuyen bien siempre que sostengan la atención: el ritmo manda, no la duración.

## Video estrella (control de calidad reforzado)

Cada video se hace como si fuera a ser el más visto de la cuenta. Antes de renderizar todo:
1. **Guion en voz alta** contra la regla de cero cringe y la de "enganchar sin anunciarlo". Si alguna frase suena a fórmula, reescríbela.
2. **Storyboard por escena** (en un comentario arriba de cada `S#` en `scene.html`): qué hace Raro (acción, no estar parado), fondo y profundidad (tipo + primer plano), toma de cámara (`TOMAS`) y el evento visual de cada palabra clave.
3. **Hoja de contacto de 12 cuadros** repartidos en todo el video + 5 cuadros del primer segundo. Califica del 1 al 5: gancho del cuadro 0, profundidad del fondo, Raro actuando, variedad de tomas, legibilidad de textos, cero segundos muertos, loop final→inicio. **Todo debe sacar 4 o más**; si no, corrige y vuelve a revisar (hasta 2 rondas).
4. Después del render final, revisa con ffmpeg los últimos 2 s y los primeros 2 s juntos para confirmar que el loop se siente continuo.

## Estrategia para crecer

- Gancho en el primer 1.5 s con imagen y texto en pantalla; nunca empieces con contexto.
- Curiosidad natural (ver "Cómo enganchar sin anunciarlo"). El cierre conecta con el inicio para que el video se repita.
- Series por partes cuando un tema dé para más: "Parte 2 en mi perfil". Las series hacen que la gente siga la cuenta.
- Cierra con una pregunta que provoque comentarios ("¿tú qué harías?", "¿cuál te voló la cabeza?") en voz y en el texto de la publicación.
- Títulos de YouTube con palabras que la gente busca ("datos curiosos", "qué pasaría si", el animal o lugar).
- Temas que mejor funcionan en este nicho: animales extremos, espacio, cuerpo humano (sin consejos médicos), historia rara, México curioso, "qué pasaría si".
- Mezcla semanal: la mitad del formato que más retiene según los datos, un tercio en prueba y el resto series.

## Aprendizajes de los datos

(Lo actualiza el revisor; datos completos en `taller/revisor/RESULTADOS.md`. Úsalo para decidir idea, gancho y formato.)
- Corte 10 nov 2026 (vistas en Facebook): ganadores **saltar-001** (1,108; "¿qué pasaría si todos saltáramos?") y **neptuno-001** (950; "tu peinado no dura ni un segundo"). El resto, 195–370.
- Lo que tienen los ganadores: le hablan al espectador o lo meten en la escena ("si todos…", "tu…"), acción absurda en el cuadro 0, respuesta contraintuitiva + segundo giro gracioso, referencias mexicanas concretas.
- Lo más débil: historias en tercera persona (emperador, Yamaguchi, Zanzíbar, Cleopatra) y datos de animales contados desde fuera (wombat, hongo). Si usas esos temas, conviértelos a "si tú fueras…" / "esto te pasaría si…".
- La retención es baja en todos (2–11 s promedio en Facebook): el gancho es la prioridad número uno.
- Al elegir ideas, prioriza "¿qué pasaría si…?" con participación masiva o del espectador, y series de planetas/lugares extremos en segunda persona.

## 1. Guion

- Duración de la narración: 62–72 s (ver Retención).
- **Gancho**: la primera frase, de 8 palabras o menos, es una afirmación sorprendente. Nada de intro ni saludo.
- Estructura: **historia en cadena**, no lista. Gancho (situación absurda + afirmación) → la pregunta que se hace el espectador → cada respuesta trae una consecuencia que abre la siguiente pregunta → 2 o 3 giros que escalan → la revelación más fuerte cerca del final → última frase que regresa a la primera para que el video se repita. Detalle y ejemplo en "Cómo enganchar sin anunciarlo". Pattern interrupt cada 8–12 s (Raro mira a cámara, freeze con zoom, cambio de disfraz). Cierre corto: "Esto es Mundo Raaaro" solo si cabe en el loop.
- Desde el guion decide el disfraz de Raro (y sus cambios) y la situación absurda del cuadro 1: la premisa "Si vivieras en…" / "Esto te pasaría si…" queda planteada antes del segundo 2.
- Oraciones cortas, lenguaje mexicano natural ("oye", "neta", "imagínate") sin exagerar.
- **Verificación obligatoria**: cada dato con WebSearch y abriendo la fuente con WebFetch. Si un dato no se puede confirmar, se quita. Guarda las fuentes (nombre del medio y del artículo) en el campo `fuentes`.
- Prohibido: personajes con derechos (Disney, Marvel, Pokémon…), personas reales dibujadas, música comercial, temas médicos o políticos, desinformación. Historias delicadas (guerras, tragedias) se cuentan con respeto, sin morbo.

## 2. Voz (Speko → ElevenLabs)

- `audio_synthesize` con `model: "eleven_v3_conversational"`, `constraints.allowedProviders.tts: ["elevenlabs"]`, `intent: {"language":"es"}`.
  - **Mizael** (principal; datos y "qué pasaría si"): voice `HRUUrQrYM9LfgDbWoMXS`.
  - **Carito** (historias y series con otro tono): voice `NNuHMQa2acKEytgZ6uvw`.
- Etiquetas de emoción dentro del texto, al menos una cada dos frases: `[excited]`, `[curious]`, `[surprised]`, `[whispers]`, `[laughs softly]`. Usa "¡...!" y "¿...?" para dar energía. Escribe el cierre como "Esto es Mundo Raaaro."
- Genera **1 sola toma** (decisión de Héctor, 5 nov 2026: ahorro de saldo de Speko, ~$0.14 por Reel). Solo genera una segunda si la transcripción muestra que leyó las etiquetas, se trabó o pronunció mal un dato. Nunca más de 2 por video.
- El resultado es grande y se guarda en un archivo JSON: decodifica `audio_base64` con Python a `voz.wav`. Su `url` firmada dura 15 minutos.
- `audio_transcribe` con esa url, `language: "es-MX"`, `word_timestamps: true` → guarda `words_raw.json` como `[[texto, inicio_ms, fin_ms], ...]`. Corrige la ortografía con tu guion (acentos, "Sí,"), y la última palabra como "Raaaro".

## 3. Animación

Trabaja en `taller/trabajo/<id>/` (no se sube a git). Copia `ejemplos/raro-demo/scene.html` como base: carga `../../engine.js` (cámara viva, captions Fredoka palabra por palabra con palabra clave en lima, chips, barrido de bufanda, flashes y grano) y `../../raro.js` (Raro, disfraces, gomitas, fondos de dulce por escena, jugo y letreros). Todo lo visual sigue `IDENTIDAD.md`.

- `escenas.json`: `{"inicios": [índice de palabra donde empieza cada escena], "tempo": 1.15, "pausa": 0.12}`. Escenas de 2 a 4 s; un dato puede ocupar varias escenas cortas.
- `python3 ../../timeline.py .` → `voz_final.wav` y `timeline.json`. Revisa los avisos de pausas largas.
- En `scene.html` escribe una función por escena `S1..Sn(t, sc)` y define `SCENES`, `FONDOS` (color y tipo de fondo distintos en cada escena), `TOMAS` (movimiento de cámara por escena), `TRANS` (bufanda, latigazo o zoom), `KEYWORDS` (palabra clave en lima), `SHAKES` (palabras de impacto) y `FLASHES`.
- **Regla de cero momentos muertos**: antes de dibujar, haz una lista de eventos visuales ligados a palabras clave (`pop(t, at(i))`, `prog(t, at(i), d)`). Cada palabra importante dispara algo: un objeto que entra, un número que crece, el personaje que reacciona, un icono, un cambio de color. Nunca dejes un hueco de más de 1.2 s sin evento. Los personajes siempre se mueven (respiran, parpadean, ondulan) y la cámara nunca está quieta: agrega paneos o zooms propios dentro de cada escena.
- Estilo: el de `IDENTIDAD.md`. Raro siempre con `raro()`; otros personajes con `gomita()` en pastel; objetos y escenarios con formas grandes y redondeadas en los tonos de la paleta de la escena, sin contorno negro; datos como objetos del mundo con `letrero()`; tipografía Fredoka Bold.
- Zonas seguras del lienzo 1080×1920: arriba de y=180 lo tapan las pestañas de la app; abajo de y=1500 y a la derecha de x=940, los botones. Chips en y=222, letreros de datos entre y=330 y y=520, captions en y≈700 (tercio central, ya lo hace el motor), pies de Raro en `SUELO` (y=1440).
- `python3 ../../render.py . preview <12 tiempos repartidos + 0 0.25 0.5 0.75 1.0>` y mira `contact.jpg`. Corrige textos encimados o cortados y huecos sin movimiento, y pasa el control de "Video estrella" y el de `IDENTIDAD.md` (hasta 2 rondas).
- `python3 ../../render.py . all` (unos 2 minutos).
- `cues.json` con efectos en índices de palabra: `puf` (cada cambio de disfraz), `boing` (cada aterrizaje de Raro), `pop` (algo aparece), `click`, `whoosh`, `thud` (impacto), `chispa`, `blip`; además `musica` por época o lugar y `corte` en cada remate (ver `IDENTIDAD.md`). Luego `python3 ../../mix.py . <id>` → `<id>.mp4` (para publicar) y `<id>_720.mp4` (para el Estudio).
- Mira 2 cuadros del video final con ffmpeg antes de entregar y repite el control de calidad de `IDENTIDAD.md`. Si `render.py` avisó que faltaba Fredoka, dilo en tu mensaje final.

## 4. Entrega

1. Copia `<id>.mp4` a `videos/<id>.mp4` en el repo, haz commit con autor `Mundo Raaro <mundoraaro@gmail.com>` y push a `main`.
2. Sube `<id>_720.mp4` al Estudio: Artifact `publish` con `url` del Estudio, `file_path` del archivo y `asset: true` → anota el id.
3. ArtifactData `set` en `videos/<id>` con: `titulo`, `formato` (dato | quepasaria | historia | serie), `duracion` ("1:15"), `voz`, `gancho`, `caption` (máx. 150 caracteres, termina con una pregunta para comentarios, máximo 1 emoji), `hashtags` (5, incluye #mundoraaro), `guion`, `fuentes`, `estado: "en_revision"`, `assetId`, `videoUrl` (enlace raw), `ideaId`, `creado` (ISO con -06:00).
4. En la idea: `update` con `estado: "producida"` y `videoId`.

Ids de video: tema corto en minúsculas más número, por ejemplo `venus-002`. Si es una nueva versión por cambios, agrega `-v2`.


## Puntos de guardado (obligatorio)
Si los créditos se acaban, la sesión se corta y se pierde lo que no esté en el repo. Al empezar, revisa si hay una carpeta `taller/wip/<idea>/` de una ejecución anterior con la misma idea y retoma desde ahí. Haz commit + `git pull --rebase` + push de `taller/wip/<idea>/` al terminar el guion, al terminar la voz (mp3 de 128k + tiempos) y al terminar la hoja de contacto. Al entregar el video, borra la carpeta wip de esa idea.
