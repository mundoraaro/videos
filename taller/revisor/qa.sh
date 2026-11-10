#!/usr/bin/env bash
# Control técnico automático de un video de Mundo Raaro.
# Uso: bash taller/revisor/qa.sh videos/<id>.mp4 <carpeta_salida>
# Genera: tecnico.txt (PASA/FALLA por regla) y hojas de contacto (inicio.jpg, video.jpg, loop.jpg).
set -u
V="$1"; OUT="${2:-/tmp/qa}"; mkdir -p "$OUT"
R="$OUT/tecnico.txt"; : > "$R"
fallas=0
ok(){ echo "PASA  | $1" >> "$R"; }
bad(){ echo "FALLA | $1" >> "$R"; fallas=$((fallas+1)); }

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$V")
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$V")
fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$V")
vc=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$V")
ac=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$V")

awk "BEGIN{exit !($dur>=62 && $dur<=72)}" && ok "Duración ${dur}s (62–72)" || bad "Duración ${dur}s fuera de 62–72 s"
[ "$w" = 1080 ] && [ "$h" = 1920 ] && ok "Resolución ${w}x${h}" || bad "Resolución ${w}x${h} (debe ser 1080x1920)"
[ "$fps" = "30/1" ] && ok "FPS $fps" || bad "FPS $fps (debe ser 30)"
[ "$vc" = h264 ] && ok "Video h264" || bad "Códec de video $vc"
[ -n "$ac" ] && ok "Audio $ac" || bad "Sin pista de audio"

# Volumen (−15 a −13 LUFS) y pico verdadero
eb=$(ffmpeg -hide_banner -i "$V" -af ebur128=peak=true -vn -f null - 2>&1)
lufs=$(echo "$eb" | grep -A1 "Integrated loudness" | grep -o "I: *-\?[0-9.]*" | tail -1 | grep -o "\-\?[0-9.]*")
tp=$(echo "$eb" | grep -A1 "True peak" | grep -o "Peak: *-\?[0-9.]*" | tail -1 | grep -o "\-\?[0-9.]*")
awk "BEGIN{exit !($lufs>=-15.5 && $lufs<=-12.5)}" && ok "Volumen ${lufs} LUFS" || bad "Volumen ${lufs} LUFS (debe ser ≈ −14)"
awk "BEGIN{exit !($tp<=-0.5)}" && ok "Pico ${tp} dBTP" || bad "Pico ${tp} dBTP (satura; debe ser ≤ −1)"

# Cuadros negros
nb=$(ffmpeg -hide_banner -i "$V" -vf blackdetect=d=0.1:pix_th=0.08 -an -f null - 2>&1 | grep -c black_start)
[ "$nb" = 0 ] && ok "Sin cuadros negros" || bad "$nb tramos negros"

# Imagen congelada > 1.2 s (regla de cero momentos muertos)
fz=$(ffmpeg -hide_banner -i "$V" -vf freezedetect=n=0.003:d=1.2 -an -f null - 2>&1 | grep -o "freeze_start: [0-9.]*" | tr '\n' ' ')
[ -z "$fz" ] && ok "Nunca se congela más de 1.2 s" || bad "Imagen congelada >1.2 s en: $fz"

# Silencios > 0.6 s en la voz (entre el segundo 1 y el final −1)
sl=$(ffmpeg -hide_banner -i "$V" -af silencedetect=n=-38dB:d=0.6 -vn -f null - 2>&1 | grep -o "silence_start: [0-9.]*" | awk -v d="$dur" '{if($2>1 && $2<d-1) printf "%s ", $2}')
[ -z "$sl" ] && ok "Sin silencios largos" || bad "Silencios >0.6 s en: $sl"

# Cambios de toma: mínimo 1 cada 3.5 s en todo el video
cuts=$(ffmpeg -hide_banner -i "$V" -vf "select='gt(scene,0.25)',showinfo" -an -f null - 2>&1 | grep -c pts_time)
need=$(awk "BEGIN{printf \"%d\", $dur/3.5}")
[ "$cuts" -ge "$need" ] && ok "Cortes de toma: $cuts (mín. $need)" || bad "Pocos cortes de toma: $cuts (mín. $need)"

# Movimiento en los primeros 3 s (el gancho no puede ser una imagen quieta)
mv=$(ffmpeg -hide_banner -t 3 -i "$V" -vf "select='gt(scene,0.02)',showinfo" -an -f null - 2>&1 | grep -c pts_time)
[ "$mv" -ge 8 ] && ok "Movimiento en los primeros 3 s ($mv cambios)" || bad "Gancho casi quieto: solo $mv cambios en 3 s"

echo "TOTAL_FALLAS=$fallas" >> "$R"

# Hojas de contacto para revisión visual
ffmpeg -v error -y -i "$V" -vf "select='eq(n\,0)+eq(n\,8)+eq(n\,15)+eq(n\,30)+eq(n\,45)+eq(n\,60)+eq(n\,75)+eq(n\,90)',scale=270:-1,tile=8x1" -frames:v 1 "$OUT/inicio.jpg"
ffmpeg -v error -y -i "$V" -vf "fps=16/$dur,scale=270:-1,tile=8x2" -frames:v 1 "$OUT/video.jpg"
last=$(awk "BEGIN{print $dur-0.1}")
ffmpeg -v error -y -ss "$last" -i "$V" -frames:v 1 -vf scale=270:-1 "$OUT/_fin.jpg"
ffmpeg -v error -y -i "$V" -frames:v 1 -vf scale=270:-1 "$OUT/_ini.jpg"
ffmpeg -v error -y -i "$OUT/_fin.jpg" -i "$OUT/_ini.jpg" -filter_complex hstack "$OUT/loop.jpg"
rm -f "$OUT/_fin.jpg" "$OUT/_ini.jpg"
cat "$R"
