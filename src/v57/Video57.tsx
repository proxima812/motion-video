import React from "react";
import { ChefHat, Crown, Hammer, HandHeart, Megaphone, Mic, Package, Receipt, Salad, Scale, TreePine, UtensilsCrossed, X } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { Strike } from "../catalog/own/text";
import type { AvatarKey } from "../kit/TatAvatar";
import { Bar, Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V57 «Кто в доме главный» (@the_tatarverse, talk series #4, RU). The man's voice message - his childhood from the same
// comment: mother and sister cooked, he and father went for the fir tree, then he cut salads and laid the table,
// and nobody counted who did more. Hook #7. Moral: a family is a team, not a score.
// Palette: terracotta (home, family). Dot Orbit variant 2 (lavender).
const T: Palette = { main: "#A0452A", vivid: "#D2643F", glow: "#F4B9A2", pale: "#FCEEE8", plate: "linear-gradient(135deg, #D2643F, #A0452A)", gray: "#EDE2DD", muted: "#8E7B74" };
const MEN = "#4A5B7A";
const KID = "#E0A33A";

const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);

const Chip: React.FC<{ frame: number; at: number; text: string; x: number; y: number; icon?: React.ReactNode; color?: string; size?: number }> = ({ frame, at: a, text, x, y, icon, color, size = 42 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: "translateX(-50%)" }}>
    <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: size, padding: "20px 30px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 16, color: color ?? PARAGRAPH.color, ...appear(frame, a, SPRING.bouncy) }}>
      {icon}
      {text}
    </div>
  </div>
);

/* 1. Hook: a household receipt prints "+1" rows - and gets crossed out */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const rows = ["посуда", "мусор", "ужин", "уборка"];
  const cross = springAt(frame, f(1, "больше") + 8, SPRING.bouncy);
  const print = ease.out(progress(frame, 10, 200));
  return (
    <>
      <Title text="не превращай семью в *счет*" frame={frame} at={0} size={84} />
      <div style={{ position: "absolute", left: 540, top: 420, width: 520, marginLeft: -260, ...appear(frame, 4) }}>
        <div style={{ ...SURFACE, padding: 40, borderRadius: "24px 24px 6px 6px", height: lerp(120, 520, print), overflow: "hidden", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <Receipt size={44} color={T.main} />
            <Bar w={200} h={16} />
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, ...appear(frame, 40 + i * 40) }}>
              <span style={{ ...PARAGRAPH, fontSize: 42 }}>{r}</span>
              <span style={{ ...NUMBER, fontSize: 44, color: i % 2 ? MEN : T.main }}>+1</span>
            </div>
          ))}
        </div>
        <X size={460} color="#FF3B30" strokeWidth={2.2} style={{ position: "absolute", left: 30, top: 20, opacity: Math.min(1, cross * 1.5), transform: `scale(${cross})` }} />
      </div>
    </>
  );
};

/* 2-3. The voice message: the childhood holiday as chips - cooking, the fir tree, man's work, salads, the table; nobody counted */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [S(3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "прислал"), SPRING.bouncy);
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const last = f(3, "и", 1);
  const ic = (I: typeof ChefHat, c = T.main) => <I size={46} color={c} />;
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * fadeOut(frame, S(3) - 20) }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Про детство
        </GlassPlate>
      </div>
      <div style={{ opacity: fadeOut(frame, last - 6) }}>
        <Chip frame={frame} at={f(3, "готовили")} text="мама с сестрой" x={300} y={220} icon={ic(ChefHat)} />
        <Chip frame={frame} at={f(3, "елкой")} text="за елкой" x={790} y={340} icon={ic(TreePine, MEN)} />
        <Chip frame={frame} at={f(3, "сила")} text="мужская сила" x={340} y={470} icon={ic(Hammer, MEN)} />
        <Chip frame={frame} at={f(3, "салаты")} text="салаты" x={780} y={600} icon={ic(Salad)} />
        <Chip frame={frame} at={f(3, "стол")} text="накрыть стол" x={360} y={720} icon={ic(UtensilsCrossed)} />
      </div>
      {frame >= last - 4 && <Title text="никто не *считал*" frame={frame} at={[f(3, "никто"), f(3, "не"), f(3, "считал")]} size={110} top={420} />}
      <VoiceNote frame={frame} at={f(2, "голосовое")} play={play} y={lerp(640, 920, down)} label="Голосовое" />
    </>
  );
};

