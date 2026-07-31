import type { SectionSeedEntry } from "./types";

export const APTITUDE_LOGICAL_REASONING: SectionSeedEntry = {
  section: {
    slug: "aptitude-logical-reasoning",
    name: "Aptitude & Logical Reasoning",
    description:
      "Evaluates quantitative aptitude, pattern recognition, and logical deduction.",
    isCoreSection: true,
  },
  questionTypeSlugs: [
    "mcqSingle",
    "mcqMultiple",
    "dragAndDropFill",
    "dropdownFill",
    "dataInterpretation",
  ],
};
