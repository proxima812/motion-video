// World is 1080×1920. The app window lives inside it; UI is laid out in window-local px.
export const WORLD = { w: 1080, h: 1920 };
export const WIN = { x: 80, y: 250, w: 920, h: 1420 };
export const PAD = 36;

export const KPI = { y: 200, h: 230, w: 414, ax: 36, bx: 470 };
export const CHART = { x: 36, y: 450, w: 848, h: 360 };
export const COL = { y: 830, h: 554, w: 414, ax: 36, bx: 470, header: 64 };
export const CARD = { w: 390, h: 118, gap: 12, inset: 12 };

export const slotPos = (col: "a" | "b", index: number) => ({
  x: (col === "a" ? COL.ax : COL.bx) + CARD.inset,
  y: COL.y + COL.header + index * (CARD.h + CARD.gap),
});

export const toWorld = (p: { x: number; y: number }) => ({ x: p.x + WIN.x, y: p.y + WIN.y });
