import type { Beats } from "../v51/scenes";

// Video 52 - "tatarverse.cc in two voices" (EN, @the_tatarverse, two hosts: Ahu = main preset, Alicja = preset 2). 60 fps.
// EN version of V51 (same scenes, src/v51/scenes.tsx). VO: odd lines Ahu (xyqF3vGMQlPk3e7yA4DI), even lines Alicja
// (iCzRDxXsrROcDYzWimM9), Eleven v4 en, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/words-v52.py).
export const F: Beats = {
  duration: 2697,
  // 1. (Ahu) this changes how you find your people
  change: 28,
  how: 64,
  search: 86,
  own: 104,
  // 2. (Alicja) so where are they
  whereIn: 167,
  where: 200,
  look: 227,
  // 3. (Ahu) right here: tatarverse.cc - a catalog of Tatar, Bashkir and Crimean Tatar centers all over the world
  hereIn: 269,
  here: 285,
  site: 333,
  catalog: 436,
  tatar: 476,
  bashkir: 509,
  crimean: 551,
  centers: 605,
  world: 640,
  // 4. (Alicja) 410 centers in 53 countries
  numIn: 720,
  n410: 722,
  centers2: 776,
  n53: 820,
  countries: 856,
  // 5. (Ahu) even in Peru and Japan
  evenIn: 918,
  peru: 947,
  japan: 996,
  // 6. (Alicja) to find the closest ones, open "Near you": the site figures out where you are
  nearIn: 1049,
  nearest: 1078,
  open: 1136,
  nearby: 1162,
  siteSelf: 1229,
  gets: 1247,
  whereYou: 1273,
  // 7. (Ahu) or search by country, city and category
  searchIn: 1335,
  seek: 1348,
  country: 1379,
  city: 1419,
  category: 1459,
  // 8. (Alicja) every card has links to websites and socials. Message them directly
  cardIn: 1524,
  card: 1540,
  links: 1562,
  sites: 1584,
  socials: 1633,
  write: 1668,
  direct: 1700,
  // 9. (Ahu) like a center? Save it, or print the list
  saveIn: 1750,
  liked: 1752,
  save: 1828,
  print: 1890,
  list: 1912,
  // 10. (Alicja) honestly? 151 cards are still incomplete
  honestIn: 1968,
  n151: 2032,
  cards: 2099,
  incomplete: 2152,
  // 11. (Ahu) know one? Tap "Help complete it", and we'll update the card
  helpIn: 2214,
  know: 2216,
  tap: 2265,
  help: 2287,
  fill: 2301,
  update: 2381,
  cardUpd: 2398,
  // 12. (Alicja) tatarverse.cc
  endIn: 2444,
  // 13. (Ahu) find your people nearby
  findIn: 2548,
  yours: 2568,
  near: 2599,
};

export const VO = [
  { src: "v52/vo/l1.mp3", from: 8, dur: 149 },
  { src: "v52/vo/l2.mp3", from: 167, dur: 90 },
  { src: "v52/vo/l3.mp3", from: 269, dur: 433 },
  { src: "v52/vo/l4.mp3", from: 720, dur: 188 },
  { src: "v52/vo/l5.mp3", from: 918, dur: 113 },
  { src: "v52/vo/l6.mp3", from: 1049, dur: 274 },
  { src: "v52/vo/l7.mp3", from: 1335, dur: 173 },
  { src: "v52/vo/l8.mp3", from: 1524, dur: 210 },
  { src: "v52/vo/l9.mp3", from: 1750, dur: 198 },
  { src: "v52/vo/l10.mp3", from: 1968, dur: 234 },
  { src: "v52/vo/l11.mp3", from: 2214, dur: 210 },
  { src: "v52/vo/l12.mp3", from: 2444, dur: 94 },
  { src: "v52/vo/l13.mp3", from: 2548, dur: 104 },
];

// Who talks: line N is Ahu (0) when N is odd, Alicja (1) when even
export const TURNS = VO.map((v, i) => ({ from: v.from, who: (i % 2) as 0 | 1 }));
