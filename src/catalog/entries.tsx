import React from "react";
import { Building2, Globe, Handshake, Landmark, Laugh, MessageCircle, Users } from "lucide-react";
import { AbsoluteFill, staticFile } from "remotion";
import { TactileButton, TactileGlassWord, TactilePromptInput, TactileSwitch, TactileTabs } from "tactile-glass-ui";
import { AchievementPop } from "@/components/remocn/achievement-pop";
import { ContributionHeatmap } from "@/components/remocn/contribution-heatmap";
import { GitHubSponsors } from "@/components/remocn/github-sponsors";
import { TestimonialStack } from "@/components/remocn/testimonial-stack";
import { UnitGrid } from "@/components/remocn/unit-grid";
import { AnalyticsFunnel } from "@/components/remocn/analytics-funnel";
import { Caret } from "@/components/remocn/caret";
import { ChatGpt } from "@/components/remocn/chat-gpt";
import { CompactStat } from "@/components/remocn/compact-stat";
import { Confetti } from "@/components/remocn/confetti";
import { CrashZoom } from "@/components/remocn/crash-zoom";
import { CrewOfOne } from "@/components/remocn/crew-of-one";
import { DotMap } from "@/components/remocn/dot-map";
import { ExplodedView } from "@/components/remocn/exploded-view";
import { FlashSweep } from "@/components/remocn/flash-sweep";
import { FontCycle } from "@/components/remocn/font-cycle";
import { FractionSplit } from "@/components/remocn/fraction-split";
import { GridMontage } from "@/components/remocn/grid-montage";
import { HalftoneCut } from "@/components/remocn/halftone-cut";
import { CheckIcon } from "@/components/remocn/icon-check";
import { ImpactShake } from "@/components/remocn/impact-shake";
import { LongVowel } from "@/components/remocn/long-vowel";
import { NumberSplit } from "@/components/remocn/number-split";
import { ParallaxDepth } from "@/components/remocn/parallax-depth";
import { PhoneScroll } from "@/components/remocn/phone-scroll";
import { PromptRestyle } from "@/components/remocn/prompt-restyle";
import { PromptToApp } from "@/components/remocn/prompt-to-app";
import { QuadtreeMark } from "@/components/remocn/quadtree-mark";
import { RankClimb } from "@/components/remocn/rank-climb";
import { ScreenshotTour } from "@/components/remocn/screenshot-tour";
import { SearchReveal } from "@/components/remocn/search-reveal";
import { ShaderWarp } from "@/components/remocn/shader-warp";
import { ShaderWarpCream } from "@/components/remocn/shader-warp-cream";
import { ShardsToGrid } from "@/components/remocn/shards-to-grid";
import { SpeedrunTimer } from "@/components/remocn/speedrun-timer";
import { TelegramChatFlow } from "@/components/remocn/telegram-chat-flow";
import { TileWave } from "@/components/remocn/tile-wave";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { DOT_ORBIT_VARIANTS, DotOrbitBg, type DotOrbitVariant } from "../kit/DotOrbitBg";
import { TatAvatar, type AvatarKey, type SpokenWord, type StanceKey } from "../kit/TatAvatar";
import { GLASS, K, count, shake } from "../kit/reel";
import { Outro } from "../outro/Outro";
import { TatarverseOutro } from "../outro/TatarverseOutro";
import { Cover } from "../cover/Cover";
import { Odometer } from "../ui/Odometer";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { Big, Header, Headline, Paragraph, Said, Strike, Words } from "./own/text";
import { HEADING, INK, NUMBER, PARAGRAPH } from "../kit/design";
import { AiBubble, Bubble, Browser, Card, Chip, Meter, Pill, StatTile, Stamp, Sticker, Terminal } from "./own/surfaces";
import { CheckCircle, DbIcon, Verdict, Wordmark } from "./own/icons";
import { DotGrid, InterScope, PowerOff, Pointer, Punch, ScaleFill, WebScale } from "./own/fx";

// Every component of the catalog with a demo. Pick one in Studio: Playground -> props -> name.
// Groups: own = our components (src/catalog/own, being restyled to src/kit/design.ts),
// shared = our components already shared under src/kit, src/ui, src/scenes, src/stage, src/outro, src/cover,
// remocn / tactile / shadcn / paper = third-party libraries (style them through props, not by editing the library).

export type Group = "own" | "shared" | "remocn" | "tactile" | "shadcn" | "paper";
export type Entry = {
  id: string;
  group: Group;
  /** what it is and when to reach for it */
  use: string;
  /** where it lives / where it was taken from */
  source: string;
  /** demo length (60 fps) */
  frames?: number;
  /** stage behind the demo: Dot Orbit (default for own/shared), white, or nothing (full-frame components) */
  bg?: "orbit" | "white" | "none";
  /** Tactile WebGL components need the engine paint gate */
  tactile?: boolean;
  render: (frame: number) => React.ReactNode;
};

