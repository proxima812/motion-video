import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, Canvas, hash, rng, type Shot } from "./kit";
import { F, HITS, SLOTS, STEP, energy } from "./timeline";
import { Binary, ChaosTerminal, CppCode, Cuda, ErrorShot, HexDump, JsonArrays, NumberMatrix, PythonLines, PythonTrain, RustCode, Terminal } from "./shots-code";
import { Adam, AttentionFormula, Derivatives, Euler, InfiniteFormulas, Integrals, Matrix100, MatrixOverlay, Maxwell, QKt, Schrodinger, Softmax, Tensors } from "./shots-math";
import { Architecture, ArtificialNeuron, AttnHeatmap, Backprop, CompGraph, ConnectionBurst, Connections, DenseNet, KnowledgeGraph, NeuronLayers, Transformer } from "./shots-nets";
import { Clusters3D, Collapse, FractalTunnel, GeoChaos, GridBreak, Mandelbrot, RotatingTensor, Singularity, Surface3D, Tesseract, VectorSpace } from "./shots-geo";
import { Chip32, CpuFlash, DataStreams, Fiber, GpuStreams, Lightning, Particles, ServerHall } from "./shots-hw";
import { BrainScan, DigitalBrain, Dna, Synapse } from "./shots-bio";
import { Embeddings, GradDescent, LossCurve, Params, QuantumCircuit, Superposition, Tokens, TrainDashboard, WaveFunction, WeightMatrices } from "./shots-data";
import { BlindingFlash, Black, Dot, DotToNet, Expansion, WhiteFlash } from "./shots-finale";

// AI OVERLOAD: 75 shots, one per scenario line, cut on the half-beats of AC130 (see timeline.ts).
// fx: flash = white hit on a bar downbeat, glitch = sliced frame on the cut, ghost = previous shot
// screened on top (overload), invert = one negative frame on the cut.
type Fx = { flash?: boolean; glitch?: boolean; ghost?: boolean; invert?: boolean; still?: boolean };
const S = (El: Shot, name: string, fx: Fx = {}) => ({ El, name, fx });
const SHOTS = [
  S(Terminal, "terminal"), S(PythonLines, "python"), S(Binary, "binary"), S(NumberMatrix, "matrix"), S(ErrorShot, "error"),
  S(Euler, "euler", { flash: true }), S(Integrals, "integrals"), S(Derivatives, "derivatives"), S(Matrix100, "matrix-100"), S(Tensors, "tensors"),
  S(Architecture, "architecture"), S(NeuronLayers, "layers"), S(Connections, "connections"), S(Backprop, "backprop", { flash: true }), S(CompGraph, "comp-graph"),
  S(CppCode, "cpp"), S(PythonTrain, "python-train"), S(RustCode, "rust"), S(JsonArrays, "json"), S(HexDump, "hex", { glitch: true }),
  S(AttentionFormula, "attention"), S(QKt, "qkt", { flash: true }), S(Softmax, "softmax"), S(Transformer, "transformer"), S(AttnHeatmap, "heatmap"),
  S(RotatingTensor, "tensor-3d"), S(Surface3D, "surface"), S(Mandelbrot, "mandelbrot"), S(Tesseract, "tesseract"), S(GeoChaos, "geo-chaos", { flash: true, glitch: true }),
  S(GpuStreams, "gpu"), S(Chip32, "chip"), S(Cuda, "cuda"), S(Particles, "particles"), S(Lightning, "lightning"),
  S(GradDescent, "descent"), S(LossCurve, "loss"), S(WeightMatrices, "weights", { flash: true }), S(Adam, "adam"), S(TrainDashboard, "dashboard", { glitch: true }),
  S(Dna, "dna"), S(BrainScan, "brain-scan"), S(ArtificialNeuron, "neuron"), S(DigitalBrain, "digital-brain"), S(Synapse, "synapses"),
  S(Maxwell, "maxwell", { flash: true }), S(Schrodinger, "schrodinger"), S(QuantumCircuit, "circuit"), S(WaveFunction, "wave"), S(Superposition, "superposition", { glitch: true }),
  S(ServerHall, "server-hall"), S(Fiber, "fiber"), S(DataStreams, "streams"), S(Tokens, "tokens", { flash: true }), S(VectorSpace, "vectors", { glitch: true }),
  S(Embeddings, "embeddings", { ghost: true }), S(Clusters3D, "clusters", { ghost: true }), S(KnowledgeGraph, "graph-links", { ghost: true }), S(Params, "params", { ghost: true }), S(ConnectionBurst, "burst", { ghost: true, glitch: true }),
  S(InfiniteFormulas, "formulas", { ghost: true, invert: true }), S(ChaosTerminal, "chaos-terminal", { flash: true, ghost: true, glitch: true }), S(MatrixOverlay, "matrix-overlay", { ghost: true, invert: true }), S(FractalTunnel, "tunnel", { ghost: true }), S(Singularity, "singularity", { ghost: true, invert: true }),
  S(DenseNet, "dense-net"), S(CpuFlash, "cpu-flash", { invert: true }), S(GridBreak, "grid-break", { glitch: true }), S(Collapse, "collapse"), S(WhiteFlash, "white-flash", { still: true }),
  S(Dot, "dot", { still: true }), S(DotToNet, "dot-to-net", { still: true }), S(Expansion, "expansion"), S(BlindingFlash, "blinding-flash", { still: true }), S(Black, "black", { still: true }),
];

