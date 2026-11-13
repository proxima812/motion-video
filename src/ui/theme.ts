import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

export const C = {
  bg: "#07080B",
  window: "#0C0D11",
  panel: "#121318",
  panelHi: "#16171D",
  border: "rgba(255,255,255,0.075)",
  borderHi: "rgba(255,255,255,0.14)",
  text: "#F4F5F7",
  muted: "#8B909A",
  dim: "#5B606A",
  accent: "#7C6CFF",
  accent2: "#4F8CFF",
  green: "#3DD68C",
  greenBg: "rgba(61,214,140,0.12)",
};
