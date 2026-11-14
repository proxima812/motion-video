import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, Grid, H, Haze, Hud, MONO, Tex, W, easeOut, fitEm, glow, hash, proj, rng, rotX, rotY, textGlow, texSize, type Shot, type V3 } from "./kit";
import type { TexName } from "./tex";

const Row: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) =>
  `M ${cx + r * Math.cos(a0)} ${cy - r * Math.sin(a0)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)}`;
const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/* 6. Euler's identity over the unit circle, the radius sweeping to pi. */
export const Euler: Shot = ({ f, d }) => {
  const a = Math.PI * (0.45 + 0.55 * easeOut(f / d));
  const cx = 540;
  const cy = 760;
  const R = 300;
  const px = cx + R * Math.cos(a);
  const py = cy - R * Math.sin(a);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={42} r={55} a={0.18} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 8) }}>
        <line x1={cx - 430} y1={cy} x2={cx + 430} y2={cy} stroke={C.faint} strokeWidth={2} />
        <line x1={cx} y1={cy - 430} x2={cx} y2={cy + 430} stroke={C.faint} strokeWidth={2} />
        {Array.from({ length: 48 }, (_, i) => {
          const t = (i / 48) * Math.PI * 2;
          const r1 = i % 4 === 0 ? R + 26 : R + 12;
          return <line key={i} x1={cx + R * Math.cos(t)} y1={cy - R * Math.sin(t)} x2={cx + r1 * Math.cos(t)} y2={cy - r1 * Math.sin(t)} stroke={C.dim} strokeWidth={2} />;
        })}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.blue} strokeWidth={5} />
        <path d={arc(cx, cy, 90, 0, a)} stroke={C.violet} strokeWidth={6} fill="none" />
        <path d={arc(cx, cy, R, 0, a)} stroke={C.white} strokeWidth={7} fill="none" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke={C.white} strokeWidth={5} />
        <line x1={px} y1={py} x2={px} y2={cy} stroke={C.cyan} strokeWidth={3} strokeDasharray="12 10" />
        <circle cx={px} cy={py} r={14} fill={C.white} />
        <circle cx={cx - R} cy={cy} r={10} fill={C.violet} />
      </svg>
      <Row y={1210} style={{ filter: glow(C.violet, 14) }}>
        <Tex n="euler" em={fitEm("euler", 880, 190)} />
      </Row>
      <Row y={1500}>
        <Tex n="eulerFull" em={62} color={C.dim} />
      </Row>
    </AbsoluteFill>
  );
};

/* 7. Integrals: the Gaussian being integrated (Riemann strips) + Fourier and Stokes. */
export const Integrals: Shot = ({ f, d }) => {
  const x0 = 90;
  const x1 = 990;
  const base = 1080;
  const hh = 470;
  const X = (u: number) => x0 + ((u + 3.2) / 6.4) * (x1 - x0);
  const Y = (u: number) => base - Math.exp(-u * u) * hh;
  const pts: [number, number][] = Array.from({ length: 161 }, (_, i) => -3.2 + (i / 160) * 6.4).map((u) => [X(u), Y(u)]);
  const upto = -3.2 + 6.4 * easeOut(Math.min(1, (f + 3) / d));
  const fill = pts.filter(([x]) => x <= X(upto));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={45} a={0.07} />
      <Row y={250}>
        <Tex n="fourier" em={fitEm("fourier", 940, 70)} color={C.dim} />
      </Row>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="v20g7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.blue} stopOpacity={0.75} />
            <stop offset="1" stopColor={C.deep} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <line x1={x0 - 20} y1={base} x2={x1 + 20} y2={base} stroke={C.dim} strokeWidth={2} />
        {fill.length > 1 && <path d={`${path(fill)} L ${fill[fill.length - 1][0]} ${base} L ${x0} ${base} Z`} fill="url(#v20g7)" />}
        {Array.from({ length: 32 }, (_, i) => {
          const u = -3.2 + (i + 0.5) * 0.2;
          return X(u) <= X(upto) ? <rect key={i} x={X(u - 0.1)} y={Y(u)} width={X(0.1) - X(-0.1) - 3} height={base - Y(u)} fill="none" stroke={C.violet} strokeOpacity={0.6} strokeWidth={2} /> : null;
        })}
        <path d={path(pts)} fill="none" stroke={C.white} strokeWidth={6} style={{ filter: glow(C.blue, 10) }} />
        <circle cx={X(upto)} cy={Y(upto)} r={12} fill={C.white} style={{ filter: glow(C.cyan, 10) }} />
      </svg>
      <Row y={1170} style={{ filter: glow(C.blue, 12) }}>
        <Tex n="gauss" em={fitEm("gauss", 900, 150)} />
      </Row>
      <Row y={1540}>
        <Tex n="stokes" em={fitEm("stokes", 940, 62)} color={C.dim} />
      </Row>
    </AbsoluteFill>
  );
};

