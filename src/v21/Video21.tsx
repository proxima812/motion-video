import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BookOpen, CalendarDays, Check, Code2, Cpu, Globe2, GraduationCap, Landmark, LayoutDashboard, Lightbulb, MapPin, Music2, Newspaper, Palette, Pencil, Plus, Rocket, Search, Sparkles, Terminal as TerminalIcon, Users, Video, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/reui/badge";
import { Card, CardContent } from "@/components/reui/luma/card";
import { Frame, FramePanel } from "@/components/reui/frame";
import { IconTile } from "@/components/reui/icon-tile";
import { Progress } from "@/components/ui/progress";
import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Pointer, ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, INTER, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Mark, Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Будущее татарской культуры создается сейчас" (@the_tatarverse, RU, host preset 2 Alicja).
// Tech-startup presentation on ReUI components (radix-luma): interfaces assemble from parts under the voice.
// Light mode by the user's choice, accent = the script's red #E53935. Dot Orbit variant 3 (output/bg-variant.txt).
const R = { main: "#D32F2F", vivid: "#E53935", glow: "#FF8A80", pale: "#FDECEA" };
const BG = <DotOrbitBg variant={3} />;
const W = 1080;

/* ───────── Shared bits ───────── */

/** "a *b c* d" -> [word, isKey][]: a *span* can hold several words */
const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** Heading: Inter 400, *key* words 700 in the accent; `at` = one start (stagger) or a start per word */
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 84, top = 170, style }) => (
  <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? R.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Web UI (ReUI, sized for 14-16 px) laid out at native width `w` and scaled by `s`; left = screen x (centered when omitted) */
const Zoom: React.FC<{ top: number; w: number; s: number; left?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, w, s, left, style, children }) => (
  <div style={{ position: "absolute", top, left: left ?? (W - w * s) / 2, width: w, transform: `scale(${s})`, transformOrigin: "0 0" }}>
    <div style={style}>{children}</div>
  </div>
);

/** The one design-system surface for web UI drawn small and scaled by `s` */
const webSurface = (s: number): React.CSSProperties => ({ background: "#fff", border: "none", borderRadius: 24 / s, boxShadow: `${-1 / s}px ${-6 / s}px ${55 / s}px ${-11 / s}px rgba(144, 142, 142, 0.2)`, color: INK });

/** Leave over [at, at + 10]: slide left with blur (the "morph" between product screens) */
const away = (frame: number, at: number, dir = -1): React.CSSProperties => {
  const o = ease.in(progress(frame, at, at + 10));
  return o <= 0 ? {} : { opacity: 1 - o, filter: `blur(${o * 14}px)`, transform: `translateX(${dir * o * 160}px) scale(${1 - o * 0.06})` };
};

const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("tatarverse/logo.svg")} style={{ width: size, height: size, objectFit: "contain" }} />;

/** Skeleton bar that grows in at `at` */
const Bar: React.FC<{ frame: number; at: number; w: number | string; h?: number; color?: string; r?: number }> = ({ frame, at, w, h = 10, color = "#ECECEF", r = 5 }) => {
  const t = ease.outExpo(progress(frame, at, at + 16));
  return <div style={{ width: w, height: h, borderRadius: r, background: color, transform: `scaleX(${t})`, transformOrigin: "0 50%", opacity: Math.min(1, t * 2) }} />;
};

const PEOPLE = ["АЛ", "РК", "ЗМ", "ИН", "ДФ", "ЭГ", "АС", "ТВ", "ЛН", "РШ", "ГА", "МЮ", "КБ", "НС", "ЯЗ", "ФИ", "АР", "СЛ", "ИК", "ЭМ"];
const TONES = ["#FDECEA", "#F2F0F7", "#EAF4EF", "#FFF4E5", "#EAF1FB"];

/* ───────── 1. Hook: 2026, the year rolls in, an editor builds an app ───────── */

