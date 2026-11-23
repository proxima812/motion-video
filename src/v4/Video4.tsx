import { RU, Strings, makeBillionReel } from "../v3/Video3";
import { F, VO } from "./timeline";

// Video 4 - EN version of Video 3 (same scenes, EN strings and voice timings)
const EN: Strings = {
  ...RU,
  locale: "en-US",
  unicorn: "🦄 UNICORN",
  valuation: "Startup valuation",
  how: "Step by step ↓",
  greet: "Hi! How can I help you today?",
  placeholder: "Ask anything",
  secret: "🤫 under the hood: still ChatGPT",
  tagline: "Proprietary AI infrastructure",
  wire: "Incoming wire",
  investors: ["FOMO Ventures", "Hype Capital", "My Uncle LP"],
  stats: { val: "Valuation", raised: "Raised", users: "Users", api: "API bill" },
  cheap: "so lean",
  usersNote: "so far",
  headlines: (F) => [
    { from: 14, text: "My startup is worth $1B." },
    { from: F.showHow, text: "Here's how I did it." },
    { from: F.buildIn + 6, text: "Step 1. A plain ChatGPT chat." },
    { from: F.dress, text: "Step 2. A pretty interface." },
    { from: F.logo, text: "+ an animated logo." },
    { from: F.pitchIn + 6, text: "Step 3. Call it infrastructure." },
    { from: F.raised, text: "Raised $40M." },
    { from: F.dashIn + 6, text: "No users yet." },
    { from: F.but, text: "But our API bill:" },
  ],
};

export const Video4 = makeBillionReel(F, VO, EN);
