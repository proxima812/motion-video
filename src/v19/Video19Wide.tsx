import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Confetti } from "@/components/remocn/confetti";
import { DotMap, type DotMapCity } from "@/components/remocn/dot-map";
import { FlashSweep } from "@/components/remocn/flash-sweep";
import { FractionSplit } from "@/components/remocn/fraction-split";
import { HalftoneCut } from "@/components/remocn/halftone-cut";
import { ParallaxDepth } from "@/components/remocn/parallax-depth";
import { PhoneScroll } from "@/components/remocn/phone-scroll";
import { PovSetup } from "@/components/remocn/pov-setup";
import { QuadtreeMark } from "@/components/remocn/quadtree-mark";
import { ScreenshotTour, type TourStop } from "@/components/remocn/screenshot-tour";
import { SearchReveal } from "@/components/remocn/search-reveal";
import { SpecSheet } from "@/components/remocn/spec-sheet";
import { TileWave } from "@/components/remocn/tile-wave";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { tint } from "@/lib/remocn/tint";
import { SPRING, progress, springAt } from "../stage/motion";
import { Pointer, pop, type Range, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { fontFamily } from "../ui/theme";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// Archived 16:9 version of video 19 (composition V19Wide). tatarverse.cc presentation (@the_tatarverse, RU, 16:9 1920x1080 so Remocn scenes keep their native layout).
// Accent = the site's own violet palette "Яна Шәмәха" (palettes/violet.css); every component accent is a violet shade.
const V = { main: "#6E33CC", vivid: "#6920DF", glow: "#9D68F3", pale: "#EFE8FC", ink: "#2e2e2f", card: "#F5F4F0" };
const H = 1080;
const img = (name: string) => staticFile(`v19/img/${name}.png`);

/* ───────── Shared bits ───────── */

// Remocn scenes fill the frame; shift them left so the host keeps the bottom-right corner
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill className="v19-inter" style={{ transform: "translateX(-130px) scale(0.88)" }}>
    {children}
  </AbsoluteFill>
);
/** A Remocn scene on its own clock from `at` */
const At: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

/** tatarverse flower, always #2e2e2f */
const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("tatarverse/logo.svg")} style={{ width: size, height: size, objectFit: "contain" }} />;

const Chip: React.FC<{ frame: number; at: number; children: React.ReactNode; tone?: "accent" | "plain" }> = ({ frame, at, children, tone = "plain" }) => {
  const p = pop(frame, at, SPRING.bouncy);
  if (p.t <= 0) return null;
  return (
    <div style={{ ...p.style, padding: "14px 28px", borderRadius: 999, fontSize: 36, fontWeight: 600, whiteSpace: "nowrap", background: tone === "accent" ? V.main : "#fff", color: tone === "accent" ? "#fff" : V.ink, border: tone === "accent" ? "none" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 18px 40px -24px rgba(30,20,60,0.4)" }}>
      {children}
    </div>
  );
};
const Chips: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 0, width: 1660, top, display: "flex", justifyContent: "center", gap: 20 }}>{children}</div>
);

/* ───────── 1. Hook: search-reveal on a parallax-depth camera, then pov-setup ───────── */

