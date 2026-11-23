import React from "react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, Vo, count, pop } from "../kit/reel";
import { F as F9, VO as VO9 } from "./timeline";

// "Astro 7.4": shared by Video9 (RU) and Video10 (EN)
type T = typeof F9;

export const RU = {
  building: "Сборка...",
  unknown: "куда ушло время?",
  phases: ["Vite-плагины", "Markdown", "Рендер страниц", "Картинки", "Интеграции"],
  pageGen: "Генерация страниц",
  before: "до",
  after: "после",
  cores: "ядра CPU",
  coreFree: "свободно",
  pages: "страниц",
  build: "сборка",
  buildNote: "пререндер и dev",
  runtime: "рантайм",
  runtimeNote: "страницы по запросу",
  cf: "Cloudflare: картинки на пререндеренных страницах",
  extras: [
    { code: "notFound()", note: "404.astro для своих entrypoint" },
    { code: "getFontProperties()", note: "предупреждение о неверных шрифтах" },
    { code: "src/pages/3xx.astro", note: "своя страница редиректа" },
  ],
  required: "минимум",
  steps: ["Обнови Node", "Обнови Astro"],
  headlines: (F: T) => [
    { from: 6, text: "Большинство не понимает, куда уходит время сборки" },
    { from: F.timingsIn + 6, text: "Astro 7.4: флаг --timings" },
    { from: F.promiseIn + 6, text: "Promise.all() и почти вдвое быстрее" },
    { from: F.parallelIn + 6, text: "Пререндер в воркерах" },
    { from: F.imagesIn + 6, text: "Два сервиса картинок" },
    { from: F.extrasIn + 6, text: "И еще три мелочи" },
    { from: F.nodeIn + 6, text: "Перед обновлением" },
  ],
};

export type Strings = typeof RU;

const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: K.mono, ...style }}>{children}</span>
);

const Term: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <Card style={{ width: 920, background: "#111216", color: "#fff", padding: "30px 40px 40px", border: "none", ...style }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
      ))}
    </div>
    {children}
  </Card>
);

const typed = (s: string, frame: number, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((frame - at) * cps)));

/* ───────── Scenes ───────── */

// 1. Hook: build runs, the clock ticks, nobody knows why
const Hook = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const term = pop(frame, 2, SPRING.smooth);
  const bar = ease.out(progress(frame, 10, F.timingsIn - 20)) * 0.82;
  const sec = (frame / 60) * 1.7;
  const q = pop(frame, F.hookQ, SPRING.bouncy);
  return (
    <>
      <Center y={520}>
        <Term style={term.style}>
          <Mono style={{ fontSize: 40 }}>
            <span style={{ color: "#8B8D98" }}>$ </span>astro build
          </Mono>
          <div style={{ fontSize: 34, color: "#8B8D98", marginTop: 30, fontFamily: K.mono }}>{S.building}</div>
          <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.1)", marginTop: 20, overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", background: K.accent, borderRadius: 11 }} />
          </div>
        </Term>
      </Center>
      <Center y={960}>
        <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{sec.toFixed(1)}s</div>
      </Center>
      <Center y={1200}>
        <div style={q.style}>
          <Pill style={{ fontSize: 40, padding: "16px 34px", color: K.text }}>{S.unknown}</Pill>
        </div>
      </Center>
    </>
  );
};

