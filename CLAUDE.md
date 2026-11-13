# motion-video

## Git
- Every change is committed right away (one logical change = one commit, clear message) and pushed to `origin main`, so any step can be rolled back.
- Only the engine, components and rules are in git. Never commit reels/media (`video/`, `public/`, `out/`, `tat_avatar/`, `SFX/`, audio/video files) or keys (`.env`, tokens) — see `.gitignore`.

## Package manager
- Always use `bun` / `bunx` (e.g. `bunx remotion still ...`). Never `npx`, `npm` or `pnpm`.
