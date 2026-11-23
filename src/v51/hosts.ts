import type { AvatarKey, Emotion, SpokenWord } from "../kit/TatAvatar";
import { WORDS_AHU, WORDS_ALICJA } from "./words";

// Both hosts are on screen the whole video (TatDuo): Ahu (main preset, tatarverse/avatar) on the left,
// Alicja (preset 2, v51/avatar) on the right. Each uses all 30 of her poses at least once, never one photo twice in a row.
// Lines: odd = Ahu talks, even = Alicja talks; the listener reacts with her own poses.

// Ahu: 30 poses
export const AHU_KEYS: AvatarKey[] = [
  // 1. hook: "this will change how you look for your people" - the face changes on "изменит"
  { at: -40, e: "disappointed" }, // on screen from the first frame
  { at: 50, e: "explaining" },
  { at: 95, e: "shrug" },
  { at: 130, e: "inspired" },
  // 2. Alicja: "where do I look?" - wait, I'll show you
  { at: 199, e: "listening" },
  { at: 245, e: "stop" },
  // 3. right here: tatarverse.cc, a catalog of three peoples, all over the world
  { at: 280, e: "point-right" },
  { at: 339, e: "delighted" },
  { at: 443, e: "point-up" },
  { at: 500, e: "hand-on-heart" },
  { at: 560, e: "smile-up" },
  { at: 630, e: "present-left" },
  // 4. Alicja: 410 centers in 53 countries
  { at: 726, e: "skeptical" },
  { at: 830, e: "surprised" },
  // 5. even in Peru and Japan
  { at: 916, e: "laughing" },
  { at: 968, e: "victory" },
  // 6. Alicja: open «Рядом с тобой», the site figures out where you are
  { at: 1065, e: "thinking" },
  { at: 1255, e: "puzzled" },
  // 7. or search by country, city, category
  { at: 1341, e: "point-up" },
  { at: 1430, e: "explaining" },
  { at: 1490, e: "thumbs-up" },
  // 8. Alicja: links in the card, write directly
  { at: 1551, e: "soft-smile" },
  { at: 1660, e: "clapping" },
  // 9. like it? save it or print the list
  { at: 1796, e: "heart-hands" },
  { at: 1870, e: "point-down" },
  { at: 1935, e: "delighted" },
  // 10. Alicja: honestly? 151 cards are incomplete - shh, oh no
  { at: 2037, e: "shush" },
  { at: 2100, e: "displeased" },
  { at: 2175, e: "facepalm" },
  // 11. know such a center? tap «Помочь дополнить»
  { at: 2246, e: "pensive" },
  { at: 2320, e: "point-right" },
  { at: 2420, e: "thumbs-up" },
  // 12-13. tatarverse.cc - find your people nearby
  { at: 2535, e: "arms-crossed" },
  { at: 2585, e: "dreamy" },
  { at: 2641, e: "waving" },
  { at: 2695, e: "heart-hands" },
];

// Alicja: 30 poses
export const ALICJA_KEYS: AvatarKey[] = [
  // 1. Ahu's hook: shh, listen - hm, really?
  { at: -34, e: "shush" },
  { at: 110, e: "skeptical" },
  // 2. "and where do I look for them?"
  { at: 185, e: "shrug" },
  { at: 218, e: "puzzled" },
  // 3. Ahu shows the site
  { at: 294, e: "surprised" },
  { at: 355, e: "delighted" },
  { at: 465, e: "listening" },
  { at: 575, e: "hand-on-heart" },
  { at: 650, e: "smile-up" },
  // 4. 410 centers in 53 countries
  { at: 712, e: "explaining" },
  { at: 772, e: "point-up" },
  { at: 860, e: "inspired" },
  // 5. Ahu: even in Peru and Japan - no way
  { at: 930, e: "stop" },
  { at: 985, e: "laughing" },
  // 6. open «Рядом с тобой», the site figures out where you are
  { at: 1051, e: "point-right" },
  { at: 1130, e: "point-down" },
  { at: 1240, e: "thumbs-up" },
  // 7. Ahu: search by country, city, category
  { at: 1355, e: "thinking" },
  { at: 1410, e: "pensive" },
  { at: 1470, e: "dreamy" },
  // 8. links in the card, write directly
  { at: 1537, e: "present-left" },
  { at: 1610, e: "explaining" },
  { at: 1721, e: "waving" },
  // 9. Ahu: save it or print the list
  { at: 1810, e: "heart-hands" },
  { at: 1900, e: "victory" },
  // 10. honestly? 151 cards are incomplete
  { at: 2023, e: "facepalm" },
  { at: 2085, e: "disappointed" },
  { at: 2165, e: "displeased" },
  // 11. Ahu: tap «Помочь дополнить»
  { at: 2260, e: "listening" },
  { at: 2380, e: "clapping" },
  // 12-13. tatarverse.cc - find your people nearby
  { at: 2521, e: "arms-crossed" },
  { at: 2605, e: "soft-smile" },
  { at: 2660, e: "heart-hands" },
];

// the listener nods now and then on the other host's key words (silent words: a nod, no pill)
export const nods = (frames: number[]): SpokenWord[] => frames.map((f) => ({ f, w: "" }));
export const AHU_NODS = [223, 810, 1169, 1273, 1606, 1738, 2079, 2187, 2523];
export const ALICJA_NODS = [126, 339, 466, 557, 952, 1392, 1477, 1870, 2350, 2655];
export const AHU_WORDS = [...WORDS_AHU, ...nods(AHU_NODS)];
export const ALICJA_WORDS = [...WORDS_ALICJA, ...nods(ALICJA_NODS)];

// Photos differ in framing: scale the wide ones so every photo fills the 540x590 box by height (as in V49 / V50)
const SIZE_AHU: Record<string, [number, number]> = { "arms-crossed": [1312, 1199], clapping: [1278, 1230], delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1217], explaining: [1312, 1199], facepalm: [1312, 1199], "hand-on-heart": [1312, 1199], "heart-hands": [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], listening: [1312, 1199], pensive: [1312, 1199], "point-down": [1312, 1199], "point-right": [1312, 1199], "point-up": [1312, 1199], "present-left": [1312, 1199], puzzled: [1152, 1366], shrug: [1312, 1199], shush: [1312, 1199], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1218, 1291], stop: [1312, 1199], surprised: [1280, 1229], thinking: [1190, 1322], "thumbs-up": [1312, 1199], victory: [1312, 1199], waving: [1312, 1199] };
const SIZE_ALICJA: Record<string, [number, number]> = { "arms-crossed": [1199, 1312], clapping: [1312, 1199], delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1216], explaining: [1312, 1199], facepalm: [1312, 1199], "hand-on-heart": [1312, 1199], "heart-hands": [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], listening: [1312, 1199], pensive: [1129, 1393], "point-down": [1312, 1199], "point-right": [1312, 1199], "point-up": [1312, 1199], "present-left": [1312, 1199], puzzled: [1129, 1393], shrug: [1312, 1199], shush: [1199, 1312], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1164, 1351], stop: [1312, 1199], surprised: [1280, 1229], thinking: [1129, 1393], "thumbs-up": [1312, 1199], victory: [1312, 1199], waving: [1312, 1199] };
const fitOf = (size: Record<string, [number, number]>) => Object.fromEntries(Object.entries(size).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;
export const FIT_AHU = fitOf(SIZE_AHU);
export const FIT_ALICJA = fitOf(SIZE_ALICJA);