/* 8. Derivatives: secants collapsing into the tangent + chain rule. */
export const Derivatives: Shot = ({ f, d }) => {
  const fx = (x: number) => 0.55 * Math.sin(x * 1.3) + 0.18 * x + 0.12 * Math.sin(x * 3.1);
  const dfx = (x: number) => 0.55 * 1.3 * Math.cos(x * 1.3) + 0.18 + 0.12 * 3.1 * Math.cos(x * 3.1);
  const X = (x: number) => 540 + x * 190;
  const Y = (y: number) => 640 - y * 260;
  const xa = 0.4 + (f / d) * 0.5;
  const pts: [number, number][] = Array.from({ length: 121 }, (_, i) => -2.6 + (i / 120) * 5.2).map((x) => [X(x), Y(fx(x))]);
  const k = dfx(xa);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={50} a={0.06} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <line x1={60} y1={Y(0)} x2={1020} y2={Y(0)} stroke={C.faint} strokeWidth={2} />
        <line x1={X(0)} y1={260} x2={X(0)} y2={1000} stroke={C.faint} strokeWidth={2} />
        {[1.6, 1.1, 0.7, 0.42, 0.22].map((hh, i) => (
          <line key={i} x1={X(xa - 1.4)} y1={Y(fx(xa) - 1.4 * ((fx(xa + hh) - fx(xa)) / hh))} x2={X(xa + 2)} y2={Y(fx(xa) + 2 * ((fx(xa + hh) - fx(xa)) / hh))} stroke={C.violet} strokeOpacity={0.25 + i * 0.12} strokeWidth={3} />
        ))}
        <path d={path(pts)} fill="none" stroke={C.white} strokeWidth={6} style={{ filter: glow(C.blue, 10) }} />
        <line x1={X(xa - 1.6)} y1={Y(fx(xa) - 1.6 * k)} x2={X(xa + 1.6)} y2={Y(fx(xa) + 1.6 * k)} stroke={C.cyan} strokeWidth={6} style={{ filter: glow(C.cyan, 10) }} />
        <circle cx={X(xa)} cy={Y(fx(xa))} r={14} fill={C.white} />
      </svg>
      <Row y={1110} style={{ filter: glow(C.violet, 12) }}>
        <Tex n="chain" em={fitEm("chain", 960, 110)} />
      </Row>
      <Row y={1430}>
        <Tex n="limit" em={fitEm("limit", 900, 70)} color={C.dim} />
      </Row>
      <Row y={1640}>
        <Tex n="sigmoidD" em={fitEm("sigmoidD", 820, 56)} color={"rgba(233,238,255,0.35)"} />
      </Row>
    </AbsoluteFill>
  );
};

