// Video 5 - "Вайб-стартап" (RU). Single source of truth for timing (60 fps).
// Beats are pinned to word starts from public/v5/vo/l*.json (Kyle, Eleven v4, trimmed x1.09 by scripts/trim-vo.py).
export const F = {
  duration: 1620,
  // 1. "Я попросил нейросеть создать мне стартап за десять секунд. И она реально все сделала!" (vo 10)
  submit: 120,
  ten: 153,
  done: 217,
  // 2. "Красивый интерфейс, идеальная архитектура, Страйп подключен. Осталось только протестировать." (vo 328)
  uiIn: 322,
  ui: 365,
  arch: 447,
  stripe: 504,
  testing: 588,
  // 3. "Нажимаю регистрацию. Ошибка пятьсот. Ладно, попросим исправить." (vo 699)
  signupIn: 693,
  click: 734,
  error: 802,
  fixAsk: 899,
  // 4. "Нейросеть полностью пересобрала приложение. Изменено ноль файлов. Удалено восемьсот сорок семь." (vo 1015)
  rebuildIn: 1009,
  rebuilt: 1088,
  zero: 1171,
  deleted: 1264,
  n847: 1299,
  // 5. "Теперь приложение готово к продакшену." (vo 1404)
  prodIn: 1398,
  prod: 1468,
};

export const VO = [
  { src: "v5/vo/l1.mp3", from: 10, dur: 306 },
  { src: "v5/vo/l2.mp3", from: 328, dur: 357 },
  { src: "v5/vo/l3.mp3", from: 699, dur: 301 },
  { src: "v5/vo/l4.mp3", from: 1015, dur: 359 },
  { src: "v5/vo/l5.mp3", from: 1404, dur: 139 },
];
