import React from "react";
import { TactileGlassWord, TactilePromptInput } from "tactile-glass-ui";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { Card, Center, GLASS, K, Pill, Pointer, ReelShell, Vo, count, leave, pop, shake } from "../kit/reel";
import { F as F5, VO as VO5 } from "./timeline";

// "Vibe startup": shared by Video5 (RU) and Video6 (EN)
type T = typeof F5;

export const RU = {
  prompt: "сделай мне стартап. быстро",
  placeholder: "Опиши свою идею",
  agent: "Вайб-кодер",
  mode: "Без тестов",
  done: "✓ Готово",
  secs: "за 9.8 сек",
  checklist: "Чеклист запуска",
  items: ["Красивый интерфейс", "Идеальная архитектура", "Stripe подключен", "Тесты"],
  later: "потом",
  signup: "Регистрация",
  email: "me@startup.ai",
  button: "Зарегистрироваться",
  fixPrompt: "почини регистрацию плз",
  rebuilding: "Пересобираю приложение…",
  rebuiltDone: "Приложение пересобрано",
  changed: "Изменено файлов",
  removed: "Удалено файлов",
  empty: "пусто",
  ready: "Готово к проду",
  zeros: ["0 файлов", "0 багов", "0 ошибок 500"],
  headlines: (F: T) => [
    { from: 14, text: "Стартап за 10 секунд." },
    { from: F.done, text: "И она все сделала!" },
    { from: F.uiIn + 6, text: "Все идеально." },
    { from: F.testing, text: "Осталось протестировать." },
    { from: F.signupIn + 6, text: "Жму «Регистрация»." },
    { from: F.error, text: "Ошибка 500." },
    { from: F.fixAsk, text: "Ладно, пусть исправит." },
    { from: F.rebuildIn + 6, text: "Нейросеть все пересобрала." },
    { from: F.prodIn, text: "Теперь готово к продакшену." },
  ],
};

export type Strings = typeof RU;

const FILES = ["auth.ts", "signup.tsx", "billing.ts", "stripe.ts", "db.ts", "api/users.ts", "Button.tsx", "landing.tsx", "schema.prisma", "README.md", "package.json", "middleware.ts"];

const Check: React.FC<{ t: number; size?: number; color?: string }> = ({ t, size = 56, color = K.green }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, border: `4px solid ${t > 0 ? color : K.border}`, background: t > 0 ? color : "transparent", display: "grid", placeItems: "center", flex: "none", boxSizing: "border-box" }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - Math.min(1, t))} />
    </svg>
  </div>
);

/* ───────── Scenes ───────── */

const Ask = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const typed = S.prompt.slice(0, Math.round(S.prompt.length * progress(frame, 16, F.submit - 12)));
  const press = springAt(frame, F.submit, SPRING.snappy) * (1 - springAt(frame, F.submit + 6, SPRING.snappy));
  const timer = pop(frame, F.submit + 4, SPRING.smooth);
  const left = Math.max(0.2, 10 - 9.8 * ease.in(progress(frame, F.submit + 6, F.done - 4)));
  const ring = 1 - left / 10;
  const done = pop(frame, F.done, SPRING.bouncy);
  const isDone = frame >= F.done;
  return (
    <>
      <Center y={520}>
        <div style={{ transform: `scale(${1.62 * (1 - press * 0.03)})`, transformOrigin: "top center", width: 580 }}>
          <TactilePromptInput {...GLASS} value={typed} placeholder={S.placeholder} agentLabel={S.agent} modeLabel={S.mode} />
        </div>
      </Center>
      {frame >= F.submit && (
        <Center y={860}>
          <div style={{ ...timer.style, position: "relative", width: 440, height: 440 }}>
            <svg width={440} height={440} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx={220} cy={220} r={196} fill="none" stroke={K.elevated} strokeWidth={22} />
              <circle cx={220} cy={220} r={196} fill="none" stroke={isDone ? K.green : K.text} strokeWidth={22} strokeLinecap="round" strokeDasharray={2 * Math.PI * 196} strokeDashoffset={2 * Math.PI * 196 * (1 - ring)} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              {isDone ? (
                <div style={{ ...done.style, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: "-0.04em", color: K.green }}>{S.done}</div>
                  <div style={{ fontSize: 38, fontWeight: 500, color: K.muted }}>{S.secs}</div>
                </div>
              ) : (
                <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{left.toFixed(1)}</div>
              )}
            </div>
          </div>
        </Center>
      )}
    </>
  );
};