const CODE = ["bun create tatar-app", "✓ ready in 0.8s"];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const big = { style: { transform: `scale(${1 + 0.04 * (1 - springAt(frame, 0, SPRING.smooth))})` } as React.CSSProperties };
  // last digit rolls 0 -> 6 while she says the year
  const roll = 6 + ease.inOut(progress(frame, F.year, F.year + 60)) * 10; // 2026 from the first frame, the last digit spins a full turn back to 6 on the year
  const ed = pop(frame, 30, SPRING.smooth);
  const typed = CODE[0].slice(0, Math.round(CODE[0].length * progress(frame, 44, 96)));
  const ok = pop(frame, 108, SPRING.bouncy);
  const caret = Math.floor(frame / 18) % 2 === 0 && frame < 104;
  return (
    <>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", ...big.style }}>
        <div style={{ ...NUMBER, fontSize: 290, color: INK, display: "flex" }}>
          202
          <span style={{ display: "inline-block", height: 290, overflow: "hidden", color: R.vivid }}>
            <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-roll * 290}px)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6].map((d, k) => (
                <span key={k} style={{ height: 290, lineHeight: "290px" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
      <Title text="время *создавать*" frame={frame} at={20} top={560} size={92} />
      <div style={{ position: "absolute", top: 790, left: 120, right: 120, ...ed.style }}>
        <div style={{ ...SURFACE, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 14, padding: "26px 32px", borderBottom: "1px solid #F0F0F2" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
          </div>
          <div style={{ padding: 40, fontFamily: "var(--font-mono), monospace", fontSize: 38, lineHeight: 1.6, color: INK }}>
            <div>
              <span style={{ color: R.vivid }}>❯ </span>
              {typed}
              {caret && <span style={{ display: "inline-block", width: 20, height: 40, marginLeft: 4, background: INK, verticalAlign: "-6px" }} />}
            </div>
            <div style={{ ...ok.style, color: "#1FA855" }}>{CODE[1]}</div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 2. Ideas: a prompt for the project, the CTA plate is pressed ───────── */

const PROMPT = "портал татарской культуры";
const TYPE2 = [F.ideasIn + 24, F.just] as const;
const Ideas: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.ideasIn + 6, SPRING.smooth);
  const typed = PROMPT.slice(0, Math.round(PROMPT.length * progress(frame, TYPE2[0], TYPE2[1])));
  const cta = pop(frame, F.stay, SPRING.bouncy);
  const press = springAt(frame, F.press - 3, SPRING.snappy) * (1 - springAt(frame, F.press + 5, SPRING.snappy));
  const burst = progress(frame, F.press, F.press + 30);
  const s = 2.6;
  return (
    <>
      <Title text="идея → *проект*" frame={frame} at={F.ideas} />
      <Zoom top={480} w={340} s={s} style={card.style}>
        <Frame style={{ ...webSurface(s), padding: 6 }}>
          <FramePanel style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "none", boxShadow: "none", background: "#F7F7F9", borderRadius: 10 }}>
            <IconTile variant="outline" style={{ color: R.vivid, borderColor: R.pale, background: "#fff" }}>
              <Lightbulb />
            </IconTile>
            <span style={{ fontFamily: `${INTER}, sans-serif`, fontSize: 15, color: INK, whiteSpace: "nowrap" }}>
              {typed}
              {frame < F.press && Math.floor(frame / 18) % 2 === 0 && <span style={{ display: "inline-block", width: 1.5, height: 16, background: R.vivid, marginLeft: 1, verticalAlign: "-3px" }} />}
            </span>
          </FramePanel>
        </Frame>
      </Zoom>
      {cta.t > 0 && (
        <div style={{ position: "absolute", top: 780, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...cta.style, transform: `${cta.style.transform} scale(${2.2 * (1 - 0.08 * press)})`, transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE.ruby}>
              <Sparkles size={18} strokeWidth={2.2} /> Создать
            </GlassPlate>
          </div>
        </div>
      )}
      {/* sparks fly out of the plate on the press */}
      {burst > 0 && burst < 1 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const d = ease.outExpo(burst) * 220;
          return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * d - 8, top: 840 + Math.sin(a) * d * 0.7 - 8, width: 16, height: 16, borderRadius: 8, background: i % 2 ? R.vivid : R.glow, opacity: 1 - burst }} />;
        })}
      <Pointer frame={frame} keys={[{ f: F.ideasIn + 40, x: 900, y: 1150 }, { f: F.press - 14, x: 560, y: 850 }]} clicks={[F.press]} show={[F.ideasIn + 40, F.aiIn]} />
    </>
  );
};

/* ───────── 3. AI: an agent trace builds the portal, the speed multiplier climbs ───────── */

