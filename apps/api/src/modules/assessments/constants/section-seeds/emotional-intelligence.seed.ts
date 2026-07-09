import type { SectionSeedEntry } from "./types";

export const EMOTIONAL_INTELLIGENCE: SectionSeedEntry = {
  section: {
    slug: "emotional-intelligence",
    name: "Emotional Intelligence",
    description: "Assesses self-awareness, empathy, and interpersonal skills.",
    isCoreSection: true,
  },
  questionTypes: [
    {
      slug: "scenario-based-mcq",
      name: "Scenario-Based MCQ",
      category: "emotional_intelligence",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
    {
      slug: "likert-scale",
      name: "Likert Scale",
      category: "emotional_intelligence",
      responseFormat: "likert_scale",
      hasAudio: false,
      hasImage: false,
      hasPassage: false,
      autoScorable: false,
    },
    {
      slug: "situational-judgement",
      name: "Situational Judgement",
      category: "emotional_intelligence",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
  ],
};
