import { RU, Strings, makeMeetingReel } from "../v7/Video7";
import { F, VO } from "./timeline";

// Video 8 - EN version of Video 7 (same scenes, EN strings and voice timings)
const EN: Strings = {
  ...RU,
  call: "Weekly sync",
  people: ["Anna", "Oleg", "Maria", "Dima"],
  decisions: "Decisions",
  notes: ["circle back later", "schedule another meeting", "everyone agrees"],
  setting: "Agents can book meetings",
  on: "On",
  off: "Off",
  invite: "Sync about the sync",
  invitedBy: "Agent-3 invited: Agent-1, Agent-2, Agent-4",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  today: "meetings today",
  transcript: "Transcript · meeting #400",
  quotes: ["Let's circle back on this.", "Great.", "Let's schedule a meeting.", "Great idea."],
  kpi: "Productivity",
  kpiNote: "vs last quarter",
  headlines: (F) => [
    { from: 14, text: "We replaced people in meetings with AI." },
    { from: F.agentsIn + 6, text: "Agents join calls and log decisions." },
    { from: F.permIn + 6, text: "Then they could book meetings." },
    { from: F.weekIn + 6, text: "A week later:" },
    { from: F.n400, text: "400 meetings a day." },
    { from: F.lookIn + 6, text: "What do they talk about?" },
    { from: F.q1, text: "" },
    { from: F.prodIn + 4, text: "Productivity went up by:" },
  ],
};

export const Video8 = makeMeetingReel(F, VO, EN);