const STEPS = [
  { at: F.aiIn + 14, icon: Search, title: "plan.md", desc: "6 экранов" },
  { at: F.aiIn + 40, icon: Pencil, title: "portal.tsx", desc: "+412" },
  { at: F.aiIn + 66, icon: Code2, title: "learn.tsx", desc: "+268" },
  { at: F.aiIn + 92, icon: TerminalIcon, title: "bun test", desc: "48 ✓" },
  { at: F.aiIn + 118, icon: Rocket, title: "deploy", desc: "live" },
];
const MULT = [
  { at: F.speeds, x: 2 },
  { at: F.speeds + 30, x: 4 },
  { at: F.times, x: 6 },
];
const Ai: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.7;
  const card = pop(frame, F.aiIn + 4, SPRING.smooth);
  const cur = MULT.reduce((acc, m, i) => (frame >= m.at ? i : acc), -1);
  const m = pop(frame, MULT[Math.max(0, cur)].at, SPRING.bouncy);
  return (
    <>
      <Title text="ИИ ускоряет *в разы*" frame={frame} at={F.aiIn + 6} />
      <Zoom top={400} w={300} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 16, gap: 0, fontFamily: `${INTER}, sans-serif` }}>
          <CardContent style={{ padding: 0 }}>
            <Trace style={{ gap: 9 }}>
              {STEPS.map((st) => {
                const p = springAt(frame, st.at, SPRING.smooth);
                const done = frame >= st.at + 18;
                const Icon = st.icon;
                return (
                  <TraceLine key={st.title} status={done ? undefined : "pending"} style={{ opacity: Math.min(1, p * 1.4) * (done ? 1 : 0.6), transform: `translateX(${(1 - p) * 30}px)`, color: INK, fontSize: 14 }}>
                    <TraceIcon style={{ color: done ? R.vivid : undefined }}>{done ? <Check /> : <Icon />}</TraceIcon>
                    <TraceTitle style={{ fontFamily: "var(--font-mono), monospace" }}>{st.title}</TraceTitle>
                    <TraceDescription>{st.desc}</TraceDescription>
                  </TraceLine>
                );
              })}
            </Trace>
          </CardContent>
        </Card>
      </Zoom>
      {cur >= 0 && (
        <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...m.style, ...NUMBER, fontSize: 250, color: cur === 2 ? R.vivid : INK }}>
            {MULT[cur].x}
            <span style={{ fontWeight: 400 }}>×</span>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 4. You can build: site, app, platform, community assemble into one collage ───────── */

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Badge variant="outline" style={{ background: "#fff", borderColor: R.pale, color: R.main, fontFamily: `${INTER}, sans-serif`, fontWeight: 500 }}>
    {children}
  </Badge>
);

