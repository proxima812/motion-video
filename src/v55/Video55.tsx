import React from "react";
import { Home, Languages, MessageCircle, Mic, Scale, Wallet } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { PARAGRAPH, SURFACE } from "../kit/design";
import { Strike } from "../catalog/own/text";
import type { AvatarKey } from "../kit/TatAvatar";
import { Comment, Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V55 «Татары не те, татарки не те» (@the_tatarverse, talk series #2, RU). The same man's voice message: guys write
// "Tatar girls are not the same, only money", girls answer "Tatar guys are not the same, no responsibility, no language";
// everyone waits for the other to change first. Hook #4. Moral: what became "not the same" is how we talk about each other.
// Palette: ochre / gold (traditions). Dot Orbit variant 6 (pearl).
const T: Palette = { main: "#8A5A12", vivid: "#C98A1B", glow: "#F3D08A", pale: "#FBF4E4", plate: "linear-gradient(135deg, #D69A2A, #8A5A12)", gray: "#ECE5D8", muted: "#8F8270" };
const MEN = "#4A5B7A";

const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);

/** A label sticker slapped onto a side: rotated pill with text */
const Label: React.FC<{ frame: number; at: number; text: string; color: string; x: number; y: number; rot: number }> = ({ frame, at: a, text, color, x, y, rot }) => {
  const t = springAt(frame, a, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1.5 - 0.5 * Math.min(1, t)})`, opacity: Math.min(1, t * 2) }}>
      <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 40, padding: "18px 28px", whiteSpace: "nowrap", color, border: `3px solid ${color}` }}>{text}</div>
    </div>
  );
};

/* 1. Hook: two reproaches from opposite sides slide onto each other and match */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const meet = ease.inOut(progress(frame, f(1, "звучат") - 10, f(1, "одинаково") + 10));
  const bubble = (s: 0 | 1, text: string, color: string) => {
    const x = s ? lerp(760, 540, meet) : lerp(320, 540, meet);
    const y = s ? lerp(820, 640, meet) : lerp(460, 640, meet);
    return (
      <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: `translate(-50%, -50%) rotate(${(s ? 3 : -3) * (1 - meet)}deg)`, ...appear(frame, s ? 50 : 20, SPRING.bouncy), opacity: Math.min(1, springAt(frame, s ? 50 : 20, SPRING.bouncy) * 1.4) * (s ? 1 : 1 - 0.55 * meet) }}>
        <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 48, padding: 36, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 20, borderBottom: `6px solid ${color}` }}>
          <MessageCircle size={46} color={color} />
          {text}
        </div>
      </div>
    );
  };
  return (
    <>
      <Title text="упреки парней и девушек звучат _одинаково_" frame={frame} at={[0, 3, 6, 9, 12, f(1, "звучат"), f(1, "одинаково")]} size={80} />
      {bubble(0, "татарки не те", MEN)}
      {bubble(1, "татары не те", T.main)}
    </>
  );
};

/* 2-3. The voice message: the guys' comment, the girls' comment, then "everyone waits for the other one" */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [S(3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "написал"), SPRING.bouncy);
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const c1 = f(3, "татарки");
  const c2 = f(3, "татары");
  const phase2 = f(3, "я");
  const icon = (a: number, I: typeof Wallet, x: number, y: number, color: string) => {
    const t = springAt(frame, a, SPRING.bouncy);
    return (
      <div style={{ position: "absolute", left: x, top: y, width: 96, height: 96, borderRadius: "50%", background: "#fff", boxShadow: "-1px -6px 55px -11px rgba(144,142,142,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t})`, opacity: Math.min(1, t * 1.4) }}>
        <I size={52} color={color} />
      </div>
    );
  };
  const cOut = fadeOut(frame, phase2 - 8, 12);
  // "everyone waits for the other": two faces turned to each other, arrows pointing across
  const wait = springAt(frame, f(3, "каждый"), SPRING.smooth);
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * fadeOut(frame, S(3) + 30) }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Снова голосовое
        </GlassPlate>
      </div>
      {frame < phase2 + 10 && (
        <div style={{ opacity: cOut }}>
          <Comment frame={frame} at={c1} text="татарки стали не те" color={MEN} likes={389} x={500} y={190} w={760} rot={-1.5} struck={f(3, "те") + 8} />
          {icon(f(3, "деньги"), Wallet, 820, 330, MEN)}
          <Comment frame={frame} at={c2} text="татары стали не те" color={T.main} likes={402} x={580} y={500} w={760} rot={1.5} struck={f(3, "те", 1) + 8} />
          {icon(f(3, "ответственности"), Home, 130, 640, T.main)}
          {icon(f(3, "языка"), Languages, 250, 680, T.main)}
        </div>
      )}
      {frame >= phase2 - 2 && frame < f(3, "каждый") + 10 && (
        <div style={{ opacity: fadeOut(frame, f(3, "каждый") - 4) }}>
          <Title text="я слушаю *обе* стороны" frame={frame} at={[f(3, "я"), f(3, "слушаю"), f(3, "обе"), f(3, "стороны")]} size={92} top={300} />
          <Title text="и вижу _одно и то же_" frame={frame} at={[f(3, "и"), f(3, "вижу"), f(3, "одно"), f(3, "и", 1), f(3, "то"), f(3, "же")]} size={92} top={520} />
        </div>
      )}
      {frame >= f(3, "каждый") - 2 && (
        <>
          <Title text="каждый ждет что изменится *другой*" frame={frame} at={[f(3, "каждый"), f(3, "ждет"), f(3, "что"), f(3, "изменится"), f(3, "другой")]} size={84} top={220} />
          {[0, 1].map((s) => (
            <div key={s} style={{ position: "absolute", left: s ? 780 : 300, top: 600, opacity: Math.min(1, wait * 1.4) }}>
              <Face color={s ? T.main : MEN} size={150} smile={-0.3} style={{ left: 0, top: 0, transform: `rotate(${(s ? -1 : 1) * 8 * Math.sin(frame / 12)}deg)` }} />
            </div>
          ))}
          <div style={{ position: "absolute", left: 540, top: 600, width: "max-content", transform: "translate(-50%, -50%)", opacity: Math.min(1, wait * 1.4), display: "flex", gap: 30 }}>
            {[0, 1].map((s) => (
              <div key={s} style={{ fontSize: 70, color: s ? MEN : T.main, transform: `translateX(${(s ? -1 : 1) * 10 * Math.sin(frame / 8)}px)`, fontFamily: "Inter" }}>{s ? "◀" : "▶"}</div>
            ))}
          </div>
        </>
      )}
      <VoiceNote frame={frame} at={f(2, "человек")} play={play} y={lerp(640, 900, down)} label="Голосовое" />
    </>
  );
};

