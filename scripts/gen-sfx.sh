#!/bin/zsh
# One-shot SFX for the Fable 5.2 reel via ElevenLabs sound generation
set -e
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
sfx() {
  curl -sf "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_KEY" -H "Content-Type: application/json" \
    -d "$(python3 -c 'import json,sys;print(json.dumps({"text":sys.argv[1],"duration_seconds":float(sys.argv[2]),"prompt_influence":0.6}))' "$2" "$3")" \
    -o "public/sfx2/$1.mp3"
}
sfx typing "fast typing on a quiet mechanical laptop keyboard, close mic, dry" 1.2
sfx click "single soft crisp UI button click, modern app interface, dry" 0.5
sfx whoosh "short airy swoosh transition, clean, modern UI" 0.8
sfx crickets "crickets chirping in awkward silence, comedic" 2.0
sfx rimshot "drum rimshot ba dum tss, comedic punchline" 1.5
sfx error "short soft error buzz notification sound, UI" 0.6
sfx ding "bright cheerful success chime, short UI notification" 1.0
sfx glitch "fast digital data processing glitch, computer rapidly rewriting files" 1.8
sfx pop "cartoon bubble pop, short and playful" 0.5
