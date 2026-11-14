import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, Grid, H, Haze, Hud, MONO, NUM, Tex, W, easeOut, fitEm, glow, hash, rng, textGlow, type Shot } from "./kit";
import type { TexName } from "./tex";

const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/* 36. Gradient descent: contour map of the loss, zig-zag steps into the minimum. */
export const GradDescent: Shot = ({ f, d }) => {
  const cx = 600;
  const cy = 1080;
  const rot = -0.6;
  const toScreen = (u: number, v: number): [number, number] => [cx + (u * Math.cos(rot) - v * Math.sin(rot)) * 110, cy + (u * Math.sin(rot) + v * Math.cos(rot)) * 110];
  const steps: [number, number][] = [];
  let u = -3.6;
  let v = 2.6;
  for (let i = 0; i < 26; i++) {
    steps.push(toScreen(u, v));
    u -= 0.16 * u * 2;
    v -= 0.85 * v * 1.08;
  }
  const shown = steps.slice(0, Math.max(2, Math.round(easeOut((f + 2) / d) * steps.length)));
  const [hx, hy] = shown[shown.length - 1];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 14 }, (_, i) => {
          const k = 14 - i;
          return <ellipse key={i} cx={cx} cy={cy} rx={k * 52} ry={k * 25} transform={`rotate(${(rot * 180) / Math.PI} ${cx} ${cy})`} fill={k < 3 ? "rgba(47,140,255,0.12)" : "none"} stroke={k % 2 ? C.blue : C.violet} strokeOpacity={0.25 + (14 - k) * 0.05} strokeWidth={3} />;
        })}
        <path d={path(shown)} fill="none" stroke={C.white} strokeWidth={5} style={{ filter: glow(C.cyan, 8) }} />
        {shown.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === shown.length - 1 ? 16 : 8} fill={i === shown.length - 1 ? C.white : C.cyan} />
        ))}
        <line x1={hx} y1={hy} x2={hx + (cx - hx) * 0.35} y2={hy + (cy - hy) * 0.35} stroke={C.violet} strokeWidth={6} />
        <circle cx={cx} cy={cy} r={10} fill="none" stroke={C.white} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", filter: glow(C.blue, 10) }}>
        <Tex n="gd" em={fitEm("gd", 900, 120)} />
      </div>
      <Hud f={f} bl="η = 0.16" br={`‖∇‖ ${(1.2 * Math.exp(-f * 0.3)).toFixed(4)}`} />
    </AbsoluteFill>
  );
};

/* 37. Loss curve: train / val falling over a million steps. */
export const LossCurve: Shot = ({ f, d }) => {
  const x0 = 150;
  const x1 = 990;
  const y0 = 1560;
  const y1 = 420;
  const n = 220;
  const curve = (seed: number, off: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const loss = 0.35 + 3.6 * Math.exp(-t * 6.5) + off * t + (hash(i * 3 + seed) - 0.5) * 0.18 * (1 - t * 0.7);
      return [x0 + t * (x1 - x0), y0 - (loss / 4.2) * (y0 - y1)] as [number, number];
    });
  const k = Math.max(2, Math.round(n * Math.min(1, 0.55 + 0.45 * ((f + 1) / d))));
  const tr = curve(1, 0).slice(0, k);
  const va = curve(2, 0.12).slice(0, k);
  const tip = tr[tr.length - 1];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = y0 - (i / 4) * (y0 - y1);
          return (
            <g key={i}>
              <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.faint} strokeWidth={2} />
              <text x={x0 - 20} y={y + 9} textAnchor="end" fill={C.dim} fontFamily={MONO} fontSize={26}>
                {(i * 1.05).toFixed(1)}
              </text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x={x0 + (i / 4) * (x1 - x0)} y={y0 + 50} textAnchor="middle" fill={C.dim} fontFamily={MONO} fontSize={24}>
            {i === 0 ? "0" : `${i * 250}k`}
          </text>
        ))}
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink} strokeWidth={3} />
        <line x1={x0} y1={y0} x2={x0} y2={y1 - 40} stroke={C.ink} strokeWidth={3} />
        <path d={path(va)} fill="none" stroke={C.violet} strokeWidth={4} strokeOpacity={0.9} />
        <path d={path(tr)} fill="none" stroke={C.cyan} strokeWidth={5} style={{ filter: glow(C.blue, 8) }} />
        <circle cx={tip[0]} cy={tip[1]} r={12} fill={C.white} />
      </svg>
      <div style={{ position: "absolute", left: Math.min(tip[0] - 250, 700), top: tip[1] - 110, fontFamily: NUM, fontWeight: 700, fontSize: 64, color: C.white, textShadow: textGlow(C.blue, 14), fontVariantNumeric: "tabular-nums" }}>
        {(0.0731 + hash(Math.floor(f / 2)) * 0.004).toFixed(4)}
      </div>
      <Hud f={f} tl="train" tr="val" bl="step 1 000 000" br="tokens 15T" />
    </AbsoluteFill>
  );
};

