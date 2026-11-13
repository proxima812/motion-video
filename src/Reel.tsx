import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./scenes/Background";
import { Captions } from "./scenes/Captions";
import { Logo } from "./scenes/Logo";
import { Cursor } from "./stage/Cursor";
import { Stage } from "./stage/Stage";
import { progress } from "./stage/motion";
import { SFX, T, VO } from "./stage/timeline";
import { AppWindow } from "./ui/AppWindow";
import { fontFamily } from "./ui/theme";

// Duck the music bed under each voice line
const musicVolume = (f: number) => {
  const ducked = VO.some((v) => f >= v.from - 10 && f < v.from + 170);
  const base = ducked ? 0.16 : 0.32;
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [T.duration - 40, T.duration], [1, 0], { extrapolateLeft: "clamp" });
  return base * fadeIn * fadeOut;
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const uiOut = progress(frame, T.uiFadeStart, T.uiFadeEnd);

  return (
    <AbsoluteFill style={{ fontFamily, WebkitFontSmoothing: "antialiased" }}>
      <Background frame={frame} />
      <Stage frame={frame} style={{ opacity: 1 - uiOut, filter: uiOut > 0 ? `blur(${uiOut * 14}px)` : undefined }}>
        <AppWindow frame={frame} />
      </Stage>
      <Cursor frame={frame} />
      <Captions frame={frame} />
      <Logo frame={frame} />

      <Audio src={staticFile("music/bed.mp3")} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.src} from={v.from} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s) => (
        <Sequence key={s.src} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
