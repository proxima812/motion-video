import React from "react";
import { ArrowRight, BookOpen, Check, DoorClosed, DoorOpen, Hand, Laugh, Mic, MicOff, Scale } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { Stamp } from "../catalog/own/surfaces";
import { Strike } from "../catalog/own/text";
import { NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import type { AvatarKey } from "../kit/TatAvatar";
import { Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V58 «Ты не настоящий татарин» (@the_tatarverse, talk series #5, RU). The man's voice message: "don't speak Tatar - not
// a Tatar; married a non-Tatar - not a Tatar girl; so we push away those who wanted to come back". Both hosts tell their
// own story (mocked for an accent; "too late for you"). Hook #9. Moral: judging closes the door, an invitation opens it.
// Palette: plum. Dot Orbit variant 3 (mint).
const T: Palette = { main: "#5B2C83", vivid: "#8A4FBF", glow: "#D2B8EC", pale: "#F4EEFA", plate: "linear-gradient(135deg, #8A4FBF, #5B2C83)", gray: "#E6E0EC", muted: "#857C8E" };
const RED = "#C62828";
const OTHER = "#4A5B7A";

const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);

const Chip: React.FC<{ frame: number; at: number; x: number; y: number; color?: string; size?: number; children: React.ReactNode }> = ({ frame, at: a, x, y, color, size = 42, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: "translateX(-50%)" }}>
    <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: size, padding: "20px 30px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 16, color: color ?? PARAGRAPH.color, ...appear(frame, a, SPRING.bouncy) }}>{children}</div>
  </div>
);

/** A door that swings shut (open = 1 -> 0) or open, light spilling out when open */
const Door: React.FC<{ open: number; x: number; y: number; color: string; glow: string }> = ({ open, x, y, color, glow }) => (
  <div style={{ position: "absolute", left: x - 130, top: y, width: 260, height: 400, perspective: 900 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: `linear-gradient(${glow}, #fff)`, boxShadow: `0 0 ${80 * open}px ${glow}` }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: color, transformOrigin: "0 50%", transform: `rotateY(${-75 * open}deg)` }}>
      <div style={{ position: "absolute", right: 26, top: 190, width: 22, height: 22, borderRadius: "50%", background: "#fff" }} />
    </div>
  </div>
);

/* 1. Hook: a stamp "ненастоящий" slams onto a face - and is crossed out */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const x = springAt(frame, f(1, "татарин") + 16, SPRING.bouncy);
  return (
    <>
      <Title text="никогда не говори человеку" frame={frame} at={0} size={88} />
      <div style={{ position: "absolute", left: 540, top: 700 }}>
        <Face color={T.main} size={240} smile={lerp(0.3, -0.5, progress(frame, f(1, "ненастоящий"), f(1, "ненастоящий") + 20))} style={{ left: 0, top: 0, ...appear(frame, 6) }} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 880, width: "max-content", transform: "translateX(-50%)" }}>
        <Stamp frame={frame} at={f(1, "ненастоящий")} size={64} rot={-8}>ненастоящий</Stamp>
      </div>
      <div style={{ position: "absolute", left: 540, top: 920, transform: `translateX(-50%) scaleX(${x})`, width: 560, height: 12, borderRadius: 6, background: RED, opacity: Math.min(1, x * 1.4) }} />
    </>
  );
};

