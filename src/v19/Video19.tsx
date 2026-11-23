import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TactileButton, TactilePromptInput } from "tactile-glass-ui";
import { ArrowRight, Bookmark, FileDown, Layers, LocateFixed } from "lucide-react";
import { Confetti } from "@/components/remocn/confetti";
import { CrewOfOne } from "@/components/remocn/crew-of-one";
import { FlashSweep } from "@/components/remocn/flash-sweep";
import { CheckIcon } from "@/components/remocn/icon-check";
import { NumberSplit } from "@/components/remocn/number-split";
import { PhoneScroll } from "@/components/remocn/phone-scroll";
import { QuadtreeMark } from "@/components/remocn/quadtree-mark";
import { TelegramChatFlow } from "@/components/remocn/telegram-chat-flow";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { tint } from "@/lib/remocn/tint";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { Pointer, ReelShell, Words, count, musicVolume, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SHADOW } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Mark } from "../catalog/own/text";
import { fontFamily } from "../ui/theme";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// tatarverse.cc presentation (@the_tatarverse, RU, 9:16 1080x1920). The 16:9 cut lives in Video19Wide.tsx.
// Host bottom center (TatAvatar), scene content stays above ~1320 px.
// Accent = the site's own violet palette "Яна Шәмәха" (palettes/violet.css). Design system: Dot Orbit bg (variant 2 lavender,
// output/bg-variant.txt), text INK, headings Inter 400 + key word 700, paragraphs Raleway, one shadow, safe zone 100/150.
const V = { main: "#6E33CC", vivid: "#6920DF", glow: "#9D68F3", pale: "#EFE8FC", ink: INK };
const BG = <DotOrbitBg variant={2} />;
// the one design-system shadow, for shadcn UI laid out small and scaled up by Zoom
const shadowAt = (s: number) => `-1px ${-6 / s}px ${55 / s}px ${-11 / s}px rgba(144, 142, 142, 0.2)`;
const RAMP = [V.vivid, V.glow, tint(V.glow, 0.6)] as const;
const W = 1080;
const img = (name: string) => staticFile(`v19/img/${name}.png`);

/* ───────── Shared bits ───────── */

/** A 16:9-native Remocn scene in its own box: Sequence width/height override what the component sees as the frame */
const Box: React.FC<{ at: number; top: number; h: number; len?: number; children: React.ReactNode }> = ({ at, top, h, len, children }) => (
  <div className="v19-inter" style={{ position: "absolute", left: 0, top, width: W, height: h }}>
    <Sequence from={at} durationInFrames={len} width={W} height={h} layout="none">
      <AbsoluteFill>{children}</AbsoluteFill>
    </Sequence>
  </div>
);

/** shadcn UI is sized for 16 px web: lay it out at native size and scale it up (text stays vector-sharp) */
const Zoom: React.FC<{ top: number; w: number; s: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, w, s, style, children }) => (
  <div style={{ position: "absolute", top, left: (W - w * s) / 2, width: w, transform: `scale(${s})`, transformOrigin: "0 0" }}>
    <div style={style}>{children}</div>
  </div>
);

