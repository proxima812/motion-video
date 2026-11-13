import React from "react";
import { CARD, CHART, COL, KPI, WIN, slotPos } from "../stage/layout";
import { GRAB, cursorAt } from "../stage/cursorPath";
import { SPRING, lerp, progress, springAt, tween } from "../stage/motion";
import { T } from "../stage/timeline";
import { Chart } from "./Chart";
import { Odometer } from "./Odometer";
import { C } from "./theme";

// Staggered build-in for each block of the interface
const build = (frame: number, index: number): React.CSSProperties => {
  const t = springAt(frame, 14 + index * T.buildStagger, SPRING.smooth);
  return {
    opacity: Math.min(1, t * 1.4),
    transform: `translateY(${(1 - t) * 34}px)`,
    filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 10)}px)` : undefined,
  };
};

const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 22,
      boxSizing: "border-box",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 11px",
      borderRadius: 999,
      background: C.greenBg,
      color: C.green,
      fontSize: 17,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {children}
  </span>
);

const Sparkline: React.FC<{ frame: number }> = ({ frame }) => {
  const d = "M0 52 C 30 48, 50 30, 80 36 S 130 50, 160 34 S 220 16, 250 22 S 320 6, 350 4";
  const draw = tween(frame, 40, 130, 0, 1);
  return (
    <svg width={350} height={60} style={{ position: "absolute", left: 32, bottom: 26, overflow: "visible" }}>
      <defs>
        <linearGradient id="spark" x1="0" x2="1">
          <stop offset="0" stopColor={C.green} stopOpacity={0.2} />
          <stop offset="1" stopColor={C.green} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#spark)" strokeWidth={3.5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
    </svg>
  );
};

const MiniBars: React.FC<{ frame: number }> = ({ frame }) => {
  const bars = [30, 44, 38, 52, 48, 62, 58, 70];
  const extra = springAt(frame, T.metricsUpdate + 8, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: 32, bottom: 26, display: "flex", gap: 10, alignItems: "flex-end", height: 60 }}>
      {bars.map((h, i) => {
        const t = springAt(frame, 50 + i * 4, SPRING.smooth);
        const hh = i === bars.length - 1 ? h + extra * 14 : h;
        return (
          <div
            key={i}
            style={{
              width: 28,
              height: Math.max(0, hh * (60 / 84) * t),
              borderRadius: 6,
              background: i === bars.length - 1 ? C.accent : "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}
    </div>
  );
};

type Deal = { id: string; name: string; amount: string; tag: string; color: string; due: string; owner: string };

const DEALS: Record<string, Deal> = {
  acme: { id: "acme", name: "Acme Corp", amount: "$12,400", tag: "Enterprise", color: "#7C6CFF", due: "Nov 18", owner: "#F59E8B" },
  northwind: { id: "northwind", name: "Northwind", amount: "$8,900", tag: "Growth", color: "#4F8CFF", due: "Nov 22", owner: "#8BD3F5" },
  globex: { id: "globex", name: "Globex", amount: "$6,200", tag: "Starter", color: "#F5B94F", due: "Dec 02", owner: "#B79BFF" },
  initech: { id: "initech", name: "Initech", amount: "$18,000", tag: "Enterprise", color: "#3DD68C", due: "Closed", owner: "#F5D48B" },
  hooli: { id: "hooli", name: "Hooli", amount: "$9,800", tag: "Growth", color: "#FF6B9A", due: "Closed", owner: "#9BE7C4" },
};

const DealCard: React.FC<{ deal: Deal; won: boolean; style?: React.CSSProperties }> = ({ deal, won, style }) => (
  <div
    style={{
      position: "absolute",
      width: CARD.w,
      height: CARD.h,
      boxSizing: "border-box",
      borderRadius: 16,
      background: C.panelHi,
      border: `1px solid ${C.border}`,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: deal.color,
          display: "grid",
          placeItems: "center",
          color: "#0C0D11",
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        {deal.name[0]}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: C.text, flex: 1, whiteSpace: "nowrap" }}>{deal.name}</div>
      <div style={{ fontSize: 21, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{deal.amount}</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 15, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 10px" }}>{deal.tag}</span>
      <span style={{ fontSize: 15, color: won ? C.green : C.dim, flex: 1 }}>{won ? "● Won" : deal.due}</span>
      <span style={{ width: 26, height: 26, borderRadius: 13, background: deal.owner, border: `2px solid ${C.panelHi}` }} />
    </div>
  </div>
);

const cardPos = (frame: number, from: { x: number; y: number }, to: { x: number; y: number }, at: number) => {
  const t = springAt(frame, at, SPRING.snappy);
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
};

const Column: React.FC<{ x: number; title: string; count: React.ReactNode; dot: string; highlight: number; style: React.CSSProperties }> = ({
  x,
  title,
  count,
  dot,
  highlight,
  style,
}) => (
  <Panel
    x={x}
    y={COL.y}
    w={COL.w}
    h={COL.h}
    style={{
      ...style,
      background: `color-mix(in srgb, ${C.panel}, ${C.accent} ${highlight * 7}%)`,
      borderColor: `color-mix(in srgb, ${C.border}, ${C.accent} ${highlight * 60}%)`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 22px", fontSize: 19, fontWeight: 600, color: C.text }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: dot }} />
      {title}
      <span style={{ color: C.dim, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </div>
  </Panel>
);

export const AppWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const b = (i: number) => build(frame, i);
  const cursor = cursorAt(frame);

  // KPI hover (cursor resting on MRR card)
  const hover = springAt(frame, T.hoverKpi - 8, SPRING.smooth) * (1 - springAt(frame, T.toPipeline + 8, SPRING.smooth));
  const updated = frame >= T.metricsUpdate;
  const flash = progress(frame, T.metricsUpdate, T.metricsUpdate + 20) * (1 - progress(frame, T.metricsUpdate + 40, T.metricsUpdate + 110));

  // Pipeline choreography
  const lift = springAt(frame, T.press, SPRING.snappy) * (1 - springAt(frame, T.release, SPRING.snappy));
  const overB = tween(frame, T.dragStart + 36, T.dragStart + 50, 0, 1) * (1 - tween(frame, T.release, T.release + 30, 0, 1));
  const placeholder = tween(frame, T.dragStart + 44, T.dragStart + 58, 0, 1) * (frame < T.release ? 1 : 0);

  let acme: { x: number; y: number };
  if (frame < T.dragStart) acme = slotPos("a", 0);
  else if (frame < T.release) acme = { x: cursor.x - GRAB.x, y: cursor.y - GRAB.y };
  else {
    const releasedAt = cursorAt(T.release - 1);
    acme = cardPos(frame, { x: releasedAt.x - GRAB.x, y: releasedAt.y - GRAB.y }, slotPos("b", 0), T.release);
  }

  const cards: Array<{ deal: Deal; pos: { x: number; y: number }; won: boolean }> = [
    { deal: DEALS.northwind, pos: cardPos(frame, slotPos("a", 1), slotPos("a", 0), T.dragStart + 8), won: false },
    { deal: DEALS.globex, pos: cardPos(frame, slotPos("a", 2), slotPos("a", 1), T.dragStart + 12), won: false },
    { deal: DEALS.initech, pos: cardPos(frame, slotPos("b", 0), slotPos("b", 1), T.dragStart + 44), won: true },
    { deal: DEALS.hooli, pos: cardPos(frame, slotPos("b", 1), slotPos("b", 2), T.dragStart + 48), won: true },
  ];
  const colBuild = [b(5), b(6)];

  return (
    <div
      style={{
        position: "absolute",
        left: WIN.x,
        top: WIN.y,
        width: WIN.w,
        height: WIN.h,
        borderRadius: 34,
        background: C.window,
        border: `1px solid ${C.borderHi}`,
        boxShadow: "0 80px 160px -40px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div style={{ ...b(0), position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", padding: "0 28px", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "rgba(255,255,255,0.14)" }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", fontSize: 18, color: C.muted, fontWeight: 500 }}>
          Orbit <span style={{ color: C.dim, margin: "0 8px" }}>/</span> <span style={{ color: C.text }}>Revenue</span>
        </div>
        <span style={{ fontSize: 15, color: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 9px" }}>⌘K</span>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: "linear-gradient(135deg,#F59E8B,#7C6CFF)", marginLeft: 8 }} />
      </div>

      {/* Header */}
      <div style={{ ...b(1), position: "absolute", left: 36, right: 36, top: 96, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 46, fontWeight: 600, color: C.text, letterSpacing: -1.2, lineHeight: 1.1 }}>Revenue</div>
          <div style={{ fontSize: 19, color: C.muted, marginTop: 8 }}>
            <span style={{ color: C.green }}>●</span> Live · updated just now
          </div>
        </div>
        <div style={{ display: "flex", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, fontSize: 17, fontWeight: 500 }}>
          {["7D", "30D", "12M"].map((l) => (
            <span key={l} style={{ padding: "8px 16px", borderRadius: 9, color: l === "12M" ? C.text : C.muted, background: l === "12M" ? "rgba(255,255,255,0.08)" : "transparent" }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* KPI: MRR */}
      <Panel
        x={KPI.ax}
        y={KPI.y}
        w={KPI.w}
        h={KPI.h}
        style={{
          ...b(2),
          borderColor: `color-mix(in srgb, ${C.border}, ${C.accent} ${Math.max(hover * 70, flash * 50)}%)`,
          boxShadow: `0 0 ${60 * Math.max(hover, flash)}px -10px ${C.accent}`,
        }}
      >
        <div style={{ position: "absolute", left: 32, top: 28, fontSize: 19, color: C.muted, fontWeight: 500 }}>MRR</div>
        <div style={{ position: "absolute", right: 28, top: 26 }}>
          <Badge>
            ↑&nbsp;<Odometer from="12.4" to="14.6" frame={frame} start={T.metricsUpdate + 16} lineHeight={20} />%
          </Badge>
        </div>
        <div style={{ position: "absolute", left: 32, top: 64, fontSize: 58, fontWeight: 600, color: C.text, letterSpacing: -1.6, lineHeight: "70px" }}>
          $<Odometer from="84,210" to="96,610" frame={frame} start={T.metricsUpdate} lineHeight={70} />
        </div>
        <Sparkline frame={frame} />
      </Panel>
      {/* "+$12,400" floating confirmation */}
      {updated && (
        <div
          style={{
            position: "absolute",
            left: KPI.ax + 92,
            top: KPI.y + 40 - 16 * springAt(frame, T.metricsUpdate, SPRING.smooth),
            opacity: Math.min(springAt(frame, T.metricsUpdate, SPRING.smooth), 1 - progress(frame, T.metricsUpdate + 90, T.metricsUpdate + 120)),
          }}
        >
          <Badge style={{ background: "rgba(61,214,140,0.18)", fontSize: 18 }}>+$12,400</Badge>
        </div>
      )}

      {/* KPI: Deals */}
      <Panel x={KPI.bx} y={KPI.y} w={KPI.w} h={KPI.h} style={b(3)}>
        <div style={{ position: "absolute", left: 32, top: 28, fontSize: 19, color: C.muted, fontWeight: 500 }}>Closed deals</div>
        <div style={{ position: "absolute", right: 28, top: 26 }}>
          <Badge style={{ background: "rgba(124,108,255,0.14)", color: "#A99FFF" }}>This month</Badge>
        </div>
        <div style={{ position: "absolute", left: 32, top: 64, fontSize: 58, fontWeight: 600, color: C.text, letterSpacing: -1.6, lineHeight: "70px" }}>
          <Odometer from="128" to="129" frame={frame} start={T.metricsUpdate + 6} lineHeight={70} />
        </div>
        <MiniBars frame={frame} />
      </Panel>

      {/* Chart */}
      <Panel x={CHART.x} y={CHART.y} w={CHART.w} h={CHART.h} style={b(4)}>
        <Chart frame={frame} />
      </Panel>

      {/* Pipeline columns */}
      <Column x={COL.ax} title="In review" dot="#F5B94F" highlight={0} style={colBuild[0]} count={frame >= T.dragStart + 6 ? 2 : 3} />
      <Column x={COL.bx} title="Closed won" dot={C.green} highlight={overB} style={colBuild[1]} count={frame >= T.release ? 3 : 2} />

      {/* Drop placeholder */}
      <div
        style={{
          position: "absolute",
          left: slotPos("b", 0).x,
          top: slotPos("b", 0).y,
          width: CARD.w,
          height: CARD.h,
          boxSizing: "border-box",
          borderRadius: 16,
          border: `2px dashed rgba(124,108,255,${0.6 * placeholder})`,
          background: `rgba(124,108,255,${0.06 * placeholder})`,
        }}
      />

      {cards.map(({ deal, pos, won }, i) => (
        <DealCard key={deal.id} deal={deal} won={won} style={{ left: pos.x, top: pos.y, ...colBuild[i < 2 ? 0 : 1] }} />
      ))}

      {/* Dragged card on top */}
      <DealCard
        deal={DEALS.acme}
        won={frame >= T.release + 10}
        style={{
          left: acme.x,
          top: acme.y,
          ...colBuild[0],
          transform: `${colBuild[0].transform ?? ""} scale(${1 + lift * 0.05}) rotate(${-2.5 * lift}deg)`,
          boxShadow: `0 ${30 * lift}px ${60 * lift}px -10px rgba(0,0,0,${0.7 * lift}), 0 0 0 ${lift > 0.01 ? 1 : 0}px rgba(124,108,255,${0.6 * lift})`,
          zIndex: 5,
        }}
      />
    </div>
  );
};