/* 4-5. Labels slapped on each side: what they say about us, what we say about them */
const Labels: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  return (
    <>
      <Title text="про *нас*" frame={frame} at={f(4, "про")} size={80} top={170} style={{ left: 60, right: 560 }} />
      <Title text="про *них*" frame={frame} at={f(5, "про")} size={80} top={170} style={{ left: 560, right: 60 }} />
      <div style={{ position: "absolute", left: 540, top: 330, width: 3, height: 900, marginLeft: -1.5, background: T.gray }} />
      <div style={{ position: "absolute", left: 270, top: 520 }}>
        <Face color={T.main} size={200} smile={-0.4} style={{ left: 0, top: 0, ...appear(frame, S(4)) }} />
      </div>
      <div style={{ position: "absolute", left: 810, top: 520 }}>
        <Face color={MEN} size={200} smile={-0.4} style={{ left: 0, top: 0, ...appear(frame, S(5) - 20) }} />
      </div>
      <Label frame={frame} at={f(4, "меркантильные")} text="меркантильные" color={MEN} x={270} y={720} rot={-6} />
      <Label frame={frame} at={f(4, "забыли")} text="забыли традиции" color={MEN} x={270} y={860} rot={4} />
      <Label frame={frame} at={f(5, "безответственные")} text="безответственные" color={T.main} x={810} y={700} rot={5} />
      <Label frame={frame} at={f(5, "без")} text="без языка" color={T.main} x={810} y={830} rot={-4} />
      <Label frame={frame} at={f(5, "без", 1)} text="без корней" color={T.main} x={810} y={950} rot={6} />
    </>
  );
};

