import React from "react";
import { Reel51, type Cfg51 } from "../v51/scenes";
import { FIT_AHU, FIT_ALICJA } from "../v51/hosts";
import { F, TURNS, VO } from "./timeline";
import { AHU_KEYS_EN, AHU_WORDS_EN, ALICJA_KEYS_EN, ALICJA_WORDS_EN } from "./hosts";

// V52 "tatarverse.cc in two voices" (@the_tatarverse, EN): the V51 scenes with EN voice, beats and strings
// (the site's own EN labels: "Find yours nearby", "Near you", "Centers nearby", "Help complete it").
// Palette: blue, after the site's «Кадерле Зәнгәр» (#3478F0 / #9CC0FF). Dot Orbit variant 4 (sky).
export const EN: Cfg51 = {
  F,
  VO,
  turns: TURNS,
  T: {
    main: "#1F4FB3",
    vivid: "#3478F0",
    glow: "#9CC0FF",
    pale: "#EAF1FE",
    mid: "#5D93F2",
    soft: "#BCD3FB",
    plate: "linear-gradient(135deg, #4A8BF8, #1F4FB3)",
    n: { gray: "#DCE2EC", bar: "#E6EBF3", barDark: "#C9D2E1", well: "#F1F4F9", wellHi: "#E2E8F2", rim: "#DCE2EC", muted: "#7A8699", dash: "#8C98AB", dotFill: "#EDF0F6" },
  },
  bg: 4,
  music: "v52/music/bed.mp3",
  hosts: [
    { keys: AHU_KEYS_EN, words: AHU_WORDS_EN, fit: FIT_AHU },
    { keys: ALICJA_KEYS_EN, words: ALICJA_WORDS_EN, dir: "v52/avatar", fit: FIT_ALICJA },
  ],
  S: {
    hook: { text: "this changes how you find *your people*", at: [-30, -26, F.how, F.how + 13, F.search, F.own, F.own + 8], size: 80 },
    where: { text: "so where are *they*", at: [F.whereIn + 2, F.where, F.where + 14, F.look], size: 92 },
    hero: "find *yours* nearby",
    centers: "centers",
    countries: "countries",
    lima: "Lima",
    tokyo: "Tokyo",
    nearBtn: "Near you",
    nearTitle: "Centers nearby",
    place: "Kazakhstan Almaty",
    all: "All",
    city: "Almaty",
    search: { text: "or *search*", at: [F.searchIn + 2, F.seek], size: 92 },
    chips: ["Kazakhstan", "Almaty", "Tatar"],
    found: "Found",
    write: { text: "message them *directly*", at: [F.write, F.write + 23, F.direct], size: 84 },
    hello: "Сәлам",
    save: { text: "save or *print*", at: [F.save, F.save + 44, F.print], size: 92 },
    saved: "Saved",
    honest: { text: "*honestly*", at: F.honestIn + 2, size: 100 },
    honestRest: { text: "cards still *incomplete*", at: [F.cards, F.cards + 36, F.incomplete], size: 84 },
    know: { text: "know *one*", at: [F.know, F.know + 14], size: 92 },
    incomplete: "Incomplete data",
    complete: "Complete card",
    cta: "Help complete it",
    left: "left",
    final: { text: "find *your people* nearby", at: [F.findIn, F.yours, F.yours + 9, F.near], size: 104 },
  },
};

export const Video52: React.FC = () => <Reel51 cfg={EN} />;
