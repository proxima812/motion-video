import { RU, Strings, makeAstroReel } from "../v9/Video9";
import { F, VO } from "./timeline";

// Video 10 - EN version of Video 9 (same scenes, EN strings and voice timings)
const EN: Strings = {
  ...RU,
  building: "Building...",
  unknown: "where did the time go?",
  phases: ["Vite plugins", "Markdown", "Page rendering", "Images", "Integrations"],
  pageGen: "Page generation",
  before: "before",
  after: "after",
  cores: "CPU cores",
  coreFree: "free",
  pages: "pages",
  build: "build",
  buildNote: "prerender and dev",
  runtime: "runtime",
  runtimeNote: "on-demand pages",
  cf: "Cloudflare: images on prerendered pages",
  extras: [
    { code: "notFound()", note: "404.astro for custom entrypoints" },
    { code: "getFontProperties()", note: "warns about unsupported fonts" },
    { code: "src/pages/3xx.astro", note: "custom redirect page" },
  ],
  required: "minimum",
  steps: ["Update Node", "Update Astro"],
  headlines: (F) => [
    { from: 6, text: "Most people don't know where build time goes" },
    { from: F.timingsIn + 6, text: "Astro 7.4: the --timings flag" },
    { from: F.promiseIn + 6, text: "Promise.all() and nearly 2x faster" },
    { from: F.parallelIn + 6, text: "Prerendering in worker threads" },
    { from: F.imagesIn + 6, text: "Two image services" },
    { from: F.extrasIn + 6, text: "Three more small things" },
    { from: F.nodeIn + 6, text: "Before you upgrade" },
  ],
};

export const Video10 = makeAstroReel(F, VO, EN);
