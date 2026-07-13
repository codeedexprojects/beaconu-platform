import type { SectionSeedEntry } from "./types";

export const BASIC_CALCULATOR: SectionSeedEntry = {
  section: {
    slug: "basic-calculator",
    name: "Basic Calculator Section",
    description:
      "Arithmetic, percentages, unit conversions, and general problem-solving. Course-specific — for Arts / Humanities / General Programs courses.",
    isCoreSection: false,
  },
  questionTypes: [
    {
      slug: "basic-calculation-problem",
      name: "Basic Calculation Problem",
      category: "calculator",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
  ],
};
