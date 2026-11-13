import type React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";

// Shared design rules for every reel (light mode only). See .claude/skills/new-v/SKILL.md.

export const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "700"], subsets: ["latin", "cyrillic"] });
export const { fontFamily: RALEWAY } = loadRaleway("normal", { weights: ["400", "500", "700"], subsets: ["latin", "cyrillic"] });

export const INK = "#251B3A"; // all dark text
export const WHITE = "#fff"; // all light text

// Headings: Inter 400, the key word of the topic in 700. Paragraphs: Raleway 400, accent words 700. Numbers: Inter.
export const HEADING: React.CSSProperties = { fontFamily: `${INTER}, sans-serif`, fontWeight: 400, color: INK, letterSpacing: "-0.03em", lineHeight: 1.05 };
export const PARAGRAPH: React.CSSProperties = { fontFamily: `${RALEWAY}, sans-serif`, fontWeight: 400, color: INK, lineHeight: 1.35 };
export const NUMBER: React.CSSProperties = { fontFamily: `${INTER}, sans-serif`, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em", lineHeight: 1 };

// The only shadow / surface for components that have one (cards, pills, panels).
export const SHADOW = "-1px -6px 55px -11px rgba(144, 142, 142, 0.2)";
export const SURFACE: React.CSSProperties = { backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 24, boxShadow: SHADOW };

// Inner padding of components: top/bottom never bigger than left/right (visually too - big type adds
// line-height above/below, so set lineHeight ~1 inside cards). Equal padding on all sides is the default.

// Safe zone for text and components (not the avatar). Components may cross it only while animating in/out
// or when the animation itself needs to (fly-ins, overshoot).
// Pills (плашки): text in the accent color -> fontWeight 500. Some pills (not all) use GLASS_PILL.
// A pill holding a word gets a meaningful icon (lucide-react) before the word.
export const ACCENT_WEIGHT = 500;
export const GLASS_PILL: React.CSSProperties = { backgroundColor: "rgba(255, 255, 255, 0.38)", backdropFilter: "blur(18px) saturate(1.6)", WebkitBackdropFilter: "blur(18px) saturate(1.6)", border: "1px solid rgba(255, 255, 255, 0.7)", boxShadow: `${SHADOW}, inset 0 1px 0 rgba(255, 255, 255, 0.8)` };

export const SAFE = { x: 100, y: 150 };