const Checklist = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.uiIn + 2, SPRING.smooth);
  const at = [F.ui, F.arch, F.stripe];
  const test = springAt(frame, F.testing, SPRING.bouncy);
  const blink = frame > F.testing ? 0.5 + 0.5 * Math.sin((frame - F.testing) / 5) : 0;
  return (
    <Center y={560}>
      <Card style={{ ...card.style, width: 900, padding: "44px 50px" }}>
        <div style={{ fontSize: 34, fontWeight: 600, color: K.muted, marginBottom: 20 }}>{S.checklist}</div>
        {S.items.map((it, i) => {
          const isTest = i === 3;
          const t = isTest ? 0 : springAt(frame, at[i], SPRING.bouncy);
          const row = isTest ? pop(frame, F.testing - 30, SPRING.smooth) : pop(frame, at[i] - 14, SPRING.smooth);
          return (
            <div
              key={it}
              style={{
                ...row.style,
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "26px 0",
                borderTop: i ? `1px solid ${K.border}` : undefined,
                transform: `${row.style.transform} scale(${isTest ? 1 + test * 0.04 : 1})`,
              }}
            >
              {isTest ? (
                <div style={{ width: 56, height: 56, borderRadius: 28, border: `4px dashed ${test > 0 ? `rgba(255,59,48,${0.4 + blink * 0.6})` : K.border}`, boxSizing: "border-box" }} />
              ) : (
                <Check t={t} />
              )}
              <span style={{ fontSize: 50, fontWeight: 600, letterSpacing: "-0.02em", color: isTest ? K.muted : K.text }}>{it}</span>
              {isTest && test > 0 && <Pill style={{ marginLeft: "auto", opacity: Math.min(1, test), fontSize: 30 }}>{S.later}</Pill>}
            </div>
          );
        })}
      </Card>
    </Center>
  );
};

const Signup = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.signupIn + 2, SPRING.smooth);
  const dx = shake(frame, F.error, 26, 30);
  const err = pop(frame, F.error, SPRING.bouncy);
  const ask = pop(frame, F.fixAsk, SPRING.smooth);
  const typed = S.fixPrompt.slice(0, Math.round(S.fixPrompt.length * progress(frame, F.fixAsk + 10, F.fixAsk + 70)));
  const formOut = leave(frame, F.fixAsk - 4);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, ...formOut }}>
        <Center y={540} style={{ transform: `translateX(${dx}px)` }}>
          <Card style={{ ...card.style, width: 860, padding: "48px 52px" }}>
            <div style={{ fontSize: 60, fontWeight: 700, letterSpacing: "-0.03em" }}>{S.signup}</div>
            {[S.email, "••••••••••"].map((v) => (
              <div key={v} style={{ marginTop: 28, padding: "28px 32px", borderRadius: 24, background: K.elevated, fontSize: 40, color: K.text }}>
                {v}
              </div>
            ))}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", height: 120, alignItems: "center" }}>
              <div style={{ padding: "28px 64px", borderRadius: 999, background: K.text, color: "#fff", fontSize: 42, fontWeight: 600, transform: `scale(${1 - 0.05 * springAt(frame, F.click - 4, SPRING.snappy) * (1 - springAt(frame, F.click + 4, SPRING.snappy))})` }}>
                {S.button}
              </div>
            </div>
          </Card>
        </Center>
        {frame >= F.error - 2 && (
          <Center y={1180}>
            <Card style={{ ...err.style, width: 860, padding: "40px 52px", border: `3px solid ${K.red}`, display: "flex", alignItems: "center", gap: 36 }}>
              <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.05em", color: K.red, lineHeight: 1 }}>500</div>
              <div style={{ fontSize: 40, fontWeight: 600, color: K.text, lineHeight: 1.2 }}>
                Internal
                <br />
                Server Error
              </div>
            </Card>
          </Center>
        )}
      </div>
      {frame >= F.fixAsk - 2 && (
        <Center y={760}>
          <div style={{ ...ask.style }}>
            <div style={{ transform: "scale(1.62)", transformOrigin: "top center", width: 580 }}>
              <TactilePromptInput {...GLASS} value={typed} placeholder="" agentLabel={S.agent} modeLabel={S.mode} />
            </div>
          </div>
        </Center>
      )}
      <Pointer
        frame={frame}
        show={[F.signupIn + 10, F.error + 20]}
        keys={[
          { f: F.signupIn + 10, x: 860, y: 1300 },
          { f: F.click - 6, x: 560, y: 1010 },
        ]}
        clicks={[F.click]}
      />
    </>
  );
};

