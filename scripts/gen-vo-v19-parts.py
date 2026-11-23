# Intro lines for the 3-part cut of video 19: Ahu on Eleven v4 -> public/v19/vo/raw/p<N>.mp3+json,
# then trimmed (silence cut, x1.1 like the main VO) -> public/v19/vo/p<N>.mp3+json. Usage: python3 scripts/gen-vo-v19-parts.py [2 3]
import base64, json, os, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(l.strip().split("=", 1) for l in open(os.path.join(root, ".env")) if "=" in l)
key, voice, T = env["ELEVENLABS_KEY"], "xyqF3vGMQlPk3e7yA4DI", 1.1
LINES = {
    "2": "[warm] Татарверс точка си си, часть вторая: как найти своих.",
    "3": "[inviting] Часть третья: как вместе сделать каталог полнее.",
}
d = os.path.join(root, "public/v19/vo")
for n in sys.argv[1:] or LINES:
    body = json.dumps({"text": LINES[n], "model_id": "eleven_v4", "language_code": "ru",
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode()
    import urllib.request
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192",
                                 body, {"xi-api-key": key, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    open(f"{d}/raw/p{n}.mp3", "wb").write(base64.b64decode(r["audio_base64"]))
    a = r["normalized_alignment"] or r["alignment"]
    json.dump(a, open(f"{d}/raw/p{n}.json", "w"), ensure_ascii=False)
    ch, st, en = a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]
    inside, idx = False, []
    for k, c in enumerate(ch):
        if c == "[": inside = True
        if not inside and not c.isspace(): idx.append(k)
        if c == "]": inside = False
    t0 = max(0, st[idx[0]] - 0.04); t1 = en[idx[-1]] + 0.15
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{d}/raw/p{n}.mp3", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}",
                    "-af", f"atempo={T},afade=t=out:st={(t1-t0)/T-0.05:.3f}:d=0.05", "-b:a", "192k", f"{d}/p{n}.mp3"], check=True)
    sc = lambda ts: [round(max(0, (t - t0) / T), 4) for t in ts]
    json.dump({"characters": ch, "character_start_times_seconds": sc(st), "character_end_times_seconds": sc(en)},
              open(f"{d}/p{n}.json", "w"), ensure_ascii=False)
    # word frames (60 fps) for the avatar pills
    cur, t, inside, words = "", 0.0, False, []
    for c, s in list(zip(ch, sc(st))) + [(" ", 0)]:
        if c == "[": inside = True
        if inside:
            if c == "]": inside = False
            continue
        if c.isspace():
            w = "".join(x for x in cur if x.isalnum() or x == "-")
            if w: words.append((round(t * 60), w))
            cur = ""
        else:
            if not cur: t = s
            cur += c
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{d}/p{n}.mp3"]))
    print(f"p{n} dur={round(dur * 60)}", words)
