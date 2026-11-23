import React from "react";
import { EyeOff, Gift, Handshake, Heart, Lock, MessageCircle, Mic, Scale, Sparkles, Sprout, Thermometer } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import type { AvatarKey } from "../kit/TatAvatar";
import { Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V59 «Соцсети врут про отношения» (@the_tatarverse, talk series #6, RU). The man's voice message: social media shows a
// shop window, not life (no mortgage fights, no tiredness, no sick child at night), and people earn on it: courses that set
// men and women against each other - you pay with loneliness. Then the hosts take apart five myths, fact by fact.
// Hook #6. Moral: relationships don't look like reels - two tired people who still choose each other.
// Palette: indigo night. Dot Orbit variant 4 (sky).
const T: Palette = { main: "#3B3F8C", vivid: "#5A5FD0", glow: "#B9BBF2", pale: "#EEEFFC", plate: "linear-gradient(135deg, #5A5FD0, #3B3F8C)", gray: "#E1E2EE", muted: "#7D7F96" };
const MEN = "#4A5B7A";
const PINK = "#D9577A";

const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);

const Chip: React.FC<{ frame: number; at: number; x: number; y: number; color?: string; size?: number; children: React.ReactNode }> = ({ frame, at: a, x, y, color, size = 42, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: "translateX(-50%)" }}>
    <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: size, padding: "20px 30px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 16, color: color ?? PARAGRAPH.color, ...appear(frame, a, SPRING.bouncy) }}>{children}</div>
  </div>
);

/** A glossy "perfect couple" post: gradient photo, two faces, sparkles and a like counter */
const Post: React.FC<{ frame: number; at: number; x: number; y: number; w: number; likes: number; tint: [string, string] }> = ({ frame, at: a, x, y, w, likes, tint }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, ...appear(frame, a, SPRING.bouncy, "translateX(-50%)") }}>
    <div style={{ ...SURFACE, padding: 22 }}>
      <div style={{ position: "relative", height: w * 0.62, borderRadius: 18, background: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})`, overflow: "hidden" }}>
        <Face color="#fff" size={w * 0.2} smile={0.9} style={{ left: w * 0.36, top: w * 0.34, background: "rgba(255,255,255,0.35)" }} />
        <Face color="#fff" size={w * 0.2} smile={0.9} style={{ left: w * 0.56, top: w * 0.34, background: "rgba(255,255,255,0.35)" }} />
        <Sparkles size={w * 0.14} color="#fff" style={{ position: "absolute", right: 16, top: 14 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
        <Heart size={30} color={PINK} fill={PINK} />
        <span style={{ ...NUMBER, fontWeight: 400, fontSize: 28, color: "#7D7F96" }}>{likes.toLocaleString("ru-RU")}</span>
      </div>
    </div>
  </div>
);

/* 1. Hook: a feed of perfect-couple posts scrolling */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const scroll = ease.inOut(progress(frame, 40, 240)) * 260;
  return (
    <>
      <Title text="вся правда об *отношениях* из соцсетей" frame={frame} at={0} size={80} />
      {/* the feed scrolls inside its own window under the heading */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, height: 900, overflow: "hidden", WebkitMaskImage: "linear-gradient(transparent, #000 8%, #000 92%, transparent)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-scroll}px)` }}>
          <Post frame={frame} at={6} x={330} y={40} w={380} likes={48210} tint={[T.glow, PINK]} />
          <Post frame={frame} at={14} x={750} y={120} w={380} likes={91300} tint={["#FFD3A5", PINK]} />
          <Post frame={frame} at={22} x={330} y={460} w={380} likes={27650} tint={[T.vivid, T.glow]} />
          <Post frame={frame} at={30} x={750} y={540} w={380} likes={63400} tint={[PINK, T.glow]} />
          <Post frame={frame} at={38} x={330} y={880} w={380} likes={18900} tint={["#FFD3A5", T.vivid]} />
          <Post frame={frame} at={46} x={750} y={960} w={380} likes={75120} tint={[T.glow, "#FFD3A5"]} />
        </div>
      </div>
    </>
  );
};

