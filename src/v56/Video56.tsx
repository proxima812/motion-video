import React from "react";
import { BookOpen, Check, Flame, Mic, Scale, TrendingDown } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { PARAGRAPH, SURFACE } from "../kit/design";
import { Strike } from "../catalog/own/text";
import type { AvatarKey } from "../kit/TatAvatar";
import { Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V56 «Раньше были лучше» (@the_tatarverse, talk series #3, RU). The man's voice message: his grandfather called his
// generation lost (music, language, respect) - and they raised kids, kept the language, hold the holidays; now his peers
// say the same about the young. Hook #10. Moral: "not the same" is not "worse"; a tradition lives while it is passed on.
// Palette: teal (memory, continuity). Dot Orbit variant 1 (base).
const T: Palette = { main: "#1F6F78", vivid: "#2A9BA6", glow: "#9ED8DC", pale: "#E9F6F7", plate: "linear-gradient(135deg, #2A9BA6, #1F6F78)", gray: "#DDE8E9", muted: "#76888A" };
const OLD = "#9A8A78"; // the elder generations: warm gray
const MID = "#4A5B7A";

const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);

const Chip: React.FC<{ frame: number; at: number; text: string; x: number; y: number; color?: string; icon?: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ frame, at: a, text, x, y, color, icon, size = 42, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: "translateX(-50%)", ...style }}>
    <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: size, padding: "18px 30px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 16, color: color ?? PARAGRAPH.color, ...appear(frame, a, SPRING.bouncy) }}>
      {icon}
      {text}
    </div>
  </div>
);

/* 1. Hook: the eternal phrase "people were better before" - struck out */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const quote = springAt(frame, 10, SPRING.bouncy);
  return (
    <>
      <Title text="если бы я начинала с *нуля*" frame={frame} at={0} size={84} />
      <div style={{ position: "absolute", left: 540, top: 520, width: "max-content", transform: `translateX(-50%) scale(${0.7 + 0.3 * Math.min(1, quote)})`, opacity: Math.min(1, quote * 1.4), whiteSpace: "nowrap" }}>
        <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 64, padding: 48 }}>
          {frame >= f(1, "перестала") ? <Strike frame={frame} at={f(1, "перестала")}>раньше люди были лучше</Strike> : "раньше люди были лучше"}
        </div>
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: 260 + i * 140, top: 880, ...appear(frame, f(1, "раньше") + i * 6, SPRING.bouncy) }}>
          <Face color={[OLD, OLD, MID, T.main, T.vivid][i]} size={100} smile={0.3} style={{ left: 0, top: 0 }} />
        </div>
      ))}
    </>
  );
};

/* 2-3. The voice message: grandfather -> him -> you; the old reproaches; the checklist of what they did; the same words now */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [S(3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "прислал"), SPRING.bouncy);
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const gens: [string, string, number][] = [["дед", OLD, f(3, "дед")], ["он", MID, f(3, "поколение")], ["вы", T.main, f(3, "ровесников")]];
  const p1 = f(3, "музыка");
  const p2 = f(3, "а");
  const p3 = f(3, "теперь");
  const arrow = (from: number, x: number) => {
    const t = ease.inOut(progress(frame, from, from + 20));
    return <div style={{ position: "absolute", left: x, top: 388, width: 150 * t, height: 6, borderRadius: 3, background: T.glow }} />;
  };
  // "пропащее" bubble: first from grandfather to him, later from him to you
  const lost = (a: number, x: number, until: number) => (frame >= a - 4 && frame < until + 10 ? <Chip frame={frame} at={a} text="пропащее" x={x} y={190} color="#C62828" style={{ opacity: fadeOut(frame, until) }} /> : null);
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * fadeOut(frame, S(3) - 20) }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Про поколения
        </GlassPlate>
      </div>
      {gens.map(([label, c, a], i) => (
        <div key={i} style={{ position: "absolute", left: 230 + i * 310, top: 330, ...appear(frame, a, SPRING.bouncy) }}>
          <Face color={c} size={130} smile={i === 0 ? -0.3 : 0.2} style={{ left: 0, top: 0 }} />
          <div style={{ ...PARAGRAPH, position: "absolute", top: 80, left: 0, transform: "translateX(-50%)", fontSize: 38, color: T.muted }}>{label}</div>
        </div>
      ))}
      {arrow(f(3, "говорил"), 310)}
      {arrow(p3, 620)}
      {lost(f(3, "пропащее"), 380, p1 - 10)}
      {lost(f(3, "своих"), 690, play[1] + 20)}
      {frame >= p1 - 4 && frame < p2 + 10 && (
        <div style={{ opacity: fadeOut(frame, p2 - 4) }}>
          <Chip frame={frame} at={f(3, "музыка")} text="музыка не та" x={300} y={560} />
          <Chip frame={frame} at={f(3, "язык")} text="язык не тот" x={760} y={640} />
          <Chip frame={frame} at={f(3, "уважения")} text="уважения нет" x={380} y={740} />
        </div>
      )}
      {frame >= p2 - 4 && frame < p3 + 10 && (
        <div style={{ opacity: fadeOut(frame, p3 - 4) }}>
          {([["детей вырастили", f(3, "детей")], ["язык сохранили", f(3, "язык", 1)], ["праздники проводим", f(3, "праздники")]] as const).map(([w, a], i) => (
            <Chip key={i} frame={frame} at={a} text={w} x={540} y={540 + i * 110} icon={<Check size={44} color={T.main} strokeWidth={3} />} />
          ))}
        </div>
      )}
      {frame >= p3 - 4 && <Title text="про *вас*" frame={frame} at={[f(3, "про"), f(3, "вас")]} size={110} top={600} />}
      <VoiceNote frame={frame} at={f(2, "голосовое")} play={play} y={lerp(640, 920, down)} label="Голосовое" />
    </>
  );
};