/* 38. Weight matrices: four low-rank-ish heat maps stacked in depth. */
export const WeightMatrices: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg, perspective: 1500 }}>
    {[0, 1, 2, 3].map((m) => (
      <AbsoluteFill key={m} style={{ transform: `translate3d(${-150 + m * 100}px, ${-330 + m * 220}px, ${-m * 260}px) rotateY(-24deg) rotateX(14deg) scale(0.62)` }}>
        <Canvas
          draw={(ctx) => {
            const n = 36;
            const s = 1000 / n;
            for (let r = 0; r < n; r++)
              for (let c = 0; c < n; c++) {
                const v = Math.sin(r * 0.37 + m) * Math.cos(c * 0.29 - m) * 0.7 + Math.sin((r + c) * 0.11 + m * 2) * 0.3 + (hash(r * 71 + c * 13 + m * 1000 + Math.floor(f / 2) * 3) - 0.5) * 0.5;
                const a = Math.min(1, Math.abs(v));
                ctx.fillStyle = v > 0 ? (a > 0.85 ? `rgba(255,255,255,${a})` : `rgba(163,91,255,${a})`) : `rgba(47,140,255,${a})`;
                ctx.fillRect(40 + c * s, 460 + r * s, s - 2, s - 2);
              }
            ctx.strokeStyle = "rgba(233,238,255,0.8)";
            ctx.lineWidth = 4;
            ctx.strokeRect(36, 456, 1008, 1008);
            ctx.font = `700 54px ${MONO}`;
            ctx.fillStyle = "#fff";
            ctx.fillText(["W_q", "W_k", "W_v", "W_o"][m], 40, 430);
          }}
        />
      </AbsoluteFill>
    ))}
  </AbsoluteFill>
);

/* 40. Training dashboard: six live charts. */
export const TrainDashboard: Shot = ({ f }) => {
  const panels = [
    { t: "loss/train", fn: (x: number) => 3.8 * Math.exp(-x * 5) + 0.4, c: C.cyan, noise: 0.08 },
    { t: "loss/val", fn: (x: number) => 3.9 * Math.exp(-x * 4.4) + 0.5, c: C.violet, noise: 0.04 },
    { t: "acc/top1", fn: (x: number) => 4.3 - 3.9 * Math.exp(-x * 4), c: C.white, noise: 0.05 },
    { t: "lr", fn: (x: number) => (x < 0.08 ? (x / 0.08) * 4 : 4 * (0.5 + 0.5 * Math.cos(Math.PI * (x - 0.08) / 0.92))) + 0.1, c: C.blue, noise: 0 },
    { t: "grad_norm", fn: (x: number) => 1 + Math.exp(-x * 3) * 2, c: C.lilac, noise: 0.6, spikes: true },
    { t: "tok/s", fn: () => 3.2, c: C.cyan, noise: 0.35 },
  ];
  const pw = 450;
  const ph = 430;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={30} a={0.05} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {panels.map((p, i) => {
          const px = 60 + (i % 2) * (pw + 60);
          const py = 300 + Math.floor(i / 2) * (ph + 60);
          const n = 90;
          const k = Math.min(n, 40 + f * 6);
          const pts: [number, number][] = Array.from({ length: k }, (_, j) => {
            const x = j / (n - 1);
            let v = p.fn(x) + (hash(j * 7 + i * 100) - 0.5) * p.noise;
            if (p.spikes && hash(j * 13 + i) > 0.94) v += 2.2;
            return [px + 20 + x * (pw - 40), py + ph - 30 - Math.min(4.4, Math.max(0, v)) * ((ph - 90) / 4.4)];
          });
          return (
            <g key={i}>
              <rect x={px} y={py} width={pw} height={ph} fill="rgba(47,140,255,0.04)" stroke={C.faint} strokeWidth={2} />
              <text x={px + 20} y={py + 42} fill={C.dim} fontFamily={MONO} fontSize={24}>
                {p.t}
              </text>
              <path d={path(pts)} fill="none" stroke={p.c} strokeWidth={3.5} style={{ filter: glow(p.c, 5) }} />
            </g>
          );
        })}
      </svg>
      <Hud f={f} tl="run omega-1.8T" tr="epoch 3 / 3" bl="8192 x H200" br="ETA 41d" />
    </AbsoluteFill>
  );
};

