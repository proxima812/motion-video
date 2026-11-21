import React from "react";
import { AbsoluteFill } from "remotion";
import { Mic, Pause, Play, User } from "lucide-react";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { K, ReelShell, type Range, type SceneDef, type Sfx, type Vo } from "./reel";
import { TatDuo, type DuoHost, type Turn } from "./TatDuo";
import type { AvatarKey, Emotion, SpokenWord } from "./TatAvatar";
import { DotOrbitBg, type DotOrbitVariant } from "./DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "./design";
import { Mark, Strike } from "../catalog/own/text";

const STRIKE_RED = K.red;

// @the_tatarverse "talk" series (gender war, adult serious tone, a moral at the end): a man's voice message
// (no avatar, a Telegram-like voice bubble) that Ahu and Alicja listen to, then their dialog about it.
// Both hosts stay on screen (TatDuo): Ahu left, Alicja right; while the voice message plays both listen.
// Voice + timings: scripts/talk.py N gen|build -> src/vN/lines.ts (LINES). Scenes find their beats by word: at(L, 3, "тенденциях").

export type Who = "ahu" | "alicja" | "man";
export type Line = { src: string; who: Who; from: number; dur: number; words: { f: number; w: string }[] };

/** Frame of the n-th `word` in line `i` (1-based): case-insensitive exact match, else prefix match */
export const at = (lines: Line[], i: number, word: string, nth = 0) => {
  const w = word.toLowerCase();
  const ws = lines[i - 1].words;
  const exact = ws.filter((x) => x.w.toLowerCase() === w);
  const hits = exact.length ? exact : ws.filter((x) => x.w.toLowerCase().startsWith(w));
  if (!hits[nth]) throw new Error(`talk: no "${word}" #${nth} in line ${i}`);
  return hits[nth].f;
};
/** Start of line i (1-based) */
export const lineAt = (lines: Line[], i: number) => lines[i - 1].from;
export const lineEnd = (lines: Line[], i: number) => lines[i - 1].from + lines[i - 1].dur;

const turnsOf = (lines: Line[]): Turn[] => lines.map((l) => ({ from: l.from, who: l.who === "ahu" ? 0 : l.who === "alicja" ? 1 : -1 }));
const voOf = (lines: Line[]): Vo[] => lines.map(({ src, from, dur }) => ({ src, from, dur }));
const wordsOf = (lines: Line[], who: Who): SpokenWord[] => lines.filter((l) => l.who === who).flatMap((l) => l.words);
const nods = (frames: number[]): SpokenWord[] => frames.map((f) => ({ f, w: "" }));

/** Accent triple + light neutrals, one palette per reel (the cover takes it too) */
export type Palette = { main: string; vivid: string; glow: string; pale: string; plate: string; gray: string; muted: string };
const Ctx = React.createContext<Palette | null>(null);
export const usePalette = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("talk: no palette");
  return c;
};

