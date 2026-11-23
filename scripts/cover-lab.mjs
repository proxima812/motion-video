// Cover lab (Still "CoverLab", src/cover/CoverLab.tsx): all concepts as PNG + a contact sheet with the safe zone drawn.
//   bun scripts/cover-lab.mjs [outDir=video/cover-lab]   -> <outDir>/NN-<name>.png, <outDir>/_safe/NN.png, <outDir>/_sheet.jpg
import path from "node:path";
import { mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

const outDir = process.argv[2] ?? "video/cover-lab";
mkdirSync(path.join(outDir, "_safe"), { recursive: true });
const names = JSON.parse(readFileSync("src/cover/CoverLab.tsx", "utf8").match(/COVER_LAB_NAMES = (\[[^\]]*\])/)[1]);
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => {
    const c = enableTailwind(config);
    return { ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": path.resolve("src") } } };
  },
});
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const files = [];
for (let n = 1; n <= names.length; n++) {
  for (const safe of [false, true]) {
    const inputProps = { n, safe };
    const composition = await selectComposition({ serveUrl, id: "CoverLab", inputProps, puppeteerInstance: browser, chromiumOptions });
    const nn = String(n).padStart(2, "0");
    const output = safe ? path.join(outDir, "_safe", `${nn}.png`) : path.join(outDir, `${nn}-${names[n - 1]}.png`);
    await renderStill({ composition, serveUrl, frame: 0, output, imageFormat: "png", inputProps, puppeteerInstance: browser, chromiumOptions, overwrite: true });
    if (safe) files.push(output);
  }
  console.log(n, names[n - 1], "ok");
}
await browser.close({ silent: true });
execFileSync("python", ["-c", "import sys\nfrom PIL import Image\nfs=sys.argv[2:]; W,H=360,640\nc=Image.new('RGB',(5*W+6*12,2*H+3*12),'white')\nfor i,f in enumerate(fs):\n im=Image.open(f).convert('RGB').resize((W,H)); c.paste(im,(12+(i%5)*(W+12),12+(i//5)*(H+12)))\nc.save(sys.argv[1],quality=90)", path.join(outDir, "_sheet.jpg"), ...files], { stdio: "inherit" });
