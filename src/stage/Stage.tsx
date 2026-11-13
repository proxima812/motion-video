import React from "react";
import { AbsoluteFill } from "remotion";
import { WORLD } from "./layout";
import { cameraAt, stageTransform } from "./camera";

// Stageshow-style stage: everything inside is world-space and filmed by the camera.
export const Stage: React.FC<{ frame: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ frame, style, children }) => {
  const shot = cameraAt(frame);
  return (
    <AbsoluteFill style={{ perspective: 2600, ...style }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WORLD.w,
          height: WORLD.h,
          transformOrigin: "0 0",
          transform: stageTransform(shot),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