// Stand-in for a video's accent color in demos (each reel passes its own)
const ACCENT = "#6E33CC";

/** Demo layout: content centered in the safe zone */
const Mid: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({ children, gap = 40, style }) => (
  <AbsoluteFill style={{ padding: "150px 100px", alignItems: "center", justifyContent: "center", flexDirection: "column", gap, ...style }}>{children}</AbsoluteFill>
);
/** Design-system surface for web UI drawn at native size and scaled by `s` (WebScale): radius and shadow divided by s */
const webSurface = (s: number): React.CSSProperties => ({ background: "#fff", border: "none", borderRadius: 24 / s, boxShadow: `${-1 / s}px ${-6 / s}px ${55 / s}px ${-11 / s}px rgba(144, 142, 142, 0.2)`, color: INK, fontFamily: PARAGRAPH.fontFamily });
const webHeading: React.CSSProperties = { fontFamily: HEADING.fontFamily, color: INK, fontWeight: 400 };
const Gsh: React.FC<{ children: React.ReactNode }> = ({ children }) => <GshFlat.Provider value="#FFFFFF">{children}</GshFlat.Provider>;

const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "smile-green" },
  { at: 150, e: "confident-emerald" },
  { at: 300, e: "kalpak-green" },
];
const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: 150, s: "left" },
  { at: 300, s: "center" },
];
const SAMPLE: Omit<SpokenWord, "f">[] = [
  { w: "Знакомьтесь" },
  { w: "tatarverse.cc", accent: ACCENT },
  { w: "каталог" },
  { w: "татарских" },
  { w: "центров", accent: ACCENT },
  { w: "по" },
  { w: "всему" },
  { w: "миру", accent: ACCENT },
];
const SPOKEN: SpokenWord[] = Array.from({ length: 22 }, (_, i) => ({ f: 20 + i * 20, ...SAMPLE[i % SAMPLE.length] }));