const Rebuild = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.rebuildIn + 2, SPRING.smooth);
  const work = ease.inOut(progress(frame, F.rebuildIn + 6, F.zero - 10));
  const done = frame >= F.zero - 10;
  const zero = pop(frame, F.zero, SPRING.bouncy);
  const del = pop(frame, F.deleted, SPRING.bouncy);
  const n = count(frame, F.n847, F.n847 + 50, 0, 847);
  const scroll = Math.max(0, frame - F.rebuildIn) * 0.6;
  const struck = (i: number) => frame >= F.deleted;
  return (
    <>
      <Center y={540}>
        <Card style={{ ...card.style, width: 900, padding: "44px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 600, letterSpacing: "-0.015em" }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: `4px solid ${done ? K.text : K.border}`,
                borderTopColor: K.text,
                transform: `rotate(${frame * 14}deg)`,
                background: done ? K.text : "transparent",
                boxSizing: "border-box",
                flex: "none",
              }}
            />
            {done ? S.rebuiltDone : S.rebuilding}
          </div>
          <div style={{ marginTop: 30, height: 12, borderRadius: 6, background: K.elevated, overflow: "hidden" }}>
            <div style={{ width: `${work * 100}%`, height: "100%", borderRadius: 6, background: K.text }} />
          </div>
          <div style={{ marginTop: 26, height: 210, overflow: "hidden", fontFamily: K.mono, fontSize: 32, position: "relative" }}>
            <div style={{ transform: `translateY(${-(scroll % 42)}px)` }}>
              {Array.from({ length: 6 }, (_, i) => {
                const f = FILES[(Math.floor(scroll / 42) + i) % FILES.length];
                return (
                  <div key={i} style={{ height: 42, lineHeight: "42px", whiteSpace: "nowrap", color: struck(i) ? K.red : K.muted, textDecoration: struck(i) ? "line-through" : undefined }}>
                    {struck(i) ? "−" : "~"} src/{f}
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#fff 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, #fff 100%)" }} />
          </div>
        </Card>
      </Center>
      <Center y={1010} style={{ gap: 30 }}>
        <Card style={{ ...zero.style, width: 435, padding: "34px 38px" }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: K.muted }}>{S.changed}</div>
          <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.1 }}>0</div>
        </Card>
        <Card style={{ ...del.style, width: 435, padding: "34px 38px", border: `3px solid ${K.red}` }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: K.muted }}>{S.removed}</div>
          <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.1, color: K.red, fontVariantNumeric: "tabular-nums" }}>{n}</div>
        </Card>
      </Center>
    </>
  );
};

const Prod = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const tree = pop(frame, F.prodIn + 4, SPRING.smooth);
  const word = pop(frame, F.prod, SPRING.bouncy);
  return (
    <>
      <Center y={560}>
        <Card style={{ ...tree.style, width: 760, padding: "40px 48px", fontFamily: K.mono, fontSize: 40 }}>
          <div style={{ color: K.text }}>📁 my-startup/</div>
          <div style={{ color: K.dim, marginTop: 18, marginLeft: 50 }}>({S.empty})</div>
        </Card>
      </Center>
      <Center y={860}>
        <div style={{ ...word.style, fontSize: 116, fontWeight: 800, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
          <TactileGlassWord {...GLASS}>{S.ready}</TactileGlassWord>
        </div>
      </Center>
      <Center y={1080} style={{ gap: 18 }}>
        {S.zeros.map((z, i) => {
          const p = pop(frame, F.prod + 30 + i * 12, SPRING.bouncy);
          return (
            <Pill key={z} style={{ ...p.style, fontSize: 36, color: K.green, background: "rgba(31,168,85,0.1)", display: "inline-block" }}>
              ✓ {z}
            </Pill>
          );
        })}
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

export const makeVibeReel = (F: T, VO: Vo[], S: Strings): React.FC => {
  const scenes = [
    { range: [0, F.uiIn] as const, El: Ask(F, S) },
    { range: [F.uiIn, F.signupIn] as const, El: Checklist(F, S) },
    { range: [F.signupIn, F.rebuildIn] as const, El: Signup(F, S) },
    { range: [F.rebuildIn, F.prodIn] as const, El: Rebuild(F, S) },
    { range: [F.prodIn, F.duration + 30] as const, El: Prod(F, S) },
  ];
  const sfx = [
    { src: "sfx/07_CineStrike.wav", from: 4, volume: 0.3 },
    { src: "sfx2/typing.mp3", from: 16, volume: 0.5 },
    { src: "sfx2/click.mp3", from: F.submit - 2, volume: 0.7 },
    { src: "sfx/04_Cyber_Shift.wav", from: F.submit + 6, volume: 0.2 },
    { src: "sfx2/ding.mp3", from: F.done, volume: 0.55 },
    { src: "sfx2/whoosh.mp3", from: F.uiIn - 8, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.ui + 2, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.arch + 2, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.stripe + 2, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.signupIn - 8, volume: 0.45 },
    { src: "sfx2/click.mp3", from: F.click - 2, volume: 0.75 },
    { src: "sfx2/error.mp3", from: F.error, volume: 0.6 },
    { src: "sfx2/typing.mp3", from: F.fixAsk + 10, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.rebuildIn - 8, volume: 0.45 },
    { src: "sfx2/glitch.mp3", from: F.rebuildIn + 10, volume: 0.25 },
    { src: "sfx2/pop.mp3", from: F.zero + 2, volume: 0.45 },
    { src: "sfx/03_Basscrack.wav", from: F.deleted, volume: 0.35 },
    { src: "sfx2/whoosh.mp3", from: F.prodIn - 8, volume: 0.45 },
    { src: "sfx2/ding.mp3", from: F.prod + 2, volume: 0.5 },
    { src: "sfx2/rimshot.mp3", from: F.prod + 80, volume: 0.6 },
  ];
  const C: React.FC = () => <ReelShell scenes={scenes} headlines={S.headlines(F)} vo={VO} sfx={sfx} duration={F.duration} shift={130} />;
  return C;
};

export const Video5 = makeVibeReel(F5, VO5, RU);