/* 2-3. The voice message: the two "verdicts", then pushing away those who wanted to come back, then the closed door */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [S(3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "прислал"), SPRING.bouncy);
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const p2 = f(3, "так");
  const p3 = f(3, "я");
  const push = ease.inOut(progress(frame, f(3, "отталкиваем"), f(3, "отталкиваем") + 30));
  const come = ease.out(progress(frame, p2, f(3, "отталкиваем")));
  const shut = 1 - ease.inOut(progress(frame, f(3, "больше"), f(3, "приходили") + 20));
  const verdict = (y: number, a: number, b: number, lhs: string, rhs: string) => (
    <>
      <Chip frame={frame} at={a} x={290} y={y}>{lhs}</Chip>
      <div style={{ position: "absolute", left: 560, top: y + 22, ...appear(frame, b - 8) }}><ArrowRight size={50} color={T.muted} /></div>
      <Chip frame={frame} at={b} x={800} y={y} color={RED}><Strike frame={frame} at={b + 4}>{rhs}</Strike></Chip>
    </>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * fadeOut(frame, S(3) - 20) }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Еще одно голосовое
        </GlassPlate>
      </div>
      {frame < p2 + 10 && (
        <div style={{ opacity: fadeOut(frame, p2 - 6) }}>
          {verdict(300, f(3, "говоришь"), f(3, "татарин"), "не говоришь", "не татарин")}
          {verdict(520, f(3, "вышла"), f(3, "татарка"), "вышла не за", "не татарка")}
        </div>
      )}
      {frame >= p2 - 4 && frame < p3 + 10 && (
        <div style={{ opacity: fadeOut(frame, p3 - 4) }}>
          <Title text="хотел *вернуться*" frame={frame} at={[f(3, "хотел"), f(3, "вернуться")]} size={96} />
          <div style={{ position: "absolute", left: lerp(lerp(200, 560, come), 220, push), top: 640, ...appear(frame, p2) }}>
            <Face color={OTHER} size={150} smile={lerp(0.5, -0.5, push)} style={{ left: 0, top: 0 }} />
          </div>
          <div style={{ position: "absolute", left: 800, top: 560, ...appear(frame, p2 + 10) }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: [0, 110, 55][i], top: [0, 20, 120][i] }}>
                <Face color={T.main} size={110} smile={-0.2} style={{ left: 0, top: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 650, top: 620, width: "max-content", transform: `translate(-50%, -50%) rotate(-90deg) scale(${springAt(frame, f(3, "отталкиваем") - 6, SPRING.bouncy)})` }}>
            <Hand size={120} color={RED} strokeWidth={1.6} />
          </div>
        </div>
      )}
      {frame >= p3 - 4 && (
        <>
          <Title text="больше *не приходили*" frame={frame} at={[f(3, "больше"), f(3, "не", 4), f(3, "приходили")]} size={92} />
          <div style={appear(frame, p3)}>
            <Door open={shut} x={540} y={430} color={T.main} glow={T.glow} />
          </div>
        </>
      )}
      <VoiceNote frame={frame} at={f(2, "голосовое")} play={play} y={lerp(640, 920, down)} label="Голосовое" />
    </>
  );
};

/* 4. Ahu: mocked for an accent - laughing icons around her "Сәлам"; half a year afraid to speak */
const Accent: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(4, "я");
  const months = Math.round(lerp(0, 6, ease.out(progress(frame, f(4, "полгода"), f(4, "полгода") + 50))));
  return (
    <>
      {frame < t2 + 10 && (
        <div style={{ opacity: fadeOut(frame, t2 - 4) }}>
          <Title text="высмеяли за *акцент*" frame={frame} at={[f(4, "высмеяли"), f(4, "за"), f(4, "акцент")]} size={96} />
          <div style={{ position: "absolute", left: 540, top: 560, width: "max-content", ...appear(frame, S(4), SPRING.bouncy, "translateX(-50%)") }}>
            <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 80, padding: 44, color: T.main }}>Сәлам</div>
          </div>
          {[0, 1, 2, 3].map((i) => {
            const t = springAt(frame, f(4, "высмеяли") + i * 8, SPRING.bouncy);
            return (
              <div key={i} style={{ position: "absolute", left: [230, 850, 260, 820][i], top: [480, 470, 820, 830][i], transform: `translate(-50%, -50%) scale(${t}) rotate(${Math.sin(frame / 5 + i) * 10}deg)`, opacity: Math.min(1, t * 1.4) }}>
                <Laugh size={100} color={OTHER} strokeWidth={1.6} />
              </div>
            );
          })}
        </div>
      )}
      {frame >= t2 - 2 && (
        <>
          <Title text="полгода *боялась* говорить" frame={frame} at={[f(4, "полгода"), f(4, "боялась"), f(4, "открыть")]} size={88} />
          <div style={{ position: "absolute", left: 540, top: 470, width: "max-content", display: "flex", alignItems: "center", gap: 50, ...appear(frame, t2, undefined, "translateX(-50%)") }}>
            <div style={{ ...SURFACE, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 260 }}>
              <span style={{ ...NUMBER, fontSize: 150, color: T.main }}>{months}</span>
              <span style={{ ...PARAGRAPH, fontSize: 38, color: T.muted }}>месяцев</span>
            </div>
            <MicOff size={170} color={RED} strokeWidth={1.4} style={appear(frame, f(4, "рот"), SPRING.bouncy)} />
          </div>
        </>
      )}
    </>
  );
};

