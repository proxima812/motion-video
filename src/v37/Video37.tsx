import React from "react";
import { AbsoluteFill } from "remotion";
import { Check, Heart, MessageCircle, Repeat } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Mark } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Татарская культура в твоем плейлисте" (@the_tatarverse, RU, host preset 2 Alicja). ~20.6 s.
// No Tatar songs in the playlist -> hundreds of foreign tracks -> when did a Tatar song last hit favorites -> one song = the language every day -> swap tracks in the comments -> I'll add it.
// Own kit only. Palette: magenta (music, joy). Dot Orbit variant 1 (output/bg-variant.txt). Track titles are abstract placeholder bars.
const B = { main: "#8E1D8C", vivid: "#C036BD", glow: "#E9A6E7", pale: "#FBEAFB" };
const GLASS_BG = "linear-gradient(135deg, #D257CF, #7A1778)";
const BG = <DotOrbitBg variant={1} />;
const MUTED = "#8A8792";
const BAR = "#E6E2EA";
const BAR2 = "#F0EEF3";

/* ───────── Shared bits ───────── */

const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** Heading: Inter 400, *key* words 700 in the accent; `at` = one start (stagger) or a start per word */
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 88, top = 170, style }) => (
  <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? B.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Little equalizer: `n` bars; `live` 0..1 = how much they jump */
const Eq: React.FC<{ frame: number; n?: number; h?: number; w?: number; gap?: number; live?: number; color?: string; seed?: number }> = ({ frame, n = 5, h = 50, w = 10, gap = 6, live = 1, color = "#fff", seed = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, height: h }}>
    {Array.from({ length: n }, (_, i) => {
      const k = 0.25 + 0.75 * live * Math.abs(Math.sin(frame / 6 + i * 1.7 + seed) * Math.cos(frame / 11 + i * 0.6));
      return <div key={i} style={{ width: w, height: Math.max(w, h * k), borderRadius: w / 2, background: color }} />;
    })}
  </div>
);

/** One playlist row: square cover + two placeholder bars (title / artist) + a short bar for the length */
const Row: React.FC<{ i: number; hi?: number; style?: React.CSSProperties }> = ({ i, hi = 0, style }) => {
  const thumbs = ["#E9E4EE", "#EDE6F0", "#E4E0EA", "#EFE9F1", "#E6E1EC", "#EAE4EF"];
  const w1 = [300, 240, 330, 270, 210, 290][i % 6];
  const w2 = [170, 200, 140, 180, 160, 130][i % 6];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, height: 100, padding: "0 22px", borderRadius: 20, background: hi > 0.5 ? B.pale : "transparent", ...style }}>
      <div style={{ width: 70, height: 70, borderRadius: 16, background: hi > 0.5 ? `linear-gradient(135deg, ${B.vivid}, ${B.main})` : thumbs[i % 6], display: "grid", placeItems: "center", flex: "none" }}>
        {hi > 0.5 && <div style={{ width: 22, height: 22, borderRadius: 11, background: "#fff" }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ width: w1, height: 18, borderRadius: 9, background: hi > 0.5 ? B.vivid : BAR }} />
        <div style={{ width: w2, height: 14, borderRadius: 7, background: hi > 0.5 ? B.glow : BAR2 }} />
      </div>
      <div style={{ width: 64, height: 14, borderRadius: 7, background: hi > 0.5 ? B.glow : BAR2, flex: "none" }} />
    </div>
  );
};

