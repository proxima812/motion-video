import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, H, Haze, Hud, MONO, Tex, W, easeIn, easeOut, glow, hash, proj, rng, rotX, rotY, rotZ, type Shot, type V3 } from "./kit";
import type { TexName } from "./tex";

const seg = (a: [number, number, number], b: [number, number, number], color: string, w: number, op: number, key: React.Key) => <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeOpacity={op} />;

/* 26. Rotating tensor: a 5x5x5 lattice of values spinning. */
export const RotatingTensor: Shot = ({ f }) => {
  const n = 4;
  const s = 175;
  const half = ((n - 1) / 2) * s;
  const ax = -0.42 + f * 0.012;
  const ay = 0.5 + f * 0.07;
  const pts: { p: V3; v: number }[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) pts.push({ p: [i * s - half, j * s - half, k * s - half], v: hash(i * 25 + j * 5 + k) });
  const R = (p: V3) => rotY(rotX(p, ax), ay);
  const P = (p: V3) => proj(R(p), 1500, 540, 960);
  const lines: React.ReactNode[] = [];
  let key = 0;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const u = a * s - half;
      const v = b * s - half;
      for (const [p0, p1] of [[[u, v, -half], [u, v, half]], [[u, -half, v], [u, half, v]], [[-half, u, v], [half, u, v]]] as [V3, V3][]) {
        const z = R([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2])[2];
        lines.push(seg(P(p0), P(p1), z > 0 ? C.blue : C.cyan, z > 0 ? 2 : 3, z > 0 ? 0.3 : 0.75, key++));
      }
    }
  const sorted = pts.map((q) => ({ ...q, r: R(q.p) })).sort((a, b) => b.r[2] - a.r[2]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} r={55} a={0.25} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {lines}
        {sorted.map((q, i) => {
          const [x, y, sc] = proj(q.r, 1500, 540, 960);
          const hot = q.v > 0.8;
          const front = q.r[2] < 0;
          return (
            <g key={i}>
              <rect x={x - 46 * sc} y={y - 24 * sc} width={92 * sc} height={48 * sc} fill={C.bg} stroke={hot ? C.white : C.blue} strokeOpacity={front ? 0.9 : 0.35} strokeWidth={2} />
              <text x={x} y={y + 11 * sc} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32 * sc} fill={hot ? C.white : q.v > 0.45 ? C.cyan : C.violet} opacity={front ? 1 : 0.45}>
                {(q.v * 2 - 1).toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <Hud f={f} bl="tensor<f16>[4, 4, 4]" br="rot # deg/s" />
    </AbsoluteFill>
  );
};

/* 27. 3D function plot: z = sin(r)/r wire mesh, height-coloured. */
export const Surface3D: Shot = ({ f }) => {
  const n = 30;
  const ax = -0.82;
  const ay = 0.6 + f * 0.04;
  const z = (x: number, y: number) => {
    const r = Math.hypot(x, y) * 1.25;
    return (Math.sin(r - f * 0.25) / (r + 0.8)) * 2.6;
  };
  const span = 7;
  const S = 52;
  const P = (x: number, y: number) => proj(rotY(rotX([x * S, -z(x, y) * 150, y * S], ax), ay), 2600, 540, 980);
  const color = (v: number) => (v > 0.9 ? C.white : v > 0.2 ? C.violet : v > -0.2 ? C.blue : C.deep);
  const out: React.ReactNode[] = [];
  let key = 0;
  for (let i = 0; i <= n; i++)
    for (let j = 0; j < n; j++) {
      const a = -span + (2 * span * i) / n;
      const b0 = -span + (2 * span * j) / n;
      const b1 = -span + (2 * span * (j + 1)) / n;
      out.push(seg(P(a, b0), P(a, b1), color(z(a, b0)), 2.2, 0.85, key++));
      out.push(seg(P(b0, a), P(b1, a), color(z(b0, a)), 2.2, 0.85, key++));
    }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={52} r={55} a={0.2} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {seg(P(-span, -span), P(span, -span), C.dim, 3, 1, "ax1")}
        {seg(P(-span, -span), P(-span, span), C.dim, 3, 1, "ax2")}
        {out}
      </svg>
      <Hud f={f} tl="z = sin(r) / r" br="mesh 31 x 31" />
    </AbsoluteFill>
  );
};

/* 28. Mandelbrot: dive into seahorse valley (computed per frame, half resolution). */
export const Mandelbrot: Shot = ({ f, d }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      w={540}
      h={960}
      draw={(ctx, w, h) => {
        const cx = -0.743643887037151;
        const cy = 0.13182590420533;
        const span = 0.012 * Math.pow(0.18, f / d);
        const img = ctx.createImageData(w, h);
        const maxIt = 260;
        const pal = (t: number) => {
          // black -> deep blue -> blue -> violet -> white
          const st: [number, number[]][] = [[0, [0, 0, 0]], [0.18, [16, 40, 170]], [0.4, [47, 140, 255]], [0.65, [163, 91, 255]], [0.85, [235, 225, 255]], [1, [255, 255, 255]]];
          for (let i = 1; i < st.length; i++)
            if (t <= st[i][0]) {
              const k = (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0]);
              return st[i - 1][1].map((v, j) => v + (st[i][1][j] - v) * k);
            }
          return [255, 255, 255];
        };
        for (let py = 0; py < h; py++) {
          const y0 = cy + ((py - h / 2) / w) * span;
          for (let px = 0; px < w; px++) {
            const x0 = cx + ((px - w / 2) / w) * span;
            let x = 0;
            let y = 0;
            let it = 0;
            while (x * x + y * y < 256 && it < maxIt) {
              const xt = x * x - y * y + x0;
              y = 2 * x * y + y0;
              x = xt;
              it++;
            }
            const o = (py * w + px) * 4;
            if (it >= maxIt) {
              img.data[o + 3] = 255;
              continue;
            }
            const sm = it + 1 - Math.log2(Math.log2(x * x + y * y) / 2);
            const t = (Math.sqrt(sm / maxIt) * 2.4 + f * 0.01) % 1;
            const [r, g, b] = pal(t);
            img.data[o] = r;
            img.data[o + 1] = g;
            img.data[o + 2] = b;
            img.data[o + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
      }}
    />
    <Hud f={f} bl="z → z² + c" br={`zoom ${(1 / (0.012 * Math.pow(0.18, f / d))).toFixed(0)}x`} />
  </AbsoluteFill>
);

/* 29. 4D projection: a tesseract rotating in XW and ZW. */
export const Tesseract: Shot = ({ f }) => {
  const V: number[][] = [];
  for (let i = 0; i < 16; i++) V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
  const E: [number, number][] = [];
  for (let i = 0; i < 16; i++) for (let b = 0; b < 4; b++) if (!(i & (1 << b))) E.push([i, i | (1 << b)]);
  const a1 = 0.6 + f * 0.09;
  const a2 = 0.3 + f * 0.05;
  const P = (v: number[]) => {
    let [x, y, z, w] = v;
    [x, w] = [x * Math.cos(a1) - w * Math.sin(a1), x * Math.sin(a1) + w * Math.cos(a1)];
    [z, w] = [z * Math.cos(a2) - w * Math.sin(a2), z * Math.sin(a2) + w * Math.cos(a2)];
    const k = 2.6 / (3 - w);
    const p3 = rotY(rotX([x * k * 300, y * k * 300, z * k * 300], 0.5), 0.4 + f * 0.02);
    return { p: proj(p3, 1800, 540, 960), w };
  };
  const pts = V.map(P);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} r={55} a={0.22} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.violet, 8) }}>
        {E.map(([a, b], i) => {
          const w = (pts[a].w + pts[b].w) / 2;
          return seg(pts[a].p, pts[b].p, w > 0 ? C.white : w > -0.6 ? C.violet : C.blue, w > 0 ? 6 : 4, 0.95, i);
        })}
        {pts.map((q, i) => (
          <circle key={i} cx={q.p[0]} cy={q.p[1]} r={9 + q.w * 4} fill={C.white} />
        ))}
      </svg>
      <Hud f={f} tl="R⁴ → R³ → R²" br="rot xw · zw" />
    </AbsoluteFill>
  );
};

