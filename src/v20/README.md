# V20 AI OVERLOAD — рендер на другом ПК

Музыка в git не лежит (медиа). Положи кусок трека в `public/v20/music/bed.wav`:

```
mkdir -p public/v20/music
ffmpeg -ss 300 -i "HighThere_-_AC130_Drum_Bass_76277680.mp3" -t 15.340 \
  -af "volume=-4.5dB,afade=t=in:d=0.004,afade=t=out:st=15.328:d=0.012" -c:a pcm_s16le public/v20/music/bed.wav
```

Рендер (942 кадра, 60 fps, 15.7 с; на 8 ГБ ставь `--concurrency=1`):

```
bun install
bunx remotion render V20 video/20-ai-overload/output/video.mp4
bunx remotion still Cover20 video/20-ai-overload/output/cover.jpg
```

Формулы уже сгенерированы в `tex.ts`; `gen-tex.mjs` нужен только для правки формул (`bun add -d mathjax-full`).
