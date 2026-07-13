import type { SectionSeedEntry } from "./types";

export const LEADERSHIP_QUALITIES: SectionSeedEntry = {
  section: {
    slug: "leadership-qualities",
    name: "Leadership Qualities",
    description:
      "Gauges decision-making, situational judgement, and team-orientation.",
    isCoreSection: true,
  },
  questionTypes: [
    {
      slug: "scenario-based-writing",
      name: "Scenario-Based Writing (Text)",
      category: "leadership",
      responseFormat: "text_response",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: false,
    },
    {
      slug: "ranking-questions",
      name: "Ranking Questions",
      category: "leadership",
      responseFormat: "ranking",
      hasAudio: false,
      hasImage: false,
      hasPassage: false,
      autoScorable: true,
    },
  ],
};
