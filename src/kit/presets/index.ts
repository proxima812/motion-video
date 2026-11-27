// Host presets registry. A solo reel picks its host's preset and one palette of the family:
//   const T = palette("kamilya", "garnet");
//   <SoloReel cfg={{ host: "kamilya", look: true, T, ... }} />   (look = preset background, scene transitions, drift)
// Scenes use the preset's Title / motion.enter / elements (PRESETS.kamilya, src/kit/presets/kamilya.tsx).
// Cover: CoverN on one of the host's approved styles (PRESETS[host].covers) in the same palette.
// Rules: .claude/skills/new-v/SKILL.md «Пресеты ведущих».
import { AHU } from "./ahu";
import { ALICJA } from "./alicja";
import { ALSU } from "./alsu";
import { DEFAULT_PRESET } from "./default";
import { KAMILYA } from "./kamilya";
import type { HostPreset, Palette, PresetId } from "./types";

export const PRESETS: Record<PresetId, HostPreset> = { default: DEFAULT_PRESET, ahu: AHU, alicja: ALICJA, kamilya: KAMILYA, alsu: ALSU };
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

export const getPreset = (id: string | undefined): HostPreset => PRESETS[(id ?? "default") as PresetId] ?? DEFAULT_PRESET;

/** Palette of a preset by name (first one of the family if the name is unknown) */
export const palette = (id: string | undefined, name?: string): Palette => {
  const p = getPreset(id);
  return p.palettes.find((x) => x.name === name) ?? p.palettes[0];
};

export type { CoverStyle, HostPreset, Palette, PresetId, TitleProps } from "./types";
