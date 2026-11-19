# motion-video

## Git
- Commit ANY change right away, without asking: code, components, rules, skills, configs — every edit, however small (one logical change = one commit, clear message). Never leave uncommitted work at the end of a step. Push to `origin main` (or the current branch), so any step can be rolled back.
- Only the engine, components and rules are in git. Never commit reels/media (`video/`, `public/`, `out/`, `tat_avatar/`, `SFX/`, audio/video files) or keys (`.env`, tokens) — see `.gitignore`.

## Package manager
- Always use `bun` / `bunx` (e.g. `bunx remotion still ...`). Never `npx`, `npm` or `pnpm`.