const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("tatarverse/logo.svg")} style={{ width: size, height: size, objectFit: "contain" }} />;

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
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 2, size, style }) => (
  <div style={{ ...HEADING, fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? V.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/* ───────── 1. Hook: TactilePromptInput turned into a search bar ───────── */

// The prompt composer minus the chat chrome: one row, magnifier on the left, a round TactileButton with an arrow instead of the send button
const SEARCH_CSS = `
.v19-search { --prompt-box-w: 880px; --prompt-box-pad: 20px; --prompt-box-radius: 64px; --text-primary: #fff; --text-muted: rgba(255,255,255,0.5); }
.v19-search .tactile-prompt-box > div:last-child { flex-direction: row !important; align-items: center; gap: 16px !important; }
.v19-search .prompt-body { flex: 1; min-width: 0; padding-left: 30px; }
.v19-search .prompt-textarea { font-family: ${fontFamily}, sans-serif; font-size: 46px; font-weight: 500; letter-spacing: -0.02em; height: 88px !important; min-height: 0; line-height: 88px; white-space: nowrap; overflow: hidden; caret-color: transparent; }
.v19-search .prompt-bottom-bar { padding-top: 0; }
.v19-search .prompt-pills-row { display: none; }
.v19-search .prompt-submit-btn { display: none; }
.v19-search .prompt-body { padding-right: 110px; }
.v19-find svg { width: 30px !important; height: 30px !important; }
`;
const GLASS_FIND = { refraction: 20, thickness: 33, bevelWidth: 1, frost: 40, dispersion: 72, darkness: 28, fluidBrightness: 38, fluidAuraWidth: 7, fluidCenter: 0, auroraFlow: 0 };
const GLASS_SEARCH = { refraction: 20, thickness: 33, bevelWidth: 1, frost: 40, dispersion: 72, darkness: 100, rim: 100, fluidBrightness: 38, fluidAuraWidth: 7, fluidCenter: 0, auroraFlow: 0 };

const QUERY = "татарский центр рядом";
const TYPE = [34, 150] as const;
const BAR_Y = 560;
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const typed = QUERY.slice(0, Math.round(QUERY.length * progress(frame, TYPE[0], TYPE[1])));
  const press = springAt(frame, F.open - 2, SPRING.snappy) * (1 - springAt(frame, F.open + 6, SPRING.snappy));
  const bar = pop(frame, 4, SPRING.smooth);
  const res = pop(frame, F.open + 8, SPRING.smooth);
  const hit = springAt(frame, F.site - 4, SPRING.bouncy);
  return (
    <>
      <style>{SEARCH_CSS}</style>
      <div className="v19-search" style={{ ...bar.style, position: "absolute", left: 100, top: BAR_Y, width: 880, transform: `${bar.style.transform} scale(${1 - press * 0.03})` }}>
        <TactilePromptInput {...GLASS_SEARCH} value={typed} placeholder="Город страна или центр" />
        <div className="v19-find" style={{ position: "absolute", right: 26, top: 22, transform: "scale(1.5)", transformOrigin: "100% 0" }}>
          <TactileButton {...GLASS_FIND} shape="circle" aria-label="Найти">
            <ArrowRight size={26} strokeWidth={2.4} color="#fff" />
          </TactileButton>
        </div>
      </div>
      {res.t > 0 && (
        <div style={{ ...res.style, position: "absolute", left: 100, top: BAR_Y + 170, width: 880, padding: 32, borderRadius: 24, background: "#fff", boxShadow: `${SHADOW}, 0 0 0 ${hit > 0.5 ? 3 : 0}px ${V.main}, 0 0 0 ${hit * 12}px ${V.pale}`, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 104, height: 104, borderRadius: 28, background: "#F1F1F3", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Logo size={68} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...HEADING, fontSize: 52, fontWeight: 700, color: hit > 0.5 ? V.main : V.ink }}>tatarverse.cc</div>
            <div style={{ ...PARAGRAPH, fontSize: 34, opacity: 0.6 }}>Каталог татарских центров</div>
          </div>
        </div>
      )}
      <HookHead frame={frame} />
      <Pointer frame={frame} keys={[{ f: 120, x: 760, y: 900 }, { f: F.open - 8, x: 470, y: BAR_Y + 78 }, { f: F.site, x: 560, y: BAR_Y + 270 }]} clicks={[F.open, F.site - 2]} show={[118, F.introIn - 4]} />
    </>
  );
};

const HEADS = [
  { from: 0, to: 147, text: "Новый город *с нуля*" },
  { from: 147, to: F.open + 8, text: "Первым делом *открываю*" },
];
const HookHead: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {HEADS.map((h) => {
      const out = progress(frame, h.to, h.to + 6);
      if (frame < h.from || out >= 1) return null;
      return (
        <div key={h.from} style={{ position: "absolute", left: 100, right: 100, top: 200, textAlign: "center", opacity: 1 - out, filter: out > 0 ? `blur(${out * 10}px)` : undefined }}>
          <Title text={h.text} frame={frame} at={h.from} size={88} />
        </div>
      );
    })}
  </>
);

/* ───────── 2. Intro: phone-scroll through the mobile site, then its pages ───────── */

// home.png = 430 px mobile viewport at 2x -> 393 pt wide in the phone, 2376 pt tall
const STOPS = [620, 1160, 1500];
const LAST = STOPS[STOPS.length - 1];
const PAGES = [
  { src: "catalog", at: F.catalog + 30 - F.introIn, scroll: 520 },
  { src: "card", at: 560 - F.introIn, scroll: 380 },
  { src: "stats", at: 630 - F.introIn, scroll: 0 },
];
/** phone content: the home page scrolls, then pages push in from the right at the last scroll stop */
const PhonePages: React.FC<{ frame: number }> = ({ frame }) => {
  const local = frame - F.introIn;
  return (
    <div style={{ position: "relative", width: 393, height: 2376 }}>
      <Img src={img("home")} style={{ width: 393, display: "block" }} />
      {PAGES.map((p, i) => {
        const push = springAt(local, p.at, SPRING.smooth);
        if (push <= 0.001) return null;
        const next = PAGES[i + 1] ? springAt(local, PAGES[i + 1].at, SPRING.smooth) : 0;
        const y = p.scroll * ease.inOut(progress(local, p.at + 16, p.at + 70));
        return (
          <div key={p.src} style={{ position: "absolute", left: 0, top: LAST, width: 393, height: 852, overflow: "hidden", background: "#F3F3F3", transform: `translateX(${(1 - push) * 393 - next * 110}px)`, boxShadow: SHADOW }}>
            <Img src={img(p.src)} style={{ width: 393, display: "block", transform: `translateY(${-y}px)` }} />
          </div>
        );
      })}
    </div>
  );
};
const Intro: React.FC<{ frame: number }> = ({ frame }) => (
  <GshFlat.Provider value="transparent">
    <Box at={F.introIn} top={0} h={1330}>
      <PhoneScroll stops={STOPS} eyebrow="Знакомьтесь" label="tatarverse.cc" labelAccent=".cc" accent={V.main} theme="light" speed={0.9} veil="transparent">
        <PhonePages frame={frame} />
      </PhoneScroll>
    </Box>
  </GshFlat.Provider>
);

/* ───────── 3. Numbers: every figure of the catalog stats page ───────── */

const Numbers: React.FC<{ frame: number }> = () => (
  <>
    <Box at={F.mapIn + 8} top={20} h={640}>
      <NumberSplit
        total="410"
        label="центров"
        parts={[
          { label: "общества", value: 164 },
          { label: "другие", value: 246 },
        ]}
        accent={V.main}
        ramp={RAMP}
        ink={V.ink}
        background="transparent"
        theme="light"
        margin={0.045}
        labelScale={1.7}
        speed={0.6}
      />
    </Box>
    <Box at={F.countries - 8} top={660} h={640}>
      <NumberSplit
        total="53"
        label="страны"
        parts={[
          { label: "Европа", value: 24 },
          { label: "Азия", value: 16 },
          { label: "СНГ", value: 13 },
        ]}
        accent={V.main}
        ramp={RAMP}
        ink={V.ink}
        background="transparent"
        theme="light"
        margin={0.06}
        labelScale={1.7}
        speed={1}
      />
    </Box>
  </>
);

/* ───────── 4. Search: crew-of-one rolls the ways to search, category chips ───────── */

const SearchScene: React.FC<{ frame: number }> = ({ frame }) => {
  const geo = pop(frame, F.geo + 4, SPRING.bouncy);
  const on = springAt(frame, F.nearest, SPRING.snappy);
  return (
    <>
      <Box at={F.searchIn} top={0} h={1250} len={F.specIn - F.searchIn + 10}>
        <CrewOfOne
          roles={["По стране", "По городу", "По категории", "Рядом"]}
          beats={[0, F.country + 30 - F.searchIn, F.category - F.searchIn, F.geo - F.searchIn]}
          gatherAt={F.nearest - 30 - F.searchIn}
          name="ищите"
          accent={V.main}
          ink={V.ink}
          background="transparent"
          theme="light"
        />
      </Box>
      {geo.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1040, display: "flex", justifyContent: "center" }}>
          <div style={{ ...geo.style, display: "flex", alignItems: "center", gap: 20, padding: 30, borderRadius: 24, background: on > 0.5 ? V.main : "#fff", color: on > 0.5 ? "#fff" : V.ink, fontSize: 42, fontWeight: 500, lineHeight: 1, boxShadow: SHADOW }}>
            <LocateFixed size={48} strokeWidth={2.2} />
            {on > 0.5 ? "12 центров рядом" : "Включить геолокацию"}
          </div>
        </div>
      )}
      <Pointer frame={frame} keys={[{ f: F.geo + 10, x: 900, y: 1300 }, { f: F.nearest - 10, x: 640, y: 1060 }]} clicks={[F.nearest - 2]} show={[F.geo + 8, F.specIn - 6]} />
    </>
  );
};

