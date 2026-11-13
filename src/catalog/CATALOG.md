# Каталог компонентов

Все переиспользуемые компоненты для роликов. Смотреть: Studio → composition **Playground** → в пропсах выбрать `name`. Крупный заголовок сверху кадра — имя компонента: по нему и просим правки («chip: сделай …»). `title` — заголовок, `safeZone` — рамка. Демо — `src/catalog/entries.tsx`.

- **Свои** (`own`) — `src/catalog/own/` (`text`, `surfaces`, `icons`, `fx`), переписаны по дизайн-системе `src/kit/design.ts`: одна поверхность `SURFACE` (белый, радиус 24, наша тень), текст `INK` / белый, заголовки Inter 400 + ключевое слово 700 (`*слово*` в `Words`/`Headline`, `<b>` в `Big`/`Header`), абзацы Raleway, цифры Inter, равные внутренние отступы, только светлый режим. Цвет ролика передается пропом `accent` (по умолчанию `INK`); красный/зеленый — только статусы. Старые ролики эти файлы не импортируют.
- **Сторонние** (`remocn`, `tactile`, `shadcn`, `paper`) в библиотеке не правим: стиль задаем пропсами (`theme="light"`, `accent`, `ink`, `background`), шрифт — оберткой `InterScope`, shadcn в `WebScale` — поверхностью `webSurface(s)`.
- Новый компонент: файл в `src/catalog/own/` + запись в `ENTRIES` + строка здесь.

## Свои (src/catalog/own) — в дизайн-системе (28)

| name | для чего | откуда |
|---|---|---|
| `words` | Фраза по словам: каждое слово поднимается с блюром; *слово* = жирное ключевое. | kit/reel → catalog/own/text |
| `said` | Слова появляются ровно в момент, когда их произносят (тайминги из words.ts), hi-слова акцентом. | v18 → catalog/own/text |
| `headline` | Сменяющийся заголовок сверху, он же субтитры без звука. | kit/reel → catalog/own/text |
| `strike` | «Не то»: слово краснеет, по бокам красные [ ] и красный фон, фон уходит. | v13–v15 → catalog/own/text |
| `big` | Огромная центральная фраза-панчлайн. | v16 → catalog/own/text |
| `header` | Заголовок сцены сверху поверх полноэкранного компонента. | v17 → catalog/own/text |
| `card` | Базовая карточка дизайн-системы (белая, радиус 24, наша тень, отступ 40). | kit/reel → catalog/own/surfaces |
| `pill` | Маленький тег / подпись: текст 500, иконка по смыслу. | kit/reel → catalog/own/surfaces |
| `chip` | Чипы-фильтры с иконкой по смыслу (текст 500): выскакивают по очереди, один выбирается (заливка акцентом). | v19 → catalog/own/surfaces |
| `bubble` | Реплики/комментарии людей слева и справа с тегом. | v13 → catalog/own/surfaces |
| `ai-bubble` | Реплика ИИ-ассистента внизу кадра, слова печатаются. | v17 → catalog/own/surfaces |
| `sticker` | Наклонная плашка-стикер цвета акцента для панчлайна. | v17 Badge → catalog/own/surfaces |
| `stamp` | Штамп, который «впечатывается»: вердикт, отказ, «одобрено». | v11, v15 → catalog/own/surfaces |
| `stat-tile` | Плитка метрики: подпись + большое число. | v3 → catalog/own/surfaces |
| `meter` | Горизонтальная шкала с процентом, краснеет ниже порога. | v13 → catalog/own/surfaces |
| `browser` | Окно браузера с адресной строкой — показать сайт/страницу. | v11 → catalog/own/surfaces |
| `terminal` | Окно терминала (светлое) для команд и логов. | v9 → catalog/own/surfaces |
| `check-circle` | Круглая галочка, которая прорисовывается (чек-листы). | v5 → catalog/own/icons |
| `verdict` | Статус да/нет: зеленая ✓ или красный ✕. | v11 → catalog/own/icons |
| `db-icon` | Иконка базы данных. | v11 → catalog/own/icons |
| `wordmark` | Вордмарк сайта «name.tld» с цветной точкой. | v18 → catalog/own/icons |
| `dot-grid` | Сетка точек (год = 365 дней), выделенные точки горят: «1 день из 365». | v14 Year → catalog/own/fx |
| `pointer` | Курсор мыши: плавно ездит по ключам, клик с рябью. | kit/reel → catalog/own/fx |
| `punch` | Жесткая склейка с коротким наездом камеры (вход в сцену). | v17 → catalog/own/fx |
| `power-off` | Выключение телевизора (светлое): картинка схлопывается в линию и точку. Конец ролика/сцены. | v17 → catalog/own/fx |
| `shake` | Тряска от удара (helper shake() из kit/reel) для любого элемента. | kit/reel |
| `web-scale` | Обертка для web-UI (shadcn): верстка в нативном размере и масштаб — текст остается четким. Есть также ScaleFill, FrameBox, Skip. | v19 Zoom → catalog/own/fx |
| `scale-fill` | Масштабировать полноэкранный 16:9-компонент внутри 9:16. | v17 Zoom → catalog/own/fx |

## Свои общие (используются старыми роликами) (7)