/* platonic solids for 30 */
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: V3[] = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]];
const edgesOf = (v: V3[], len: number) => {
  const e: [number, number][] = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (Math.abs(Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]) - len) < 0.01) e.push([i, j]);
  return e;
};
const SOLIDS = [
  { v: ICO, e: edgesOf(ICO, 2) },
  { v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[], e: edgesOf([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], Math.sqrt(8)) },
  { v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as V3[], e: edgesOf([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], Math.SQRT2) },
  { v: Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]) as V3[], e: edgesOf(Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]) as V3[], 2) },
];

/* 30. Geometric chaos: dozens of spinning wire solids colliding. */
export const GeoChaos: Shot = ({ f }) => {
  const r = rng(30);
  const items = Array.from({ length: 26 }, (_, i) => ({ s: SOLIDS[i % 4], x: r() * 1080, y: r() * 1920, sc: 60 + r() * 260, sp: (r() - 0.5) * 0.4, c: [C.white, C.blue, C.violet, C.cyan][Math.floor(r() * 4)], ax: r() * 6, ay: r() * 6 }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 5) }}>
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`c${i}`} cx={540} cy={960} r={120 + i * 110 + f * 6} fill="none" stroke={C.faint} strokeWidth={2} strokeDasharray={`${8 + i * 4} ${12 + i * 3}`} transform={`rotate(${f * (i % 2 ? 3 : -3)} 540 960)`} />
        ))}
        {items.map((it, i) =>
          it.s.e.map(([a, b], k) => {
            const T = (p: V3) => proj(rotZ(rotY(rotX([p[0] * it.sc, p[1] * it.sc, p[2] * it.sc], it.ax + f * it.sp), it.ay + f * it.sp * 1.3), f * 0.02), 2000, it.x, it.y);
            return seg(T(it.s.v[a]), T(it.s.v[b]), it.c, 2.5, 0.85, `${i}-${k}`);
          }),
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* 55. Vector space: axes and a fan of vectors from the origin. */
export const VectorSpace: Shot = ({ f }) => {
  const ax = -0.4;
  const ay = 0.7 + f * 0.05;
  const P = (p: V3) => proj(rotY(rotX(p, ax), ay), 1800, 540, 1000);
  const r = rng(55);
  const vecs = Array.from({ length: 46 }, () => {
    const v: V3 = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
    const l = Math.hypot(...v);
    const m = 180 + r() * 300;
    return { v: [(v[0] / l) * m, (v[1] / l) * m, (v[2] / l) * m] as V3, c: r() };
  });
  const O = P([0, 0, 0]);
  const axes: [V3, TexName][] = [[[520, 0, 0], "axX"], [[0, -520, 0], "axY"], [[0, 0, 520], "axZ"]];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} r={60} a={0.22} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {axes.map(([a], i) => seg(P([-a[0], -a[1], -a[2]]), P(a), C.dim, 3, 0.8, `a${i}`))}
        {vecs.map((q, i) => {
          const e = P(q.v);
          const col = i < 3 ? C.white : q.c < 0.5 ? C.blue : C.violet;
          return (
            <g key={i}>
              {seg(O, e, col, i < 3 ? 6 : 2.5, i < 3 ? 1 : 0.75, `l${i}`)}
              <circle cx={e[0]} cy={e[1]} r={i < 3 ? 12 : 5} fill={col} />
            </g>
          );
        })}
      </svg>
      {axes.map(([a, n]) => {
        const p = P(a);
        return (
          <div key={n} style={{ position: "absolute", left: p[0] + 10, top: p[1] - 40 }}>
            <Tex n={n} em={56} color={C.dim} />
          </div>
        );
      })}
      {(["v1", "v2", "v3"] as TexName[]).map((n, i) => {
        const p = P(vecs[i].v);
        return (
          <div key={n} style={{ position: "absolute", left: p[0] + 16, top: p[1] - 70 }}>
            <Tex n={n} em={54} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 57. 3D clustering: five Gaussian blobs + centroids, spinning. */
export const Clusters3D: Shot = ({ f }) => {
  const r = rng(57);
  const gauss = () => {
    const u = Math.max(1e-6, r());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  };
  const cs: V3[] = [[-260, -200, 120], [240, -260, -160], [0, 120, 260], [-220, 300, -200], [280, 260, 60]];
  const pal = [C.blue, C.violet, C.white, C.cyan, C.lilac];
  const pts = Array.from({ length: 700 }, (_, i) => {
    const c = cs[i % 5];
    return { p: [c[0] + gauss() * 70, c[1] + gauss() * 70, c[2] + gauss() * 70] as V3, k: i % 5 };
  });
  const ax = -0.3 + f * 0.01;
  const ay = f * 0.06;
  const P = (p: V3) => proj(rotY(rotX(p, ax), ay), 1500, 540, 960);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 5) }}>
        {pts.map((q, i) => {
          const [x, y, s] = P(q.p);
          return <circle key={i} cx={x} cy={y} r={3.5 * s} fill={pal[q.k]} opacity={0.85} />;
        })}
        {cs.map((c, i) => {
          const [x, y] = P(c);
          return (
            <g key={i} stroke={C.white} strokeWidth={3}>
              <circle cx={x} cy={y} r={34} fill="none" />
              <line x1={x - 52} y1={y} x2={x + 52} y2={y} />
              <line x1={x} y1={y - 52} x2={x} y2={y + 52} />
            </g>
          );
        })}
      </svg>
      <Hud f={f} tl="k-means  k = 5" br="iter #" />
    </AbsoluteFill>
  );
};

/* 64. Fractal tunnel: nested rotating frames, exponential zoom. */
export const FractalTunnel: Shot = ({ f }) => {
  const N = 34;
  const phase = (f * 0.2) % 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.violet, 6) }}>
        {Array.from({ length: N }, (_, i) => {
          const k = i - phase;
          const s = 1500 * Math.pow(0.82, k);
          const rot = k * 9 + f * 2;
          const col = i % 3 === 0 ? C.white : i % 3 === 1 ? C.blue : C.violet;
          const sides = i % 2 ? 4 : 6;
          const pts = Array.from({ length: sides }, (_, j) => {
            const a = (j / sides) * Math.PI * 2 + (rot * Math.PI) / 180;
            return `${540 + Math.cos(a) * s},${960 + Math.sin(a) * s * 1.1}`;
          }).join(" ");
          return <polygon key={i} points={pts} fill="none" stroke={col} strokeWidth={Math.max(1, 6 * Math.pow(0.9, k))} strokeOpacity={Math.min(1, 0.25 + 0.75 * Math.pow(0.95, k))} />;
        })}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + f * 0.05;
          return <line key={`r${i}`} x1={540} y1={960} x2={540 + Math.cos(a) * 1400} y2={960 + Math.sin(a) * 1400} stroke={C.blue} strokeOpacity={0.18} strokeWidth={2} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* 65. Digital singularity: digits and light spiral into a black core. */