/* 6. It is a mirror: one face and its reflection, the same reproaches on both sides */
const Mirror: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const glass = springAt(frame, f(6, "зеркало"), SPRING.smooth);
  const words = ["не те", "упреки", "не те"];
  return (
    <>
      <Title text="это *зеркало*" frame={frame} at={[f(6, "это"), f(6, "зеркало")]} size={110} top={190} />
      <div style={{ position: "absolute", left: 540, top: 400, width: 14, height: lerp(0, 820, glass), marginLeft: -7, borderRadius: 7, background: `linear-gradient(${T.glow}, ${T.vivid}, ${T.glow})` }} />
      {[0, 1].map((s) => (
        <React.Fragment key={s}>
          <div style={{ position: "absolute", left: s ? 790 : 290, top: 620 }}>
            <Face color={s ? MEN : T.main} size={190} smile={-0.3} style={{ left: 0, top: 0, ...appear(frame, S(6) + s * 10), transform: `scaleX(${s ? -1 : 1})` }} />
          </div>
          {words.map((w, i) => {
            const a = f(6, "одни") + i * 22;
            const t = springAt(frame, a, SPRING.bouncy);
            return (
              <div key={i} style={{ position: "absolute", left: s ? 790 : 290, top: 790 + i * 110, width: "max-content", transform: `translateX(-50%) scale(${t})`, opacity: Math.min(1, t * 1.4) }}>
                <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 40, padding: "16px 28px", whiteSpace: "nowrap" }}>{w}</div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

/* 7. While we measure who is worse: a scale swinging, then the language and the families fade away */
const Measure: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(7, "мы", 1);
  const tilt = Math.sin((frame - S(7)) / 14) * 12 * (1 - progress(frame, t2, t2 + 30));
  const items: [number, typeof Home, string][] = [[f(7, "язык"), Languages, "язык"], [f(7, "семьи"), Home, "семьи"]];
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="кто *хуже*" frame={frame} at={[f(7, "кто"), f(7, "хуже")]} size={110} /></div>}
      {frame >= t2 - 2 && <Title text="мы теряем *друг друга*" frame={frame} at={[f(7, "мы", 1), f(7, "теряем"), f(7, "друг"), f(7, "друга")]} size={88} />}
      <div style={{ position: "absolute", left: 540, top: 430, width: "max-content", ...appear(frame, S(7), undefined, "translateX(-50%)") }}>
        <div style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "50% 45%" }}>
          <Scale size={420} color={T.main} strokeWidth={1.1} />
        </div>
      </div>
      {items.map(([a, I, w], i) => {
        const t = springAt(frame, a, SPRING.bouncy);
        const fade = progress(frame, a + 24, a + 60);
        return (
          <div key={i} style={{ position: "absolute", left: 330 + i * 420, top: 960, width: "max-content", transform: `translateX(-50%) scale(${t})`, opacity: Math.min(1, t * 1.4) * (1 - 0.65 * fade), filter: `blur(${fade * 5}px) grayscale(${fade})` }}>
            <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 46, padding: 30, display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
              <I size={50} color={T.main} /> {w}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* 8. Moral: not the Tatars, not the Tatar girls - the way we talk about each other */
const Moral: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(8, "а");
  const plate = springAt(frame, S(8) - 6, SPRING.bouncy);
  const soft = ease.inOut(progress(frame, f(8, "говорим") - 10, f(8, "говорим") + 30));
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      {frame < t2 + 10 && (
        <div style={{ opacity: fadeOut(frame, t2 - 4) }}>
          <Title text="не те стали" frame={frame} at={[f(8, "не"), f(8, "те"), f(8, "стали")]} size={88} top={330} />
          <div style={{ position: "absolute", left: 100, right: 100, top: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, fontSize: 96, fontFamily: "Inter", color: "#251B3A", letterSpacing: "-0.03em" }}>
            {frame >= f(8, "татары") - 4 && <div style={appear(frame, f(8, "татары") - 4)}><Strike frame={frame} at={f(8, "татары")}>не татары</Strike></div>}
            {frame >= f(8, "татарки") - 4 && <div style={appear(frame, f(8, "татарки") - 4)}><Strike frame={frame} at={f(8, "татарки")}>не татарки</Strike></div>}
          </div>
        </div>
      )}
      {frame >= t2 - 2 && (
        <>
          <Title text="а то как мы *говорим*" frame={frame} at={[f(8, "а"), f(8, "то"), f(8, "как"), f(8, "мы"), f(8, "говорим")]} size={96} top={330} />
          <div style={{ position: "absolute", left: 540, top: 620, width: "max-content", ...appear(frame, t2 + 10, undefined, "translateX(-50%)") }}>
            <svg width={520} height={420} viewBox="0 0 520 420">
              {/* a jagged speech bubble that smooths out */}
              <path d={bubblePath(soft)} fill={lerp(0, 1, soft) > 0.5 ? T.pale : "#fff"} stroke={T.main} strokeWidth={8} strokeLinejoin="round" />
            </svg>
          </div>
        </>
      )}
    </>
  );
};
const bubblePath = (s: number) => {
  const pts = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const r = 1 + (i % 2 ? 0.16 : -0.08) * (1 - s);
    return `${260 + Math.cos(a) * 230 * r},${170 + Math.sin(a) * 150 * r}`;
  });
  return `M${pts.join(" L")} Z M150,300 L120,400 L230,315`;
};

/* 9. Start with yourself: say something good about your own */
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const likes = (a: number, to: number) => Math.round(lerp(0, to, ease.out(progress(frame, a, a + 60))));
  return (
    <>
      <Title text="начни с *себя*" frame={frame} at={[f(9, "начни"), f(9, "с"), f(9, "себя")]} size={96} top={170} />
      <Title text="скажи о своих *хорошее*" frame={frame} at={[f(9, "скажи"), f(9, "о"), f(9, "своих"), f(9, "хорошее")]} size={80} top={300} />
      <Comment frame={frame} at={f(9, "скажи")} text="горжусь нашими парнями" color={T.main} likes={likes(f(9, "скажи") + 10, 1280)} x={520} y={540} w={780} rot={-1.5} />
      <Comment frame={frame} at={f(9, "хорошее")} text="наши девушки золото" color={MEN} likes={likes(f(9, "хорошее") + 10, 1340)} x={560} y={830} w={780} rot={1.5} />
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "listening" }, { at: 120, e: "skeptical" }, { at: 225, e: "surprised" },
  { at: 285, e: "waving" }, { at: 410, e: "point-down" },
  { at: 500, e: "pensive" }, { at: 600, e: "displeased" }, { at: 690, e: "disappointed" }, { at: 770, e: "thinking" }, { at: 850, e: "arms-crossed" },
  { at: 930, e: "facepalm" }, { at: 1000, e: "shrug" }, { at: 1080, e: "soft-smile" }, { at: 1180, e: "hand-on-heart" }, { at: 1270, e: "point-up" }, { at: 1355, e: "puzzled" },
  { at: 1420, e: "listening" }, { at: 1495, e: "stop" }, { at: 1580, e: "smile-up" },
  { at: 1645, e: "present-left" }, { at: 1712, e: "point-right" }, { at: 1800, e: "laughing" },
  { at: 1940, e: "shush" }, { at: 2040, e: "thumbs-up" },
  { at: 2200, e: "explaining" }, { at: 2300, e: "disappointed" }, { at: 2400, e: "hand-on-heart" },
  { at: 2580, e: "listening" }, { at: 2700, e: "dreamy" }, { at: 2860, e: "clapping" },
  { at: 2905, e: "inspired" }, { at: 2965, e: "delighted" }, { at: 3010, e: "victory" }, { at: 3050, e: "heart-hands" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "arms-crossed" }, { at: 115, e: "explaining" }, { at: 215, e: "skeptical" },
  { at: 295, e: "listening" }, { at: 425, e: "shush" },
  { at: 510, e: "pensive" }, { at: 610, e: "displeased" }, { at: 700, e: "disappointed" }, { at: 790, e: "thinking" }, { at: 860, e: "surprised" },
  { at: 940, e: "puzzled" }, { at: 1010, e: "shrug" }, { at: 1090, e: "soft-smile" }, { at: 1190, e: "dreamy" }, { at: 1280, e: "point-right" }, { at: 1360, e: "inspired" },
  { at: 1412, e: "explaining" }, { at: 1480, e: "facepalm" }, { at: 1560, e: "hand-on-heart" },
  { at: 1655, e: "listening" }, { at: 1725, e: "present-left" }, { at: 1815, e: "laughing" }, { at: 1862, e: "point-down" },
  { at: 1930, e: "point-up" }, { at: 2030, e: "smile-up" },
  { at: 2205, e: "listening" }, { at: 2285, e: "disappointed" }, { at: 2340, e: "pensive" }, { at: 2470, e: "thumbs-up" },
  { at: 2568, e: "explaining" }, { at: 2690, e: "stop" }, { at: 2790, e: "heart-hands" },
  { at: 2915, e: "clapping" }, { at: 2975, e: "delighted" }, { at: 3022, e: "victory" }, { at: 3060, e: "waving" },
];

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(6)], Labels],
  [[S(6), S(7)], Mirror],
  [[S(7), S(8)], Measure],
  [[S(8), S(9)], Moral],
  [[S(9), END + 30], Final],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 6,
  music: "v55/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v55/avatar",
  nods: { ahu: [f(3, "деньги"), f(3, "языка"), f(3, "обе"), f(3, "другой")], alicja: [f(3, "те") + 6, f(3, "те", 1) + 6, f(3, "одно"), f(3, "другой") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    { src: "sfx2/pop.mp3", from: 20, volume: 0.16 },
    { src: "sfx2/pop.mp3", from: 50, volume: 0.16 },
    { src: "sfx/03_Basscrack.wav", from: f(1, "одинаково") + 6, volume: 0.07 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "написал"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    { src: "sfx2/pop.mp3", from: f(3, "татарки"), volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(3, "те") + 8, volume: 0.035 },
    { src: "sfx2/pop.mp3", from: f(3, "татары"), volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(3, "те", 1) + 8, volume: 0.035 },
    { src: "sfx/02_Alienated_Warpes.wav", from: f(3, "я") - 8, volume: 0.12 },
    { src: "sfx/04_Cyber_Shift.wav", from: S(4) - 8, volume: 0.18 },
    ...[f(4, "меркантильные"), f(4, "забыли"), f(5, "безответственные"), f(5, "без"), f(5, "без", 1)].map((x) => ({ src: "sfx2/click.mp3", from: x, volume: 0.2 })),
    { src: "sfx/06_Ripple_Textures_II.wav", from: S(6) - 8, volume: 0.18 },
    { src: "sfx2/ding.mp3", from: f(6, "зеркало"), volume: 0.16 },
    { src: "sfx/02_Alienated_Warpes.wav", from: S(7) - 8, volume: 0.14 },
    { src: "sfx/03_Basscrack.wav", from: f(7, "теряем"), volume: 0.07 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(8) - 8, volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(8, "татары") + 6, volume: 0.035 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(8, "татарки") + 6, volume: 0.035 },
    { src: "sfx/07_CineStrike.wav", from: S(9), volume: 0.12 },
    { src: "sfx2/pop.mp3", from: f(9, "скажи"), volume: 0.16 },
    { src: "sfx2/pop.mp3", from: f(9, "хорошее"), volume: 0.16 },
  ],
};

export const F = { duration: END };
export const Video55: React.FC = () => <TalkReel cfg={CFG} />;
