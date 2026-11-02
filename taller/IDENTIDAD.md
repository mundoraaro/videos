# Identidad visual de Mundo Raaro (obligatoria en TODOS los videos)

Decisión de Héctor (2 nov 2026). Define el diseño de todos los videos; el resto del proceso (guion, voz, retención, entrega) sigue igual que en `GUIA.md`. Si algo de `GUIA.md` o del ejemplo del pulpo contradice este archivo, manda este archivo.

- Código: `taller/raro.js` (personaje, disfraces, fondos, jugo, letreros) y `taller/engine.js` (captions, cámara, transiciones, grano).
- Referencia visual: `taller/ejemplos/raro-demo/` (`hoja-modelo.jpg` con expresiones y disfraces, `raro-demo_720.mp4` y `scene.html` de 10 s con todas las piezas). Es la referencia de estilo; el pulpo sigue siendo referencia de ritmo y proceso, no de diseño.

## Concepto

El protagonista es **RARO**: un personaje blanco, suave y redondito, como malvavisco o figura de vinil. En cada video Raro se **disfraza del tema** y vive el dato en carne propia (campesino medieval, astronauta, pirata, cavernícola, pulpo, soldado romano, faraón…). Formato "tú en esa situación": Raro es el espectador. Mismo personaje siempre, mundo y disfraz distintos cada vez. Eso es la marca.

## 1. Diseño de Raro (nunca cambia)

- Cuerpo y cabeza en una sola forma tipo frijol/gomita, blanco cálido `#FAF7F2`, sin contorno negro. Sombreado plano de 2 tonos (blanco y gris lavanda `#D9D4E8`) más un brillo pequeño arriba: juguete premium, no dibujo plano.
- Brazos y piernas tipo "manguera de goma": cortos, curvos, elásticos, que se estiran y rebotan.
- Cara: dos ojos negros ovalados grandes con punto de brillo blanco, cejas flotantes negras, boca pequeña que cambia mucho de forma. Mejillas rosadas al apenarse o emocionarse.
- SIEMPRE lleva su bufanda verde lima (`#D7FF3D`, color de la marca), incluso encima del disfraz.
- Expresiones base: asombro, terror, asco, risa, llanto exagerado, orgullo, sospecha, "ya valió". Reacciones más grandes que la vida: ojos al doble, cuerpo aplastado, salta del susto.

**En código, Raro se dibuja SOLO con `raro({...})`.** Prohibido redibujarlo a mano, cambiarle colores, proporciones o quitarle la bufanda. Si una escena necesita algo que `raro()` no tiene (una pose, una expresión, un disfraz), se agrega como opción en `raro.js` respetando el diseño, para que sirva en los siguientes videos.

```js
raro({x:540, y:SUELO, s:1.3, t,
  expr:'terror',          // neutral feliz asombro terror asco risa llanto orgullo sospecha yavalio apenado
  brazos:'arriba',        // idle arriba saluda jarras cara senala corre carga frente  (o manos:{i:[x,y], d:[x,y]})
  piernas:'corre',        // quieto corre camina flota
  disfraz:'campesino',    // campesino caballero astronauta pirata cavernicola piyama abrigo ingeniero anciano, o un objeto {atras,cuerpo,cabeza,frente}
  sq, alto, wob,          // aplastamiento, altura de salto, movimiento secundario (de gelatina/brinco/caida)
  spin,                   // giro del "puf de disfraz" (de pufCambio)
  tilt, viento, ojos, mira:{x,y}, rubor, roto });
gomita({...})             // otros personajes: mismo cuerpo, color pastel, sin bufanda. Solo Raro es blanco.
```

Coordenadas locales de Raro con `s=1`: origen entre los pies; cuerpo de y=-40 a y=-376 y medio ancho 150; ojos en (±50,-290); boca en y=-232; bufanda en y≈-200; hombros en (±138,-172). Un disfraz nuevo se escribe como objeto con capas `atras` (capa, mochila), `cuerpo` (ropa, se recorta sola a la silueta), `cabeza` (casco, sombrero, pelo) y `frente` (parche, objeto en la mano; recibe las posiciones de las manos). Usa `o.wob` y `o.t` para que plumas, harapos y cascos sigan moviéndose después de que Raro se detiene. Si el disfraz sirve para otros temas, agrégalo a `DISFRACES` en `raro.js`.

## 2. Disfraces

- El disfraz es lo primero que se ve y la mitad del gancho: exagerado y cómico, con detalles reconocibles (casco con plumas, harapos con parches, escafandra, parche de pirata).
- Cambia durante el video cuando cambia la situación (campesino → caballero, vivo → fantasma) con el **"puf de disfraz"**: Raro gira rápido, nube de polvo de colores, aparece con el nuevo disfraz y suena el "puf".
  ```js
  const p=pufCambio(t,at(i));  raro({..., disfraz:p.despues?'caballero':'campesino', spin:p.spin});  nubePuf(t,at(i)+0.08,x,y-160,1.5);
  // cues.json: "puf":[i]
  ```