export const Singularity: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const cx = 540;
        const cy = 960;
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(cx, cy, 60, cx, cy, 700);
        g.addColorStop(0, "rgba(163,91,255,0.9)");
        g.addColorStop(0.25, "rgba(47,140,255,0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.font = `700 22px ${MONO}`;
        for (let i = 0; i < 2600; i++) {
          const r0 = 120 + Math.pow(hash(i), 0.7) * 900;
          const life = (hash(i + 7) + f * 0.012 * (900 / r0)) % 1;
          const r = r0 * (1 - easeIn(life) * 0.85);
          const a = hash(i + 3) * Math.PI * 2 + (f * 9) / Math.max(60, r) + Math.log(r) * 2.2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.62;
          const tail = 0.08 + 18 / r;
          const x2 = cx + Math.cos(a - tail) * r * 1.03;
          const y2 = cy + Math.sin(a - tail) * r * 1.03 * 0.62;
          const col = hash(i + 11) > 0.6 ? "163,91,255" : hash(i + 13) > 0.3 ? "47,140,255" : "255,255,255";
          ctx.strokeStyle = `rgba(${col},${0.35 + 120 / r})`;
          ctx.lineWidth = 1.5 + 160 / r;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          if (i % 9 === 0) {
            ctx.fillStyle = `rgba(${col},0.8)`;
            ctx.fillText(hash(i + f) > 0.5 ? "1" : "0", x, y);
          }
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 120, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 6;
        ctx.shadowColor = "#A35BFF";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 128, 128, 0, 0, Math.PI * 2);
        ctx.stroke();
      }}
    />
  </AbsoluteFill>
);

