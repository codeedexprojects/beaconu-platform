import { z } from "zod";

// Every section on this screen is supplementary/extracurricular — nothing
// here is required to submit an application, unlike personal/family/
// address/qualification. Every array defaults to [] so a student who
// fills in only one or two sections doesn't have to send empty arrays
// for the rest.

const internshipEntrySchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Company/Organization name is required")
    .max(255),
  role: z.string().trim().min(1, "Role/Position is required").max(150),
  start_date: z.coerce.date().optional().nullable(),
  end_date: z.coerce.date().optional().nullable(),
  key_responsibilities: z.string().trim().max(2000).optional().nullable(),
});

const workExperienceEntrySchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required").max(255),
  job_title: z.string().trim().max(150).optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
  employment_type: z.string().trim().max(50).optional().nullable(),
  total_experience: z.string().trim().max(50).optional().nullable(),
});

const languageEntrySchema = z.object({
  language: z.string().trim().min(1, "Language is required").max(50),
  proficiency: z.string().trim().max(30).optional().nullable(),
});

const academicAwardSchema = z.object({
  title: z.string().trim().min(1, "Award title is required").max(255),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
  issuing_body: z.string().trim().max(255).optional().nullable(),
  proof_url: z.string().trim().url().optional().nullable(),
});

const sportsAchievementSchema = z.object({
  sport_name: z.string().trim().min(1, "Sport name is required").max(100),
  competition_level: z.string().trim().max(50).optional().nullable(),
  position_secured: z.string().trim().max(50).optional().nullable(),
  achievement_year: z.number().int().min(1950).max(2100).optional().nullable(),
  certificate_url: z.string().trim().url().optional().nullable(),
});

const artsCulturalAchievementSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(100),
  competition_name: z.string().trim().max(255).optional().nullable(),
  achievement_level: z.string().trim().max(50).optional().nullable(),
  position_secured: z.string().trim().max(50).optional().nullable(),
  certificate_url: z.string().trim().url().optional().nullable(),
});

const publicationEntrySchema = z.object({
  title: z.string().trim().min(1, "Publication title is required").max(255),
  journal_publisher: z.string().trim().max(255).optional().nullable(),
  url: z.string().trim().url().optional().nullable(),
});

const patentEntrySchema = z.object({
  title: z.string().trim().min(1, "Patent title is required").max(255),
  patent_number: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["filed", "published", "granted"]),
  filing_date: z.coerce.date().optional().nullable(),
  patent_office: z.string().trim().max(150).optional().nullable(),
  co_inventors: z.string().trim().max(500).optional().nullable(),
  document_url: z.string().trim().url().optional().nullable(),
});

const certificationEntrySchema = z.object({
  name: z.string().trim().min(1, "Certification name is required").max(255),
  issuing_authority: z
    .string()
    .trim()
    .min(1, "Issuing authority is required")
    .max(255),
  certification_id: z.string().trim().max(100).optional().nullable(),
  issue_date: z.coerce.date().optional().nullable(),
  expiry_date: z.coerce.date().optional().nullable(),
  verification_url: z.string().trim().url().optional().nullable(),
  certificate_url: z.string().trim().url().optional().nullable(),
});

const portfolioLinksSchema = z.object({
  linkedin_url: z.string().trim().url().optional().nullable(),
  github_url: z.string().trim().url().optional().nullable(),
  researchgate_url: z.string().trim().url().optional().nullable(),
  google_scholar_url: z.string().trim().url().optional().nullable(),
  orcid_id: z.string().trim().max(30).optional().nullable(),
  personal_website_url: z.string().trim().url().optional().nullable(),
  behance_url: z.string().trim().url().optional().nullable(),
  dribbble_url: z.string().trim().url().optional().nullable(),
  kaggle_url: z.string().trim().url().optional().nullable(),
});

const recommendationLetterSchema = z.object({
  document_url: z.string().trim().url("A file must be uploaded"),
});

const innovationEntrySchema = z.object({
  startup_name: z.string().trim().min(1, "Startup name is required").max(255),
  role: z.string().trim().max(100).optional().nullable(),
  contribution: z.string().trim().max(2000).optional().nullable(),
  incubation_support: z.string().trim().max(255).optional().nullable(),
  dpiit_registration_number: z.string().trim().max(100).optional().nullable(),
});

const volunteeringEntrySchema = z.object({
  organization_name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(255),
  role: z.string().trim().max(150).optional().nullable(),
  start_date: z.coerce.date().optional().nullable(),
  end_date: z.coerce.date().optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
});

export const achievementsDetailsSchema = z.object({
  internships: z.array(internshipEntrySchema).optional().default([]),
  has_work_experience: z.boolean().optional().default(false),
  work_experience: z.array(workExperienceEntrySchema).optional().default([]),
  languages: z.array(languageEntrySchema).optional().default([]),
  academic_awards: z.array(academicAwardSchema).optional().default([]),
  sports_achievements: z.array(sportsAchievementSchema).optional().default([]),
  arts_cultural_achievements: z
    .array(artsCulturalAchievementSchema)
    .optional()
    .default([]),
  hobbies: z.array(z.string().trim().max(50)).optional().default([]),
  other_interests: z.string().trim().max(1000).optional().nullable(),
  publications: z.array(publicationEntrySchema).optional().default([]),
  patents: z.array(patentEntrySchema).optional().default([]),
  professional_certifications: z
    .array(certificationEntrySchema)
    .optional()
    .default([]),
  portfolio_links: portfolioLinksSchema.optional().default({}),
  recommendation_letters: z
    .array(recommendationLetterSchema)
    .optional()
    .default([]),
  innovation_entrepreneurship: z
    .array(innovationEntrySchema)
    .optional()
    .default([]),
  volunteering: z.array(volunteeringEntrySchema).optional().default([]),
});

export type AchievementsDetailsInput = z.infer<
  typeof achievementsDetailsSchema
>;
