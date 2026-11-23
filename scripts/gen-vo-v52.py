# EN voice for video 52 (two hosts): odd lines Ahu (main preset), even lines Alicja (preset 2), both Eleven v4,
# with character timestamps -> public/v52/vo/raw/l<N>.mp3 + l<N>.json. Usage: python3 scripts/gen-vo-v52.py [N ...]
import base64, json, os, sys, urllib.request
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(l.strip().split("=", 1) for l in open(os.path.join(root, ".env")) if "=" in l)
key = env["ELEVENLABS_KEY"]
VOICE = {"ahu": "xyqF3vGMQlPk3e7yA4DI", "alicja": "iCzRDxXsrROcDYzWimM9"}
who = lambda i: "ahu" if i % 2 else "alicja"
lines = [l.strip() for l in open(os.path.join(root, "video/52-tatarverse-prezentaciya-en/субтитры.txt")) if l.strip()]
out = os.path.join(root, "public/v52/vo/raw")
only = set(sys.argv[1:])
for i, text in enumerate(lines, 1):
    if only and str(i) not in only: continue
    body = json.dumps({"text": text, "model_id": "eleven_v4", "language_code": "en",
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE[who(i)]}/with-timestamps?output_format=mp3_44100_192",
                                 body, {"xi-api-key": key, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    open(f"{out}/l{i}.mp3", "wb").write(base64.b64decode(r["audio_base64"]))
    json.dump(r["normalized_alignment"] or r["alignment"], open(f"{out}/l{i}.json", "w"), ensure_ascii=False)
    print(f"l{i} {who(i)} ok")
