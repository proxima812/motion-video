# Trim silence around each voice line and optionally speed it up (pitch kept).
# Reads public/vN/vo/raw/l*.mp3+json, writes public/vN/vo/l*.mp3+json with rescaled timings.
# Usage: python3 scripts/trim-vo.py N [tempo]
import json, os, subprocess, sys
N, T = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
d = f"public/v{N}/vo"; i = 1
while os.path.exists(f"{d}/raw/l{i}.json"):
    a = json.load(open(f"{d}/raw/l{i}.json"))
    ch, st, en = a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]
    # skip [tags] when finding first/last spoken char
    inside, idx = False, []
    for k, c in enumerate(ch):
        if c == "[": inside = True
        if not inside and not c.isspace(): idx.append(k)
        if c == "]": inside = False
    t0 = max(0, st[idx[0]] - 0.04); t1 = en[idx[-1]] + 0.15
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{d}/raw/l{i}.mp3", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}",
                    "-af", f"atempo={T},afade=t=out:st={(t1-t0)/T-0.05:.3f}:d=0.05", "-b:a", "192k", f"{d}/l{i}.mp3"], check=True)
    sc = lambda ts: [round(max(0, (t - t0) / T), 4) for t in ts]
    json.dump({"characters": ch, "character_start_times_seconds": sc(st), "character_end_times_seconds": sc(en)},
              open(f"{d}/l{i}.json", "w"), ensure_ascii=False)
    i += 1
print(f"v{N}: {i-1} lines, tempo {T}")
