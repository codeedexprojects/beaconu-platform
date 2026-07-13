import type { SectionSeedEntry } from "./types";

export const SCIENTIFIC_CALCULATOR: SectionSeedEntry = {
  section: {
    slug: "scientific-calculator",
    name: "Scientific Calculator Section",
    description:
      "Problems requiring trigonometric, logarithmic, and exponential computations. Course-specific — for Engineering / Sciences / Technology courses.",
    isCoreSection: false,
  },
  questionTypes: [
    {
      slug: "scientific-calculation-problem",
      name: "Scientific Calculation Problem",
      category: "calculator",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
  ],
};