/* 4. "Same with us": dad carried the heavy things, mom ran the kitchen, and at the table - all together */
const Table: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const gather = ease.inOut(progress(frame, f(4, "столом") - 10, f(4, "столом") + 30));
  const seat = (i: number) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    return { x: 540 + Math.cos(a) * 250, y: 760 + Math.sin(a) * 200 };
  };
  const start = [{ x: 220, y: 560 }, { x: 860, y: 560 }, { x: 320, y: 980 }, { x: 760, y: 980 }];
  const who = [MEN, T.main, KID, KID];
  return (
    <>
      <Title text="у нас было *так же*" frame={frame} at={[f(4, "у"), f(4, "нас"), f(4, "было"), f(4, "так"), f(4, "же")]} size={88} />
      {frame >= f(4, "а") - 4 && <Title text="за столом *все вместе*" frame={frame} at={[f(4, "за"), f(4, "столом"), f(4, "все"), f(4, "вместе")]} size={80} top={290} />}
      <div style={{ position: "absolute", left: 540, top: 760, width: 300, height: 220, marginLeft: -150, marginTop: -110, borderRadius: "50%", background: T.pale, border: `8px solid ${T.glow}`, opacity: gather }} />
      {who.map((c, i) => {
        const s = seat(i);
        return (
          <div key={i} style={{ position: "absolute", left: lerp(start[i].x, s.x, gather), top: lerp(start[i].y, s.y, gather), ...appear(frame, S(4) + i * 6, SPRING.bouncy) }}>
            <Face color={c} size={i < 2 ? 130 : 100} smile={0.6} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
      <div style={{ opacity: fadeOut(frame, f(4, "столом") - 10) }}>
        <Chip frame={frame} at={f(4, "тяжелое")} text="тяжелое" x={260} y={660} icon={<Package size={44} color={MEN} />} size={38} />
        <Chip frame={frame} at={f(4, "кухней")} text="кухня" x={840} y={660} icon={<ChefHat size={44} color={T.main} />} size={38} />
      </div>
    </>
  );
};

/* 5. Now they count: a two-column score of who earned and who washed the dishes */
const Count: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const n = (a: number, to: number) => Math.round(lerp(0, to, ease.out(progress(frame, a, a + 50))));
  const col = (x: number, c: string, earned: number, dishes: number) => (
    <div style={{ position: "absolute", left: x, top: 450, width: 360, marginLeft: -180, ...appear(frame, S(5) + 10) }}>
      <div style={{ position: "relative", height: 130 }}>
        <Face color={c} size={120} smile={-0.4} style={{ left: 180, top: 60 }} />
      </div>
      <div style={{ ...SURFACE, padding: 34, display: "flex", flexDirection: "column", gap: 26 }}>
        {([["заработал", earned, f(5, "заработал")], ["посуда", dishes, f(5, "посуду")]] as const).map(([w, v, a], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...appear(frame, a - 6) }}>
            <span style={{ ...PARAGRAPH, fontSize: 38, color: T.muted }}>{w}</span>
            <span style={{ ...NUMBER, fontSize: 64, color: c }}>{n(a, v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <Title text="а сейчас *считают*" frame={frame} at={[f(5, "а"), f(5, "сейчас"), f(5, "считают")]} size={100} />
      {col(300, MEN, 7, 2)}
      {col(780, T.main, 5, 9)}
      <div style={{ ...NUMBER, position: "absolute", left: 540, top: 700, width: "max-content", fontSize: 90, color: T.gray, ...appear(frame, S(5) + 20, undefined, "translateX(-50%)") }}>:</div>
    </>
  );
};

/* 6. Sharing chores is normal; keeping the score and handing the bill to each other is not */
const Bill: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(6, "ненормально");
  const slide = ease.inOut(progress(frame, f(6, "выставлять"), f(6, "выставлять") + 30));
  const x = springAt(frame, f(6, "другу") + 6, SPRING.bouncy);
  return (
    <>
      {frame < t2 + 10 && (
        <div style={{ opacity: fadeOut(frame, t2 - 4) }}>
          <Title text="делить обязанности *нормально*" frame={frame} at={[f(6, "делить"), f(6, "обязанности"), f(6, "нормально")]} size={84} />
          <Chip frame={frame} at={f(6, "обязанности")} text="я готовлю" x={330} y={520} icon={<ChefHat size={44} color={T.main} />} />
          <Chip frame={frame} at={f(6, "обязанности") + 14} text="я чиню" x={760} y={640} icon={<Hammer size={44} color={MEN} />} />
        </div>
      )}
      {frame >= t2 - 2 && (
        <>
          <Title text="~выставлять счет~ друг другу" frame={frame} at={[f(6, "выставлять"), f(6, "счет"), f(6, "друг"), f(6, "другу")]} size={84} />
          <div style={{ position: "absolute", left: 260, top: 760 }}>
            <Face color={MEN} size={150} smile={-0.4} style={{ left: 0, top: 0, ...appear(frame, t2) }} />
          </div>
          <div style={{ position: "absolute", left: 820, top: 760 }}>
            <Face color={T.main} size={150} smile={-0.4} style={{ left: 0, top: 0, ...appear(frame, t2 + 6) }} />
          </div>
          <div style={{ position: "absolute", left: lerp(380, 700, slide), top: 440, transform: `translateX(-50%) rotate(${lerp(-8, 8, slide)}deg)`, ...appear(frame, f(6, "вести")) }}>
            <div style={{ ...SURFACE, padding: 30, width: 220 }}>
              <Receipt size={50} color={T.main} />
              <Bar w={150} h={14} style={{ marginTop: 18 }} />
              <Bar w={110} h={14} style={{ marginTop: 14 }} />
            </div>
            <X size={260} color="#FF3B30" strokeWidth={2.4} style={{ position: "absolute", left: -10, top: -20, opacity: Math.min(1, x * 1.5), transform: `scale(${x})` }} />
          </div>
        </>
      )}
    </>
  );
};

/* 7. Who is the head of the house: the crown leaves the loudest and goes to the one who does first */
const Crowned: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(7, "а");
  const move = ease.inOut(progress(frame, f(7, "первым") - 10, f(7, "первым") + 30));
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="не тот кто ~громче требует~" frame={frame} at={[f(7, "не"), f(7, "тот"), f(7, "кто"), f(7, "громче"), f(7, "требует")]} size={84} /></div>}
      {frame >= t2 - 2 && <Title text="а кто *первым берется*" frame={frame} at={[f(7, "а"), f(7, "кто", 1), f(7, "первым"), f(7, "берется")]} size={88} />}
      <div style={{ position: "absolute", left: 290, top: 800 }}>
        <Face color={MEN} size={180} smile={-0.5} style={{ left: 0, top: 0, ...appear(frame, S(7)) }} />
      </div>
      <div style={{ position: "absolute", left: 430, top: 760, width: "max-content", transform: `translate(-50%, -50%) rotate(-20deg) scale(${1 + 0.08 * Math.sin(frame / 3) * (frame < t2 ? 1 : 0)})`, opacity: Math.min(1, springAt(frame, f(7, "громче"), SPRING.bouncy) * 1.4) * (1 - progress(frame, t2, t2 + 20)) }}>
        <Megaphone size={110} color={MEN} strokeWidth={1.6} />
      </div>
      <div style={{ position: "absolute", left: 790, top: 800 }}>
        <Face color={T.main} size={180} smile={lerp(0.1, 0.7, move)} style={{ left: 0, top: 0, ...appear(frame, S(7) + 8) }} />
      </div>
      <div style={{ position: "absolute", left: 890, top: 900, width: "max-content", ...appear(frame, f(7, "берется"), SPRING.bouncy, "translate(-50%, -50%) rotate(-30deg)") }}>
        <Hammer size={90} color={T.main} strokeWidth={1.8} />
      </div>
      <div style={{ position: "absolute", left: lerp(290, 790, move), top: 640 - Math.sin(move * Math.PI) * 120, ...appear(frame, f(7, "главный"), SPRING.bouncy, "translate(-50%, -50%)") }}>
        <Crown size={110} color={T.vivid} fill={T.glow} strokeWidth={1.6} />
      </div>
    </>
  );
};

/* 8. Moral: a family is a team, not a score - the faces hold hands in a ring */
const Moral: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const plate = springAt(frame, S(8) - 6, SPRING.bouncy);
  const ring = ease.inOut(progress(frame, f(8, "команда") - 10, f(8, "команда") + 30));
  const who = [MEN, T.main, KID, KID, T.vivid];
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      <Title text="семья это *команда*" frame={frame} at={[f(8, "семья"), f(8, "это"), f(8, "команда")]} size={100} top={320} />
      {frame >= f(8, "а") - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Inter", fontSize: 84, letterSpacing: "-0.03em", color: "#251B3A", ...appear(frame, f(8, "а") - 4) }}>
          а не <Strike frame={frame} at={f(8, "счет")}>счет</Strike>
        </div>
      )}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={990} r={210} fill="none" stroke={T.glow} strokeWidth={10} strokeDasharray={`${1320 * ring} 1400`} transform="rotate(-90 540 990)" />
      </svg>
      {who.map((c, i) => {
        const a = (i / who.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 210, top: 990 + Math.sin(a) * 210, ...appear(frame, S(8) + i * 5, SPRING.bouncy) }}>
            <Face color={c} size={i < 2 ? 120 : 100} smile={0.7} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
    </>
  );
};