- Los demás personajes del mundo usan `gomita()` en pastel; nunca blanco.

## 3. Fondos y color

- Fondos muy saturados tipo dulce; cada escena con un color dominante: `turquesa`, `magenta`, `mandarina`, `limon`, `violeta`, `cielo` (`PALETAS` en `raro.js`, cada una con claro, medio, oscuro y su color complementario para el contraluz).
- Escenarios en 3-4 tonos del MISMO color, formas grandes y redondeadas. Raro blanco siempre resalta.
- **Cada cambio de escena cambia el color de fondo.** Se declara por escena: `window.FONDOS={1:{pal:'magenta',tipo:'cerros'}, 2:{pal:'turquesa',tipo:'selva'}, ...}`. Tipos: `cerros`, `cielo`, `olas`, `espacio`, `interior`, `mar` (bajo el agua), `selva`, `ciudad`, `desierto`, `nieve`, `liso` (para escenarios propios: castillo, barco, cueva… dibújalos con los tonos de `PAL_ACTUAL`). Escoge el tipo que cuente dónde está Raro; no repitas el mismo tipo en dos escenas seguidas.
- **Profundidad (pedido de Héctor: que los fondos no se vean planos).** El motor ya pone en todos: cielo con degradado, halo de luz detrás de Raro (`HALO_X/HALO_Y` si Raro no está al centro), partículas de ambiente según el tipo (motas, hojas, burbujas, nieve, arena), **primer plano desenfocado** que pasa por delante (`pp:false` en `FONDOS` para quitarlo en una escena) y viñeta del color de la escena. Un escenario propio (`liso`) debe tener al menos 3 capas: fondo lejano claro, capa media y algo cerca de cámara.
- Contraluz (rim light) del color complementario detrás de Raro: automático en `raro()`.
- Grano sutil encima de todo: automático en el motor.

## 4. Animación jugosa

- Todo rebota: aterrizaje con squash & stretch y tambaleo de gelatina 2-3 veces (`gelatina`, `brinco`, `caida`, `susto`; pasan `sq`, `alto` y `wob` a `raro()`). Cada aterrizaje lleva "boing" en `cues.json`.
- Cada acción tiene jugo: sacudida de cámara (`SHAKES`), chispas o estrellitas (`chispas`, `estrellitas`), flash de color de 2 cuadros (`window.FLASHES=[[i,'#FFFFFF']]`) y los objetos aparecen con pop 0 → 1.15 → 1 (`popIn`).
- Easing con overshoot y resortes; cero movimiento lineal. Anticipación (se aplasta) antes de cada acción grande: ya incluida en `brinco` y `saleArriba`.
- Movimiento secundario: casco, plumas, harapos y bufanda siguen moviéndose (`wob`, `viento`).
- Raro respira y parpadea siempre (automático). Nunca está congelado.
- Objetos que caen, se apilan o encajan "con click" (sonido `click`).
- Cambio visual cada 1.5-2.5 s y cámara siempre viva. Cada escena declara su toma: `window.TOMAS={n:{mov:'push'|'pull'|'paneo-izq'|'paneo-der'|'sube'|'baja'|'orbita'|'fija', z:1.0-1.8, foco:[x,y]}}`. Varía el tamaño de plano: abierto (z 1, todo el mundo), medio (z 1.2-1.3) y cerrado a la cara de Raro (z 1.6-1.8, `foco` en sus ojos) para reacciones. Sin `TOMAS`, el motor alterna movimientos solo.
- **Raro nunca está solo parado al centro.** En cada escena hace algo: corre, carga, flota, se esconde, empuja, cae, interactúa con el objeto del dato. Cambia de lugar en pantalla entre escenas (izquierda, derecha, cerca, lejos).
- **Los números se ven, no solo se dicen.** Usa comparaciones de escala dibujadas: `cascada()` para mostrar cantidades con objetos que aparecen en cascada, objetos al lado de Raro para tamaños, `contador()` para cifras que crecen.
- **Golpes en las revelaciones:** `lineasVelocidad(t,at(i),x,y)` (líneas radiales tipo anime), `ondaChoque(t,at(i),x,y)` en aterrizajes fuertes, con `SHAKES` y `FLASHES` en la misma palabra.

## 5. Ritmo y retención

- Cuadro 1: Raro YA disfrazado en plena situación absurda o peligrosa (huyendo de una rata gigante, flotando con la escafandra rota). Sin intro, logo ni título.
- Antes del segundo 2 la premisa está planteada ("Si vivieras en…", "Esto te pasaría si…").
- Escalada: cada dato peor, más raro o más gracioso; Raro reacciona cada vez más exagerado.
- Cada 8-12 s un pattern interrupt: Raro mira a cámara con cara de "¿en serio?" (`expr:'sospecha'`), freeze con zoom a su cara, o cambio de disfraz sorpresa.
- Cierre: gesto final cómico de Raro que conecta con el primer cuadro para que el video haga loop (sustituye al cierre con el logo del Ojo).

