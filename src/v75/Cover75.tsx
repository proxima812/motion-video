import React from "react";
import { CalendarDays } from "lucide-react";
import { GiantNumberCover } from "../cover/CoverStyles";
import { AHU_PALETTES } from "../kit/presets/ahu";

// V75 cover: giant-number style (Ahu preset), palette emerald - "5 минут в день" -> 30 hours a year, Ahu points up at the number
export const Cover75: React.FC = () => (
  <GiantNumberCover host="ahu" pose="point-up" P={AHU_PALETTES[0]} accent="5 минут" rest="в день" number="30" chip="часов за год" chipIcon={CalendarDays} />
);
