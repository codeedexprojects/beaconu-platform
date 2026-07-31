import type { SectionSeedEntry } from "./types";

export const LISTENING_READING: SectionSeedEntry = {
  section: {
    slug: "listening-reading",
    name: "Listening & Reading",
    description:
      "Tests comprehension through audio passages and reading excerpts.",
    isCoreSection: true,
  },
  questionTypeSlugs: [
    "audioMcqSingle",
    "audioMcqMultiple",
    "audioBestOption",
    "audioDragAndDropFill",
    "audioDropdownFill",
    "summarizeSpokenText",
  ],
};
