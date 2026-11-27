// Host presets registry. A reel picks a preset and one palette of its family:
//   const P = PRESETS.kamilya; const pal = palette("kamilya", "garnet");
//   <ReelShell bg={<><P.Bg pal={pal} />{P.Decor && <P.Decor pal={pal} />}</>} transition={P.motion.scene} pad={P.motion.scenePad} ... />
//   <TatAvatar dir={P.avatarDir!} fit={P.fit} ... />
// Cover: --props='{"preset":"kamilya","palette":"garnet",...}'. Rules: .claude/skills/new-v/SKILL.md «Пресеты ведущих».
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

export type { HostId, HostPreset, Palette, PresetId, TitleProps } from "./types";