/* ───────── 5. Inside a card: shadcn Card ───────── */

// shadcn UI: no border, the design-system shadow and radius 24 (12 px native x ~2)
const CARD_S = 1.95;
const CARD_TOP = 150;
const cardSurface = (s: number): React.CSSProperties => ({ border: "none", borderRadius: 24 / s, boxShadow: shadowAt(s) });
const Cards: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.specIn + 6, SPRING.smooth);
  const links = [F.links, F.links + 14].map((at) => pop(frame, at, SPRING.bouncy));
  const direct = springAt(frame, F.direct, SPRING.snappy) * (1 - springAt(frame, F.direct + 10, SPRING.snappy));
  const saved = frame >= F.save + 2;
  const savedPop = springAt(frame, F.save + 2, SPRING.bouncy);
  // the card leaves once saved, the saved list takes its place (7 words max on screen)
  const cardOut = progress(frame, F.save + 18, F.save + 28);
  const list = pop(frame, F.save + 30, SPRING.smooth);
  const pdf = springAt(frame, F.pdf + 6, SPRING.snappy) * (1 - springAt(frame, F.pdf + 16, SPRING.snappy));
  const done = pop(frame, F.pdf + 24, SPRING.bouncy);
  const pulse = (p: number) => ({ transform: `scale(${1 - p * 0.06})`, boxShadow: `0 0 0 ${p * 6}px ${V.glow}55` });
  return (
    <>
      {cardOut < 1 && (
        <div className="v19-inter" style={{ opacity: 1 - cardOut, filter: cardOut > 0 ? `blur(${cardOut * 10}px)` : undefined }}>
          <Zoom top={CARD_TOP} w={440} s={CARD_S} style={card.style}>
            <Card className="gap-4 py-5" style={cardSurface(CARD_S)}>
              <CardHeader className="px-5">
                <CardDescription className="text-[13px]">Сиэтл</CardDescription>
                <CardTitle className="text-[19px] leading-tight tracking-tight" style={{ color: INK }}>
                  Tatars of Washington State
                </CardTitle>
                <CardAction>
                  <Button variant="outline" size="icon-sm" style={{ ...pulse(saved ? Math.sin(Math.min(savedPop, 1) * Math.PI) : 0), color: saved ? V.main : undefined, borderColor: saved ? V.main : undefined }}>
                    <Bookmark fill={saved ? V.main : "none"} />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex gap-2 px-5">
                {[{ label: "Instagram" }, { label: "Telegram", hot: true }].map((l, i) => (
                  <Button key={l.label} variant={l.hot ? "default" : "outline"} size="sm" style={{ ...links[i].style, ...(l.hot ? { background: V.main, ...pulse(direct) } : {}) }}>
                    {l.label}
                  </Button>
                ))}
              </CardFooter>
            </Card>
          </Zoom>
        </div>
      )}
      {list.t > 0 && (
        <div className="v19-inter">
          <Zoom top={CARD_TOP} w={440} s={CARD_S} style={list.style}>
            <Card className="gap-3 py-5" style={cardSurface(CARD_S)}>
              <CardHeader className="px-5">
                <CardTitle className="text-[19px]" style={{ color: INK }}>
                  Сохраненные
                </CardTitle>
                <CardAction>
                  <Button size="sm" style={{ background: V.main, ...pulse(pdf) }}>
                    PDF
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 px-5 text-[15px]">
                {["Сиэтл", "Берлин", "Алматы"].map((n, i) => (
                  <div key={n} className="border-b pb-1.5 last:border-0" style={{ color: INK, opacity: Math.min(1, springAt(frame, F.save + 34 + i * 8, SPRING.smooth)) }}>
                    {n}
                  </div>
                ))}
              </CardContent>
            </Card>
          </Zoom>
        </div>
      )}
      {done.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center" }}>
          <div style={{ ...done.style, transform: `${done.style.transform} scale(2)`, transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE.violet}>
              <FileDown size={18} strokeWidth={2.2} /> spisok-centrov.pdf
            </GlassPlate>
          </div>
        </div>
      )}
      <Pointer
        frame={frame}
        keys={[
          { f: F.links + 20, x: 900, y: 1200 },
          { f: F.direct - 8, x: TG.x, y: TG.y },
          { f: F.save - 8, x: BOOKMARK.x, y: BOOKMARK.y },
          { f: F.pdf - 6, x: PDF_BTN.x, y: PDF_BTN.y },
        ]}
        clicks={[F.direct, F.save, F.pdf + 6]}
        show={[F.links + 16, F.dataIn - 6]}
      />
    </>
  );
};
// click targets on screen (checked on stills)
const TG = { x: 392, y: 290 };
const BOOKMARK = { x: 936, y: 182 };
const PDF_BTN = { x: 912, y: 186 };

