export interface SectionSeed {
  slug: string;
  name: string;
  description: string;
  isCoreSection: boolean;
}

export interface QuestionTypeSeed {
  slug: string;
  name: string;
  category: string;
  responseFormat: string;
  answerFormat: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  autoScorable: boolean;
}

export interface SectionSeedEntry {
  section: SectionSeed;
  questionTypeSlugs: string[];
}
