import React from "react";
import { Img, staticFile } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, Vo, count, pop } from "../kit/reel";
import { F as F11, VO as VO11 } from "./timeline";

// "AlmatyDa booking" (serious tone): shared by Video11 (RU) and Video12 (EN)
type T = typeof F11;

const IMG = {
  almatyda: staticFile("v11/img/almatyda-logo.svg"),
  apartx: staticFile("v11/img/apartx-logo.png"),
  plexy: staticFile("v11/img/plexy-logo.svg"),
  plexyMark: staticFile("v11/img/plexy-mark.svg"),
};
// Blue accent for this pair (instead of the kit orange)
const A = "#1E6FE8";

export const RU = {
  booking: "Студия B2 · 3 ночи",
  confirmed: "Подтверждено",
  database: "база данных",
  dates: "12 → 15 ноября · 2 гостя",
  free: "свободно",
  taken: "занято",
  apiData: ["номера", "даты", "цены"],
  ddpNote: "календарь и тарифы",
  restNote: "создание брони",
  server: "Сервер",
  ratePlan: "тариф «Сайт almatyda.kz»",
  nights: "3 ночи × 15 000 ₸",
  total: "45 000 ₸",
  request: "Запрос из браузера",
  ignored: "цену из браузера сервер не принимает",
  card: "Оплата брони",
  linkLives: "ссылка на оплату живет",
  min: "мин",
  authorized: "авторизовано, не списано",
  dateCheck: "даты еще свободны?",
  okTitle: "Свободно",
  okNote: "бронь в ApartX и списание",
  noTitle: "Заняли",
  noNote: "авторизация отменяется",
  holds: [
    { img: "apartx", note: "брони и календарь" },
    { img: "plexy", note: "платежи" },
  ],
  zero: "баз данных",
  tests: "теста",
  headlines: (F: T) => [
    { from: -40, text: "Никто не говорит: онлайн-бронь без базы данных" },
    { from: F.siteIn + 6, text: "Бронирование для AlmatyDa" },
    { from: F.ddpIn + 6, text: "ApartX API: DDP и REST v3" },
    { from: F.priceIn + 6, text: "Цену считает только сервер" },
    { from: F.payIn + 6, text: "Plexy API: сначала авторизация" },
    { from: F.hookIn + 6, text: "Вебхук: проверка и списание" },
    { from: F.endIn + 6, text: "Где хранится состояние" },
  ],
};

export type Strings = typeof RU;

const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: K.mono, ...style }}>{children}</span>
);

const typed = (s: string, frame: number, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((frame - at) * cps)));

// Browser window with an address bar
const Browser: React.FC<{ url: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ url, style, children }) => (
  <Card style={{ width: 920, padding: 0, overflow: "hidden", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 30px", borderBottom: `1px solid ${K.border}` }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
      ))}
      <span style={{ marginLeft: 18, flex: 1, padding: "8px 22px", borderRadius: 999, background: K.elevated, fontSize: 26, color: K.muted }}>{url}</span>
    </div>
    <div style={{ padding: "34px 40px 40px" }}>{children}</div>
  </Card>
);

// Red stamp that slams in at `at`
const Stamp: React.FC<{ frame: number; at: number; color?: string; rot?: number; size?: number; children: React.ReactNode }> = ({ frame, at, color = K.red, rot = -10, size = 64, children }) => {
  const t = springAt(frame, at, SPRING.snappy);
  if (t <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(2.2, 1, Math.min(1, t))})`,
        opacity: Math.min(1, t * 2),
        border: `8px solid ${color}`,
        color,
        borderRadius: 22,
        padding: "6px 30px",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        background: "rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </div>
  );
};

const DbIcon: React.FC<{ size: number; color?: string }> = ({ size, color = "#1F2937" }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115">
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M8 ${22 + i * 32} v26 c0 10 19 16 42 16 s42 -6 42 -16 v-26`} fill="none" stroke={color} strokeWidth={7} />
    ))}
    <ellipse cx={50} cy={20} rx={42} ry={14} fill="none" stroke={color} strokeWidth={7} />
  </svg>
);

const Check: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 64 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flex: "none", display: "grid", placeItems: "center", fontSize: size * 0.55, fontWeight: 800, color: "#fff", background: ok ? K.green : K.red }}>
    {ok ? "✓" : "✕"}
  </div>
);

/* ───────── Scenes ───────── */