/* 5. Alicja: quit after "too late for you", came back three years later */
const TooLate: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(5, "вернулась");
  const years = Math.round(lerp(0, 3, ease.out(progress(frame, f(5, "три") - 10, f(5, "года") + 20))));
  return (
    <>
      {frame < t2 + 10 && (
        <div style={{ opacity: fadeOut(frame, t2 - 4) }}>
          <Title text="бросила учить *язык*" frame={frame} at={[f(5, "бросила"), f(5, "учить"), f(5, "язык")]} size={96} />
          <div style={{ position: "absolute", left: 540, top: 560, width: "max-content", ...appear(frame, f(5, "поздно"), SPRING.bouncy, "translateX(-50%)") }}>
            <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 64, padding: 44, color: RED, whiteSpace: "nowrap" }}>поздно тебе уже</div>
          </div>
          <div style={{ position: "absolute", left: 540, top: 820, width: "max-content", ...appear(frame, f(5, "бросила"), undefined, "translateX(-50%)"), opacity: 0.4 }}>
            <BookOpen size={180} color={T.muted} strokeWidth={1.2} />
          </div>
        </div>
      )}
      {frame >= t2 - 2 && (
        <>
          <Title text="вернулась через *три года*" frame={frame} at={[f(5, "вернулась"), f(5, "через"), f(5, "три"), f(5, "года")]} size={88} />
          <div style={{ position: "absolute", left: 540, top: 470, width: "max-content", display: "flex", alignItems: "center", gap: 50, ...appear(frame, t2, undefined, "translateX(-50%)") }}>
            <div style={{ ...SURFACE, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 260 }}>
              <span style={{ ...NUMBER, fontSize: 150, color: T.main }}>{years}</span>
              <span style={{ ...PARAGRAPH, fontSize: 38, color: T.muted }}>года</span>
            </div>
            <BookOpen size={170} color={T.main} strokeWidth={1.4} style={appear(frame, f(5, "года"), SPRING.bouncy)} />
          </div>
        </>
      )}
    </>
  );
};

/* 6. Judging never made anyone a Tatar - it just closes the door */
const Closes: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(6, "оно");
  const shut = 1 - ease.inOut(progress(frame, f(6, "закрывает"), f(6, "дверь") + 20));
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="осуждение никого не *сделало татарином*" frame={frame} at={[f(6, "осуждение"), f(6, "никого"), f(6, "не"), f(6, "сделало"), f(6, "татарином")]} size={80} /></div>}
      {frame >= t2 - 2 && <Title text="оно *закрывает дверь*" frame={frame} at={[f(6, "оно"), f(6, "закрывает"), f(6, "дверь")]} size={96} />}
      <div style={appear(frame, S(6))}>
        <Door open={shut} x={540} y={480} color={T.main} glow={T.glow} />
      </div>
      <div style={{ position: "absolute", left: 830, top: 800, opacity: Math.min(1, springAt(frame, S(6) + 10, SPRING.bouncy) * 1.4) }}>
        <Face color={OTHER} size={130} smile={lerp(0.3, -0.5, 1 - shut)} style={{ left: 0, top: 0 }} />
      </div>
    </>
  );
};