/* 9. Matrix 100x100: starts on readable numbers in the corner, pulls back to the whole 10 000 cells. */
export const Matrix100: Shot = ({ f, d }) => {
  const t = Math.pow(Math.min(1, f / (d - 1)), 1.7);
  const s = 5.2 - 4.2 * t;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        draw={(ctx) => {
          const n = 100;
          const size = 960;
          const cell = size / n;
          const ox = (W - size) / 2;
          const oy = (H - size) / 2;
          // camera: zoom around the top-left corner, ending centered
          const fx = ox + 40 * (1 - t);
          const fy = oy + 40 * (1 - t);
          const cx = fx + (W / 2 - fx) * t;
          const cy = fy + (H / 2 - fy) * t;
          ctx.translate(W / 2, H / 2);
          ctx.scale(s, s);
          ctx.translate(-cx, -cy);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `400 ${cell * 0.36}px ${MONO}`;
          const vx0 = cx - W / 2 / s;
          const vx1 = cx + W / 2 / s;
          const vy0 = cy - H / 2 / s;
          const vy1 = cy + H / 2 / s;
          for (let r = 0; r < n; r++) {
            const y = oy + r * cell;
            if (y + cell < vy0 || y > vy1) continue;
            for (let c = 0; c < n; c++) {
              const x = ox + c * cell;
              if (x + cell < vx0 || x > vx1) continue;
              const v = hash(r * 131 + c * 7.3);
              const diag = r === c;
              const scan = r === Math.floor(f * 9) % n;
              const a = diag ? 1 : 0.45 + v * 0.55;
              ctx.fillStyle = diag ? "rgba(255,255,255,0.75)" : scan ? "rgba(106,216,255,0.75)" : `rgba(${v > 0.85 ? "163,91,255" : "47,140,255"},${0.12 + v * 0.5})`;
              ctx.fillRect(x + 0.4, y + 0.4, cell - 0.8, cell - 0.8);
              if (s > 1.6) {
                ctx.fillStyle = `rgba(233,238,255,${a})`;
                ctx.fillText((v * 2 - 1).toFixed(2), x + cell / 2, y + cell / 2);
              }
            }
          }
          ctx.strokeStyle = C.ink;
          ctx.lineWidth = 2.4 / Math.max(1, s * 0.5);
          ctx.beginPath();
          ctx.moveTo(ox - 6, oy - 8);
          ctx.lineTo(ox - 16, oy - 8);
          ctx.lineTo(ox - 16, oy + size + 8);
          ctx.lineTo(ox - 6, oy + size + 8);
          ctx.moveTo(ox + size + 6, oy - 8);
          ctx.lineTo(ox + size + 16, oy - 8);
          ctx.lineTo(ox + size + 16, oy + size + 8);
          ctx.lineTo(ox + size + 6, oy + size + 8);
          ctx.stroke();
        }}
      />
      <Hud f={f} bl="A: float32[100, 100]" br={`det ${(hash(f) * 9).toFixed(3)}e+41`} />
    </AbsoluteFill>
  );
};

/* lattice lines on the surface of an nx*ny*nz box (cell size s, centered) */
const boxLines = (nx: number, ny: number, nz: number, s: number): [V3, V3][] => {
  const X = (nx * s) / 2;
  const Y = (ny * s) / 2;
  const Z = (nz * s) / 2;
  const out: [V3, V3][] = [];
  for (let i = 0; i <= nx; i++) {
    const x = -X + i * s;
    out.push([[x, -Y, -Z], [x, Y, -Z]], [[x, -Y, Z], [x, Y, Z]], [[x, -Y, -Z], [x, -Y, Z]], [[x, Y, -Z], [x, Y, Z]]);
  }
  for (let j = 0; j <= ny; j++) {
    const y = -Y + j * s;
    out.push([[-X, y, -Z], [X, y, -Z]], [[-X, y, Z], [X, y, Z]], [[-X, y, -Z], [-X, y, Z]], [[X, y, -Z], [X, y, Z]]);
  }
  for (let k = 0; k <= nz; k++) {
    const z = -Z + k * s;
    out.push([[-X, -Y, z], [X, -Y, z]], [[-X, Y, z], [X, Y, z]], [[-X, -Y, z], [-X, Y, z]], [[X, -Y, z], [X, Y, z]]);
  }
  return out;
};