/* 9. Help today, without being asked */
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const h = springAt(frame, f(9, "просьбы"), SPRING.bouncy);
  return (
    <>
      <Title text="помоги сегодня *без просьбы*" frame={frame} at={[f(9, "помоги"), f(9, "сегодня"), f(9, "без"), f(9, "просьбы")]} size={100} top={260} />
      <div style={{ position: "absolute", left: 540, top: 820, opacity: Math.min(1, h * 1.4), transform: `translate(-50%, -50%) scale(${h})` }}>
        <HandHeart size={260} color={T.main} strokeWidth={1.3} />
      </div>
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "skeptical" }, { at: 130, e: "stop" }, { at: 220, e: "shrug" },
  { at: 315, e: "explaining" }, { at: 430, e: "smile-up" },
  { at: 520, e: "dreamy" }, { at: 620, e: "soft-smile" }, { at: 720, e: "delighted" }, { at: 860, e: "thumbs-up" }, { at: 990, e: "laughing" }, { at: 1100, e: "clapping" }, { at: 1190, e: "hand-on-heart" }, { at: 1280, e: "pensive" },
  { at: 1350, e: "present-left" }, { at: 1430, e: "point-down" }, { at: 1520, e: "point-up" }, { at: 1610, e: "heart-hands" },
  { at: 1725, e: "surprised" }, { at: 1810, e: "puzzled" }, { at: 1900, e: "facepalm" },
  { at: 2010, e: "explaining" }, { at: 2085, e: "inspired" }, { at: 2140, e: "displeased" }, { at: 2230, e: "disappointed" },
  { at: 2340, e: "listening" }, { at: 2440, e: "shush" }, { at: 2515, e: "point-right" }, { at: 2580, e: "thinking" },
  { at: 2650, e: "victory" }, { at: 2735, e: "arms-crossed" }, { at: 2815, e: "waving" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "arms-crossed" }, { at: 115, e: "stop" }, { at: 210, e: "explaining" },
  { at: 320, e: "shush" }, { at: 440, e: "smile-up" },
  { at: 540, e: "pensive" }, { at: 640, e: "thinking" }, { at: 740, e: "delighted" }, { at: 870, e: "point-up" }, { at: 1000, e: "surprised" }, { at: 1110, e: "thumbs-up" }, { at: 1200, e: "hand-on-heart" }, { at: 1290, e: "dreamy" },
  { at: 1360, e: "soft-smile" }, { at: 1440, e: "laughing" }, { at: 1530, e: "present-left" }, { at: 1620, e: "heart-hands" },
  { at: 1715, e: "displeased" }, { at: 1840, e: "shrug" }, { at: 1930, e: "facepalm" },
  { at: 2020, e: "listening" }, { at: 2095, e: "inspired" }, { at: 2150, e: "disappointed" }, { at: 2240, e: "skeptical" },
  { at: 2330, e: "explaining" }, { at: 2420, e: "puzzled" }, { at: 2500, e: "point-right" }, { at: 2580, e: "point-down" },
  { at: 2665, e: "clapping" }, { at: 2750, e: "victory" }, { at: 2815, e: "heart-hands" }, { at: 2875, e: "waving" },
];

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(5)], Table],
  [[S(5), S(6)], Count],
  [[S(6), S(7)], Bill],
  [[S(7), S(8)], Crowned],
  [[S(8), S(9)], Moral],
  [[S(9), END + 30], Final],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 2,
  music: "v57/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v57/avatar",
  nods: { ahu: [f(3, "елкой"), f(3, "сила"), f(3, "накрыть"), f(3, "больше")], alicja: [f(3, "готовили"), f(3, "салаты"), f(3, "считал"), f(3, "больше") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    { src: "sfx2/typing.mp3", from: 30, volume: 0.08 },
    ...[40, 80, 120, 160].map((x) => ({ src: "sfx2/click.mp3", from: x, volume: 0.14 })),
    { src: "sfx/05_Distortion_Glitch.wav", from: f(1, "больше") + 8, volume: 0.04 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "прислал"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    ...[f(3, "готовили"), f(3, "елкой"), f(3, "сила"), f(3, "салаты"), f(3, "стол")].map((x) => ({ src: "sfx2/pop.mp3", from: x, volume: 0.14 })),
    { src: "sfx/03_Basscrack.wav", from: f(3, "считал"), volume: 0.06 },
    { src: "sfx/04_Cyber_Shift.wav", from: S(4) - 8, volume: 0.18 },
    { src: "sfx2/ding.mp3", from: f(4, "вместе"), volume: 0.16 },
    { src: "sfx/02_Alienated_Warpes.wav", from: S(5) - 8, volume: 0.14 },
    { src: "sfx2/typing.mp3", from: f(5, "заработал"), volume: 0.08 },
    { src: "sfx2/typing.mp3", from: f(5, "посуду"), volume: 0.08 },
    { src: "sfx/06_Ripple_Textures_II.wav", from: S(6) - 8, volume: 0.18 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(6, "другу") + 6, volume: 0.04 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(7) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(7, "первым") + 30, volume: 0.18 },
    { src: "sfx/07_CineStrike.wav", from: S(8) - 4, volume: 0.12 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(8, "счет") + 30, volume: 0.035 },
    { src: "sfx2/pop.mp3", from: f(9, "просьбы"), volume: 0.18 },
  ],
};

export const F = { duration: END };
export const Video57: React.FC = () => <TalkReel cfg={CFG} />;
