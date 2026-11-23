import React from "react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, pop } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Tataro: целое приложение, один человек" (@the_tatarverse x @TatarTalkBot, RU). Teal accent: language + tech.
const G = { main: "#0E6B73", vivid: "#14919B", glow: "#8FD6DA", soft: "#E6F5F6", ink: "#2e2e2f" };

const Big: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 120, color = G.ink, style, children }) => (
  <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.02, color, textAlign: "center", ...style }}>{children}</div>
);

/* ───────── Scenes ───────── */

// 1. Hook: "Целое приложение." made of many parts, then they collapse into "Один человек."
const PARTS = ["бот", "приложение", "сервер", "уроки", "озвучка", "словарь", "поддержка", "дизайн"];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const title = pop(frame, 0, SPRING.bouncy);
  const merge = ease.inOut(progress(frame, F.one - 30, F.one + 4));
  const one = pop(frame, F.one, SPRING.bouncy);
  const glow = progress(frame, F.person, F.person + 20);
  return (
    <>
      <Center y={430}>
        <Big style={title.style}>Целое<br />приложение.</Big>
      </Center>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 360 }}>
        {PARTS.map((p, i) => {
          const t = springAt(frame, 40 + i * 14, SPRING.bouncy);
          const ang = (i / PARTS.length) * Math.PI * 2;
          const x = 540 + Math.cos(ang) * 360 * (1 - merge);
          const y = 170 + Math.sin(ang) * 140 * (1 - merge);
          return (
            <div key={p} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${t * (1 - merge * 0.6)})`, opacity: Math.min(1, t * 1.5) * (1 - merge) }}>
              <Pill style={{ fontSize: 40, padding: "14px 30px", color: K.text, background: "#F1F2F4" }}>{p}</Pill>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center" }}>
          <div style={{ ...one.style, padding: "26px 60px", borderRadius: 999, background: G.main, boxShadow: `0 0 ${glow * 80}px ${G.glow}` }}>
            <Big size={104} color="#fff">Один человек.</Big>
          </div>
        </div>
      </div>
    </>
  );
};

// 2. Gulnara: four roles stack up, then get stamped "в одном лице"
const ROLES = [
  { at: F.dev, t: "Разработчик", s: "бот, приложение, сервер" },
  { at: F.author, t: "Автор уроков", s: "уроки, тексты, озвучка" },
  { at: F.product, t: "Продакт", s: "решает, что делать дальше" },
  { at: F.support, t: "Поддержка", s: "читает каждый отзыв" },
];
const Gulnara: React.FC<{ frame: number }> = ({ frame }) => {
  const name = pop(frame, F.name - 4, SPRING.bouncy);
  const squeeze = ease.inOut(progress(frame, F.oneFace - 6, F.oneFace + 14));
  const stamp = springAt(frame, F.oneFace + 8, SPRING.bouncy);
  return (
    <>
      <Center y={420}>
        <Big size={96} style={name.style}>
          Сәлам! Я <span style={{ color: G.main }}>Гульнара</span>
        </Big>
      </Center>
      {ROLES.map((r, i) => {
        const p = pop(frame, r.at - 4, SPRING.smooth);
        if (p.t <= 0) return null;
        const y = lerp(600 + i * 150, 640 + i * 40, squeeze);
        return (
          <Center key={r.t} y={y}>
            <Card style={{ ...p.style, width: 860, padding: "26px 44px", transform: `${p.style.transform} rotate(${squeeze * (i - 1.5) * 2.5}deg)` }}>
              <div style={{ fontSize: 50, fontWeight: 700 }}>{r.t}</div>
              <div style={{ fontSize: 34, color: K.muted, marginTop: 4 }}>{r.s}</div>
            </Card>
          </Center>
        );
      })}
      {stamp > 0 && (
        <Center y={1010}>
          <div style={{ opacity: Math.min(1, stamp * 2), transform: `scale(${2 - stamp}) rotate(-6deg)`, padding: "18px 44px", borderRadius: 24, border: `8px solid ${G.main}`, color: G.main, fontSize: 64, fontWeight: 800, background: "#fff" }}>
            в одном лице
          </div>
        </Center>
      )}
    </>
  );
};

// 3. Why: dozens of apps for English vs one lonely slot for Tatar; then the best of three moves into Telegram
const BEST = [
  { at: F.duo, t: "Как Duolingo", s: "цель дня, серия" },
  { at: F.mem, t: "Как Memrise", s: "слово с озвучкой" },
  { at: F.anki, t: "Как Anki", s: "интервальные повторы" },
];
const Why: React.FC<{ frame: number }> = ({ frame }) => {
  const cmpOut = progress(frame, F.duo - 12, F.duo);
  const en = pop(frame, F.english - 4, SPRING.smooth);
  const tt = pop(frame, F.tatar - 4, SPRING.smooth);
  const empty = progress(frame, F.nothing, F.nothing + 20);
  const into = ease.inOut(progress(frame, F.tg - 10, F.tg + 16));
  const tg = pop(frame, F.tg - 2, SPRING.bouncy);
  return (
    <>
      {cmpOut < 1 && (
        <div style={{ opacity: 1 - cmpOut, filter: cmpOut > 0 ? `blur(${cmpOut * 12}px)` : undefined }}>
          <Center y={440}>
            <Card style={{ ...en.style, width: 880, padding: "30px 40px" }}>
              <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 20 }}>Английский</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 62px)", gap: 14 }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const t = springAt(frame, F.english + 10 + i * 2, SPRING.bouncy);
                  return <div key={i} style={{ width: 62, height: 62, borderRadius: 18, background: ["#58CC02", "#1CB0F6", "#FF4B4B", "#FFC800", "#CE82FF"][i % 5], transform: `scale(${t})` }} />;
                })}
              </div>
            </Card>
          </Center>
          <Center y={830}>
            <Card style={{ ...tt.style, width: 880, padding: "30px 40px" }}>
              <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 20 }}>Татарский</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 62, height: 62, borderRadius: 18, border: `4px dashed ${K.dim}`, boxSizing: "border-box" }} />
                <div style={{ fontSize: 40, fontWeight: 600, color: K.muted, opacity: empty }}>почти ничего</div>
              </div>
            </Card>
          </Center>
        </div>
      )}
      {BEST.map((b, i) => {
        const p = pop(frame, b.at - 4, SPRING.bouncy);
        if (p.t <= 0) return null;
        const y = lerp(430 + i * 175, 760, into);
        return (
          <Center key={b.t} y={y}>
            <Card style={{ ...p.style, width: 820, padding: "24px 40px", opacity: Math.min(1, p.t * 1.6) * (1 - into), transform: `${p.style.transform} scale(${1 - into * 0.5})` }}>
              <div style={{ fontSize: 48, fontWeight: 700 }}>{b.t}</div>
              <div style={{ fontSize: 34, color: K.muted }}>{b.s}</div>
            </Card>
          </Center>
        );
      })}
      {frame >= F.tg - 2 && (
        <Center y={940}>
          <div style={{ ...tg.style, display: "flex", alignItems: "center", gap: 24, padding: "26px 56px", borderRadius: 999, background: "#2AABEE", color: "#fff", fontSize: 64, fontWeight: 800, boxShadow: `0 0 ${into * 70}px rgba(42,171,238,0.5)` }}>
            ✈ Telegram
          </div>
        </Center>
      )}
    </>
  );
};

// 4. Under the hood: tap "Учить", the system tree draws below it
const NODES = [
  { at: F.bot, t: "Бот", s: "словарь" },
  { at: F.base, t: "База", s: "слова, уроки" },
  { at: F.voice, t: "Голос", s: "озвучка" },
  { at: F.ai, t: "ИИ", s: "перевод фраз" },
];
const Arch: React.FC<{ frame: number }> = ({ frame }) => {
  const btn = pop(frame, F.archIn + 6, SPRING.bouncy);
  const press = progress(frame, F.learn, F.learn + 6) - progress(frame, F.learn + 8, F.learn + 16);
  const stem = ease.out(progress(frame, F.inside, F.inside + 24));
  const srv = pop(frame, F.server - 4, SPRING.bouncy);
  const branch = ease.out(progress(frame, F.server + 10, F.server + 34));
  return (
    <>
      <Center y={420}>
        <div style={{ ...btn.style, transform: `${btn.style.transform} scale(${1 - press * 0.08})`, padding: "26px 90px", borderRadius: 999, background: G.main, color: "#fff", fontSize: 60, fontWeight: 800, boxShadow: `0 ${20 - press * 14}px 40px -16px ${G.main}` }}>
          Учить
        </div>
      </Center>
      <div style={{ position: "absolute", left: 537, top: 540, width: 6, height: 150 * stem, borderRadius: 3, background: G.glow }} />
      <Center y={700}>
        <Card style={{ ...srv.style, padding: "26px 60px", textAlign: "center", border: `3px solid ${G.main}` }}>
          <div style={{ fontSize: 52, fontWeight: 800 }}>Сервер Tataro</div>
          <div style={{ fontSize: 32, color: K.muted }}>мозг всей системы</div>
        </Card>
      </Center>
      <div style={{ position: "absolute", left: 537, top: 860, width: 6, height: 60 * branch, background: G.glow }} />
      <div style={{ position: "absolute", left: 540 - 345 * branch, top: 918, width: 690 * branch, height: 6, borderRadius: 3, background: G.glow }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 960, display: "flex", justifyContent: "space-between" }}>
        {NODES.map((n) => {
          const p = pop(frame, n.at - 4, SPRING.bouncy);
          return (
            <Card key={n.t} style={{ ...p.style, width: 225, padding: "24px 10px", textAlign: "center", background: G.soft, border: "none" }}>
              <div style={{ fontSize: 46, fontWeight: 800, color: G.main }}>{n.t}</div>
              <div style={{ fontSize: 28, color: K.muted, marginTop: 4 }}>{n.s}</div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

// 5. Path: vertical timeline grows dot by dot
const STEPS = [
  { at: F.pathIn + 16, t: "Бот-словарь", s: "русский ↔ татарский" },
  { at: F.summer, t: "Август 2026", s: "приложение «Учить», карточки" },
  { at: F.autumn, t: "Осень 2026", s: "грамматика и чтение" },
];
const Path: React.FC<{ frame: number }> = ({ frame }) => {
  const line = ease.out(progress(frame, F.pathIn + 16, F.autumn + 20));
  return (
    <>
      <div style={{ position: "absolute", left: 147, top: 470, width: 6, height: 480 * line, borderRadius: 3, background: G.glow }} />
      {STEPS.map((s, i) => {
        const p = pop(frame, s.at - 4, SPRING.bouncy);
        const lit = progress(frame, s.at + 4, s.at + 14);
        return (
          <div key={s.t} style={{ ...p.style, position: "absolute", left: 120, top: 440 + i * 230, display: "flex", gap: 44, alignItems: "flex-start" }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, flex: "none", background: lit > 0.5 ? G.main : K.elevated, boxShadow: `0 0 ${lit * 30}px ${G.glow}` }} />
            <div>
              <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: "-0.03em" }}>{s.t}</div>
              <div style={{ fontSize: 40, color: K.muted, marginTop: 4 }}>{s.s}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// 6. CTA: bot link card, review message gets "прочитано" ticks on "каждый"
const Cta: React.FC<{ frame: number }> = ({ frame }) => {
  const link = pop(frame, F.botName - 6, SPRING.bouncy);
  const msg = pop(frame, F.review - 4, SPRING.bouncy);
  const read = progress(frame, F.each, F.each + 10);
  return (
    <>
      <Center y={470}>
        <div style={{ ...link.style, width: 900, boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "36px 48px", borderRadius: 40, background: G.main, color: "#fff" }}>
          <span style={{ fontSize: 38, fontWeight: 600, opacity: 0.85 }}>Бот и приложение</span>
          <span style={{ fontSize: 52, fontWeight: 800 }}>t.me/TatarTalkBot</span>
        </div>
      </Center>
      <Center y={760}>
        <div style={{ ...msg.style, width: 900, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: 700, padding: "28px 40px", borderRadius: "44px 44px 12px 44px", background: G.soft, fontSize: 48, fontWeight: 600 }}>
            Рәхмәт! Мне нравится 🙌
            <div style={{ textAlign: "right", fontSize: 32, color: read > 0.5 ? G.vivid : K.dim, marginTop: 6 }}>{read > 0.5 ? "✓✓ прочитано" : "✓"}</div>
          </div>
        </div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES = [
  { range: [0, F.gulIn] as const, El: Hook },
  { range: [F.gulIn, F.whyIn] as const, El: Gulnara },
  { range: [F.whyIn, F.archIn] as const, El: Why },
  { range: [F.archIn, F.pathIn] as const, El: Arch },
  { range: [F.pathIn, F.ctaIn] as const, El: Path },
  { range: [F.ctaIn, F.duration + 30] as const, El: Cta },
];

const HEADLINES = [
  { from: 0, text: "" },
  { from: F.whyIn + 6, text: "Приложений для языка" },
  { from: F.tataro, text: "Tataro берет лучшее" },
  { from: F.archIn + 6, text: "Простая кнопка" },
  { from: F.inside, text: "Сложная система внутри" },
  { from: F.pathIn + 6, text: "Как рос Tataro" },
  { from: F.ctaIn + 6, text: "Попробуй сам" },
];

const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.22 },
  ...PARTS.map((_, i) => ({ src: "sfx2/click.mp3", from: 42 + i * 14, volume: 0.18 })),
  { src: "sfx/03_Basscrack.wav", from: F.one + 2, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.gulIn - 8, volume: 0.22 },
  ...ROLES.map((r) => ({ src: "sfx2/pop.mp3", from: r.at, volume: 0.3 })),
  { src: "sfx/07_CineStrike.wav", from: F.oneFace + 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.whyIn - 8, volume: 0.25 },
  { src: "sfx2/ding.mp3", from: F.nothing + 4, volume: 0.22 },
  ...BEST.map((b) => ({ src: "sfx2/pop.mp3", from: b.at, volume: 0.3 })),
  { src: "sfx/01_Ripple_Textures.wav", from: F.tg - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.archIn - 8, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.learn, volume: 0.4 },
  { src: "sfx/03_Basscrack.wav", from: F.server, volume: 0.12 },
  ...NODES.map((n) => ({ src: "sfx2/pop.mp3", from: n.at, volume: 0.28 })),
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.pathIn - 8, volume: 0.22 },
  ...STEPS.map((s) => ({ src: "sfx2/ding.mp3", from: s.at + 6, volume: 0.25 })),
  { src: "sfx/04_Cyber_Shift.wav", from: F.ctaIn - 8, volume: 0.25 },
  { src: "sfx2/pop.mp3", from: F.botName - 4, volume: 0.32 },
  { src: "sfx2/pop.mp3", from: F.review - 2, volume: 0.3 },
  { src: "sfx2/ding.mp3", from: F.each + 4, volume: 0.3 },
];

const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-traditional" },
  { at: 150, e: "kalpak-green" },
  { at: F.one, e: "confident-emerald" },
  { at: F.gulIn, e: "smile-green" },
  { at: F.author, e: "portrait-green" },
  { at: F.oneFace, e: "confident-traditional" },
  { at: F.whyIn, e: "kalpak-green" },
  { at: F.nothing, e: "portrait-traditional" },
  { at: F.tataro, e: "confident-emerald" },
  { at: F.anki, e: "portrait-green" },
  { at: F.archIn, e: "smile-green" },
  { at: F.server, e: "confident-traditional" },
  { at: F.ai, e: "kalpak-green" },
  { at: F.pathIn, e: "portrait-green" },
  { at: F.summer, e: "confident-emerald" },
  { at: F.autumn, e: "portrait-traditional" },
  { at: F.ctaIn, e: "smile-green" },
  { at: F.review, e: "confident-emerald" },
];
const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={G.main} />;

export const Video16: React.FC = () => (
  <ReelShell scenes={SCENES} headlines={HEADLINES} headlineSize={76} vo={VO} sfx={SFX} duration={F.duration} music="v16/music/bed.mp3" musicLevel={[0.045, 0.11]} shift={30} overlay={Host} />
);
