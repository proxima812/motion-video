import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, Code, Grid, H, Haze, Hud, MONO, W, hash, rng, textGlow, type Shot } from "./kit";

/* 1. Blinking terminal: boot log, the training command types itself, block cursor blinks on the 8ths. */
export const Terminal: Shot = ({ f }) => {
  const cmd = "python3 train.py --params 1.8T";
  const typed = cmd.slice(0, Math.min(cmd.length, Math.floor(f * 3.2)));
  const on = Math.floor(f / 5.23) % 2 === 0;
  const log: [string, string][] = [
    ["omega-os 7.4.1 tty1", C.dim],
    ["[  OK  ] 8192 GPUs online", C.ink],
    ["[  OK  ] NVLink fabric 1.8 PB/s", C.ink],
    ["[  OK  ] weights mapped 3.6 TB", C.ink],
    ["[  OK  ] tokenizer 200064 vocab", C.ink],
    ["[ WAIT ] warming kernels ...", C.cyan],
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.deep} y={58} r={70} a={0.18} />
      <div style={{ position: "absolute", left: 70, right: 50, top: 640, fontFamily: MONO, fontSize: 43, lineHeight: 1.65, whiteSpace: "pre", textShadow: textGlow("#2F8CFF", 10) }}>
        {log.map(([t, c], i) => (
          <div key={i} style={{ color: c }}>
            {t.startsWith("[") ? (
              <>
                <span style={{ color: t.includes("OK") ? C.blue : C.violet, fontWeight: 700 }}>{t.slice(0, 8)}</span>
                {t.slice(8)}
              </>
            ) : (
              t
            )}
          </div>
        ))}
        <div style={{ height: 30 }} />
        <div style={{ color: C.white, fontSize: 46, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: C.blue, fontWeight: 700 }}>omega</span>
          <span style={{ color: C.dim }}>:~$&nbsp;</span>
          <span>{typed}</span>
          <span style={{ display: "inline-block", width: 28, height: 52, marginLeft: 4, background: on ? C.white : "transparent", boxShadow: on ? `0 0 18px ${C.blue}, 0 0 40px ${C.blue}` : undefined }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PY_ATTN = `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class CausalSelfAttention(nn.Module):
    def __init__(self, d_model=12288, n_heads=96):
        super().__init__()
        self.qkv = nn.Linear(d_model, 3 * d_model)
        self.proj = nn.Linear(d_model, d_model)
        self.n_heads = n_heads

    def forward(self, x, mask):
        B, T, C = x.shape
        q, k, v = self.qkv(x).split(C, dim=2)
        q = q.view(B, T, self.n_heads, -1).transpose(1, 2)
        k = k.view(B, T, self.n_heads, -1).transpose(1, 2)
        v = v.view(B, T, self.n_heads, -1).transpose(1, 2)
        att = (q @ k.transpose(-2, -1)) / math.sqrt(k.size(-1))
        att = att.masked_fill(mask[:, :, :T, :T] == 0, float("-inf"))
        att = F.softmax(att, dim=-1)
        y = (att @ v).transpose(1, 2).contiguous().view(B, T, C)
        return self.proj(y)

class Block(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.ln1 = nn.LayerNorm(d_model)
        self.attn = CausalSelfAttention(d_model, n_heads)
        self.ln2 = nn.LayerNorm(d_model)
        self.mlp = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model),
        )

    def forward(self, x, mask):
        x = x + self.attn(self.ln1(x), mask)
        return x + self.mlp(self.ln2(x))`;

/* 2. Python lines: a transformer block scrolling fast. */
export const PythonLines: Shot = ({ f, d }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Haze color={C.deep} x={30} y={40} r={70} a={0.16} />
    <Code src={PY_ATTN} lang="py" size={33} y={120 - (f / d) * 520} x={40} hl={18 + Math.floor(f / 3)} />
  </AbsoluteFill>
);

/* 3. Binary code: falling columns of bits, a few hot ones. */
export const Binary: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Canvas
      draw={(ctx) => {
        const size = 34;
        const cw = size * 0.6 + 6;
        const lh = size * 1.18;
        const cols = Math.ceil(W / cw);
        const rows = Math.ceil(H / lh) + 2;
        ctx.font = `700 ${size}px ${MONO}`;
        ctx.textBaseline = "top";
        for (let c = 0; c < cols; c++) {
          const speed = 6 + hash(c) * 26;
          const off = (f * speed + hash(c + 9) * 900) % lh;
          const head = Math.floor((f * speed) / lh + hash(c + 3) * rows) % (rows + 12);
          for (let r = -1; r < rows; r++) {
            const cell = Math.floor((f * speed) / lh) - r;
            const bit = hash(c * 977 + cell * 131) > 0.5 ? "1" : "0";
            const dist = head - r;
            let a = 0.16 + hash(c * 31 + cell) * 0.18;
            let col = "233,238,255";
            if (dist >= 0 && dist < 14) a = 0.95 - dist * 0.06;
            if (dist === 0) col = "255,255,255";
            else if (dist > 0 && dist < 14) col = dist < 4 ? "106,216,255" : "47,140,255";
            ctx.fillStyle = `rgba(${col},${a})`;
            ctx.fillText(bit, c * cw + 4, r * lh + off);
          }
        }
      }}
    />
  </AbsoluteFill>
);

/* 4. Number matrix: a bracketed float matrix being computed. */
export const NumberMatrix: Shot = ({ f, d }) => {
  const rows = 21;
  const cols = 4;
  const z = 1 + (f / d) * 0.08;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Haze color={C.violet} y={50} r={60} a={0.12} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${z})` }}>
        <div style={{ position: "relative", padding: "30px 46px", fontFamily: MONO, fontSize: 40, lineHeight: 1.6, whiteSpace: "pre" }}>
          {["left", "right"].map((side) => (
            <div key={side} style={{ position: "absolute", top: 0, bottom: 0, [side]: 0, width: 26, border: `4px solid ${C.ink}`, [side === "left" ? "borderRight" : "borderLeft"]: "none", boxShadow: `0 0 16px ${C.blue}` }} />
          ))}
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: "flex", gap: 36 }}>
              {Array.from({ length: cols }, (_, c) => {
                const v = (hash(r * 13 + c * 71 + Math.floor(f / 2) * (r % 3 === 0 ? 1 : 0)) * 4 - 2).toFixed(4);
                const hot = Math.floor(f * 2.4) % rows === r;
                const col = hot ? C.white : c === Math.floor(f / 3) % cols ? C.cyan : C.dim;
                return (
                  <span key={c} style={{ color: col, textShadow: hot ? textGlow(C.blue, 16) : undefined, width: "7ch", textAlign: "right" }}>
                    {Number(v) >= 0 ? " " + v : v}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 5. Red ERROR: OOM traceback, the word tears apart on the hits. */
export const ErrorShot: Shot = ({ f }) => {
  const hit = (at: number) => Math.max(0, 1 - Math.abs(f - at) / 3);
  const g = Math.max(hit(0), hit(11), hit(21), 0.25);
  const bands = 7;
  const word = (dx: number, color: string, op: number, key: string, clip?: string) => (
    <div key={key} style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 250, letterSpacing: "-0.02em", color, opacity: op, transform: `translateX(${dx}px)`, clipPath: clip, textShadow: color === C.red ? textGlow(C.red, 26) : undefined }}>
      ERROR
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `rgb(${Math.round(20 + 50 * g)},0,${Math.round(6 + 6 * g)})` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,46,77,0.35), transparent 60%)" }} />
      {word(-18 * g, "#00E1FF", 0.55 * g, "c")}
      {word(14 * g, C.white, 0.5 * g, "w")}
      {Array.from({ length: bands }, (_, i) => {
        const top = (i / bands) * 100;
        const dx = (hash(i * 7 + Math.floor(f / 2)) - 0.5) * 120 * g;
        return word(dx, C.red, 1, `b${i}`, `inset(${top}% 0 ${100 - top - 100 / bands}% 0)`);
      })}
      <div style={{ position: "absolute", left: 90, right: 60, top: 1010, fontFamily: MONO, fontSize: 31, lineHeight: 1.55, whiteSpace: "pre", color: "rgba(255,170,180,0.85)" }}>
        {`Traceback (most recent call last):
  File "train.py", line 412, in <module>
    loss.backward()
  File "torch/autograd/__init__.py", line 266
`}
        <span style={{ color: C.red, fontWeight: 700, textShadow: textGlow(C.red, 12) }}>{"RuntimeError: CUDA out of memory\n"}</span>
        {`Tried to allocate 2.00 TiB
GPU 0 has 80.00 GiB total capacity
step 184467 | loss nan | grad_norm inf`}
      </div>
      <Hud f={f} tl="SIGABRT 0x6" tr="core dumped" color="rgba(255,120,140,0.7)" />
    </AbsoluteFill>
  );
};

const CPP = `#include <vector>
#include <cmath>
#include <immintrin.h>

template <typename T, std::size_t Rank>
struct Tensor {
  std::vector<T> data;
  std::array<std::size_t, Rank> shape;

  T& operator()(std::size_t n, std::size_t c,
                std::size_t h, std::size_t w) {
    return data[((n * shape[1] + c) * shape[2] + h)
                * shape[3] + w];
  }
};

void gemm(const float* A, const float* B, float* C,
          int M, int N, int K) {
  #pragma omp parallel for collapse(2)
  for (int i = 0; i < M; ++i)
    for (int j = 0; j < N; j += 8) {
      __m256 acc = _mm256_setzero_ps();
      for (int k = 0; k < K; ++k)
        acc = _mm256_fmadd_ps(_mm256_set1_ps(A[i * K + k]),
                              _mm256_loadu_ps(&B[k * N + j]), acc);
      _mm256_storeu_ps(&C[i * N + j], acc);
    }
}`;

/* 16. C++: tilted editor, SIMD gemm. */
export const CppCode: Shot = ({ f, d }) => (
  <AbsoluteFill style={{ background: C.bg, perspective: 1400 }}>
    <Haze color={C.blue} x={60} y={45} r={65} a={0.16} />
    <AbsoluteFill style={{ transform: `rotateY(${-16 + (f / d) * 6}deg) rotateX(6deg) translateZ(${f * 6}px)`, transformOrigin: "30% 50%" }}>
      <Code src={CPP} lang="cpp" size={31} x={30} y={300 - f * 14} hl={20} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const PY_TRAIN = `model = Transformer(n_layers=128, d_model=16384).cuda()
model = torch.compile(FSDP(model, mixed_precision=bf16))
opt = torch.optim.AdamW(model.parameters(), lr=3e-4,
                        betas=(0.9, 0.95), weight_decay=0.1)
sched = CosineWarmup(opt, warmup=2000, total=1_000_000)

for step, (x, y) in enumerate(loader):
    with torch.autocast("cuda", dtype=torch.bfloat16):
        logits = model(x)
        loss = F.cross_entropy(logits.view(-1, V), y.view(-1))
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    sched.step()
    opt.zero_grad(set_to_none=True)
    if step % 100 == 0:
        print(f"step {step:>7} | loss {loss.item():.4f}")
    if step % 5000 == 0:
        save(model, f"ckpt/omega_{step:07d}.pt")`;

/* 17. Python again: the training loop, big and close. */
export const PythonTrain: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Haze color={C.violet} x={20} y={60} r={70} a={0.14} />
    <AbsoluteFill style={{ transform: `scale(${1.32 - f * 0.012})`, transformOrigin: "0% 50%" }}>
      <Code src={PY_TRAIN} lang="py" size={30} x={20} y={520 - f * 9} hl={9} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const RUST = `use rayon::prelude::*;
use std::sync::Arc;

pub struct Linear {
    weight: Tensor<f32>,
    bias: Option<Tensor<f32>>,
}

impl Layer for Linear {
    fn forward(&self, x: &Tensor<f32>) -> Result<Tensor<f32>, Error> {
        let out = x.matmul(&self.weight.t()?)?;
        match &self.bias {
            Some(b) => Ok(out.broadcast_add(b)?),
            None => Ok(out),
        }
    }
}

pub fn softmax(x: &mut [f32]) {
    let max = x.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
    let sum: f32 = x.iter_mut().map(|v| { *v = (*v - max).exp(); *v }).sum();
    x.par_iter_mut().for_each(|v| *v /= sum);
}

fn main() -> Result<(), Error> {
    let model = Arc::new(Model::load("omega.safetensors")?);
    let tokens: Vec<u32> = tokenizer.encode(prompt)?;
    let logits = model.forward(&Tensor::new(&tokens)?)?;
    Ok(())
}`;

/* 18. Rust: tilted the other way. */
export const RustCode: Shot = ({ f, d }) => (
  <AbsoluteFill style={{ background: C.bg, perspective: 1300 }}>
    <Haze color={C.deep} x={40} y={55} r={65} a={0.18} />
    <AbsoluteFill style={{ transform: `rotateY(${14 - (f / d) * 5}deg) rotateZ(-2deg)`, transformOrigin: "70% 50%" }}>
      <Code src={RUST} lang="rs" size={30} x={0} y={220 - f * 12} hl={20} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* 19. JSON arrays: weights dump. */
export const JsonArrays: Shot = ({ f }) => {
  const r = rng(19);
  const row = () => "[" + Array.from({ length: 5 }, () => (r() * 2 - 1).toFixed(4).padStart(7)).join(", ") + ", ...]";
  const src = `{
  "model": "omega-1.8T",
  "n_layers": 128,
  "d_model": 16384,
  "vocab_size": 200064,
  "layers.0.attn.q_proj.weight": [
${Array.from({ length: 9 }, row).map((s) => "    " + s + ",").join("\n")}
  ],
  "layers.0.attn.k_proj.weight": [
${Array.from({ length: 9 }, row).map((s) => "    " + s + ",").join("\n")}
  ],
  "tokens": [15496, 11, 995, 0, 1374, 389, 220, 50256]
}`;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid step={48} a={0.06} />
      <AbsoluteFill style={{ transform: `scale(${1.05 + f * 0.006})` }}>
        <Code src={src} lang="json" size={30} x={10} y={250 - f * 6} num={1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 20. Hexadecimal dump: xxd of the weights file, dense. */
export const HexDump: Shot = ({ f }) => {
  const r = rng(20);
  const lines = Array.from({ length: 64 }, (_, i) => {
    const bytes = Array.from({ length: 16 }, () => Math.floor(r() * 256));
    const hex = bytes.map((b) => b.toString(16).padStart(2, "0"));
    const ascii = bytes.map((b) => (b > 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
    return { off: (0x7f3a00 + i * 16).toString(16).padStart(8, "0"), hex, ascii };
  });
  const hot = Math.floor(f * 3) % 64;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${1.25 - f * 0.012}) rotate(-3deg)` }}>
        <div style={{ position: "absolute", left: 20, top: -120 - f * 10, fontFamily: MONO, fontSize: 23, lineHeight: 1.45, whiteSpace: "pre" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ background: i === hot ? "rgba(47,140,255,0.2)" : undefined }}>
              <span style={{ color: C.violet }}>{l.off}</span>
              {"  "}
              {l.hex.map((b, j) => (
                <span key={j} style={{ color: (i + j) % 11 === 0 ? C.cyan : b === "00" ? "rgba(233,238,255,0.25)" : C.ink }}>
                  {b}
                  {j === 7 ? "  " : " "}
                </span>
              ))}
              <span style={{ color: C.lilac }}>{" |" + l.ascii + "|"}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CUDA = `__global__ void matmul(const half* A, const half* B,
                       float* C, int N) {
  __shared__ half As[32][32], Bs[32][32];
  int row = blockIdx.y * 32 + threadIdx.y;
  int col = blockIdx.x * 32 + threadIdx.x;
  float acc = 0.0f;
  for (int t = 0; t < N / 32; ++t) {
    As[threadIdx.y][threadIdx.x] = A[row * N + t * 32 + threadIdx.x];
    Bs[threadIdx.y][threadIdx.x] = B[(t * 32 + threadIdx.y) * N + col];
    __syncthreads();
    for (int k = 0; k < 32; ++k) acc += As[threadIdx.y][k] * Bs[k][threadIdx.x];
    __syncthreads();
  }
  C[row * N + col] = acc;
}
matmul<<<dim3(N / 32, N / 32), dim3(32, 32)>>>(A, B, C, N);`;

