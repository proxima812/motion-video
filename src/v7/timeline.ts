// Video 7 - "Совещания без людей" (RU). Single source of truth for timing (60 fps).
// Beats are pinned to word starts from public/v7/vo/l*.json (Kyle, Eleven v4, trimmed x1.1 by scripts/trim-vo.py).
export const F = {
  duration: 1632,
  // 1. "Мы заменили сотрудников на совещаниях искусственным интеллектом." (vo 10)
  ai: 130,
  // 2. "Теперь агенты подключаются к звонкам и записывают решения." (vo 234)
  agentsIn: 228,
  join: 291,
  notes: 378,
  // 3. "А потом мы разрешили им самим назначать встречи." (vo 473)
  permIn: 467,
  allow: 521,
  schedule: 589,
  // 4. "Через неделю они проводили четыреста совещаний в день." (vo 668)
  weekIn: 662,
  n400: 764,
  day: 847,
  // 5. "Мы решили посмотреть, что они обсуждают." (vo 889)
  lookIn: 883,
  look: 922,
  // 6. "«Вернемся к этому позже». «Отлично». «Давайте назначим встречу». «Отличная идея»." (vo 1049)
  q1: 1049,
  q2: 1154,
  q3: 1210,
  q4: 1306,
  // 7. "Продуктивность выросла на ноль процентов." (vo 1415)
  prodIn: 1409,
  zero: 1500,
};

export const VO = [
  { src: "v7/vo/l1.mp3", from: 10, dur: 211 },
  { src: "v7/vo/l2.mp3", from: 234, dur: 223 },
  { src: "v7/vo/l3.mp3", from: 473, dur: 184 },
  { src: "v7/vo/l4.mp3", from: 668, dur: 206 },
  { src: "v7/vo/l5.mp3", from: 889, dur: 144 },
  { src: "v7/vo/l6.mp3", from: 1049, dur: 336 },
  { src: "v7/vo/l7.mp3", from: 1415, dur: 155 },
];