export const ENTRIES: Entry[] = [
  /* ───────── the design system itself ───────── */
  {
    id: "design-system",
    group: "shared",
    use: "Сводка дизайн-системы: заголовок Inter, абзац Raleway, карточка с числом, плашки, аватар со стойками.",
    source: "kit/design + kit/TatAvatar",
    frames: 450,
    render: (f) => (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 100, right: 100, top: 150, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ ...HEADING, fontSize: 92 }}>
            Привет, это <b>Сара</b>
          </div>
          <Paragraph>
            Абзацы набираем шрифтом Raleway, а <b>важные слова</b> выделяем жирным.
          </Paragraph>
          <Card style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ ...NUMBER, fontSize: 120 }}>410</div>
            <div style={{ ...PARAGRAPH, fontSize: 34, lineHeight: 1.2 }}>
              центров в <span style={{ ...NUMBER, fontSize: 34 }}>53</span> странах
            </div>
          </Card>
          <div style={{ display: "flex", gap: 24 }}>
            {["Казань", "Берлин", "Нью-Йорк"].map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
        </div>
        <TatAvatar frame={f} keys={AVATAR_KEYS} words={SPOKEN} stances={STANCES} />
      </AbsoluteFill>
    ),
  },
  /* ───────── own: text ───────── */
  {
    id: "words",
    group: "own",
    use: "Фраза по словам: каждое слово поднимается с блюром; *слово* = жирное ключевое.",
    source: "kit/reel → catalog/own/text",
    render: (f) => (
      <Mid>
        <div style={{ ...HEADING, fontSize: 96, textAlign: "center" }}>
          <Words text="Найди *своих* по всему миру" frame={f} at={10} stagger={8} />
        </div>
      </Mid>
    ),
  },
  {
    id: "said",
    group: "own",
    use: "Слова появляются ровно в момент, когда их произносят (тайминги из words.ts), hi-слова акцентом.",
    source: "v18 → catalog/own/text",
    render: (f) => (
      <Mid>
        <div style={{ ...HEADING, fontSize: 84, textAlign: "center" }}>
          <Said
            frame={f}
            words={[
              { w: "Это", at: 4 },
              { w: "изменит", at: 19 },
              { w: "то,", at: 54 },
              { w: "как", at: 74 },
              { w: "ты", at: 83 },
              { w: "ищешь", at: 96 },
              { w: "своих", at: 111, hi: true },
            ]}
          />
        </div>
      </Mid>
    ),
  },
  {
    id: "headline",
    group: "own",
    use: "Сменяющийся заголовок сверху, он же субтитры без звука.",
    source: "kit/reel → catalog/own/text",
    render: (f) => (
      <Headline
        frame={f}
        items={[
          { from: 0, text: "Первый *тезис* ролика" },
          { from: 100, text: "Второй тезис" },
          { from: 200, text: "И *финал*" },
        ]}
      />
    ),
  },
  {
    id: "strike",
    group: "own",
    use: "«Не то»: вокруг слова рамка выделения с уголками, потом все краснеет (рамка, слово, заливка).",
    source: "v13–v15 → catalog/own/text",
    render: (f) => (
      <Mid>
        <div style={{ ...HEADING, fontSize: 96 }}>
          <Strike frame={f} at={30}>
            исчезаем
          </Strike>
        </div>
      </Mid>
    ),
  },
  {
    id: "big",
    group: "own",
    use: "Огромная центральная фраза-панчлайн.",
    source: "v16 → catalog/own/text",
    render: () => (
      <Mid>
        <Big>
          Один <b>человек.</b>
        </Big>
      </Mid>
    ),
  },
  {
    id: "header",
    group: "own",
    use: "Заголовок сцены сверху поверх полноэкранного компонента.",
    source: "v17 → catalog/own/text",
    render: (f) => <Header frame={f} at={10}>Стек <b>вайб-проекта</b></Header>,
  },

  /* ───────── own: surfaces ───────── */
  {
    id: "card",
    group: "own",
    use: "Базовая карточка дизайн-системы (белая, радиус 24, наша тень, отступ 40).",
    source: "kit/reel → catalog/own/surfaces",
    render: () => (
      <Mid>
        <Card style={{ width: 880, fontSize: 40 }}>Карточка с контентом: Raleway, а <b>важное</b> — жирным.</Card>
      </Mid>
    ),
  },
  {
    id: "pill",
    group: "own",
    use: "Маленький тег / подпись: текст 500, иконка по смыслу.",
    source: "kit/reel → catalog/own/surfaces",
    render: () => (
      <Mid>
        <div style={{ display: "flex", gap: 16 }}>
          <Pill icon={MessageCircle}>прямо</Pill>
          <Pill icon={Laugh} accent={ACCENT} glass>в шутку</Pill>
        </div>
      </Mid>
    ),
  },
  {
    id: "chip",
    group: "own",
    use: "Чипы-фильтры с иконкой по смыслу: выскакивают по очереди, один выбирается (заливка акцентом).",
    source: "v19 → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
          {([["Центры", Building2], ["Автономии", Landmark], ["Общества", Users], ["Союзы", Handshake], ["Онлайн", Globe]] as const).map(([c, icon], i) => (
            <Chip key={c} frame={f} at={10 + i * 6} on={i === 2 ? 90 : undefined} accent={ACCENT} icon={icon}>
              {c}
            </Chip>
          ))}
        </div>
      </Mid>
    ),
  },
  {
    id: "bubble",
    group: "own",
    use: "Реплики/комментарии людей слева и справа с тегом.",
    source: "v13 → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <div style={{ width: 880, display: "flex", flexDirection: "column", gap: 36 }}>
          <Bubble frame={f} at={10} side="l" tag="прямо">
            зачем вам свой язык?
          </Bubble>
          <Bubble frame={f} at={50} side="r" tag="в шутку 😅" accent={ACCENT}>
            ну стань уже как все
          </Bubble>
        </div>
      </Mid>
    ),
  },
  {
    id: "ai-bubble",
    group: "own",
    use: "Реплика ИИ-ассистента внизу кадра, слова печатаются.",
    source: "v17 → catalog/own/surfaces",
    render: (f) => <AiBubble frame={f} at={10} until={280} text="Готово! Это шедевр!" y={1100} accent={ACCENT} />,
  },
  {
    id: "sticker",
    group: "own",
    use: "Наклонная плашка-стикер цвета акцента для панчлайна.",
    source: "v17 Badge → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <Sticker frame={f} at={15} accent={ACCENT}>
          Мировой рекорд!
        </Sticker>
      </Mid>
    ),
  },
  {
    id: "stamp",
    group: "own",
    use: "Штамп, который «впечатывается»: вердикт, отказ, «одобрено».",
    source: "v11, v15 → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <Stamp frame={f} at={20}>
          ОТКАЗАНО
        </Stamp>
      </Mid>
    ),
  },
  {
    id: "stat-tile",
    group: "own",
    use: "Плитка метрики: подпись + большое число.",
    source: "v3 → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <div style={{ display: "flex", gap: 24 }}>
          <StatTile label="Выручка">${count(f, 10, 70, 0, 4200)}</StatTile>
          <StatTile label="Расходы" tone={K.red}>
            −$900
          </StatTile>
        </div>
      </Mid>
    ),
  },
  {
    id: "meter",
    group: "own",
    use: "Горизонтальная шкала с процентом, краснеет ниже порога.",
    source: "v13 → catalog/own/surfaces",
    render: (f) => (
      <Mid>
        <Meter accent={ACCENT} label="живой язык" value={0.85 - 0.6 * ease.inOut(progress(f, 40, 160))} />
      </Mid>
    ),
  },
  {
    id: "browser",
    group: "own",
    use: "Окно браузера с адресной строкой — показать сайт/страницу.",
    source: "v11 → catalog/own/surfaces",
    render: () => (
      <Mid>
        <Browser url="tatarverse.cc">
          <div style={{ ...HEADING, fontSize: 52 }}>Каталог <b>центров</b></div>
          <div style={{ fontSize: 30, marginTop: 16 }}>410 центров в <span style={{ ...NUMBER, fontSize: 30 }}>53</span> странах</div>
        </Browser>
      </Mid>
    ),
  },
  {
    id: "terminal",
    group: "own",
    use: "Окно терминала (светлое) для команд и логов.",
    source: "v9 → catalog/own/surfaces",
    render: () => (
      <Mid>
        <Terminal>
          <span style={{ color: K.green }}>$</span> npm run build
          <br />
          <span style={{ opacity: 0.5 }}>✓ done in 1.2s</span>
        </Terminal>
      </Mid>
    ),
  },

  /* ───────── own: icons ───────── */
  {
    id: "check-circle",
    group: "own",
    use: "Круглая галочка, которая прорисовывается (чек-листы).",
    source: "v5 → catalog/own/icons",
    render: (f) => (
      <Mid>
        <div style={{ display: "flex", gap: 30 }}>
          {[0, 1, 2].map((i) => (
            <CheckCircle key={i} size={96} t={springAt(f, 20 + i * 20, SPRING.smooth)} />
          ))}
        </div>
      </Mid>
    ),
  },
  {
    id: "verdict",
    group: "own",
    use: "Статус да/нет: зеленая ✓ или красный ✕.",
    source: "v11 → catalog/own/icons",
    render: () => (
      <Mid>
        <div style={{ display: "flex", gap: 30 }}>
          <Verdict ok size={110} />
          <Verdict ok={false} size={110} />
        </div>
      </Mid>
    ),
  },
  {
    id: "db-icon",
    group: "own",
    use: "Иконка базы данных.",
    source: "v11 → catalog/own/icons",
    render: () => (
      <Mid>
        <DbIcon size={220} />
      </Mid>
    ),
  },
  {
    id: "wordmark",
    group: "own",
    use: "Вордмарк сайта «name.tld» с цветной точкой.",
    source: "v18 → catalog/own/icons",
    render: () => (
      <Mid>
        <Wordmark name="tatarlar" tld="kz" size={130} accent={ACCENT} />
      </Mid>
    ),
  },

  /* ───────── own: data & motion ───────── */
  {
    id: "dot-grid",
    group: "own",
    use: "Сетка точек (год = 365 дней), выделенные точки горят: «1 день из 365».",
    source: "v14 Year → catalog/own/fx",
    render: (f) => (
      <Mid>
        <DotGrid frame={f} at={10} lit={(i) => (i === 0 ? 1 : 0)} size={24} on={ACCENT} />
      </Mid>
    ),
  },
  {
    id: "pointer",
    group: "own",
    use: "Курсор мыши: плавно ездит по ключам, клик с рябью.",
    source: "kit/reel → catalog/own/fx",
    render: (f) => (
      <AbsoluteFill>
        <Mid>
          <Card style={{ fontSize: 44, lineHeight: 1 }}>Нажми <b>меня</b></Card>
        </Mid>
        <Pointer
          frame={f}
          keys={[
            { f: 10, x: 820, y: 1400 },
            { f: 80, x: 560, y: 970 },
          ]}
          clicks={[100]}
          show={[8, 280]}
        />
      </AbsoluteFill>
    ),
  },
  {
    id: "punch",
    group: "own",
    use: "Жесткая склейка с коротким наездом камеры (вход в сцену).",
    source: "v17 → catalog/own/fx",
    frames: 60,
    render: () => (
      <Punch>
        <Mid>
          <Big><b>Склейка</b></Big>
        </Mid>
      </Punch>
    ),
  },
  {
    id: "power-off",
    group: "own",
    use: "Выключение телевизора (светлое): картинка схлопывается в линию и точку. Конец ролика/сцены.",
    source: "v17 → catalog/own/fx",
    frames: 120,
    render: () => (
      <PowerOff at={40}>
        <AbsoluteFill>
          <Mid>
            <Big><b>Конец</b></Big>
          </Mid>
        </AbsoluteFill>
      </PowerOff>
    ),
  },
  {
    id: "shake",
    group: "own",
    use: "Тряска от удара (helper shake() из kit/reel) для любого элемента.",
    source: "kit/reel",
    frames: 120,
    render: (f) => (
      <Mid>
        <div style={{ transform: `translateX(${shake(f, 30)}px)` }}>
          <Big><b>Бах!</b></Big>
        </div>
      </Mid>
    ),
  },
  {
    id: "web-scale",
    group: "own",
    use: "Обертка для web-UI (shadcn): верстка в нативном размере и масштаб — текст остается четким. Есть также ScaleFill, FrameBox, Skip.",
    source: "v19 Zoom → catalog/own/fx",
    render: () => (
      <WebScale top={700} w={360} s={2.4}>
        <UiCard style={webSurface(2.4)}>
          <CardHeader>
            <CardTitle style={webHeading}>Карточка <b>shadcn</b></CardTitle>
            <CardDescription>в 2.4 раза крупнее</CardDescription>
          </CardHeader>
        </UiCard>
      </WebScale>
    ),
  },
  {
    id: "scale-fill",
    group: "own",
    use: "Масштабировать полноэкранный 16:9-компонент внутри 9:16.",
    source: "v17 Zoom → catalog/own/fx",
    bg: "white",
    render: () => (
      <ScaleFill k={1.42} y={-60}>
        <ChatGpt textScale={2} greeting="Чем помочь?" placeholder="Спросите что-нибудь" prompt="сделай Uber для котов" accentColor={ACCENT} />
      </ScaleFill>
    ),
  },

  /* ───────── shared (already shared files) ───────── */
  {
    id: "tat-avatar",
    group: "shared",
    use: "Аватар-ведущий @the_tatarverse: эмоции по ключам, стойки вправо/влево/центр, произносимые слова-плашки.",
    source: "kit/TatAvatar",
    frames: 450,
    render: (f) => <TatAvatar frame={f} keys={AVATAR_KEYS} words={SPOKEN} stances={STANCES} />,
  },
  {
    id: "dot-orbit-bg",
    group: "shared",
    use: "Фон по умолчанию (paper.design Dot Orbit), 6 вариантов variant 1-6 — чуть отличаются; меняй от ролика к ролику.",
    source: "kit/DotOrbitBg",
    frames: 360,
    bg: "none",
    render: (f) => {
      const n = (Math.min(5, Math.floor(f / 60)) + 1) as DotOrbitVariant;
      return (
        <AbsoluteFill>
          <DotOrbitBg variant={n} />
          <Mid>
            <Pill>
              variant {n} · {DOT_ORBIT_VARIANTS[n].name}
            </Pill>
          </Mid>
        </AbsoluteFill>
      );
    },
  },
  {
    id: "odometer",
    group: "shared",
    use: "Цифры прокручиваются как на счетчике (старое значение → новое).",
    source: "ui/Odometer",
    render: (f) => (
      <Mid>
        <div style={{ ...NUMBER, fontSize: 200, height: 200, lineHeight: "200px", overflow: "hidden" }}>
          <Odometer from="128" to="410" frame={f} start={30} lineHeight={200} />
        </div>
      </Mid>
    ),
  },
  { id: "outro", group: "shared", use: "Концовка @const_proxima (RU/EN), добавляется withOutro().", source: "outro/Outro", frames: 180, bg: "none", render: () => <Outro lang="ru" /> },
  { id: "outro-tatarverse", group: "shared", use: "Концовка @the_tatarverse, добавляется withOutro(..., 'tatarverse').", source: "outro/TatarverseOutro", frames: 180, bg: "none", render: () => <TatarverseOutro /> },
  { id: "cover", group: "shared", use: "Обложка ролика (Still Cover / CoverWide).", source: "cover/Cover", frames: 1, bg: "none", render: () => <Cover title="Заголовок" description="Короткое описание темы" /> },

  /* ───────── tactile-glass-ui ───────── */
  { id: "tactile-glass-word", group: "tactile", tactile: true, use: "Слово из жидкого стекла — акцент в заголовке. На белом почти не видно — нужен цветной/текстурный фон за ним.", source: "tactile-glass-ui (v1, v3, v5, v7)", render: () => <Mid><div style={{ ...HEADING, fontSize: 196, fontWeight: 700 }}><TactileGlassWord {...GLASS}>5.2</TactileGlassWord></div></Mid> },
  { id: "tactile-prompt-input", group: "tactile", tactile: true, use: "Стеклянное поле ввода промпта (печать текста — через value).", source: "tactile-glass-ui (v1, v3, v5, v19)", render: (f) => <Mid><div style={{ transform: "scale(2.2)" }}><TactilePromptInput {...GLASS} value={"сделай Uber для котов".slice(0, Math.max(0, Math.floor((f - 20) / 3)))} placeholder="Спроси о чем угодно" agentLabel="Fable 5.2" modeLabel="Макс. усилие" /></div></Mid> },
  { id: "tactile-switch", group: "tactile", tactile: true, use: "Стеклянный переключатель.", source: "tactile-glass-ui (v1, v7)", render: (f) => <Mid><div style={{ transform: "scale(3)" }}><TactileSwitch {...GLASS} checked={f >= 60} /></div></Mid> },
  { id: "tactile-tabs", group: "tactile", tactile: true, use: "Стеклянные табы.", source: "tactile-glass-ui (v1)", render: (f) => <Mid><div style={{ transform: "scale(2)" }}><TactileTabs {...GLASS} items={["Код", "Ревью", "Извиниться"]} value={f >= 90 ? "Извиниться" : "Код"} /></div></Mid> },
  { id: "tactile-button", group: "tactile", tactile: true, use: "Стеклянная кнопка (shape='circle' для круглой).", source: "tactile-glass-ui (v1, v19)", render: () => <Mid><div style={{ transform: "scale(2)" }}><TactileButton {...GLASS}>Обновиться</TactileButton></div></Mid> },

  /* ───────── shadcn ───────── */
  { id: "shadcn-card", group: "shadcn", use: "Карточка shadcn (оборачивать в WebScale).", source: "components/ui/card (v19)", render: () => <WebScale top={650} w={360} s={2.4}><UiCard style={webSurface(2.4)}><CardHeader><CardTitle style={webHeading}>Татарский <b>центр</b></CardTitle><CardDescription>Сиэтл, США</CardDescription></CardHeader><CardContent className="flex gap-2"><Badge variant="secondary">Татарский</Badge><Badge variant="secondary">Зарубежный</Badge></CardContent></UiCard></WebScale> },
  { id: "shadcn-button", group: "shadcn", use: "Кнопки shadcn: default / outline / secondary.", source: "components/ui/button (v19)", render: () => <WebScale top={850} w={360} s={2.4}><div className="flex gap-2"><Button style={{ background: ACCENT, fontFamily: PARAGRAPH.fontFamily }}>Написать</Button><Button variant="outline" style={{ ...webSurface(2.4), borderRadius: 10 }}>PDF</Button></div></WebScale> },
  { id: "shadcn-badge", group: "shadcn", use: "Бейджи shadcn.", source: "components/ui/badge (v19)", render: () => <WebScale top={900} w={300} s={3}><div className="flex gap-2"><Badge>Новое</Badge><Badge variant="secondary">Татарский</Badge><Badge variant="outline">Онлайн</Badge></div></WebScale> },

  /* ───────── paper.design ───────── */
  { id: "shader-warp", group: "paper", use: "Анимированный шейдер-градиент на фон.", source: "components/remocn/shader-warp (@paper-design)", bg: "none", render: () => <ShaderWarp /> },
  { id: "shader-warp-cream", group: "paper", use: "Шейдер-градиент в акцентном фиолетовом (фон обложки).", source: "components/remocn/shader-warp-cream (@paper-design)", bg: "none", render: () => <ShaderWarpCream /> },

  /* ───────── remocn ───────── */
  ...(
    [
      ["chat-gpt", "Интерфейс ChatGPT с печатью промпта.", "v17", 300, <ChatGpt textScale={2} greeting="Чем помочь?" placeholder="Спросите что-нибудь" prompt="сделай Uber для котов" accentColor={ACCENT} />],
      ["prompt-to-app", "Промпт → сборка → задеплоенное приложение.", "v17", 600, <PromptToApp theme="light" accent={ACCENT} prompt="сделай Uber, но для котов" projectName="uber-dlya-kotov" deployUrl="uber-koty.vercel.app" siteName="Котоберь" />],
      ["prompt-restyle", "Сайт перекрашивается по промптам «сделай красивее».", "v17", 400, <PromptRestyle theme="light" background="#FFFFFF" accent={ACCENT} headline="Котобер изменит мир" highlight="изменит мир" instructions={["сделай красивее", "еще красивее", "добавь градиент"]} />],
      ["exploded-view", "Стек слоев разлетается с подписями.", "v17", 400, <ExplodedView portrait backgroundColor="#FFFFFF" layers={4} labels={["Градиент", "ChatGPT", "Еще ChatGPT", "Надежда"]} highlight={3} />],
      ["speedrun-timer", "Таймер спидрана со сплитами.", "v17", 400, <SpeedrunTimer theme="light" stage="#FFFFFF" accent={ACCENT} category="Стартап · Any%" banner="Мировой рекорд" splits={[{ name: "Промпт", time: 20, pb: 60 }, { name: "Градиент", time: 90, pb: 120 }, { name: "Деплой", time: 240, pb: 600 }]} />],
      ["long-vowel", "Растянутая гласная: «Оооочень много».", "v17", 240, <LongVowel word="Очень" letter="О" repeat={6} rest="много." theme="light" background="#FFFFFF" accent={ACCENT} />],
      ["compact-stat", "Большое число со счетчиком: 12 млн.", "v17", 300, <CompactStat value={12000000} decimals={0} suffix=" млн" label="вайб-проектов" theme="light" background="#FFFFFF" accent={ACCENT} />],
      ["crash-zoom", "Подводка → резкий зум на ответ.", "v17", 300, <CrashZoom theme="light" accent={ACCENT} tease="Пользователей…" reveal="1." tagline="и это мама." />],
      ["impact-shake", "Слово-удар с тряской.", "v17", 200, <ImpactShake text="ОБЕРТКА" backgroundColor="#FFFFFF" foregroundColor={INK} />],
      ["rank-climb", "Рейтинг: позиция поднимается с 6 на 1.", "v17", 400, <RankClimb portrait theme="light" background="#FFFFFF" accent={ACCENT} brand="Котобер" from={6} to={1} eyebrow="Вайб-проект дня" caption="место в рейтинге" />],
      ["analytics-funnel", "Воронка аналитики.", "v17 Lab", 400, <AnalyticsFunnel theme="light" accent={ACCENT} title="Воронка" />],
      ["shards-to-grid", "Скриншоты осколками собираются в сетку сайта.", "v18", 500, <ShardsToGrid images={["r07", "events", "masters", "wedding", "chats", "culture", "games", "media", "home"].map((n) => staticFile(`v18/img/${n}.jpg`))} title="tatarlar.kz" headline="Все в одном месте" theme="light" accent="#0B5C45" />],
      ["screenshot-tour", "Тур по скриншоту: зум на зоны с подписями.", "v18, v19Wide", 500, <ScreenshotTour src={staticFile("v18/img/events.jpg")} screenshotWidth={1600} screenshotHeight={900} stops={[{ x: 100, y: 100, width: 700, height: 400, label: "Афиша" }, { x: 800, y: 400, width: 700, height: 400, label: "События" }]} framesPerStop={90} pullBack={false} dim={0.5} theme="light" accent="#0B5C45" />],
      ["grid-montage", "Монтаж картинок сеткой в ритм.", "v18", 400, <GridMontage images={["media", "r00", "r02", "r03", "r05", "r06", "r07", "r09", "r12", "r15", "news"].map((n) => staticFile(`v18/img/${n}.jpg`))} beat={14} theme="light" accent="#0B5C45" />],
      ["phone-scroll", "Телефон, в котором скроллится сайт.", "v19, v19Wide", 400, <PhoneScroll src={staticFile("v19/img/home.png")} stops={[620, 1160]} eyebrow="Знакомьтесь" label="tatarverse.cc" labelAccent=".cc" accent={ACCENT} theme="light" />],
      ["number-split", "Итоговое число раскладывается на части.", "v19", 400, <NumberSplit total="410" label="центров" parts={[{ label: "общества", value: 164 }, { label: "автономии", value: 99 }, { label: "центры", value: 95 }, { label: "союзы", value: 37 }, { label: "онлайн", value: 15 }]} accent={ACCENT} ink={INK} theme="light" background="#FFFFFF" />],
      ["crew-of-one", "Один человек — много ролей (роли сменяются).", "v19", 400, <CrewOfOne roles={["По стране", "По городу", "По категории", "Рядом"]} name="ищите" accent={ACCENT} ink={INK} theme="light" background="#FFFFFF" />],
      ["telegram-chat-flow", "Переписка в Telegram: фон-обои, скругленные плашки шапки и ввода.", "v19", 300, <div style={{ width: 1080 / 2.2, height: 1920 / 2.2, transform: "scale(2.2)", transformOrigin: "0 0" }}><TelegramChatFlow contact={{ name: "tatarverse" }} messages={[{ from: "me", text: "instagram.com/tatar_seattle", time: "12:40" }, { from: "them", text: "Спасибо! Обновили карточку", reaction: "🔥", time: "12:41" }]} /></div>],
      ["confetti", "Конфетти: успех, праздник.", "v19, v19Wide", 200, <Confetti colors={[ACCENT, "#9D68F3", "#FF6A13"]} originX={0.5} originY={0.3} particleCount={150} power={9} gravity={0.12} lifetime={120} />],
      ["icon-check", "Анимированная галочка.", "v19", 120, <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><CheckIcon size={240} strokeWidth={3} color={ACCENT} /></AbsoluteFill>],
      ["quadtree-mark", "Логотип собирается из квадродерева + имя.", "v19, v19Wide", 400, <QuadtreeMark logo="M0 0 H84 V18 H51.5 V100 H32.5 V18 H0 Z" name="atarverse" capHeight={0.72} accent={ACCENT} theme="light" background="#FFFFFF" />],
      ["flash-sweep", "Вспышка-шторка: переход между сценами.", "v19", 60, <FlashSweep from={<AbsoluteFill style={{ background: "#fff" }} />} to={<AbsoluteFill style={{ background: ACCENT }} />} />],
      ["parallax-depth", "Параллакс холмов с глубиной.", "v19Wide", 300, <ParallaxDepth />],
      ["search-reveal", "Поисковая строка: печать запроса и раскрытие.", "v19Wide", 300, <SearchReveal text="татарский центр рядом" fontSize={54} color={INK} panelColor={ACCENT} backgroundColor="#FFFFFF" />],
      ["dot-map", "Карта мира из точек с городами и счетчиком.", "v19Wide", 400, <DotMap count={410} label="центров" accent={ACCENT} theme="light" />],
      ["fraction-split", "Дробь из фразы: 3/8 выделяется.", "v19Wide", 300, <FractionSplit line="3/8 карточек ждут помощи" highlight="3/8" keep={3} accentPiece={0} accent={ACCENT} theme="light" />],
      ["tile-wave", "Волна плиток меняет одну фразу на другую.", "v19Wide", 200, <TileWave from="Новый город" to="tatarverse.cc" theme="light" accent={ACCENT} rows={8} delay={14} />],
      ["halftone-cut", "Растровый (halftone) переход между фразами.", "v19Wide", 200, <HalftoneCut from="410 центров" to="Как искать" theme="light" accent={ACCENT} />],
      ["unit-grid", "Цифры и статистика: сетка из N единиц, часть загорается («33 из 100»).", "новый", 360, <UnitGrid total={100} highlighted={33} caption="онлайн" accent={ACCENT} theme="light" />],
      ["contribution-heatmap", "Поддержка во времени: сетка-календарь заполняется — «благодаря вам», вклад сообщества.", "новый", 360, <ScaleFill k={1.12}><ContributionHeatmap value={1240} label="благодаря вам" accent={ACCENT} theme="light" /></ScaleFill>],
      ["achievement-pop", "Достижения: что добавлено / сделано, всплывающие карточки с очками.", "новый", 360, <AchievementPop theme="light" accent={ACCENT} achievements={[{ label: "Добавлено", title: "410 центров", points: 410, icon: "trophy" }, { label: "Сделано", title: "Поиск по карте", points: 120, icon: "bolt" }, { label: "Новое", title: "Английская версия", points: 80, icon: "star" }]} totalLabel="Итого" unit="" logo={false} />],
      ["testimonial-stack", "Комментарии и отзывы: карточки цитат складываются в стопку.", "новый", 480, <TestimonialStack theme="light" accent={ACCENT} title="Что говорят" quotes={[{ text: "Нашла татарский центр в Берлине за минуту", highlight: "за минуту", name: "Алсу", role: "Берлин", stars: 5 }, { text: "Наконец все общины в одном месте", highlight: "в одном месте", name: "Рустем", role: "Сиэтл", stars: 5 }, { text: "Добавили наш клуб на следующий день", highlight: "на следующий день", name: "Ильдар", role: "Казань", stars: 5 }]} />],
      ["github-sponsors", "Подписчики/поддержка: красное сердце, аватарки, «Спасибо за подписку и поддержку проекта».", "новый", 360, <ScaleFill k={1.22}><GitHubSponsors theme="light" accentColor="#FF3040" thanks="Спасибо вам" caption="за подписку и поддержку проекта" cta="Подписаться" link="instagram.com/the_tatarverse" sponsors={["alsu", "rustem", "ildar", "gulnara", "timur", "dinara", "aidar", "leysan", "kamil", "regina", "marat", "elvira", "azat", "nailya", "ruslan", "liliya", "bulat", "alina"].map((login) => ({ login, avatarUrl: "" }))} /></ScaleFill>],
      ["caret", "Мигающая каретка ввода.", "не использовался в роликах", 120, <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><Caret color={INK} /></AbsoluteFill>],
      ["font-cycle", "Слово перебирает шрифты.", "не использовался", 240, <FontCycle theme="light" accent={ACCENT} background="#FFFFFF" />],
      ["tv-power-off", "Выключение ТВ (canvas): в рендере падает, вместо него power-off.", "не использовался", 120, <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100, fontSize: 44, textAlign: "center" }}>tv-power-off не рендерится (нет canvas capture API) — используй power-off</AbsoluteFill>],
    ] as const
  ).map(([id, use, from, frames, el]): Entry => ({ id, group: "remocn", use, source: `components/remocn/${id} (${from})`, frames, bg: "none", render: () => <Gsh><InterScope>{el}</InterScope></Gsh> })),
];

export const IDS = ENTRIES.map((e) => e.id) as [string, ...string[]];
export const entryById = (id: string) => ENTRIES.find((e) => e.id === id) ?? ENTRIES[0];
