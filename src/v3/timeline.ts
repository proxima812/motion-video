// Video 3 - "Миллиард на ChatGPT" (RU). Single source of truth for timing (60 fps).
// Beats are pinned to word starts from public/v3/vo/l*.json (Kyle, Eleven v4, trimmed by scripts/trim-vo.py).
export const F = {
  duration: 1620,
  // 1. "Мой стартап стоит миллиард долларов. Сейчас покажу, как я это сделал." (vo 10)
  billion: 84,
  showHow: 176,
  // 2. "Сначала я создал обычный чат с ЧатГПТ. Потом добавил красивый интерфейс и анимированный логотип." (vo 312)
  buildIn: 306,
  chatgpt: 446,
  dress: 514,
  ui: 595,
  logo: 648,
  // 3. "Назвал это собственной нейросетевой инфраструктурой и привлек сорок миллионов инвестиций." (vo 751)
  pitchIn: 745,
  infra: 794,
  raised: 957,
  forty: 991,
  // 4. "Правда, пользователей у нас пока нет. Зато расходы на API - 4.82." (vo 1129)
  dashIn: 1123,
  zeroUsers: 1175,
  but: 1299,
  api: 1352,
  price: 1405,
  cents: 1506,
};

export const VO = [
  { src: "v3/vo/l1.mp3", from: 10, dur: 285 },
  { src: "v3/vo/l2.mp3", from: 312, dur: 422 },
  { src: "v3/vo/l3.mp3", from: 751, dur: 345 },
  { src: "v3/vo/l4.mp3", from: 1129, dur: 415 },
];
