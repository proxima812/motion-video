import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, H, Haze, Hud, MONO, W, glow, hash, rng, type Shot } from "./kit";

/* 41. Twisted DNA: double helix spinning, base pairs as rungs. */
export const Dna: Shot = ({ f }) => {
  const n = 46;
  const items: { z: number; el: React.ReactNode }[] = [];
  const A: [number, number, number][] = [];
  const B: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const y = -120 + i * 48;
    const a = i * 0.42 + f * 0.22;
    const R = 240;
    A.push([540 + Math.cos(a) * R, y, Math.sin(a)]);
    B.push([540 + Math.cos(a + Math.PI) * R, y, Math.sin(a + Math.PI)]);
  }
  const pal = [C.blue, C.violet, C.cyan, C.white];
  for (let i = 0; i < n; i++) {
    const z = (A[i][2] + B[i][2]) / 2;
    const k = Math.floor(hash(i * 7) * 4);
    const mx = (A[i][0] + B[i][0]) / 2;
    items.push({
      z,
      el: (
        <g key={`r${i}`} opacity={0.45 + 0.55 * (A[i][2] > 0 ? 1 : 0.5)}>
          <line x1={A[i][0]} y1={A[i][1]} x2={mx} y2={A[i][1]} stroke={pal[k]} strokeWidth={9} strokeLinecap="round" />
          <line x1={mx} y1={B[i][1]} x2={B[i][0]} y2={B[i][1]} stroke={pal[(k + 2) % 4]} strokeWidth={9} strokeLinecap="round" />
        </g>
      ),
    });
  }
  const strand = (P: [number, number, number][], front: boolean, color: string, key: string) => {
    const segs: React.ReactNode[] = [];
    for (let i = 0; i < P.length - 1; i++) {
      const z = (P[i][2] + P[i + 1][2]) / 2;
      if (front !== z > 0) continue;
      segs.push(<line key={`${key}${i}`} x1={P[i][0]} y1={P[i][1]} x2={P[i + 1][0]} y2={P[i + 1][1]} stroke={color} strokeWidth={front ? 16 : 10} strokeOpacity={front ? 1 : 0.4} strokeLinecap="round" />);
    }
    return segs;
  };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} r={60} a={0.18} />
      <svg width={W} height={H} style={{ position: "absolute", transform: "rotate(-16deg) scale(1.15)", filter: glow(C.blue, 8) }}>
        {strand(A, false, C.blue, "ab")}
        {strand(B, false, C.violet, "bb")}
        {items.sort((a, b) => b.z - a.z).map((it) => it.el)}
        {strand(A, true, C.white, "af")}
        {strand(B, true, C.lilac, "bf")}
      </svg>
      <div style={{ position: "absolute", right: 60, top: 160, fontFamily: MONO, fontSize: 26, lineHeight: 1.25, color: C.dim, textAlign: "right", whiteSpace: "pre" }}>
        {Array.from({ length: 36 }, (_, i) => Array.from({ length: 6 }, (_, j) => "ACGT"[Math.floor(hash(i * 6 + j + Math.floor(f / 2) * 3) * 4)]).join("")).join("\n")}
      </div>
    </AbsoluteFill>
  );
};

