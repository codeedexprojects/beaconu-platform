import type { SectionSeedEntry } from "./types";

export const EMOTIONAL_INTELLIGENCE: SectionSeedEntry = {
  section: {
    slug: "emotional-intelligence",
    name: "Emotional Intelligence",
    description: "Assesses self-awareness, empathy, and interpersonal skills.",
    isCoreSection: true,
  },
  questionTypeSlugs: ["mcqSingle", "mcqMultiple", "essay", "highlightWords"],
};