/* 2-3. The voice message: a shop window, not life; what is hidden; the courses on both sides; you pay with loneliness */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [S(3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "прислал"), SPRING.bouncy);
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const p2 = f(3, "а", 1); // "А еще на этом зарабатывают"
  const p3 = f(3, "обе");
  const price = (a: number) => Math.round(lerp(0, 9990, ease.out(progress(frame, a, a + 40))));
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * fadeOut(frame, S(3) - 20) }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Длинное голосовое
        </GlassPlate>
      </div>
      {frame < p2 + 10 && (
        <div style={{ opacity: fadeOut(frame, p2 - 4) }}>
          {frame >= f(3, "не") - 4 && <Title text="не жизнь а *витрина*" frame={frame} at={[f(3, "не"), f(3, "жизнь"), f(3, "а"), f(3, "витрину")]} size={92} />}
          {([["ипотека", f(3, "ипотеки"), 300, 340], ["усталость", f(3, "усталости"), 780, 450], ["ребенок ночью", f(3, "ребенка"), 400, 590]] as const).map(([w, a, x, y], i) => (
            <Chip key={i} frame={frame} at={a} x={x} y={y} color={T.muted}>
              <EyeOff size={40} color={T.muted} /> {w}
            </Chip>
          ))}
        </div>
      )}
      {frame >= p2 - 4 && frame < p3 + 10 && (
        <div style={{ opacity: fadeOut(frame, p3 - 4) }}>
          <Title text="на этом *зарабатывают*" frame={frame} at={[f(3, "на"), f(3, "этом"), f(3, "зарабатывают")]} size={92} />
          {([[MEN, "курс для парней", f(3, "парней"), 300], [PINK, "курс для девушек", f(3, "девушек"), 780]] as const).map(([c, w, a, x], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: 440, width: 400, ...appear(frame, a, SPRING.bouncy, "translateX(-50%)") }}>
              <div style={{ ...SURFACE, padding: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, borderTop: `8px solid ${c}` }}>
                <span style={{ ...PARAGRAPH, fontSize: 38 }}>{w}</span>
                <span style={{ ...NUMBER, fontSize: 76, color: c }}>{price(a).toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {frame >= p3 - 4 && (
        <>
          <Title text="а платите вы *одиночеством*" frame={frame} at={[f(3, "а", 2), f(3, "платите"), f(3, "вы"), f(3, "одиночеством")]} size={84} />
          <div style={{ position: "absolute", left: 540, top: 480 }}>
            <Face color={T.main} size={170} smile={-0.6} style={{ left: 0, top: 0, ...appear(frame, f(3, "одиночеством")) }} />
          </div>
        </>
      )}
      <VoiceNote frame={frame} at={f(2, "голосовое")} play={play} y={lerp(640, 920, down)} label="Голосовое" />
    </>
  );
};

/** Myth N of 5: the myth card gets struck at `no`, the fact appears below with its icon */
const Myth: React.FC<{ frame: number; n: number; line: number; myth: string; no: number; fact: string; factAt: number[]; icon: React.ReactNode }> = ({ frame, n, line, myth, no, fact, factAt, icon }) => {
  const T = usePalette();
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, display: "flex", alignItems: "center", gap: 14, ...appear(frame, S(line) - 4, undefined, "translateX(-50%)"), width: "max-content" }}>
        <span style={{ ...PARAGRAPH, fontSize: 40, color: T.muted }}>миф</span>
        <span style={{ ...NUMBER, fontSize: 52, color: T.main }}>{n}</span>
        <span style={{ ...PARAGRAPH, fontSize: 40, color: T.muted }}>из 5</span>
      </div>
      <div style={{ position: "absolute", left: 540, top: 290, width: "max-content", ...appear(frame, S(line), SPRING.bouncy, "translateX(-50%)") }}>
        <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 56, padding: 40, whiteSpace: "nowrap" }}>
          <Strike frame={frame} at={no}>{myth}</Strike>
        </div>
      </div>
      <Title text={fact} frame={frame} at={factAt} size={84} top={560} />
      <div style={{ position: "absolute", left: 540, top: 900, ...appear(frame, factAt[factAt.length - 1], SPRING.bouncy, "translate(-50%, -50%)") }}>{icon}</div>
    </>
  );
};