const WireBox: React.FC<{ nx: number; ny: number; nz: number; s: number; cx: number; cy: number; ax: number; ay: number; color: string; lit?: number; seed?: number }> = ({ nx, ny, nz, s, cx, cy, ax, ay, color, lit = 0, seed = 1 }) => {
  const P = (p: V3) => proj(rotY(rotX(p, ax), ay), 1800, cx, cy);
  const r = rng(seed);
  const cells: { p: V3; on: boolean }[] = [];
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++)
      for (let k = 0; k < nz; k++) cells.push({ p: [(-nx / 2 + i + 0.5) * s, (-ny / 2 + j + 0.5) * s, (-nz / 2 + k + 0.5) * s], on: r() < lit });
  return (
    <g>
      {cells
        .filter((c) => c.on)
        .map((c, i) => {
          const [x, y, sc] = P(c.p);
          return <rect key={i} x={x - s * 0.3 * sc} y={y - s * 0.3 * sc} width={s * 0.6 * sc} height={s * 0.6 * sc} fill={color} opacity={0.55} />;
        })}
      {boxLines(nx, ny, nz, s).map(([a, b], i) => {
        const [x1, y1] = P(a);
        const [x2, y2] = P(b);
        const z = rotY(rotX([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], ax), ay)[2];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeOpacity={z > 0 ? 0.3 : 0.95} />;
      })}
    </g>
  );
};

/* 10. Tensor computations: A (x) B = C as lattice boxes, voxels of C filling in. */
export const Tensors: Shot = ({ f, d }) => {
  const ay = -0.6 + f * 0.035;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} y={55} r={60} a={0.2} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        <WireBox nx={4} ny={4} nz={1} s={52} cx={270} cy={520} ax={-0.45} ay={ay} color={C.cyan} lit={0.6} seed={3} />
        <WireBox nx={3} ny={4} nz={3} s={52} cx={810} cy={520} ax={-0.45} ay={ay} color={C.violet} lit={0.5} seed={5} />
        <WireBox nx={5} ny={5} nz={5} s={66} cx={540} cy={1120} ax={-0.5} ay={ay + 0.3} color={C.white} lit={0.15 + 0.6 * (f / d)} seed={7} />
      </svg>
      <div style={{ position: "absolute", left: 512, top: 486, filter: glow(C.white, 8) }}>
        <Tex n="otimes" em={90} />
      </div>
      <div style={{ position: "absolute", left: 512, top: 760, filter: glow(C.white, 8) }}>
        <Tex n="eq" em={90} />
      </div>
      <Row y={1560} style={{ filter: glow(C.blue, 10) }}>
        <Tex n="einsum" em={fitEm("einsum", 900, 100)} />
      </Row>
      <Row y={250}>
        <Tex n="cp" em={fitEm("cp", 880, 60)} color={C.dim} />
      </Row>
    </AbsoluteFill>
  );
};

/* 21. Attention formula, the three projections above it. */
export const AttentionFormula: Shot = ({ f }) => {
  const grid = (x: number, y: number, color: string, label: TexName, seed: number) => (
    <g key={label}>
      {Array.from({ length: 20 }, (_, i) => {
        const v = hash(seed * 31 + i + Math.floor(f / 2));
        return <rect key={i} x={x + (i % 4) * 46} y={y + Math.floor(i / 4) * 46} width={40} height={40} fill={color} opacity={0.15 + v * 0.75} />;
      })}
    </g>
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={52} r={60} a={0.2} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {grid(110, 420, C.blue, "Q", 1)}
        {grid(450, 420, C.violet, "K", 2)}
        {grid(790, 420, C.cyan, "V", 3)}
        {[200, 540, 880].map((x, i) => (
          <path key={i} d={`M ${x} 680 C ${x} 760, 540 740, 540 840`} stroke={C.dim} strokeWidth={3} fill="none" />
        ))}
      </svg>
      {(["Q", "K", "V"] as TexName[]).map((n, i) => (
        <div key={n} style={{ position: "absolute", left: 182 + i * 340, top: 320 }}>
          <Tex n={n} em={74} color={[C.blue, C.violet, C.cyan][i]} />
        </div>
      ))}
      <Row y={900} style={{ filter: glow(C.violet, 16) }}>
        <Tex n="attention" em={fitEm("attention", 980, 120)} />
      </Row>
      <Row y={1290}>
        <Tex n="multihead" em={fitEm("multihead", 940, 64)} color={C.dim} />
      </Row>
      <Row y={1480}>
        <Tex n="posenc" em={fitEm("posenc", 700, 60)} color={"rgba(233,238,255,0.35)"} />
      </Row>
    </AbsoluteFill>
  );
};

