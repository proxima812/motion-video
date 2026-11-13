import React from "react";
import { AbsoluteFill } from "remotion";
import { cameraAt } from "../stage/camera";
import { C } from "../ui/theme";

export const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const shot = cameraAt(frame);
  // Gentle parallax: background drifts at a fraction of the camera
  const px = (540 - shot.cx) * 0.12;
  const py = (880 - shot.cy) * 0.12 + Math.sin(frame / 90) * 10;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -300,
          transform: `translate(${px}px, ${py}px) scale(${0.9 + shot.s * 0.1})`,
          background: [
            "radial-gradient(600px 520px at 30% 22%, rgba(124,108,255,0.30), transparent 70%)",
            "radial-gradient(560px 600px at 78% 70%, rgba(79,140,255,0.20), transparent 70%)",
            "radial-gradient(420px 420px at 50% 95%, rgba(61,214,140,0.08), transparent 70%)",
          ].join(","),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -300,
          transform: `translate(${px * 1.6}px, ${py * 1.6}px)`,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1.2px, transparent 1.2px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(closest-side at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(closest-side at 50% 50%, black, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
