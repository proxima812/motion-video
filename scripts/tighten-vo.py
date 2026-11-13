# Shorten long silences between words inside each voice line (after trim-vo.py).
# Reads/writes public/vN/vo/l*.mp3+json in place, rescaling the character timings.
# Usage: python3 scripts/tighten-vo.py N [max_gap_seconds]
import json, os, subprocess, sys
N, G = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 0.25
d = f"public/v{N}/vo"; i = 1
while os.path.exists(f"{d}/l{i}.json"):
    a = json.load(open(f"{d}/l{i}.json"))
    ch, st, en = a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]
    inside, spoken = False, []
    for k, c in enumerate(ch):
        if c == "[": inside = True
        if not inside and c.isalnum(): spoken.append(k)
        if c == "]": inside = False
    # gaps between consecutive spoken chars longer than G -> cut (keep G, centered)
    cuts = []
    for p, q in zip(spoken, spoken[1:]):
        gap = st[q] - en[p]
        if gap > G: cuts.append((en[p] + G / 2, st[q] - G / 2))
    if cuts:
        keep, t = [], 0.0
        for a0, a1 in cuts: keep.append((t, a0)); t = a1
        keep.append((t, None))
        parts = "".join(f"[0:a]atrim={s:.3f}{'' if e is None else f':{e:.3f}'},asetpts=PTS-STARTPTS,afade=t=in:d=0.01[p{j}];" for j, (s, e) in enumerate(keep))
        flt = parts + "".join(f"[p{j}]" for j in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[o]"
        tmp = f"{d}/l{i}.tmp.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{d}/l{i}.mp3", "-filter_complex", flt, "-map", "[o]", "-b:a", "192k", tmp], check=True)
        os.replace(tmp, f"{d}/l{i}.mp3")
        def shift(t):
            return t - sum(min(max(0, t - a0), a1 - a0) for a0, a1 in cuts)
        json.dump({"characters": ch, "character_start_times_seconds": [round(shift(t), 4) for t in st],
                   "character_end_times_seconds": [round(shift(t), 4) for t in en]}, open(f"{d}/l{i}.json", "w"), ensure_ascii=False)
    print(f"l{i}: {len(cuts)} cuts")
    i += 1
