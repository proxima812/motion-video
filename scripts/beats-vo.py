import json, os, re, subprocess, sys
n = sys.argv[1]; gap = int(sys.argv[2]) if len(sys.argv) > 2 else 14
f = 8; starts = []; i = 0
while os.path.exists(f"public/v{n}/vo/l{i + 1}.mp3"):
    i += 1
    d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"public/v{n}/vo/l{i}.mp3"]))
    dur = round(d*60); starts.append((f, dur))
    a = json.load(open(f"public/v{n}/vo/l{i}.json"))
    cur, t, inside, ws = "", 0, False, []
    for c, s in list(zip(a["characters"], a["character_start_times_seconds"])) + [(" ", 0)]:
        if c == "[": inside = True
        if inside:
            if c == "]": inside = False
            continue
        if c.isspace():
            w = re.sub(r"[^\w-]", "", cur)
            if w: ws.append(f"{w}@{f+round(t*60)}")
            cur = ""
        else:
            if not cur: t = s
            cur += c
    print(f"l{i} from {f} dur {dur}:", " ".join(ws))
    f += dur + gap
print("end", f - gap, "VO_FROM", [s for s, _ in starts])
