import type { SectionSeedEntry } from "./types";

export const VERBAL_COMMUNICATION: SectionSeedEntry = {
  section: {
    slug: "verbal-communication",
    name: "Verbal Communication",
    description:
      "Assesses spoken and comprehension skills through audio, image, and situational prompts.",
    isCoreSection: true,
  },
  questionTypeSlugs: [
    "audioSpeakingResponse",
    "repeatSentence",
    "readAloud",
    "describeImage",
  ],
};
