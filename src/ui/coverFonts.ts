import { loadFont as marck } from "@remotion/google-fonts/MarckScript";
import { loadFont as manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as badScript } from "@remotion/google-fonts/BadScript";
import { loadFont as onest } from "@remotion/google-fonts/Onest";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as pangolin } from "@remotion/google-fonts/Pangolin";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as lobster } from "@remotion/google-fonts/Lobster";
import { loadFont as golos } from "@remotion/google-fonts/GolosText";
import { loadFont as neucha } from "@remotion/google-fonts/Neucha";

// Cover font pairs: handwritten accent (words in *stars*) + body font for the rest of the title and description
const B = { weights: ["500", "800"] as ("500" | "800")[], subsets: ["latin", "cyrillic"] as ("latin" | "cyrillic")[] };
const S = { subsets: ["latin", "cyrillic"] as ("latin" | "cyrillic")[] };

export type FontPair = "marck-manrope" | "badscript-onest" | "caveat-inter" | "pangolin-montserrat" | "lobster-golos" | "neucha-manrope";

export const FONT_PAIRS: Record<FontPair, { accent: string; accentWeight: number; body: string }> = {
  "marck-manrope": { accent: marck("normal", S).fontFamily, accentWeight: 400, body: manrope("normal", B).fontFamily },
  "badscript-onest": { accent: badScript("normal", S).fontFamily, accentWeight: 400, body: onest("normal", B).fontFamily },
  "caveat-inter": { accent: caveat("normal", { weights: ["700"], ...S }).fontFamily, accentWeight: 700, body: inter("normal", { ...B, weights: ["500", "800", "900"] }).fontFamily },
  "pangolin-montserrat": { accent: pangolin("normal", S).fontFamily, accentWeight: 400, body: montserrat("normal", B).fontFamily },
  "lobster-golos": { accent: lobster("normal", S).fontFamily, accentWeight: 400, body: golos("normal", B).fontFamily },
  "neucha-manrope": { accent: neucha("normal", S).fontFamily, accentWeight: 400, body: manrope("normal", B).fontFamily },
};