/* 7. An invitation opens it: "приходи научим" beats "как тебе не стыдно" */
const Opens: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const open = ease.inOut(progress(frame, f(7, "открывает") - 6, f(7, "открывает") + 30));
  const t2 = f(7, "приходи");
  return (
    <>
      {frame < t2 + 10 && (
        <div style={{ opacity: fadeOut(frame, t2 - 4) }}>
          <Title text="приглашение *открывает*" frame={frame} at={[f(7, "приглашение"), f(7, "открывает")]} size={96} />
          <Door open={open} x={540} y={480} color={T.main} glow={T.glow} />
        </div>
      )}
      {frame >= t2 - 2 && (
        <>
          <Title text="работает *лучше*" frame={frame} at={[f(7, "работает"), f(7, "лучше")]} size={96} />
          <Chip frame={frame} at={f(7, "приходи")} x={540} y={430} color={T.main} size={56}>
            <Check size={56} color={T.main} strokeWidth={3} /> приходи научим
          </Chip>
          <Chip frame={frame} at={f(7, "как")} x={540} y={640} size={48}>
            <Strike frame={frame} at={f(7, "стыдно")}>как тебе не стыдно</Strike>
          </Chip>
          <div style={{ position: "absolute", left: 540, top: 900, ...appear(frame, f(7, "лучше")) }}>
            <DoorOpen size={150} color={T.vivid} strokeWidth={1.4} style={{ position: "absolute", left: -75, top: -75 }} />
          </div>
        </>
      )}
    </>
  );
};

