import React from "react";
import { Img, staticFile } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, count, pop, shake } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Только на Сабантуе" (@the_tatarverse, RU). Ochre / gold accent: holiday, traditions.
const G = { main: "#8A5A0B", vivid: "#C98A12", glow: "#F0CF7A", ink: "#2e2e2f" };

/** Line drawn across text from left to right over [at, at + 14] */
const Strike: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = K.red, children }) => {
  const w = ease.out(progress(frame, at, at + 14));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 1 - 0.55 * w }}>{children}</span>
      <span style={{ position: "absolute", left: -10, top: "52%", height: 10, borderRadius: 5, width: `calc(${w * 100}% + 20px)`, background: color }} />
    </span>
  );
};

/** Year as 365 dots; `lit(i)` returns 0..1 gold fill per day, day 0 is Sabantuy */
const COLS = 27;
const Year: React.FC<{ frame: number; at: number; lit: (i: number) => number; size?: number }> = ({ frame, at, lit, size = 26 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, ${size}px)`, gap: size * 0.22 }}>
    {Array.from({ length: 365 }, (_, i) => {
      const t = springAt(frame, at + (i % COLS) * 0.6 + Math.floor(i / COLS) * 1.2, SPRING.smooth);
      const g = lit(i);
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            background: g > 0.5 ? G.vivid : "#E3E4E7",
            opacity: Math.min(1, t * 1.6),
            transform: `scale(${t * (1 + (g > 0.5 ? 0.12 : 0))})`,
            boxShadow: g > 0.5 && i === 0 ? `0 0 ${size}px ${G.glow}` : undefined,
          }}
        />
      );
    })}
  </div>
);

/* ───────── Scenes ───────── */

// 1. Hook: the admission, word by word; "Сабантуе" lands as a festive gold sticker
const HOOK = ["о", "своей", "культуре", "мы", "вспоминаем", "только\u00a0на"];
const HOOK_AT = [126, 130, 152, 183, 189, 231];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const top = pop(frame, 0, SPRING.smooth);
  const sticker = springAt(frame, F.sabantuy - 4, SPRING.bouncy);
  return (
    <>
      <Center y={460}>
        <div style={{ ...top.style, fontSize: 80, fontWeight: 700, color: G.main, letterSpacing: "-0.04em" }}>Никто не хочет признавать,</div>
      </Center>
      <Center y={590}>
        <div style={{ maxWidth: 960, textAlign: "center", fontSize: 96, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, color: G.ink }}>
          {HOOK.map((w, i) => {
            const t = springAt(frame, HOOK_AT[i], SPRING.smooth);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
                {w}
              </span>
            );
          })}
        </div>
      </Center>
      <Center y={950}>
        <div
          style={{
            opacity: Math.min(1, sticker * 1.6),
            transform: `rotate(${lerp(-18, -4, sticker)}deg) scale(${lerp(1.6, 1, Math.min(sticker, 1.1))})`,
            padding: "26px 60px",
            borderRadius: 40,
            background: G.vivid,
            color: "#fff",
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            boxShadow: `0 30px 70px -20px ${G.glow}`,
          }}
        >
          🎉 Сабантуе
        </div>
      </Center>
    </>
  );
};

// 2. One day a year: the holiday kit pops into a single calendar card
const KIT = [
  { at: F.clothes, icon: "👘", text: "национальная одежда" },
  { at: F.music, icon: "🎶", text: "татарская музыка" },
  { at: F.food, icon: "🍯", text: "традиционные блюда" },
  { at: F.proud, icon: "💛", text: "«гордимся корнями»" },
];
const OneDay: React.FC<{ frame: number }> = ({ frame }) => {
  const cal = pop(frame, F.oneDay, SPRING.bouncy);
  return (
    <>
      <Center y={420}>
        <Card style={{ ...cal.style, width: 300, overflow: "hidden", textAlign: "center", borderRadius: 36 }}>
          <div style={{ background: G.vivid, color: "#fff", fontSize: 34, fontWeight: 700, padding: "12px 0" }}>Сабантуй</div>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.05em", color: G.ink, padding: "4px 0 10px" }}>1</div>
        </Card>
      </Center>
      <Center y={720}>
        <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 22 }}>
          {KIT.map((k, i) => {
            const p = pop(frame, k.at - 4, SPRING.bouncy);
            const last = i === KIT.length - 1;
            return (
              <Card key={k.text} style={{ ...p.style, padding: "24px 40px", display: "flex", alignItems: "center", gap: 28, background: last ? G.ink : K.surface, color: last ? "#fff" : K.text }}>
                <span style={{ fontSize: 60 }}>{k.icon}</span>
                <span style={{ fontSize: 50, fontWeight: 600 }}>{k.text}</span>
              </Card>
            );
          })}
        </div>
      </Center>
    </>
  );
};

// 3. The other 364 days: a year of grey dots, one gold; the counter runs up
const Rest: React.FC<{ frame: number }> = ({ frame }) => {
  const n = count(frame, F.count - 6, F.days + 10, 0, 364);
  const q = springAt(frame, F.days + 6, SPRING.bouncy);
  return (
    <>
      <Center y={440}>
        <Year frame={frame} at={F.restIn + 4} lit={(i) => (i === 0 ? 1 : 0)} />
      </Center>
      <Center y={900}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, color: G.ink }}>
          <span style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.06em", fontVariantNumeric: "tabular-nums" }}>{n}</span>
          <span style={{ fontSize: 80, fontWeight: 700, color: K.muted }}>дня</span>
          <span style={{ fontSize: 170, fontWeight: 800, color: G.vivid, display: "inline-block", opacity: Math.min(1, q * 1.5), transform: `rotate(${(1 - q) * 30 + Math.sin(frame / 9) * 6 * q}deg) scale(${q})` }}>?</span>
        </div>
      </Center>
    </>
  );
};

// 4. Culture is not only a holiday: the holiday pill shrinks, six tiles of everyday culture fill in
const PARTS = [
  { at: F.lang, icon: "🗣", text: "язык" },
  { at: F.family, icon: "📜", text: "история семьи" },
  { at: F.books, icon: "📚", text: "книги" },
  { at: F.songs, icon: "🎵", text: "музыка" },
  { at: F.cinema, icon: "🎬", text: "кино" },
  { at: F.people, icon: "👥", text: "люди" },
];
const ICONS = ["tt", "bs", "qt"];
const NotOnly: React.FC<{ frame: number }> = ({ frame }) => {
  const pill = pop(frame, F.holiday - 6, SPRING.bouncy);
  const small = ease.inOut(progress(frame, F.thisIs - 10, F.thisIs + 10));
  const meet = springAt(frame, F.create, SPRING.smooth);
  return (
    <>
      <Center y={420}>
        <div style={{ ...pill.style, transform: `${pill.style.transform} scale(${1 - small * 0.45})`, opacity: (pill.style.opacity as number) * (1 - small * 0.4) }}>
          <Pill style={{ fontSize: 76, fontWeight: 700, padding: "20px 50px", color: G.main, background: "#FBF1DA" }}>🎉 праздник</Pill>
        </div>
      </Center>
      <Center y={560}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 24 }}>
          {PARTS.map((p) => {
            const s = pop(frame, p.at - 4, SPRING.bouncy);
            return (
              <Card key={p.text} style={{ ...s.style, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 36 }}>
                <span style={{ fontSize: 76 }}>{p.icon}</span>
                <span style={{ fontSize: 40, fontWeight: 600, textAlign: "center", lineHeight: 1.05 }}>{p.text}</span>
              </Card>
            );
          })}
        </div>
      </Center>
      <Center y={1080}>
        <div style={{ display: "flex", alignItems: "center", gap: lerp(200, 28, meet), opacity: Math.min(1, meet * 1.5) }}>
          {ICONS.map((k) => (
            <Card key={k} style={{ width: 110, height: 110, borderRadius: 32, display: "grid", placeItems: "center" }}>
              <Img src={staticFile(`tatarverse/icons/${k}.svg`)} style={{ width: 70, height: 70, objectFit: "contain" }} />
            </Card>
          ))}
          <span style={{ fontSize: 46, fontWeight: 700, color: G.main, opacity: progress(frame, F.today - 4, F.today + 8) }}>сегодня</span>
        </div>
      </Center>
    </>
  );
};

// 5. A pretty decoration taken out once a year: gold frame fades to grey, "1 раз в год" stamp
const Decor: React.FC<{ frame: number }> = ({ frame }) => {
  const frameIn = pop(frame, F.decorIn + 8, SPRING.smooth);
  const fade = ease.inOut(progress(frame, F.vanish + 20, F.decor + 10));
  const shine = progress(frame, F.decor - 6, F.decor + 14);
  const stamp = springAt(frame, F.takeOut + 10, SPRING.bouncy);
  const gray = Math.max(fade * (1 - shine), progress(frame, F.year + 6, F.year + 40));
  return (
    <>
      <Center y={480}>
        <div style={{ ...frameIn.style, position: "relative" }}>
          <div
            style={{
              width: 760,
              height: 520,
              borderRadius: 30,
              border: `22px solid ${G.vivid}`,
              outline: `4px solid ${G.glow}`,
              outlineOffset: -38,
              background: "#FFFBF2",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxSizing: "border-box",
              filter: `grayscale(${gray}) opacity(${1 - gray * 0.55})`,
              boxShadow: `0 0 ${shine * 70}px ${G.glow}`,
            }}
          >
            <span style={{ fontSize: 110 }}>🏺</span>
            <span style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.05em", color: G.main }}>культура</span>
            <span style={{ fontSize: 36, fontWeight: 600, color: K.muted }}>красивая декорация</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: -40,
              bottom: -60,
              opacity: Math.min(1, stamp * 1.6),
              transform: `rotate(${lerp(-30, -10, stamp)}deg) scale(${lerp(1.8, 1, Math.min(stamp, 1.1))})`,
              padding: "16px 34px",
              border: `8px solid ${K.red}`,
              borderRadius: 24,
              color: K.red,
              fontSize: 54,
              fontWeight: 800,
              background: "rgba(255,255,255,0.92)",
            }}
          >
            1 раз в год
          </div>
        </div>
      </Center>
    </>
  );
};

// 6. Pride without action saves nothing: гордость + действия = сохраняем, then "действия" is crossed out and it drops to 0
const Pride: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.pride - 4, SPRING.bouncy);
  const ok = springAt(frame, F.important, SPRING.bouncy);
  const b = pop(frame, F.without - 14, SPRING.smooth);
  const res = pop(frame, F.nothing - 6, SPRING.bouncy);
  const sh = shake(frame, F.saves + 6, 16, 24);
  return (
    <Center y={460}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Card style={{ ...a.style, padding: "30px 56px", display: "flex", alignItems: "center", gap: 26 }}>
          <span style={{ fontSize: 64 }}>💛</span>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.04em" }}>гордость</span>
          <span style={{ width: 70, height: 70, borderRadius: 35, display: "grid", placeItems: "center", background: G.vivid, color: "#fff", fontSize: 40, fontWeight: 700, transform: `scale(${ok})` }}>✓</span>
        </Card>
        <div style={{ ...b.style, fontSize: 80, fontWeight: 700, color: K.dim }}>+</div>
        <Card style={{ ...b.style, padding: "30px 56px", display: "flex", alignItems: "center", gap: 26 }}>
          <span style={{ fontSize: 64 }}>🛠</span>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.04em" }}>
            <Strike frame={frame} at={F.without + 14}>действия</Strike>
          </span>
        </Card>
        <div style={{ ...res.style, fontSize: 80, fontWeight: 700, color: K.dim }}>=</div>
        <div style={{ ...res.style, transform: `${res.style.transform} translateX(${sh}px)`, fontSize: 110, fontWeight: 800, letterSpacing: "-0.05em", color: K.red }}>0 сохранено</div>
      </div>
    </Center>
  );
};

// 7. Actions: four checks; every check lights up more days of the year
const DOING = [
  { at: F.find, text: "находите сообщества" },
  { at: F.go, text: "ходите на мероприятия" },
  { at: F.learn, text: "учите язык" },
  { at: F.tell, text: "рассказывайте детям о корнях" },
];
const Doing: React.FC<{ frame: number }> = ({ frame }) => {
  const days = DOING.reduce((acc, d, i) => lerp(acc, [90, 180, 270, 365][i], ease.out(progress(frame, d.at + 18, d.at + 48))), 1);
  return (
    <>
      <Center y={420}>
        <Year frame={frame} at={F.doIn} size={20} lit={(i) => (i < days ? 1 : 0)} />
      </Center>
      <Center y={850}>
        <div style={{ width: 880, display: "flex", flexDirection: "column", gap: 24 }}>
          {DOING.map((d) => {
            const p = pop(frame, d.at - 6, SPRING.smooth);
            const done = springAt(frame, d.at + 16, SPRING.bouncy);
            return (
              <div key={d.text} style={{ ...p.style, display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{ width: 68, height: 68, borderRadius: 34, flex: "none", display: "grid", placeItems: "center", background: done > 0.5 ? G.vivid : K.elevated, color: "#fff", fontSize: 38, fontWeight: 700, transform: `scale(${0.8 + 0.2 * Math.min(done, 1.2)})` }}>
                  {done > 0.5 ? "✓" : ""}
                </div>
                <div style={{ fontSize: 52, fontWeight: 600 }}>{d.text}</div>
              </div>
            );
          })}
        </div>
      </Center>
    </>
  );
};

// 8. Final: the whole year is gold, "не один день в году", then a share card
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const big = pop(frame, F.live - 30, SPRING.bouncy);
  const line = ease.out(progress(frame, F.notOne + 10, F.notOne + 36));
  const card = pop(frame, F.share - 6, SPRING.bouncy);
  return (
    <>
      <Center y={410}>
        <Year frame={frame} at={F.finalIn} size={20} lit={() => 1} />
      </Center>
      <Center y={810}>
        <div style={{ ...big.style, textAlign: "center", fontSize: 104, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, color: G.ink }}>
          культура живет
          <br />
          <span style={{ position: "relative", color: G.main }}>
            не один день
            <span style={{ position: "absolute", left: 0, bottom: -4, height: 14, borderRadius: 7, width: `${line * 100}%`, background: G.glow, opacity: 0.8 }} />
          </span>
        </div>
      </Center>
      <Center y={1090}>
        <Card style={{ ...card.style, width: 860, padding: "30px 40px", display: "flex", alignItems: "center", gap: 28 }}>
          <span style={{ fontSize: 64 }}>📤</span>
          <span style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.2 }}>
            отправьте тем, кто вспоминает о&nbsp;ней только на <span style={{ color: G.main, fontWeight: 800 }}>Сабантуе</span>
          </span>
        </Card>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES = [
  { range: [0, F.dayIn] as const, El: Hook },
  { range: [F.dayIn, F.restIn] as const, El: OneDay },
  { range: [F.restIn, F.notOnlyIn] as const, El: Rest },
  { range: [F.notOnlyIn, F.decorIn] as const, El: NotOnly },
  { range: [F.decorIn, F.prideIn] as const, El: Decor },
  { range: [F.prideIn, F.doIn] as const, El: Pride },
  { range: [F.doIn, F.finalIn] as const, El: Doing },
  { range: [F.finalIn, F.duration + 30] as const, El: Final },
];

const HEADLINES = [
  { from: 0, text: "" },
  { from: F.dayIn + 6, text: "Один день в году мы" },
  { from: F.restIn + 6, text: "А что в остальные" },
  { from: F.notOnlyIn + 6, text: "Культура это не только" },
  { from: F.decorIn + 6, text: "Она исчезает, когда становится" },
  { from: F.prideIn + 6, text: "Гордость важна. Но" },
  { from: F.doIn + 6, text: "Не ждите праздника" },
  { from: F.finalIn + 6, text: "" },
];

const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.22 },
  { src: "sfx/03_Basscrack.wav", from: F.sabantuy - 2, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: F.sabantuy, volume: 0.3 },
  // scene transitions: textures from the SFX/ library, no whoosh
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.dayIn - 8, volume: 0.22 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.restIn - 8, volume: 0.25 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.notOnlyIn - 8, volume: 0.16 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.decorIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.prideIn - 8, volume: 0.22 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.doIn - 8, volume: 0.25 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.finalIn - 8, volume: 0.2 },
  ...KIT.map((k) => ({ src: "sfx2/pop.mp3", from: k.at, volume: 0.3 })),
  { src: "sfx2/ding.mp3", from: F.days + 8, volume: 0.28 },
  ...PARTS.map((p) => ({ src: "sfx2/click.mp3", from: p.at, volume: 0.25 })),
  { src: "sfx2/pop.mp3", from: F.create + 4, volume: 0.3 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.vanish + 22, volume: 0.04 },
  { src: "sfx/03_Basscrack.wav", from: F.takeOut + 12, volume: 0.14 },
  { src: "sfx2/ding.mp3", from: F.important + 2, volume: 0.28 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.without + 12, volume: 0.05 },
  { src: "sfx/03_Basscrack.wav", from: F.saves + 4, volume: 0.14 },
  ...DOING.map((d) => ({ src: "sfx2/ding.mp3", from: d.at + 16, volume: 0.28 })),
  { src: "sfx/07_CineStrike.wav", from: F.live - 30, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.share - 4, volume: 0.3 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-traditional" },
  { at: 150, e: "confident-traditional" },
  { at: F.dayIn, e: "smile-green" },
  { at: F.music, e: "kalpak-green" },
  { at: F.proud, e: "confident-emerald" },
  { at: F.restIn, e: "portrait-traditional" },
  { at: F.days, e: "kalpak-green" },
  { at: F.holiday, e: "confident-traditional" },
  { at: F.family, e: "smile-green" },
  { at: F.songs, e: "portrait-green" },
  { at: F.people, e: "smile-green" },
  { at: F.decorIn, e: "portrait-traditional" },
  { at: F.decor, e: "kalpak-green" },
  { at: F.prideIn, e: "confident-emerald" },
  { at: F.without, e: "portrait-traditional" },
  { at: F.doIn, e: "smile-green" },
  { at: F.go + 20, e: "confident-emerald" },
  { at: F.tell, e: "portrait-green" },
  { at: F.finalIn, e: "confident-traditional" },
  { at: F.share, e: "smile-green" },
];
const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={G.main} />;

export const Video14: React.FC = () => (
  <ReelShell scenes={SCENES} headlines={HEADLINES} headlineSize={76} vo={VO} sfx={SFX} duration={F.duration} music="v14/music/bed.mp3" musicLevel={[0.045, 0.11]} shift={30} overlay={Host} />
);
