#!/usr/bin/env bash
# Contact sheet of stills (8 per sheet, 4x2, in the given order): scripts/sheet.sh out.jpg f1.jpg f2.jpg ...
set -euo pipefail
out=$1; shift
args=(); fc=""; lay=""; i=0
for f in "$@"; do args+=(-i "$f"); fc+="[$i:v]scale=405:720[v$i];"; lay+="${lay:+|}$(( (i%4)*405 ))_$(( (i/4)*720 ))"; i=$((i+1)); done
ffmpeg -v error -y "${args[@]}" -filter_complex "${fc}$(for k in $(seq 0 $((i-1))); do printf "[v$k]"; done)xstack=inputs=$i:layout=$lay" "$out"