/* 4. Grandmother grumbled at mother: "too modern" */
const Family: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const fam: [string, string, number][] = [["бабушка", OLD, f(4, "бабушка")], ["мама", MID, f(4, "маму")], ["я", T.main, f(4, "моя")]];
  return (
    <>
      <Title text="бабушка ворчала на *маму*" frame={frame} at={[f(4, "бабушка"), f(4, "ворчала"), f(4, "на"), f(4, "маму")]} size={84} />
      {fam.map(([label, c, a], i) => (
        <div key={i} style={{ position: "absolute", left: 230 + i * 310, top: 760, ...appear(frame, a, SPRING.bouncy) }}>
          <Face color={c} size={170} smile={i === 0 ? -0.4 : 0.3} style={{ left: 0, top: 0 }} />
          <div style={{ ...PARAGRAPH, position: "absolute", top: 104, left: 0, transform: "translateX(-50%)", fontSize: 40, color: T.muted, whiteSpace: "nowrap" }}>{label}</div>
        </div>
      ))}
      <Chip frame={frame} at={f(4, "слишком")} text="слишком современная" x={420} y={470} color="#C62828" />
    </>
  );
};

/* 5. Every generation seems "not the same" to the previous one; not decline - fear that it won't be passed on */
const Fear: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(5, "это");
  const t3 = f(5, "это", 1);
  const colors = [OLD, OLD, MID, T.main, T.vivid];
  const flame = springAt(frame, f(5, "страх"), SPRING.bouncy);
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="каждое поколение *не такое*" frame={frame} at={[f(5, "каждое"), f(5, "поколение"), f(5, "не"), f(5, "таким")]} size={84} /></div>}
      {frame >= t2 - 2 && frame < t3 + 10 && (
        <div style={{ opacity: fadeOut(frame, t3 - 4) }}>
          <Title text="не про ~упадок~" frame={frame} at={[f(5, "это"), f(5, "не", 1), f(5, "упадок")]} size={100} />
          <div style={{ position: "absolute", left: 540, top: 420, width: "max-content", opacity: 0.5, ...appear(frame, f(5, "упадок"), undefined, "translateX(-50%)") }}>
            <TrendingDown size={240} color={T.muted} strokeWidth={1.4} />
          </div>
        </div>
      )}
      {frame >= t3 - 2 && <Title text="страх что *не передадут*" frame={frame} at={[f(5, "страх"), f(5, "что"), f(5, "не", 2), f(5, "передадут")]} size={88} />}
      {colors.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 220 + i * 160, top: 760 + (frame < t3 ? 0 : 0) + i * 50, ...appear(frame, S(5) + i * 8, SPRING.bouncy) }}>
          <Face color={c} size={110} smile={0.1} style={{ left: 0, top: 0 }} />
          {i > 0 && frame >= f(5, "таким") + i * 6 && frame < t2 && <Chip frame={frame} at={f(5, "таким") + i * 6} text="не те" x={0} y={-150} size={30} color="#C62828" />}
        </div>
      ))}
      <div style={{ position: "absolute", left: 300, top: 600, opacity: Math.min(1, flame * 1.4), transform: `translate(-50%, -50%) scale(${flame}) rotate(${Math.sin(frame / 6) * 6}deg)` }}>
        <Flame size={120} color={T.vivid} fill={T.glow} strokeWidth={1.4} />
      </div>
    </>
  );
};