/* 42. Brain scan: axial MRI slice with folded cortex, scan line, an activation hot spot. */
export const BrainScan: Shot = ({ f, d }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const cx = 540;
        const cy = 930;
        // th = 0 points right, -PI/2 is the front (top of frame)
        const shape = (th: number, k: number, mode: "skull" | "cortex" | "white") => {
          const rx = 330 * k;
          const ry = 430 * k;
          const base = ((rx * ry) / Math.hypot(ry * Math.cos(th), rx * Math.sin(th))) * (1 + 0.05 * Math.sin(th));
          if (mode === "skull") return base;
          if (mode === "cortex") return base * (1 + 0.012 * Math.sin(th * 22 + 0.7) + 0.008 * Math.sin(th * 37 + 2.1) + 0.006 * Math.sin(th * 9 + 4));
          const finger = Math.abs(Math.sin(th * 14 + 0.6 * Math.sin(th * 5))) - 0.55;
          return base * (1 + 0.09 * finger + 0.02 * Math.sin(th * 31 + 1.3));
        };
        const pathOf = (k: number, mode: "skull" | "cortex" | "white") => {
          ctx.beginPath();
          for (let i = 0; i <= 900; i++) {
            const th = (i / 900) * Math.PI * 2;
            const r = shape(th, k, mode);
            const x = cx + Math.cos(th) * r;
            const y = cy + Math.sin(th) * r;
            if (i) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
          ctx.closePath();
        };
        // skull ring + CSF gap
        pathOf(1.12, "skull");
        ctx.fillStyle = "rgba(233,238,255,0.85)";
        ctx.fill();
        pathOf(1.075, "skull");
        ctx.fillStyle = "#04060E";
        ctx.fill();
        // grey matter
        pathOf(1.03, "cortex");
        const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, 460);
        g.addColorStop(0, "rgba(120,140,210,0.95)");
        g.addColorStop(1, "rgba(70,90,175,0.95)");
        ctx.fillStyle = g;
        ctx.fill();
        // white matter with gyri
        pathOf(0.84, "white");
        ctx.fillStyle = "rgba(196,208,245,0.95)";
        ctx.fill();
        // thalami
        ctx.fillStyle = "rgba(120,140,210,0.9)";
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(cx + sx * 70, cy + 60, 58, 80, sx * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
        // midline fissure
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 470);
        ctx.bezierCurveTo(cx + 8, cy - 200, cx - 8, cy + 200, cx, cy + 470);
        ctx.stroke();
        // ventricles
        ctx.fillStyle = "rgba(6,8,24,0.95)";
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(cx + sx * 34, cy - 80, 22, 120, sx * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx + sx * 120, cy + 170, 16, 60, -sx * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        // activation blob
        const pulse = 0.6 + 0.4 * Math.sin(f * 0.9);
        const act = ctx.createRadialGradient(cx + 170, cy - 170, 0, cx + 170, cy - 170, 130);
        act.addColorStop(0, `rgba(255,255,255,${pulse})`);
        act.addColorStop(0.35, `rgba(163,91,255,${0.8 * pulse})`);
        act.addColorStop(1, "rgba(163,91,255,0)");
        ctx.fillStyle = act;
        ctx.fillRect(cx - 100, cy - 440, 540, 540);
        // scan line
        const sy = cy - 520 + (f / d) * 1040;
        const sl = ctx.createLinearGradient(0, sy - 60, 0, sy + 4);
        sl.addColorStop(0, "rgba(106,216,255,0)");
        sl.addColorStop(1, "rgba(106,216,255,0.55)");
        ctx.fillStyle = sl;
        ctx.fillRect(0, sy - 60, W, 64);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, sy, W, 3);
        // crosshair + ticks
        ctx.strokeStyle = "rgba(106,216,255,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, cy);
        ctx.lineTo(1020, cy);
        ctx.moveTo(cx, 360);
        ctx.lineTo(cx, 1500);
        ctx.stroke();
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.moveTo(80, 420 + i * 26);
          ctx.lineTo(i % 5 ? 96 : 110, 420 + i * 26);
          ctx.stroke();
        }
      }}
    />
    <Hud f={f} tl={"T2 FLAIR\nslice 042 / 128"} tr={"3.0 T\nTR 9000 TE 81"} bl="L" br="R" />
  </AbsoluteFill>
);

