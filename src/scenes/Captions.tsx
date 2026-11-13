import React from "react";
import { SPRING, progress, springAt } from "../stage/motion";
import { CAPTIONS } from "../stage/timeline";
import { C, fontFamily } from "../ui/theme";

// Sound-off captions inside the Reels top safe zone
export const Captions: React.FC<{ frame: number }> = ({ frame }) => {
  const cap = CAPTIONS.find((c) => frame >= c.from - 2 && frame < c.to + 18);
  if (!cap) return null;
  const inT = springAt(frame, cap.from, SPRING.smooth);
  const out = progress(frame, cap.to, cap.to + 18);
  const words = cap.text.split(" ");
  const shown = Math.min(1, inT * 1.3) * (1 - out);
  return (
    <>
    {/* Top scrim keeps the caption legible over busy UI */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 480, opacity: shown, background: "linear-gradient(rgba(7,8,11,0.92) 0%, rgba(7,8,11,0.75) 45%, rgba(7,8,11,0) 100%)" }} />
    <div style={{ position: "absolute", top: 214, left: 60, right: 60, display: "flex", justifyContent: "center", fontFamily }}>
      <div
        style={{
          padding: "18px 30px",
          borderRadius: 999,
          background: "#121318",
          border: `1px solid ${C.borderHi}`,
          backdropFilter: "blur(24px)",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)",
          fontSize: 38,
          fontWeight: 600,
          letterSpacing: -0.6,
          color: C.text,
          whiteSpace: "nowrap",
          opacity: shown,
          transform: `translateY(${(1 - inT) * 24 - out * 12}px) scale(${0.96 + 0.04 * inT})`,
        }}
      >
        {words.map((w, i) => {
          const t = springAt(frame, cap.from + 3 + i * 3, SPRING.smooth);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: i < words.length - 1 ? "0.26em" : 0, opacity: Math.min(1, t), filter: `blur(${Math.max(0, (1 - t) * 6)}px)` }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
    </>
  );
};
