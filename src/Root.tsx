import React from "react";
import { Composition, Still } from "remotion";
import { Cover } from "./cover/Cover";
import { FableReel } from "./fable/FableReel";
import { F } from "./fable/timeline";
import { Outro, OUTRO_FRAMES, outroTotal, withOutro } from "./outro/Outro";
import { Video1 } from "./v1/Video1";
import { F as F1 } from "./v1/timeline";
import { Video3 } from "./v3/Video3";
import { F as F3 } from "./v3/timeline";
import { Video4 } from "./v4/Video4";
import { F as F4 } from "./v4/timeline";
import { Video5 } from "./v5/Video5";
import { F as F5 } from "./v5/timeline";
import { Video6 } from "./v6/Video6";
import { F as F6 } from "./v6/timeline";
import { Video7 } from "./v7/Video7";
import { F as F7 } from "./v7/timeline";
import { Video8 } from "./v8/Video8";
import { F as F8 } from "./v8/timeline";
import { Video9 } from "./v9/Video9";
import { F as F9 } from "./v9/timeline";
import { Video10 } from "./v10/Video10";
import { F as F10 } from "./v10/timeline";
import { Video11 } from "./v11/Video11";
import { F as F11 } from "./v11/timeline";
import { Video12 } from "./v12/Video12";
import { F as F12 } from "./v12/timeline";
import { Video13 } from "./v13/Video13";
import { F as F13 } from "./v13/timeline";
import { Video14 } from "./v14/Video14";
import { F as F14 } from "./v14/timeline";
import { Video15 } from "./v15/Video15";
import { F as F15 } from "./v15/timeline";
import { Video17 } from "./v17/Video17";
import { Lab17 } from "./v17/Lab";
import { F as F17 } from "./v17/timeline";
import { Video16 } from "./v16/Video16";
import { F as F16 } from "./v16/timeline";
import { Video18 } from "./v18/Video18";
import { F as F18 } from "./v18/timeline";
import { Video19, Video19Part, partLen as partLen19 } from "./v19/Video19";
import { Video19Wide } from "./v19/Video19Wide";
import { F as F19 } from "./v19/timeline";
import { Video20 } from "./v20/Video20";
import { Cover20 } from "./v20/Cover20";
import { F as F20 } from "./v20/timeline";
import { TEST_FRAMES, VideoTest } from "./v0/VideoTest";
import { AVATAR_SHOWCASE_FRAMES, AvatarShowcase } from "./playground/AvatarShowcase";
import { PLAYGROUND_ALL_FRAMES, Playground, PlaygroundAll, playgroundMetadata, playgroundSchema } from "./playground/Playground";

const V1 = withOutro(Video1, F1.duration, "ru");
const V2 = withOutro(FableReel, F.duration, "en");
const V3 = withOutro(Video3, F3.duration, "ru");
const V4 = withOutro(Video4, F4.duration, "en");
const V5 = withOutro(Video5, F5.duration, "ru");
const V6 = withOutro(Video6, F6.duration, "en");
const V7 = withOutro(Video7, F7.duration, "ru");
const V8 = withOutro(Video8, F8.duration, "en");
const V9 = withOutro(Video9, F9.duration, "ru");
const V10 = withOutro(Video10, F10.duration, "en");
const V11 = withOutro(Video11, F11.duration, "ru");
const V12 = withOutro(Video12, F12.duration, "en");
const V13 = withOutro(Video13, F13.duration, "ru", "tatarverse");
const V14 = withOutro(Video14, F14.duration, "ru", "tatarverse");
const V15 = withOutro(Video15, F15.duration, "ru", "tatarverse");
const V16 = withOutro(Video16, F16.duration, "ru", "tatarverse-tataro");
const V17 = withOutro(Video17, F17.duration, "ru");
const V18 = withOutro(Video18, F18.duration, "ru", "tatarverse");
const V19 = withOutro(Video19, F19.duration, "ru", "tatarverse");
const V19Parts = ([1, 2, 3] as const).map((n) => ({ n, len: partLen19(n), C: withOutro(Video19Part(n), partLen19(n), "ru", "tatarverse") }));
const V19Wide = withOutro(Video19Wide, F19.duration, "ru", "tatarverse");
const VTest = withOutro(VideoTest, TEST_FRAMES, "ru", "tatarverse");

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={FableReel} width={1080} height={1920} fps={60} durationInFrames={F.duration} />
    <Composition id="V1" component={V1} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F1.duration)} />
    <Composition id="V2" component={V2} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F.duration)} />
    <Composition id="V3" component={V3} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F3.duration)} />
    <Composition id="V4" component={V4} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F4.duration)} />
    <Composition id="V5" component={V5} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F5.duration)} />
    <Composition id="V6" component={V6} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F6.duration)} />
    <Composition id="V7" component={V7} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F7.duration)} />
    <Composition id="V8" component={V8} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F8.duration)} />
    <Composition id="V9" component={V9} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F9.duration)} />
    <Composition id="V10" component={V10} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F10.duration)} />
    <Composition id="V11" component={V11} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F11.duration)} />
    <Composition id="V12" component={V12} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F12.duration)} />
    <Composition id="V13" component={V13} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F13.duration)} />
    <Composition id="V14" component={V14} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F14.duration)} />
    <Composition id="V15" component={V15} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F15.duration)} />
    <Composition id="V16" component={V16} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F16.duration)} />
    <Composition id="Lab17" component={Lab17} width={1080} height={1920} fps={60} durationInFrames={600} defaultProps={{ name: "hook" }} />
    <Composition id="V17" component={V17} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F17.duration)} />
    <Composition id="V18" component={V18} width={1920} height={1080} fps={60} durationInFrames={outroTotal(F18.duration)} />
    <Composition id="V19" component={V19} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F19.duration)} />
    {V19Parts.map(({ n, len, C }) => (
      <Composition key={n} id={`V19P${n}`} component={C} width={1080} height={1920} fps={60} durationInFrames={outroTotal(len)} />
    ))}
    <Composition id="V20" component={Video20} width={1080} height={1920} fps={60} durationInFrames={F20.duration} />
    <Composition id="V19Wide" component={V19Wide} width={1920} height={1080} fps={60} durationInFrames={outroTotal(F19.duration)} />
    <Composition id="VTest" component={VTest} width={1080} height={1920} fps={60} durationInFrames={outroTotal(TEST_FRAMES)} />
    <Composition id="Playground" component={Playground} schema={playgroundSchema} calculateMetadata={playgroundMetadata} width={1080} height={1920} fps={60} durationInFrames={300} defaultProps={{
      name: "tactile-badges" as const,
      safeZone: true,
      title: true,
    }} />
    <Composition id="AvatarShowcase" component={AvatarShowcase} width={1080} height={1920} fps={60} durationInFrames={AVATAR_SHOWCASE_FRAMES} />
    <Composition id="PlaygroundAll" component={PlaygroundAll} width={1080} height={1920} fps={60} durationInFrames={PLAYGROUND_ALL_FRAMES} />
    <Composition id="Outro" component={Outro} width={1080} height={1920} fps={60} durationInFrames={OUTRO_FRAMES} defaultProps={{ lang: "ru" as const }} />
    <Still id="Cover" component={Cover} width={1080} height={1920} defaultProps={{ title: "Заголовок", description: "Короткое описание темы" }} />
    <Still id="Cover20" component={Cover20} width={1080} height={1920} />
    <Still id="CoverWide" component={Cover} width={1920} height={1080} defaultProps={{ title: "Заголовок", description: "Короткое описание темы" }} />
  </>
);
