import type React from "react";
import type { SpringConfig } from "../../stage/motion";
import type { Emotion } from "../TatAvatar";
import type { Range } from "../reel";
import type { Palette as TalkPalette } from "../talk";
import type { QuadHost } from "../quadFit";

// Host presets: every @the_tatarverse host (Ahu, Alicja, Kamilya, Alsu) has her own animation style, elements,
// decor and way of telling the idea; "default" = the shared kit as before (@const_proxima, reels without a preset).
// Each host's look continues her cover styles (the 7 approved ones in src/cover/CoverStyles.tsx, 2026-11-23):
// Ahu - timer / giant-number, Alicja - bubble, Kamilya - form-stamp / map, Alsu - sticker / big-type.
// Rules: .claude/skills/new-v/SKILL.md «Пресеты ведущих».

export type PresetId = QuadHost | "default";
export type CoverStyle = "timer" | "sticker" | "bubble" | "big-type" | "form-stamp" | "map" | "giant-number";

/** One palette of a host's family (same fields as the talk / solo palette + CoverStyles CoverPal).
 *  main = dark, readable on white; vivid = bright; glow = light; pale = surface tint; plate = GlassPlate background;
 *  gray / muted = neutrals; bright = loud background for sticker-like moments (Alsu). */
export type Palette = TalkPalette & { name: string };

export type TitleProps = {
  text: string; // *key* words -> the preset's key style
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
  /** palette family: a reel picks one, the next reel of the same host takes another */
  palettes: readonly Palette[];
  /** approved cover styles of this host (CoverN uses one; never the same style twice in a row) */
  covers: readonly CoverStyle[];
  /** ElevenLabs voice tags that fit the host (voice ids live in scripts/talk.py) */
  tags: readonly string[];
  fit: Partial<Record<Emotion, number>>;
  motion: {
    spring: SpringConfig;
    /** frames between words / items */
    stagger: number;
    /** element entrance at `at` (i = index in a staggered group) */
    enter: (frame: number, at: number, i?: number) => React.CSSProperties;
    /** element exit from `at` */
    exit: (frame: number, at: number) => React.CSSProperties;
    /** scene in/out (ReelShell `transition`) */
    scene: (frame: number, range: Range) => React.CSSProperties;
    /** frames a scene stays mounted around its range (ReelShell `pad`) */
    scenePad: readonly [number, number];
    /** slow push-in over each scene (0 = none) */
    drift: number;
  };
  /** kinetic heading in the host's manner */
  Title: React.FC<TitleProps>;
  /** full-frame background in the host's cover look (frame-driven, seek-safe) */
  Bg: React.FC<{ pal: Palette }>;
  /** Playground demo of the preset: title, elements, decor (catalog entry `preset-<host>-<palette>`) */
  Showcase: React.FC<{ frame: number; pal: Palette }>;
};