## 6. Transiciones de firma (siempre las mismas)

- **Puf de disfraz** (cambio de época o situación): ver punto 2.
- **Salto de escena**: Raro brinca fuera de cuadro hacia arriba (`saleArriba(t,sc.end)` al final de la escena) y cae en la siguiente con otro color (`caida(t,sc.start)` + "boing").
- **Bufanda**: la bufanda lima cruza la pantalla y revela la escena siguiente: `window.TRANS={n:'bufanda'}` (la dibuja el motor).
- **Latigazo**: paneo rápido con estelas hacia la escena siguiente, para "mientras tanto" o cambios de lugar: `TRANS={n:'latigazo'}`.
- **Zoom**: la cámara entra atravesando con líneas de velocidad, para revelaciones: `TRANS={n:'zoom'}`.
- Varía: en un video usa al menos 3 tipos distintos de transición, y nunca la misma dos veces seguidas.
- Sin transición declarada hay corte seco con punch-in. Nada de fades ni deslizados genéricos.

## 7. Texto y captions

- Fuente fija: **Fredoka Bold**, archivo `taller/fuentes/Fredoka-Bold.ttf` (o `Fredoka.ttf` variable). Si `render.py` avisa que no la encontró, el video sale con Inter de respaldo: dilo en el mensaje final para que Héctor suba la fuente.
- Captions blancos con contorno grueso oscuro y sombra; la palabra clave en verde lima, más grande y con pop: `window.KEYWORDS=[índices de palabra]` (1 por frase, la que carga el dato o el remate).
- Palabra por palabra, sincronizado con la voz, máximo 3-4 palabras, tamaño moderado (80 px; `window.CAPTION_SIZE` solo si hace falta).
- **Acomodo automático (pedido de Héctor: que nunca tapen de más):** `raro()`, `gomita()` y `letrero()` registran su zona y el motor coloca cada frase en el hueco que menos tape, prefiriendo y≈700 (tercio central) y nunca debajo de y≈1440. Cualquier otro objeto importante de la escena (un planeta, un dato dibujado a mano) se marca con `ocupa(x0,y0,x1,y1,peso)` para que el caption lo esquive. La posición se fija por frase, no brinca. En la hoja de contacto revisa que ningún caption tape la cara de Raro ni un letrero.
- Fechas, números y datos aparecen como objetos del mundo: `letrero(txt,x,y,popIn(t,at(i)),'madera'|'panel'|'pergamino'|'piedra',{t,t0:at(i)})`, entre y=330 y y=520. Nada de texto flotante tipo diapositiva; `label()` solo para lo que no tenga objeto posible.

## 8. Sonido (`cues.json`)

- `"puf"` en cada cambio de disfraz y `"boing"` en cada aterrizaje de Raro: siempre los mismos, son marca.
- `"pop"`, `"click"`, `"whoosh"`, `"thud"` (impacto) y `"chispa"`, sincronizados al cuadro.
- Música según la época o el lugar: `"musica":[{"t":0,"estilo":"medieval"},{"w":40,"estilo":"espacio"}]` (estilos: `jugueton`, `medieval`, `espacio`, `misterio`, `aventura`; todo sintetizado, sin derechos; agrega estilos en `mix.py` si el tema lo pide).
- Corte de música en cada remate cómico: `"corte":[índices de palabra]`.

## 9. Prohibido

- Cambiar el diseño de Raro, quitarle la bufanda o hacerlo de otro color.
- Fondos blancos, grises, oscuros apagados o con degradados genéricos (el fondo índigo del piloto ya no se usa).
- Realismo, stock, clipart, emojis, partículas sin motivo.
- Escenas sin reacción de Raro, segundos sin movimiento, texto tipo diapositiva.
- Chips o textos que numeren la estructura ("DATO 1 DE 4") y anuncios tipo "el último es el mejor" (ver GUIA, "Cómo enganchar sin anunciarlo").

## Control de calidad (antes de mandar a aprobación)

Revisa la hoja de contacto y 2 cuadros del video final y responde:
1. Si pauso en cualquier cuadro, ¿se reconoce que es Mundo Raaro (Raro blanco con bufanda lima, fondo de dulce)? ¿El fondo tiene profundidad (capas, luz, primer plano) y no se ve plano?
1b. ¿Raro está haciendo algo en cada escena, y las tomas cambian de tamaño y movimiento?
2. ¿Los colores se ven vivos y "antojables" en el celular?
3. ¿Cada acción tiene rebote, sonido y jugo?
4. ¿Hay algún segundo muerto?

Si algo falla, corrígelo antes de entregar.