/* 48. Quantum circuit: five qubits, H / CNOT / Rz / measure, a time cursor. */
export const QuantumCircuit: Shot = ({ f }) => {
  const q = 5;
  const y = (i: number) => 520 + i * 210;
  const gates: { x: number; k: "H" | "X" | "Rz" | "T" | "M"; i: number; ctl?: number }[] = [
    { x: 260, k: "H", i: 0 }, { x: 260, k: "H", i: 2 }, { x: 260, k: "H", i: 4 },
    { x: 400, k: "X", i: 1, ctl: 0 }, { x: 520, k: "Rz", i: 3 }, { x: 520, k: "T", i: 0 },
    { x: 640, k: "X", i: 3, ctl: 2 }, { x: 760, k: "H", i: 1 }, { x: 760, k: "X", i: 4, ctl: 3 },
    { x: 900, k: "M", i: 0 }, { x: 900, k: "M", i: 1 }, { x: 900, k: "M", i: 2 }, { x: 900, k: "M", i: 3 }, { x: 900, k: "M", i: 4 },
  ];
  const cur = 200 + ((f * 70) % 800);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} r={60} a={0.18} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        {Array.from({ length: q }, (_, i) => (
          <line key={i} x1={170} y1={y(i)} x2={1000} y2={y(i)} stroke={C.ink} strokeWidth={3} />
        ))}
        {gates.map((g, j) => {
          const lit = g.x < cur;
          const col = lit ? C.white : C.blue;
          if (g.k === "X" && g.ctl !== undefined)
            return (
              <g key={j}>
                <line x1={g.x} y1={y(g.ctl)} x2={g.x} y2={y(g.i)} stroke={col} strokeWidth={4} />
                <circle cx={g.x} cy={y(g.ctl)} r={13} fill={col} />
                <circle cx={g.x} cy={y(g.i)} r={34} fill={C.bg} stroke={col} strokeWidth={4} />
                <line x1={g.x - 34} y1={y(g.i)} x2={g.x + 34} y2={y(g.i)} stroke={col} strokeWidth={4} />
                <line x1={g.x} y1={y(g.i) - 34} x2={g.x} y2={y(g.i) + 34} stroke={col} strokeWidth={4} />
              </g>
            );
          if (g.k === "M")
            return (
              <g key={j}>
                <rect x={g.x - 42} y={y(g.i) - 42} width={84} height={84} fill={C.bg} stroke={C.violet} strokeWidth={4} />
                <path d={`M ${g.x - 26} ${y(g.i) + 18} A 28 28 0 0 1 ${g.x + 26} ${y(g.i) + 18}`} stroke={C.lilac} strokeWidth={4} fill="none" />
                <line x1={g.x} y1={y(g.i) + 18} x2={g.x + 22} y2={y(g.i) - 22} stroke={C.white} strokeWidth={4} />
              </g>
            );
          return (
            <g key={j}>
              <rect x={g.x - 44} y={y(g.i) - 44} width={88} height={88} fill={lit ? "rgba(47,140,255,0.35)" : C.bg} stroke={col} strokeWidth={4} />
              <text x={g.x} y={y(g.i) + 13} textAnchor="middle" fill={C.white} fontFamily={MONO} fontWeight={700} fontSize={g.k === "Rz" ? 30 : 38}>
                {g.k}
              </text>
            </g>
          );
        })}
        <line x1={cur} y1={420} x2={cur} y2={y(q - 1) + 100} stroke={C.cyan} strokeWidth={3} strokeDasharray="10 8" />
      </svg>
      {Array.from({ length: q }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 70, top: y(i) - 32 }}>
          <Tex n="ket0" em={58} color={C.cyan} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, display: "flex", justifyContent: "center" }}>
        <Tex n="bell" em={fitEm("bell", 700, 64)} color={C.dim} />
      </div>
    </AbsoluteFill>
  );
};

