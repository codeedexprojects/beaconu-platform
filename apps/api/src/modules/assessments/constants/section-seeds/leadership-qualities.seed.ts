import type { SectionSeedEntry } from "./types";

export const LEADERSHIP_QUALITIES: SectionSeedEntry = {
  section: {
    slug: "leadership-qualities",
    name: "Leadership Qualities",
    description:
      "Gauges decision-making, situational judgement, and team-orientation.",
    isCoreSection: true,
  },
  questionTypeSlugs: [
    "mcqSingle",
    "essay",
    "dialogueCompletion",
    "highlightWords",
  ],
};