/* 6. It is passed on not to those who are scolded, but to those who are trusted: the flame goes to the young */
const Trust: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(6, "а", 1);
  const go = ease.inOut(progress(frame, f(6, "доверяют") - 10, f(6, "доверяют") + 30));
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="не те кого ~ругают~" frame={frame} at={[f(6, "не"), f(6, "те"), f(6, "кого"), f(6, "ругают")]} size={96} /></div>}
      {frame >= t2 - 2 && <Title text="а те кому *доверяют*" frame={frame} at={[f(6, "а", 1), f(6, "те", 1), f(6, "кому"), f(6, "доверяют")]} size={96} />}
      <div style={{ position: "absolute", left: 300, top: 820, ...appear(frame, S(6)) }}>
        <Face color={OLD} size={200} smile={lerp(-0.3, 0.6, go)} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ position: "absolute", left: 780, top: 820, ...appear(frame, S(6) + 8) }}>
        <Face color={T.main} size={200} smile={lerp(-0.2, 0.7, go)} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ position: "absolute", left: lerp(360, 720, go), top: lerp(600, 600, go) - Math.sin(go * Math.PI) * 120, transform: `translate(-50%, -50%) rotate(${Math.sin(frame / 6) * 6}deg)`, ...appear(frame, S(6) + 14) }}>
        <Flame size={140} color={T.vivid} fill={T.glow} strokeWidth={1.4} />
      </div>
    </>
  );
};

/* 7. Moral: not the same is not worse; a tradition lives while it is passed on, not while it is discussed */
const Moral: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(7, "традиция");
  const plate = springAt(frame, S(7) - 6, SPRING.bouncy);
  const pass = progress(frame, f(7, "передают"), f(7, "передают") + 90);
  const faces = [OLD, MID, T.main, T.vivid];
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="не те не значит *хуже*" frame={frame} at={[f(7, "не"), f(7, "те"), f(7, "не", 1), f(7, "значит"), f(7, "хуже")]} size={92} top={320} /></div>}
      {frame >= t2 - 2 && <Title text="традиция живет пока ее *передают*" frame={frame} at={[f(7, "традиция"), f(7, "живет"), f(7, "пока"), f(7, "ее"), f(7, "передают")]} size={84} top={320} />}
      {faces.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 210 + i * 220, top: 800, ...appear(frame, S(7) + i * 6, SPRING.bouncy) }}>
          <Face color={c} size={130} smile={0.5} style={{ left: 0, top: 0 }} />
        </div>
      ))}
      {frame >= f(7, "передают") && (
        <div style={{ position: "absolute", left: 210 + 660 * ease.inOut(pass), top: 640 - Math.abs(Math.sin(pass * Math.PI * 3)) * 70, width: "max-content", transform: "translate(-50%, -50%)" }}>
          <Flame size={110} color={T.vivid} fill={T.glow} strokeWidth={1.4} />
        </div>
      )}
      {frame >= f(7, "обсуждают") - 4 && (
        <div style={{ position: "absolute", left: 540, top: 1010, width: "max-content", whiteSpace: "nowrap", ...appear(frame, f(7, "обсуждают") - 4, undefined, "translateX(-50%)") }}>
          <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 48, padding: 30 }}>
            а не <Strike frame={frame} at={f(7, "обсуждают") + 2}>обсуждают</Strike>
          </div>
        </div>
      )}
    </>
  );
};

