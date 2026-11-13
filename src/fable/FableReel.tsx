import "./clock";
import React, { useLayoutEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TactileButton, TactileGlassWord, TactilePromptInput, TactileSwitch, TactileTabs } from "tactile-glass-ui";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { setClock } from "./clock";
import { F, HEADLINES, SCENES, SFX, VO } from "./timeline";

// Light theme on top of the kit's design tokens (the kit ships dark-first)
const K = {
  text: "#000",
  muted: "#6E7179",
  dim: "#A3A6AC",
  border: "rgba(0,0,0,0.08)",
  surface: "#FFFFFF",
  elevated: "rgba(0,0,0,0.045)",
  font: "var(--font-sans)",
  mono: "var(--font-mono)",
};

const tokens = {
  "--text-primary": K.text,
  "--text-secondary": K.muted,
  "--text-muted": K.dim,
  "--bg-elevated": K.elevated,
  "--bg-elevated-hover": "rgba(0,0,0,0.07)",
  "--bg-elevated-active": "rgba(0,0,0,0.1)",
  "--bg-surface": "rgba(255,255,255,0.9)",
  "--border-subtle": K.border,
} as React.CSSProperties;

// Shared Tactile glass preset (all Tactile components)
const GLASS = {
  refraction: 55,
  thickness: 24,
  bevelWidth: 9,
  frost: 32,
  dispersion: 5,
  sheen: 48,
  lightAngle: -46,
  rim: 100,
  fluidBrightness: 19,
  fluidSpeed: 15,
  fluidScale: 66,
  fluidAuraWidth: 32,
  fluidCenter: 31,
  hoverBrightness: 128,
  lightTrackingStrength: 81,
};

