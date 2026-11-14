import React from "react";
import { AbsoluteFill } from "remotion";
import { C, H, W, clamp01, easeIn, easeOut, glow, rng, type Shot } from "./kit";
import { STEP } from "./timeline";

/* 70. White flash on the section downbeat: shock rings burn out into black. */
export const WhiteFlash: Shot = ({ f }) => {
  const white = f < 2 ? 1 : Math.exp(-(f - 2) / 2.2);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={540} cy={960} r={60 + f * (80 + k * 45)} fill="none" stroke={k % 2 ? C.cyan : C.white} strokeWidth={10 - k * 2} strokeOpacity={Math.max(0, 1 - f / 16)} style={{ filter: glow(k % 2 ? C.blue : C.white, 10) }} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
    </AbsoluteFill>
  );
};

/* 71. Black with a single point that breathes on the beats. */
export const Dot: Shot = ({ f }) => {
  const pulse = (at: number) => (f >= at ? Math.exp(-(f - at) / 5) : 0);
  const p = pulse(0) + pulse(Math.round(BEAT_LOCAL));
  const ring = (at: number) => (f >= at ? f - at : -1);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {[0, Math.round(BEAT_LOCAL)].map((at) => {
          const r = ring(at);
          return r >= 0 ? <circle key={at} cx={540} cy={960} r={10 + r * 9} fill="none" stroke={C.blue} strokeOpacity={Math.max(0, 0.5 - r * 0.04)} strokeWidth={2} /> : null;
        })}
        <circle cx={540} cy={960} r={7 * (1 + p * 0.7)} fill="#fff" style={{ filter: glow(C.cyan, 10 + p * 14) }} />
      </svg>
    </AbsoluteFill>
  );
};
const BEAT_LOCAL = STEP * 4; // beat 3, one beat after the snare

/* the network grown from the dot (72) and blown up (73) */
type Node = { x: number; y: number; g: number; parent: number };
const NET: { nodes: Node[]; lat: [number, number][] } = (() => {
  const r = rng(72);
  const radii = [0, 120, 260, 430, 640, 900];
  const nodes: Node[] = [{ x: 0, y: 0, g: 0, parent: -1 }];
  const angle: number[] = [0];
  for (let g = 1; g < radii.length; g++) {
    const prev = nodes.map((n, i) => ({ n, i })).filter((q) => q.n.g === g - 1);
    for (const { i } of prev) {
      const kids = g === 1 ? 7 : 2 + (r() < 0.45 ? 1 : 0);
      for (let k = 0; k < kids; k++) {
        const a = g === 1 ? (k / kids) * Math.PI * 2 + r() * 0.4 : angle[i] + (k - (kids - 1) / 2) * (0.62 / g) + (r() - 0.5) * 0.2;
        const rad = radii[g] * (0.9 + r() * 0.2);
        nodes.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad * 1.15, g, parent: i });
        angle.push(a);
      }
    }
  }
  const lat: [number, number][] = [];
  for (let g = 2; g < radii.length; g++) {
    const ring = nodes.map((n, i) => ({ i, a: Math.atan2(n.y, n.x) })).filter((q) => nodes[q.i].g === g).sort((a, b) => a.a - b.a);
    ring.forEach((q, k) => k % 2 === 0 && lat.push([q.i, ring[(k + 1) % ring.length].i]));
  }
  return { nodes, lat };
})();
const GEN_COLOR = [C.white, C.cyan, C.blue, C.violet, C.blue, C.lilac];

