import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, Grid, H, Haze, Hud, MONO, W, easeOut, glow, hash, rng, type Shot } from "./kit";

/* 31. GPU streams: HBM stacks pumping data into 144 SMs, activation waves across the die. */
export const GpuStreams: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const x0 = 200;
        const y0 = 330;
        const dw = 680;
        const dh = 1260;
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(x0, y0, dw, dh);
        const cols = 8;
        const rows = 18;
        const sw = dw / cols;
        const sh = dh / rows;
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const wave = Math.sin(r * 0.55 - c * 0.35 - f * 0.75) * 0.5 + 0.5;
            const bx = x0 + c * sw;
            const by = y0 + r * sh;
            ctx.strokeStyle = `rgba(47,140,255,${0.25 + wave * 0.5})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx + 4, by + 4, sw - 8, sh - 8);
            for (let k = 0; k < 16; k++) {
              const on = hash(r * 97 + c * 13 + k + Math.floor(f / 2) * 7) < wave * 0.9;
              ctx.fillStyle = on ? (wave > 0.85 ? "#fff" : wave > 0.5 ? C.cyan : C.blue) : "rgba(233,238,255,0.08)";
              ctx.fillRect(bx + 10 + (k % 8) * ((sw - 20) / 8), by + 12 + Math.floor(k / 8) * ((sh - 24) / 2), (sw - 20) / 8 - 3, (sh - 24) / 2 - 4);
            }
          }
        for (const side of [-1, 1]) {
          for (let s = 0; s < 4; s++) {
            const hx = side < 0 ? 40 : W - 140;
            const hy = y0 + 60 + s * 310;
            ctx.strokeStyle = C.violet;
            ctx.lineWidth = 3;
            ctx.strokeRect(hx, hy, 100, 220);
            for (let l = 0; l < 6; l++) {
              ctx.fillStyle = "rgba(163,91,255,0.35)";
              ctx.fillRect(hx + 10, hy + 12 + l * 34, 80, 22);
            }
            for (let line = 0; line < 9; line++) {
              const y = hy + 20 + line * 22;
              const xa = side < 0 ? hx + 100 : x0 + dw;
              const xb = side < 0 ? x0 : hx;
              ctx.strokeStyle = "rgba(106,216,255,0.25)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(xa, y);
              ctx.lineTo(xb, y);
              ctx.stroke();
              const p = ((f * 0.13 + hash(s * 9 + line)) % 1) * (xb - xa) + xa;
              ctx.fillStyle = "#fff";
              ctx.shadowColor = C.cyan;
              ctx.shadowBlur = 12;
              ctx.fillRect(p - 14, y - 2, 28, 4);
              ctx.shadowBlur = 0;
            }
          }
        }
      }}
    />
    <Hud f={f} tl="144 SM · 18432 cores" tr="HBM3e 8 TB/s" bl="occupancy 98.7%" br="kernel #" />
  </AbsoluteFill>
);

/* 32/67. Processor chip with PCB traces; heat 0..1 turns it white-hot. */
const TRACES = (() => {
  const r = rng(32);
  const out: { pts: [number, number][]; c: string }[] = [];
  const die = { x: 540, y: 960, s: 200 };
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < 12; i++) {
      const u = -die.s + 20 + (i * (2 * die.s - 40)) / 11;
      const dir = [[0, -1], [1, 0], [0, 1], [-1, 0]][side];
      const start: [number, number] = side % 2 === 0 ? [die.x + u, die.y + dir[1] * (die.s + 30)] : [die.x + dir[0] * (die.s + 30), die.y + u];
      const len1 = 60 + r() * 220;
      const p1: [number, number] = [start[0] + dir[0] * len1, start[1] + dir[1] * len1];
      const bend = r() < 0.5 ? -1 : 1;
      const len2 = 80 + r() * 260;
      const p2: [number, number] = side % 2 === 0 ? [p1[0] + bend * len2 * 0.7, p1[1] + dir[1] * len2 * 0.7] : [p1[0] + dir[0] * len2 * 0.7, p1[1] + bend * len2 * 0.7];
      const p3: [number, number] = [p2[0] + dir[0] * 900, p2[1] + dir[1] * 900];
      out.push({ pts: [start, p1, p2, p3], c: r() < 0.6 ? C.blue : r() < 0.7 ? C.violet : C.cyan });
    }
  return out;
})();
const Chip: React.FC<{ f: number; heat: number }> = ({ f, heat }) => {
  const s = 200;
  return (
    <svg width={W} height={H} style={{ position: "absolute", filter: glow(heat > 0.5 ? C.white : C.blue, 6 + heat * 20) }}>
      {TRACES.map((t, i) => {
        const dd = t.pts.map(([x, y], j) => `${j ? "L" : "M"}${x} ${y}`).join(" ");
        return (
          <g key={i}>
            <path d={dd} fill="none" stroke={heat > 0.5 ? C.white : t.c} strokeOpacity={0.5 + heat * 0.5} strokeWidth={3} />
            <path d={dd} fill="none" stroke={C.white} strokeWidth={5} strokeDasharray="30 400" strokeDashoffset={-(f * 34 + i * 47)} />
            <circle cx={t.pts[1][0]} cy={t.pts[1][1]} r={7} fill="none" stroke={t.c} strokeWidth={3} />
          </g>
        );
      })}
      {Array.from({ length: 4 * 24 }, (_, i) => {
        const side = Math.floor(i / 24);
        const u = -s + 8 + ((i % 24) * (2 * s - 16)) / 23;
        const [x1, y1, x2, y2] = side === 0 ? [540 + u, 960 - s, 540 + u, 960 - s - 30] : side === 1 ? [540 + s, 960 + u, 540 + s + 30, 960 + u] : side === 2 ? [540 + u, 960 + s, 540 + u, 960 + s + 30] : [540 - s, 960 + u, 540 - s - 30, 960 + u];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={4} />;
      })}
      <rect x={540 - s} y={960 - s} width={2 * s} height={2 * s} rx={10} fill={heat > 0 ? `rgba(255,255,255,${heat})` : "#05070F"} stroke={C.white} strokeWidth={5} />
      {Array.from({ length: 64 }, (_, i) => {
        const on = hash(i + Math.floor(f / 2) * 11) > 0.55 - heat;
        return <rect key={i} x={540 - s + 24 + (i % 8) * 44} y={960 - s + 24 + Math.floor(i / 8) * 44} width={36} height={36} fill={on ? (heat > 0.3 ? C.white : C.cyan) : "rgba(47,140,255,0.15)"} />;
      })}
    </svg>
  );
};
export const Chip32: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Grid step={40} a={0.07} />
    <AbsoluteFill style={{ transform: `scale(${1.1 - f * 0.008}) rotate(${f * 0.25}deg)` }}>
      <Chip f={f} heat={0} />
    </AbsoluteFill>
  </AbsoluteFill>
);
export const CpuFlash: Shot = ({ f, d }) => {
  const heat = easeOut((f + 2) / d);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${1.25 + f * 0.03})` }}>
        <Chip f={f + 40} heat={heat} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2 + f * 0.02;
          const L = 300 + hash(i) * 900 * heat;
          return <line key={i} x1={540} y1={960} x2={540 + Math.cos(a) * L} y2={960 + Math.sin(a) * L} stroke={C.white} strokeOpacity={0.25 * heat} strokeWidth={2 + hash(i + 3) * 6} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.95 * heat}) 0%, rgba(163,91,255,${0.45 * heat}) 25%, transparent ${30 + 40 * heat}%)` }} />
    </AbsoluteFill>
  );
};

/* 34. Millions of particles: a rotating galaxy of points (additive, per-pixel). */
export const Particles: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      w={540}
      h={960}
      draw={(ctx, w, h) => {
        const acc = new Float32Array(w * h * 3);
        const N = 260000;
        const tilt = 0.78;
        for (let i = 0; i < N; i++) {
          const u = hash(i * 1.37);
          const v = hash(i * 2.11 + 5);
          const arm = i % 3;
          const r = Math.pow(u, 0.6) * 420;
          const spread = (v - 0.5) * (0.5 + 1.2 * (1 - u));
          const ang = arm * ((Math.PI * 2) / 3) + Math.log(r + 8) * 1.9 + spread + f * (0.02 + 1.2 / (r + 40));
          const z = (hash(i * 3.3) - 0.5) * 50 * (1 - u);
          const x = Math.cos(ang) * r;
          const y = Math.sin(ang) * r * tilt + z;
          const rx = x * 0.906 - y * 0.423;
          const ry = x * 0.423 + y * 0.906;
          const px = Math.round(w / 2 + rx * 0.9);
          const py = Math.round(h / 2 + ry * 0.9);
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const o = (py * w + px) * 3;
          const core = Math.max(0, 1 - r / 140);
          acc[o] += 0.12 + 0.5 * core + (arm === 1 ? 0.25 : 0);
          acc[o + 1] += 0.2 + 0.5 * core;
          acc[o + 2] += 0.55 + 0.45 * core;
        }
        for (let i = 0; i < 70000; i++) {
          const px = Math.floor(hash(i * 5.1 + 2) * w);
          const py = Math.floor(((hash(i * 3.7 + 1) + f * 0.002 * (1 + hash(i))) % 1) * h);
          const o = (py * w + px) * 3;
          acc[o] += 0.08;
          acc[o + 1] += 0.14;
          acc[o + 2] += 0.32;
        }
        const img = ctx.createImageData(w, h);
        for (let p = 0; p < w * h; p++) {
          for (let k = 0; k < 3; k++) img.data[p * 4 + k] = Math.min(255, 255 * (1 - Math.exp(-acc[p * 3 + k] * 0.9)));
          img.data[p * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }}
    />
    <Hud f={f} bl="n = 260 000" br="Δt 1e-4 · step #" />
  </AbsoluteFill>
);

/* 35. Electric impulses: forked lightning over a circuit grid (re-struck every 2 frames). */
const bolt = (x1: number, y1: number, x2: number, y2: number, disp: number, depth: number, r: () => number, out: { d: string; w: number }[], w: number) => {
  const pts: [number, number][] = [[x1, y1], [x2, y2]];
  let d = disp;
  for (let k = 0; k < depth; k++) {
    const next: [number, number][] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const nx = -(by - ay);
      const ny = bx - ax;
      const l = Math.hypot(nx, ny) || 1;
      const o = (r() - 0.5) * d;
      next.push([(ax + bx) / 2 + (nx / l) * o, (ay + by) / 2 + (ny / l) * o], pts[i + 1]);
    }
    pts.splice(0, pts.length, ...next);
    d *= 0.55;
  }
  out.push({ d: pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "), w });
  if (w > 2)
    for (let b = 0; b < 3; b++) {
      const i = Math.floor(r() * (pts.length - 2)) + 1;
      const [bx, by] = pts[i];
      bolt(bx, by, bx + (r() - 0.5) * 600, by + 150 + r() * 400, disp * 0.5, depth - 1, r, out, w * 0.5);
    }
};
export const Lightning: Shot = ({ f }) => {
  const r = rng(35 + Math.floor(f / 2) * 17);
  const out: { d: string; w: number }[] = [];
  bolt(540 + (r() - 0.5) * 200, 120, 540 + (r() - 0.5) * 300, 1800, 520, 7, r, out, 8);
  bolt(160, 300, 700, 1300, 300, 6, r, out, 4);
  bolt(980, 200, 420, 1500, 300, 6, r, out, 4);
  const flick = 0.6 + 0.4 * hash(f);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={64} a={0.1} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(47,140,255,${0.28 * flick}) 0%, transparent 60%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.cyan, 16) }}>
        {out.map((b, i) => (
          <path key={i} d={b.d} fill="none" stroke={b.w > 6 ? C.white : b.w > 3 ? "#CFE9FF" : C.cyan} strokeWidth={b.w * flick} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* 51. Huge server hall: one-point perspective aisle, rack LEDs, flying forward. */
export const ServerHall: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const vx = 540;
        const vy = 860;
        const F0 = 700;
        const P = (x: number, y: number, z: number): [number, number] => [vx + (x * F0) / z, vy + (y * F0) / z];
        const glowG = ctx.createRadialGradient(vx, vy, 0, vx, vy, 520);
        glowG.addColorStop(0, "rgba(106,216,255,0.55)");
        glowG.addColorStop(0.3, "rgba(26,75,255,0.25)");
        glowG.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowG;
        ctx.fillRect(0, 0, W, H);
        const off = (f * 26) % 260;
        // floor grid
        ctx.strokeStyle = "rgba(47,140,255,0.35)";
        ctx.lineWidth = 2;
        for (let x = -900; x <= 900; x += 150) {
          const [ax, ay] = P(x, 760, 120);
          const [bx, by] = P(x, 760, 9000);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        for (let z = 260 - off; z < 9000; z += 260) {
          const [ax, ay] = P(-900, 760, Math.max(60, z));
          const [bx] = P(900, 760, Math.max(60, z));
          ctx.globalAlpha = Math.min(1, 900 / z);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, ay);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // racks on both sides, far to near
        for (let k = 34; k >= 0; k--) {
          const z0 = 140 + k * 260 - off;
          if (z0 < 80) continue;
          const z1 = z0 + 240;
          for (const side of [-1, 1]) {
            const x = side * 360;
            const q = [P(x, -900, z0), P(x, -900, z1), P(x, 760, z1), P(x, 760, z0)];
            const fade = Math.min(1, 1500 / z0);
            ctx.fillStyle = `rgba(6,10,24,${0.95})`;
            ctx.strokeStyle = `rgba(150,180,255,${0.35 * fade})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            q.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            for (let u = 0; u < 22; u++)
              for (let v = 0; v < 3; v++) {
                const hv = hash(k * 977 + u * 31 + v * 7 + (side > 0 ? 500 : 0));
                const blink = hash(hv * 100 + Math.floor(f / 2)) > 0.3;
                if (!blink) continue;
                const [lx, ly] = P(x, -860 + u * 74, z0 + 40 + v * 70);
                const rad = Math.max(0.8, 5 * (F0 / (z0 + 40 + v * 70)));
                ctx.fillStyle = hv > 0.9 ? `rgba(163,91,255,${fade})` : hv > 0.5 ? `rgba(106,216,255,${fade})` : `rgba(255,255,255,${0.8 * fade})`;
                ctx.fillRect(lx - rad, ly - rad * 0.5, rad * 2.4, rad);
              }
          }
        }
        // ceiling light strips
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 3;
        for (const x of [-200, 0, 200]) {
          for (let z = 300 - off; z < 9000; z += 520) {
            if (z < 80) continue;
            const [ax, ay] = P(x, -1000, z);
            const [bx, by] = P(x, -1000, z + 260);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }}
    />
  </AbsoluteFill>
);