const Build: React.FC<{ frame: number }> = ({ frame }) => {
  const site = pop(frame, F.sites - 6, SPRING.smooth);
  const app = springAt(frame, F.apps - 6, SPRING.smooth);
  const edu = pop(frame, F.edu - 4, SPRING.bouncy);
  const com = pop(frame, F.communities - 6, SPRING.bouncy);
  const drift = lerp(0, -30, ease.inOut(progress(frame, F.buildIn, F.learnIn)));
  return (
    <AbsoluteFill style={{ transform: `translateY(${drift}px)` }}>
      <Title text="ты можешь *создать*" frame={frame} at={[F.buildIn + 8, F.buildIn + 30, F.create]} />
      {/* site */}
      <Zoom top={380} left={100} w={280} s={2.4} style={site.style}>
        <Card style={{ ...webSurface(2.4), padding: 0, gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 10px", borderBottom: "1px solid #F0F0F2" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 6, height: 6, borderRadius: 3, background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontFamily: `${INTER}, sans-serif`, fontSize: 9, color: "#8A8792" }}>tatar.portal</span>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <Bar frame={frame} at={F.sites} w={60} h={8} color={R.vivid} />
              <Bar frame={frame} at={F.sites + 4} w={36} h={8} />
              <Bar frame={frame} at={F.sites + 8} w={36} h={8} />
            </div>
            <Bar frame={frame} at={F.sites + 10} w="100%" h={44} color={R.pale} r={10} />
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => {
                const p = springAt(frame, F.sites + 16 + i * 5, SPRING.bouncy);
                return (
                  <div key={i} style={{ flex: 1, height: 52, borderRadius: 8, background: "#F5F5F7", transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ height: 18, borderRadius: 4, background: TONES[i + 1] }} />
                    <div style={{ height: 4, width: "70%", borderRadius: 2, background: "#E2E2E6" }} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <div style={{ position: "absolute", top: -10, right: -8 }}>
          <Tag>сайт</Tag>
        </div>
      </Zoom>
      {/* app: a phone slides in from the right */}
      {app > 0 && (
        <div style={{ position: "absolute", top: 560, left: 660 + (1 - app) * 400, opacity: Math.min(1, app * 1.5) }}>
          <Zoom top={0} left={0} w={130} s={2.4}>
            <div style={{ ...webSurface(2.4), borderRadius: 22, padding: 6, background: "#1C1A22" }}>
              <div style={{ borderRadius: 17, background: "#fff", height: 250, padding: 8, display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
                <div style={{ width: 34, height: 8, borderRadius: 4, background: "#1C1A22", alignSelf: "center", marginBottom: 2 }} />
                <Bar frame={frame} at={F.apps + 6} w={50} h={7} color={R.vivid} />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 5, alignItems: "center", opacity: progress(frame, F.apps + 10 + i * 5, F.apps + 18 + i * 5) }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: TONES[i] }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ height: 4, width: "80%", borderRadius: 2, background: "#E2E2E6" }} />
                      <div style={{ height: 4, width: "50%", borderRadius: 2, background: "#EFEFF2" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "auto", height: 22, borderRadius: 11, background: R.vivid, opacity: progress(frame, F.apps + 30, F.apps + 40) }} />
              </div>
            </div>
          </Zoom>
          <div style={{ position: "absolute", top: -20, left: -40, transform: "scale(2.4)", transformOrigin: "0 0" }}>
            <Tag>приложение</Tag>
          </div>
        </div>
      )}
      {/* edu platform: course card with progress */}
      <Zoom top={960} left={100} w={230} s={2.4} style={edu.style}>
        <Card style={{ ...webSurface(2.4), padding: 12, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconTile variant="outline" size="sm" style={{ color: R.vivid, borderColor: R.pale }}>
              <GraduationCap />
            </IconTile>
            <Bar frame={frame} at={F.edu + 4} w={90} h={7} color="#E2E2E6" />
          </div>
          <Progress value={Math.round(72 * ease.out(progress(frame, F.edu + 10, F.edu + 60)))} className="h-2" style={{ background: R.pale }} />
        </Card>
        <div style={{ position: "absolute", top: -12, right: -8 }}>
          <Tag>платформа</Tag>
        </div>
      </Zoom>
      {/* community: avatar group */}
      <Zoom top={1170} left={420} w={200} s={2.4} style={com.style}>
        <Frame style={{ ...webSurface(2.4), padding: 4 }}>
          <FramePanel style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, border: "none", boxShadow: "none" }}>
            <AvatarGroup>
              {PEOPLE.slice(0, 4).map((n, i) => (
                <Avatar key={n} className="size-7" style={{ transform: `scale(${springAt(frame, F.communities + i * 4, SPRING.bouncy)})` }}>
                  <AvatarFallback style={{ background: TONES[i], color: INK, fontFamily: `${INTER}, sans-serif`, fontSize: 9 }}>{n}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="size-7" style={{ background: R.vivid, color: "#fff", fontFamily: `${INTER}, sans-serif`, fontSize: 9 }}>
                +2k
              </AvatarGroupCount>
            </AvatarGroup>
          </FramePanel>
        </Frame>
        <div style={{ position: "absolute", top: -14, right: -8 }}>
          <Tag>сообщество</Tag>
        </div>
      </Zoom>
    </AbsoluteFill>
  );
};

/* ───────── 5. Four products, one per phrase; each screen morphs into the next ───────── */

const Brand: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <IconTile variant="outline" size="sm" style={{ color: R.vivid, borderColor: R.pale }}>
      {icon}
    </IconTile>
    <span style={{ fontFamily: `${INTER}, sans-serif`, fontWeight: 600, fontSize: 14, color: INK }}>{name}</span>
  </div>
);

const S5 = 2.7;
const productBox = (frame: number, at: number, out: number) => ({ ...pop(frame, at, SPRING.smooth).style, ...away(frame, out) });

const Learn: React.FC<{ frame: number }> = ({ frame }) => {
  const pick = frame >= F.lang + 24;
  const step = Math.round(3 * ease.out(progress(frame, F.lang + 26, F.lang + 50)));
  return (
    <>
      <Title text="развивай *язык*" frame={frame} at={F.learnIn + 4} style={away(frame, F.meetIn - 8)} />
      <Zoom top={420} w={300} s={S5} style={productBox(frame, F.learnIn + 6, F.meetIn - 8)}>
        <Card style={{ ...webSurface(S5), padding: 16, gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Brand icon={<GraduationCap />} name="Tatar Learn" />
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 14, height: 5, borderRadius: 3, background: i < 1 + step ? R.vivid : "#ECECEF" }} />
              ))}
            </div>
          </div>
          <div style={{ ...NUMBER, fontWeight: 700, fontSize: 40, textAlign: "center", padding: "6px 0" }}>Сәлам</div>
          {[
            { w: "привет", ok: true },
            { w: "пока", ok: false },
          ].map((o) => {
            const on = pick && o.ok;
            return (
              <div key={o.w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${on ? R.vivid : "#ECECEF"}`, background: on ? R.pale : "#fff", fontFamily: PARAGRAPH.fontFamily, fontSize: 15, color: INK }}>
                {o.w}
                {on && (
                  <span style={{ width: 20, height: 20, borderRadius: 10, background: R.vivid, color: "#fff", display: "grid", placeItems: "center", transform: `scale(${springAt(frame, F.lang + 24, SPRING.bouncy)})` }}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
            );
          })}
        </Card>
      </Zoom>
    </>
  );
};

const Meet: React.FC<{ frame: number }> = ({ frame }) => {
  const at = F.meetIn;
  return (
    <>
      <Title text="объединяй *людей*" frame={frame} at={at + 4} style={away(frame, F.projIn - 8)} />
      <Zoom top={420} w={300} s={S5} style={productBox(frame, at + 2, F.projIn - 8)}>
        <Card style={{ ...webSurface(S5), padding: 16, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Brand icon={<Video />} name="Tatar Events" />
            <Badge variant="destructive" style={{ background: R.vivid, fontFamily: `${INTER}, sans-serif` }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: Math.floor(frame / 20) % 2 ? 1 : 0.4 }} /> live
            </Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {PEOPLE.slice(4, 8).map((n, i) => {
              const p = springAt(frame, at + 8 + i * 5, SPRING.bouncy);
              const talk = i === Math.floor((frame - at) / 22) % 4;
              return (
                <div key={n} style={{ height: 70, borderRadius: 12, background: TONES[i], display: "grid", placeItems: "center", transform: `scale(${p})`, outline: talk ? `2px solid ${R.vivid}` : "none" }}>
                  <Avatar className="size-9">
                    <AvatarFallback style={{ background: "#fff", color: INK, fontFamily: `${INTER}, sans-serif`, fontSize: 11 }}>{n}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: `${INTER}, sans-serif`, fontSize: 12, color: "#6E6A78" }}>
            <CalendarDays size={14} color={R.vivid} /> 12.12 · 19:00
          </div>
        </Card>
      </Zoom>
    </>
  );
};

const CHART = [12, 18, 16, 26, 31, 29, 42, 48, 57, 66, 80, 96];
const Projects: React.FC<{ frame: number }> = ({ frame }) => {
  const at = F.projIn;
  const draw = ease.out(progress(frame, at + 8, at + 60));
  const n = Math.round(128 * draw);
  const pts = CHART.map((v, i) => [(i / (CHART.length - 1)) * 260, 80 - (v / 100) * 76] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <>
      <Title text="сохраняй *культуру*" frame={frame} at={at + 4} style={away(frame, F.mapIn - 8)} />
      <Zoom top={420} w={300} s={S5} style={productBox(frame, at + 2, F.mapIn - 8)}>
        <Card style={{ ...webSurface(S5), padding: 16, gap: 10 }}>
          <Brand icon={<Landmark />} name="Tatar Projects" />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...NUMBER, fontSize: 38 }}>{n}</span>
            <Badge variant="success-light" style={{ fontFamily: `${INTER}, sans-serif`, background: R.pale, color: R.main, borderColor: R.pale }}>
              +24%
            </Badge>
          </div>
          <svg width={260} height={84} viewBox="0 0 260 84" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="v21area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={R.vivid} stopOpacity={0.28} />
                <stop offset="1" stopColor={R.vivid} stopOpacity={0} />
              </linearGradient>
              <clipPath id="v21clip">
                <rect x={0} y={-10} width={260 * draw} height={100} />
              </clipPath>
            </defs>
            <g clipPath="url(#v21clip)">
              <path d={`${line} L260,84 L0,84 Z`} fill="url(#v21area)" />
              <path d={line} fill="none" stroke={R.vivid} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </svg>
        </Card>
      </Zoom>
    </>
  );
};

// pins on an abstract dot map (x, y in the 300x170 card space); Kazan is the hub
const HUB = { x: 176, y: 58 };
const PINS = [
  { x: 64, y: 70, n: "Хельсинки" },
  { x: 214, y: 92, n: "Алматы" },
  { x: 30, y: 96, n: "Нью-Йорк" },
  { x: 150, y: 104, n: "Стамбул" },
];
const MapScene: React.FC<{ frame: number }> = ({ frame }) => {
  const at = F.mapIn;
  return (
    <>
      <Title text="стирай *границы*" frame={frame} at={at + 4} />
      <Zoom top={420} w={300} s={S5} style={pop(frame, at + 2, SPRING.smooth).style}>
        <Card style={{ ...webSurface(S5), padding: 12, gap: 8 }}>
          <Brand icon={<Globe2 />} name="Tatar Map" />
          <div style={{ position: "relative", height: 150 }}>
            <svg width={276} height={150} viewBox="0 0 276 150" style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 23 * 12 }, (_, i) => {
                const x = 6 + (i % 23) * 12;
                const y = 6 + Math.floor(i / 23) * 12;
                // rough land mask: two blobs (Eurasia, Americas)
                const land = ((x - 170) / 110) ** 2 + ((y - 60) / 46) ** 2 < 1 || ((x - 40) / 40) ** 2 + ((y - 80) / 60) ** 2 < 1;
                return <circle key={i} cx={x} cy={y} r={land ? 2.2 : 1.2} fill={land ? "#D9D6DE" : "#F0EFF3"} />;
              })}
              {PINS.map((p, i) => {
                const t = ease.inOut(progress(frame, F.world - 30 + i * 8, F.world + i * 8));
                const mx = (HUB.x + p.x) / 2;
                const my = Math.min(HUB.y, p.y) - 34;
                return <path key={p.n} d={`M${HUB.x},${HUB.y} Q${mx},${my} ${p.x},${p.y}`} fill="none" stroke={R.vivid} strokeWidth={1.6} strokeDasharray="200" strokeDashoffset={200 * (1 - t)} strokeLinecap="round" />;
              })}
            </svg>
            {[{ ...HUB, n: "Казань" }, ...PINS].map((p, i) => {
              const t = springAt(frame, at + 10 + i * 9, SPRING.bouncy);
              const hub = i === 0;
              return (
                <div key={p.n} style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -100%) scale(${t})`, transformOrigin: "50% 100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {(hub || i === 2) && (
                    <span style={{ fontFamily: `${INTER}, sans-serif`, fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: hub ? R.vivid : "#fff", color: hub ? "#fff" : INK, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 2, whiteSpace: "nowrap" }}>{p.n}</span>
                  )}
                  <MapPin size={hub ? 18 : 14} color={R.vivid} fill={hub ? R.pale : "#fff"} strokeWidth={2.2} />
                </div>
              );
            })}
          </div>
        </Card>
      </Zoom>
    </>
  );
};

