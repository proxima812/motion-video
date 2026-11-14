import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { INTER } from "../kit/design";
import { TEX, type TexName } from "./tex";

// Dark neon kit for video 20 (the one dark reel: black, neon blue, white, violet; red only for ERROR).
export const { fontFamily: MONO_FAMILY, waitUntilDone: monoReady } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });
export const MONO = `${MONO_FAMILY}, monospace`;
export const NUM = `${INTER}, sans-serif`;

export const C = {
  bg: "#000",
  white: "#FFFFFF",
  ink: "#E9EEFF",
  blue: "#2F8CFF",
  cyan: "#6AD8FF",
  deep: "#1A4BFF",
  violet: "#A35BFF",
  lilac: "#D2B6FF",
  red: "#FF2E4D",
  dim: "rgba(233,238,255,0.5)",
  faint: "rgba(233,238,255,0.16)",
};
export const W = 1080;
export const H = 1920;

export type ShotProps = { f: number; d: number };
export type Shot = React.FC<ShotProps>;

/* ───────── deterministic noise ───────── */

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeIn = (t: number) => Math.pow(clamp01(t), 3);

/* ───────── 3D ───────── */

export type V3 = [number, number, number];
export const rotX = ([x, y, z]: V3, a: number): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
export const rotY = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
export const rotZ = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
/** Perspective projection to the frame; returns [x, y, scale]. */
export const proj = ([x, y, z]: V3, cam = 1600, cx = W / 2, cy = H / 2): [number, number, number] => {
  const s = cam / Math.max(1, cam + z);
  return [cx + x * s, cy + y * s, s];
};

/* ───────── canvas (draws after fonts are ready, holds the frame until painted) ───────── */

const fontsReady = Promise.all([monoReady(), document.fonts.ready]);

export const Canvas: React.FC<{ draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; w?: number; h?: number; style?: React.CSSProperties }> = ({ draw, w = W, h = H, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const handle = delayRender("v20 canvas");
    let alive = true;
    fontsReady.then(() => {
      const ctx = ref.current?.getContext("2d");
      if (alive && ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h);
      }
      continueRender(handle);
    });
    return () => {
      alive = false;
    };
  });
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }} />;
};

/* ───────── TeX (pre-rendered MathJax SVG) ───────── */

/** em = font size in px (MathJax units: 1000 per em). */
export const Tex: React.FC<{ n: TexName; em: number; color?: string; style?: React.CSSProperties }> = ({ n, em, color = C.white, style }) => {
  const { vb, body } = TEX[n];
  const [, , vw, vh] = vb.split(" ").map(Number);
  return <svg viewBox={vb} width={(vw * em) / 1000} height={(vh * em) / 1000} style={{ color, overflow: "visible", display: "block", ...style }} dangerouslySetInnerHTML={{ __html: body }} />;
};
export const texSize = (n: TexName, em: number) => {
  const [, , vw, vh] = TEX[n].vb.split(" ").map(Number);
  return { w: (vw * em) / 1000, h: (vh * em) / 1000 };
};
/** Biggest em (<= maxEm) that keeps the formula within maxW px. */
export const fitEm = (n: TexName, maxW: number, maxEm: number) => Math.min(maxEm, (maxW * 1000) / Number(TEX[n].vb.split(" ")[2]));

/* ───────── glow ───────── */

export const glow = (color: string, r = 10, k = 1) => `drop-shadow(0 0 ${r * 0.4}px ${color}) drop-shadow(0 0 ${r * 1.6}px ${color}${k < 1 ? "99" : ""})`;
export const textGlow = (color: string, r = 14) => `0 0 ${r * 0.35}px ${color}, 0 0 ${r}px ${color}AA, 0 0 ${r * 2.4}px ${color}55`;

export const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