// beat 1 (0-HOOK_SPLIT): "Если бы я переезжала в новый город с нуля" -> a search for a Tatar center nearby
// beat 2 (HOOK_SPLIT-introIn): "первым делом открыла бы этот сайт" -> POV card, punch = tatarverse.cc on "сайт"
const HOOK_SPLIT = 140;
const QUERY = "татарский центр рядом";
const HILLS = { sky: "#FFFFFF", sun: tint(V.glow, 0.35), far: tint(V.main, 0.9), mid: tint(V.main, 0.78), near: tint(V.main, 0.62) };

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, HOOK_SPLIT - 4, HOOK_SPLIT + 6);
  return (
    <>
      {swap < 1 && (
        <AbsoluteFill className="v19-inter" style={{ opacity: 1 - swap }}>
          <ParallaxDepth
            colors={HILLS}
            distance={0.18}
            push={0.14}
            speed={0.85}
            seed={7}
            extraLayers={[
              {
                depth: 1.6,
                content: (
                  <AbsoluteFill style={{ transform: "translate(-110px, -90px)" }}>
                    <SearchReveal text={QUERY} fieldWidth={640} fontSize={54} framesPerCharacter={2} speed={1.5} color={V.ink} ringColor={tint(V.main, 0.7)} panelColor={V.main} accentColor={tint(V.main, 0.75)} backgroundColor="transparent" />
                  </AbsoluteFill>
                ),
              },
            ]}
          />
        </AbsoluteFill>
      )}
      {swap > 0 && (
        <AbsoluteFill className="v19-inter" style={{ opacity: swap }}>
          <GshFlat.Provider value="#FFFFFF">
            <Stage>
              <At at={HOOK_SPLIT}>
                <PovSetup theme="light" label="POV:" setup="ты в новом городе" lead="и сразу" punch="tatarverse.cc" speed={1.2} fit={0.5} stage="#FFFFFF" />
              </At>
            </Stage>
          </GshFlat.Provider>
        </AbsoluteFill>
      )}
    </>
  );
};

/* ───────── 2. Intro: phone-scroll through the mobile home page ───────── */

// home.png = 430 px mobile viewport at 2x (860x5200) -> 393 pt wide in the phone, ~2376 pt tall
const Intro: React.FC<{ frame: number }> = () => (
  <Stage>
    <At at={F.introIn}>
      <PhoneScroll src={img("home")} stops={[620, 1160, 1500]} eyebrow="Знакомьтесь" label="tatarverse.cc - каталог центров" labelAccent="по всему миру" accent={V.main} theme="light" speed={0.45} />
    </At>
  </Stage>
);

/* ───────── 3. Map: 410 centers light up ───────── */

const CITIES: DotMapCity[] = [
  [49.1, 55.8], [44.5, 48.7], [60.6, 56.8], [56.2, 58.0], [73.4, 61.3], [34.1, 44.9], [86.7, 53.9], [56.0, 54.7], [65.5, 57.2], [37.6, 55.8], [39.7, 47.2], [53.2, 56.8], [68.3, 58.2], [44.7, 43.0], [30.3, 59.9], [82.9, 55.0], [104.3, 52.3], [131.9, 43.1], [61.4, 55.2], [50.1, 53.2], // Россия
  [71.4, 51.2], [76.9, 43.2], [80.2, 50.4], [51.4, 51.2], [69.6, 42.3], // Казахстан
  [74.6, 42.9], [30.5, 50.5], [69.2, 41.3], [-77.0, 38.9], [-118.2, 34.1], [-122.3, 47.6], [-74.0, 40.7], [32.9, 39.9], [29.0, 41.0], [21.0, 52.2], [25.3, 54.7], [149.1, -35.3], [151.2, -33.9],
  [-75.7, 45.4], [-79.4, 43.7], [24.9, 60.2], [13.4, 52.5], [49.9, 40.4], [24.7, 59.4], [27.6, 53.9], [68.8, 38.6], [24.1, 56.9], [55.3, 25.3], [26.1, 44.4], [41.0, 43.0], [23.3, 42.7],
  [-0.1, 51.5], [116.4, 39.9], [-6.3, 53.3], [77.2, 28.6], [58.4, 37.9], [51.4, 35.7], [31.2, 30.0], [-58.4, -34.6], [14.5, 46.1], [20.5, 44.8], [-9.1, 38.7], [44.5, 40.2], [16.4, 48.2],
  [127.0, 37.6], [4.9, 52.4], [28.0, -26.2], [139.7, 35.7], [-77.0, -12.0], [14.4, 50.1], [-3.7, 40.4], [69.2, 34.5], [35.2, 31.8], [4.4, 50.8], [28.9, 47.0], [18.1, 48.3], [19.0, 47.5],
  [44.8, 41.7], [18.1, 59.3], [7.4, 46.9], [12.5, 41.9], [2.3, 48.9],
].map(([lon, lat]) => ({ lon, lat }));