| name | для чего | откуда |
|---|---|---|
| `design-system` | Сводка дизайн-системы: заголовок Inter, абзац Raleway, карточка с числом, плашки, аватар со стойками. | kit/design + kit/TatAvatar |
| `tat-avatar` | Аватар-ведущий @the_tatarverse: эмоции по ключам, стойки вправо/влево/центр, субтитры на glass-плашках без иконок. | kit/TatAvatar |
| `dot-orbit-bg` | Фон по умолчанию для всех роликов (paper.design Dot Orbit). | kit/DotOrbitBg |
| `odometer` | Цифры прокручиваются как на счетчике (старое значение → новое). | ui/Odometer |
| `outro` | Концовка @const_proxima (RU/EN), добавляется withOutro(). | outro/Outro |
| `outro-tatarverse` | Концовка @the_tatarverse, добавляется withOutro(..., 'tatarverse'). | outro/TatarverseOutro |
| `cover` | Обложка ролика (Still Cover / CoverWide). | cover/Cover |

## tactile-glass-ui (5)

| name | для чего | откуда |
|---|---|---|
| `tactile-glass-word` | Слово из жидкого стекла — акцент в заголовке. На белом почти не видно — нужен цветной/текстурный фон за ним. | tactile-glass-ui (v1, v3, v5, v7) |
| `tactile-prompt-input` | Стеклянное поле ввода промпта (печать текста — через value). | tactile-glass-ui (v1, v3, v5, v19) |
| `tactile-switch` | Стеклянный переключатель. | tactile-glass-ui (v1, v7) |
| `tactile-tabs` | Стеклянные табы. | tactile-glass-ui (v1) |
| `tactile-button` | Стеклянная кнопка (shape='circle' для круглой). | tactile-glass-ui (v1, v19) |

## shadcn/ui (3)

| name | для чего | откуда |
|---|---|---|
| `shadcn-card` | Карточка shadcn (оборачивать в WebScale). | components/ui/card (v19) |
| `shadcn-button` | Кнопки shadcn: default / outline / secondary. | components/ui/button (v19) |
| `shadcn-badge` | Бейджи shadcn. | components/ui/badge (v19) |

## paper.design шейдеры (2)

| name | для чего | откуда |
|---|---|---|
| `shader-warp` | Анимированный шейдер-градиент на фон. | components/remocn/shader-warp (@paper-design) |
| `shader-warp-cream` | Кремовый шейдер-градиент (фон обложки). | components/remocn/shader-warp-cream (@paper-design) |

## Remocn (31)

| name | для чего | откуда |
|---|---|---|
| `chat-gpt` | Интерфейс ChatGPT с печатью промпта. | components/remocn/chat-gpt (v17) |
| `prompt-to-app` | Промпт → сборка → задеплоенное приложение. | components/remocn/prompt-to-app (v17) |
| `prompt-restyle` | Сайт перекрашивается по промптам «сделай красивее». | components/remocn/prompt-restyle (v17) |
| `exploded-view` | Стек слоев разлетается с подписями. | components/remocn/exploded-view (v17) |
| `speedrun-timer` | Таймер спидрана со сплитами. | components/remocn/speedrun-timer (v17) |
| `long-vowel` | Растянутая гласная: «Оооочень много». | components/remocn/long-vowel (v17) |
| `compact-stat` | Большое число со счетчиком: 12 млн. | components/remocn/compact-stat (v17) |
| `crash-zoom` | Подводка → резкий зум на ответ. | components/remocn/crash-zoom (v17) |
| `impact-shake` | Слово-удар с тряской. | components/remocn/impact-shake (v17) |
| `rank-climb` | Рейтинг: позиция поднимается с 6 на 1. | components/remocn/rank-climb (v17) |
| `analytics-funnel` | Воронка аналитики. | components/remocn/analytics-funnel (v17 Lab) |
| `shards-to-grid` | Скриншоты осколками собираются в сетку сайта. | components/remocn/shards-to-grid (v18) |
| `screenshot-tour` | Тур по скриншоту: зум на зоны с подписями. | components/remocn/screenshot-tour (v18, v19Wide) |
| `grid-montage` | Монтаж картинок сеткой в ритм. | components/remocn/grid-montage (v18) |
| `phone-scroll` | Телефон, в котором скроллится сайт. | components/remocn/phone-scroll (v19, v19Wide) |
| `number-split` | Итоговое число раскладывается на части. | components/remocn/number-split (v19) |
| `crew-of-one` | Один человек — много ролей (роли сменяются). | components/remocn/crew-of-one (v19) |
| `telegram-chat-flow` | Переписка в Telegram. | components/remocn/telegram-chat-flow (v19) |
| `confetti` | Конфетти: успех, праздник. | components/remocn/confetti (v19, v19Wide) |
| `icon-check` | Анимированная галочка. | components/remocn/icon-check (v19) |
| `quadtree-mark` | Логотип собирается из квадродерева + имя. | components/remocn/quadtree-mark (v19, v19Wide) |
| `flash-sweep` | Вспышка-шторка: переход между сценами. | components/remocn/flash-sweep (v19) |
| `parallax-depth` | Параллакс холмов с глубиной. | components/remocn/parallax-depth (v19Wide) |
| `search-reveal` | Поисковая строка: печать запроса и раскрытие. | components/remocn/search-reveal (v19Wide) |
| `dot-map` | Карта мира из точек с городами и счетчиком. | components/remocn/dot-map (v19Wide) |
| `fraction-split` | Дробь из фразы: 3/8 выделяется. | components/remocn/fraction-split (v19Wide) |
| `tile-wave` | Волна плиток меняет одну фразу на другую. | components/remocn/tile-wave (v19Wide) |
| `halftone-cut` | Растровый (halftone) переход между фразами. | components/remocn/halftone-cut (v19Wide) |
| `caret` | Мигающая каретка ввода. | components/remocn/caret (не использовался в роликах) |
| `font-cycle` | Слово перебирает шрифты. | components/remocn/font-cycle (не использовался) |
| `tv-power-off` | Выключение ТВ (canvas): в рендере падает, вместо него power-off. | components/remocn/tv-power-off (не использовался) |