/* 52. Optical fibre: a bundle fanning out, light pulses racing to the tips. */
export const Fiber: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        ctx.globalCompositeOperation = "lighter";
        const n = 150;
        for (let i = 0; i < n; i++) {
          const a = hash(i) * 2 - 1;
          const b = hash(i + 40);
          const x0 = 540 + a * 60;
          const y0 = 2000;
          const cx = 540 + a * 260;
          const cy = 1300 - b * 300;
          const x1 = 540 + a * 900 + (hash(i + 7) - 0.5) * 300;
          const y1 = 200 + b * 900;
          const col = i % 4 === 0 ? "163,91,255" : i % 4 === 1 ? "255,255,255" : "47,140,255";
          ctx.strokeStyle = `rgba(${col},0.22)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(cx, cy, x1, y1);
          ctx.stroke();
          const at = (t: number): [number, number] => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
          for (let k = 0; k < 2; k++) {
            const t = (f * (0.035 + hash(i + 3) * 0.04) + hash(i * 3 + k)) % 1;
            for (let s = 0; s < 8; s++) {
              const [px, py] = at(Math.max(0, t - s * 0.012));
              ctx.fillStyle = `rgba(${col},${0.9 - s * 0.1})`;
              ctx.beginPath();
              ctx.arc(px, py, 4 - s * 0.35, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          const [tx, ty] = at(1);
          const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 26);
          g.addColorStop(0, `rgba(${col},0.95)`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(tx - 26, ty - 26, 52, 52);
        }
      }}
    />
  </AbsoluteFill>
);

/* 53. Data streams: lanes of hex and bits racing past at different speeds. */
export const DataStreams: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const lanes = 30;
        const lh = H / lanes;
        ctx.font = `700 26px ${MONO}`;
        ctx.textBaseline = "middle";
        for (let l = 0; l < lanes; l++) {
          const speed = 40 + hash(l) * 140;
          const y = l * lh + lh / 2;
          const col = hash(l + 9) > 0.75 ? "163,91,255" : hash(l + 4) > 0.5 ? "47,140,255" : "233,238,255";
          for (let c = -2; c < 14; c++) {
            const w = 120 + hash(l * 31 + c) * 160;
            const x = ((c * 260 + f * speed + hash(l) * 500) % 3640) - 300;
            const g = ctx.createLinearGradient(x - w * 1.5, 0, x, 0);
            g.addColorStop(0, "rgba(0,0,0,0)");
            g.addColorStop(1, `rgba(${col},0.35)`);
            ctx.fillStyle = g;
            ctx.fillRect(x - w * 1.5, y - 3, w * 1.5, 6);
            ctx.fillStyle = `rgba(${col},0.9)`;
            const word = hash(l * 7 + c) > 0.5 ? (Math.floor(hash(l + c * 3) * 0xffffffff) >>> 0).toString(16).padStart(8, "0") : (Math.floor(hash(l * 3 + c) * 255) >>> 0).toString(2).padStart(8, "0");
            ctx.fillText(word, x, y);
          }
        }
      }}
    />
    <Hud f={f} tl="ingress 400 Gb/s x 64" br="pkts #" />
  </AbsoluteFill>
);