const MapScene: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Stage>
      <At at={F.mapIn}>
        <DotMap count={410} label="центров" cities={CITIES} accent={V.main} theme="light" speed={0.33} />
      </At>
    </Stage>
    <Chips top={60}>
      <Chip frame={frame} at={F.countries} tone="accent">53 страны</Chip>
      <Chip frame={frame} at={F.countries + 40}>101 регион</Chip>
    </Chips>
  </>
);

/* ───────── 4. Search: two screenshot tours (catalog, then "Центры рядом") ───────── */

// stops in CSS px of the 1600x900 desktop captures (saved at 2x)
const TOUR_CATALOG: TourStop[] = [
  { x: 416, y: 182, width: 1136, height: 40, label: "Название, город, страна или регион" },
  { x: 56, y: 290, width: 304, height: 470, label: "Фильтры: регион мира и категория" },
];
const TOUR_NEAR: TourStop[] = [
  { x: 176, y: 278, width: 350, height: 40, label: "Страна определится сама" },
  { x: 176, y: 384, width: 1200, height: 300, label: "Ближайшие города" },
];
const SPLIT = F.geo - 50; // catalog -> nearby
const Search: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, SPLIT - 6, SPLIT + 10);
  const tour = (at: number, src: string, stops: TourStop[], fps: number) => (
    <Stage>
      <At at={at}>
        <ScreenshotTour src={img(src)} screenshotWidth={1600} screenshotHeight={900} stops={stops} framesPerStop={fps} pullBack={false} dim={0.5} theme="light" accent={V.main} font={fontFamily} />
      </At>
    </Stage>
  );
  return (
    <>
      {swap < 1 && <AbsoluteFill style={{ opacity: 1 - swap, filter: swap > 0 ? `blur(${swap * 14}px)` : undefined }}>{tour(F.searchIn, "d-catalog", TOUR_CATALOG, 74)}</AbsoluteFill>}
      {swap > 0 && <AbsoluteFill style={{ opacity: swap, transform: `translateY(${(1 - swap) * 40}px)` }}>{tour(SPLIT, "d-nearby", TOUR_NEAR, 100)}</AbsoluteFill>}
    </>
  );
};

/* ───────── 5. What's inside: spec sheet ───────── */

const Spec: React.FC<{ frame: number }> = () => (
  <Stage>
    <At at={F.specIn}>
      <SpecSheet
        title="Карточки"
        name="tatarverse.cc"
        logo={<Img src={staticFile("tatarverse/logo.svg")} style={{ width: 40, height: 40 }} />}
        highlight={3}
        rows={[
          { label: "Ссылки", value: "215" },
          { label: "Связь", value: "напрямую" },
          { label: "Сохраненные", value: "в закладках" },
          { label: "Печать", value: "PDF" },
          { label: "Языки", value: "RU · EN" },
        ]}
        accent={V.main}
        theme="light"
        speed={0.18}
      />
    </At>
  </Stage>
);

/* ───────── 6. Honest: 3/8 of the cards need help ───────── */

const Data: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Stage>
      <At at={F.dataIn}>
        <FractionSplit line="3/8 карточек ждут помощи" highlight="3/8" keep={3} accentPiece={0} accent={V.main} theme="light" speed={0.33} />
      </At>
    </Stage>
    <Chips top={900}>
      <Chip frame={frame} at={F.noContacts}>без контактов: 103</Chip>
      <Chip frame={frame} at={F.noAbout}>без описания: 45</Chip>
    </Chips>
  </>
);

/* ───────── 7. Help: click "Помочь дополнить", send a link, the card is complete ───────── */