/* 68. Digital grid destruction: a tron corridor (floor + ceiling) shatters from the centre, tiles fly at the camera. */
export const GridBreak: Shot = ({ f, d }) => {
  const t = f / d;
  const F0 = 900;
  const HZ = 960;
  const tiles: React.ReactNode[] = [];
  let k = 0;
  for (const plane of [1, -1]) {
    const Hc = plane > 0 ? 560 : 640;
    for (let zi = 0; zi < 22; zi++)
      for (let xi = -6; xi < 6; xi++) {
        const z0 = 380 * Math.pow(1.22, zi);
        const z1 = z0 * 1.22;
        const x0 = xi * 260;
        const rnd = hash(xi * 31 + zi * 7 + plane * 101);
        const dist = Math.hypot((xi + 0.5) / 6, zi / 22);
        const p = Math.max(0, Math.min(1, t * 2.2 - dist * 1.1 - rnd * 0.35 + 0.15));
        const fly = p * p;
        const toward = 1 - 0.75 * fly;
        const lift = Hc * (1 - 0.8 * fly);
        const dx = (rnd - 0.5) * 900 * fly + Math.sign(xi + 0.5) * 260 * fly;
        const P = (x: number, z: number): [number, number] => [540 + ((x + dx) * F0) / (z * toward), HZ + (plane * lift * F0) / (z * toward)];
        const c = [P(x0, z0), P(x0 + 260, z0), P(x0 + 260, z1), P(x0, z1)];
        if (c.every(([x, y]) => x < -300 || x > 1380 || y < -300 || y > 2220)) continue;
        const mx = (c[0][0] + c[2][0]) / 2;
        const my = (c[0][1] + c[2][1]) / 2;
        const broken = p > 0.02;
        tiles.push(
          <polygon
            key={k++}
            points={c.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ")}
            fill={broken ? (rnd > 0.6 ? C.violet : C.blue) : "none"}
            fillOpacity={broken ? 0.18 + 0.3 * p : 0}
            stroke={broken ? C.white : C.blue}
            strokeOpacity={broken ? 0.9 : Math.min(0.85, 2.4 / (zi + 1))}
            strokeWidth={broken ? 2.5 : 2}
            transform={`rotate(${(fly * (rnd - 0.5) * 300).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)})`}
          />,
        );
      }
  }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={50} r={30} a={0.45} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {tiles}
      </svg>
    </AbsoluteFill>
  );
};

