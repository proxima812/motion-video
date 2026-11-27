# motion-video

## Git
- Commit ANY change right away, without asking: code, components, rules, skills, configs — every edit, however small (one logical change = one commit, clear message). Never leave uncommitted work at the end of a step. Push to `origin main` (or the current branch), so any step can be rolled back.
- Only the engine, components and rules are in git. Never commit reels/media (`video/`, `public/`, `out/`, `avatars/ahu/`, `SFX/`, audio/video files) or keys (`.env`, tokens) — see `.gitignore`.

## Host style presets
- Every @the_tatarverse host has her own reel style, tied to the avatar: animation, elements, decor, way of telling the idea, palette family and cover styles. Code: `src/kit/presets/<host>.tsx`; full rules: `.claude/skills/new-v/SKILL.md` «Пресеты ведущих»; samples V75-V78.
  - Ahu - эксперт: covers giant-number / timer; grid + ripple bg, mask slide-ups, fast cuts; thesis → number → short conclusion; palettes emerald / gold / forest.
  - Alicja - подруга: cover bubble; warm glows + dots, handwritten accents, soft blur crossfades; story → feeling → soft conclusion; palettes honey / terracotta / caramel.
  - Камиля - хранительница: covers form-stamp / map; ruled paper, Prata serif, slow dissolves; «раньше → сейчас» → moral; palettes garnet / rose / olive.
  - Алсу - студентка: covers sticker / big-type; bright rays, sticker words with hard shadows, bouncy pops + swipes; question → «проверь себя» → answer; palettes cobalt / sky / indigo.
- A single-host tatarverse reel uses its host's preset by default (`SoloReel` with `look: true`, the host's Title / motion / elements, cover in one of her styles, one palette of her family, the next reel of that host takes another). «Основной» (default kit) stays for @const_proxima and reels without a preset. Duo / quad reels only when the reel needs them.
- Never give a host another host's style, palette or cover styles. A new element goes into its host's preset file (and her `Showcase`).

## Package manager
- Always use `bun` / `bunx` (e.g. `bunx remotion still ...`). Never `npx`, `npm` or `pnpm`.
