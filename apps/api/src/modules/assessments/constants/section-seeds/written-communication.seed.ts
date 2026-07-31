import type { SectionSeedEntry } from "./types";

export const WRITTEN_COMMUNICATION: SectionSeedEntry = {
  section: {
    slug: "written-communication",
    name: "Written Communication",
    description:
      "Evaluates written expression through essays, professional writing, and structured compositions.",
    isCoreSection: true,
  },
  questionTypeSlugs: [
    "essay",
    "textSummary",
    "email",
    "letter",
    "notice",
    "dialogueCompletion",
  ],
};