/* 69. Data collapse: everything is sucked into one point. */
export const Collapse: Shot = ({ f, d }) => {
  const t = easeIn((f + 1) / d);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        draw={(ctx) => {
          ctx.globalCompositeOperation = "lighter";
          ctx.font = `700 26px ${MONO}`;
          for (let i = 0; i < 1800; i++) {
            const a = hash(i) * Math.PI * 2;
            const r0 = 80 + hash(i + 1) * 1300;
            const r = r0 * (1 - t) * (1 - t);
            const streak = 40 + r0 * 0.35 * t;
            const x = 540 + Math.cos(a) * r;
            const y = 960 + Math.sin(a) * r;
            const col = i % 3 === 0 ? "255,255,255" : i % 3 === 1 ? "47,140,255" : "163,91,255";
            ctx.strokeStyle = `rgba(${col},0.55)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(a) * streak, y + Math.sin(a) * streak);
            ctx.stroke();
            if (i % 6 === 0) {
              ctx.fillStyle = `rgba(${col},${0.9 * (1 - t)})`;
              ctx.fillText(((i * 7) % 16).toString(16), x, y);
            }
          }
          const g = ctx.createRadialGradient(540, 960, 0, 540, 960, 60 + 300 * t);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.3, "rgba(163,91,255,0.6)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }}
      />
    </AbsoluteFill>
  );
};