/** Camera: punch-in on every cut + decaying shake on kicks/snares, scaled by energy. */
const camera = (g: number, f: number, k: number, fx: Fx) => {
  if (fx.still) return { transform: undefined, rgb: 0 };
  const E = Math.max(energy(g), k === 72 ? 0.9 : 0);
  let sx = 0;
  let sy = 0;
  let rot = 0;
  let rgb = 0;
  for (const h of HITS) {
    if (h.f > g || g - h.f > 14) continue;
    const decay = Math.exp(-(g - h.f) / 4);
    const amp = (h.kind === "kick" ? 16 : 11) * E * decay;
    sx += (hash(h.f * 3.1) - 0.5) * 2 * amp;
    sy += (hash(h.f * 7.7) - 0.5) * 2 * amp;
    rot += (hash(h.f * 1.9) - 0.5) * 1.6 * E * decay;
    if (E >= 0.5) rgb = Math.max(rgb, E * 12 * Math.exp(-(g - h.f) / 2.2));
  }
  const punch = 1 + (0.04 + 0.08 * E) * Math.exp(-f / 3) + (k === 68 ? 0.25 * (f / 10) ** 2 : 0);
  return { transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${punch.toFixed(4)})`, rgb };
};

const RgbSplit: React.FC<{ o: number }> = ({ o }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="v20rgb" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feOffset in="r" dx={-o} dy={0} result="ro" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feOffset in="b" dx={o} dy={o * 0.3} result="bo" />
      <feBlend in="ro" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="bo" mode="screen" />
    </filter>
  </svg>
);

/** Horizontal slice displacement (renders the shot once per band, so only on a couple of frames). */
const Slices: React.FC<{ seed: number; render: () => React.ReactNode }> = ({ seed, render }) => {
  const r = rng(seed);
  // 4 bands (was 7 for the first two render chunks): every band is a full re-render of the shot, too heavy on an 8 GB machine
  const cuts = [0, ...Array.from({ length: 3 }, () => r()).sort(), 1];
  return (
    <>
      {cuts.slice(0, -1).map((a, i) => {
        const b = cuts[i + 1];
        const dx = (r() - 0.5) * 160 * (r() < 0.4 ? 0 : 1);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${(a * 100).toFixed(2)}% 0 ${(100 - b * 100).toFixed(2)}% 0)`, transform: `translateX(${dx.toFixed(1)}px)` }}>
            {render()}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const ShotFrame: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  const slot = SLOTS[k];
  const { El, fx } = SHOTS[k];
  const g = slot.from + f;
  const cam = camera(g, f, k, fx);
  const prev = k > 0 ? SHOTS[k - 1] : null;
  const glitch = fx.glitch && f < 2;
  const invert = fx.invert && f === 0;
  const filters = [cam.rgb > 0.6 ? "url(#v20rgb)" : "", invert ? "invert(1) hue-rotate(180deg)" : ""].filter(Boolean).join(" ");
  const body = () => <El f={f} d={slot.dur} />;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {cam.rgb > 0.6 && <RgbSplit o={cam.rgb} />}
      <AbsoluteFill style={{ transform: cam.transform, filter: filters || undefined }}>
        {glitch ? <Slices seed={k * 31 + f} render={body} /> : body()}
        {fx.ghost && prev && (
          <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.24, transform: "scale(1.1)" }}>
            <prev.El f={SLOTS[k - 1].dur - 1} d={SLOTS[k - 1].dur} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {fx.flash && f < 3 && <AbsoluteFill style={{ background: "#fff", opacity: [0.85, 0.4, 0.12][f] }} />}
    </AbsoluteFill>
  );
};

/** Film grain + scanlines + vignette; off on the white and black finale frames. */
const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= F.black || (frame >= F.blind + 9 && frame < F.black) || (frame >= F.flash && frame < F.flash + 3)) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Canvas
        w={270}
        h={480}
        style={{ opacity: 0.12 + 0.08 * energy(frame), mixBlendMode: "overlay", imageRendering: "pixelated" }}
        draw={(ctx, w, h) => {
          const img = ctx.createImageData(w, h);
          const r = rng(frame * 7919 + 13);
          for (let i = 0; i < w * h; i++) {
            const v = r() * 255;
            img.data[i * 4] = v;
            img.data[i * 4 + 1] = v;
            img.data[i * 4 + 2] = v;
            img.data[i * 4 + 3] = 255;
          }
          ctx.putImageData(img, 0, 0);
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      {frame < F.flash && <AbsoluteFill style={{ background: "#fff", opacity: 0.035 * Math.exp(-(frame % STEP) / 1.5) * energy(frame) }} />}
    </AbsoluteFill>
  );
};

export const Video20: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SLOTS.map((s, k) => (
      <Sequence key={k} from={s.from} durationInFrames={s.dur} name={`${k + 1} ${SHOTS[k].name}`}>
        <ShotFrame k={k} />
      </Sequence>
    ))}
    <Overlays />
    <Audio src={staticFile("v20/music/bed.wav")} volume={1} />
  </AbsoluteFill>
);

export const SHOT_COUNT = SHOTS.length;
