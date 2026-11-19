# Озвучка ElevenLabs: v4 и v3

Обе модели рабочие. По умолчанию `eleven_v4`, `eleven_v3` - по выбору пользователя или если v4 не подошел (клон звучит иначе, endpoint не принимает модель). Голос определяется выбранным в `SKILL.md` пресетом. Второй пресет: Alicja - Warm & Understanding, voice_id `iCzRDxXsrROcDYzWimM9`, модель `eleven_v4` для обоих аккаунтов. Для основного пресета голос по умолчанию - Kyle `JyzM229ZjDtptOZjn48b` (как в `scripts/gen-vo.sh`); для @the_tatarverse - Ahu `xyqF3vGMQlPk3e7yA4DI` на `eleven_v4`, ключ - `ELEVENLABS_KEY` из `.env`.

## Общее для v4 и v3

- `model_id` указывать всегда: без него Speech берет `eleven_multilingual_v2`, Dialogue - `eleven_v3`.
- `language_code` по языку сценария: `"ru"` или `"en"`.
- Audio tags одинаковые: на английском, в квадратных скобках, прямо перед фразой (`[sarcastic] Твой код опять работает только локально.`) или после нее для реакции (`Все работает. [sighs]`). Список открытый: `[curious]`, `[excited]`, `[mischievously]`, `[whispers]`, `[shouts]`, `[laughs]`, `[exhales]`, `[clears throat]`, `[short pause]`, `[long pause]`, `[measured]`, `[deep, cinematic]`, `[Quick, light, playful pace]`. Можно сочетать.
- Ремарка без скобок будет произнесена вслух. Тег иногда превращается в звук вместо подачи - формулируй направление голоса явно. Начинай с малого числа тегов.
- SSML (`<break time="1.5s"/>`) не работает. Паузы - тегами, многоточием (может дать неуверенность), пунктуацией. Точные паузы под монтаж - уже в аудио (ffmpeg).
- КАПС усиливает ударение - точечно.
- Числа, сокращения, символы заранее расписывай словами, как они должны прозвучать: домен `tatarverse.cc` -> «Татарверс точка си си», версия `5.2` -> «пять точка два», `100%` -> «сто процентов», `@the_tatarverse` -> «зе татарверс». На экране остается оригинал: склей слова обратно через `MERGE` в `words-vN.py` (образец - `scripts/words-v51.py`). Для сложных терминов - IPA (см. v4) или словари произношения (`pronunciation_dictionary_locators`, до трех).
- `seed` (0-4294967295) помогает повторить дубль, но не гарантирует.
- Формат: `mp3_44100_192` (Creator+) по умолчанию, `wav_48000` если тариф позволяет. PCM - сырые данные, не переименовывать в `.wav`.
- Тайминги: можно сразу `.../with-timestamps` (посимвольные `alignment`, время слова = начало первой буквы - конец последней; `normalized_alignment` - для текста после раскрытия чисел). Либо whisper/Forced Alignment по готовому файлу. После обрезки или вставки пауз тайминги пересчитать.

## v4 (`eleven_v4`)

