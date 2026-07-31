import type { SectionSeedEntry } from "./types";

export const FINANCIAL_CALCULATOR: SectionSeedEntry = {
  section: {
    slug: "financial-calculator",
    name: "Financial Calculator Section",
    description:
      "Interest calculations, amortisation, NPV, IRR, and financial ratio problems. Course-specific — for Commerce / Finance / MBA / Economics courses.",
    isCoreSection: false,
  },
  questionTypeSlugs: ["mcqSingle"],
};