/* ───────── 6. Honest: data is incomplete ───────── */

const ROWS = [
  { at: F.noContacts, text: "Нет контактов", n: "103" },
  { at: F.noAbout, text: "Нет описания", n: "45" },
];
const Data: React.FC<{ frame: number }> = ({ frame }) => {
  const stat = pop(frame, F.third - 4, SPRING.smooth);
  const fill = ease.out(progress(frame, F.third, F.third + 50));
  const word = springAt(frame, F.incomplete, SPRING.smooth);
  return (
    <>
      <div style={{ position: "absolute", left: 100, right: 100, top: 150, ...HEADING, fontSize: 96 }}>
        <Words text="Данные" frame={frame} at={1905} />{" "}
        <span style={{ display: "inline-block", fontWeight: 700, opacity: Math.min(1, word * 1.3), transform: `translateY(${(1 - word) * 30}px)` }}>
          <Mark frame={frame} at={F.incomplete + 4} color={V.main}>
            неполные
          </Mark>
        </span>
      </div>
      {stat.t > 0 && (
        <div style={{ ...stat.style, position: "absolute", left: 100, right: 100, top: 360 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
            <span style={{ ...NUMBER, fontSize: 150, color: V.main }}>{count(frame, F.third, F.third + 50, 0, 151)}</span>
            <span style={{ ...NUMBER, fontSize: 64, fontWeight: 400 }}>из 410</span>
          </div>
          <div style={{ position: "relative", height: 26, borderRadius: 13, background: "#F1F1F3", overflow: "hidden", marginTop: 28 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${63 * fill}%`, background: `linear-gradient(90deg, ${V.vivid}, ${V.glow})`, borderRadius: 13 }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${37 * fill}%`, backgroundImage: `repeating-linear-gradient(-45deg, ${V.pale} 0 10px, #fff 10px 20px)`, borderLeft: `3px solid #fff` }} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 100, right: 100, top: 720, display: "flex", flexDirection: "column", gap: 34 }}>
        {ROWS.map((r) => {
          const p = pop(frame, r.at, SPRING.smooth);
          if (p.t <= 0) return null;
          return (
            <div key={r.text} style={{ ...p.style, display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, border: `4px dashed ${tint(V.main, 0.45)}` }} />
              <span style={{ ...PARAGRAPH, fontSize: 54, lineHeight: 1 }}>{r.text}</span>
              <span style={{ ...NUMBER, marginLeft: "auto", fontSize: 64, color: V.main }}>{r.n}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 7. Help: "Помочь дополнить" -> Telegram chat ───────── */

const CHAT_AT = F.press + 22;
const CHAT_S = 1.8;
const HELP_TOP = 330;
const Help: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOut = progress(frame, CHAT_AT - 14, CHAT_AT - 4);
  const card = pop(frame, F.helpIn + 14, SPRING.smooth);
  const pressed = springAt(frame, F.press - 2, SPRING.snappy) * (1 - springAt(frame, F.press + 8, SPRING.snappy));
  const chat = pop(frame, CHAT_AT - 4, SPRING.smooth);
  const done = frame >= F.update + 24;
  const doneP = springAt(frame, F.update + 24, SPRING.bouncy);
  return (
    <>
      {titleOut < 1 && (
        <div style={{ position: "absolute", left: 100, right: 100, top: 150, textAlign: "center", opacity: 1 - titleOut, filter: titleOut > 0 ? `blur(${titleOut * 10}px)` : undefined }}>
          <Title text="Знаете такой *центр*" frame={frame} at={F.helpIn + 6} stagger={6} size={84} />
        </div>
      )}
      <div className="v19-inter">
        <Zoom top={HELP_TOP} w={440} s={CARD_S} style={card.style}>
          <Card className="gap-4 py-5" style={{ ...cardSurface(CARD_S), boxShadow: `${shadowAt(CARD_S)}${done ? `, 0 0 0 1.5px ${V.main}` : ""}` }}>
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-[19px]" style={{ color: done ? V.main : INK }}>
                {done ? (
                  <span style={{ scale: String(0.6 + 0.4 * Math.min(doneP, 1.2)), display: "inline-flex" }}>
                    <Sequence from={F.update + 24} layout="none">
                      <CheckIcon size={22} strokeWidth={3} color={V.main} />
                    </Sequence>
                  </span>
                ) : (
                  <span style={{ width: 18, height: 18, borderRadius: 9, border: "2px dashed #9a9a9a", display: "inline-block" }} />
                )}
                {done ? "Карточка обновлена" : "Данные неполные"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="px-5">
              <Button size="sm" style={{ background: "#229ED9", transform: `scale(${1 - pressed * 0.06})`, boxShadow: `0 0 0 ${pressed * 6}px #229ED955` }}>
                Помочь дополнить
              </Button>
            </CardFooter>
          </Card>
        </Zoom>
      </div>
      {chat.t > 0 && (
        <div className="v19-inter" style={{ ...chat.style, position: "absolute", left: (W - 480 * CHAT_S) / 2, top: 640, width: 480, height: 360, transformOrigin: "0 0", scale: String(CHAT_S), borderRadius: 24 / CHAT_S, overflow: "hidden", background: "#DCE6D9", boxShadow: shadowAt(CHAT_S) }}>
          <Sequence from={CHAT_AT} layout="none">
            <TelegramChatFlow
              contact={{ name: "tatarverse" }}
              messages={[
                { from: "me", text: "instagram.com/tatar_seattle", time: "12:40" },
                { from: "them", text: "Обновили карточку", reaction: "🔥", time: "12:41" },
              ]}
              speed={1.15}
            />
          </Sequence>
        </div>
      )}
      <Sequence from={F.update + 24} durationInFrames={F.finalIn - F.update - 10} layout="none">
        <Confetti colors={[V.main, V.vivid, V.glow, tint(V.main, 0.6), tint(V.main, -0.35)]} originX={0.5} originY={0.3} particleCount={150} power={9} gravity={0.12} lifetime={120} size={13} seed={19} />
      </Sequence>
      <Pointer frame={frame} keys={[{ f: F.helpIn + 40, x: 860, y: 1250 }, { f: F.press - 8, x: HELP_BTN.x, y: HELP_BTN.y }, { f: CHAT_AT + 40, x: 940, y: 1250 }]} clicks={[F.press]} show={[F.helpIn + 36, CHAT_AT + 30]} />
    </>
  );
};
const HELP_BTN = { x: 262, y: 424 };

/* ───────── 8. Final: quadtree-mark builds "T", then "atarverse" (from the 16:9 cut) ───────── */

// Capital T, cap height 100: crossbar + stem
const T_PATH = "M0 0 H84 V18 H51.5 V100 H32.5 V18 H0 Z";
const Final: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Box at={F.finalIn} top={180} h={760}>
      <QuadtreeMark logo={T_PATH} name="atarverse" capHeight={0.72} accent={V.main} theme="light" speed={0.5} background="transparent" />
    </Box>
    <div style={{ position: "absolute", left: 100, right: 100, top: 960, textAlign: "center" }}>
      <Title text="Найди своих *рядом*" frame={frame} at={[F.find, F.find + 8, F.near]} size={80} />
    </div>
  </>
);

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.introIn], El: Hook },
  { range: [F.introIn, F.mapIn], El: Intro },
  { range: [F.mapIn, F.searchIn], El: Numbers },
  { range: [F.searchIn, F.specIn], El: SearchScene },
  { range: [F.specIn, F.dataIn], El: Cards },
  { range: [F.dataIn, F.helpIn], El: Data },
  { range: [F.helpIn, F.finalIn], El: Help },
  { range: [F.finalIn, F.duration + 30], El: Final },
];

const HEADLINES: { from: number; text: string }[] = [];

// flash-sweep: a violet band passes over the real cut, its peak lands on the scene boundary
const SWEEPS = [F.mapIn, F.specIn, F.finalIn];
const Sweep: React.FC<{ at: number }> = ({ at }) => (
  <Sequence from={at - 9} durationInFrames={40} layout="none">
    <FlashSweep overlay from={<></>} to={<></>} hold={0} duration={18} variant="dark" tint={tint(V.main, 0.55)} direction="right" />
  </Sequence>
);

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
  { src: "sfx2/typing.mp3", from: TYPE[0], volume: 0.12 },
  { src: "sfx2/click.mp3", from: F.open, volume: 0.3 },
  { src: "sfx2/pop.mp3", from: F.open + 8, volume: 0.28 },
  { src: "sfx2/ding.mp3", from: F.site - 2, volume: 0.24 },
  // scene transitions: textures from the SFX/ library, alternating
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.introIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.mapIn - 8, volume: 0.22 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.searchIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.specIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.dataIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.helpIn - 8, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.finalIn - 4, volume: 0.2 },
  // 2. phone: one soft click per flick (local 40 + i * 46 at speed 0.9), page pushes
  ...[0, 1, 2].map((i) => ({ src: "sfx2/click.mp3", from: F.introIn + Math.round((40 + i * 46) / 0.9), volume: 0.16 })),
  ...PAGES.map((p) => ({ src: "sfx/01_Ripple_Textures.wav", from: F.introIn + p.at - 4, volume: 0.1 })),
  // 3. numbers land
  { src: "sfx/03_Basscrack.wav", from: F.mapIn + 20, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.mapIn + 120, volume: 0.22 },
  { src: "sfx/03_Basscrack.wav", from: F.countries - 4, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.countries + 60, volume: 0.22 },
  // 4. roles roll, geolocation
  ...[F.country + 30, F.category, F.geo].map((from) => ({ src: "sfx2/click.mp3", from: from - 6, volume: 0.16 })),
  { src: "sfx2/click.mp3", from: F.nearest - 2, volume: 0.28 },
  { src: "sfx2/ding.mp3", from: F.nearest + 2, volume: 0.22 },
  // 5. card: links, write, save, pdf
  ...[0, 14].map((d) => ({ src: "sfx2/pop.mp3", from: F.links + d, volume: 0.2 })),
  { src: "sfx2/click.mp3", from: F.direct, volume: 0.3 },
  { src: "sfx2/click.mp3", from: F.save, volume: 0.3 },
  { src: "sfx2/pop.mp3", from: F.save + 30, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.pdf + 6, volume: 0.3 },
  { src: "sfx2/ding.mp3", from: F.pdf + 24, volume: 0.24 },
  // 6. honest: the stat, gaps
  { src: "sfx/03_Basscrack.wav", from: F.incomplete, volume: 0.1 },
  ...ROWS.map((r) => ({ src: "sfx2/pop.mp3", from: r.at + 4, volume: 0.26 })),
  { src: "sfx/01_Ripple_Textures.wav", from: F.third, volume: 0.12 },
  // 7. help: click, message sent, reply, confetti
  { src: "sfx2/click.mp3", from: F.press, volume: 0.32 },
  { src: "sfx2/typing.mp3", from: CHAT_AT + 10, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: CHAT_AT + 69, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: CHAT_AT + 144, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.update + 26, volume: 0.28 },
  // 8. final: the T resolves, the name lands
  { src: "sfx/03_Basscrack.wav", from: F.finalIn + 148, volume: 0.1 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row.
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-green" },
  { at: 110, e: "smile-green" },
  { at: 220, e: "confident-emerald" },
  { at: F.introIn, e: "portrait-green" },
  { at: 420, e: "confident-traditional" },
  { at: 560, e: "smile-green" },
  { at: F.mapIn, e: "confident-emerald" },
  { at: 820, e: "portrait-green" },
  { at: 930, e: "confident-traditional" },
  { at: F.searchIn, e: "smile-green" },
  { at: 1150, e: "confident-emerald" },
  { at: 1270, e: "portrait-green" },
  { at: F.specIn, e: "confident-traditional" },
  { at: 1540, e: "smile-green" },
  { at: 1650, e: "confident-emerald" },
  { at: 1760, e: "portrait-green" },
  { at: F.dataIn, e: "portrait-traditional" },
  { at: F.incomplete, e: "kalpak-green" },
  { at: 2130, e: "confident-traditional" },
  { at: F.helpIn, e: "portrait-traditional" },
  { at: 2420, e: "confident-emerald" },
  { at: F.update, e: "portrait-green" },
  { at: F.finalIn, e: "confident-traditional" },
  { at: F.find, e: "portrait-green" },
];

// Host alternates sides on scene changes, center on the hook and the final
const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.introIn, s: "right" },
  { at: F.mapIn, s: "left" },
  { at: F.searchIn, s: "right" },
  { at: F.specIn, s: "left" },
  { at: F.dataIn, s: "right" },
  { at: F.helpIn, s: "left" },
  { at: F.finalIn, s: "center" },
];

const Overlay: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {SWEEPS.map((at) => (
      <Sweep key={at} at={at} />
    ))}
    <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={V.main} stances={STANCES} />
  </>
);