/* 33. CUDA: kernel on top, grid of blocks of threads below lighting up in waves. */
export const Cuda: Shot = ({ f }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{ transform: "scale(0.86)", transformOrigin: "0% 0%" }}>
      <Code src={CUDA} lang="cu" size={27} x={36} y={170} hl={10} num={false} />
    </AbsoluteFill>
    <Canvas
      draw={(ctx) => {
        const gx = 8;
        const gy = 6;
        const bw = 118;
        const x0 = (W - gx * bw) / 2;
        const y0 = 860;
        for (let by = 0; by < gy; by++)
          for (let bx = 0; bx < gx; bx++) {
            const wave = Math.sin((bx + by) * 0.9 - f * 0.9) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(47,140,255,${0.35 + wave * 0.5})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x0 + bx * bw + 6, y0 + by * bw + 6, bw - 12, bw - 12);
            for (let ty = 0; ty < 6; ty++)
              for (let tx = 0; tx < 6; tx++) {
                const on = hash(bx * 97 + by * 31 + tx * 7 + ty * 3 + Math.floor(f / 2) * 13) < 0.25 + wave * 0.6;
                ctx.fillStyle = on ? (tx === ty ? C.white : wave > 0.7 ? C.cyan : C.blue) : "rgba(233,238,255,0.1)";
                ctx.fillRect(x0 + bx * bw + 16 + tx * 15.5, y0 + by * bw + 16 + ty * 15.5, 10, 10);
              }
          }
      }}
    />
    <Hud f={f} bl={"blockIdx (3, 5)  threadIdx (17, 4)"} br="SM 07 · #" />
  </AbsoluteFill>
);

