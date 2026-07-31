import type { SectionSeedEntry } from "./types";
import { VERBAL_COMMUNICATION } from "./verbal-communication.seed";
import { APTITUDE_LOGICAL_REASONING } from "./aptitude-logical-reasoning.seed";
import { LISTENING_READING } from "./listening-reading.seed";
import { LEADERSHIP_QUALITIES } from "./leadership-qualities.seed";
import { EMOTIONAL_INTELLIGENCE } from "./emotional-intelligence.seed";
import { WRITTEN_COMMUNICATION } from "./written-communication.seed";
import { SCIENTIFIC_CALCULATOR } from "./scientific-calculator.seed";
import { FINANCIAL_CALCULATOR } from "./financial-calculator.seed";
import { BASIC_CALCULATOR } from "./basic-calculator.seed";

export const SECTION_SEEDS: Record<string, SectionSeedEntry> = {
  [VERBAL_COMMUNICATION.section.slug]: VERBAL_COMMUNICATION,
  [APTITUDE_LOGICAL_REASONING.section.slug]: APTITUDE_LOGICAL_REASONING,
  [LISTENING_READING.section.slug]: LISTENING_READING,
  [LEADERSHIP_QUALITIES.section.slug]: LEADERSHIP_QUALITIES,
  [EMOTIONAL_INTELLIGENCE.section.slug]: EMOTIONAL_INTELLIGENCE,
  [WRITTEN_COMMUNICATION.section.slug]: WRITTEN_COMMUNICATION,
  [SCIENTIFIC_CALCULATOR.section.slug]: SCIENTIFIC_CALCULATOR,
  [FINANCIAL_CALCULATOR.section.slug]: FINANCIAL_CALCULATOR,
  [BASIC_CALCULATOR.section.slug]: BASIC_CALCULATOR,
};

export type { SectionSeed, QuestionTypeSeed, SectionSeedEntry } from "./types";