// 2. --timings: the same build, now broken down by phase
const WIDTHS = [0.42, 0.18, 0.86, 0.55, 0.12];
const Timings = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const cmd = "astro build --timings";
  return (
    <Center y={480}>
      <Term>
        <Mono style={{ fontSize: 40 }}>
          <span style={{ color: "#8B8D98" }}>$ </span>
          {typed(cmd, frame, F.timingsIn + 150, 0.5)}
          <span style={{ opacity: frame % 40 < 20 ? 1 : 0 }}>▍</span>
        </Mono>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 26 }}>
          {S.phases.map((p, i) => {
            const at = F.phases + i * 14;
            const t = springAt(frame, at, SPRING.smooth);
            const w = ease.out(progress(frame, at, at + 30)) * WIDTHS[i];
            const s = (WIDTHS[i] * 2.4).toFixed(2);
            return (
              <div key={p} style={{ opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 20}px)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, marginBottom: 10 }}>
                  <span>{p}</span>
                  <Mono style={{ color: i === 2 ? K.accent : "#8B8D98" }}>{s}s</Mono>
                </div>
                <div style={{ height: 18, borderRadius: 9, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: `${w * 100}%`, height: "100%", borderRadius: 9, background: i === 2 ? K.accent : "rgba(255,255,255,0.55)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Term>
    </Center>
  );
};

// 3. Promise.all: sequential awaits collapse into one, 2.10s -> 1.13s
const PromiseAll = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const code = pop(frame, F.promiseIn + 4, SPRING.smooth);
  const morph = ease.inOut(progress(frame, F.promise - 6, F.promise + 18));
  const bars = pop(frame, F.cut - 10, SPRING.smooth);
  const shrink = ease.inOut(progress(frame, F.cut, F.cut + 40));
  const ms = lerp(2.1, 1.13, shrink);
  const half = pop(frame, F.half, SPRING.bouncy);
  const line = (s: string, o: number) => <div style={{ opacity: o, height: 54 * o, overflow: "hidden" }}>{s}</div>;
  return (
    <>
      <Center y={440}>
        <Term style={{ ...code.style, padding: "28px 40px 34px" }}>
          <Mono style={{ fontSize: 34, lineHeight: "54px" }}>
            {line("const a = await getPosts();", 1 - morph)}
            {line("const b = await getTags();", 1 - morph)}
            {line("const [a, b] = await", morph)}
            {line("  Promise.all([getPosts(), getTags()]);", morph)}
          </Mono>
        </Term>
      </Center>
      <Center y={780}>
        <Card style={{ ...bars.style, width: 920, padding: "36px 44px" }}>
          <div style={{ fontSize: 34, fontWeight: 600, marginBottom: 24 }}>{S.pageGen}</div>
          {[
            { l: S.before, v: 2.1, c: K.dim },
            { l: S.after, v: ms, c: K.accent },
          ].map((b) => (
            <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
              <span style={{ width: 120, fontSize: 30, color: K.muted }}>{b.l}</span>
              <div style={{ flex: 1, height: 44, borderRadius: 14, background: K.elevated }}>
                <div style={{ width: `${(b.v / 2.1) * 100}%`, height: "100%", borderRadius: 14, background: b.c }} />
              </div>
              <Mono style={{ width: 130, textAlign: "right", fontSize: 34, fontWeight: 600 }}>{b.v.toFixed(2)}s</Mono>
            </div>
          ))}
        </Card>
      </Center>
      <Center y={1150}>
        <div style={{ ...half.style, fontSize: 230, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 }}>
          <span style={{ color: K.accent }}>−46%</span>
        </div>
      </Center>
    </>
  );
};

// 4. parallelPrerender: pages fan out across all cores but one
const Parallel = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.parallelIn + 4, SPRING.smooth);
  const n = 8;
  const pages = count(frame, F.workers, F.parallelEnd, 0, 1240, ease.inOut);
  return (
    <>
      <Center y={430}>
        <div style={card.style}>
          <Pill style={{ fontSize: 34, padding: "14px 30px", color: K.text, fontFamily: K.mono }}>experimental.parallelPrerender</Pill>
        </div>
      </Center>
      <Center y={560}>
        <Card style={{ ...card.style, width: 920, padding: 40, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {Array.from({ length: n }, (_, i) => {
            const free = i === n - 1;
            const on = !free && frame >= F.workers + i * 5;
            const lit = on ? 0.55 + 0.45 * Math.abs(Math.sin((frame + i * 17) / 9)) : 0;
            return (
              <div key={i} style={{ height: 170, borderRadius: 24, background: free ? K.elevated : `rgba(255,106,19,${0.12 + lit * 0.8})`, display: "grid", placeItems: "center", border: free && frame >= F.cores ? `3px dashed ${K.dim}` : "3px solid transparent" }}>
                <Mono style={{ fontSize: 30, fontWeight: 600, color: free ? K.muted : on ? "#fff" : K.muted }}>{free ? S.coreFree : `#${i + 1}`}</Mono>
              </div>
            );
          })}
        </Card>
      </Center>
      <Center y={1080}>
        <div style={{ ...card.style, display: "flex", alignItems: "baseline", gap: 20 }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{pages}</span>
          <span style={{ fontSize: 44, fontWeight: 600, color: K.muted }}>{S.pages}</span>
        </div>
      </Center>
      <Center y={1290}>
        <Pill style={{ fontSize: 32, opacity: frame >= F.cores ? 1 : 0 }}>7 / 8 {S.cores}</Pill>
      </Center>
    </>
  );
};

// 5. Split image services: build vs runtime, plus Cloudflare
const Images = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const root = pop(frame, F.imagesIn + 4, SPRING.smooth);
  const split = ease.inOut(progress(frame, F.split, F.split + 24));
  const cf = pop(frame, F.cf, SPRING.bouncy);
  const branch = (label: string, note: string, code: string, side: -1 | 1) => (
    <Card style={{ position: "absolute", left: 540 - 215 + side * 230 * split, top: 300 + split * 40, width: 430, padding: "30px 32px", opacity: split, textAlign: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, color: K.muted, marginTop: 6 }}>{note}</div>
      <Mono style={{ display: "block", fontSize: 24, marginTop: 16, color: K.accent }}>{code}</Mono>
    </Card>
  );
  return (
    <div style={{ position: "absolute", inset: 0, top: 120 }}>
      <Center y={330}>
        <Card style={{ ...root.style, padding: "26px 40px" }}>
          <Mono style={{ fontSize: 40, fontWeight: 600 }}>image.service</Mono>
        </Card>
      </Center>
      <svg width={1080} height={300} style={{ position: "absolute", top: 430, left: 0, opacity: split }}>
        <path d={`M540 0 C540 120 ${540 - 230} 80 ${540 - 230} 240`} stroke={K.dim} strokeWidth={4} fill="none" />
        <path d={`M540 0 C540 120 ${540 + 230} 80 ${540 + 230} 240`} stroke={K.dim} strokeWidth={4} fill="none" />
      </svg>
      <div style={{ position: "absolute", inset: 0, top: 380 }}>
        {branch(S.build, S.buildNote, "build: sharp", -1)}
        {branch(S.runtime, S.runtimeNote, "runtime: ...", 1)}
      </div>
      {frame >= F.cf - 2 && (
        <Center y={1060}>
          <Card style={{ ...cf.style, width: 900, padding: "30px 40px", display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ fontSize: 80 }}>☁️</div>
            <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.2 }}>{S.cf}</div>
          </Card>
        </Center>
      )}
    </div>
  );
};

