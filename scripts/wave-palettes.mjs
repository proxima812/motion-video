// The cover's wave-gradient layer (Still "WaveLayer" = Cover background "shader-warp-cream") in every palette, as PNG.
// Palettes: the default violet + every reel palette `const T: Palette = {...}` found in src/v*/ (stops pale -> glow -> main).
//   bun scripts/wave-palettes.mjs [outDir=video/wave-palettes] [frame=0]   -> <outDir>/<NN>-<main>.png
// One bundle + one browser for all of them. Mirrors remotion.config.ts (Tailwind v4, "@/..." alias, ANGLE GL).
import path from "node:path";
import { mkdirSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

const outDir = process.argv[2] ?? "video/wave-palettes";
const frame = Number(process.argv[3] ?? 0);
mkdirSync(outDir, { recursive: true });

const palettes = [{ name: "00-default-6E33CC", colors: ["#f4eeff", "#b48cf2", "#6E33CC"] }];
const reels = readdirSync("src").filter((d) => /^v\d+$/.test(d)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
for (const d of reels) {
  const files = readdirSync(path.join("src", d)).filter((f) => f.endsWith(".tsx")).map((f) => path.join("src", d, f));
  for (const f of files) {
    const m = readFileSync(f, "utf8").match(/const T: Palette = \{([^}]*)\}/);
    if (!m) continue;
    const get = (k) => m[1].match(new RegExp(`${k}: "(#[0-9A-Fa-f]{6})"`))?.[1];
    const [pale, glow, main] = [get("pale"), get("glow"), get("main")];
    if (pale && glow && main) palettes.push({ name: `${d.slice(1)}-${main.slice(1)}`, colors: [pale, glow, main] });
    break;
  }
}

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => {
    const c = enableTailwind(config);
    return { ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": path.resolve("src") } } };
  },
});
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", { chromiumOptions });
for (const p of palettes) {
  const inputProps = { colors: p.colors };
  const composition = await selectComposition({ serveUrl, id: "WaveLayer", inputProps, puppeteerInstance: browser, chromiumOptions });
  const output = path.join(outDir, `${p.name}.png`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "png", inputProps, puppeteerInstance: browser, chromiumOptions, overwrite: true });
  console.log(p.name, p.colors.join(" "), existsSync(output) ? "ok" : "MISSING");
}
await browser.close({ silent: true });
