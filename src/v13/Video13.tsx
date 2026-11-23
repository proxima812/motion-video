import React from "react";
import { Img, staticFile } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, pop } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Мы не исчезаем" (@the_tatarverse, RU). Green accent from tatarverse.cc (palettes/green.css).
const G = { main: "#18734F", vivid: "#1C8259", glow: "#7CC5A6", ink: "#2e2e2f" };

/** Line drawn across text from left to right over [at, at + 14] */
const Strike: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = G.main, children }) => {
  const w = ease.out(progress(frame, at, at + 14));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 1 - 0.55 * w }}>{children}</span>
      <span style={{ position: "absolute", left: -10, top: "52%", height: 10, borderRadius: 5, width: `calc(${w * 100}% + 20px)`, background: color }} />
    </span>
  );
};

/** Horizontal meter "живой язык" shared by scenes 4 and 5 */
const Meter: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <Card style={{ width: 860, padding: "34px 44px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 600, marginBottom: 22 }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", color: value < 0.4 ? K.red : G.main }}>{Math.round(value * 100)}%</span>
    </div>
    <div style={{ height: 26, borderRadius: 13, background: K.elevated, overflow: "hidden" }}>
      <div style={{ width: `${value * 100}%`, height: "100%", borderRadius: 13, background: value < 0.4 ? K.red : G.main }} />
    </div>
  </Card>
);

/* ───────── Scenes ───────── */

// 1. Hook: the quote; "исчезнете?" dissolves upward letter by letter
// word starts = VO line 1 word timings (8 + offset)
const QUOTE = ["Зачем", "сохранять", "язык", "и", "культуру,", "если", "вы", "все", "равно"];
const QUOTE_AT = [4, 28, 59, 78, 89, 128, 141, 150, 165];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const mark = pop(frame, 0, SPRING.bouncy);
  const word = "исчезнете?";
  const wordIn = springAt(frame, F.vanish - 14, SPRING.smooth);
  return (
    <>
      <Center y={470}>
        <div style={{ ...mark.style, fontSize: 260, fontWeight: 800, lineHeight: 1, color: G.main, height: 170 }}>“</div>
      </Center>
      <Center y={680}>
        <div style={{ maxWidth: 940, textAlign: "center", fontSize: 92, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, color: G.ink }}>
          {QUOTE.map((w, i) => {
            const t = springAt(frame, QUOTE_AT[i], SPRING.smooth);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
                {w}
              </span>
            );
          })}
          <span style={{ display: "inline-block", opacity: Math.min(1, wordIn * 1.5) }}>
            {word.split("").map((c, i) => {
              const d = progress(frame, F.vanish + 8 + i * 4, F.vanish + 40 + i * 4);
              return (
                <span key={i} style={{ display: "inline-block", color: G.main, opacity: 1 - d * 0.92, filter: `blur(${d * 12}px)`, transform: `translateY(${-d * 70}px)` }}>
                  {c}
                </span>
              );
            })}
          </span>
        </div>
      </Center>
    </>
  );
};

// 2. What people say: comment bubbles, then "как все" grid with one green dot that stays itself
const Bubble: React.FC<{ frame: number; at: number; side: "l" | "r"; tag: string; children: React.ReactNode }> = ({ frame, at, side, tag, children }) => {
  const p = pop(frame, at, SPRING.bouncy);
  if (p.t <= 0) return null;
  return (
    <div style={{ ...p.style, alignSelf: side === "l" ? "flex-start" : "flex-end", display: "flex", flexDirection: "column", alignItems: side === "l" ? "flex-start" : "flex-end", gap: 12 }}>
      <Pill style={{ fontSize: 38, padding: "10px 26px" }}>{tag}</Pill>
      <div style={{ fontSize: 52, fontWeight: 600, padding: "28px 40px", borderRadius: 44, background: side === "l" ? K.elevated : G.ink, color: side === "l" ? K.text : "#fff", maxWidth: 760 }}>{children}</div>
    </div>
  );
};

