# Oro y Silicio — manual de producción de videos largos

Canal de YouTube de Héctor: **Oro y Silicio** (@oroysilicio). Documentales animados de 5 a 9 minutos sobre dinero, tecnología, IA, cripto, hackeos y empresas (éxitos y caídas). 1920×1080, 30 fps. Dos videos por semana: **martes 18:00** y **sábado 12:00** (Ciudad de México).

Guía completa del canal (tono, metas, ideas): https://claude.ai/artifact/4LZ5VPkq2exUCjC7TTvLrm

## Reglas que no se rompen
1. Todo dato sale de una página abierta con WebFetch (no de un snippet). Cifras, fechas y nombres se verifican en 2 fuentes cuando se pueda. Las fuentes van en la descripción.
2. Nunca inventes citas, mensajes, tuits ni conversaciones. Una cita real traducida dice "(traducción)". Si no tienes la cita textual, parafrasea en la voz del narrador.
3. Personas reales: solo pictogramas genéricos (`persona()`), nunca caricaturas reconocibles.
4. Sin consejos de inversión.
5. Cada video con estructura visual distinta (escenas nuevas cuando el tema lo pida) para no parecer contenido en serie de plantilla.
6. El video NO empieza con logo ni saludo: gancho primero, intro de 3 s después del gancho.

## Estructura del guion (6 partes `## P1`…`## P6`, 800–1,150 palabras)
- **P1 gancho (0:00–0:35):** el momento más fuerte + la cifra + una pregunta abierta ("y lo más increíble es que…"). Luego contexto mínimo.
- **P2–P5:** los hechos en orden de consecuencia. Cada 60–90 s una revelación. Cierra cada parte con una pregunta o giro que obligue a seguir ("Pero, ¿quién estaba del otro lado?"). Nada de listas anunciadas.
- **P6:** el giro que casi nadie conoce + reflexión final que regresa al gancho (loop).
- Números escritos con palabras (la voz los lee mejor). Etiquetas de voz v3: `[whispers]`, `[curious]`, `[surprised]`, `[excited]`, `[laughs softly]` — máximo 2 por parte.
- Si el tema se conecta con un video anterior del canal, menciónalo (ej. "Así fue como cayó FTX").


## Puntos de guardado (obligatorio)
Si los créditos se acaban, la sesión se corta y se pierde todo lo que no esté en el repo. Por eso:
1. Al empezar, revisa si existe `largo/<id>/` o `largo/wip/<tema>/` con trabajo de una ejecución anterior del mismo tema. Si existe, **retoma desde ahí** (no repitas guion ni voz ya hechos).
2. Haz commit + `git pull --rebase` + push de `largo/<id>/` en cuanto termines cada etapa: (a) guion.txt, (b) voz (P*.raw comprimidos a `voz_P*.mp3` con ffmpeg -b:a 128k, más w_P*.txt y words.json), (c) storyboard.py + timeline.json + contact.jpg, (d) miniatura y publicacion.txt. Nunca subas video_mudo.mp4 ni archivos de más de 50 MB.
3. Anota en `largo/<id>/ESTADO.md` la última etapa terminada y lo que falta.

## Pipeline (carpeta nueva `largo/<id>/`, copia scripts de `largo/ejemplos/bybit/`)
1. **Guion:** `guion.txt`.
2. **Voz:** por cada parte, `audio_synthesize` (Speko) con body `{text, intent:{language:'es'}, voice:'HRUUrQrYM9LfgDbWoMXS', model:'eleven_v3_conversational', constraints:{allowedProviders:{tts:['elevenlabs']}}}`. El resultado es enorme y se guarda en un archivo: decodifícalo con `python3 dec.py <archivo> P1` (crea `P1.raw` e imprime la URL firmada, válida 15 min). Sintetiza las 6 partes en paralelo.
3. **Tiempos:** `audio_transcribe` con la URL, `language:'es'`, `word_timestamps:true`, `keywords` con nombres propios. Escribe `w_P1.txt`… con tokens `palabra@décimas_de_segundo` y última línea `END@<décimas>`. Usa las palabras del guion (con puntuación y cifras bonitas como `1,400`), no las del transcriptor.
4. **Unir voz:** `python3 armar.py` → `voz.wav` + `words.json` (tempo 1.05, silencios recortados).
5. **Storyboard:** `storyboard.py` (lista SB). Anclas `'P2|primeras palabras'` — usa 2–3 palabras si la palabra se repite (prefijos: `'en'` también encuentra "enviar"). Escenas de 3–9 s; más de 11 s solo si la escena tiene beats que cambian. Capítulos con `'cap':('CAPÍTULO n','Título')` (8–9 por video). Tipos de escena disponibles: ver `ESC` en `lib/doc.js` (texto, cifra, dias, fecha, perfil, persona, empresa, dos, inversion, patrocinio, barras, cita, codigo, titular, activos, boveda, post, telefonos, precio, trato, mapa, robo, sim, acusados, lista, chat, juicio, reloj, destino, carcel, compara, firma, multifirma, laptop, horario, filtro, directo, ramas, convertir, clic). Si el tema necesita algo nuevo, agrega escenas genéricas y reutilizables a `lib/doc.js` sin romper las existentes.
6. **Timeline:** `python3 armar_tl.py` (revisa avisos LARGA/CORTA y que cada ancla caiga donde debe).
7. **Previa:** `python3 ../lib/render_largo.py . preview <t1> <t2> …` (un tiempo por escena, al 75 %) → `contact.jpg`. Revísala: nada encimado con la etiqueta de capítulo (arriba-izquierda) ni con los subtítulos (abajo), textos sin cortarse, cada escena entendible sin audio. Corrige y repite.
8. **Render:** `python3 ../lib/render_largo.py . all 2` en segundo plano (≈ 1 h para 6 min). Luego `python3 ../lib/mix_largo.py . <id>` → `<id>.mp4` (−14 LUFS).
9. **Marca:** inserta `kit/intro.mp4` justo después del gancho (en un silencio entre palabras: revisa la energía de `voz.wav`) y reemplaza la escena `final` por `kit/final.mp4` (pantalla final de 20 s). Codifica por segmentos y une con concat (ver `ejemplos/bybit/marca.sh`). Resultado: `<id>-oroysilicio.mp4`.
10. **Miniatura:** `miniatura.html` (1920×1080): una cifra enorme, 2–4 palabras, un objeto central, fondo oscuro con oro o rojo; legible a tamaño celular.
11. **Publicación:** `publicacion.txt` con título (< 70 caracteres, cifra o nombre conocido), descripción, capítulos (recórrelos +3 s después del gancho por la intro), fuentes, aviso de IA, hashtags, etiquetas y ajustes.
12. **Revisión final:** hoja de 17 cuadros del video final + escucha de las uniones. Push de scripts, guion, miniatura, publicacion.txt y 720p (nunca el mp4 de 1080p: pesa más de 100 MB).

## Entrega
Manda a Héctor con SendUserFile: `<id>-oroysilicio.mp4`, `miniatura.jpg`, `publicacion.txt`. Mensaje corto: título, día y hora sugeridos de publicación. Él lo sube a YouTube Studio (o pide que Claude llene los datos con el navegador).

## Ideas
Cola en `largo/IDEAS.md`. Toma la primera con estado `pendiente`, márcala `producida` con la fecha al terminar, y si quedan menos de 6 pendientes agrega nuevas (mezcla éxitos, caídas, hackeos e IA; temas con cifras grandes y una historia humana).