/* 8. Moral: you don't push your own away - you call them: a group opens up and the newcomer joins */
const Moral: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const plate = springAt(frame, S(8) - 6, SPRING.bouncy);
  const t2 = f(8, "своих", 1);
  const join = ease.inOut(progress(frame, f(8, "зовут") - 10, f(8, "зовут") + 30));
  const ring = [T.main, T.vivid, T.main, T.vivid, T.main];
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="своих не ~отталкивают~" frame={frame} at={[f(8, "своих"), f(8, "не"), f(8, "отталкивают")]} size={96} top={320} /></div>}
      {frame >= t2 - 2 && <Title text="своих *зовут*" frame={frame} at={[f(8, "своих", 1), f(8, "зовут")]} size={120} top={320} />}
      {ring.map((c, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + (Math.PI * 2) / 12;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 220, top: 860 + Math.sin(a) * 200, ...appear(frame, S(8) + i * 5, SPRING.bouncy) }}>
            <Face color={c} size={110} smile={0.6} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: lerp(980, 540 + Math.cos(-Math.PI / 2 - Math.PI / 6 * 1) * 0 + Math.cos((5 / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6) * 220, join), top: lerp(1100, 860 + Math.sin((5 / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6) * 200, join), ...appear(frame, S(8) + 30) }}>
        <Face color={OTHER} size={110} smile={lerp(-0.2, 0.7, join)} style={{ left: 0, top: 0 }} />
      </div>
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "arms-crossed" }, { at: 100, e: "stop" }, { at: 175, e: "displeased" },
  { at: 280, e: "listening" }, { at: 400, e: "point-down" },
  { at: 500, e: "skeptical" }, { at: 610, e: "disappointed" }, { at: 700, e: "thinking" }, { at: 800, e: "facepalm" }, { at: 920, e: "shrug" }, { at: 1020, e: "soft-smile" }, { at: 1130, e: "puzzled" }, { at: 1240, e: "pensive" },
  { at: 1330, e: "laughing" }, { at: 1410, e: "explaining" }, { at: 1480, e: "shush" }, { at: 1580, e: "dreamy" },
  { at: 1655, e: "listening" }, { at: 1760, e: "surprised" }, { at: 1870, e: "thumbs-up" }, { at: 1945, e: "victory" },
  { at: 1995, e: "point-up" }, { at: 2090, e: "present-left" }, { at: 2160, e: "stop" },
  { at: 2290, e: "smile-up" }, { at: 2340, e: "point-right" }, { at: 2395, e: "clapping" }, { at: 2475, e: "delighted" }, { at: 2560, e: "heart-hands" },
  { at: 2645, e: "inspired" }, { at: 2705, e: "hand-on-heart" }, { at: 2775, e: "waving" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "skeptical" }, { at: 110, e: "thinking" }, { at: 185, e: "surprised" },
  { at: 280, e: "explaining" }, { at: 410, e: "pensive" },
  { at: 500, e: "listening" }, { at: 615, e: "displeased" }, { at: 710, e: "puzzled" }, { at: 815, e: "facepalm" }, { at: 935, e: "stop" }, { at: 1030, e: "hand-on-heart" }, { at: 1140, e: "arms-crossed" }, { at: 1250, e: "disappointed" },
  { at: 1340, e: "shrug" }, { at: 1440, e: "present-left" }, { at: 1520, e: "soft-smile" },
  { at: 1650, e: "laughing" }, { at: 1730, e: "point-down" }, { at: 1790, e: "point-up" }, { at: 1870, e: "smile-up" }, { at: 1935, e: "thumbs-up" },
  { at: 2000, e: "dreamy" }, { at: 2100, e: "shush" },
  { at: 2270, e: "inspired" }, { at: 2380, e: "delighted" }, { at: 2470, e: "heart-hands" }, { at: 2550, e: "point-right" },
  { at: 2655, e: "clapping" }, { at: 2720, e: "victory" }, { at: 2785, e: "waving" },
];

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(5)], Accent],
  [[S(5), S(6)], TooLate],
  [[S(6), S(7)], Closes],
  [[S(7), S(8)], Opens],
  [[S(8), END + 30], Moral],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 3,
  music: "v58/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v58/avatar",
  nods: { ahu: [f(3, "татарин"), f(3, "татарка"), f(3, "своему"), f(3, "приходили")], alicja: [f(3, "татарин") + 8, f(3, "отталкиваем"), f(3, "своему") + 8, f(3, "приходили") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    { src: "sfx/03_Basscrack.wav", from: f(1, "ненастоящий"), volume: 0.08 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(1, "татарин") + 16, volume: 0.04 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "прислал"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    { src: "sfx2/pop.mp3", from: f(3, "говоришь"), volume: 0.14 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(3, "татарин") + 34, volume: 0.03 },
    { src: "sfx2/pop.mp3", from: f(3, "вышла"), volume: 0.14 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(3, "татарка") + 34, volume: 0.03 },
    { src: "sfx/03_Basscrack.wav", from: f(3, "отталкиваем"), volume: 0.07 },
    { src: "sfx/02_Alienated_Warpes.wav", from: f(3, "я") - 8, volume: 0.12 },
    { src: "sfx/04_Cyber_Shift.wav", from: S(4) - 8, volume: 0.18 },
    { src: "sfx2/pop.mp3", from: f(4, "высмеяли"), volume: 0.14 },
    { src: "sfx2/pop.mp3", from: f(4, "рот"), volume: 0.14 },
    { src: "sfx/06_Ripple_Textures_II.wav", from: S(5) - 8, volume: 0.18 },
    { src: "sfx2/pop.mp3", from: f(5, "поздно"), volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(5, "года"), volume: 0.16 },
    { src: "sfx/02_Alienated_Warpes.wav", from: S(6) - 8, volume: 0.14 },
    { src: "sfx/03_Basscrack.wav", from: f(6, "дверь") + 10, volume: 0.08 },
    { src: "sfx/01_Ripple_Textures.wav", from: S(7) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(7, "открывает"), volume: 0.18 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(7, "стыдно") + 30, volume: 0.035 },
    { src: "sfx/07_CineStrike.wav", from: S(8) - 4, volume: 0.12 },
    { src: "sfx2/pop.mp3", from: f(8, "зовут") + 20, volume: 0.18 },
  ],
};

export const F = { duration: END };
export const Video58: React.FC = () => <TalkReel cfg={CFG} />;
