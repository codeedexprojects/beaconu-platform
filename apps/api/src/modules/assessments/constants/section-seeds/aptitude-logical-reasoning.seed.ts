import type { SectionSeedEntry } from "./types";

export const APTITUDE_LOGICAL_REASONING: SectionSeedEntry = {
  section: {
    slug: "aptitude-logical-reasoning",
    name: "Aptitude & Logical Reasoning",
    description:
      "Evaluates quantitative aptitude, pattern recognition, and logical deduction.",
    isCoreSection: true,
  },
  questionTypes: [
    {
      slug: "mcq",
      name: "MCQ",
      category: "aptitude",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: false,
      autoScorable: true,
    },
    {
      slug: "data-interpretation",
      name: "Data Interpretation",
      category: "aptitude",
      responseFormat: "single_choice",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
    {
      slug: "sequence-questions",
      name: "Sequence Questions",
      category: "aptitude",
      responseFormat: "sequence",
      hasAudio: false,
      hasImage: false,
      hasPassage: false,
      autoScorable: true,
    },
    {
      slug: "fill-blanks-drag-drop",
      name: "Fill in the Blanks - Drag & Drop",
      category: "aptitude",
      responseFormat: "fill_blank_drag_drop",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
    {
      slug: "fill-blanks-dropdown",
      name: "Fill in the Blanks - Drop Down",
      category: "aptitude",
      responseFormat: "fill_blank_dropdown",
      hasAudio: false,
      hasImage: false,
      hasPassage: true,
      autoScorable: true,
    },
  ],
};
