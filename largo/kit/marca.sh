#!/bin/bash
# Uso: marca.sh <video_mix.mp4> <corte_gancho_seg> <inicio_escena_final_seg> <salida.mp4>
# Inserta kit/intro.mp4 tras el gancho y reemplaza la escena final por kit/final.mp4.
set -e; S=$1; A=$2; B=$3; OUT=$4; K=$(dirname "$0")
E="-c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -ac 2"
T=$(mktemp -d)
ffmpeg -y -loglevel error -i "$S" -t $A -af "afade=t=out:st=$(echo "$A-0.05"|bc):d=0.05" $E $T/s0.mp4
ffmpeg -y -loglevel error -i $K/intro.mp4 $E $T/s1.mp4
L=$(echo "$B-$A"|bc)
ffmpeg -y -loglevel error -ss $A -i "$S" -t $L -af "afade=t=in:d=0.03,afade=t=out:st=$(echo "$L-0.36"|bc):d=0.36" $E $T/s2.mp4
ffmpeg -y -loglevel error -i $K/final.mp4 $E $T/s3.mp4
printf "file $T/s0.mp4\nfile $T/s1.mp4\nfile $T/s2.mp4\nfile $T/s3.mp4\n" > $T/l.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $T/l.txt -c copy -movflags +faststart "$OUT"
rm -rf $T; ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