/** Soft colored haze behind the subject (gives the black some depth). */
export const Haze: React.FC<{ color?: string; x?: number; y?: number; r?: number; a?: number }> = ({ color = C.deep, x = 50, y = 50, r = 60, a = 0.22 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${color}${Math.round(a * 255).toString(16).padStart(2, "0")} 0%, transparent ${r}%)` }} />
);

/** Fine blueprint grid. */
export const Grid: React.FC<{ step?: number; color?: string; a?: number; shift?: number }> = ({ step = 60, color = "47,140,255", a = 0.1, shift = 0 }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(rgba(${color},${a}) 1px, transparent 1px), linear-gradient(90deg, rgba(${color},${a}) 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
      backgroundPosition: `${shift}px ${shift}px`,
      maskImage: "radial-gradient(circle at 50% 50%, #000 30%, transparent 80%)",
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 30%, transparent 80%)",
    }}
  />
);

/** Tiny corner telemetry (mono, dim) - instrument chrome, not titles. */
export const Hud: React.FC<{ f: number; tl?: string; tr?: string; bl?: string; br?: string; color?: string }> = ({ f, tl, tr, bl, br, color = C.dim }) => {
  const s: React.CSSProperties = { position: "absolute", fontFamily: MONO, fontSize: 24, color, letterSpacing: "0.04em", whiteSpace: "pre" };
  const tick = (t?: string) => t?.replace("#", String(1000 + ((f * 37) % 9000)));
  return (
    <AbsoluteFill>
      {tl && <div style={{ ...s, left: 70, top: 120 }}>{tick(tl)}</div>}
      {tr && <div style={{ ...s, right: 70, top: 120, textAlign: "right" }}>{tick(tr)}</div>}
      {bl && <div style={{ ...s, left: 70, bottom: 120 }}>{tick(bl)}</div>}
      {br && <div style={{ ...s, right: 70, bottom: 120, textAlign: "right" }}>{tick(br)}</div>}
    </AbsoluteFill>
  );
};

/* ───────── code ───────── */

export type Lang = "py" | "cpp" | "rs" | "json" | "sh" | "cu";
const KW: Record<Lang, string[]> = {
  py: "import from as class def return if else elif for in while with not and or None True False self lambda yield pass raise try except super".split(" "),
  cpp: "template typename struct class const constexpr return for if else auto void float int size_t using namespace static inline unsigned std operator include pragma omp parallel".split(" "),
  cu: "__global__ __shared__ __syncthreads __device__ const float int void for if return dim3 blockIdx threadIdx blockDim gridDim unsigned".split(" "),
  rs: "use fn let mut pub impl for in if else match return Ok Err Some None struct enum self Self where unsafe move as dyn".split(" "),
  json: [],
  sh: [],
};
const TYPES = /^(f32|f64|u8|usize|i64|Tensor|Result|Error|Layer|Linear|Vec|float|int|T|N|Module|Attention|Transformer|DataLoader|nn|torch|F|math|std|vector|array|half|bf16)$/;
const TOKEN = /(#.*$|\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?f?\b|[A-Za-z_]\w*|\s+|.)/g;

export const tokenize = (line: string, lang: Lang) => {
  const out: { t: string; c: string; b?: boolean }[] = [];
  const kw = KW[lang];
  const parts = line.match(TOKEN) ?? [];
  parts.forEach((t, i) => {
    let c = C.ink;
    let b = false;
    if ((lang === "py" && t.startsWith("#")) || t.startsWith("//")) c = "rgba(233,238,255,0.34)";
    else if (t.startsWith("#")) c = C.violet;
    else if (/^["']/.test(t)) c = lang === "json" && parts.slice(i + 1).join("").trimStart().startsWith(":") ? C.cyan : C.lilac;
    else if (/^(0x|\d)/.test(t)) c = C.cyan;
    else if (kw.includes(t)) (c = C.blue), (b = true);
    else if (TYPES.test(t)) c = C.cyan;
    else if (/^[A-Za-z_]\w*$/.test(t) && parts[i + 1] === "(") c = C.white, (b = true);
    else if (/^[{}()[\]<>;,.:=+\-*/%&|!@^~?]$/.test(t)) c = "rgba(233,238,255,0.55)";
    out.push({ t, c, b });
  });
  return out;
};

export const Code: React.FC<{ src: string; lang: Lang; size?: number; lh?: number; x?: number; y?: number; num?: number | false; hl?: number; style?: React.CSSProperties }> = ({ src, lang, size = 34, lh = 1.5, x = 70, y = 160, num = 1, hl, style }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontSize: size, lineHeight: lh, whiteSpace: "pre", textShadow: "0 0 12px rgba(47,140,255,0.28)", ...style }}>
    {src.split("\n").map((line, i) => (
      <div key={i} style={{ display: "flex", background: hl === i ? "rgba(47,140,255,0.16)" : undefined, boxShadow: hl === i ? `inset 4px 0 0 ${C.blue}` : undefined }}>
        {num !== false && <span style={{ width: size * 2.2, color: "rgba(233,238,255,0.24)", textAlign: "right", marginRight: size * 0.9, flexShrink: 0 }}>{num + i}</span>}
        <span>
          {tokenize(line, lang).map((tk, j) => (
            <span key={j} style={{ color: tk.c, fontWeight: tk.b ? 700 : 400 }}>
              {tk.t}
            </span>
          ))}
        </span>
      </div>
    ))}
  </div>
);