const M1: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {frame < f(4, "если") - 4 && <Title text="давай по *фактам*" frame={frame} at={[f(4, "давай"), f(4, "по"), f(4, "фактам")]} size={100} top={420} />}
    {frame >= f(4, "если") - 6 && <Myth frame={frame} n={1} line={4} myth="если любит догадается" no={f(4, "нет")} fact="взрослые говорят *словами*" factAt={[f(4, "взрослые"), f(4, "говорят"), f(4, "словами")]} icon={<MessageCircle size={180} color="#3B3F8C" strokeWidth={1.3} />} />}
  </>
);
const M2: React.FC<{ frame: number }> = ({ frame }) => <Myth frame={frame} n={2} line={5} myth="ревнует значит любит" no={f(5, "нет")} fact="ревность это *контроль*" factAt={[f(5, "ревность"), f(5, "это"), f(5, "контроль")]} icon={<Lock size={170} color="#3B3F8C" strokeWidth={1.3} />} />;
const M3: React.FC<{ frame: number }> = ({ frame }) => <Myth frame={frame} n={3} line={6} myth="идеальные не ссорятся" no={f(6, "ссорятся", 1)} fact="важно уметь *мириться*" factAt={[f(6, "важно"), f(6, "умеют"), f(6, "мириться")]} icon={<Handshake size={180} color="#3B3F8C" strokeWidth={1.3} />} />;
const M4: React.FC<{ frame: number }> = ({ frame }) => (
  <Myth frame={frame} n={4} line={7} myth="любовь это подарки" no={f(7, "любовь", 1)} fact="кто рядом когда *болеешь*" factAt={[f(7, "кто"), f(7, "рядом"), f(7, "когда"), f(7, "болеешь")]} icon={<div style={{ display: "flex", gap: 40, alignItems: "center" }}><Gift size={120} color="#B9BBF2" strokeWidth={1.3} /><Thermometer size={160} color="#3B3F8C" strokeWidth={1.3} /></div>} />
);
const M5: React.FC<{ frame: number }> = ({ frame }) => <Myth frame={frame} n={5} line={8} myth="не подходит следующий" no={f(8, "идеальных")} fact="есть те кто *готов стараться*" factAt={[f(8, "есть"), f(8, "те"), f(8, "кто"), f(8, "готов"), f(8, "стараться")]} icon={<Sprout size={180} color="#3B3F8C" strokeWidth={1.3} />} />;

