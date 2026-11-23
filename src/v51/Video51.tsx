import React from "react";
import { Reel51, type Cfg51 } from "./scenes";
import { F, TURNS, VO } from "./timeline";
import { AHU_KEYS, AHU_WORDS, ALICJA_KEYS, ALICJA_WORDS, FIT_AHU, FIT_ALICJA } from "./hosts";

// V51 "tatarverse.cc в два голоса" (@the_tatarverse, RU): the scenes live in ./scenes (shared with V52 EN).
// Palette: emerald like the site's «Җаным Яшел». Dot Orbit variant 3 (mint).
export const RU: Cfg51 = {
  F,
  VO,
  turns: TURNS,
  T: {
    main: "#18734F",
    vivid: "#1F8A5F",
    glow: "#86D3B1",
    pale: "#E8F5EE",
    mid: "#4DB487",
    soft: "#A9DEC6",
    plate: "linear-gradient(135deg, #23A06E, #18734F)",
    n: { gray: "#DCE3DF", bar: "#E7EDEA", barDark: "#CBD5D0", well: "#F2F5F3", wellHi: "#E4EAE7", rim: "#DDE3E0", muted: "#7C8A83", dash: "#8E9C95", dotFill: "#EEF1EF" },
  },
  bg: 3,
  music: "v51/music/bed.mp3",
  hosts: [
    { keys: AHU_KEYS, words: AHU_WORDS, fit: FIT_AHU },
    { keys: ALICJA_KEYS, words: ALICJA_WORDS, dir: "v51/avatar", fit: FIT_ALICJA },
  ],
  S: {
    hook: { text: "это изменит то как ты ищешь *своих*", at: [-30, -26, F.how - 20, F.how, F.how + 11, F.search, F.own], size: 80 },
    where: { text: "и где их *искать*", at: [F.whereIn + 2, F.where, F.where + 18, F.look], size: 92 },
    hero: "найди *своих* рядом",
    centers: "центров",
    countries: "страны",
    lima: "Лима",
    tokyo: "Токио",
    nearBtn: "Рядом с тобой",
    nearTitle: "Центры рядом",
    place: "Казахстан Алматы",
    all: "Все",
    city: "Алматы",
    search: { text: "или *ищи*", at: [F.searchIn + 2, F.seek], size: 92 },
    chips: ["Казахстан", "Алматы", "Татарский"],
    found: "Найдено",
    write: { text: "пиши *напрямую*", at: [F.write, F.direct], size: 92 },
    hello: "Сәлам",
    save: { text: "сохрани или *распечатай*", at: [F.save, F.save + 40, F.print], size: 84 },
    saved: "Сохранено",
    honest: { text: "*честно*", at: F.honestIn + 2, size: 100 },
    honestRest: { text: "карточка пока *неполная*", at: [F.cards, F.cards + 40, F.incomplete], size: 84 },
    know: { text: "знаешь *такой центр*", at: [F.know, F.know + 16, F.know + 45], size: 84 },
    incomplete: "Данные неполные",
    complete: "Карточка заполнена",
    cta: "Помочь дополнить",
    left: "осталось",
    final: { text: "найди *своих* рядом", at: [F.findIn, F.yours, F.near], size: 104 },
  },
};

export const Video51: React.FC = () => <Reel51 cfg={RU} />;
