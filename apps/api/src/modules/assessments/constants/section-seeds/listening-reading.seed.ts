import type { SectionSeedEntry } from "./types";

export const LISTENING_READING: SectionSeedEntry = {
  section: {
    slug: "listening-reading",
    name: "Listening & Reading",
    description:
      "Tests comprehension through audio passages and reading excerpts.",
    isCoreSection: true,
  },
  questionTypes: [
    {
      slug: "audio-comprehension",
      name: "Audio Comprehension",
      category: "listening_reading",
      responseFormat: "audio_response",
      hasAudio: true,
      hasImage: false,
      hasPassage: false,
      autoScorable: false,
    },
    {
      slug: "mcq",
      name: "MCQ",
      category: "listening_reading",
      responseFormat: "single_choice",
      hasAudio: true,
      hasImage: false,
      hasPassage: false,
      autoScorable: true,
    },
    {
      slug: "true-false",
      name: "True/False",
      category: "listening_reading",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
    {
      slug: "passage-based-questions",
      name: "Passage-Based Questions",
      category: "listening_reading",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
  ],
};