const Said: React.FC<{ frame: number }> = ({ frame }) => {
  const gridIn = F.likeAll + 6;
  const bubblesOut = progress(frame, gridIn - 10, gridIn);
  const cols = 6;
  return (
    <>
      <Center y={520}>
        <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 36, opacity: 1 - bubblesOut, filter: bubblesOut > 0 ? `blur(${bubblesOut * 12}px)` : undefined }}>
          <Bubble frame={frame} at={F.direct} side="l" tag="прямо">зачем вам свой язык?</Bubble>
          <Bubble frame={frame} at={F.joke} side="r" tag="в шутку 😅">ну стань уже как все</Bubble>
        </div>
      </Center>
      {frame >= gridIn - 4 && (
        <Center y={500}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 90px)`, gap: 26 }}>
            {Array.from({ length: 36 }, (_, i) => {
              const special = i === 20;
              const t = springAt(frame, gridIn + ((i % cols) + Math.floor(i / cols)) * 2, SPRING.bouncy);
              const look = progress(frame, F.likeAllWord + 20, F.likeAllWord + 40);
              return (
                <div
                  key={i}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    background: special ? G.main : "#D9DBDF",
                    opacity: Math.min(1, t * 1.6),
                    transform: `scale(${t * (special ? 1 + look * 0.18 : 1)})`,
                    boxShadow: special ? `0 0 ${look * 60}px ${G.glow}` : undefined,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 44,
                  }}
                >
                  {special ? "🙂" : "😐"}
                </div>
              );
            })}
          </div>
        </Center>
      )}
    </>
  );
};

// 3. Not because it is outdated
const Reason: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.reasonIn + 10, SPRING.smooth);
  return (
    <Center y={720}>
      <Card style={{ ...card.style, padding: "60px 80px", textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: K.muted, marginBottom: 20 }}>культура</div>
        <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "-0.05em", color: G.ink }}>
          <Strike frame={frame} at={F.outdated + 30}>устарела</Strike>
        </div>
      </Card>
    </Center>
  );
};

// 4. Real causes: three cards, the meter drains
const CAUSES = [
  { at: F.silent, icon: "🔇", text: "перестают говорить" },
  { at: F.ashamed, icon: "🙈", text: "стесняются корней" },
  { at: F.noPass, icon: "👶", text: "не передают детям" },
];
const Causes: React.FC<{ frame: number }> = ({ frame }) => {
  const meterIn = pop(frame, F.causesIn + 8, SPRING.smooth);
  const v = CAUSES.reduce((acc, c, i) => lerp(acc, [0.72, 0.45, 0.18][i], ease.out(progress(frame, c.at + 4, c.at + 34))), 1);
  return (
    <>
      <Center y={500}>
        <div style={meterIn.style}><Meter value={v} label="живой язык" /></div>
      </Center>
      {CAUSES.map((c, i) => {
        const p = pop(frame, c.at, SPRING.bouncy);
        if (p.t <= 0) return null;
        return (
          <Center key={c.text} y={730 + i * 160}>
            <Card style={{ ...p.style, width: 860, padding: "30px 44px", display: "flex", alignItems: "center", gap: 30 }}>
              <span style={{ fontSize: 64 }}>{c.icon}</span>
              <span style={{ fontSize: 52, fontWeight: 600 }}>{c.text}</span>
            </Card>
          </Center>
        );
      })}
    </>
  );
};

// 5. What we do: checklist, meter refills, three community logos meet
const DOING = [
  { at: F.create, text: "создаем проекты" },
  { at: F.learn, text: "учим языки" },
  { at: F.record, text: "записываем историю" },
  { at: F.find, text: "находим друг друга" },
];
const ICONS = ["tt", "bs", "qt"];
const We: React.FC<{ frame: number }> = ({ frame }) => {
  const v = DOING.reduce((acc, d, i) => lerp(acc, [0.4, 0.6, 0.8, 1][i], ease.out(progress(frame, d.at + 20, d.at + 50))), 0.18);
  const meet = springAt(frame, F.find + 30, SPRING.smooth);
  return (
    <>
      <Center y={470}>
        <Meter value={v} label="живой язык" />
      </Center>
      <Center y={690}>
        <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 26 }}>
          {DOING.map((d) => {
            const p = pop(frame, d.at - 4, SPRING.smooth);
            const done = springAt(frame, d.at + 18, SPRING.bouncy);
            return (
              <div key={d.text} style={{ ...p.style, display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, flex: "none", display: "grid", placeItems: "center", background: done > 0.5 ? G.main : K.elevated, color: "#fff", fontSize: 40, fontWeight: 700, transform: `scale(${0.8 + 0.2 * Math.min(done, 1.2)})` }}>
                  {done > 0.5 ? "✓" : ""}
                </div>
                <div style={{ fontSize: 56, fontWeight: 600 }}>{d.text}</div>
              </div>
            );
          })}
        </div>
      </Center>
      <Center y={1150}>
        <div style={{ display: "flex", gap: lerp(260, 36, meet), opacity: Math.min(1, meet * 1.5) }}>
          {ICONS.map((k) => (
            <Card key={k} style={{ width: 120, height: 120, borderRadius: 34, display: "grid", placeItems: "center" }}>
              <Img src={staticFile(`tatarverse/icons/${k}.svg`)} style={{ width: 76, height: 76, objectFit: "contain" }} />
            </Card>
          ))}
        </div>
      </Center>
    </>
  );
};

// 6. Not to close off, not to live in the past, but a place in the future
const Future: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.closed - 6, SPRING.smooth);
  const b = pop(frame, F.past - 10, SPRING.smooth);
  const pillsOut = progress(frame, F.butFor, F.butFor + 12);
  const big = pop(frame, F.place - 6, SPRING.bouncy);
  const line = ease.out(progress(frame, F.future + 6, F.future + 30));
  return (
    <>
      <Center y={560}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, opacity: 1 - pillsOut * 0.75, transform: `translateY(${-pillsOut * 60}px) scale(${1 - pillsOut * 0.15})` }}>
          <div style={a.style}>
            <Pill style={{ fontSize: 56, padding: "22px 46px", color: K.text }}>
              <Strike frame={frame} at={F.closed + 40} color={K.red}>🔒 закрыться от мира</Strike>
            </Pill>
          </div>
          <div style={b.style}>
            <Pill style={{ fontSize: 56, padding: "22px 46px", color: K.text }}>
              <Strike frame={frame} at={F.past + 26} color={K.red}>⏪ жить прошлым</Strike>
            </Pill>
          </div>
        </div>
      </Center>
      <Center y={920}>
        <div style={{ ...big.style, textAlign: "center" }}>
          <div style={{ fontSize: 44, fontWeight: 600, color: K.muted, marginBottom: 6 }}>а чтобы у нас было</div>
          <div style={{ fontSize: 124, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, color: G.ink }}>
            место
            <br />
            <span style={{ position: "relative", color: G.main }}>
              в будущем
              <span style={{ position: "absolute", left: 0, bottom: -6, height: 14, borderRadius: 7, width: `${line * 100}%`, background: G.glow, opacity: 0.7 }} />
            </span>
          </div>
        </div>
      </Center>
    </>
  );
};

// 7. Final: three verbs light up, then "мы не исчезаем." with the logo
const VERBS = [
  { at: F.speak, text: "говорим" },
  { at: F.make, text: "создаем" },
  { at: F.pass, text: "передаем" },
];
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const verbsOut = progress(frame, F.notVanish - 12, F.notVanish);
  const end = pop(frame, F.notVanish - 4, SPRING.bouncy);
  return (
    <>
      <Center y={560}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: 1 - verbsOut * 0.8, transform: `translateY(${-verbsOut * 80}px) scale(${1 - verbsOut * 0.2})` }}>
          {VERBS.map((v) => {
            const p = pop(frame, v.at - 4, SPRING.bouncy);
            const lit = progress(frame, v.at + 6, v.at + 18);
            return (
              <div key={v.text} style={{ ...p.style, fontSize: 112, fontWeight: 800, letterSpacing: "-0.05em", color: lit > 0.5 ? G.main : K.dim }}>
                {v.text}
              </div>
            );
          })}
        </div>
      </Center>
      <Center y={1060}>
        <div style={{ ...end.style, fontSize: 130, fontWeight: 800, letterSpacing: "-0.05em", color: G.ink, textAlign: "center", lineHeight: 1 }}>
          мы не <span style={{ color: G.main }}>исчезаем.</span>
        </div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES = [
  { range: [0, F.saidIn] as const, El: Hook },
  { range: [F.saidIn, F.reasonIn] as const, El: Said },
  { range: [F.reasonIn, F.causesIn] as const, El: Reason },
  { range: [F.causesIn, F.weIn] as const, El: Causes },
  { range: [F.weIn, F.notIn] as const, El: We },
  { range: [F.notIn, F.finalIn] as const, El: Future },
  { range: [F.finalIn, F.duration + 30] as const, El: Final },
];

const HEADLINES = [
  { from: 0, text: "" },
  { from: F.saidIn + 6, text: "Такое говорят малым народам" },
  { from: F.likeAll, text: "Почему не стать «как\u00a0все»?" },
  { from: F.reasonIn + 6, text: "Культура исчезает не потому, что" },
  { from: F.causesIn + 6, text: "А потому, что люди" },
  { from: F.weIn + 6, text: "Поэтому мы" },
  { from: F.notIn + 6, text: "Не для того, чтобы" },
  { from: F.butFor, text: "" },
  { from: F.finalIn + 6, text: "Пока мы" },
];

const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.22 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.vanish + 6, volume: 0.2 },
  // scene transitions: textures from the SFX/ library instead of whoosh
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.saidIn - 8, volume: 0.22 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.reasonIn - 8, volume: 0.25 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.causesIn - 8, volume: 0.16 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.weIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.notIn - 8, volume: 0.22 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.finalIn - 8, volume: 0.25 },
  { src: "sfx2/pop.mp3", from: F.direct + 2, volume: 0.35 },
  { src: "sfx2/pop.mp3", from: F.joke + 2, volume: 0.35 },
  ...Array.from({ length: 6 }, (_, i) => ({ src: "sfx2/click.mp3", from: F.likeAll + 8 + i * 4, volume: 0.2 })),
  { src: "sfx2/ding.mp3", from: F.likeAllWord + 22, volume: 0.3 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.outdated + 28, volume: 0.05 },
  ...CAUSES.map((c) => ({ src: "sfx/03_Basscrack.wav", from: c.at + 2, volume: 0.12 })),
  ...DOING.map((d) => ({ src: "sfx2/ding.mp3", from: d.at + 20, volume: 0.28 })),
  { src: "sfx2/pop.mp3", from: F.find + 32, volume: 0.35 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.closed + 38, volume: 0.04 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.past + 24, volume: 0.04 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.place - 6, volume: 0.18 },
  ...VERBS.map((v) => ({ src: "sfx2/pop.mp3", from: v.at + 4, volume: 0.3 })),
  { src: "sfx/07_CineStrike.wav", from: F.notVanish - 4, volume: 0.22 },
];

// Host emotion follows the voice, a swap every ~2 s; repeats allowed, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-traditional" },
  { at: 150, e: "kalpak-green" },
  { at: F.saidIn, e: "confident-emerald" },
  { at: F.direct, e: "portrait-traditional" },
  { at: F.why, e: "kalpak-green" },
  { at: F.likeAllWord + 20, e: "confident-traditional" },
  { at: F.reasonIn, e: "portrait-traditional" },
  { at: F.outdated, e: "confident-traditional" },
  { at: F.silent, e: "kalpak-green" },
  { at: F.ashamed, e: "portrait-traditional" },
  { at: F.noPass, e: "kalpak-green" },
  { at: F.weIn, e: "portrait-green" },
  { at: F.learn, e: "confident-emerald" },
  { at: F.find, e: "portrait-green" },
  { at: F.notIn, e: "kalpak-green" },
  { at: F.past, e: "portrait-traditional" },
  { at: F.place - 6, e: "smile-green" },
  { at: F.finalIn, e: "confident-emerald" },
  { at: F.pass, e: "portrait-green" },
  { at: F.notVanish, e: "confident-emerald" },
];
const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} />;

export const Video13: React.FC = () => (
  <ReelShell scenes={SCENES} headlines={HEADLINES} headlineSize={76} vo={VO} sfx={SFX} duration={F.duration} music="v13/music/bed.mp3" musicLevel={[0.045, 0.11]} shift={30} overlay={Host} />
);
