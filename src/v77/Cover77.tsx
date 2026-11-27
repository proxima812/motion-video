import React from "react";
import { FormCover } from "../cover/CoverStyles";
import { KAMILYA_PALETTES } from "../kit/presets/kamilya";

// V77 cover: form-stamp style (Kamilya preset), palette garnet - an inventory of grandmother's chest, stamp «АРХИВ»;
// Kamilya whispers the secret (high-res 1000x1040 photo)
export const Cover77: React.FC = () => (
  <FormCover
    host="kamilya"
    pose="whisper"
    P={KAMILYA_PALETTES[0]}
    title="Бабушкин сундук"
    accent="что внутри"
    header="ОПИСЬ"
    rows={[
      ["полотенце", "сложено", true],
      ["тюльпаны", "24", true],
      ["на виду", "нет", false],
    ]}
    stamp="АРХИВ"
  />
);
