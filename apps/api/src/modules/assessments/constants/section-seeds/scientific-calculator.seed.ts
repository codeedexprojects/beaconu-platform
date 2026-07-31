import type { SectionSeedEntry } from "./types";

export const SCIENTIFIC_CALCULATOR: SectionSeedEntry = {
  section: {
    slug: "scientific-calculator",
    name: "Scientific Calculator Section",
    description:
      "Problems requiring trigonometric, logarithmic, and exponential computations. Course-specific — for Engineering / Sciences / Technology courses.",
    isCoreSection: false,
  },
  questionTypeSlugs: ["mcqSingle"],
};