const HELP = { x: 110, y: 250, s: 1.12 }; // help.png (780x395) on screen
const Help: React.FC<{ frame: number }> = ({ frame }) => {
  const title = pop(frame, F.helpIn + 6, SPRING.smooth);
  const card = pop(frame, F.helpIn + 8, SPRING.smooth);
  const pressed = springAt(frame, F.press - 2, SPRING.snappy) * (1 - springAt(frame, F.press + 8, SPRING.snappy));
  const msg = pop(frame, F.sendLink - 4, SPRING.bouncy);
  const typed = "instagram.com/tatar_center".slice(0, Math.floor(Math.max(0, frame - F.sendLink) / 2.2));
  const sent = springAt(frame, F.sendLink + 62, SPRING.smooth);
  const done = pop(frame, F.update + 4, SPRING.bouncy);
  const btn = { x: HELP.x + 35 * HELP.s, y: HELP.y + 252 * HELP.s, w: 292 * HELP.s, h: 45 * HELP.s };
  return (
    <>
      <div style={{ ...title.style, position: "absolute", left: HELP.x, top: 110, fontSize: 76, fontWeight: 700, letterSpacing: "-0.04em", color: "#000" }}>
        Знаете такой <span style={{ color: V.main }}>центр?</span>
      </div>
      <div style={{ ...card.style, position: "absolute", left: HELP.x, top: HELP.y, width: 780 * HELP.s, height: 395 * HELP.s }}>
        {/* the crop has the page's grey bg in its corners: clip to the block's own rounding */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 50 * HELP.s, overflow: "hidden", boxShadow: "0 30px 70px -40px rgba(30,20,60,0.4)" }}>
          <Img src={img("help")} style={{ width: "100%", height: "100%" }} />
        </div>
        {done.t > 0 && (
          <div style={{ ...done.style, position: "absolute", left: 22 * HELP.s, top: 22 * HELP.s, padding: "10px 22px", borderRadius: 999, background: V.pale, color: V.main, fontSize: 34, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, boxShadow: `0 10px 30px -12px ${V.main}80` }}>
            ✓ Карточка заполнена
          </div>
        )}
      </div>
      {/* violet confetti when the card is complete */}
      <Sequence from={F.update + 4} durationInFrames={200} layout="none">
        <Confetti colors={[V.main, V.vivid, V.glow, tint(V.main, 0.6), tint(V.main, -0.35)]} originX={0.28} originY={0.35} particleCount={170} power={9} gravity={0.12} lifetime={190} size={13} seed={19} />
      </Sequence>
      <div style={{ position: "absolute", left: btn.x, top: btn.y, width: btn.w, height: btn.h, borderRadius: 12, boxShadow: `0 0 0 ${pressed * 10}px ${V.glow}66`, transform: `scale(${1 - pressed * 0.04})` }} />
      <Pointer frame={frame} keys={[{ f: F.helpIn + 20, x: 1200, y: 800 }, { f: F.press - 8, x: btn.x + btn.w * 0.6, y: btn.y + btn.h * 0.6 }, { f: F.sendLink + 20, x: 1380, y: 640 }]} clicks={[F.press, F.sendLink + 62]} show={[F.helpIn + 16, F.update]} />
      {/* Telegram-like chat with the project */}
      {msg.t > 0 && (
        <div style={{ ...msg.style, position: "absolute", left: 1010, width: 540, top: 330, padding: "26px 30px", borderRadius: 36, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 30px 70px -40px rgba(30,20,60,0.45)", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 600, color: V.ink }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: "#F1F1F3", display: "grid", placeItems: "center" }}>
              <Logo size={34} />
            </div>
            tatarverse
            <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 500, color: "#229ED9" }}>Telegram</span>
          </div>
          <div style={{ alignSelf: "flex-end", padding: "18px 24px", borderRadius: "28px 28px 8px 28px", background: sent > 0.5 ? "#229ED9" : "#EEF1F4", color: sent > 0.5 ? "#fff" : V.ink, fontSize: 30, fontWeight: 500, lineHeight: 1.3, transform: `translateY(${-sent * 6}px)` }}>
            Сайт центра:
            <br />
            {typed}
            {sent < 0.5 && <span style={{ display: "inline-block", width: 3, height: 30, marginLeft: 4, verticalAlign: "-5px", background: V.ink, opacity: Math.floor(frame / 16) % 2 ? 1 : 0 }} />}
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 8. Final: quadtree-mark builds "T", then "atarverse" (no .cc) ───────── */

// Capital T, cap height 100: crossbar + stem
const T_PATH = "M0 0 H84 V18 H51.5 V100 H32.5 V18 H0 Z";
const Final: React.FC<{ frame: number }> = () => (
  <Stage>
    <At at={F.finalIn}>
      <QuadtreeMark logo={T_PATH} name="atarverse" capHeight={0.72} accent={V.main} theme="light" speed={0.5} />
    </At>
  </Stage>
);

/* ───────── Transitions (above scenes, under the host) ───────── */

// flash-sweep: a violet band passes over the real cut, its peak lands on the scene boundary
const Sweep: React.FC<{ at: number; dir?: "right" | "left" }> = ({ at, dir = "right" }) => (
  <Sequence from={at - 9} durationInFrames={40} layout="none">
    <FlashSweep overlay from={<></>} to={<></>} hold={0} duration={18} variant="dark" tint={tint(V.main, 0.55)} direction={dir} />
  </Sequence>
);
// title-card transitions: fade in, play, fade out over the next scene's start
const Card: React.FC<{ frame: number; at: number; len: number; children: React.ReactNode }> = ({ frame, at, len, children }) => {
  if (frame < at || frame >= at + len) return null;
  const o = Math.min(progress(frame, at, at + 6), 1 - progress(frame, at + len - 12, at + len));
  return (
    <AbsoluteFill className="v19-inter" style={{ opacity: o }}>
      <Sequence from={at} durationInFrames={len} layout="none">
        {children}
      </Sequence>
    </AbsoluteFill>
  );
};
const TILE_1 = F.introIn - 14; // hook -> intro (after the POV punch on "сайт")
const HALF_1 = F.searchIn - 44; // map -> search
const TILE_2 = F.dataIn - 24; // spec -> data
const HALF_2 = F.helpIn - 44; // data -> help
const Transitions: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Card frame={frame} at={TILE_1} len={100}>
      <TileWave from="Новый город" to="tatarverse.cc" theme="dark" accent={V.main} rows={8} delay={14} />
    </Card>
    <Sweep at={F.mapIn} />
    <Card frame={frame} at={HALF_1} len={96}>
      <HalftoneCut from="410 центров" to="Как искать" theme="light" accent={V.main} speed={1.3} />
    </Card>
    <Sweep at={F.specIn} dir="left" />
    <Card frame={frame} at={TILE_2} len={100}>
      <TileWave from="Удобно" to="Честно" theme="dark" accent={V.main} rows={8} delay={14} />
    </Card>
    <Card frame={frame} at={HALF_2} len={96}>
      <HalftoneCut from="151 карточка" to="Помогите" theme="light" accent={V.main} speed={1.3} />
    </Card>
    <Sweep at={F.finalIn} />
  </>
);

/* ───────── Composition ───────── */

type Scene = { range: Range; El: React.FC<{ frame: number }> };
const SCENES: Scene[] = [
  { range: [0, F.introIn], El: Hook },
  { range: [F.introIn, F.mapIn], El: Intro },
  { range: [F.mapIn, F.searchIn], El: MapScene },
  { range: [F.searchIn, F.specIn], El: Search },
  { range: [F.specIn, F.dataIn], El: Spec },
  { range: [F.dataIn, F.helpIn], El: Data },
  { range: [F.helpIn, F.finalIn], El: Help },
  { range: [F.finalIn, F.duration + 30], El: Final },
];

const sceneStyle = (frame: number, [a, b]: Range): React.CSSProperties => {
  const inT = a === 0 ? 1 : springAt(frame, a, SPRING.smooth);
  const out = progress(frame, b - 8, b + 3);
  return {
    opacity: Math.min(1, inT * 1.5) * (1 - out),
    transform: `translateY(${(1 - inT) * 40 - out * 30}px) scale(${1 - out * 0.04})`,
    filter: out > 0 || inT < 0.98 ? `blur(${Math.max(out * 16, (1 - Math.min(inT, 1)) * 12)}px)` : undefined,
  };
};

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
  { src: "sfx2/typing.mp3", from: 40, volume: 0.12 },
  { src: "sfx/01_Ripple_Textures.wav", from: HOOK_SPLIT - 8, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.site - 6, volume: 0.3 },
  // scene transitions: textures from the SFX/ library, alternating
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.introIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.mapIn - 8, volume: 0.22 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.searchIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.specIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.dataIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.helpIn - 8, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.finalIn - 4, volume: 0.2 },
  // 2. phone-scroll: one soft click per flick (local 40 + i * 46 at speed 0.45)
  ...[0, 1, 2].map((i) => ({ src: "sfx2/click.mp3", from: F.introIn + Math.round((40 + i * 46) / 0.45), volume: 0.16 })),
  // 3. map: count lands, chips
  { src: "sfx/03_Basscrack.wav", from: F.mapIn + 280, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.countries + 2, volume: 0.3 },
  { src: "sfx2/pop.mp3", from: F.countries + 42, volume: 0.26 },
  // 4. tour stops
  ...[F.searchIn + 18, F.searchIn + 92, SPLIT + 18, SPLIT + 118].map((from) => ({ src: "sfx2/click.mp3", from, volume: 0.16 })),
  { src: "sfx/01_Ripple_Textures.wav", from: SPLIT - 8, volume: 0.14 },
  // 5. spec rows + PDF row grows
  { src: "sfx2/pop.mp3", from: F.links, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.pdf + 8, volume: 0.24 },
  // 6. fraction: the bar drains, gap chips
  { src: "sfx/03_Basscrack.wav", from: F.third, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.noContacts + 2, volume: 0.28 },
  { src: "sfx2/pop.mp3", from: F.noAbout + 2, volume: 0.28 },
  // 7. help: click, typing, send, done
  { src: "sfx2/click.mp3", from: F.press, volume: 0.32 },
  { src: "sfx2/typing.mp3", from: F.sendLink, volume: 0.1 },
  { src: "sfx2/click.mp3", from: F.sendLink + 62, volume: 0.26 },
  { src: "sfx2/ding.mp3", from: F.update + 6, volume: 0.28 },
  // 7. confetti
  { src: "sfx2/pop.mp3", from: F.update + 6, volume: 0.24 },
  // 8. final: the T resolves, the name lands
  { src: "sfx/03_Basscrack.wav", from: F.finalIn + 148, volume: 0.1 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row.
// Photos: portrait-green / confident-* = smiles, smile-green = dreamy, portrait-traditional = thinking, kalpak-green = arms crossed (only on "неполные")
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

// what sits behind the word pills: the tile-wave cards end on a deep violet panel

/** Music bed ducked under the voice */
const musicVolume = (f: number) => {
  const talking = VO.some((v) => f >= v.from - 6 && f < v.from + v.dur);
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [F.duration - 30, F.duration], [1, 0], { extrapolateLeft: "clamp" });
  return (talking ? 0.045 : 0.11) * fadeIn * fadeOut;
};

// Remocn components ship Geist / serif: force Inter (tatarverse rule)
const InterOnly = () => <style>{`.v19-inter, .v19-inter * { font-family: ${fontFamily}, sans-serif !important; }`}</style>;

export const Video19Wide: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff", color: V.ink, fontFamily, WebkitFontSmoothing: "antialiased" }}>
      <InterOnly />
      <GshFlat.Provider value={V.card}>
        {SCENES.map(({ range, El }, i) =>
          frame >= range[0] - 2 && frame < range[1] + 6 ? (
            <AbsoluteFill key={i} style={sceneStyle(frame, range)}>
              <El frame={frame} />
            </AbsoluteFill>
          ) : null,
        )}
        <Transitions frame={frame} />
      </GshFlat.Provider>
      <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={V.main} cx={1730} scale={0.7} frameH={H} pillsLeft />

      <Audio loop src={staticFile("v19/music/bed.mp3")} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.src} from={v.from} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