// 6. Three smaller changes, one per beat
const Extras = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const at = [F.e1, F.e2, F.e3];
  return (
    <>
      {S.extras.map((e, i) => {
        const p = pop(frame, at[i] - 4, SPRING.smooth);
        if (p.t <= 0) return null;
        return (
          <Center key={e.code} y={470 + i * 270}>
            <Card style={{ ...p.style, width: 920, padding: "34px 44px" }}>
              <Mono style={{ fontSize: 44, fontWeight: 600 }}>{e.code}</Mono>
              <div style={{ fontSize: 32, color: K.muted, marginTop: 10 }}>{e.note}</div>
            </Card>
          </Center>
        );
      })}
    </>
  );
};

// 7. Node 22.22.0 first, then Astro
const NodeReq = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const big = pop(frame, F.node, SPRING.bouncy);
  const at = [F.first, F.astro];
  return (
    <>
      <Center y={430}>
        <div style={{ ...big.style, textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 600, color: K.muted, marginBottom: 10 }}>Node.js · {S.required}</div>
          <div style={{ fontSize: 210, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 }}>
            22.22
          </div>
        </div>
      </Center>
      {S.steps.map((s, i) => {
        const p = pop(frame, at[i] - 4, SPRING.smooth);
        const done = frame >= at[i] + 30;
        if (p.t <= 0) return null;
        return (
          <Center key={s} y={900 + i * 170}>
            <Card style={{ ...p.style, width: 860, padding: "30px 40px", display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, flex: "none", display: "grid", placeItems: "center", fontSize: 34, fontWeight: 700, color: "#fff", background: done ? K.green : K.text }}>{done ? "✓" : i + 1}</div>
              <div style={{ fontSize: 44, fontWeight: 600 }}>{s}</div>
            </Card>
          </Center>
        );
      })}
      <Center y={1270}>
        <Mono style={{ fontSize: 34, color: K.muted, opacity: progress(frame, F.astro + 10, F.astro + 24) }}>npx @astrojs/upgrade</Mono>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

export const makeAstroReel = (F: T, VO: Vo[], S: Strings): React.FC => {
  const scenes = [
    { range: [0, F.timingsIn] as const, El: Hook(F, S) },
    { range: [F.timingsIn, F.promiseIn] as const, El: Timings(F, S) },
    { range: [F.promiseIn, F.parallelIn] as const, El: PromiseAll(F, S) },
    { range: [F.parallelIn, F.imagesIn] as const, El: Parallel(F, S) },
    { range: [F.imagesIn, F.extrasIn] as const, El: Images(F, S) },
    { range: [F.extrasIn, F.nodeIn] as const, El: Extras(F, S) },
    { range: [F.nodeIn, F.duration + 30] as const, El: NodeReq(F, S) },
  ];
  const sfx = [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.25 },
    { src: "sfx2/pop.mp3", from: F.hookQ, volume: 0.35 },
    ...[F.timingsIn, F.promiseIn, F.parallelIn, F.imagesIn, F.extrasIn, F.nodeIn].map((f) => ({ src: "sfx2/whoosh.mp3", from: f - 8, volume: 0.4 })),
    { src: "sfx2/typing.mp3", from: F.timingsIn + 150, volume: 0.4 },
    ...[0, 1, 2, 3, 4].map((i) => ({ src: "sfx2/click.mp3", from: F.phases + i * 14, volume: 0.35 })),
    { src: "sfx/04_Cyber_Shift.wav", from: F.promise - 6, volume: 0.2 },
    { src: "sfx2/ding.mp3", from: F.half, volume: 0.4 },
    ...Array.from({ length: 7 }, (_, i) => ({ src: "sfx2/click.mp3", from: F.workers + i * 5, volume: 0.25 })),
    { src: "sfx/01_Ripple_Textures.wav", from: F.split, volume: 0.2 },
    { src: "sfx2/pop.mp3", from: F.cf, volume: 0.4 },
    ...[F.e1, F.e2, F.e3].map((f) => ({ src: "sfx2/pop.mp3", from: f - 4, volume: 0.35 })),
    { src: "sfx/03_Basscrack.wav", from: F.node, volume: 0.25 },
    { src: "sfx2/ding.mp3", from: F.first + 30, volume: 0.35 },
    { src: "sfx2/ding.mp3", from: F.astro + 30, volume: 0.35 },
  ];
  const C: React.FC = () => <ReelShell scenes={scenes} headlines={S.headlines(F)} headlineSize={76} vo={VO} sfx={sfx} duration={F.duration} shift={110} />;
  return C;
};

export const Video9 = makeAstroReel(F9, VO9, RU);
