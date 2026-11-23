// Cover badges (Still "Badge", src/cover/Badge.tsx): every variant in BADGES as a transparent PNG, cropped to the badge.
//   bun scripts/badges.mjs [outDir=video/badges] ["text"]   -> <outDir>/<variant>.png (+ crop via python/PIL)
// One bundle + one browser. Mirrors remotion.config.ts (Tailwind v4, "@/..." alias, ANGLE GL).
import path from "node:path";
import { mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

const outDir = process.argv[2] ?? "video/badges";
const text = process.argv[3] ?? "Пришла на чай ушла с сумками";
mkdirSync(outDir, { recursive: true });
const variants = [...readFileSync("src/cover/Badge.tsx", "utf8").matchAll(/^\s+"((?:plate|glass)-[\w-]+)": \{/gm)].map((m) => m[1]);

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
for (const variant of variants) {
  const inputProps = { variant, text };
  const composition = await selectComposition({ serveUrl, id: "Badge", inputProps, puppeteerInstance: browser, chromiumOptions });
  const output = path.join(outDir, `${variant}.png`);
  await renderStill({ composition, serveUrl, frame: 0, output, imageFormat: "png", inputProps, puppeteerInstance: browser, chromiumOptions, overwrite: true });
  files.push(output);
  console.log(variant, "ok");
}
await browser.close({ silent: true });
// crop the transparent margins (keep 24 px around the badge and its shadow)
execFileSync("python", ["-c", "import sys\nfrom PIL import Image\nfor f in sys.argv[1:]:\n im=Image.open(f); b=im.getchannel('A').point(lambda a: 255 if a>6 else 0).getbbox()\n if b: im.crop((max(0,b[0]-24),max(0,b[1]-24),min(im.width,b[2]+24),min(im.height,b[3]+24))).save(f)", ...files], { stdio: "inherit" });
