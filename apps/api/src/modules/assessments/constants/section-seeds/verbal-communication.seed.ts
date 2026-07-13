import type { SectionSeedEntry } from "./types";

export const VERBAL_COMMUNICATION: SectionSeedEntry = {
  section: {
    slug: "verbal-communication",
    name: "Verbal Communication",
    description:
      "Assesses spoken and comprehension skills through audio, image, and situational prompts.",
    isCoreSection: true,
  },
  questionTypes: [
    {
      slug: "audio-comprehension",
      name: "Audio Comprehension",
      category: "verbal",
      responseFormat: "audio_response",
      hasAudio: true,
      hasImage: false,
      hasPassage: false,
      autoScorable: false,
    },
    {
      slug: "repeat-sentence",
      name: "Repeat Sentence",
      category: "verbal",
      responseFormat: "audio_response",
      hasAudio: true,
      hasImage: false,
      hasPassage: false,
      autoScorable: false,
    },
    {
      slug: "read-aloud",
      name: "Read Aloud",
      category: "verbal",
      responseFormat: "audio_response",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: false,
    },
    {
      slug: "respond-to-a-situation",
      name: "Respond to a Situation",
      category: "verbal",
      responseFormat: "audio_response",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: false,
    },
    {
      slug: "describe-image",
      name: "Describe Image",
      category: "verbal",
      responseFormat: "audio_response",
      hasAudio: false,
      hasImage: true,
      hasPassage: false,
      autoScorable: false,
    },
  ],
};
