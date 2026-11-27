import React from "react";
import { GraduationCap } from "lucide-react";
import { StickerCover } from "../cover/CoverStyles";
import { ALSU_PALETTES } from "../kit/presets/alsu";

// V78 cover: Alsu's sticker style in the reel palette (cobalt, bright background) - «проверь», «знаешь татарский», 2/2
const P = ALSU_PALETTES.find((p) => p.name === "cobalt")!;

export const Cover78: React.FC = () => (
  <StickerCover host="alsu" pose="wink" P={P} bg={P.bright!} word="ПРОВЕРЬ" pill="знаешь татарский" badgeBig="2/2" badgeSmall="верно" tag="всего 2 слова" drops={GraduationCap} />
);
