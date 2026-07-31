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
  // Rendering category for the frontend (selection/textInput/
  // audioListening/visualHighlight/audioSpeaking/visualImage) — NOT the
  // assessment topic. A single canonical type (e.g. "mcqSingle") is
  // typically referenced by several SectionSeedEntry's questionTypeSlugs,
  // since it's the same answer mechanic regardless of which topic it's
  // being asked about.
  category: string;
  responseFormat: string;
  // Which answer widget the frontend renders — multiOptionSelection /
  // singleOptionSelection / slotFillSelection / freeText /
  // wordHighlightSelection / audioRecording.
  answerFormat: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  autoScorable: boolean;
}

export interface SectionSeedEntry {
  section: SectionSeed;
  // References into QUESTION_TYPE_SEEDS (constants/section-seeds/question-type-seeds.ts)
  // by slug — a section doesn't own its own type definitions, since
  // QuestionType.slug is unique per college (not per section): the same
  // canonical type is shared across every section that offers it.
  questionTypeSlugs: string[];
}