/* brain silhouette (side view) for 44 */
const inBrain = (x: number, y: number) => {
  const e = (cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  return e(540, 880, 420, 300) || e(470, 1040, 300, 150) || e(780, 1110, 150, 105) || (x > 640 && x < 715 && y > 1080 && y < 1400);
};
const BRAIN = (() => {
  const r = rng(44);
  const pts: [number, number][] = [];
  while (pts.length < 520) {
    const x = 100 + r() * 880;
    const y = 560 + r() * 860;
    if (inBrain(x, y)) pts.push([x, y]);
  }
  const edges: [number, number][] = [];
  pts.forEach((p, i) => {
    const near = pts.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j] as const).sort((a, b) => a[0] - b[0]).slice(1, 4);
    near.forEach(([dd, j]) => dd < 95 && j > i && edges.push([i, j]));
  });
  return { pts, edges };
})();

/* 44. Digital brain: a point-cloud brain wired to its neighbours, signals firing. */
export const DigitalBrain: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Haze color={C.blue} y={48} r={55} a={0.22} />
    <AbsoluteFill style={{ transform: `scale(${1.05 + f * 0.01}) rotate(${-2 + f * 0.2}deg)` }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.blue, 7) }}>
        {BRAIN.edges.map(([a, b], i) => {
          const hot = hash(i + Math.floor(f / 2) * 31) > 0.93;
          return <line key={i} x1={BRAIN.pts[a][0]} y1={BRAIN.pts[a][1]} x2={BRAIN.pts[b][0]} y2={BRAIN.pts[b][1]} stroke={hot ? C.white : i % 5 === 0 ? C.violet : C.blue} strokeOpacity={hot ? 1 : 0.5} strokeWidth={hot ? 3 : 1.6} />;
        })}
        {BRAIN.pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={hash(i + f) > 0.9 ? 6 : 3} fill={hash(i * 3) > 0.8 ? C.lilac : C.cyan} />
        ))}
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* 45. Synapses: presynaptic bouton releasing transmitter across the cleft. */
export const Synapse: Shot = ({ f }) => {
  const r = rng(45);
  const ves = Array.from({ length: 34 }, () => ({ x: 340 + r() * 400, y: 420 + r() * 380, s: 18 + r() * 16 }));
  const parts = Array.from({ length: 140 }, (_, i) => {
    const t = ((f * 0.06 + hash(i)) % 1 + 1) % 1;
    return { x: 300 + hash(i + 3) * 480 + Math.sin(t * 9 + i) * 14, y: 900 + t * 200, o: 1 - t * 0.6 };
  });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={52} r={45} a={0.25} />
      <svg width={W} height={H} style={{ position: "absolute", filter: glow(C.violet, 8) }}>
        <path d="M 380 -40 C 380 200, 220 320, 230 600 C 240 820, 380 900, 540 900 C 700 900, 840 820, 850 600 C 860 320, 700 200, 700 -40" fill="rgba(47,140,255,0.12)" stroke={C.blue} strokeWidth={8} />
        {ves.map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={v.s} fill="none" stroke={i % 3 ? C.lilac : C.white} strokeWidth={4} />
        ))}
        <path d="M 120 1110 C 300 1080, 780 1080, 960 1110 L 1000 1980 L 80 1980 Z" fill="rgba(163,91,255,0.12)" stroke={C.violet} strokeWidth={8} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={250 + i * 42} y={1086 + Math.abs(i - 6.5) * 2} width={20} height={34} rx={6} fill={hash(i + Math.floor(f / 3)) > 0.5 ? C.white : C.violet} />
        ))}
        {parts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill={i % 2 ? C.cyan : C.white} opacity={p.o} />
        ))}
        {Array.from({ length: 6 }, (_, i) => {
          const a = -0.4 + i * 0.16;
          return <path key={`d${i}`} d={`M 540 1200 C ${540 + Math.sin(a) * 300} 1400, ${540 + Math.sin(a) * 600} 1600, ${540 + Math.sin(a) * 900} 1960`} stroke={C.violet} strokeOpacity={0.4} strokeWidth={6} fill="none" />;
        })}
      </svg>
      <Hud f={f} tl="Ca²⁺ influx" tr="cleft 20 nm" br="EPSP +#" />
    </AbsoluteFill>
  );
};
