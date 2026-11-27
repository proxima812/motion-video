import type React from "react";
import type { SpringConfig } from "../../stage/motion";
import type { CoverProps } from "../../cover/Cover";
import type { Emotion } from "../TatAvatar";
import type { Range } from "../reel";

// Host presets: every host (Ahu, Alicja, Kamilya, Alsu) has her own animation style, elements, decor and way of
// telling the idea; "default" = the shared kit as before (@const_proxima, reels without a host preset).
// Common ground of every host preset = the approved tatarverse cover language: cream shader in the reel palette,
// tatarverse logo, Inter 400 + key words 700, glass plate. Rules: .claude/skills/new-v/SKILL.md «Пресеты ведущих».

export type HostId = "ahu" | "alicja" | "kamilya" | "alsu";
export type PresetId = HostId | "default";

/** One palette of a host's family. main = dark, readable on white; vivid = bright; glow = light (glows, underlines);
 *  pale = tint for surfaces; plate = GlassPlate background; bg = the 3 cream shader colors (light -> accent), as Cover bgColors. */
export type Palette = { name: string; main: string; vivid: string; glow: string; pale: string; plate: string; bg: readonly [string, string, string] };

export type TitleProps = {
  text: string; // *key* words -> weight 700 in the palette color
  frame: number;
  at: number | number[]; // one start (preset stagger) or a start per word
  pal: Palette;
  size?: number;
  top?: number;
  style?: React.CSSProperties;
};

export type HostPreset = {
  id: PresetId;
  name: string;
  /** character in one word (эксперт / подруга / хранительница / студентка) */
  role: string;
  /** ElevenLabs voice (eleven_v4, language_code ru); null = account default */
  voice: { id: string; name: string; stability: number; similarity: number; tags: readonly string[] } | null;
  /** staticFile folder of the host poses (scripts/sync-hosts.py), null = no host */
  avatarDir: string | null;
  fit: Partial<Record<Emotion, number>>;
  /** palette family: a reel picks one, the next reel of the same host takes another */
  palettes: readonly Palette[];
  motion: {
    spring: SpringConfig;
    /** frames between words / items */
    stagger: number;
    /** element entrance at `at` (i = index for staggered groups) */
    enter: (frame: number, at: number, i?: number) => React.CSSProperties;
    /** element exit over a few frames from `at` */
    exit: (frame: number, at: number) => React.CSSProperties;
    /** scene in/out for ReelShell `transition` */
    scene: (frame: number, range: Range) => React.CSSProperties;
    /** frames a scene stays mounted around its range, for ReelShell `pad` (longer transitions need more) */
    scenePad: readonly [number, number];
  };
  /** kinetic heading in the host's manner */
  Title: React.FC<TitleProps>;
  /** full-frame background (palette cream shader + host texture) */
  Bg: React.FC<{ pal: Palette }>;
  /** persistent decoration layer above the background, under the scenes */
  Decor?: React.FC<{ pal: Palette }>;
  /** small decoration drawn on the cover (under the text) */
  CoverDecor?: React.FC<{ pal: Palette }>;
  /** cover props in the host's look (Cover merges them under the explicit props) */
  cover: (pal: Palette) => Partial<CoverProps>;
  /** Playground demo of the preset: title, elements, decor (catalog entry `preset-<id>`) */
  Showcase: React.FC<{ frame: number; pal: Palette }>;
};