// 1. Hook: a confirmed booking; the database it supposedly needs is crossed out and fades
const Hook = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, -30, SPRING.smooth);
  const ok = pop(frame, 40, SPRING.bouncy);
  const db = pop(frame, F.hookBook, SPRING.smooth);
  const dim = progress(frame, F.noDb + 20, F.noDb + 40);
  return (
    <>
      <Center y={430}>
        <Card style={{ ...card.style, width: 880, padding: "40px 46px", display: "flex", alignItems: "center", gap: 34 }}>
          <Img src={IMG.almatyda} style={{ width: 230 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 38, fontWeight: 600 }}>{S.booking}</div>
            <div style={{ ...ok.style, display: "inline-flex", alignItems: "center", gap: 12, marginTop: 14, padding: "8px 20px 8px 10px", borderRadius: 999, background: "rgba(31,168,85,0.12)", color: K.green, fontSize: 30, fontWeight: 600 }}>
              <Check ok size={40} /> {S.confirmed}
            </div>
          </div>
        </Card>
      </Center>
      {db.t > 0 && (
        <Center y={780}>
          <div style={{ ...db.style, opacity: Math.min(1, db.t * 1.6) * (1 - dim * 0.6), position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <DbIcon size={240} />
            <Pill style={{ fontSize: 36 }}>{S.database}</Pill>
            <Stamp frame={frame} at={F.noDb} size={150} rot={0}>
              ✕
            </Stamp>
          </div>
        </Center>
      )}
    </>
  );
};

// 2. The site: rooms, dates and prices come from the ApartX API
const ROOMS = ["B1", "B2", "B3", "B4", "K1"];
const Site = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const win = pop(frame, F.siteIn + 4, SPRING.smooth);
  const ax = pop(frame, F.apartx - 4, SPRING.smooth);
  const wire = ease.out(progress(frame, F.apartx, F.apartx + 30));
  return (
    <>
      <Center y={360}>
        <Browser url="almatyda.kz" style={win.style}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Img src={IMG.almatyda} style={{ width: 250 }} />
            <Pill style={{ fontSize: 28, color: K.text }}>{S.dates}</Pill>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 34 }}>
            {ROOMS.map((r, i) => {
              const t = springAt(frame, F.rooms + i * 7, SPRING.smooth);
              const busy = i === 2;
              const on = t > 0;
              return (
                <div key={r} style={{ height: 190, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: !on ? K.elevated : busy ? "rgba(0,0,0,0.06)" : "rgba(31,168,85,0.12)" }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: on && !busy ? K.green : K.muted }}>{r}</span>
                  <span style={{ fontSize: 22, fontWeight: 600, color: busy ? K.muted : K.green, opacity: Math.min(1, t) }}>{busy ? S.taken : S.free}</span>
                </div>
              );
            })}
          </div>
        </Browser>
      </Center>
      <svg width={1080} height={300} style={{ position: "absolute", left: 0, top: 830, opacity: wire }}>
        <path d="M540 0 V 220" stroke={A} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={frame * 1.5} fill="none" />
      </svg>
      <Center y={950}>
        <div style={{ ...ax.style, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Card style={{ padding: "34px 50px", display: "flex", alignItems: "center", gap: 30 }}>
            <Img src={IMG.apartx} style={{ width: 400 }} />
            <Mono style={{ fontSize: 40, fontWeight: 700, color: A }}>API</Mono>
          </Card>
          <div style={{ display: "flex", gap: 14 }}>
            {S.apiData.map((d, i) => (
              <Pill key={d} style={{ fontSize: 30, color: K.text, opacity: progress(frame, F.apartx + 10 + i * 8, F.apartx + 20 + i * 8) }}>{d}</Pill>
            ))}
          </div>
        </div>
      </Center>
    </>
  );
};

