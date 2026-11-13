import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setChromiumOpenGlRenderer("angle"); // WebGL2 for tactile-glass-ui

// Tailwind v4 + "@/..." alias for shadcn / Remocn components
Config.overrideWebpackConfig((config) => {
  const c = enableTailwind(config);
  return {
    ...c,
    resolve: {
      ...c.resolve,
      alias: { ...(c.resolve?.alias ?? {}), "@": path.resolve(process.cwd(), "src") },
    },
  };
});
