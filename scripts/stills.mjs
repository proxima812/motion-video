// Many stills of one composition in a single bundle + browser session (much faster than `remotion still` per frame).
//   node scripts/stills.mjs <CompositionId> <outDir> <frame> [frame ...]   -> <outDir>/f<frame>.jpg
// Mirrors remotion.config.ts (Tailwind v4, "@/..." alias, ANGLE GL) - keep in sync if the config changes.
import path from "node:path";
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

const [id, outDir, ...rest] = process.argv.slice(2);
const frames = rest.flatMap((a) => a.split(/[\s,]+/)).filter(Boolean); // zsh passes "$FR" as one word
if (!id || !outDir || !frames.length) {
  console.error("usage: node scripts/stills.mjs <CompositionId> <outDir> <frame> [frame ...]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => {
    const c = enableTailwind(config);
    return { ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": path.resolve("src") } } };
  },
});
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, chromiumOptions });
for (const fr of frames.map(Number)) {
  const t = Date.now();
  await renderStill({ composition, serveUrl, frame: fr, output: path.join(outDir, `f${fr}.jpg`), imageFormat: "jpeg", jpegQuality: 88, puppeteerInstance: browser, chromiumOptions, overwrite: true });
  console.log(`f${fr} ${Date.now() - t} ms`);
}
await browser.close({ silent: true });