/* 49. Wave function: harmonic-oscillator eigenstates in their potential well, phases rotating. */
export const WaveFunction: Shot = ({ f }) => {
  const herm = (n: number, x: number) => {
    let h0 = 1;
    let h1 = 2 * x;
    if (n === 0) return h0;
    for (let k = 1; k < n; k++) [h0, h1] = [h1, 2 * x * h1 - 2 * k * h0];
    return h1;
  };
  const norm = [1, 0.7, 0.36, 0.15, 0.055];
  const X = (x: number) => 540 + x * 150;
  const levels = [0, 1, 2, 3, 4].map((n) => {
    const yE = 1560 - (n + 0.5) * 210;
    const pts: [number, number][] = Array.from({ length: 161 }, (_, i) => {
      const x = -3.6 + (i / 160) * 7.2;
      const psi = herm(n, x) * Math.exp(-(x * x) / 2) * norm[n];
      return [X(x), yE - psi * 95 * Math.cos(f * 0.5 * (n + 0.5))];
    });
    return { yE, pts, n };
  });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <path d={path(Array.from({ length: 81 }, (_, i) => { const x = -3.4 + (i / 80) * 6.8; return [X(x), 1560 - x * x * 105]; }))} fill="none" stroke={C.white} strokeWidth={5} strokeOpacity={0.9} />
        {levels.map((l) => (
          <g key={l.n}>
            <line x1={X(-3.6)} y1={l.yE} x2={X(3.6)} y2={l.yE} stroke={C.faint} strokeWidth={2} strokeDasharray="8 8" />
            <path d={path(l.pts)} fill="none" stroke={l.n % 2 ? C.violet : C.cyan} strokeWidth={5} style={{ filter: glow(l.n % 2 ? C.violet : C.blue, 8) }} />
            <text x={1010} y={l.yE + 9} textAnchor="end" fill={C.dim} fontFamily={MONO} fontSize={24}>
              {`n=${l.n}`}
            </text>
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", filter: glow(C.violet, 12) }}>
        <Tex n="wave" em={fitEm("wave", 820, 110)} />
      </div>
    </AbsoluteFill>
  );
};

/* 50. Quantum superposition: Bloch sphere, precessing state vector with ghosts. */
export const Superposition: Shot = ({ f }) => {
  const cx = 540;
  const cy = 860;
  const R = 330;
  const tilt = 0.32;
  const vec = (th: number, ph: number): [number, number] => {
    const x = Math.sin(th) * Math.cos(ph);
    const y = Math.sin(th) * Math.sin(ph);
    const z = Math.cos(th);
    return [cx + x * R, cy - z * R * Math.cos(tilt) + y * R * Math.sin(tilt)];
  };
  const th = 1.05;
  const ph = f * 0.32;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={45} r={45} a={0.25} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 6) }}>
        <circle cx={cx} cy={cy} r={R} fill="rgba(47,140,255,0.06)" stroke={C.blue} strokeWidth={4} />
        <ellipse cx={cx} cy={cy} rx={R} ry={R * Math.sin(tilt)} fill="none" stroke={C.blue} strokeOpacity={0.7} strokeWidth={3} />
        <ellipse cx={cx} cy={cy} rx={R * 0.5} ry={R} fill="none" stroke={C.blue} strokeOpacity={0.35} strokeWidth={2} transform={`rotate(${f * 4} ${cx} ${cy})`} />
        <line x1={cx} y1={cy - R - 40} x2={cx} y2={cy + R + 40} stroke={C.dim} strokeWidth={2} />
        <line x1={cx - R - 40} y1={cy} x2={cx + R + 40} y2={cy} stroke={C.dim} strokeWidth={2} />
        {Array.from({ length: 10 }, (_, k) => {
          const [x, y] = vec(th, ph - k * 0.22);
          return <line key={k} x1={cx} y1={cy} x2={x} y2={y} stroke={C.violet} strokeOpacity={0.5 - k * 0.045} strokeWidth={4} />;
        })}
        {(() => {
          const [x, y] = vec(th, ph);
          return (
            <>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={C.white} strokeWidth={7} />
              <circle cx={x} cy={y} r={16} fill={C.white} style={{ filter: glow(C.cyan, 12) }} />
            </>
          );
        })()}
        <circle cx={cx} cy={cy - R * Math.cos(tilt)} r={10} fill={C.cyan} />
        <circle cx={cx} cy={cy + R * Math.cos(tilt)} r={10} fill={C.cyan} />
      </svg>
      <div style={{ position: "absolute", left: cx + 24, top: cy - R - 110 }}>
        <Tex n="ket0" em={64} color={C.cyan} />
      </div>
      <div style={{ position: "absolute", left: cx + 24, top: cy + R + 30 }}>
        <Tex n="ket1" em={64} color={C.cyan} />
      </div>
      <div style={{ position: "absolute", left: vec(th, ph)[0] + 26, top: vec(th, ph)[1] - 90 }}>
        <Tex n="ketPsi" em={60} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center", filter: glow(C.violet, 12) }}>
        <Tex n="superposition" em={fitEm("superposition", 900, 110)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1610, display: "flex", justifyContent: "center" }}>
        <Tex n="norm" em={60} color={C.dim} />
      </div>
    </AbsoluteFill>
  );
};

