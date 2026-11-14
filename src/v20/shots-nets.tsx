import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, Grid, H, Haze, Hud, MONO, Tex, W, easeOut, fitEm, glow, hash, proj, rng, rotX, rotY, type Shot, type V3 } from "./kit";
import type { TexName } from "./tex";

/* ───────── MLP shared by 12-14 ───────── */

const LAYERS = [5, 8, 10, 8, 3];
const ROW_Y = [330, 650, 970, 1290, 1610];
const nodeX = (n: number, i: number) => 540 + (i - (n - 1) / 2) * Math.min(108, 900 / n);
const NODES = LAYERS.map((n, l) => Array.from({ length: n }, (_, i) => [nodeX(n, i), ROW_Y[l]] as [number, number]));
const EDGES: { a: [number, number]; b: [number, number]; w: number; l: number }[] = [];
for (let l = 0; l < LAYERS.length - 1; l++) for (const a of NODES[l]) for (const b of NODES[l + 1]) EDGES.push({ a, b, w: hash(a[0] * 3 + b[0] * 7 + l) * 2 - 1, l });

type MlpMode = "nodes" | "forward" | "backward";
const Mlp: React.FC<{ f: number; mode: MlpMode }> = ({ f, mode }) => {
  const back = mode === "backward";
  const edgeColor = (w: number) => (back ? (w > 0 ? C.violet : C.lilac) : w > 0 ? C.blue : C.violet);
  return (
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {EDGES.map((e, i) => (
        <line key={i} x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} stroke={mode === "nodes" ? C.blue : edgeColor(e.w)} strokeOpacity={mode === "nodes" ? 0.07 : 0.18 + Math.abs(e.w) * 0.45} strokeWidth={mode === "nodes" ? 1.5 : 1 + Math.abs(e.w) * 3.2} />
      ))}
      {mode !== "nodes" &&
        EDGES.filter((_, i) => i % 3 === 0).map((e, i) => {
          const t = ((f * 0.11 + hash(i) * 3) % 1 + 1) % 1;
          const u = back ? 1 - t : t;
          return <circle key={i} cx={e.a[0] + (e.b[0] - e.a[0]) * u} cy={e.a[1] + (e.b[1] - e.a[1]) * u} r={5} fill={C.white} style={{ filter: glow(back ? C.violet : C.cyan, 6) }} />;
        })}
      {NODES.flat().map(([x, y], i) => {
        const act = hash(i * 13 + Math.floor(f / 2) * 3);
        const r = mode === "nodes" ? 30 : 22;
        return (
          <g key={i} style={{ filter: glow(back ? C.violet : C.blue, act > 0.6 ? 12 : 5) }}>
            <circle cx={x} cy={y} r={r} fill={C.bg} stroke={act > 0.6 ? C.white : back ? C.violet : C.blue} strokeWidth={4} />
            <circle cx={x} cy={y} r={r * 0.55 * act} fill={act > 0.6 ? C.white : back ? C.lilac : C.cyan} />
          </g>
        );
      })}
    </svg>
  );
};

