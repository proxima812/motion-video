import { RU, Strings, makeVibeReel } from "../v5/Video5";
import { F, VO } from "./timeline";

// Video 6 - EN version of Video 5 (same scenes, EN strings and voice timings)
const EN: Strings = {
  ...RU,
  prompt: "build me a startup. fast",
  placeholder: "Describe your idea",
  agent: "Vibe Coder",
  mode: "No tests",
  done: "✓ Done",
  secs: "in 9.8 sec",
  checklist: "Launch checklist",
  items: ["Beautiful UI", "Perfect architecture", "Stripe connected", "Tests"],
  later: "later",
  signup: "Sign up",
  button: "Create account",
  fixPrompt: "fix the signup pls",
  rebuilding: "Rebuilding the app…",
  rebuiltDone: "App rebuilt",
  changed: "Files changed",
  removed: "Files deleted",
  empty: "empty",
  ready: "Production ready",
  zeros: ["0 files", "0 bugs", "0 errors"],
  headlines: (F) => [
    { from: 14, text: "A startup in 10 seconds." },
    { from: F.done, text: "And it actually did it!" },
    { from: F.uiIn + 6, text: "Everything is perfect." },
    { from: F.testing, text: "Only testing left." },
    { from: F.signupIn + 6, text: "I hit sign up." },
    { from: F.error, text: "Error 500." },
    { from: F.fixAsk, text: "Okay, let it fix that." },
    { from: F.rebuildIn + 6, text: "The AI rebuilt everything." },
    { from: F.prodIn, text: "Now it's production ready." },
  ],
};

export const Video6 = makeVibeReel(F, VO, EN);
