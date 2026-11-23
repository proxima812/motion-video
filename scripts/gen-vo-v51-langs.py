# Language demos for the two-host tatarverse.cc reel: odd lines Ahu, even lines Alicja, Eleven v4 with timestamps,
# then trimmed and joined with 0.25 s gaps into one listening file.
# Usage: python3 scripts/gen-vo-v51-langs.py <lang> <lines.txt> <out_dir>  -> out_dir/l<N>.mp3+json, out_dir/../demo-<lang>.mp3
import base64, json, os, subprocess, sys, urllib.request
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(l.strip().split("=", 1) for l in open(os.path.join(root, ".env")) if "=" in l)
VOICE = {"ahu": "xyqF3vGMQlPk3e7yA4DI", "alicja": "iCzRDxXsrROcDYzWimM9"}
lang, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
lines = [l.strip() for l in open(src) if l.strip()]
parts = []
for i, text in enumerate(lines, 1):
    who = "ahu" if i % 2 else "alicja"
    body = json.dumps({"text": text, "model_id": "eleven_v4", "language_code": lang, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE[who]}/with-timestamps?output_format=mp3_44100_192", body, {"xi-api-key": env["ELEVENLABS_KEY"], "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    open(f"{out}/l{i}.mp3", "wb").write(base64.b64decode(r["audio_base64"]))
    a = r["normalized_alignment"] or r["alignment"]
    json.dump(a, open(f"{out}/l{i}.json", "w"), ensure_ascii=False)
    # trim to the spoken part (skip [tags])
    inside, idx = False, []
    for k, c in enumerate(a["characters"]):
        if c == "[": inside = True
        if not inside and not c.isspace(): idx.append(k)
        if c == "]": inside = False
    t0 = max(0, a["character_start_times_seconds"][idx[0]] - 0.04); t1 = a["character_end_times_seconds"][idx[-1]] + 0.15
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{out}/l{i}.mp3", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-af", "atempo=1.08", "-ar", "44100", "-ac", "2", f"{out}/t{i}.wav"], check=True)
    parts.append(f"{out}/t{i}.wav")
    print(f"l{i} {who} ok")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", "0.25", "-i", "anullsrc=r=44100:cl=stereo", f"{out}/gap.wav"], check=True)
lst = f"{out}/list.txt"
open(lst, "w").write("".join(f"file '{os.path.abspath(p)}'\nfile '{os.path.abspath(out)}/gap.wav'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-b:a", "192k", os.path.join(os.path.dirname(os.path.abspath(out)), f"demo-{lang}.mp3")], check=True)
print("demo ok")