/* 11. Network architecture: CNN feature-map slabs shrinking into dense layers. */
const slab = (w: number, h: number, dpt: number, cx: number, cy: number, ax: number, ay: number) => {
  const P = (p: V3) => proj(rotY(rotX(p, ax), ay), 2000, cx, cy);
  const v: V3[] = [
    [-w / 2, -h / 2, -dpt / 2], [w / 2, -h / 2, -dpt / 2], [w / 2, h / 2, -dpt / 2], [-w / 2, h / 2, -dpt / 2],
    [-w / 2, -h / 2, dpt / 2], [w / 2, -h / 2, dpt / 2], [w / 2, h / 2, dpt / 2], [-w / 2, h / 2, dpt / 2],
  ];
  const p = v.map(P);
  const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  return { p, faces, P };
};
export const Architecture: Shot = ({ f, d }) => {
  const ax = -0.5;
  const ay = 0.75 + (f / d) * 0.12;
  const S = [
    { w: 420, h: 420, dpt: 14, y: 300, c: C.white, label: "224 x 224 x 3" },
    { w: 300, h: 300, dpt: 70, y: 640, c: C.blue, label: "55 x 55 x 96" },
    { w: 200, h: 200, dpt: 130, y: 920, c: C.cyan, label: "27 x 27 x 256" },
    { w: 130, h: 130, dpt: 190, y: 1160, c: C.violet, label: "13 x 13 x 384" },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={54} a={0.06} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 5) }}>
        {S.map((s, i) => {
          const { p, faces, P } = slab(s.w, s.h, s.dpt, 470, s.y, ax, ay);
          const next = S[i + 1];
          const kp = next ? P([s.w * 0.15, s.h * 0.1, -s.dpt / 2]) : null;
          const tgt = next ? slab(next.w, next.h, next.dpt, 470, next.y, ax, ay).P([0, 0, 0]) : null;
          return (
            <g key={i}>
              {faces.map((fc, j) => (
                <polygon key={j} points={fc.map((k) => `${p[k][0]},${p[k][1]}`).join(" ")} fill={s.c} fillOpacity={j === 0 ? 0.16 : 0.05} stroke={s.c} strokeWidth={2.5} strokeOpacity={0.9} />
              ))}
              {kp && tgt && (
                <>
                  <line x1={kp[0] - 18} y1={kp[1] - 12} x2={tgt[0]} y2={tgt[1]} stroke={C.white} strokeOpacity={0.6} strokeWidth={2} />
                  <line x1={kp[0] + 18} y1={kp[1] + 12} x2={tgt[0]} y2={tgt[1]} stroke={C.white} strokeOpacity={0.6} strokeWidth={2} />
                  <rect x={kp[0] - 18} y={kp[1] - 18} width={36} height={36} fill={C.white} fillOpacity={0.35} stroke={C.white} strokeWidth={2} />
                </>
              )}
              <text x={780} y={s.y + 8} fill={C.dim} fontFamily={MONO} fontSize={24}>
                {s.label}
              </text>
            </g>
          );
        })}
        {[0, 1, 2].map((k) => {
          const y = 1380 + k * 150;
          const n = [16, 16, 10][k];
          return (
            <g key={k}>
              {Array.from({ length: n }, (_, i) => (
                <circle key={i} cx={470 + (i - (n - 1) / 2) * 34} cy={y} r={11} fill={hash(i + k * 20 + Math.floor(f / 2)) > 0.5 ? C.white : C.bg} stroke={[C.blue, C.violet, C.white][k]} strokeWidth={3} />
              ))}
              <text x={780} y={y + 8} fill={C.dim} fontFamily={MONO} fontSize={24}>
                {["4096", "4096", "1000"][k]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* 12. Layers of neurons. */
export const NeuronLayers: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Haze color={C.deep} y={50} r={65} a={0.18} />
    <AbsoluteFill style={{ transform: `scale(${1.08 - f * 0.006})` }}>
      <Mlp f={f} mode="nodes" />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* 13. Connections between nodes: signal pulses running forward. */
export const Connections: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{ transform: `scale(${1 + f * 0.008}) rotate(${-1 + f * 0.15}deg)` }}>
      <Mlp f={f} mode="forward" />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* 14. Backpropagation: gradients flowing back up, delta rule. */
export const Backprop: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Haze color={C.violet} y={75} r={55} a={0.22} />
    <Mlp f={f} mode="backward" />
    {[[90, 470], [880, 790], [120, 1120], [860, 1430]].map(([x, y], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.85, filter: glow(C.violet, 8) }}>
        <Tex n="dLdw" em={58} color={C.lilac} />
      </div>
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1740, display: "flex", justifyContent: "center" }}>
      <Tex n="delta" em={fitEm("delta", 760, 56)} color={C.dim} />
    </div>
  </AbsoluteFill>
);

/* 15. Computational graph (autograd DAG). */
export const CompGraph: Shot = ({ f }) => {
  type N = { id: string; x: number; y: number; op?: boolean };
  const N: N[] = [
    { id: "x", x: 220, y: 300 }, { id: "W1", x: 540, y: 300 }, { id: "b1", x: 860, y: 300 },
    { id: "@", x: 380, y: 520, op: true }, { id: "+", x: 620, y: 700, op: true }, { id: "ReLU", x: 540, y: 900, op: true },
    { id: "W2", x: 220, y: 900 }, { id: "@", x: 400, y: 1110, op: true }, { id: "b2", x: 860, y: 1110 }, { id: "+", x: 620, y: 1290, op: true },
    { id: "softmax", x: 540, y: 1470, op: true }, { id: "y", x: 900, y: 1470 }, { id: "CE", x: 700, y: 1650, op: true }, { id: "L", x: 700, y: 1820 },
  ];
  const E = [[0, 3], [1, 3], [3, 4], [2, 4], [4, 5], [5, 7], [6, 7], [7, 9], [8, 9], [9, 10], [10, 12], [11, 12], [12, 13]];
  const active = Math.floor(f * 1.4) % E.length;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={60} a={0.05} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 5) }}>
        <defs>
          <marker id="v20arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={C.ink} />
          </marker>
        </defs>
        {E.map(([a, b], i) => {
          const A = N[a];
          const B = N[b];
          const len = Math.hypot(B.x - A.x, B.y - A.y);
          const k = (len - 70) / len;
          return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * k} y2={A.y + (B.y - A.y) * k} stroke={i <= active ? C.cyan : C.dim} strokeWidth={i === active ? 6 : 3} markerEnd="url(#v20arrow)" />;
        })}
        {N.map((n, i) =>
          n.op ? (
            <g key={i}>
              <ellipse cx={n.x} cy={n.y} rx={n.id.length > 2 ? 110 : 56} ry={56} fill={C.bg} stroke={C.violet} strokeWidth={4} />
              <text x={n.x} y={n.y + 11} textAnchor="middle" fill={C.white} fontFamily={MONO} fontWeight={700} fontSize={32}>
                {n.id}
              </text>
            </g>
          ) : (
            <g key={i}>
              <rect x={n.x - 62} y={n.y - 46} width={124} height={92} fill={C.bg} stroke={C.blue} strokeWidth={4} />
              <text x={n.x} y={n.y + 12} textAnchor="middle" fill={C.cyan} fontFamily={MONO} fontSize={34}>
                {n.id}
              </text>
            </g>
          ),
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* 24. Transformer architecture (Vaswani et al.): encoder and decoder towers. */
export const Transformer: Shot = ({ f, d }) => {
  type B = { t: string; c: string; h?: number };
  const enc: B[] = [{ t: "Add & Norm", c: C.white }, { t: "Feed Forward", c: C.violet, h: 100 }, { t: "Add & Norm", c: C.white }, { t: "Multi-Head\nAttention", c: C.blue, h: 130 }];
  const dec: B[] = [{ t: "Add & Norm", c: C.white }, { t: "Feed Forward", c: C.violet, h: 100 }, { t: "Add & Norm", c: C.white }, { t: "Multi-Head\nAttention", c: C.blue, h: 130 }, { t: "Add & Norm", c: C.white }, { t: "Masked\nMulti-Head\nAttention", c: C.cyan, h: 160 }];
  const tower = (blocks: B[], x: number, yBottom: number, key: string) => {
    let y = yBottom;
    const out: React.ReactNode[] = [];
    [...blocks].reverse().forEach((b, i) => {
      const hgt = b.h ?? 64;
      y -= hgt;
      out.push(
        <div key={`${key}${i}`} style={{ position: "absolute", left: x, top: y, width: 380, height: hgt, border: `3px solid ${b.c}`, borderRadius: 14, background: `${b.c}18`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: MONO, fontSize: 25, lineHeight: 1.2, color: C.ink, whiteSpace: "pre", boxShadow: `0 0 18px ${b.c}66` }}>
          {b.t}
        </div>,
      );
      y -= 26;
    });
    return { nodes: out, top: y };
  };
  const e = tower(enc, 70, 1360, "e");
  const dd = tower(dec, 630, 1360, "d");
  const z = 1.12 + (f / d) * 0.05;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} y={50} r={70} a={0.16} />
      <AbsoluteFill style={{ transform: `translateY(-120px) scale(${z})` }}>
        <div style={{ position: "absolute", left: 40, top: e.top - 20, width: 440, height: 1380 - e.top + 20 + 20, border: `2px dashed ${C.dim}`, borderRadius: 24 }} />
        <div style={{ position: "absolute", left: 600, top: dd.top - 20, width: 440, height: 1380 - dd.top + 20 + 20, border: `2px dashed ${C.dim}`, borderRadius: 24 }} />
        {e.nodes}
        {dd.nodes}
        {[
          { x: 70, y: 1440, t: "Input Embedding", c: C.lilac },
          { x: 630, y: 1440, t: "Output Embedding", c: C.lilac },
          { x: 630, y: dd.top - 210, t: "Linear", c: C.white },
          { x: 630, y: dd.top - 300, t: "Softmax", c: C.cyan },
        ].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: 380, height: 64, border: `3px solid ${b.c}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 25, color: C.ink, boxShadow: `0 0 18px ${b.c}55` }}>
            {b.t}
          </div>
        ))}
        {[260, 820].map((x, i) => (
          <div key={i} style={{ position: "absolute", left: x - 34, top: 1550, width: 68, height: 68, borderRadius: 34, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 40, color: C.white }}>
            ~
          </div>
        ))}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <path d={`M 480 ${e.top + 200} C 560 ${e.top + 200}, 560 ${e.top + 380}, 630 ${e.top + 420}`} stroke={C.blue} strokeWidth={4} fill="none" strokeDasharray="10 8" strokeDashoffset={-f * 6} />
          <text x={485} y={e.top - 40} fill={C.dim} fontFamily={MONO} fontSize={30}>
            Nx
          </text>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 25. Attention heat map: causal mask, sink column, diagonal; switches heads on the 16ths. */
export const AttnHeatmap: Shot = ({ f }) => {
  const n = 18;
  const head = Math.floor(f / 2.6);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        draw={(ctx) => {
          const cell = 50;
          const ox = 130;
          const oy = 520;
          const cmap = (v: number) => {
            const stops: [number, number[]][] = [[0, [0, 0, 0]], [0.35, [26, 75, 255]], [0.7, [163, 91, 255]], [1, [255, 255, 255]]];
            for (let i = 1; i < stops.length; i++)
              if (v <= stops[i][0]) {
                const [a, ca] = stops[i - 1];
                const [b, cb] = stops[i];
                const t = (v - a) / (b - a);
                return `rgb(${ca.map((x, k) => Math.round(x + (cb[k] - x) * t)).join(",")})`;
              }
            return "#fff";
          };
          for (let r = 0; r < n; r++) {
            const w: number[] = [];
            for (let c = 0; c <= r; c++) {
              const sink = c === 0 ? 1.6 : 0;
              const diag = Math.exp(-((r - c - (head % 3)) ** 2) / 2.5) * 2.2;
              const noise = hash(r * 19 + c * 7 + head * 101) * 1.4;
              w.push(Math.exp(sink + diag + noise));
            }
            const s = w.reduce((a, b) => a + b, 0);
            for (let c = 0; c < n; c++) {
              ctx.fillStyle = c <= r ? cmap(Math.min(1, (w[c] / s) * 2.2)) : "rgba(233,238,255,0.04)";
              ctx.fillRect(ox + c * cell, oy + r * cell, cell - 3, cell - 3);
            }
          }
          ctx.font = `400 18px ${MONO}`;
          ctx.fillStyle = "rgba(233,238,255,0.55)";
          ctx.textAlign = "right";
          for (let r = 0; r < n; r++) ctx.fillText(String(Math.floor(hash(r + 3) * 50000)), ox - 12, oy + r * cell + 31);
          ctx.save();
          ctx.translate(ox, oy - 14);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = "left";
          for (let c = 0; c < n; c++) ctx.fillText(String(Math.floor(hash(c + 3) * 50000)), 0, c * cell + 31);
          ctx.restore();
        }}
      />
      <Hud f={f} tl={`layer 47 · head ${(head % 96) + 12}`} tr="causal" br="softmax(QKᵀ/√d)" />
    </AbsoluteFill>
  );
};

/* 43. Artificial neuron (perceptron): inputs, weights, sum, activation. */
export const ArtificialNeuron: Shot = ({ f }) => {
  const ins: TexName[] = ["x1", "x2", "x3", "xn"];
  const ws: TexName[] = ["w1", "w2", "w3", "wn"];
  const sx = 540;
  const sy = 960;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.blue} y={50} r={50} a={0.18} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {ins.map((_, i) => {
          const x = 150 + i * 260;
          const t = ((f * 0.1 + i * 0.25) % 1 + 1) % 1;
          return (
            <g key={i}>
              <line x1={x} y1={420} x2={sx} y2={sy - 110} stroke={C.blue} strokeWidth={3 + i} />
              <circle cx={x + (sx - x) * t} cy={420 + (sy - 110 - 420) * t} r={8} fill={C.white} />
              <circle cx={x} cy={360} r={62} fill={C.bg} stroke={C.cyan} strokeWidth={4} />
            </g>
          );
        })}
        <circle cx={sx} cy={sy} r={110} fill={C.bg} stroke={C.white} strokeWidth={6} />
        <line x1={sx} y1={sy + 110} x2={sx} y2={1210} stroke={C.white} strokeWidth={4} />
        <rect x={sx - 150} y={1210} width={300} height={200} rx={20} fill={C.bg} stroke={C.violet} strokeWidth={5} />
        <path d={Array.from({ length: 41 }, (_, i) => { const u = i / 40; const x = sx - 120 + u * 240; const y = 1380 - 140 / (1 + Math.exp(-(u - 0.5) * 12)); return `${i ? "L" : "M"}${x} ${y}`; }).join(" ")} stroke={C.lilac} strokeWidth={5} fill="none" />
        <line x1={sx} y1={1410} x2={sx} y2={1560} stroke={C.white} strokeWidth={4} />
        <circle cx={sx} cy={1620} r={60} fill={C.white} fillOpacity={0.15 + 0.5 * hash(Math.floor(f / 3))} stroke={C.white} strokeWidth={5} />
      </svg>
      {ins.map((n, i) => (
        <div key={n} style={{ position: "absolute", left: 150 + i * 260 - 34, top: 330 }}>
          <Tex n={n} em={56} />
        </div>
      ))}
      {ws.map((n, i) => (
        <div key={n} style={{ position: "absolute", left: 150 + i * 260 + (sx - 150 - i * 260) * 0.45 + (i < 2 ? -70 : 18), top: 600 }}>
          <Tex n={n} em={46} color={C.cyan} />
        </div>
      ))}
      <div style={{ position: "absolute", left: sx - 40, top: sy - 52 }}>
        <Tex n="sum" em={96} />
      </div>
      <div style={{ position: "absolute", left: sx + 175, top: 1265 }}>
        <Tex n="phi" em={70} color={C.violet} />
      </div>
      <div style={{ position: "absolute", left: sx - 18, top: 1592 }}>
        <Tex n="y" em={60} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1740, display: "flex", justifyContent: "center" }}>
        <Tex n="neuron" em={60} color={C.dim} />
      </div>
    </AbsoluteFill>
  );
};

/* 58. Graph of connections: communities, hubs, bridges. */
const GRAPH = (() => {
  const r = rng(58);
  const centers = [[300, 520], [780, 640], [520, 1000], [260, 1400], [800, 1420]];
  const nodes = Array.from({ length: 150 }, (_, i) => {
    const c = centers[i % centers.length];
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 240;
    return { x: c[0] + Math.cos(a) * rad, y: c[1] + Math.sin(a) * rad * 0.9, g: i % centers.length, hub: i < 5 };
  });
  const edges: [number, number][] = [];
  nodes.forEach((n, i) => {
    const k = n.hub ? 0 : 2;
    for (let j = 0; j < k; j++) edges.push([i, n.g + 5 * Math.floor(r() * 30)]);
    edges.push([i, n.g]);
    if (r() < 0.08) edges.push([i, Math.floor(r() * 150)]);
  });
  return { nodes, edges };
})();
export const KnowledgeGraph: Shot = ({ f }) => {
  const rot = f * 0.006;
  const P = (x: number, y: number): [number, number] => {
    const dx = x - 540;
    const dy = y - 960;
    return [540 + dx * Math.cos(rot) - dy * Math.sin(rot), 960 + dx * Math.sin(rot) + dy * Math.cos(rot)];
  };
  const pal = [C.blue, C.violet, C.white, C.cyan, C.lilac];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${1.05 + f * 0.01})` }}>
        <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
          {GRAPH.edges.map(([a, b], i) => {
            const [x1, y1] = P(GRAPH.nodes[a].x, GRAPH.nodes[a].y);
            const [x2, y2] = P(GRAPH.nodes[b].x, GRAPH.nodes[b].y);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={pal[GRAPH.nodes[a].g]} strokeOpacity={0.3} strokeWidth={1.6} />;
          })}
          {GRAPH.nodes.map((n, i) => {
            const [x, y] = P(n.x, n.y);
            const on = hash(i + Math.floor(f / 2) * 17) > 0.8;
            return <circle key={i} cx={x} cy={y} r={n.hub ? 22 : on ? 9 : 6} fill={n.hub || on ? C.white : pal[n.g]} />;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 60. Explosion of neural connections: everything bursts out of one node. */
export const ConnectionBurst: Shot = ({ f, d }) => {
  const t = easeOut((f + 1) / d);
  const r = rng(60);
  const rays = Array.from({ length: 260 }, () => ({ a: r() * Math.PI * 2, len: 200 + r() * 900, w: 1 + r() * 3, c: r() }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} r={45} a={0.35} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {rays.map((ray, i) => {
          const L = ray.len * t;
          const x = 540 + Math.cos(ray.a) * L;
          const y = 960 + Math.sin(ray.a) * L;
          const col = ray.c < 0.45 ? C.blue : ray.c < 0.8 ? C.violet : C.white;
          const bx = 540 + Math.cos(ray.a) * L * 0.6;
          const by = 960 + Math.sin(ray.a) * L * 0.6;
          return (
            <g key={i}>
              <line x1={540} y1={960} x2={x} y2={y} stroke={col} strokeOpacity={0.55} strokeWidth={ray.w} />
              {i % 3 === 0 && <line x1={bx} y1={by} x2={bx + Math.cos(ray.a + 0.7) * L * 0.25} y2={by + Math.sin(ray.a + 0.7) * L * 0.25} stroke={col} strokeOpacity={0.4} strokeWidth={1.5} />}
              <circle cx={x} cy={y} r={2 + ray.w * 1.4} fill={col} />
            </g>
          );
        })}
        <circle cx={540} cy={960} r={40 + 30 * (1 - t)} fill={C.white} style={{ filter: glow(C.white, 30) }} />
      </svg>
    </AbsoluteFill>
  );
};

/* 66. Ultra-dense neural network: ~40k additive connections. */
export const DenseNet: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg, perspective: 1600 }}>
    <AbsoluteFill style={{ transform: `rotateX(${28 - f * 0.8}deg) scale(${1.15 + f * 0.015})` }}>
      <Canvas
        draw={(ctx) => {
          const layers = 12;
          const per = 56;
          const pos = (l: number, i: number) => [40 + (i / (per - 1)) * 1000 + Math.sin(l * 2 + i) * 6, 140 + l * 150] as const;
          ctx.globalCompositeOperation = "lighter";
          ctx.lineWidth = 1;
          for (let l = 0; l < layers - 1; l++) {
            for (let i = 0; i < per; i++) {
              const [x1, y1] = pos(l, i);
              // one path per source node and colour: ~1.8k strokes instead of ~35k (same additive look across nodes)
              const paths = [new Path2D(), new Path2D(), new Path2D()];
              for (let j = 0; j < per; j++) {
                const h2 = hash(l * 9973 + i * 131 + j);
                if (h2 < 0.45) continue;
                const [x2, y2] = pos(l + 1, j);
                const p = paths[h2 > 0.97 ? 0 : h2 > 0.75 ? 1 : 2];
                p.moveTo(x1, y1);
                p.lineTo(x2, y2);
              }
              ["rgba(255,255,255,0.35)", "rgba(163,91,255,0.07)", "rgba(47,140,255,0.06)"].forEach((col, k) => {
                ctx.strokeStyle = col;
                ctx.stroke(paths[k]);
              });
            }
          }
          ctx.globalCompositeOperation = "source-over";
          for (let l = 0; l < layers; l++)
            for (let i = 0; i < per; i++) {
              const [x, y] = pos(l, i);
              const on = hash(l * 50 + i + Math.floor(f / 2) * 7) > 0.7;
              ctx.fillStyle = on ? "#fff" : "rgba(106,216,255,0.8)";
              ctx.beginPath();
              ctx.arc(x, y, on ? 5 : 3, 0, Math.PI * 2);
              ctx.fill();
            }
        }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);
