#!/bin/zsh
# Kyle (Engaging, Confident, Authentic) on Eleven v4
set -e
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
VOICE=JyzM229ZjDtptOZjn48b
say_line() {
  curl -sf "https://api.elevenlabs.io/v1/text-to-speech/$VOICE?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_KEY" -H "Content-Type: application/json" \
    -d "$(python3 -c 'import json,sys;print(json.dumps({"text":sys.argv[1],"model_id":"eleven_v4"}))' "$2")" \
    -o "public/vo2/$1.mp3"
}
say_line l1 "Fable 5.2 is here."
say_line l2 "Ask it to fix a typo... it rewrites your app. In Rust."
say_line l3 "Think Harder mode. Forty minutes later: hmm."
say_line l4 "Wrong? You're absolutely right!"
say_line l5 "Fable 5.2. Point one better."
