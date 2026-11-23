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
import { Video21 } from "./v21/Video21";
import { F as F21 } from "./v21/timeline";
import { Video22 } from "./v22/Video22";
import { F as F22 } from "./v22/timeline";
import { Video23 } from "./v23/Video23";
import { F as F23 } from "./v23/timeline";
import { Video24 } from "./v24/Video24";
import { F as F24 } from "./v24/timeline";
import { Video25 } from "./v25/Video25";
import { F as F25 } from "./v25/timeline";
import { Video26 } from "./v26/Video26";
import { F as F26 } from "./v26/timeline";
import { Video27 } from "./v27/Video27";
import { F as F27 } from "./v27/timeline";
import { Video28 } from "./v28/Video28";
import { F as F28 } from "./v28/timeline";
import { Video29 } from "./v29/Video29";
import { F as F29 } from "./v29/timeline";
import { Video30 } from "./v30/Video30";
import { F as F30 } from "./v30/timeline";
import { Video31 } from "./v31/Video31";
import { F as F31 } from "./v31/timeline";
import { Video32 } from "./v32/Video32";
import { F as F32 } from "./v32/timeline";
import { Video33 } from "./v33/Video33";
import { F as F33 } from "./v33/timeline";
import { Video34 } from "./v34/Video34";
import { F as F34 } from "./v34/timeline";
import { Video35 } from "./v35/Video35";
import { F as F35 } from "./v35/timeline";
import { Video36 } from "./v36/Video36";
import { F as F36 } from "./v36/timeline";
import { Video37 } from "./v37/Video37";
import { F as F37 } from "./v37/timeline";
import { Video38 } from "./v38/Video38";
import { F as F38 } from "./v38/timeline";
import { Video39 } from "./v39/Video39";
import { F as F39 } from "./v39/timeline";
import { Video40 } from "./v40/Video40";
import { F as F40 } from "./v40/timeline";
import { Video41 } from "./v41/Video41";
import { F as F41 } from "./v41/timeline";
import { Video42 } from "./v42/Video42";
import { F as F42 } from "./v42/timeline";
import { Video43 } from "./v43/Video43";
import { F as F43 } from "./v43/timeline";
import { Video44 } from "./v44/Video44";
import { F as F44 } from "./v44/timeline";
import { Video45 } from "./v45/Video45";
import { F as F45 } from "./v45/timeline";
import { Video46 } from "./v46/Video46";
import { F as F46 } from "./v46/timeline";
import { Video47 } from "./v47/Video47";
import { F as F47 } from "./v47/timeline";
import { Video48 } from "./v48/Video48";
import { F as F48 } from "./v48/timeline";
import { Video49 } from "./v49/Video49";
import { F as F49 } from "./v49/timeline";
import { Video50 } from "./v50/Video50";
import { F as F50 } from "./v50/timeline";
import { Video51 } from "./v51/Video51";
import { F as F51 } from "./v51/timeline";
import { Video54, F as F54 } from "./v54/Video54";
import { Video55, F as F55 } from "./v55/Video55";
import { Video56, F as F56 } from "./v56/Video56";
import { Video57, F as F57 } from "./v57/Video57";
import { Video58, F as F58 } from "./v58/Video58";
import { Video59, F as F59 } from "./v59/Video59";
import { Video63, F as F63 } from "./v63/Video63";
import { Cover63 } from "./v63/Cover63";
import { Video64, F as F64 } from "./v64/Video64";
import { Cover64 } from "./v64/Cover64";
import { Video65, F as F65 } from "./v65/Video65";
import { Cover65 } from "./v65/Cover65";
import { Video60, F as F60 } from "./v60/Video60";
import { Cover60 } from "./v60/Cover60";
import { Video61, F as F61 } from "./v61/Video61";
import { Cover61 } from "./v61/Cover61";
import { Video62, F as F62 } from "./v62/Video62";
import { Cover62 } from "./v62/Cover62";
import { Video66, F as F66 } from "./v66/Video66";
import { Cover66 } from "./v66/Cover66";
import { Video67, F as F67 } from "./v67/Video67";
import { Cover67 } from "./v67/Cover67";
import { Video68, F as F68 } from "./v68/Video68";
import { Cover68 } from "./v68/Cover68";
import { Video52 } from "./v52/Video52";
import { F as F52 } from "./v52/timeline";
import { Video53 } from "./v53/Video53";
import { F as F53 } from "./v53/timeline";
import { Cover53 } from "./v53/Cover53";
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
const V21 = withOutro(Video21, F21.duration, "ru", "tatarverse");
const V22 = withOutro(Video22, F22.duration, "ru", "tatarverse");
const V23 = withOutro(Video23, F23.duration, "ru", "tatarverse");
const V24 = withOutro(Video24, F24.duration, "ru", "tatarverse");
const V25 = withOutro(Video25, F25.duration, "ru", "tatarverse");
const V26 = withOutro(Video26, F26.duration, "ru", "tatarverse");
const V27 = withOutro(Video27, F27.duration, "ru", "tatarverse");
const V28 = withOutro(Video28, F28.duration, "ru", "tatarverse");
const V29 = withOutro(Video29, F29.duration, "ru", "tatarverse");
const V30 = withOutro(Video30, F30.duration, "ru", "tatarverse");
const V31 = withOutro(Video31, F31.duration, "ru", "tatarverse");
const V32 = withOutro(Video32, F32.duration, "ru", "tatarverse");
const V33 = withOutro(Video33, F33.duration, "ru", "tatarverse");
const V34 = withOutro(Video34, F34.duration, "ru", "tatarverse");
const V35 = withOutro(Video35, F35.duration, "ru", "tatarverse");
const V36 = withOutro(Video36, F36.duration, "ru", "tatarverse");
const V37 = withOutro(Video37, F37.duration, "ru", "tatarverse");
const V38 = withOutro(Video38, F38.duration, "ru", "tatarverse");
const V39 = withOutro(Video39, F39.duration, "ru", "tatarverse");
const V40 = withOutro(Video40, F40.duration, "ru", "tatarverse");
const V41 = withOutro(Video41, F41.duration, "ru", "tatarverse");
const V42 = withOutro(Video42, F42.duration, "ru", "tatarverse");
const V43 = withOutro(Video43, F43.duration, "ru", "tatarverse");
const V44 = withOutro(Video44, F44.duration, "ru", "tatarverse");
const V45 = withOutro(Video45, F45.duration, "ru", "tatarverse");
const V46 = withOutro(Video46, F46.duration, "ru", "tatarverse");
const V47 = withOutro(Video47, F47.duration, "ru", "tatarverse");
const V48 = withOutro(Video48, F48.duration, "ru", "tatarverse");
const V49 = withOutro(Video49, F49.duration, "ru", "tatarverse");
const V50 = withOutro(Video50, F50.duration, "ru", "tatarverse");
const V51 = withOutro(Video51, F51.duration, "ru", "tatarverse");
const V52 = withOutro(Video52, F52.duration, "en", "tatarverse");
const V54 = withOutro(Video54, F54.duration, "ru", "tatarverse");
const V55 = withOutro(Video55, F55.duration, "ru", "tatarverse");
const V56 = withOutro(Video56, F56.duration, "ru", "tatarverse");
const V57 = withOutro(Video57, F57.duration, "ru", "tatarverse");
const V58 = withOutro(Video58, F58.duration, "ru", "tatarverse");
const V59 = withOutro(Video59, F59.duration, "ru", "tatarverse");
const V63 = withOutro(Video63, F63.duration, "ru", "tatarverse");
const V64 = withOutro(Video64, F64.duration, "ru", "tatarverse");
const V65 = withOutro(Video65, F65.duration, "ru", "tatarverse");
const V60 = withOutro(Video60, F60.duration, "ru", "tatarverse");
const V61 = withOutro(Video61, F61.duration, "ru", "tatarverse");
const V62 = withOutro(Video62, F62.duration, "ru", "tatarverse");
const V66 = withOutro(Video66, F66.duration, "ru", "tatarverse");
const V67 = withOutro(Video67, F67.duration, "ru", "tatarverse");
const V68 = withOutro(Video68, F68.duration, "ru", "tatarverse");
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
    <Composition id="V21" component={V21} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F21.duration)} />
    <Composition id="V22" component={V22} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F22.duration)} />
    <Composition id="V23" component={V23} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F23.duration)} />
    <Composition id="V24" component={V24} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F24.duration)} />
    <Composition id="V25" component={V25} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F25.duration)} />
    <Composition id="V26" component={V26} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F26.duration)} />
    <Composition id="V27" component={V27} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F27.duration)} />
    <Composition id="V28" component={V28} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F28.duration)} />
    <Composition id="V29" component={V29} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F29.duration)} />
    <Composition id="V30" component={V30} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F30.duration)} />
    <Composition id="V31" component={V31} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F31.duration)} />
    <Composition id="V32" component={V32} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F32.duration)} />
    <Composition id="V33" component={V33} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F33.duration)} />
    <Composition id="V34" component={V34} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F34.duration)} />
    <Composition id="V35" component={V35} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F35.duration)} />
    <Composition id="V36" component={V36} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F36.duration)} />
    <Composition id="V37" component={V37} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F37.duration)} />
    <Composition id="V38" component={V38} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F38.duration)} />
    <Composition id="V39" component={V39} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F39.duration)} />
    <Composition id="V40" component={V40} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F40.duration)} />
    <Composition id="V41" component={V41} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F41.duration)} />
    <Composition id="V42" component={V42} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F42.duration)} />
    <Composition id="V43" component={V43} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F43.duration)} />
    <Composition id="V44" component={V44} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F44.duration)} />
    <Composition id="V45" component={V45} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F45.duration)} />
    <Composition id="V46" component={V46} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F46.duration)} />
    <Composition id="V47" component={V47} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F47.duration)} />
    <Composition id="V48" component={V48} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F48.duration)} />
    <Composition id="V49" component={V49} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F49.duration)} />
    <Composition id="V50" component={V50} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F50.duration)} />
    <Composition id="V51" component={V51} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F51.duration)} />
    <Composition id="V52" component={V52} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F52.duration)} />
    {/* dark preset: no Outro, the reel ends on its own song + picture fade */}
    <Composition id="V54" component={V54} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F54.duration)} />
    <Composition id="V55" component={V55} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F55.duration)} />
    <Composition id="V56" component={V56} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F56.duration)} />
    <Composition id="V57" component={V57} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F57.duration)} />
    <Composition id="V58" component={V58} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F58.duration)} />
    <Composition id="V59" component={V59} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F59.duration)} />
    <Composition id="V63" component={V63} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F63.duration)} />
    <Still id="Cover63" component={Cover63} width={1080} height={1920} />
    <Composition id="V64" component={V64} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F64.duration)} />
    <Still id="Cover64" component={Cover64} width={1080} height={1920} />
    <Composition id="V65" component={V65} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F65.duration)} />
    <Still id="Cover65" component={Cover65} width={1080} height={1920} />
    <Composition id="V60" component={V60} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F60.duration)} />
    <Still id="Cover60" component={Cover60} width={1080} height={1920} />
    <Composition id="V61" component={V61} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F61.duration)} />
    <Still id="Cover61" component={Cover61} width={1080} height={1920} />
    <Composition id="V62" component={V62} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F62.duration)} />
    <Still id="Cover62" component={Cover62} width={1080} height={1920} />
    <Composition id="V66" component={V66} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F66.duration)} />
    <Still id="Cover66" component={Cover66} width={1080} height={1920} />
    <Composition id="V67" component={V67} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F67.duration)} />
    <Still id="Cover67" component={Cover67} width={1080} height={1920} />
    <Composition id="V68" component={V68} width={1080} height={1920} fps={60} durationInFrames={outroTotal(F68.duration)} />
    <Still id="Cover68" component={Cover68} width={1080} height={1920} />
    <Composition id="V53" component={Video53} width={1080} height={1920} fps={60} durationInFrames={F53.duration} />
    <Composition id="VTest" component={VTest} width={1080} height={1920} fps={60} durationInFrames={outroTotal(TEST_FRAMES)} />
    <Composition id="Playground" component={Playground} schema={playgroundSchema} calculateMetadata={playgroundMetadata} width={1080} height={1920} fps={60} durationInFrames={300} defaultProps={{
      name: "tactile-button-palette" as const,
      safeZone: true,
      title: true,
    }} />
    <Composition id="AvatarShowcase" component={AvatarShowcase} width={1080} height={1920} fps={60} durationInFrames={AVATAR_SHOWCASE_FRAMES} />
    <Composition id="PlaygroundAll" component={PlaygroundAll} width={1080} height={1920} fps={60} durationInFrames={PLAYGROUND_ALL_FRAMES} />
    <Composition id="Outro" component={Outro} width={1080} height={1920} fps={60} durationInFrames={OUTRO_FRAMES} defaultProps={{ lang: "ru" as const }} />
    <Still id="Cover" component={Cover} width={1080} height={1920} defaultProps={{ title: "Заголовок", description: "Короткое описание темы" }} />
    <Still id="Cover20" component={Cover20} width={1080} height={1920} />
    <Still id="Cover53" component={Cover53} width={1080} height={1920} />
    <Still id="CoverWide" component={Cover} width={1920} height={1080} defaultProps={{ title: "Заголовок", description: "Короткое описание темы" }} />
  </>
);
