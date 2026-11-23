# Voice for video 17 (17-vibe-proekty, ru): narrator Kyle + "ИИ:" lines by Callie, Eleven v4, with timestamps -> raw/l<N>.mp3 + l<N>.json
import base64, json, os, sys, urllib.request
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(l.strip().split("=", 1) for l in open(os.path.join(root, ".env")) if "=" in l)
key = env["ELEVENLABS_KEY"]
KYLE, CALLIE = "JyzM229ZjDtptOZjn48b", "7YaUDeaStRuoYg3FKsmU"
lines = [l.strip() for l in open(os.path.join(root, "video/17-vibe-proekty/субтитры.txt")) if l.strip()]
out = os.path.join(root, "public/v17/vo/raw")
only = set(sys.argv[1:])
for i, text in enumerate(lines, 1):
    if only and str(i) not in only: continue
    voice = CALLIE if text.startswith("ИИ:") else KYLE
    text = text.removeprefix("ИИ:").strip()
    body = json.dumps({"text": text, "model_id": "eleven_v4", "language_code": "ru",
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192",
                                 body, {"xi-api-key": key, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    open(f"{out}/l{i}.mp3", "wb").write(base64.b64decode(r["audio_base64"]))
    json.dump(r["normalized_alignment"] or r["alignment"], open(f"{out}/l{i}.json", "w"), ensure_ascii=False)
    print(f"l{i} ok")