/* 62. Chaotic terminal: overlapping consoles spewing logs. */
export const ChaosTerminal: Shot = ({ f }) => {
  const r = rng(62);
  const wins = Array.from({ length: 6 }, (_, i) => ({ x: r() * 520 - 120, y: 140 + i * 280 + r() * 60, w: 640 + r() * 300, rot: (r() - 0.5) * 10, color: [C.blue, C.white, C.violet, C.red, C.cyan, C.white][i] }));
  const msgs = ["loss 0.0731 | lr 2.9e-4 | tok/s 8.4M", "allreduce 1.2 GB in 3.1 ms", "WARN grad overflow, skipping", "ckpt shard 117/512 written", "attn kernel fused: flash v3", "NaN detected in layer 93", "rebalancing experts 64 -> 128", "sync barrier 8192/8192"];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {wins.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: w.x + Math.sin(f * 2 + i) * 8, top: w.y, width: w.w, height: 300, transform: `rotate(${w.rot}deg)`, border: `2px solid ${w.color}`, background: "rgba(0,0,0,0.82)", boxShadow: `0 0 30px ${w.color}55`, overflow: "hidden", fontFamily: MONO, fontSize: 24, lineHeight: 1.45, color: w.color, padding: "34px 16px 0", whiteSpace: "pre" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 22, background: w.color, opacity: 0.85 }} />
          {Array.from({ length: 9 }, (_, j) => msgs[(j + i * 3 + f * (i + 1)) % msgs.length]).map((m, j) => (
            <div key={j} style={{ opacity: 0.55 + hash(i * 9 + j + f) * 0.45 }}>
              {"> " + m}
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
