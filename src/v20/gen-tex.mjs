// TeX -> self-contained SVG paths for video 20 (no runtime fonts): node src/v20/gen-tex.mjs
// Needs mathjax-full in node_modules (one-off: `bun add -d mathjax-full`, not a project dependency).
import { writeFileSync } from "node:fs";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

const F = {
  // math
  euler: String.raw`e^{i\pi} + 1 = 0`,
  eulerFull: String.raw`e^{i\theta} = \cos\theta + i\sin\theta`,
  gauss: String.raw`\int_{-\infty}^{\infty} e^{-x^{2}}\,dx = \sqrt{\pi}`,
  fourier: String.raw`\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\,e^{-2\pi i x\xi}\,dx`,
  stokes: String.raw`\oint_{\partial\Sigma}\mathbf{F}\cdot d\mathbf{r} = \iint_{\Sigma}(\nabla\times\mathbf{F})\cdot d\mathbf{S}`,
  volume: String.raw`\iiint_{V}\nabla\cdot\mathbf{F}\,dV`,
  chain: String.raw`\frac{\partial\mathcal{L}}{\partial w_{ij}} = \frac{\partial\mathcal{L}}{\partial a_{j}}\,\frac{\partial a_{j}}{\partial z_{j}}\,\frac{\partial z_{j}}{\partial w_{ij}}`,
  sigmoidD: String.raw`\frac{d}{dx}\sigma(x) = \sigma(x)\bigl(1-\sigma(x)\bigr)`,
  limit: String.raw`f'(x) = \lim_{h\to 0}\frac{f(x+h)-f(x)}{h}`,
  jacobian: String.raw`J = \begin{bmatrix} \frac{\partial f_1}{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n} \\ \vdots & \ddots & \vdots \\ \frac{\partial f_m}{\partial x_1} & \cdots & \frac{\partial f_m}{\partial x_n} \end{bmatrix}`,
  einsum: String.raw`C_{ijk} = \sum_{l} A_{il}\,B_{ljk}`,
  cp: String.raw`\mathcal{T} = \sum_{r=1}^{R} \lambda_r\, \mathbf{a}_r \otimes \mathbf{b}_r \otimes \mathbf{c}_r`,
  // nets
  neuron: String.raw`y = \varphi\Bigl(\sum_{i=1}^{n} w_i x_i + b\Bigr)`,
  delta: String.raw`\delta^{l} = \bigl((W^{l+1})^{\top}\delta^{l+1}\bigr)\odot\sigma'(z^{l})`,
  gradW: String.raw`\frac{\partial \mathcal{L}}{\partial W^{l}} = \delta^{l}\,(a^{l-1})^{\top}`,
  dLdw: String.raw`\frac{\partial\mathcal{L}}{\partial w}`,
  // attention
  attention: String.raw`\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V`,
  softmax: String.raw`\mathrm{softmax}(z)_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}`,
  multihead: String.raw`\mathrm{MultiHead}(Q,K,V) = \mathrm{Concat}(\mathrm{head}_1,\ldots,\mathrm{head}_h)\,W^{O}`,
  qkt: String.raw`QK^{\top}`,
  posenc: String.raw`PE_{(pos,2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right)`,
  layernorm: String.raw`y = \frac{x-\mathrm{E}[x]}{\sqrt{\mathrm{Var}[x]+\epsilon}}\cdot\gamma+\beta`,
  // training
  gd: String.raw`\theta_{t+1} = \theta_{t} - \eta\,\nabla_{\theta}\mathcal{L}(\theta_{t})`,
  adam: String.raw`\begin{aligned} m_t &= \beta_1 m_{t-1} + (1-\beta_1)\,g_t \\ v_t &= \beta_2 v_{t-1} + (1-\beta_2)\,g_t^{2} \\ \hat{m}_t &= \frac{m_t}{1-\beta_1^{t}} \qquad \hat{v}_t = \frac{v_t}{1-\beta_2^{t}} \\ \theta_t &= \theta_{t-1} - \alpha\,\frac{\hat{m}_t}{\sqrt{\hat{v}_t}+\epsilon} \end{aligned}`,
  crossEntropy: String.raw`\mathcal{L} = -\sum_{i} y_i \log \hat{y}_i`,
  // physics / quantum
  maxwell: String.raw`\begin{aligned} \nabla\cdot\mathbf{E} &= \frac{\rho}{\varepsilon_0} \\ \nabla\cdot\mathbf{B} &= 0 \\ \nabla\times\mathbf{E} &= -\frac{\partial\mathbf{B}}{\partial t} \\ \nabla\times\mathbf{B} &= \mu_0\mathbf{J} + \mu_0\varepsilon_0\frac{\partial\mathbf{E}}{\partial t} \end{aligned}`,
  schrodinger: String.raw`i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \left[-\frac{\hbar^{2}}{2m}\nabla^{2} + V(\mathbf{r},t)\right]\Psi(\mathbf{r},t)`,
  hamiltonian: String.raw`\hat{H}\,|\psi\rangle = E\,|\psi\rangle`,
  wave: String.raw`\psi(x,t) = A\,e^{i(kx-\omega t)}`,
  born: String.raw`P(x) = |\psi(x,t)|^{2}`,
  superposition: String.raw`|\psi\rangle = \alpha|0\rangle + \beta|1\rangle`,
  norm: String.raw`|\alpha|^{2} + |\beta|^{2} = 1`,
  bell: String.raw`|\Phi^{+}\rangle = \frac{1}{\sqrt{2}}\bigl(|00\rangle + |11\rangle\bigr)`,
  ket0: String.raw`|0\rangle`,
  ket1: String.raw`|1\rangle`,
  ketPsi: String.raw`|\psi\rangle`,
  // single symbols / labels
  Q: String.raw`Q`,
  K: String.raw`K`,
  Kt: String.raw`K^{\top}`,
  V: String.raw`V`,
  otimes: String.raw`\otimes`,
  eq: String.raw`=`,
  x1: String.raw`x_1`,
  x2: String.raw`x_2`,
  x3: String.raw`x_3`,
  xn: String.raw`x_n`,
  sum: String.raw`\Sigma`,
  phi: String.raw`\varphi`,
  y: String.raw`y`,
  w1: String.raw`w_1`,
  w2: String.raw`w_2`,
  w3: String.raw`w_3`,
  wn: String.raw`w_n`,
  bias: String.raw`b`,
  v1: String.raw`\vec{v}_1`,
  v2: String.raw`\vec{v}_2`,
  v3: String.raw`\vec{v}_3`,
  axX: String.raw`x`,
  axY: String.raw`y`,
  axZ: String.raw`z`,
  // the wall of everything
  einstein: String.raw`G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^{4}}T_{\mu\nu}`,
  navier: String.raw`\rho\left(\frac{\partial\mathbf{u}}{\partial t} + \mathbf{u}\cdot\nabla\mathbf{u}\right) = -\nabla p + \mu\nabla^{2}\mathbf{u} + \mathbf{f}`,
  bayes: String.raw`P(A\mid B) = \frac{P(B\mid A)\,P(A)}{P(B)}`,
  kl: String.raw`D_{\mathrm{KL}}(P\,\|\,Q) = \sum_{x} P(x)\log\frac{P(x)}{Q(x)}`,
  zeta: String.raw`\zeta(s) = \sum_{n=1}^{\infty}\frac{1}{n^{s}} = \prod_{p}\frac{1}{1-p^{-s}}`,
  taylor: String.raw`f(x) = \sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(x-a)^{n}`,
  cauchy: String.raw`\oint_{\gamma}\frac{f(z)}{z-a}\,dz = 2\pi i\,f(a)`,
  lagrange: String.raw`\frac{d}{dt}\frac{\partial L}{\partial\dot{q}} - \frac{\partial L}{\partial q} = 0`,
  gaussian: String.raw`\mathcal{N}(x\mid\mu,\sigma^{2}) = \frac{1}{\sigma\sqrt{2\pi}}\,e^{-\frac{(x-\mu)^{2}}{2\sigma^{2}}}`,
  elbo: String.raw`\log p(x) \geq \mathbb{E}_{q(z\mid x)}\bigl[\log p(x\mid z)\bigr] - D_{\mathrm{KL}}\bigl(q(z\mid x)\,\|\,p(z)\bigr)`,
  svd: String.raw`A = U\Sigma V^{\top}`,
  eigen: String.raw`\det(A-\lambda I) = 0`,
  relu: String.raw`\mathrm{ReLU}(x) = \max(0,x)`,
  entropy: String.raw`H(X) = -\sum_{x} p(x)\log_2 p(x)`,
  emc2: String.raw`E = mc^{2}`,
  heisenberg: String.raw`\Delta x\,\Delta p \geq \frac{\hbar}{2}`,
  dirac: String.raw`(i\gamma^{\mu}\partial_{\mu} - m)\psi = 0`,
  convolution: String.raw`(f * g)(t) = \int_{-\infty}^{\infty} f(\tau)\,g(t-\tau)\,d\tau`,
  diffusion: String.raw`q(x_t\mid x_{t-1}) = \mathcal{N}\bigl(x_t;\sqrt{1-\beta_t}\,x_{t-1},\beta_t\mathbf{I}\bigr)`,
  scaling: String.raw`L(N) = \left(\frac{N_c}{N}\right)^{\alpha_N}`,
  partition: String.raw`Z = \sum_{i} e^{-\beta E_i}`,
};

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const doc = mathjax.document("", { InputJax: new TeX({ packages: AllPackages }), OutputJax: new SVG({ fontCache: "none" }) });

const out = {};
for (const [k, tex] of Object.entries(F)) {
  const node = doc.convert(tex, { display: true });
  const svg = adaptor.innerHTML(node);
  const vb = svg.match(/viewBox="([^"]+)"/)[1];
  const body = svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replace(/ data-(mml-node|c|mjx-texclass|latex)="[^"]*"/g, "")
    .replace(/<title[^>]*>.*?<\/title>/g, "");
  if (body.includes("<use")) throw new Error(`${k}: font cache refs left`);
  out[k] = { vb, body };
}
const ts = `// Generated by src/v20/gen-tex.mjs (MathJax 3 SVG, glyphs as paths, fill = currentColor). Do not edit.\n` +
  `export const TEX = ${JSON.stringify(out)} as const;\nexport type TexName = keyof typeof TEX;\n`;
writeFileSync(new URL("./tex.ts", import.meta.url), ts);
console.log(`tex.ts: ${Object.keys(out).length} formulas, ${(ts.length / 1024).toFixed(0)} KB`);
