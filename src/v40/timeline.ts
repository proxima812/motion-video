// Video 40 - "Рецепт без граммов" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.12 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 40 8, gap 8 to fit 21 s).
export const F = {
  duration: 1258,
  // 1. hook: nobody talks about it - grandma's recipes aren't written in grams
  nobody: 10,
  not: 47,
  talks: 53,
  but: 96,
  grandmas: 113,
  recipes: 143,
  written: 190,
  grams: 224,
  // 2. how much flour? "well, so the dough comes out"
  flourIn: 271,
  much: 273,
  flour: 301,
  well: 346,
  so: 372,
  dough: 389,
  works: 410,
  // 3. how much salt? "by eye, кызым"
  saltIn: 474,
  muchSalt: 476,
  salt: 502,
  na: 545,
  eye: 553,
  kyzym: 576,
  // 4. such a recipe can't be copied; only repeated next to her
  copyIn: 610,
  recipe: 640,
  rewrite: 685,
  can: 758,
  only: 772,
  repeat: 790,
  near: 824,
  her: 850,
  // 5. this weekend cook one dish with grandma and film it on your phone
  ctaIn: 873,
  weekend: 892,
  cook: 927,
  grandma: 954,
  one: 982,
  dish: 999,
  film: 1038,
  phone: 1065,
  // 6. so the taste stays in the family
  tasteIn: 1101,
  taste: 1111,
  stays: 1145,
  family: 1177,
};

export const VO = [
  { src: "v40/vo/l1.mp3", from: 8, dur: 255 },
  { src: "v40/vo/l2.mp3", from: 271, dur: 195 },
  { src: "v40/vo/l3.mp3", from: 474, dur: 128 },
  { src: "v40/vo/l4.mp3", from: 610, dur: 255 },
  { src: "v40/vo/l5.mp3", from: 873, dur: 220 },
  { src: "v40/vo/l6.mp3", from: 1101, dur: 117 },
];