/* 22. Q x K^T: row of Q times column of K^T lands in one score cell (sweeping). */
export const QKt: Shot = ({ f }) => {
  const n = 8;
  const dk = 4;
  const c = 62;
  const qx = 70;
  const sx = 70 + dk * c + 40;
  const ky = 300;
  const sy = ky + dk * c + 40;
  const k = Math.floor(f * 1.6);
  const i = Math.floor(k / n) % n;
  const j = k % n;
  const val = (a: number, b: number) => hash(a * 17 + b * 5) * 2 - 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 5) }}>
        {Array.from({ length: n * dk }, (_, q) => {
          const r = Math.floor(q / dk);
          const cc = q % dk;
          return <rect key={`q${q}`} x={qx + cc * c} y={sy + r * c} width={c - 6} height={c - 6} fill={C.blue} opacity={r === i ? 0.95 : 0.12 + hash(q) * 0.3} />;
        })}
        {Array.from({ length: n * dk }, (_, q) => {
          const r = q % dk;
          const cc = Math.floor(q / dk);
          return <rect key={`k${q}`} x={sx + cc * c} y={ky + r * c} width={c - 6} height={c - 6} fill={C.violet} opacity={cc === j ? 0.95 : 0.12 + hash(q + 50) * 0.3} />;
        })}
        {Array.from({ length: n * n }, (_, q) => {
          const r = Math.floor(q / n);
          const cc = q % n;
          const v = val(r, cc);
          const done = r * n + cc <= (k % (n * n));
          const hot = r === i && cc === j;
          return (
            <g key={`s${q}`}>
              <rect x={sx + cc * c} y={sy + r * c} width={c - 6} height={c - 6} fill={hot ? C.white : v > 0 ? C.cyan : C.deep} opacity={hot ? 1 : done ? 0.18 + Math.abs(v) * 0.6 : 0.06} />
              {done && (
                <text x={sx + cc * c + (c - 6) / 2} y={sy + r * c + c / 2 + 2} fill={hot ? C.bg : C.ink} fontFamily={MONO} fontSize={17} textAnchor="middle">
                  {v.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={qx + dk * c} y1={sy + i * c + c / 2 - 3} x2={sx + j * c + c / 2 - 3} y2={sy + i * c + c / 2 - 3} stroke={C.white} strokeWidth={3} strokeDasharray="8 6" />
        <line x1={sx + j * c + c / 2 - 3} y1={ky + dk * c} x2={sx + j * c + c / 2 - 3} y2={sy + i * c + c / 2 - 3} stroke={C.white} strokeWidth={3} strokeDasharray="8 6" />
      </svg>
      <div style={{ position: "absolute", left: qx + 70, top: sy - 110 }}>
        <Tex n="Q" em={80} color={C.blue} />
      </div>
      <div style={{ position: "absolute", left: sx - 20 - 120, top: ky + 40 }}>
        <Tex n="Kt" em={80} color={C.violet} />
      </div>
      <Row y={sy + n * c + 90} style={{ filter: glow(C.white, 10) }}>
        <Tex n="qkt" em={150} />
      </Row>
    </AbsoluteFill>
  );
};

/* 23. Softmax: logits squeezed into a probability distribution. */
export const Softmax: Shot = ({ f, d }) => {
  const n = 12;
  const z = Array.from({ length: n }, (_, i) => hash(i * 3.7) * 4 - 1.5 + (i === 7 ? 2.4 : 0));
  const temp = 1.6 - (f / d) * 0.9;
  const e = z.map((v) => Math.exp(v / temp));
  const sum = e.reduce((a, b) => a + b, 0);
  const p = e.map((v) => v / sum);
  const bw = 62;
  const x0 = (W - n * (bw + 12)) / 2;
  const base = 1560;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={60} a={0.05} />
      <Row y={300} style={{ filter: glow(C.violet, 14) }}>
        <Tex n="softmax" em={fitEm("softmax", 900, 130)} />
      </Row>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <line x1={60} x2={1020} y1={base} y2={base} stroke={C.dim} strokeWidth={2} />
        {p.map((v, i) => {
          const hgt = v * 1500;
          const top = i === 7;
          return (
            <g key={i}>
              <rect x={x0 + i * (bw + 12)} y={base - (z[i] + 2) * 40} width={bw} height={(z[i] + 2) * 40} fill="none" stroke={C.faint} strokeWidth={2} strokeDasharray="6 6" />
              <rect x={x0 + i * (bw + 12)} y={base - hgt} width={bw} height={hgt} fill={top ? C.white : i % 3 === 0 ? C.violet : C.blue} style={{ filter: top ? glow(C.cyan, 14) : undefined }} />
              <text x={x0 + i * (bw + 12) + bw / 2} y={base - hgt - 16} fill={top ? C.white : C.dim} fontFamily={MONO} fontSize={21} textAnchor="middle">
                {v.toFixed(2).slice(1)}
              </text>
            </g>
          );
        })}
      </svg>
      <Hud f={f} bl={`T = ${temp.toFixed(2)}`} br="Σ p = 1.000" />
    </AbsoluteFill>
  );
};

/* 39. Adam: the four update rules over its own trajectory. */
export const Adam: Shot = ({ f, d }) => {
  const pts: [number, number][] = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    return [140 + t * 800 + Math.sin(t * 14) * 60 * (1 - t), 1680 - t * 1300 + Math.cos(t * 11) * 90 * (1 - t)];
  });
  const shown = pts.slice(0, Math.max(2, Math.round(((f + 2) / d) * pts.length)));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={940} cy={380} rx={120 + i * 110} ry={70 + i * 70} transform="rotate(-35 940 380)" fill="none" stroke={C.blue} strokeOpacity={0.22 - i * 0.015} strokeWidth={2} />
        ))}
        <path d={path(shown)} fill="none" stroke={C.violet} strokeWidth={5} style={{ filter: glow(C.violet, 8) }} />
        {shown.map(([x, y], i) => (i % 4 === 0 ? <circle key={i} cx={x} cy={y} r={7} fill={C.white} /> : null))}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", filter: glow(C.blue, 10) }}>
        <div style={{ background: "rgba(0,0,0,0.55)", padding: 30 }}>
          <Tex n="adam" em={fitEm("adam", 900, 96)} />
        </div>
      </AbsoluteFill>
      <Hud f={f} tl="AdamW  lr 3e-4" tr="β1 0.90  β2 0.95" bl="ε 1e-8  wd 0.1" br="step #" />
    </AbsoluteFill>
  );
};