// Remocn components ship Geist / serif: force Inter inside their boxes only (.v19-inter); own text follows the design system
// shadcn borders: the project css has no base `border-border` layer, so set the hairline color here
const InterOnly = () => <style>{`.v19-inter, .v19-inter * { font-family: ${fontFamily}, sans-serif !important; } .v19-inter [data-slot], .v19-inter [data-slot] * { border-color: #E4E4E7; }`}</style>;

const MUSIC = "v19/music/bed.mp3";
const MUSIC_LEVEL = [0.045, 0.11] as const;

export const Video19: React.FC<{ music?: boolean }> = ({ music = true }) => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <InterOnly />
    <ReelShell scenes={SCENES} headlines={HEADLINES} headlineSize={84} vo={VO} sfx={SFX} duration={F.duration} music={music ? MUSIC : null} musicLevel={MUSIC_LEVEL} overlay={Overlay} bg={BG} />
  </AbsoluteFill>
);

/* ───────── 3-part series: slices of the full reel on scene boundaries ───────── */

export const PARTS19 = [
  [0, F.searchIn], // 1. hook, what it is, 410 centers in 53 countries
  [F.searchIn, F.dataIn], // 2. search, geolocation, cards, saved + PDF
  [F.dataIn, F.duration], // 3. data is incomplete, help fill it in, final
] as const;