- Лучше качество, эмоции и выполнение тегов. Клон точнее копирует исходник, поэтому голос может звучать иначе, чем на v3: при сомнениях сделай один и тот же абзац на обеих моделях и дай выбрать.
- Лимит каталога 10 000 символов, но держи запрос в пределах 2000 символов, длинный текст режь по абзацам и склеивай ffmpeg concat.
- Настройки: только `stability` (0.5; ниже - эмоциональнее) и similarity (0.75; выше - точнее голос, но менее естественно). **`speed` и `style` нет** - не передавай. Темп - тегами. У PVC-голосов на v4 есть еще Clone Strength - начинай с 0%.
- Акцент: если язык текста совпадает с языком исходника голоса, акцент сохраняется; если нет - v4 говорит чисто на языке текста, без акцента исходника (так задумано, не баг).
- IPA: слово в кавычках и слэшах, с ударениями `ˈ` / `ˌ`: `Это "/t͡ɕækˈt͡ɕæk/"`. Только для отдельных слов: татарские имена и слова в RU/EN озвучке (татарского TTS нет), бренды, термины. Сделай 2-3 дубля и выбери лучший. IPA попадает в `alignment` - в `words-vN.py` замени его на экранное слово через `MERGE`.
- Поле similarity: в Speech `voice_settings.similarity_boost`, в Dialogue `settings.similarity`.
- Endpoint: сначала Speech `POST /v1/text-to-speech/{voice_id}`. Если v4 там не принимается - `POST /v1/text-to-dialogue` с `{"inputs":[{"text":..., "voice_id":...}], "model_id":"eleven_v4", "settings":{"stability":0.5,"similarity":0.75}}`.
- `eleven_v4_turbo` - для живых диалогов, для роликов не используем.
- PVC-голоса может понадобиться дообучить под v4 (My Voices). Voice Design голоса бывают менее выразительными.

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_192
{"text": "...", "model_id": "eleven_v4", "language_code": "en",
 "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
```
Файл: `public/vN/vo/l<номер реплики>.mp3`.

### Теги на v4

- **Описывай голос, а не одно слово**, когда нужна точная подача: `[low, steady voice, restrained urgency]`, `[warm, conversational tone, faint amusement]`, `[quiet, reflective]`. Однословные теги (`[warm]`, `[curious]`) остаются базой.
- **Дуга внутри реплики**: `[gentle pause, then quiet realization]`, `[gentle laugh, then sincere]`, `[voice rising into firm resolve]`, `[pause, then normally]`. Тег посреди реплики меняет подачу на ходу: `Смотри... [whispers] никто не знает.`
- **Реакции голосом** (ставь после фразы, на которую реагируют): `[laughs]`, `[chuckles]`, `[giggles]`, `[starts laughing]`, `[stifling laughter]`, `[sighs]`, `[frustrated sigh]`, `[happy gasp]`, `[exhales sharply]`, `[inhales deeply]`, `[gulps]`, `[snorts]`, `[muttering]`.
- **Эмоции и роли**: `[sympathetic]`, `[reassuring]`, `[thoughtful]`, `[questioning]`, `[appalled]`, `[dismissive]`, `[sheepishly]`, `[deadpan]`, `[dramatically]`, `[impressed]`, `[delighted]`, `[nervously]`, `[professional]`.
- **Не используй**: звуковые эффекты (`[applause]`, `[gunshot]`, `[explosion]`, `[clapping]`) - звуки только из библиотеки `SFX/`; не голосовые теги (`[standing]`, `[grinning]`, `[pacing]`, `[music]`); `[sings]` и `[strong X accent]` - только если сценарий просит.
- **Под характер голоса**: v4 выполнит и чужую для голоса подачу (шепот, крик), но хуже. Kyle (уверенный) - сарказм, `[deadpan]`, `[excited]`; Ahu (cheerful) - `[warm]`, `[playful]`, `[curious]`, без мрачного шепота; Alicja (warm & understanding) - `[sympathetic]`, `[reassuring]`, мягкие реакции, без крика. Непривычную подачу проверь отдельным дублем.
- **Пунктуация**: `...` - пауза и вес, `?` / `!` - интонация, `—` в конце реплики - оборванная фраза, КАПС - ударение. Экранные слова берутся из `alignment`, поэтому КАПС в `words-vN.py` приводи к обычному регистру.

**Если сценарий пришел без тегов** - расставь их сам по правилам кнопки Enhance и покажи пользователю до генерации: слова не меняй, только добавляй теги, КАПС, `?`, `!`, `...`; тег описывает звук голоса; ставь перед фразой или сразу после нее; меняй эмоции от реплики к реплике, а не один тег подряд; не превращай описание из текста в тег («он засмеялся» не становится `[laughs]`).

### Два ведущих (Dialogue)

По умолчанию каждая реплика - отдельный запрос в Speech своим голосом (`scripts/gen-vo-v51.py`). Если нужен живой разговор с перебиванием и реакциями друг на друга - весь диалог одним запросом `POST /v1/text-to-dialogue/with-timestamps`: `inputs` с `voice_id` каждого, `model_id: "eleven_v4"`, суммарно до ~2000 символов. В ответе `voice_segments` (`start_time_seconds`, `end_time_seconds`, `dialogue_input_index`) - по ним режь ffmpeg на `l<N>.mp3`, а `alignment` дели по `character_start_index` / `character_end_index`. Перебивание: реплика кончается `—`, следующая начинается с `[jumping in] —` или `[interrupting]`. Разговор целиком сначала покажи пользователю на одном дубле.

## v3 (`eleven_v3`)

- Лимит 5000 символов на запрос.
- Настройки: speed 1.0, stability 0.5, similarity_boost 0.75.

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_192
{"text": "...", "model_id": "eleven_v3", "language_code": "en",
 "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": 1.0}}
```
Файл: `public/vN/vo/l<номер реплики>.mp3`.