// 3. ApartX API: calendar and rates over DDP (WebSocket), bookings via REST v3
const DDP_LINES = ["Property.RatePlan.find", "Landlord.Property.pullAvailability", "Landlord.Property.pullRestrictions"];
const Api = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const logo = pop(frame, F.ddpIn + 4, SPRING.smooth);
  const ws = pop(frame, F.ws - 6, SPRING.smooth);
  const rest = pop(frame, F.rest - 6, SPRING.smooth);
  const lane = (title: string, note: string, body: React.ReactNode, style: React.CSSProperties) => (
    <Card style={{ ...style, width: 920, padding: "32px 40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <Mono style={{ fontSize: 36, fontWeight: 700, color: A }}>{title}</Mono>
        <span style={{ fontSize: 30, color: K.muted }}>{note}</span>
      </div>
      {body}
    </Card>
  );
  return (
    <>
      <Center y={330}>
        <Img src={IMG.apartx} style={{ ...logo.style, width: 420 }} />
      </Center>
      {ws.t > 0 && (
        <Center y={480}>
          {lane(
            "DDP · WebSocket",
            S.ddpNote,
            DDP_LINES.map((l, i) => (
              <Mono key={l} style={{ display: "block", fontSize: 28, lineHeight: "46px", color: K.text }}>
                {frame >= F.ws + 10 + i * 16 ? <span style={{ color: A }}>→ </span> : null}
                {typed(l, frame, F.ws + 10 + i * 16, 1.8)}
              </Mono>
            )),
            ws.style,
          )}
        </Center>
      )}
      {rest.t > 0 && (
        <Center y={820}>
          {lane(
            "REST API v3",
            S.restNote,
            <Mono style={{ display: "block", fontSize: 30, color: K.text }}>
              <span style={{ color: K.green, fontWeight: 700 }}>POST </span>
              {typed("/v3/Landlord/Booking/create", frame, F.rest + 6, 1.4)}
            </Mono>,
            rest.style,
          )}
        </Center>
      )}
    </>
  );
};

// 4. The server prices the stay from the site's rate plan; the browser only sends dates and guests
const Price = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const srv = pop(frame, Math.min(F.server - 4, F.priceIn + 10), SPRING.smooth);
  const br = pop(frame, F.browser - 6, SPRING.smooth);
  const strike = ease.out(progress(frame, F.browser + 20, F.browser + 36));
  return (
    <>
      <Center y={360}>
        <Card style={{ ...srv.style, width: 920, padding: "36px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 38, fontWeight: 700 }}>{S.server}</span>
            <Pill style={{ fontSize: 26 }}>{S.ratePlan}</Pill>
          </div>
          <Mono style={{ display: "block", fontSize: 34, color: K.muted, marginTop: 22 }}>{S.nights}</Mono>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14 }}>
            <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.04em" }}>{S.total}</span>
            {frame >= F.server + 20 && <Check ok size={56} />}
          </div>
        </Card>
      </Center>
      {br.t > 0 && (
        <Center y={760}>
          <Card style={{ ...br.style, width: 920, background: "#111216", color: "#fff", border: "none", padding: "30px 40px 36px" }}>
            <div style={{ fontSize: 28, color: "#8B8D98", marginBottom: 18 }}>{S.request}</div>
            <Mono style={{ display: "block", fontSize: 32, lineHeight: "50px" }}>
              <span style={{ color: K.green }}>POST</span> /api/booking/create
              <br />
              {"{ room, checkIn, checkOut, guests, "}
              <span style={{ color: "#8B8D98", backgroundImage: `linear-gradient(${K.red}, ${K.red})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 55%", backgroundSize: `${strike * 100}% 4px` }}>price</span>
              {" }"}
            </Mono>
          </Card>
        </Center>
      )}
      <Center y={1060}>
        <Pill style={{ fontSize: 32, color: K.text, opacity: progress(frame, F.browser + 36, F.browser + 48) }}>{S.ignored}</Pill>
      </Center>
    </>
  );
};

// 5. Plexy payment link: lives 30 minutes, money is only authorized (autoClearing: false)
const Pay = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const logo = pop(frame, Math.min(F.plexy - 6, F.payIn + 10), SPRING.smooth);
  const card = pop(frame, Math.min(F.plexy + 10, F.payIn + 26), SPRING.smooth);
  const link = pop(frame, F.link - 4, SPRING.smooth);
  const auth = ease.out(progress(frame, F.auth, F.auth + 20));
  return (
    <>
      <Center y={330}>
        <div style={{ ...logo.style, display: "flex", alignItems: "center", gap: 26 }}>
          <Img src={IMG.plexy} style={{ width: 340 }} />
          <Mono style={{ fontSize: 40, fontWeight: 700, color: A }}>API</Mono>
        </div>
      </Center>
      <Center y={530}>
        <Card style={{ ...card.style, width: 900, padding: "36px 44px", border: `3px solid ${auth > 0 ? `rgba(30,111,232,${0.15 + auth * 0.45})` : K.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 32, color: K.muted }}>{S.card}</span>
            <Mono style={{ fontSize: 26, color: K.muted }}>POST /v1/payment-links</Mono>
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 6 }}>{S.total}</div>
          <Mono style={{ display: "block", fontSize: 30, color: auth > 0.5 ? A : K.muted, marginTop: 4 }}>autoClearing: false</Mono>
        </Card>
      </Center>
      {link.t > 0 && (
        <Center y={900}>
          <div style={{ ...link.style, display: "flex", alignItems: "center", gap: 34 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 30, color: K.muted }}>{S.linkLives}</span>
              <span style={{ fontSize: 140, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}>
                30 <span style={{ fontSize: 60, letterSpacing: "0", color: K.muted }}>{S.min}</span>
              </span>
            </div>
          </div>
        </Center>
      )}
      <Center y={1130}>
        <Pill style={{ fontSize: 36, padding: "16px 34px", color: A, background: "rgba(30,111,232,0.1)", opacity: auth, transform: `scale(${0.9 + 0.1 * auth})` }}>🔒 {S.authorized}</Pill>
      </Center>
    </>
  );
};

// 6. Webhook: Plexy -> site -> ApartX date check, two outcomes (capture or cancel)
const Webhook = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const row = pop(frame, F.hookIn + 4, SPRING.smooth);
  const packet = ease.inOut(progress(frame, F.webhook - 10, F.webhook + 30));
  const packet2 = ease.inOut(progress(frame, F.check - 20, F.check + 10));
  const q = pop(frame, F.check, SPRING.smooth);
  const ok = pop(frame, F.free - 4, SPRING.smooth);
  const no = pop(frame, F.taken - 4, SPRING.smooth);
  const node = (children: React.ReactNode, w: number) => (
    <Card style={{ width: w, height: 170, display: "grid", placeItems: "center", padding: 20 }}>{children}</Card>
  );
  const dot = (t: number, x0: number, x1: number) =>
    t > 0 && t < 1 ? <div style={{ position: "absolute", top: 75, left: lerp(x0, x1, t) - 10, width: 20, height: 20, borderRadius: 10, background: A, boxShadow: `0 0 20px ${A}` }} /> : null;
  const outcome = (good: boolean, title: string, note: string, code: string, style: React.CSSProperties) => (
    <Card style={{ ...style, width: 900, padding: "34px 40px", display: "flex", alignItems: "center", gap: 30, border: `3px solid ${good ? "rgba(31,168,85,0.4)" : "rgba(255,59,48,0.35)"}` }}>
      <Check ok={good} size={80} />
      <div>
        <div style={{ fontSize: 48, fontWeight: 700, color: good ? K.green : K.red }}>{title}</div>
        <div style={{ fontSize: 32, color: K.muted, marginTop: 6 }}>{note}</div>
      </div>
      <Mono style={{ marginLeft: "auto", fontSize: 30, fontWeight: 600, color: K.muted }}>{code}</Mono>
    </Card>
  );
  return (
    <>
      <Center y={340}>
        <div style={{ ...row.style, position: "relative", display: "flex", alignItems: "center", gap: 40 }}>
          {node(<Img src={IMG.plexyMark} style={{ height: 96 }} />, 220)}
          {node(<Img src={IMG.almatyda} style={{ width: 210 }} />, 280)}
          <div style={{ position: "relative" }}>
            {node(<Img src={IMG.apartx} style={{ width: 230 }} />, 280)}
            {q.t > 0 && (
              <div style={{ ...q.style, position: "absolute", top: 186, left: "50%", marginLeft: -170, width: 340, textAlign: "center" }}>
                <Pill style={{ fontSize: 26, color: K.text, background: "#fff", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}>{S.dateCheck}</Pill>
              </div>
            )}
          </div>
          {dot(packet, 220, 260)}
          {dot(packet2, 540, 580)}
        </div>
      </Center>
      <Center y={600}>
        <Mono style={{ fontSize: 30, color: K.muted, opacity: progress(frame, F.webhook - 6, F.webhook + 6) }}>POST /api/plexy/webhook</Mono>
      </Center>
      {ok.t > 0 && <Center y={720}>{outcome(true, S.okTitle, S.okNote, "capture", ok.style)}</Center>}
      {no.t > 0 && <Center y={970}>{outcome(false, S.noTitle, S.noNote, "cancel", no.style)}</Center>}
    </>
  );
};

// 7. State lives in ApartX and Plexy; the site has 0 databases and 34 tests
const End = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const zero = pop(frame, F.zero - 4, SPRING.smooth);
  const tests = pop(frame, F.tests - 4, SPRING.smooth);
  const n = count(frame, F.tests, F.tests + 40, 0, 34);
  return (
    <>
      <Center y={330}>
        <div style={{ display: "flex", gap: 30 }}>
          {S.holds.map((h, i) => {
            const p = pop(frame, F.state + 4 + i * 30, SPRING.smooth);
            return (
              <Card key={h.img} style={{ ...p.style, width: 430, height: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
                <Img src={h.img === "apartx" ? IMG.apartx : IMG.plexy} style={{ height: h.img === "apartx" ? 70 : 84 }} />
                <span style={{ fontSize: 32, color: K.muted }}>{h.note}</span>
              </Card>
            );
          })}
        </div>
      </Center>
      {zero.t > 0 && (
        <Center y={660}>
          <div style={{ ...zero.style, display: "flex", alignItems: "center", gap: 34 }}>
            <span style={{ fontSize: 200, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 }}>0</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <DbIcon size={70} color={K.dim} />
              <span style={{ fontSize: 46, fontWeight: 600, color: K.muted }}>{S.zero}</span>
            </div>
          </div>
        </Center>
      )}
      {tests.t > 0 && (
        <Center y={930}>
          <div style={{ ...tests.style, display: "flex", alignItems: "center", gap: 34 }}>
            <span style={{ fontSize: 200, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1, color: A, fontVariantNumeric: "tabular-nums" }}>{n}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <Mono style={{ fontSize: 34, color: K.green }}>bun test ✓</Mono>
              <span style={{ fontSize: 46, fontWeight: 600, color: K.muted }}>{S.tests}</span>
            </div>
          </div>
        </Center>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

export const makeBookingReel = (F: T, VO: Vo[], S: Strings): React.FC => {
  const scenes = [
    { range: [0, F.siteIn] as const, El: Hook(F, S) },
    { range: [F.siteIn, F.ddpIn] as const, El: Site(F, S) },
    { range: [F.ddpIn, F.priceIn] as const, El: Api(F, S) },
    { range: [F.priceIn, F.payIn] as const, El: Price(F, S) },
    { range: [F.payIn, F.hookIn] as const, El: Pay(F, S) },
    { range: [F.hookIn, F.endIn] as const, El: Webhook(F, S) },
    { range: [F.endIn, F.duration + 30] as const, El: End(F, S) },
  ];
  const sfx = [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.25 },
    { src: "sfx2/ding.mp3", from: 42, volume: 0.25 },
    { src: "sfx2/pop.mp3", from: F.hookBook, volume: 0.3 },
    { src: "sfx/03_Basscrack.wav", from: F.noDb, volume: 0.2 },
    ...[F.siteIn, F.ddpIn, F.priceIn, F.payIn, F.hookIn, F.endIn].map((f) => ({ src: "sfx2/whoosh.mp3", from: f - 8, volume: 0.35 })),
    ...ROOMS.map((_, i) => ({ src: "sfx2/click.mp3", from: F.rooms + i * 7, volume: 0.25 })),
    { src: "sfx2/pop.mp3", from: F.apartx - 4, volume: 0.3 },
    { src: "sfx2/pop.mp3", from: F.ws - 6, volume: 0.3 },
    { src: "sfx2/typing.mp3", from: F.ws + 10, volume: 0.3 },
    { src: "sfx2/pop.mp3", from: F.rest - 6, volume: 0.3 },
    { src: "sfx2/pop.mp3", from: F.browser - 6, volume: 0.3 },
    { src: "sfx2/click.mp3", from: F.browser + 20, volume: 0.35 },
    { src: "sfx2/pop.mp3", from: Math.min(F.plexy - 6, F.payIn + 10), volume: 0.3 },
    { src: "sfx2/click.mp3", from: F.link - 4, volume: 0.3 },
    { src: "sfx/04_Cyber_Shift.wav", from: F.auth, volume: 0.18 },
    { src: "sfx/01_Ripple_Textures.wav", from: F.webhook - 10, volume: 0.18 },
    { src: "sfx2/pop.mp3", from: F.check, volume: 0.25 },
    { src: "sfx2/ding.mp3", from: F.free, volume: 0.35 },
    { src: "sfx2/click.mp3", from: F.taken, volume: 0.35 },
    { src: "sfx2/pop.mp3", from: F.state + 4, volume: 0.3 },
    { src: "sfx2/pop.mp3", from: F.state + 34, volume: 0.3 },
    { src: "sfx/03_Basscrack.wav", from: F.zero, volume: 0.2 },
    { src: "sfx2/ding.mp3", from: F.tests + 40, volume: 0.3 },
  ];
  const C: React.FC = () => <ReelShell scenes={scenes} headlines={S.headlines(F)} headlineSize={76} vo={VO} sfx={sfx} duration={F.duration} shift={190} />;
  return C;
};

export const Video11 = makeBookingReel(F11, VO11, RU);