/* 9. Moral: not like in reels - two tired people who still choose each other */
const Moral: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const plate = springAt(frame, S(9) - 6, SPRING.bouncy);
  const t2 = f(9, "это");
  const lean = ease.inOut(progress(frame, f(9, "выбирают") - 10, f(9, "выбирают") + 30));
  const h = springAt(frame, f(9, "друга"), SPRING.bouncy);
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="не как в ~рилсах~" frame={frame} at={[f(9, "не"), f(9, "как"), f(9, "рилсах")]} size={110} top={320} /></div>}
      {frame >= t2 - 2 && <Title text="двое уставших *выбирают друг друга*" frame={frame} at={[f(9, "двое"), f(9, "уставших"), f(9, "выбирают"), f(9, "друг"), f(9, "друга")]} size={84} top={320} />}
      {[0, 1].map((s) => (
        <div key={s} style={{ position: "absolute", left: lerp(s ? 780 : 300, s ? 625 : 455, lean), top: 900, ...appear(frame, S(9) + s * 8, SPRING.bouncy) }}>
          <Face color={s ? T.main : MEN} size={200} smile={lerp(0, 0.6, lean)} style={{ left: 0, top: 0, transform: `rotate(${(s ? -1 : 1) * 12 * lean}deg)` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 540, top: 700, opacity: Math.min(1, h * 1.4), transform: `translate(-50%, -50%) scale(${h})` }}>
        <Heart size={120} color={T.main} fill={T.vivid} strokeWidth={1.4} />
      </div>
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "skeptical" }, { at: 120, e: "surprised" },
  { at: 250, e: "waving" }, { at: 370, e: "shush" },
  { at: 500, e: "listening" }, { at: 620, e: "thinking" }, { at: 740, e: "displeased" }, { at: 860, e: "disappointed" }, { at: 960, e: "hand-on-heart" }, { at: 1060, e: "facepalm" }, { at: 1200, e: "arms-crossed" }, { at: 1360, e: "shrug" }, { at: 1530, e: "point-down" }, { at: 1650, e: "pensive" },
  { at: 1780, e: "point-up" }, { at: 1880, e: "puzzled" }, { at: 2000, e: "stop" }, { at: 2075, e: "thumbs-up" },
  { at: 2150, e: "laughing" }, { at: 2300, e: "present-left" }, { at: 2400, e: "point-right" },
  { at: 2520, e: "soft-smile" }, { at: 2650, e: "smile-up" }, { at: 2790, e: "clapping" },
  { at: 2870, e: "dreamy" }, { at: 3060, e: "inspired" }, { at: 3170, e: "hand-on-heart" },
  { at: 3360, e: "delighted" }, { at: 3500, e: "victory" },
  { at: 3570, e: "explaining" }, { at: 3720, e: "pensive" }, { at: 3860, e: "heart-hands" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "arms-crossed" }, { at: 105, e: "explaining" }, { at: 175, e: "point-down" },
  { at: 260, e: "listening" }, { at: 400, e: "soft-smile" },
  { at: 530, e: "pensive" }, { at: 640, e: "skeptical" }, { at: 760, e: "disappointed" }, { at: 880, e: "thinking" }, { at: 975, e: "hand-on-heart" }, { at: 1080, e: "surprised" }, { at: 1210, e: "displeased" }, { at: 1380, e: "facepalm" }, { at: 1540, e: "shrug" }, { at: 1690, e: "pensive" },
  { at: 1770, e: "point-up" }, { at: 1850, e: "dreamy" }, { at: 1985, e: "stop" }, { at: 2060, e: "present-left" },
  { at: 2160, e: "listening" }, { at: 2300, e: "point-right" }, { at: 2410, e: "thumbs-up" },
  { at: 2510, e: "smile-up" }, { at: 2650, e: "laughing" }, { at: 2760, e: "inspired" },
  { at: 2880, e: "puzzled" }, { at: 3070, e: "hand-on-heart" }, { at: 3190, e: "clapping" },
  { at: 3240, e: "explaining" }, { at: 3370, e: "shush" }, { at: 3500, e: "delighted" },
  { at: 3600, e: "listening" }, { at: 3720, e: "heart-hands" }, { at: 3830, e: "victory" }, { at: 3900, e: "waving" },
];

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(5)], M1],
  [[S(5), S(6)], M2],
  [[S(6), S(7)], M3],
  [[S(7), S(8)], M4],
  [[S(8), S(9)], M5],
  [[S(9), END + 30], Moral],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 4,
  music: "v59/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v59/avatar",
  nods: { ahu: [f(3, "витрину"), f(3, "ночью"), f(3, "должен"), f(3, "одиночеством")], alicja: [f(3, "витрину") + 8, f(3, "деньги"), f(3, "курсы"), f(3, "одиночеством") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    ...[6, 14, 22, 30].map((x) => ({ src: "sfx2/pop.mp3", from: x, volume: 0.1 })),
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "прислал"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    ...[f(3, "ипотеки"), f(3, "усталости"), f(3, "ребенка")].map((x) => ({ src: "sfx2/pop.mp3", from: x, volume: 0.14 })),
    { src: "sfx/02_Alienated_Warpes.wav", from: f(3, "а", 1) - 8, volume: 0.12 },
    { src: "sfx2/typing.mp3", from: f(3, "парней"), volume: 0.08 },
    { src: "sfx2/typing.mp3", from: f(3, "девушек"), volume: 0.08 },
    { src: "sfx/03_Basscrack.wav", from: f(3, "одиночеством"), volume: 0.07 },
    ...[4, 5, 6, 7, 8].map((i) => ({ src: i % 2 ? "sfx/04_Cyber_Shift.wav" : "sfx/06_Ripple_Textures_II.wav", from: S(i) - 8, volume: 0.16 })),
    ...[f(4, "нет"), f(5, "нет"), f(6, "ссорятся", 1), f(7, "любовь", 1), f(8, "идеальных")].map((x) => ({ src: "sfx/05_Distortion_Glitch.wav", from: x + 30, volume: 0.035 })),
    ...[f(4, "словами"), f(5, "контроль"), f(6, "мириться"), f(7, "болеешь"), f(8, "стараться")].map((x) => ({ src: "sfx2/ding.mp3", from: x, volume: 0.14 })),
    { src: "sfx/07_CineStrike.wav", from: S(9) - 4, volume: 0.12 },
    { src: "sfx2/pop.mp3", from: f(9, "друга"), volume: 0.18 },
  ],
};

export const F = { duration: END };
export const Video59: React.FC = () => <TalkReel cfg={CFG} />;
