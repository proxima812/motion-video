import React from "react";
import { SPRING, springAt } from "../stage/motion";

// Rolling digits: each changed digit springs from its old value to the new one.
export const Odometer: React.FC<{
  from: string;
  to: string;
  frame: number;
  start: number;
  stagger?: number;
  lineHeight: number;
}> = ({ from, to, frame, start, stagger = 3, lineHeight }) => {
  let digitIndex = 0;
  return (
    <span style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums" }}>
      {to.split("").map((ch, i) => {
        const prev = from[i] ?? ch;
        if (!/\d/.test(ch) || !/\d/.test(prev)) {
          return <span key={i}>{frame >= start ? ch : prev}</span>;
        }
        const t = springAt(frame, start + digitIndex++ * stagger, SPRING.bouncy);
        const pos = Number(prev) + (Number(ch) - Number(prev)) * t;
        return (
          <span key={i} style={{ display: "inline-block", height: lineHeight, lineHeight: `${lineHeight}px`, overflow: "hidden", position: "relative" }}>
            <span style={{ visibility: "hidden" }}>0</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${-pos * lineHeight}px)`,
              }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} style={{ height: lineHeight, lineHeight: `${lineHeight}px` }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};