// Parts 2 and 3 open with their own line (scripts/gen-vo-v19-parts.py); word frames are local to the line
const VO_AT = 8;
const INTROS: Record<2 | 3, { dur: number; title: string; titleAt: number; words: [number, string][]; keys: AvatarKey[] }> = {
  2: {
    dur: 244,
    title: "Как найти *своих*",
    titleAt: 171,
    words: [[2, "tatarverse.cc"], [103, "часть"], [121, "вторая"], [171, "как"], [184, "найти"], [208, "своих"]],
    keys: [{ at: 0, e: "smile-green" }, { at: 120, e: "confident-emerald" }],
  },
  3: {
    dur: 212,
    title: "Сделаем каталог *полнее*",
    titleAt: 79,
    words: [[2, "Часть"], [24, "третья"], [79, "как"], [94, "вместе"], [124, "сделать"], [146, "каталог"], [172, "полнее"]],
    keys: [{ at: 0, e: "portrait-green" }, { at: 110, e: "confident-traditional" }],
  },
};
const introLen = (n: 1 | 2 | 3) => (n === 1 ? 0 : VO_AT + INTROS[n].dur + 24);
export const partLen = (n: 1 | 2 | 3) => introLen(n) + PARTS19[n - 1][1] - PARTS19[n - 1][0];

