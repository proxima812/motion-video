# Remotion Studio puts the absolute file path into the "x-remotion-source-revision" header; our path has Cyrillic
# ("Проекты"), so fetch() fails: "String contains non ISO-8859-1 code point" and Studio edits are not saved.
# Patch: URI-encode the header in the client, decode it in the server. Re-run after `bun install` / Remotion update:
#   python3 scripts/patch-remotion-studio.py   (then restart `remotion studio`)
import glob
R = "node_modules/@remotion/"
done = 0
for f in glob.glob(R + "studio/dist/esm/*.mjs") + [R + "studio/dist/components/call-api.js"]:
    s = open(f).read()
    for a in ['"x-remotion-source-revision": JSON.stringify(guard)', "'x-remotion-source-revision': JSON.stringify(guard)"]:
        if a in s:
            s = s.replace(a, a.replace("JSON.stringify(guard)", "encodeURIComponent(JSON.stringify(guard))"))
            open(f, "w").write(s); done += 1; print("client:", f)
f = R + "studio-server/dist/preview-server/source-mutation-guard.js"
s = open(f).read()
if "const guard = JSON.parse(header);" in s:
    open(f, "w").write(s.replace("const guard = JSON.parse(header);", "const guard = JSON.parse(decodeURIComponent(header)); // local patch: header is URI-encoded (non-ASCII project path)"))
    done += 1; print("server:", f)
print("patched" if done else "nothing to patch (already patched or Remotion changed)")
