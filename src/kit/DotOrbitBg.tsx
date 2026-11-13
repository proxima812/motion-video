import React, { useCallback, useState } from "react";
import { DotOrbit } from "@paper-design/shaders-react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";

// Default light background for every reel: paper.design Dot Orbit
// (shaders.paper.design/dot-orbit#colors=faf5fa,ffffff57&colorBack=ffffff&stepsPerColor=3&size=1&sizeRange=0.72&spreading=1&speed=2.1&scale=0.72),
// driven by the Remotion frame so renders are deterministic.
export const DotOrbitBg: React.FC<{ speed?: number }> = ({ speed = 2.1 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("dot-orbit"));
  const gate = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
    },
    [handle],
  );
  return (
    <div ref={gate} style={{ position: "absolute", inset: 0 }}>
      <DotOrbit
        speed={0}
        frame={(frame / fps) * speed * 1000}
        colors={["#faf5fa", "#ffffff57"]}
        colorBack="#ffffff"
        stepsPerColor={3}
        size={1}
        sizeRange={0.72}
        spreading={1}
        scale={0.72}
        fit="cover"
        width={width}
        height={height}
      />
    </div>
  );
};
