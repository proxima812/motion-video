// Video 51 - "tatarverse.cc в два голоса" (RU, @the_tatarverse, two hosts: Ahu = main preset, Alicja = preset 2). 60 fps.
// VO: odd lines Ahu (xyqF3vGMQlPk3e7yA4DI), even lines Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py;
// beats = word starts (scripts/words-v51.py), dialog gaps 10-20 frames.
export const F = {
  duration: 2764,
  // 1. hook (Ahu): this will change how you look for your people
  change: 30,
  how: 84,
  search: 108,
  own: 126,
  // 2. (Alicja) and where do I look for them
  whereIn: 185,
  where: 196,
  look: 223,
  // 3. (Ahu) right here: tatarverse.cc - a catalog of Tatar, Bashkir and Crimean Tatar centers all over the world
  hereIn: 280,
  here: 288,
  site: 339,
  catalog: 443,
  tatar: 466,
  bashkir: 506,
  crimean: 557,
  centers: 610,
  world: 644,
  // 4. (Alicja) 410 centers in 53 countries
  numIn: 712,
  n410: 714,
  centers2: 772,
  n53: 810,
  countries: 865,
  // 5. (Ahu) even in Peru and Japan
  evenIn: 916,
  peru: 952,
  japan: 976,
  // 6. (Alicja) to find the nearest ones, open «Рядом с тобой»: the site figures out where you are
  nearIn: 1051,
  nearest: 1095,
  open: 1138,
  nearby: 1169,
  siteSelf: 1240,
  gets: 1273,
  whereYou: 1295,
  // 7. (Ahu) or search by country, city and category
  searchIn: 1341,
  seek: 1365,
  country: 1392,
  city: 1432,
  category: 1477,
  // 8. (Alicja) in a card: links to websites and socials. Write to them directly
  cardIn: 1537,
  card: 1544,
  links: 1606,
  sites: 1633,
  socials: 1664,
  write: 1721,
  direct: 1738,
  // 9. (Ahu) like a center? Save it or print the list
  saveIn: 1796,
  liked: 1798,
  save: 1870,
  print: 1937,
  list: 1968,
  // 10. (Alicja) honestly? 151 cards are still incomplete
  honestIn: 2023,
  n151: 2079,
  cards: 2132,
  incomplete: 2187,
  // 11. (Ahu) know such a center? Tap «Помочь дополнить» and we update the card
  helpIn: 2246,
  know: 2248,
  tap: 2328,
  help: 2350,
  fill: 2373,
  update: 2435,
  cardUpd: 2457,
  // 12. (Alicja) tatarverse.cc
  endIn: 2521,
  // 13. (Ahu) find your people nearby
  findIn: 2641,
  yours: 2655,
  near: 2680,
};

export const VO = [
  { src: "v51/vo/l1.mp3", from: 8, dur: 167 },
  { src: "v51/vo/l2.mp3", from: 185, dur: 83 },
  { src: "v51/vo/l3.mp3", from: 280, dur: 414 },
  { src: "v51/vo/l4.mp3", from: 712, dur: 194 },
  { src: "v51/vo/l5.mp3", from: 916, dur: 117 },
  { src: "v51/vo/l6.mp3", from: 1051, dur: 278 },
  { src: "v51/vo/l7.mp3", from: 1341, dur: 180 },
  { src: "v51/vo/l8.mp3", from: 1537, dur: 243 },
  { src: "v51/vo/l9.mp3", from: 1796, dur: 207 },
  { src: "v51/vo/l10.mp3", from: 2023, dur: 211 },
  { src: "v51/vo/l11.mp3", from: 2246, dur: 255 },
  { src: "v51/vo/l12.mp3", from: 2521, dur: 110 },
  { src: "v51/vo/l13.mp3", from: 2641, dur: 78 },
];

// Who talks: line N is Ahu (0) when N is odd, Alicja (1) when even
export const TURNS = VO.map((v, i) => ({ from: v.from, who: (i % 2) as 0 | 1 }));