// Photos differ in framing: scale the wide ones so every photo fills the 540x590 box by height (as in V49-V51)
const SIZE_AHU: Record<string, [number, number]> = { "arms-crossed": [1312, 1199], clapping: [1278, 1230], delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1217], explaining: [1312, 1199], facepalm: [1312, 1199], "hand-on-heart": [1312, 1199], "heart-hands": [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], listening: [1312, 1199], pensive: [1312, 1199], "point-down": [1312, 1199], "point-right": [1312, 1199], "point-up": [1312, 1199], "present-left": [1312, 1199], puzzled: [1152, 1366], shrug: [1312, 1199], shush: [1312, 1199], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1218, 1291], stop: [1312, 1199], surprised: [1280, 1229], thinking: [1190, 1322], "thumbs-up": [1312, 1199], victory: [1312, 1199], waving: [1312, 1199] };
const SIZE_ALICJA: Record<string, [number, number]> = { "arms-crossed": [1199, 1312], clapping: [1312, 1199], delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1216], explaining: [1312, 1199], facepalm: [1312, 1199], "hand-on-heart": [1312, 1199], "heart-hands": [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], listening: [1312, 1199], pensive: [1129, 1393], "point-down": [1312, 1199], "point-right": [1312, 1199], "point-up": [1312, 1199], "present-left": [1312, 1199], puzzled: [1129, 1393], shrug: [1312, 1199], shush: [1199, 1312], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1164, 1351], stop: [1312, 1199], surprised: [1280, 1229], thinking: [1129, 1393], "thumbs-up": [1312, 1199], victory: [1312, 1199], waving: [1312, 1199] };
const fitOf = (size: Record<string, [number, number]>) => Object.fromEntries(Object.entries(size).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;
const FIT_AHU = fitOf(SIZE_AHU);
const FIT_ALICJA = fitOf(SIZE_ALICJA);

/* ───────── Text ───────── */

type Tok = { raw: string; kind: "plain" | "key" | "mark" | "strike" };
// *key* = Inter 700 in the accent, _mark_ = Mark selection in the accent, ~strike~ = Strike (red, cross); a span may cover several words
const tokens = (text: string): Tok[] => {
  let open: Tok["kind"] = "plain";
  const sym: Record<string, Tok["kind"]> = { "*": "key", _: "mark", "~": "strike" };
  return text.split(" ").map((w) => {
    const first = sym[w[0]];
    const kind = open !== "plain" ? open : first ?? "plain";
    const last = w[w.length - 1];
    if (open === "plain" && first && !(w.length > 1 && last === w[0])) open = first;
    else if (open !== "plain" && sym[last] === open) open = "plain";
    return { raw: w.replace(/[*_~]/g, ""), kind };
  });
};

/** Heading: Inter 400; `at` = one start (stagger) or a start per word; marks and strikes run from their word's start + 6 */
export const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at: when, stagger = 3, size = 84, top = 170, style }) => {
  const T = usePalette();
  return (
    <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
      {tokens(text).map(({ raw, kind }, i, all) => {
        const a = Array.isArray(when) ? when[Math.min(i, when.length - 1)] : when + i * stagger;
        const t = springAt(frame, a, SPRING.smooth);
        // a struck span of several words gets one cross, after its last word
        const crossed = kind === "strike" && all[i + 1]?.kind !== "strike";
        const word = kind === "mark" ? <Mark frame={frame} at={a + 6} color={T.main}>{raw}</Mark> : kind === "strike" ? crossed ? <Strike frame={frame} at={a + 6}>{raw}</Strike> : <Mark frame={frame} at={a + 6} color={STRIKE_RED}>{raw}</Mark> : raw;
        return (
          <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: kind === "key" ? 700 : 400, color: kind === "key" ? T.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const fadeOut = (frame: number, a: number, len = 10) => 1 - progress(frame, a, a + len);
/** Pop-in style from `a`; base = a transform kept in front (e.g. "translateX(-50%)" for centered blocks) */
export const appear = (frame: number, a: number, cfg = SPRING.smooth, base = "") => {
  const t = springAt(frame, a, cfg);
  return { opacity: Math.min(1, t * 1.4), transform: `${base} translateY(${(1 - t) * 40}px) scale(${0.94 + 0.06 * Math.min(t, 1)})` } as React.CSSProperties;
};

/* ───────── Pieces ───────── */

/** Round face: a colored circle with two eyes and a smile (smile < 0 = sad) */
export const Face: React.FC<{ color: string; size: number; smile?: number; style?: React.CSSProperties }> = ({ color, size, smile = 0.6, style }) => (
  <div style={{ position: "absolute", width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: "50%", background: color, ...style }}>
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
      <circle cx={36} cy={42} r={6} fill="#fff" />
      <circle cx={64} cy={42} r={6} fill="#fff" />
      <path d={`M32 ${66 - smile * 4} Q50 ${66 + smile * 14} 68 ${66 - smile * 4}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

/** Gray text bar (instead of real words in mockups) */
export const Bar: React.FC<{ w: number | string; h?: number; c?: string; style?: React.CSSProperties }> = ({ w, h = 16, c, style }) => {
  const T = usePalette();
  return <div style={{ width: w, height: h, borderRadius: h / 2, background: c ?? T.gray, ...style }} />;
};

const WAVE = Array.from({ length: 34 }, (_, i) => 0.28 + 0.72 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.63 + 1)));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Telegram-like voice message: play button, waveform filling with the playback, timer; ripples while playing.
 * at = it pops in, play = [start, end] of the man's line (the waveform plays then), y = top. */
export const VoiceNote: React.FC<{ frame: number; at: number; play: Range; y?: number; scale?: number; label?: string }> = ({ frame, at: a, play, y = 560, scale = 1, label = "Голосовое" }) => {
  const T = usePalette();
  const [p0, p1] = play;
  const p = progress(frame, p0, p1);
  const playing = frame >= p0 && frame < p1;
  const press = springAt(frame, p0 - 6, SPRING.bouncy);
  const secs = Math.round((p1 - p0) / 60);
  const t = clock(playing || p > 0 ? p * secs : secs);
  return (
    <div style={{ position: "absolute", left: 540 - 430, top: y, width: 860, ...appear(frame, a, SPRING.bouncy), scale: String(scale), transformOrigin: "50% 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, marginLeft: 8 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.pale, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={36} color={T.main} strokeWidth={2.2} />
        </div>
        <div style={{ ...PARAGRAPH, fontSize: 36, color: T.muted }}>{label}</div>
      </div>
      <div style={{ ...SURFACE, display: "flex", alignItems: "center", gap: 30, padding: 36, width: 860, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: 128, height: 128, flex: "none" }}>
          {playing &&
            [0, 1].map((k) => {
              const r = ((frame - p0 + k * 30) % 60) / 60;
              return <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${T.glow}`, transform: `scale(${1 + r * 0.45})`, opacity: 1 - r }} />;
            })}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: T.plate, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.08 * Math.sin(Math.min(1, press) * Math.PI)})` }}>
            {playing ? <Pause size={56} color="#fff" fill="#fff" /> : <Play size={56} color="#fff" fill="#fff" style={{ marginLeft: 8 }} />}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, height: 110 }}>
            {WAVE.map((hgt, i) => {
              const done = (i + 0.5) / WAVE.length <= p;
              const live = playing ? 0.75 + 0.25 * Math.abs(Math.sin(frame / 5 + i * 0.9)) : 1;
              return <div key={i} style={{ width: 9, flex: "none", height: Math.max(12, hgt * 100 * (done || !playing ? 1 : live)), borderRadius: 5, background: done ? T.main : T.gray }} />;
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <Mic size={30} color={T.muted} />
            <span style={{ ...NUMBER, fontWeight: 400, fontSize: 34, color: T.muted }}>{t}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** A social comment: face, name bar, text (≤ 5 words, no punctuation), likes; struck = red Strike over the text from that frame */
export const Comment: React.FC<{ frame: number; at: number; text: string; color: string; likes?: number; struck?: number; x?: number; y: number; w?: number; rot?: number; style?: React.CSSProperties }> = ({ frame, at: a, text, color, likes, struck, x = 540, y, w = 760, rot = 0, style }) => {
  const T = usePalette();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, marginLeft: -w / 2, ...style, ...appear(frame, a, SPRING.bouncy), opacity: Number(appear(frame, a, SPRING.bouncy).opacity) * Number(style?.opacity ?? 1) }}>
      <div style={{ ...SURFACE, padding: 32, display: "flex", gap: 24, alignItems: "flex-start", transform: `rotate(${rot}deg)` }}>
        <div style={{ position: "relative", width: 76, height: 76, flex: "none" }}>
          <Face color={color} size={76} smile={-0.3} style={{ left: 38, top: 38 }} />
        </div>
        <div style={{ flex: 1 }}>
          <Bar w={170} h={14} style={{ marginBottom: 16, marginTop: 6 }} />
          <div style={{ ...PARAGRAPH, fontSize: 44, lineHeight: 1.2, color: INK }}>{struck != null ? <Strike frame={frame} at={struck}>{text}</Strike> : text}</div>
          {likes != null && <div style={{ ...NUMBER, fontWeight: 400, fontSize: 30, color: T.muted, marginTop: 14 }}>♥ {likes}</div>}
        </div>
      </div>
    </div>
  );
};

/* ───────── Reel ───────── */

export type TalkScene = readonly [Range, React.FC<{ frame: number }>];
export type TalkCfg = {
  lines: Line[];
  end: number;
  T: Palette;
  bg: DotOrbitVariant;
  music: string;
  ahu: AvatarKey[];
  alicja: AvatarKey[];
  alicjaDir: string;
  /** silent nods of the listeners (frames), e.g. on the man's key words */
  nods?: { ahu?: number[]; alicja?: number[] };
  scenes: TalkScene[];
  sfx: Sfx[];
};

/** Slow push-in over each scene, so the frame never stands still */
const drift = (El: React.FC<{ frame: number }>, [a, b]: Range): React.FC<{ frame: number }> => {
  const D: React.FC<{ frame: number }> = ({ frame }) => (
    <AbsoluteFill style={{ transformOrigin: "540px 720px", transform: `scale(${1 + 0.035 * ease.inOut(progress(frame, a, b))})` }}>
      <El frame={frame} />
    </AbsoluteFill>
  );
  return D;
};

/** The whole reel (no outro: withOutro adds TatarverseOutro in Root) */
export const TalkReel: React.FC<{ cfg: TalkCfg }> = ({ cfg }) => {
  const { lines, end, T, bg, music, ahu, alicja, alicjaDir, nods: n = {}, scenes, sfx } = cfg;
  const scenesDef: SceneDef[] = React.useMemo(() => scenes.map(([range, El]) => ({ range, El: drift(El, range) })), [scenes]);
  const hosts = React.useMemo(
    () =>
      [
        { keys: ahu, words: [...wordsOf(lines, "ahu"), ...nods(n.ahu ?? [])], fit: FIT_AHU },
        { keys: alicja, words: [...wordsOf(lines, "alicja"), ...nods(n.alicja ?? [])], dir: alicjaDir, fit: FIT_ALICJA },
      ] as [DuoHost, DuoHost],
    [lines, ahu, alicja, alicjaDir, n.ahu, n.alicja],
  );
  const turns = React.useMemo(() => turnsOf(lines), [lines]);
  const Hosts: React.FC<{ frame: number }> = React.useCallback(({ frame }) => <TatDuo frame={frame} turns={turns} hosts={hosts} />, [turns, hosts]);
  return (
    <Ctx.Provider value={T}>
      <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
        <ReelShell scenes={scenesDef} headlines={[]} vo={voOf(lines)} sfx={sfx} duration={end} music={music} musicLevel={[0.045, 0.11]} overlay={Hosts} bg={<DotOrbitBg variant={bg} />} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

