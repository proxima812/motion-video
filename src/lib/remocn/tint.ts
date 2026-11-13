// Project helper: one-hue palettes for Remocn components. tint(hex, amt) mixes the color toward white (amt > 0)
// or black (amt < 0), so gradients built from the accent stay in its hue (e.g. all violet).
export const tint = (hex: string, amt: number): string => {
  const v = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  const to = amt >= 0 ? 255 : 0;
  const k = Math.min(1, Math.abs(amt));
  return `#${ch.map((c) => Math.round(c + (to - c) * k).toString(16).padStart(2, "0")).join("")}`;
};
/** Light-to-dark ramp of the accent: [palest, light, accent, deep] */
export const ramp4 = (accent: string) => [tint(accent, 0.85), tint(accent, 0.45), accent, tint(accent, -0.55)] as const;
