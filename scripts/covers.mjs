// Render reel covers (Still "Cover<N>") into video/<N>-*/output/cover.jpg (one bundle + browser for all).
//   bun scripts/covers.mjs 60 61 62 ...   (also writes output/cover-safe.png with the 1010x1250 safe zone drawn for review)
import path from "node:path";
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

const ns = process.argv.slice(2);
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => {
    const c = enableTailwind(config);
    return { ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": path.resolve("src") } } };
  },
});
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const outs = [];
for (const n of ns) {
  const dir = readdirSync("video").find((d) => d.startsWith(`${n}-`));
  const output = path.join("video", dir, "output", "cover.jpg");
  const composition = await selectComposition({ serveUrl, id: `Cover${n}`, puppeteerInstance: browser, chromiumOptions });
  await renderStill({ composition, serveUrl, frame: 0, output, imageFormat: "jpeg", jpegQuality: 95, puppeteerInstance: browser, chromiumOptions, overwrite: true });
  outs.push(output);
  console.log(n, output);
}
await browser.close({ silent: true });
// review copies with the safe zone (x 35..1045, y 335..1585)
execFileSync("python", ["-c", "import sys\nfrom PIL import Image, ImageDraw\nfor f in sys.argv[1:]:\n im=Image.open(f).convert('RGB'); d=ImageDraw.Draw(im); d.rectangle((35,335,1045,1585),outline=(0,194,255),width=4); im.save(f.replace('cover.jpg','cover-safe.png'))", ...outs], { stdio: "inherit" });