/* 8. Tell the young - not about the young */
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  return (
    <>
      <Title text="расскажи *младшим*" frame={frame} at={[f(8, "расскажи"), f(8, "младшим")]} size={110} top={240} />
      {frame >= f(8, "а") - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 530, textAlign: "center", fontFamily: "Inter", fontSize: 80, letterSpacing: "-0.03em", color: "#251B3A", ...appear(frame, f(8, "а") - 4) }}>
          а не <Strike frame={frame} at={f(8, "младших")}>про младших</Strike>
        </div>
      )}
      <div style={{ position: "absolute", left: 360, top: 860, ...appear(frame, S(8)) }}>
        <Face color={OLD} size={190} smile={0.7} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ position: "absolute", left: 720, top: 900, ...appear(frame, S(8) + 8) }}>
        <Face color={T.main} size={150} smile={0.7} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 760, width: "max-content", ...appear(frame, f(8, "младшим"), SPRING.bouncy, "translate(-50%, -50%)") }}>
        <BookOpen size={130} color={T.main} strokeWidth={1.4} />
      </div>
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "thinking" }, { at: 130, e: "stop" }, { at: 230, e: "skeptical" },
  { at: 350, e: "listening" }, { at: 480, e: "point-down" },
  { at: 560, e: "surprised" }, { at: 640, e: "smile-up" }, { at: 710, e: "facepalm" }, { at: 800, e: "displeased" }, { at: 875, e: "shrug" },
  { at: 990, e: "soft-smile" }, { at: 1050, e: "thumbs-up" }, { at: 1120, e: "clapping" }, { at: 1200, e: "delighted" }, { at: 1310, e: "puzzled" }, { at: 1450, e: "hand-on-heart" },
  { at: 1520, e: "shush" }, { at: 1600, e: "laughing" }, { at: 1700, e: "dreamy" },
  { at: 1760, e: "explaining" }, { at: 1850, e: "point-up" }, { at: 1985, e: "arms-crossed" }, { at: 2060, e: "disappointed" },
  { at: 2205, e: "point-right" }, { at: 2330, e: "inspired" },
  { at: 2440, e: "present-left" }, { at: 2580, e: "pensive" }, { at: 2700, e: "heart-hands" },
  { at: 2855, e: "victory" }, { at: 2940, e: "waving" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "listening" }, { at: 140, e: "puzzled" }, { at: 245, e: "thinking" },
  { at: 350, e: "explaining" }, { at: 465, e: "point-down" },
  { at: 570, e: "pensive" }, { at: 700, e: "surprised" }, { at: 790, e: "disappointed" }, { at: 860, e: "displeased" }, { at: 930, e: "facepalm" },
  { at: 1000, e: "smile-up" }, { at: 1060, e: "hand-on-heart" }, { at: 1130, e: "thumbs-up" }, { at: 1210, e: "clapping" }, { at: 1300, e: "shrug" }, { at: 1455, e: "laughing" },
  { at: 1505, e: "dreamy" }, { at: 1612, e: "soft-smile" }, { at: 1690, e: "present-left" },
  { at: 1770, e: "listening" }, { at: 1860, e: "skeptical" }, { at: 2000, e: "pensive" }, { at: 2070, e: "shush" },
  { at: 2190, e: "stop" }, { at: 2300, e: "point-up" }, { at: 2380, e: "inspired" },
  { at: 2452, e: "arms-crossed" }, { at: 2590, e: "point-right" }, { at: 2715, e: "heart-hands" },
  { at: 2835, e: "delighted" }, { at: 2900, e: "victory" }, { at: 2960, e: "waving" },
];

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(5)], Family],
  [[S(5), S(6)], Fear],
  [[S(6), S(7)], Trust],
  [[S(7), S(8)], Moral],
  [[S(8), END + 30], Final],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 1,
  music: "v56/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v56/avatar",
  nods: { ahu: [f(3, "пропащее"), f(3, "вырастили"), f(3, "сохранили"), f(3, "вас")], alicja: [f(3, "нет"), f(3, "сохранили") + 8, f(3, "проводим"), f(3, "вас") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    { src: "sfx2/pop.mp3", from: 12, volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(1, "перестала") + 30, volume: 0.035 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "прислал"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    { src: "sfx2/pop.mp3", from: f(3, "пропащее"), volume: 0.16 },
    ...[f(3, "музыка"), f(3, "язык"), f(3, "уважения")].map((x) => ({ src: "sfx2/pop.mp3", from: x, volume: 0.14 })),
    ...[f(3, "детей"), f(3, "язык", 1), f(3, "праздники")].map((x) => ({ src: "sfx2/ding.mp3", from: x + 4, volume: 0.14 })),
    { src: "sfx/03_Basscrack.wav", from: f(3, "вас"), volume: 0.07 },
    { src: "sfx/04_Cyber_Shift.wav", from: S(4) - 8, volume: 0.18 },
    { src: "sfx2/pop.mp3", from: f(4, "слишком"), volume: 0.16 },
    { src: "sfx/02_Alienated_Warpes.wav", from: S(5) - 8, volume: 0.14 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(5, "упадок") + 6, volume: 0.035 },
    { src: "sfx/06_Ripple_Textures_II.wav", from: S(6) - 8, volume: 0.18 },
    { src: "sfx2/ding.mp3", from: f(6, "доверяют") + 20, volume: 0.18 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(7) - 8, volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(7, "обсуждают") + 30, volume: 0.035 },
    { src: "sfx/07_CineStrike.wav", from: S(8), volume: 0.12 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(8, "младших") + 30, volume: 0.035 },
  ],
};

export const F = { duration: END };
export const Video56: React.FC = () => <TalkReel cfg={CFG} />;