/* 54. Token array: sub-word chips with their ids. */
const TOKENS = ["▁the", "▁neural", "▁net", "work", "▁learn", "s", "▁from", "▁tok", "ens", "▁at", "▁scale", "<|eot|>", "▁embed", "ding", "▁atten", "tion", "▁is", "▁all", "▁you", "▁need", "▁grad", "ient", "▁des", "cent", "▁trans", "former", "▁∑", "▁∇", "ization", "▁weights", "▁bias", "▁soft", "max", "▁layer", "▁norm", "▁GPU", "▁CUDA", "▁kern", "el", "<|bos|>", "▁quant", "um", "▁vector", "▁space", "▁infer", "ence", "▁model", "▁loss"];
export const Tokens: Shot = ({ f }) => {
  const r = rng(54);
  const rows: { t: string; id: number; w: number }[][] = [];
  let row: { t: string; id: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < 90; i++) {
    const t = TOKENS[i % TOKENS.length];
    const w = t.length * 19 + 40;
    if (x + w > 980) {
      rows.push(row);
      row = [];
      x = 0;
    }
    row.push({ t, id: Math.floor(r() * 100000), w });
    x += w + 14;
  }
  const hot = Math.floor(f * 2.5);
  let k = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `translateY(${-f * 14}px) scale(1.04)` }}>
        <div style={{ position: "absolute", left: 50, top: 200, display: "flex", flexDirection: "column", gap: 22 }}>
          {rows.map((rw, i) => (
            <div key={i} style={{ display: "flex", gap: 14 }}>
              {rw.map((tk) => {
                const idx = k++;
                const on = idx === hot % 90 || idx === (hot * 7) % 90;
                const col = [C.blue, C.violet, C.cyan, C.white][idx % 4];
                return (
                  <div key={idx} style={{ width: tk.w, padding: "10px 0", border: `3px solid ${col}`, borderRadius: 12, background: on ? col : `${col}14`, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: on ? `0 0 30px ${col}` : undefined }}>
                    <span style={{ fontFamily: MONO, fontSize: 30, color: on ? C.bg : C.ink, whiteSpace: "pre" }}>{tk.t}</span>
                    <span style={{ fontFamily: MONO, fontSize: 18, color: on ? C.bg : C.dim }}>{tk.id}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 56. Embedding vectors: each token unrolled into a 48-d colour strip. */
export const Embeddings: Shot = ({ f }) => {
  const toks = ["▁the", "▁neural", "▁net", "work", "▁learn", "s", "▁atten", "tion", "▁GPU", "▁loss", "▁vector", "▁space", "▁scale", "▁model"];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        draw={(ctx) => {
          const dims = 40;
          const cw = 17;
          ctx.font = `400 28px ${MONO}`;
          ctx.textBaseline = "middle";
          toks.forEach((t, r) => {
            const y = 300 + r * 100;
            ctx.fillStyle = "rgba(233,238,255,0.85)";
            ctx.textAlign = "right";
            ctx.fillText(t, 250, y);
            for (let c = 0; c < dims; c++) {
              const v = Math.sin(r * 1.7 + c * 0.45) * 0.6 + (hash(r * 97 + c * 3 + Math.floor(f / 2)) - 0.5) * 0.9;
              const a = Math.min(1, Math.abs(v));
              ctx.fillStyle = v > 0 ? (a > 0.8 ? `rgba(255,255,255,${a})` : `rgba(163,91,255,${a})`) : `rgba(47,140,255,${a})`;
              ctx.fillRect(280 + c * cw, y - 30, cw - 2, 60);
            }
            ctx.textAlign = "left";
            ctx.font = `400 18px ${MONO}`;
            ctx.fillStyle = "rgba(233,238,255,0.4)";
            ctx.fillText("…", 280 + dims * cw + 8, y);
            ctx.font = `400 28px ${MONO}`;
          });
          ctx.textAlign = "left";
          ctx.font = `400 22px ${MONO}`;
          ctx.fillStyle = "rgba(106,216,255,0.85)";
          ctx.fillText(`e = [${Array.from({ length: 6 }, (_, i) => (hash(i + Math.floor(f / 2)) * 2 - 1).toFixed(3)).join(", ")}, … ]  ∈ R^12288`, 60, 1790);
        }}
      />
    </AbsoluteFill>
  );
};

/* 59. Billions of parameters: the counter rolls toward 1.8T over a field of dots. */
export const Params: Shot = ({ f, d }) => {
  const t = easeOut((f + 1) / d);
  const val = Math.floor(1_000_000_000 * Math.pow(1800, t));
  const txt = val.toLocaleString("en-US").replace(/,/g, " ");
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Canvas
        w={540}
        h={960}
        draw={(ctx, w, h) => {
          const img = ctx.createImageData(w, h);
          const step = Math.max(2, 9 - t * 7);
          for (let y = 0; y < h; y += step)
            for (let x = 0; x < w; x += step) {
              const px = Math.round(x);
              const py = Math.round(y);
              const o = (py * w + px) * 4;
              const v = hash(px * 13 + py * 7 + Math.floor(f / 2));
              const dist = Math.hypot(px - w / 2, py - h / 2) / (w * 0.9);
              const a = Math.max(0, 1 - dist) * (0.4 + v * 0.6);
              const c = v > 0.92 ? [255, 255, 255] : v > 0.6 ? [163, 91, 255] : [47, 140, 255];
              img.data[o] = c[0];
              img.data[o + 1] = c[1];
              img.data[o + 2] = c[2];
              img.data[o + 3] = Math.round(255 * a);
            }
          ctx.putImageData(img, 0, 0);
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 104, letterSpacing: "-0.04em", color: C.white, fontVariantNumeric: "tabular-nums", textShadow: textGlow(C.violet, 26), background: "radial-gradient(closest-side, rgba(0,0,0,0.9), rgba(0,0,0,0))", padding: "40px 60px", whiteSpace: "nowrap" }}>{txt}</div>
      </AbsoluteFill>
      <Hud f={f} bl="fp8 · 1.8 TB" br="shards 512" />
    </AbsoluteFill>
  );
};