const Products: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {frame < F.meetIn + 2 && <Learn frame={frame} />}
    {frame >= F.meetIn - 2 && frame < F.projIn + 2 && <Meet frame={frame} />}
    {frame >= F.projIn - 2 && frame < F.mapIn + 2 && <Projects frame={frame} />}
    {frame >= F.mapIn - 2 && <MapScene frame={frame} />}
  </>
);

/* ───────── 6. No huge team: a crowd of avatars falls away, one stays ───────── */

const Team: React.FC<{ frame: number }> = ({ frame }) => {
  const fall = F.team + 16;
  const title = pop(frame, F.big - 10, SPRING.bouncy);
  const you = springAt(frame, fall + 26, SPRING.bouncy);
  return (
    <>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", ...HEADING, fontSize: 88, ...title.style }}>
        <Strike frame={frame} at={F.big + 8} color={R.vivid}>
          огромная команда
        </Strike>
      </div>
      <div style={{ position: "absolute", top: 440, left: 140, width: 800, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", rowGap: 34, justifyItems: "center" }}>
        {PEOPLE.map((n, i) => {
          const me = i === 12;
          const p = springAt(frame, F.teamIn + 6 + i * 3, SPRING.bouncy);
          // everyone but one drops out of the frame with a little spin
          const d = me ? 0 : ease.in(progress(frame, fall + (i % 7) * 3, fall + 40 + (i % 7) * 3));
          return (
            <div key={n} style={{ transform: `translateY(${d * 1300}px) rotate(${d * (i % 2 ? 40 : -40)}deg) scale(${p * (me ? 1 + 0.5 * you : 1)})`, opacity: Math.min(1, p * 1.5) }}>
              <div style={{ position: "relative", width: 114, height: 114 }}>
                <Zoom top={0} left={0} w={44} s={2.6}>
                  <Avatar style={{ width: 44, height: 44, boxShadow: me && you > 0.1 ? `0 0 0 ${3 * you}px ${R.vivid}` : undefined }}>
                    <AvatarFallback style={{ background: me && you > 0.1 ? R.pale : TONES[i % 5], color: INK, fontFamily: `${INTER}, sans-serif`, fontSize: 12 }}>{n}</AvatarFallback>
                  </Avatar>
                </Zoom>
              </div>
            </div>
          );
        })}
      </div>
      {you > 0.05 && (
        <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, you * 1.5) }}>
          <div style={{ transform: `scale(${2.6 * you})`, transformOrigin: "50% 0" }}>
            <Badge style={{ background: R.vivid, color: "#fff", fontFamily: `${INTER}, sans-serif`, fontWeight: 600 }}>ты</Badge>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 7. What you need: idea, will, technology - a stepper of icon tiles ───────── */

const NEED = [
  { at: F.idea, icon: Lightbulb, text: "идея" },
  { at: F.act, icon: Zap, text: "желание действовать" },
  { at: F.tech, icon: Cpu, text: "технологии" },
];
const Need: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="что *нужно*" frame={frame} at={F.needIn + 6} />
    <div style={{ position: "absolute", top: 420, left: 160, right: 120 }}>
      {NEED.map((n, i) => {
        const p = pop(frame, n.at - 8, SPRING.bouncy);
        const on = springAt(frame, n.at + 10, SPRING.bouncy);
        const lit = on > 0.5;
        const Icon = n.icon;
        const next = NEED[i + 1];
        const fill = next ? ease.inOut(progress(frame, n.at + 14, next.at - 4)) : 0;
        return (
          <div key={n.text} style={{ position: "relative", height: 260 }}>
            {next && (
              <div style={{ position: "absolute", left: 63, top: 140, width: 8, height: 110, borderRadius: 4, background: "#ECECEF", overflow: "hidden" }}>
                <div style={{ width: "100%", height: `${fill * 100}%`, background: R.vivid }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 44, ...p.style }}>
              <div style={{ transform: "scale(2.7)", transformOrigin: "0 0", width: 134, height: 134 }}>
                <IconTile variant={lit ? "solid" : "outline"} size="lg" style={lit ? { background: R.vivid, color: "#fff", borderColor: R.vivid } : { background: "#fff", color: INK }}>
                  {lit ? <Check /> : <Icon />}
                </IconTile>
              </div>
              <div style={{ ...HEADING, fontSize: 70, fontWeight: lit ? 700 : 400, color: lit ? INK : "#8A8792" }}>{n.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  </>
);

/* ───────── 8. The future won't appear by itself: the camera pulls back over dozens of projects, one slot is empty ───────── */

const ICONS = [BookOpen, CalendarDays, Video, MapPin, Users, GraduationCap, Landmark, LayoutDashboard, Globe2, Music2, Newspaper, Palette, Lightbulb, Rocket, Search, Code2];
const COLS = 5;
const ROWS = 6;
const EMPTY = 17; // the free slot: yours
const Future: React.FC<{ frame: number }> = ({ frame }) => {
  const zoom = lerp(2.6, 1, ease.inOut(progress(frame, F.futureIn, F.futureIn + 110)));
  const slot = springAt(frame, F.itself + 4, SPRING.bouncy);
  const cell = 150;
  const gx = (W - COLS * cell) / 2;
  const cx = gx + (EMPTY % COLS) * cell + cell / 2;
  const cy = 360 + Math.floor(EMPTY / COLS) * cell + cell / 2;
  return (
    <>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const x = gx + (i % COLS) * cell;
          const y = 360 + Math.floor(i / COLS) * cell;
          if (i === EMPTY) {
            const pulse = 1 + Math.sin((frame - F.itself) / 8) * 0.04 * slot;
            return (
              <div key={i} style={{ position: "absolute", left: x + 15, top: y + 15, width: 120, height: 120, borderRadius: 24, border: `4px dashed ${slot > 0.3 ? R.vivid : "#D9D6DE"}`, display: "grid", placeItems: "center", transform: `scale(${pulse})`, background: slot > 0.3 ? R.pale : "transparent" }}>
                <Plus size={56} color={slot > 0.3 ? R.vivid : "#B8B4C0"} strokeWidth={2.4} />
              </div>
            );
          }
          const d = Math.hypot((i % COLS) - (EMPTY % COLS), Math.floor(i / COLS) - Math.floor(EMPTY / COLS));
          const p = springAt(frame, F.futureIn + 4 + d * 7, SPRING.bouncy);
          const Icon = ICONS[i % ICONS.length];
          const hot = (i * 7) % 5 === 0;
          return (
            <div key={i} style={{ position: "absolute", left: x + 15, top: y + 15, width: 120, height: 120, ...SURFACE, display: "grid", placeItems: "center", transform: `scale(${p})`, opacity: Math.min(1, p * 1.4) }}>
              <Icon size={54} color={hot ? R.vivid : INK} strokeWidth={1.8} />
            </div>
          );
        })}
      </AbsoluteFill>
      <Title text="будущее не появится *само*" frame={frame} at={[F.futureIn + 8, F.not, F.not + 9, F.itself]} top={170} size={68} />
    </>
  );
};

/* ───────── 9. Slogan in Tatar, "we build it ourselves" plate ───────── */

const Slogan: React.FC<{ frame: number }> = ({ frame }) => {
  const logo = pop(frame, F.sloganIn + 2, SPRING.smooth);
  const w = (at: number) => {
    const t = springAt(frame, at, SPRING.smooth);
    return { display: "inline-block", opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` } as React.CSSProperties;
  };
  const plate = pop(frame, F.we + 4, SPRING.bouncy);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", ...logo.style }}>
        <Logo size={110} />
      </div>
      <div style={{ ...HEADING, position: "absolute", top: 500, left: 100, right: 100, textAlign: "center", fontSize: 112, lineHeight: 1.15 }}>
        <span style={w(F.sloganIn + 4)}>Без</span> <span style={w(F.sloganIn + 14)}>киләчәкне</span>
        <br />
        <span style={w(F.bez2 - 4)}>
          <Mark frame={frame} at={F.build} color={R.vivid}>
            <b>без төзибез</b>
          </Mark>
        </span>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...plate.style, transform: `${plate.style.transform} scale(2.3)`, transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE.ruby}>
              <Sparkles size={18} strokeWidth={2.2} /> создаем сами
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.ideasIn], El: Hook },
  { range: [F.ideasIn, F.aiIn], El: Ideas },
  { range: [F.aiIn, F.buildIn], El: Ai },
  { range: [F.buildIn, F.learnIn], El: Build },
  { range: [F.learnIn, F.teamIn], El: Products },
  { range: [F.teamIn, F.needIn], El: Team },
  { range: [F.needIn, F.futureIn], El: Need },
  { range: [F.futureIn, F.sloganIn], El: Future },
  { range: [F.sloganIn, F.duration + 30], El: Slogan },
];

const SFX: Sfx[] = [
  // 1. hook
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
  ...Array.from({ length: 6 }, (_, i) => ({ src: "sfx2/click.mp3", from: F.year + 6 + i * 11, volume: 0.12 })),
  { src: "sfx2/typing.mp3", from: 44, volume: 0.1 },
  { src: "sfx2/ding.mp3", from: 108, volume: 0.22 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.ideasIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.aiIn - 8, volume: 0.22 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.buildIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.learnIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.teamIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.needIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.futureIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.sloganIn - 8, volume: 0.18 },
  // 2. prompt + CTA press
  { src: "sfx2/typing.mp3", from: TYPE2[0], volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.stay + 2, volume: 0.3 },
  { src: "sfx2/click.mp3", from: F.press, volume: 0.32 },
  // 3. trace steps, multiplier hits
  ...STEPS.map((s) => ({ src: "sfx2/click.mp3", from: s.at + 18, volume: 0.16 })),
  ...MULT.map((m) => ({ src: "sfx/03_Basscrack.wav", from: m.at + 2, volume: 0.1 })),
  // 4. parts land
  ...[F.sites, F.apps, F.edu, F.communities].map((at) => ({ src: "sfx2/pop.mp3", from: at, volume: 0.26 })),
  // 5. products morph
  ...[F.meetIn, F.projIn, F.mapIn].map((at) => ({ src: "sfx/04_Cyber_Shift.wav", from: at - 8, volume: 0.12 })),
  { src: "sfx2/ding.mp3", from: F.lang + 24, volume: 0.24 },
  ...PINS.map((_, i) => ({ src: "sfx2/pop.mp3", from: F.mapIn + 19 + i * 9, volume: 0.16 })),
  // 6. strike, crowd drops, "ты"
  { src: "sfx/05_Distortion_Glitch.wav", from: F.big + 36, volume: 0.04 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.team + 16, volume: 0.12 },
  { src: "sfx2/ding.mp3", from: F.team + 42, volume: 0.26 },
  // 7. steps check
  ...NEED.map((n) => ({ src: "sfx2/ding.mp3", from: n.at + 10, volume: 0.22 })),
  // 8. pull back, empty slot
  ...Array.from({ length: 5 }, (_, i) => ({ src: "sfx2/pop.mp3", from: F.futureIn + 6 + i * 9, volume: 0.14 })),
  { src: "sfx/07_CineStrike.wav", from: F.itself + 2, volume: 0.2 },
  // 9. slogan
  { src: "sfx/03_Basscrack.wav", from: F.build + 4, volume: 0.12 },
  { src: "sfx2/pop.mp3", from: F.we + 6, volume: 0.3 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "waving" },
  { at: 96, e: "smile-up" },
  { at: F.ideasIn, e: "thinking" },
  { at: F.stay, e: "explaining" },
  { at: F.aiIn, e: "surprised" },
  { at: F.times - 10, e: "delighted" },
  { at: F.buildIn, e: "explaining" },
  { at: F.apps, e: "inspired" },
  { at: F.communities - 20, e: "soft-smile" },
  { at: F.learnIn, e: "explaining" },
  { at: F.meetIn, e: "laughing" },
  { at: F.projIn, e: "dreamy" },
  { at: F.mapIn, e: "delighted" },
  { at: F.teamIn, e: "skeptical" },
  { at: F.big, e: "puzzled" },
  { at: F.team + 30, e: "soft-smile" },
  { at: F.needIn, e: "explaining" },
  { at: F.will, e: "inspired" },
  { at: F.tech, e: "smile-up" },
  { at: F.futureIn, e: "pensive" },
  { at: F.not, e: "thinking" },
  { at: F.sloganIn, e: "inspired" },
  { at: F.we - 20, e: "delighted" },
];

// Alternate sides on scene changes, center on the hook, the crowd and the slogan
const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.ideasIn, s: "right" },
  { at: F.aiIn, s: "left" },
  { at: F.buildIn, s: "right" },
  { at: F.learnIn, s: "left" },
  { at: F.teamIn, s: "center" },
  { at: F.needIn, s: "left" },
  { at: F.futureIn, s: "right" },
  { at: F.sloganIn, s: "center" },
];

// Alicja photos are framed wider than tall in places: scale those so every photo fills the 540x590 box by height
const SIZE: Record<string, [number, number]> = {
  delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1216], explaining: [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], pensive: [1129, 1393],
  puzzled: [1129, 1393], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1164, 1351], surprised: [1280, 1229], thinking: [1129, 1393], waving: [1312, 1199],
};
const FIT21 = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v21/avatar" fit={FIT21} />;

// ReUI ships its own font and CSS transitions: Inter inside the UI, no transitions/animations (every frame is a pure function of `frame`)
const Scope = () => <style>{`.v21-ui [data-slot], .v21-ui [data-slot] * { font-family: ${INTER}, sans-serif; } .v21-ui [data-slot=progress-indicator] { background: ${R.vivid}; } .v21-ui *, .v21-ui *::before, .v21-ui *::after { transition: none !important; animation: none !important; }`}</style>;

export const Video21: React.FC = () => (
  <AbsoluteFill className="v21-ui" style={{ background: "#fff" }}>
    <Scope />
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v21/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
