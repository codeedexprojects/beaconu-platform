export interface SectionSeed {
  slug: string;
  name: string;
  description: string;
  /**
   * Core sections apply globally to every course (no per-question course
   * mapping allowed). Non-core (calculator) sections are course-specific —
   * every question must be mapped to at least one course.
   */
  isCoreSection: boolean;
}

export interface QuestionTypeSeed {
  slug: string;
  name: string;
  category: string;
  responseFormat: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  autoScorable: boolean;
}

export interface SectionSeedEntry {
  section: SectionSeed;
  questionTypes: QuestionTypeSeed[];
}