/* 46. Maxwell's equations over dipole field lines. */
export const Maxwell: Shot = ({ f }) => {
  const cx = 540;
  const cy = 960;
  const lines: string[] = [];
  for (const k of [140, 230, 340, 480, 650, 860]) {
    for (const side of [-1, 1]) {
      const pts: [number, number][] = [];
      for (let i = 1; i < 120; i++) {
        const th = (i / 120) * Math.PI;
        const r = k * Math.sin(th) ** 2;
        pts.push([cx + side * r * Math.sin(th), cy - r * Math.cos(th)]);
      }
      lines.push(path(pts));
    }
  }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute", transform: `rotate(${f * 0.6}deg)` }}>
        {lines.map((dd, i) => (
          <path key={i} d={dd} fill="none" stroke={i % 2 ? C.blue : C.violet} strokeOpacity={0.6} strokeWidth={4} strokeDasharray="18 14" strokeDashoffset={-f * 8} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 46% 26% at 50% 50%, rgba(0,0,0,0.92), rgba(0,0,0,0))" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ filter: glow(C.blue, 12) }}>
          <Tex n="maxwell" em={fitEm("maxwell", 860, 120)} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 47. Schrodinger equation over a travelling wave packet. */
export const Schrodinger: Shot = ({ f }) => {
  const psi = (x: number, part: "re" | "im" | "abs") => {
    const env = Math.exp(-((x - 540 - f * 10) ** 2) / (2 * 170 ** 2));
    const ph = x * 0.05 - f * 0.9;
    return part === "re" ? env * Math.cos(ph) : part === "im" ? env * Math.sin(ph) : env * env;
  };
  const line = (part: "re" | "im" | "abs", y0: number, amp: number) => path(Array.from({ length: 217 }, (_, i) => [i * 5, y0 - psi(i * 5, part) * amp]));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <path d={line("abs", 1500, 420) + " L 1080 1500 L 0 1500 Z"} fill={C.deep} fillOpacity={0.35} />
        <path d={line("re", 1500, 300)} fill="none" stroke={C.blue} strokeWidth={5} style={{ filter: glow(C.blue, 8) }} />
        <path d={line("im", 1500, 300)} fill="none" stroke={C.violet} strokeWidth={5} style={{ filter: glow(C.violet, 8) }} />
        <path d={line("abs", 1500, 420)} fill="none" stroke={C.white} strokeWidth={4} />
      </svg>
      <Row y={640} style={{ filter: glow(C.violet, 14) }}>
        <Tex n="schrodinger" em={fitEm("schrodinger", 990, 120)} />
      </Row>
      <Row y={420}>
        <Tex n="hamiltonian" em={64} color={C.dim} />
      </Row>
    </AbsoluteFill>
  );
};

/* 61. Infinite formulas: three parallax walls of everything at once. */
const WALL: TexName[] = ["einstein", "navier", "bayes", "kl", "zeta", "taylor", "cauchy", "lagrange", "gaussian", "elbo", "svd", "eigen", "relu", "entropy", "emc2", "heisenberg", "dirac", "convolution", "diffusion", "scaling", "partition", "attention", "softmax", "gd", "fourier", "gauss", "schrodinger", "euler", "chain", "layernorm", "crossEntropy", "bell"];
export const InfiniteFormulas: Shot = ({ f }) => {
  const layer = (em: number, speed: number, op: number, seed: number, color: string) => {
    const r = rng(seed);
    const items: React.ReactNode[] = [];
    let y = -200 - ((f * speed) % 400);
    let k = seed * 5;
    while (y < H + 200) {
      const n = WALL[k++ % WALL.length];
      const { w, h } = texSize(n, em);
      const x = r() * Math.max(0, W - w);
      items.push(
        <div key={`${seed}-${k}`} style={{ position: "absolute", left: x - (r() - 0.5) * 200, top: y }}>
          <Tex n={n} em={em} color={color} />
        </div>,
      );
      y += h + 30 + r() * 40;
    }
    return <AbsoluteFill style={{ opacity: op }}>{items}</AbsoluteFill>;
  };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ filter: "blur(2px)" }}>{layer(38, 22, 0.35, 1, C.blue)}</AbsoluteFill>
      {layer(56, 40, 0.6, 2, C.violet)}
      <AbsoluteFill style={{ filter: glow(C.blue, 8) }}>{layer(84, 70, 1, 3, C.white)}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 63. Matrices overlaid: rotated numeric grids blended over a heat map. */
export const MatrixOverlay: Shot = ({ f }) => {
  const mat = (seed: number, rows: number, cols: number, size: number, color: string, rot: number, x: number, y: number, s: number) => (
    <div key={seed} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot + f * 0.4 * (seed % 2 ? 1 : -1)}deg) scale(${s + f * 0.01})`, fontFamily: MONO, fontSize: size, lineHeight: 1.35, color, whiteSpace: "pre", mixBlendMode: "screen", textShadow: textGlow(color, 10) }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r}>{Array.from({ length: cols }, (_, c) => (hash(seed * 1000 + r * 37 + c + Math.floor(f / 2)) * 2 - 1).toFixed(3).padStart(7)).join(" ")}</div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        draw={(ctx) => {
          const n = 40;
          const cw = W / n;
          for (let r = 0; r < 72; r++)
            for (let c = 0; c < n; c++) {
              const v = hash(r * 41 + c * 3 + Math.floor(f / 3) * 7);
              ctx.fillStyle = `rgba(${v > 0.7 ? "163,91,255" : "26,75,255"},${v * 0.35})`;
              ctx.fillRect(c * cw, r * cw, cw - 1, cw - 1);
            }
        }}
      />
      {mat(1, 14, 4, 34, C.white, -8, 40, 180, 1.1)}
      {mat(2, 18, 5, 26, C.cyan, 12, -60, 760, 1)}
      {mat(3, 10, 3, 46, C.violet, 4, 200, 1200, 1.15)}
      {mat(4, 22, 6, 20, C.blue, -20, 120, 420, 1)}
    </AbsoluteFill>
  );
};