// Series badge: GlassPlate (priority component; badge meaning, used once per part)
const PartPill: React.FC<{ frame: number; at: number; n: number; scale?: number }> = ({ frame, at, n, scale = 2.2 }) => {
  const p = pop(frame, at);
  if (p.t <= 0) return null;
  return (
    <div style={{ ...p.style, transform: `${p.style.transform} scale(${scale})`, transformOrigin: "50% 0", height: 56 * scale }}>
      <GlassPlate bg={PLATE.violet}>
        <Layers size={18} strokeWidth={2.2} /> Часть {n} из 3
      </GlassPlate>
    </div>
  );
};

const PartIntro = (n: 2 | 3): React.FC<{ frame: number }> => {
  const { title, titleAt } = INTROS[n];
  const El: React.FC<{ frame: number }> = ({ frame }) => {
    const logo = pop(frame, 2);
    return (
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 400, gap: 56 }}>
        {logo.t > 0 && (
          <div style={logo.style}>
            <Logo size={150} />
          </div>
        )}
        <PartPill frame={frame} at={VO_AT + 20} n={n} />
        <div style={{ textAlign: "center", maxWidth: 880 }}>
          <Title text={title} frame={frame} at={VO_AT + titleAt} stagger={6} size={112} />
        </div>
      </AbsoluteFill>
    );
  };
  return El;
};

