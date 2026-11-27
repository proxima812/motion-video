import React from "react";
import { Heart, Music } from "lucide-react";
import { BubbleCover } from "../cover/CoverStyles";
import { ALICJA_PALETTES } from "../kit/presets/alicja";

// V76 cover: Alicja's bubble style in the reel palette (honey) - kicker «мне было страшно», the bubble «достаточно прийти»
const P = ALICJA_PALETTES.find((p) => p.name === "honey")!;

export const Cover76: React.FC = () => (
  <BubbleCover host="alicja" pose="touched" P={P} kicker="мне было страшно" bubble="достаточно прийти" sub="татарский вечер" icons={[Music, Heart]} />
);