const pop = (frame: number, at: number, cfg = SPRING.bouncy) => {
  const t = springAt(frame, at, cfg);
  return {
    t,
    style: {
      opacity: Math.min(1, t * 1.6),
      transform: `translateY(${(1 - t) * 40}px) scale(${0.85 + 0.15 * t})`,
      filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 12)}px)` : undefined,
    } as React.CSSProperties,
  };
};

// Each scene springs in and blurs out at its boundaries
const sceneStyle = (frame: number, [a, b]: readonly [number, number]): React.CSSProperties => {
  const inT = a === 0 ? 1 : springAt(frame, a, SPRING.smooth);
  const out = progress(frame, b - 8, b + 3);
  return {
    opacity: Math.min(1, inT * 1.5) * (1 - out),
    transform: `translateY(${(1 - inT) * 60 - out * 40}px) scale(${1 - out * 0.06})`,
    filter: out > 0 || inT < 0.98 ? `blur(${Math.max(out * 18, (1 - Math.min(inT, 1)) * 14)}px)` : undefined,
  };
};

const visible = (frame: number, [a, b]: readonly [number, number]) => frame >= a - 2 && frame < b + 6;

const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

const Words: React.FC<{ text: string; frame: number; at: number; stagger?: number }> = ({ text, frame, at, stagger = 2 }) => (
  <>
    {text.split(" ").map((w, i, all) => {
      const t = springAt(frame, at + i * stagger, SPRING.smooth);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: i < all.length - 1 ? "0.24em" : 0,
            opacity: Math.min(1, t * 1.3),
            transform: `translateY(${(1 - t) * 30}px)`,
            filter: `blur(${Math.max(0, (1 - t) * 8)}px)`,
          }}
        >
          {w}
        </span>
      );
    })}
  </>
);

// Kinetic headline in the top safe zone; doubles as sound-off captions
const Headline: React.FC<{ frame: number }> = ({ frame }) => {
  const idx = HEADLINES.reduce((acc, h, i) => (frame >= h.from ? i : acc), -1);
  if (idx < 0) return null;
  const cur = HEADLINES[idx];
  const prev = HEADLINES[idx - 1];
  const fade = progress(frame, cur.from, cur.from + 5);
  const line = (text: string, style: React.CSSProperties, children: React.ReactNode) => (
    <Center y={300} style={style}>
      <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: "-0.04em", color: K.text, whiteSpace: "nowrap" }}>{children}</div>
    </Center>
  );
  return (
    <>
      {prev && prev.text && fade < 1 && line(prev.text, { opacity: 1 - fade, filter: `blur(${fade * 10}px)`, transform: `translateY(${-fade * 24}px)` }, prev.text)}
      {cur.text && line(cur.text, {}, <Words text={cur.text} frame={frame} at={cur.from} />)}
    </>
  );
};

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      background: K.surface,
      border: `1px solid ${K.border}`,
      borderRadius: 40,
      boxShadow: "0 40px 80px -40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.04)",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const word = pop(frame, at, SPRING.smooth);
  const glass = pop(frame, at + (F.introGlass - F.introWord), SPRING.bouncy);
  return (
    <div style={{ fontSize: 196, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: K.text, display: "flex", alignItems: "baseline", gap: "0.22em" }}>
      <span style={{ display: "inline-block", ...word.style }}>Fable</span>
      <span style={{ display: "inline-block", ...glass.style }}>
        <TactileGlassWord {...GLASS}>5.2</TactileGlassWord>
      </span>
    </div>
  );
};

/* ───────── Scenes ───────── */

const Intro: React.FC<{ frame: number }> = ({ frame }) => {
  const badge = pop(frame, 4, SPRING.smooth);
  const sub = pop(frame, F.introSub, SPRING.smooth);
  return (
    <>
      <Center y={640}>
        <div style={{ ...badge.style, padding: "14px 28px", borderRadius: 999, background: K.elevated, fontSize: 32, fontWeight: 500, color: K.muted, letterSpacing: "0.04em" }}>
          NEW MODEL
        </div>
      </Center>
      <Center y={760}>
        <Title frame={frame} at={F.introWord} />
      </Center>
      <Center y={1010}>
        <div style={{ ...sub.style, fontSize: 48, fontWeight: 500, color: K.muted, letterSpacing: "-0.015em" }}>The upgrade nobody asked for.</div>
      </Center>
    </>
  );
};

const FILES = ["auth.ts", "index.tsx", "utils.js", "Button.tsx", "api.py", "README.md", "styles.css", "package.json", "main.go", "todo.txt"];

const PromptScene: React.FC<{ frame: number }> = ({ frame }) => {
  const prompt = "fix one typo pls";
  const typed = prompt.slice(0, Math.round(prompt.length * progress(frame, F.typeStart, F.typeEnd)));
  const press = springAt(frame, F.submit, SPRING.snappy) * (1 - springAt(frame, F.submit + 6, SPRING.snappy));
  const panel = pop(frame, F.rewrite, SPRING.smooth);
  const work = ease.inOut(progress(frame, F.rewrite + 4, F.rust - 6));
  const done = frame >= F.rust;
  const stamp = pop(frame, F.rust, SPRING.bouncy);
  const files = Math.round(lerp(0, 48213, work));
  const scroll = Math.max(0, frame - F.rewrite) * 0.45;

  return (
    <>
      <Center y={560}>
        <div style={{ transform: `scale(${1.62 * (1 - press * 0.03)})`, transformOrigin: "top center" }}>
          <div style={{ width: 580 }}>
            <TactilePromptInput {...GLASS} value={typed} placeholder="Ask Fable 5.2 anything" agentLabel="Fable 5.2" modeLabel="Max effort" />
          </div>
        </div>
      </Center>
      {frame >= F.rewrite - 2 && (
        <Center y={980}>
          <Card style={{ ...panel.style, width: 930, padding: "44px 48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 600, color: K.text, letterSpacing: "-0.015em" }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  border: `4px solid ${done ? K.text : K.border}`,
                  borderTopColor: K.text,
                  transform: `rotate(${frame * 14}deg)`,
                  background: done ? K.text : "transparent",
                  boxSizing: "border-box",
                }}
              />
              <span style={{ flex: 1 }}>{done ? "Done. Your app is now 100% Rust." : "Rewriting your entire codebase…"}</span>
            </div>
            <div style={{ marginTop: 30, height: 12, borderRadius: 6, background: K.elevated, overflow: "hidden" }}>
              <div style={{ width: `${work * 100}%`, height: "100%", borderRadius: 6, background: K.text }} />
            </div>
            <div style={{ marginTop: 28, height: 168, overflow: "hidden", fontFamily: K.mono, fontSize: 28, color: K.muted, position: "relative" }}>
              <div style={{ transform: `translateY(${-(scroll % 42)}px)` }}>
                {Array.from({ length: 6 }, (_, i) => {
                  const f = FILES[(Math.floor(scroll / 42) + i) % FILES.length];
                  return (
                    <div key={i} style={{ height: 42, lineHeight: "42px", whiteSpace: "nowrap" }}>
                      <span style={{ color: K.dim }}>−</span> src/{f} <span style={{ color: K.dim }}>→</span> <span style={{ color: K.text }}>src/{f.split(".")[0]}.rs</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#fff 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, #fff 100%)" }} />
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 16, fontSize: 28, fontWeight: 500, color: K.muted, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ padding: "8px 18px", borderRadius: 999, background: K.elevated, color: K.text }}>{files.toLocaleString("en-US")} files</span>
              <span style={{ padding: "8px 18px", borderRadius: 999, background: K.elevated }}>typos fixed: 0</span>
            </div>
          </Card>
        </Center>
      )}
      {done && (
        <Center y={1500}>
          <div style={{ ...stamp.style, fontSize: 150, lineHeight: 1 }}>🦀</div>
        </Center>
      )}
    </>
  );
};

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

const ThinkScene: React.FC<{ frame: number }> = ({ frame }) => {
  const on = frame >= F.toggle;
  const knock = springAt(frame, F.toggle, SPRING.bouncy) * (1 - springAt(frame, F.toggle + 5, SPRING.smooth));
  const timer = pop(frame, F.timerStart - 10, SPRING.smooth);
  const elapsed = 40 * 60 * ease.in(progress(frame, F.timerStart, F.timerEnd));
  const tokens = Math.round(elapsed * 503);
  const hmm = pop(frame, F.hmm, SPRING.bouncy);
  const timerOut = progress(frame, F.hmm - 6, F.hmm + 6);
  const shimmer = ((frame * 2.2) % 160) - 30;

  return (
    <>
      <Center y={600}>
        <Card style={{ width: 860, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", color: K.text }}>Think Harder</div>
            <div style={{ fontSize: 30, color: K.muted, marginTop: 8 }}>{on ? "On · may take a while" : "Off"}</div>
          </div>
          <div style={{ width: 230, height: 124, display: "grid", placeItems: "center" }}>
            <div style={{ transform: `scale(${2.2 * (1 + knock * 0.06)})` }}>
              <TactileSwitch {...GLASS} checked={on} />
            </div>
          </div>
        </Card>
      </Center>
      {frame >= F.timerStart - 12 && (
        <Center y={900} style={{ opacity: 1 - timerOut, filter: timerOut > 0 ? `blur(${timerOut * 14}px)` : undefined }}>
          <div style={{ ...timer.style, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 500,
                backgroundImage: `linear-gradient(90deg, ${K.dim} ${shimmer - 30}%, ${K.text} ${shimmer}%, ${K.dim} ${shimmer + 30}%)`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Thinking…
            </div>
            <div style={{ fontSize: 230, fontWeight: 700, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", color: K.text, lineHeight: 1.1 }}>{fmt(elapsed)}</div>
            <div style={{ fontSize: 32, color: K.muted, fontVariantNumeric: "tabular-nums" }}>{tokens.toLocaleString("en-US")} reasoning tokens</div>
          </div>
        </Center>
      )}
      {frame >= F.hmm - 2 && (
        <Center y={980}>
          <div style={{ ...hmm.style, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
            <div style={{ fontSize: 30, fontWeight: 500, color: K.muted, marginLeft: 12 }}>Fable 5.2 · thought for 40m</div>
            <Card style={{ padding: "38px 70px", borderRadius: 64, borderBottomLeftRadius: 16 }}>
              <div style={{ fontSize: 170, fontWeight: 700, letterSpacing: "-0.05em", color: K.text, lineHeight: 1 }}>hmm.</div>
            </Card>
          </div>
        </Center>
      )}
    </>
  );
};

const WrongScene: React.FC<{ frame: number }> = ({ frame }) => {
  const answer = pop(frame, F.wrongIn + 4, SPRING.smooth);
  const strike = ease.out(progress(frame, F.wrongIn + 14, F.wrongIn + 30));
  const tabs = pop(frame, F.wrongIn, SPRING.smooth);
  const bubbles = [0, 1, 2, 3];
  return (
    <>
      <Center y={500}>
        <div style={{ ...tabs.style }}>
          <div style={{ transform: "scale(2)" }}>
            <TactileTabs {...GLASS} items={["Code", "Review", "Apologize"]} value={frame >= F.apologize ? "Apologize" : "Code"} />
          </div>
        </div>
      </Center>
      <Center y={690}>
        <Card style={{ ...answer.style, width: 860, padding: "34px 44px", display: "flex", alignItems: "center", gap: 28 }}>
          <span style={{ fontSize: 30, color: K.muted, fontWeight: 500 }}>Fable 5.2</span>
          <span style={{ position: "relative", fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", color: K.text, fontVariantNumeric: "tabular-nums" }}>
            2 + 2 = 5
            <span style={{ position: "absolute", left: -8, top: "52%", height: 7, borderRadius: 4, width: `calc(${strike * 100}% + 16px)`, background: "#FF3B30" }} />
          </span>
          <span style={{ marginLeft: "auto", fontSize: 30, fontWeight: 600, color: "#FF3B30", opacity: strike }}>wrong</span>
        </Card>
      </Center>
      {bubbles.map((i) => {
        const b = pop(frame, F.right + 10 + i * 20, SPRING.bouncy);
        if (b.t <= 0) return null;
        return (
          <Center key={i} y={900 + i * 150} style={{ transform: `translateX(${(i % 2 ? 1 : -1) * 70}px) rotate(${(i % 2 ? 1.5 : -1.5)}deg)` }}>
            <Card style={{ ...b.style, padding: "26px 40px", borderRadius: 999, fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", color: K.text, whiteSpace: "nowrap" }}>
              You're absolutely right!{i === 3 ? " 🙏" : ""}
            </Card>
          </Center>
        );
      })}
    </>
  );
};

const EndScene: React.FC<{ frame: number }> = ({ frame }) => {
  const sub = pop(frame, F.endSub, SPRING.smooth);
  const cta = pop(frame, F.endCta, SPRING.bouncy);
  const note = pop(frame, F.endCta + 14, SPRING.smooth);
  return (
    <>
      <Center y={700}>
        <Title frame={frame} at={F.endIn + 6} />
      </Center>
      <Center y={950}>
        <div style={{ ...sub.style, fontSize: 64, fontWeight: 600, color: K.text, letterSpacing: "-0.03em" }}>
          Point one better.<span style={{ color: K.dim }}>*</span>
        </div>
      </Center>
      <Center y={1110}>
        <div style={{ ...cta.style }}>
          <div style={{ transform: "scale(1.9)", transformOrigin: "top center" }}>
            <TactileButton {...GLASS}>Upgrade (it's the same)</TactileButton>
          </div>
        </div>
      </Center>
      <Center y={1420}>
        <div style={{ ...note.style, fontSize: 28, color: K.dim }}>*vs. Fable 5.1. Results may vary. They won't.</div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

const musicVolume = (f: number) => {
  const talking = VO.some((v) => f >= v.from - 6 && f < v.from + 150);
  const base = talking ? 0.1 : 0.2;
  // Comedic dead air under "hmm."
  const gag = 1 - progress(f, F.hmm - 10, F.hmm) * (1 - progress(f, F.wrongIn - 4, F.wrongIn + 6));
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [F.duration - 30, F.duration], [1, 0], { extrapolateLeft: "clamp" });
  return base * gag * fadeIn * fadeOut;
};

// Let the shared WebGL engine paint each frame before Remotion screenshots it
const useEnginePaint = (frame: number) => {
  const [warm] = useState(() => delayRender("tactile warmup"));
  useLayoutEffect(() => {
    const t = setTimeout(() => continueRender(warm), 600);
    return () => clearTimeout(t);
  }, [warm]);
  useLayoutEffect(() => {
    const h = delayRender(`tactile paint ${frame}`);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h)));
    return () => {
      cancelAnimationFrame(id);
      continueRender(h);
    };
  }, [frame]);
};

export const FableReel: React.FC = () => {
  const frame = useCurrentFrame();
  setClock(frame, 60);
  useEnginePaint(frame);

  const scene = (key: keyof typeof SCENES, El: React.FC<{ frame: number }>) =>
    visible(frame, SCENES[key]) && (
      <AbsoluteFill key={key} style={sceneStyle(frame, SCENES[key])}>
        <El frame={frame} />
      </AbsoluteFill>
    );

  return (
    <AbsoluteFill style={{ ...tokens, background: "#fff", color: K.text, fontFamily: K.font, WebkitFontSmoothing: "antialiased" }}>
      {scene("intro", Intro)}
      {scene("prompt", PromptScene)}
      {scene("think", ThinkScene)}
      {scene("wrong", WrongScene)}
      {scene("end", EndScene)}
      <Headline frame={frame} />

      <Audio src={staticFile("music/bed.mp3")} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.src} from={v.from} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