const IntroShell: React.FC<{ n: 2 | 3 }> = ({ n }) => {
  const { dur, words, keys } = INTROS[n];
  const len = introLen(n);
  const scenes: SceneDef[] = [{ range: [0, len], El: PartIntro(n) }];
  const spoken = words.map(([f, w]) => ({ f: VO_AT + f, w }));
  const Avatar: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={keys} words={spoken} color={V.main} stances={[{ at: 0, s: "center" }]} />;
  const sfx: Sfx[] = [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
    { src: "sfx2/pop.mp3", from: VO_AT + 20, volume: 0.24 },
    { src: "sfx/06_Ripple_Textures_II.wav", from: len - 8, volume: 0.2 },
  ];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <ReelShell scenes={scenes} headlines={[]} vo={[{ src: `v19/vo/p${n}.mp3`, from: VO_AT, dur }]} sfx={sfx} duration={len} music={null} overlay={Avatar} bg={BG} />
    </AbsoluteFill>
  );
};

/** Part n of the series: own intro (parts 2, 3) or a "Часть 1 из 3" pill (part 1), then the slice; one music bed across the whole part */
export const Video19Part = (n: 1 | 2 | 3): React.FC => {
  const [from, to] = PARTS19[n - 1];
  const lead = introLen(n);
  const total = partLen(n);
  const vo = [...(n === 1 ? [] : [{ src: "", from: VO_AT, dur: INTROS[n].dur }]), ...VO.map((v) => ({ ...v, from: v.from - from + lead }))];
  const C: React.FC = () => (
    <AbsoluteFill style={{ background: "#fff" }}>
      {n !== 1 && (
        <Sequence durationInFrames={lead}>
          <IntroShell n={n} />
        </Sequence>
      )}
      <Sequence from={lead} durationInFrames={to - from} layout="none">
        <Sequence from={-from} layout="none">
          <Video19 music={false} />
        </Sequence>
      </Sequence>
      {n === 1 && <Part1Pill />}
      <Audio loop src={staticFile(MUSIC)} volume={musicVolume(vo, total, [], MUSIC_LEVEL)} />
    </AbsoluteFill>
  );
  return C;
};

// Part 1 keeps the original hook; the pill sits in the free band between the search bar and the host
const Part1Pill: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, 150, 160);
  return (
    <div style={{ position: "absolute", top: 1170, left: 0, width: W, display: "flex", justifyContent: "center", opacity: 1 - out, filter: out > 0 ? `blur(${out * 10}px)` : undefined }}>
      <PartPill frame={frame} at={20} n={1} scale={2} />
    </div>
  );
};
