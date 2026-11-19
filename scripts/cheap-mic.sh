#!/usr/bin/env bash
# "Cheap microphone" voice filter for the dark preset: narrow phone/radio band, boxy mid bump,
# hard compression, a touch of bit-crush grit. Zero-latency filters only, so l<N>.json timings stay valid.
# usage: scripts/cheap-mic.sh in.mp3 out.mp3
set -euo pipefail
ffmpeg -v error -y -i "$1" -af "highpass=f=320,highpass=f=320,lowpass=f=3600,lowpass=f=3600,equalizer=f=1700:t=q:w=1.2:g=5,equalizer=f=600:t=q:w=1:g=-3,acompressor=threshold=-20dB:ratio=5:attack=3:release=60:makeup=4,acrusher=bits=11:mode=log:mix=0.18:aa=1,alimiter=limit=0.89" -ar 44100 -b:a 192k "$2"