/** Playlist card: header (cover + bars + "татарские N" filter chip) and track rows */
const Playlist: React.FC<{ frame: number; at: number; rows?: number; dim?: number; chip: React.ReactNode; chipT: number; newRow?: number; top?: number }> = ({ frame, at, rows = 5, dim = 0, chip, chipT, newRow = 0, top = 440 }) => {
  const card = pop(frame, at, SPRING.smooth);
  return (
    <div style={{ position: "absolute", top, left: 100, right: 100, ...card.style }}>
      <div style={{ ...SURFACE, padding: 36, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 18, padding: "0 22px" }}>
          <div style={{ width: 120, height: 120, borderRadius: 22, background: `linear-gradient(135deg, ${B.vivid}, ${B.main})`, display: "grid", placeItems: "center", flex: "none" }}>
            <Eq frame={frame} n={5} h={54} w={10} live={0.9} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            <div style={{ width: 230, height: 24, borderRadius: 12, background: INK, opacity: 0.85 }} />
            <div style={{ width: 150, height: 16, borderRadius: 8, background: BAR }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderRadius: 999, background: B.pale, border: `2px solid ${B.glow}`, opacity: Math.min(1, chipT * 1.5), transform: `scale(${0.7 + 0.3 * Math.min(chipT, 1.1)})` }}>
            <span style={{ ...PARAGRAPH, fontSize: 34, lineHeight: 1, fontWeight: 700, color: B.main }}>татарские</span>
            {chip}
          </div>
        </div>
        <div style={{ height: rows * 100, overflow: "hidden", position: "relative" }}>
          <div style={{ transform: `translateY(${(newRow - 1) * 100}px)` }}>
            <Row i={9} hi={1} style={{ opacity: Math.min(1, newRow * 1.4) }} />
            {Array.from({ length: rows }, (_, i) => {
              const t = springAt(frame, at + 8 + i * 5, SPRING.smooth);
              return <Row key={i} i={i} style={{ opacity: Math.min(1, t * 1.4) * (1 - 0.6 * dim), transform: `translateX(${(1 - t) * 60}px)` }} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────── 1. Hook: the playlist has no Tatar songs ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const chipT = springAt(frame, F.tatar - 6, SPRING.bouncy);
  const zero = springAt(frame, F.none + 22, SPRING.bouncy);
  const dim = ease.inOut(progress(frame, F.none + 18, F.none + 40));
  const s = shake(frame, F.none + 24, 10, 18);
  return (
    <>
      <Title text="большинство даже *не понимает*" frame={frame} at={[-30, -24, F.notGet - 6, F.notGet + 4]} size={92} />
      <div style={{ transform: `translateX(${s}px)` }}>
        <Playlist
          frame={frame}
          at={20}
          dim={dim}
          chipT={chipT}
          chip={<span style={{ ...NUMBER, fontSize: 40, color: B.main, display: "inline-block", minWidth: 28, textAlign: "center", transform: `scale(${0.4 + 0.6 * Math.min(zero, 1.2)})`, opacity: Math.min(1, zero * 2) }}>0</span>}
        />
      </div>
    </>
  );
};

/* ───────── 2. Hundreds of tracks: a donut of languages fills, no Tatar slice ───────── */

const SLICES: { at: number; share: number; color: string; label: string }[] = [
  { at: F.en, share: 0.46, color: B.main, label: "английские" },
  { at: F.ru, share: 0.34, color: B.vivid, label: "русские" },
  { at: F.kr, share: 0.2, color: B.glow, label: "корейские" },
];
const Tracks: React.FC<{ frame: number }> = ({ frame }) => {
  const R = 230;
  const C = 2 * Math.PI * R;
  const ring = pop(frame, F.tracksIn + 4, SPRING.smooth);
  const n = count(frame, F.tracks - 10, F.kr + 30, 0, 347, ease.out);
  let acc = 0;
  return (
    <>
      <Title text="сотни *треков*" frame={frame} at={[F.tracksIn + 2, F.tracks]} size={104} />
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", ...ring.style }}>
        <div style={{ position: "relative", width: 600, height: 600 }}>
          <svg width={600} height={600} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx={300} cy={300} r={R} fill="none" stroke="#EFECF2" strokeWidth={84} />
            {SLICES.map((sl, i) => {
              const grow = ease.out(progress(frame, sl.at - 6, sl.at + 26));
              const len = Math.max(0, C * sl.share * grow - 10);
              const off = -C * acc;
              acc += sl.share;
              return <circle key={i} cx={300} cy={300} r={R} fill="none" stroke={sl.color} strokeWidth={84} strokeDasharray={`${len} ${C}`} strokeDashoffset={off} opacity={grow > 0 ? 1 : 0} />;
            })}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ ...SURFACE, width: 300, height: 300, borderRadius: 150, display: "grid", placeItems: "center" }}>
              <span style={{ ...NUMBER, fontSize: 120, color: INK }}>{n}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1070, left: 100, right: 100, display: "flex", justifyContent: "center", gap: 34 }}>
        {SLICES.map((sl, i) => {
          const p = pop(frame, sl.at - 4, SPRING.bouncy);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, ...p.style }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: sl.color }} />
              <span style={{ ...PARAGRAPH, fontSize: 42, lineHeight: 1 }}>{sl.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 3. Favorites: the list scrolls and scrolls, at the very end an empty slot ───────── */

const FAV_ROWS = 26;
const Favorites: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.favIn + 6, SPRING.smooth);
  const VIEW = 6;
  // scroll fast and long, slow down at the bottom
  const sc = ease.inOut(progress(frame, F.fav, F.song - 4));
  const y = -sc * (FAV_ROWS + 1 - VIEW) * 100;
  const slot = springAt(frame, F.song, SPRING.bouncy);
  const pulse = frame > F.song + 10 ? 0.5 + 0.5 * Math.sin((frame - F.song) / 7) : 0;
  const heart = springAt(frame, F.favIn + 14, SPRING.bouncy);
  return (
    <>
      <Title text="когда *последний раз*" frame={frame} at={[F.favIn + 2, F.last - 4, F.last + 6]} size={96} />
      <div style={{ position: "absolute", top: 430, left: 100, right: 100, ...card.style }}>
        <div style={{ ...SURFACE, padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 22px 18px" }}>
            <div style={{ transform: `scale(${heart})` }}>
              <Heart size={58} color={B.vivid} fill={B.vivid} strokeWidth={1.6} />
            </div>
            <span style={{ ...HEADING, fontSize: 56 }}>избранное</span>
          </div>
          <div style={{ height: VIEW * 100, overflow: "hidden", position: "relative", maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)" }}>
            <div style={{ transform: `translateY(${y}px)`, filter: `blur(${Math.min(4, Math.abs(Math.sin(sc * Math.PI)) * 4)}px)` }}>
              {Array.from({ length: FAV_ROWS }, (_, i) => (
                <Row key={i} i={i} />
              ))}
              <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20, border: `4px dashed ${slot > 0 ? B.vivid : BAR}`, boxShadow: `0 0 0 ${10 * pulse}px ${B.pale}`, ...PARAGRAPH, fontSize: 46, fontWeight: 700, color: B.main }}>
                <span style={{ opacity: Math.min(1, slot * 1.5), transform: `scale(${0.7 + 0.3 * Math.min(slot, 1.1)})`, display: "inline-block" }}>татарская песня</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 4. One song: a spinning record, the language is next to you every day ───────── */

const Record: React.FC<{ frame: number }> = ({ frame }) => {
  const disc = pop(frame, F.oneIn + 4, SPRING.bouncy);
  const spin = Math.max(0, frame - F.oneIn) * 2.4;
  const lang = pop(frame, F.lang - 6, SPRING.smooth);
  const plate = pop(frame, F.day - 10, SPRING.bouncy);
  const waves = progress(frame, F.lang - 10, F.lang + 10);
  return (
    <>
      <Title text="*одна* песня" frame={frame} at={[F.one, F.one + 18]} size={110} />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", ...disc.style }}>
        <svg width={620} height={600} viewBox="-310 -300 620 600">
          {waves > 0 &&
            [0, 0.33, 0.66].map((k) => {
              const r = ((frame - F.lang) / 70 + k + 1) % 1;
              return <circle key={k} r={250 + r * 50} fill="none" stroke={B.glow} strokeWidth={6} opacity={(1 - r) * waves} />;
            })}
          <g transform={`rotate(${spin})`}>
            <circle r={250} fill={INK} />
            {[220, 195, 170, 145, 122].map((r) => (
              <circle key={r} r={r} fill="none" stroke="#3B3150" strokeWidth={3} />
            ))}
            <path d="M -170 -150 A 230 230 0 0 1 60 -222" fill="none" stroke="#5A4D72" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
            <circle r={92} fill={B.vivid} />
            <circle r={92} fill="none" stroke={B.glow} strokeWidth={6} />
            <rect x={-46} y={-30} width={92} height={14} rx={7} fill="#fff" opacity={0.85} />
            <rect x={-30} y={-6} width={60} height={10} rx={5} fill={B.pale} opacity={0.8} />
            <circle r={12} fill="#fff" />
          </g>
        </svg>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", ...PARAGRAPH, fontSize: 62, lineHeight: 1, ...lang.style }}>
        язык звучит <b style={{ color: B.main }}>рядом</b>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={GLASS_BG}>
              <Repeat size={18} strokeWidth={2.4} /> каждый день
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 5. Swap: your track and mine trade places, then the comment box ───────── */

const TrackCard: React.FC<{ frame: number; label: string; tone: string; seed: number }> = ({ frame, label, tone, seed }) => (
  <div style={{ ...SURFACE, width: 340, padding: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
    <div style={{ width: 272, height: 240, borderRadius: 20, background: tone, display: "grid", placeItems: "center" }}>
      <Eq frame={frame} n={7} h={110} w={16} gap={10} seed={seed} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 200, height: 18, borderRadius: 9, background: BAR }} />
      <div style={{ width: 130, height: 14, borderRadius: 7, background: BAR2 }} />
    </div>
    <span style={{ ...HEADING, fontSize: 56, lineHeight: 1 }}>{label}</span>
  </div>
);

const Swap: React.FC<{ frame: number }> = ({ frame }) => {
  const outA = progress(frame, F.write - 16, F.write - 2);
  const a = pop(frame, F.ctaIn + 4, SPRING.smooth);
  const b = pop(frame, F.ctaIn + 12, SPRING.smooth);
  const sw = ease.inOut(progress(frame, F.swap + 6, F.swap + 40));
  const dx = 400 * sw;
  const lift = Math.sin(sw * Math.PI) * 90;
  // phase B: the comment box
  const box = pop(frame, F.write + 4, SPRING.smooth);
  const typed = ease.out(progress(frame, F.comments + 10, F.track + 20));
  const plate = pop(frame, F.track - 4, SPRING.bouncy);
  const caret = Math.floor(frame / 18) % 2 === 0 ? 1 : 0;
  return (
    <>
      {outA < 1 && (
        <div style={{ opacity: 1 - outA, filter: `blur(${outA * 10}px)` }}>
          <Title text="давай *обменяемся*" frame={frame} at={[F.ctaIn + 2, F.swap]} size={100} />
          <div style={{ position: "absolute", top: 470, left: 140, ...a.style }}>
            <div style={{ transform: `translate(${dx}px, ${-lift}px) rotate(${Math.sin(sw * Math.PI) * 8}deg)` }}>
              <TrackCard frame={frame} label="твой" tone={`linear-gradient(135deg, ${B.vivid}, ${B.main})`} seed={0} />
            </div>
          </div>
          <div style={{ position: "absolute", top: 470, left: 540, ...b.style }}>
            <div style={{ transform: `translate(${-dx}px, ${lift}px) rotate(${-Math.sin(sw * Math.PI) * 8}deg)` }}>
              <TrackCard frame={frame} label="мой" tone={`linear-gradient(135deg, ${B.glow}, ${B.vivid})`} seed={2} />
            </div>
          </div>
        </div>
      )}
      {box.t > 0 && (
        <>
          <Title text="напиши любимый *трек*" frame={frame} at={[F.write, F.write + 8, F.track - 6]} size={96} />
          <div style={{ position: "absolute", top: 520, left: 100, right: 100, ...box.style }}>
            <div style={{ ...SURFACE, padding: 40, display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 96, height: 96, borderRadius: 48, background: `linear-gradient(135deg, ${B.glow}, ${B.vivid})`, flex: "none" }} />
              <div style={{ flex: 1, height: 96, borderRadius: 48, background: B.pale, display: "flex", alignItems: "center", gap: 14, padding: "0 34px" }}>
                <div style={{ width: 320 * typed, height: 20, borderRadius: 10, background: B.vivid }} />
                <div style={{ width: 4, height: 50, borderRadius: 2, background: B.main, opacity: caret }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 30, paddingRight: 20 }}>
              {[0, 1, 2].map((k) => {
                const t = springAt(frame, F.comments + 30 + k * 22, SPRING.bouncy);
                return <div key={k} style={{ ...SURFACE, width: [250, 190, 150][k], height: 70, borderRadius: 35, transform: `scale(${t})`, opacity: Math.min(1, t * 1.5), display: "flex", alignItems: "center", padding: "0 26px" }}><div style={{ width: "100%", height: 14, borderRadius: 7, background: BAR }} /></div>;
              })}
            </div>
          </div>
          {plate.t > 0 && (
            <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
              <div style={{ transform: "scale(2.1)", transformOrigin: "50% 0" }}>
                <GlassPlate bg={GLASS_BG}>
                  <MessageCircle size={18} strokeWidth={2.4} /> в комментарии
                </GlassPlate>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

/* ───────── 6. I'll add it: the playlist from the hook gets its first Tatar track ───────── */

const Add: React.FC<{ frame: number }> = ({ frame }) => {
  const newRow = springAt(frame, F.add + 4, SPRING.smooth);
  const one = springAt(frame, F.add + 18, SPRING.bouncy);
  const plate = pop(frame, F.list - 4, SPRING.bouncy);
  return (
    <>
      <Title text="в мой *плейлист*" frame={frame} at={[F.addIn + 4, F.addIn + 10, F.list - 10]} size={100} />
      <Playlist
        frame={frame}
        at={F.addIn - 2}
        top={400}
        rows={5}
        chipT={1}
        newRow={newRow}
        chip={
          <span style={{ position: "relative", display: "inline-block", width: 28, height: 40 }}>
            <span style={{ ...NUMBER, position: "absolute", inset: 0, fontSize: 40, color: B.main, textAlign: "center", opacity: 1 - Math.min(1, one), transform: `translateY(${-30 * Math.min(one, 1)}px)` }}>0</span>
            <span style={{ ...NUMBER, position: "absolute", inset: 0, fontSize: 40, color: B.main, textAlign: "center", opacity: Math.min(1, one), transform: `translateY(${30 * (1 - Math.min(one, 1))}px)` }}>1</span>
          </span>
        }
      />
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1120, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={GLASS_BG}>
              <Check size={18} strokeWidth={2.6} /> добавлено
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.tracksIn], El: Hook },
  { range: [F.tracksIn, F.favIn], El: Tracks },
  { range: [F.favIn, F.oneIn], El: Favorites },
  { range: [F.oneIn, F.ctaIn], El: Record },
  { range: [F.ctaIn, F.addIn], El: Swap },
  { range: [F.addIn, F.duration + 30], El: Add },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: 20, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.tatar - 6, volume: 0.22 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.none + 22, volume: 0.04 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.tracksIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.favIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.oneIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.addIn - 8, volume: 0.18 },
  // 2. donut slices
  ...SLICES.map((s) => ({ src: "sfx2/pop.mp3", from: s.at - 4, volume: 0.2 })),
  // 3. the empty slot at the end of the list
  { src: "sfx/03_Basscrack.wav", from: F.song, volume: 0.12 },
  // 4. record + plate
  { src: "sfx2/ding.mp3", from: F.day - 8, volume: 0.2 },
  // 5. swap + comment
  { src: "sfx2/click.mp3", from: F.swap + 8, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.track - 4, volume: 0.24 },
  // 6. added
  { src: "sfx2/ding.mp3", from: F.add + 18, volume: 0.22 },
  { src: "sfx/07_CineStrike.wav", from: F.list - 4, volume: 0.1 },
];

// All 30 poses of the Alicja set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "explaining" },
  { at: 40, e: "point-up" },
  { at: 80, e: "thinking" },
  { at: 125, e: "displeased" },
  { at: 165, e: "facepalm" },
  { at: 205, e: "shrug" },
  // 2. hundreds of tracks
  { at: F.tracksIn, e: "listening" },
  { at: 285, e: "point-right" },
  { at: 330, e: "surprised" },
  { at: 375, e: "arms-crossed" },
  { at: 415, e: "skeptical" },
  // 3. favorites
  { at: F.favIn, e: "puzzled" },
  { at: 500, e: "pensive" },
  { at: 545, e: "dreamy" },
  { at: 590, e: "point-down" },
  { at: 630, e: "disappointed" },
  // 4. one song every day
  { at: F.oneIn, e: "soft-smile" },
  { at: 710, e: "hand-on-heart" },
  { at: 755, e: "inspired" },
  { at: 800, e: "smile-up" },
  { at: 835, e: "delighted" },
  // 5. swap in the comments
  { at: F.ctaIn, e: "waving" },
  { at: 905, e: "present-left" },
  { at: 945, e: "stop" },
  { at: 985, e: "shush" },
  { at: 1025, e: "heart-hands" },
  { at: 1055, e: "thumbs-up" },
  // 6. I'll add it
  { at: F.addIn, e: "laughing" },
  { at: 1125, e: "clapping" },
  { at: 1160, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.tracksIn, s: "right" },
  { at: F.favIn, s: "left" },
  { at: F.oneIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.addIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v37/avatar" fit={FIT} />;

export const Video37: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v37/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