const NetSvg: React.FC<{ grow: number; scale: number; rot: number; op?: number; bright?: number }> = ({ grow, scale, rot, op = 1, bright = 0 }) => {
  const T = (x: number, y: number): [number, number] => {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    return [540 + (x * c - y * s) * scale, 960 + (x * s + y * c) * scale];
  };
  const sw = Math.min(6, 2.2 * Math.sqrt(scale));
  return (
    <g opacity={op}>
      {NET.lat.map(([a, b], i) => {
        const g = NET.nodes[b].g;
        const p = clamp01(grow - g - 0.6);
        if (p <= 0) return null;
        const [x1, y1] = T(NET.nodes[a].x, NET.nodes[a].y);
        const [x2, y2] = T(NET.nodes[b].x, NET.nodes[b].y);
        return <line key={`l${i}`} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={C.violet} strokeOpacity={0.45} strokeWidth={sw * 0.6} />;
      })}
      {NET.nodes.map((n, i) => {
        if (n.parent < 0) return null;
        const p = clamp01(grow - (n.g - 1));
        if (p <= 0) return null;
        const pa = NET.nodes[n.parent];
        const [x1, y1] = T(pa.x, pa.y);
        const [x2, y2] = T(n.x, n.y);
        return <line key={`e${i}`} x1={x1} y1={y1} x2={x1 + (x2 - x1) * easeOut(p)} y2={y1 + (y2 - y1) * easeOut(p)} stroke={bright > 0.5 ? C.white : GEN_COLOR[n.g]} strokeOpacity={0.85} strokeWidth={sw} />;
      })}
      {NET.nodes.map((n, i) => {
        const p = n.g === 0 ? 1 : clamp01(grow - (n.g - 1) - 0.8) * 5;
        if (p <= 0) return null;
        const [x, y] = T(n.x, n.y);
        return <circle key={`n${i}`} cx={x} cy={y} r={(n.g === 0 ? 9 : 5.5) * Math.min(3, Math.sqrt(scale)) * Math.min(1, p)} fill={n.g === 0 || bright > 0.3 ? "#fff" : GEN_COLOR[n.g]} />;
      })}
    </g>
  );
};

/* 72. The point grows into a neural network, one generation per 16th. */
export const DotToNet: Shot = ({ f, d }) => {
  const grow = (f / STEP) * 0.95 + 0.2;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 8) }}>
        <NetSvg grow={grow} scale={0.82 + (f / d) * 0.12} rot={f * 0.004} />
      </svg>
    </AbsoluteFill>
  );
};

/* 73. Instant expansion: the net bursts and the camera dives through endless copies of it. */
export const Expansion: Shot = ({ f, d }) => {
  const t = f / d;
  // burst on the downbeat, then accelerating dive (log-zoom)
  const z = Math.log(0.94) + 1.1 * easeOut(Math.min(1, f / 6)) + 2.6 * easeIn(t);
  const layers = [0, 1, 2, 3, 4];
  const bright = clamp01((t - 0.65) / 0.35);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 8 + bright * 10) }}>
        {Array.from({ length: 70 }, (_, i) => {
          const a = (i / 70) * Math.PI * 2;
          const r0 = 200 + ((i * 97) % 300);
          const len = 100 + 900 * t;
          return <line key={`s${i}`} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + len)} y2={960 + Math.sin(a) * (r0 + len)} stroke={i % 3 ? C.blue : C.white} strokeOpacity={0.12 + 0.3 * t} strokeWidth={2} />;
        })}
        {layers.map((k) => {
          const scale = Math.exp(z - k * Math.log(3.2));
          if (scale < 0.04 || scale > 14) return null;
          const op = Math.min(1, scale / 0.15) * Math.min(1, (14 - scale) / 6);
          return <NetSvg key={k} grow={9} scale={scale} rot={k * 0.6 + t * 0.9} op={op} bright={bright} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.9 * bright}) 0%, rgba(106,216,255,${0.4 * bright}) ${10 + 25 * bright}%, transparent ${30 + 40 * bright}%)` }} />
    </AbsoluteFill>
  );
};

/* 74. Blinding flash: white core swallows the frame, anamorphic streak, then pure white. */
export const BlindingFlash: Shot = ({ f }) => {
  const t = easeOut(Math.min(1, f / 11));
  const r = 6 + 120 * t;
  const streak = Math.max(0, 1 - f / 14);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #fff 0%, #fff ${r * 0.55}%, rgba(106,216,255,0.9) ${r * 0.8}%, rgba(163,91,255,0.5) ${r}%, rgba(0,0,0,0) ${r * 1.3}%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: streak }}>
        <div style={{ width: W * 1.4, height: 10 + 30 * t, background: "linear-gradient(90deg, transparent, #9CC8FF 20%, #fff 50%, #9CC8FF 80%, transparent)", boxShadow: "0 0 60px 20px rgba(106,216,255,0.8)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: clamp01((f - 9) / 4) }} />
    </AbsoluteFill>
  );
};

/* 75. Absolute black (and silence: the music stops on this cut). */
export const Black: Shot = () => <AbsoluteFill style={{ background: "#000" }} />;
