import React from "react";
import { WIN } from "./layout";
import { cursorAt } from "./cursorPath";
import { cameraAt, project } from "./camera";
import { progress } from "./motion";
import { T } from "./timeline";

// Screen-space cursor: follows world positions but keeps a constant on-screen size.
export const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  const c = cursorAt(frame);
  if (c.visible <= 0.001) return null;
  const p = project(cameraAt(frame), { x: c.x + WIN.x, y: c.y + WIN.y });
  const ripple = progress(frame, T.press, T.press + 30);
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, opacity: Math.min(1, c.visible), pointerEvents: "none" }}>
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: -40 * (0.4 + ripple),
            top: -40 * (0.4 + ripple),
            width: 80 * (0.4 + ripple),
            height: 80 * (0.4 + ripple),
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.8)",
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width={54}
        height={54}
        viewBox="0 0 24 24"
        style={{
          transform: `translate(-6px, -4px) scale(${(0.6 + 0.4 * Math.min(c.visible, 1)) * (1 - 0.14 * c.press)})`,
          transformOrigin: "6px 4px",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))",
        }}
      >
        <path d="M5.5 3.2v16.1c0 .5.6.7.9.4l3.9-4 2.6 5.8c.2.4.6.5 1 .4l1.8-.8c.4-.2.5-.6.4-1l-2.6-5.7h5.6c.5 0 .7-.6.4-.9L6.4 2.8c-.3-.3-.9-.1-.9.4z" fill="#fff" stroke="#0C0D11" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
