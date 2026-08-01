/**
 * One-off dev seed: creates ONE sample Question for every canonical
 * question type (see constants/section-seeds/question-type-seeds.ts) for
 * college CLG-10, wires them into an approved paper + active slot, points
 * admission cycle ACV-3 at that template, and creates a ready-to-answer
 * ("in_progress") attempt for STU-1 — so the full take-test flow can be
 * exercised end to end against all 22 types with no further manual setup.
 *
 * Enables every assessment section for CLG-10 first (idempotent — always
 * calls toggle(true) even if a section is already active, since
 * SectionService.toggleSection re-syncs question types on every
 * activation — this also backfills the new canonical slugs for a
 * college that had enabled sections before the question-type-seeds
 * restructure).
 *
 * NOTE: this repoints ACV-3's assessment_template_id at this script's
 * "CLG-10 All Question Types Seed" template — if seed-evaluation-test-data-clg10.ts's
 * smaller 3-question template was previously active on this same cycle,
 * this overrides it (any attempts already created there are unaffected,
 * since they reference their own paperId directly, not the cycle).
 *
 * Idempotent — re-running skips any question/application/attempt that
 * already exists.
 *
 * Run from apps/api:
 *   DATABASE_URL="..." pnpm exec tsx src/modules/assessments/scripts/seed-all-question-types-clg10.ts
 */

import { prisma } from "@beaconu/db";
import { SectionService } from "../services/section.service";

const COLLEGE_ID = "CLG-10";
const COURSE_ID = "CRS-19";
const ADMISSION_CYCLE_ID = "ACV-3";
const STUDENT_ID = "STU-1";

const SECTION_SLUGS = [
  "verbal-communication",
  "aptitude-logical-reasoning",
  "listening-reading",
  "leadership-qualities",
  "emotional-intelligence",
  "written-communication",
  "scientific-calculator",
  "financial-calculator",
  "basic-calculator",
] as const;

type SectionSlug = (typeof SECTION_SLUGS)[number];

const PLACEHOLDER_IMAGE =
  "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.png";
const PLACEHOLDER_AUDIO =
  "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3";

async function ensureSections() {
  const sectionIds: Record<string, string> = {};
  for (const slug of SECTION_SLUGS) {
    await SectionService.toggleSection(COLLEGE_ID, slug, true);
    const section = await prisma.assessmentSection.findFirst({
      where: { collegeId: COLLEGE_ID, slug },
    });
    if (!section) throw new Error(`Failed to seed section ${slug}`);
    sectionIds[slug] = section.id;
  }
  return sectionIds;
}

async function getQuestionTypeId(slug: string): Promise<string> {
  const type = await prisma.questionType.findFirst({
    where: { collegeId: COLLEGE_ID, slug },
  });
  if (!type) throw new Error(`Expected question type "${slug}" to be seeded`);
  return type.id;
}

async function ensureQuestion(
  marker: string,
  sectionId: string,
  questionTypeId: string,
  content: object,
  answerKey: object | null,
  courseIds: string[] = [],
) {
  const existing = await prisma.question.findFirst({
    where: { sectionId, title: marker },
  });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const question = await tx.question.create({
      data: {
        collegeId: COLLEGE_ID,
        sectionId,
        questionTypeId,
        title: marker,
        content,
        answerKey: answerKey ?? undefined,
        marks: 5,
        negativeMarks: 0,
        difficulty: "medium",
        status: "active",
      },
    });
    for (const courseId of courseIds) {
      await tx.questionCourseMapping.create({
        data: { questionId: question.id, courseId },
      });
    }
    return question;
  });
}

async function ensureTemplate(
  sectionIds: Record<string, string>,
  questionsBySection: Map<string, { id: string }[]>,
) {
  const existing = await prisma.assessmentTemplate.findFirst({
    where: { collegeId: COLLEGE_ID, name: "CLG-10 All Question Types Seed" },
  });
  if (existing) return existing.id;

  return prisma.$transaction(async (tx) => {
    const template = await tx.assessmentTemplate.create({
      data: {
        collegeId: COLLEGE_ID,
        name: "CLG-10 All Question Types Seed",
        templateType: "admission",
        totalQuestions: Array.from(questionsBySection.values()).reduce(
          (sum, qs) => sum + qs.length,
          0,
        ),
        status: "active",
        settings: { negativeMarkingMode: "none" },
      },
    });
    let sortOrder = 0;
    for (const [sectionSlug, questions] of questionsBySection) {
      await tx.templateSection.create({
        data: {
          templateId: template.id,
          sectionId: sectionIds[sectionSlug],
          questionCount: questions.length,
          timeLimitMins: 15,
          sortOrder: sortOrder++,
        },
      });
    }
    return template.id;
  });
}

async function ensurePaper(
  templateId: string,
  questionsBySection: Map<string, { id: string; sectionId: string }[]>,
) {
  const existing = await prisma.assessmentPaper.findFirst({
    where: { templateId, status: "approved", paperType: "normal" },
  });
  if (existing) return existing.id;

  const paper = await prisma.assessmentPaper.create({
    data: {
      templateId,
      paperCode: "PAPER-CLG10ALLTYPES",
      generationType: "manual",
      status: "approved",
      paperType: "normal",
      approvedAt: new Date(),
    },
  });
  let order = 0;
  for (const questions of questionsBySection.values()) {
    for (const q of questions) {
      await prisma.paperQuestion.create({
        data: {
          paperId: paper.id,
          questionId: q.id,
          sectionId: q.sectionId,
          questionOrder: order++,
        },
      });
    }
  }
  return paper.id;
}

async function ensureSlot(templateId: string) {
  const existing = await prisma.assessmentSlot.findFirst({
    where: { templateId, status: "active" },
  });
  if (existing) return existing.id;

  const now = new Date();
  const created = await prisma.assessmentSlot.create({
    data: {
      collegeId: COLLEGE_ID,
      templateId,
      slotType: "window",
      windowStart: new Date(now.getTime() - 60 * 60 * 1000),
      windowEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  });
  return created.id;
}

async function ensureAdmissionCycleAssessmentConfig(templateId: string) {
  await prisma.admissionCycle.update({
    where: { id: ADMISSION_CYCLE_ID },
    data: { assessmentRequired: true, assessmentTemplateId: templateId },
  });
}

async function ensureApplication(studentId: string) {
  const applicationNumber = `ALLTYPESSEED-CLG10-${studentId}`;
  let application = await prisma.application.findUnique({
    where: { applicationNumber },
  });
  if (!application) {
    application = await prisma.application.create({
      data: {
        applicationNumber,
        studentId,
        collegeId: COLLEGE_ID,
        admissionCycleId: ADMISSION_CYCLE_ID,
        formStatus: "submitted",
        feePaymentStatus: "paid",
        submittedAt: new Date(),
      },
    });
  }

  const applicationCourse = await prisma.applicationCourse.findUnique({
    where: {
      uq_application_course: {
        applicationId: application.id,
        courseId: COURSE_ID,
      },
    },
  });
  if (!applicationCourse) {
    await prisma.applicationCourse.create({
      data: {
        applicationId: application.id,
        courseId: COURSE_ID,
        applicationFee: 500,
        status: "submitted",
        isPrimary: true,
        preferenceOrder: 1,
        statusUpdatedAt: new Date(),
      },
    });
  }
  return application.id;
}

/** Seeded directly as "in_progress" (not "not_started") — start+begin were
 * merged into one API call (POST /attempts always creates an
 * already-in-progress attempt), so there's no endpoint left to advance a
 * "not_started" row. Seeding it pre-started is what makes it immediately
 * usable via GET /attempts/:id/sections etc. without an extra manual step. */
async function ensureAttempt(
  applicationId: string,
  studentId: string,
  paperId: string,
  slotId: string,
) {
  const existing = await prisma.assessmentAttempt.findUnique({
    where: { uq_student_attempt: { applicationId, studentId } },
  });
  if (existing) return existing;

  const now = new Date();
  return prisma.assessmentAttempt.create({
    data: {
      applicationId,
      studentId,
      paperId,
      slotId,
      status: "in_progress",
      startedAt: now,
      lastActivityAt: now,
    },
  });
}

async function main() {
  const sectionIds = await ensureSections();
  const created: string[] = [];
  const questionsBySection = new Map<
    string,
    { id: string; sectionId: string }[]
  >();

  async function seed(
    label: string,
    typeSlug: string,
    sectionSlug: SectionSlug,
    content: object,
    answerKey: object | null,
    courseIds: string[] = [],
  ) {
    const typeId = await getQuestionTypeId(typeSlug);
    const q = await ensureQuestion(
      `CLG10-ALLTYPES-${label}`,
      sectionIds[sectionSlug],
      typeId,
      content,
      answerKey,
      courseIds,
    );
    created.push(`${typeSlug} -> ${q.id}`);
    const list = questionsBySection.get(sectionSlug) ?? [];
    list.push({ id: q.id, sectionId: q.sectionId });
    questionsBySection.set(sectionSlug, list);
  }

  // -- selection --
  await seed(
    "MCQ-SINGLE",
    "mcqSingle",
    "aptitude-logical-reasoning",
    {
      text: "Which of these numbers is prime?",
      options: [
        { id: "o1", text: "4" },
        { id: "o2", text: "7" },
        { id: "o3", text: "9" },
      ],
    },
    { correctOptionIds: ["o2"] },
  );

  await seed(
    "MCQ-MULTIPLE",
    "mcqMultiple",
    "aptitude-logical-reasoning",
    {
      text: "Select all the prime numbers.",
      options: [
        { id: "o1", text: "4" },
        { id: "o2", text: "7" },
        { id: "o3", text: "11" },
        { id: "o4", text: "9" },
      ],
    },
    { correctOptionIds: ["o2", "o3"] },
  );

  await seed(
    "DRAG-DROP-FILL",
    "dragAndDropFill",
    "aptitude-logical-reasoning",
    {
      text: "The cat sat on the ___ and looked at the ___.",
      options: [
        { id: "w1", text: "mat" },
        { id: "w2", text: "moon" },
        { id: "w3", text: "tree" },
      ],
      blanks: [{ id: "b1" }, { id: "b2" }],
    },
    {
      blankAnswers: [
        { blankId: "b1", optionId: "w1" },
        { blankId: "b2", optionId: "w2" },
      ],
    },
  );

  await seed(
    "DROPDOWN-FILL",
    "dropdownFill",
    "aptitude-logical-reasoning",
    {
      text: "Water boils at ___ degrees Celsius at sea level and freezes at ___.",
      options: [
        { id: "d1", text: "100" },
        { id: "d2", text: "0" },
        { id: "d3", text: "50" },
      ],
      blanks: [{ id: "b1" }, { id: "b2" }],
    },
    {
      blankAnswers: [
        { blankId: "b1", optionId: "d1" },
        { blankId: "b2", optionId: "d2" },
      ],
    },
  );

  // -- textInput --
  await seed(
    "ESSAY",
    "essay",
    "written-communication",
    { text: "Write a 250-word essay on the importance of time management." },
    null,
  );
  await seed(
    "TEXT-SUMMARY",
    "textSummary",
    "written-communication",
    {
      text: "Read the following passage and summarize it in 100 words: Renewable energy sources like solar and wind power are becoming increasingly cost-competitive with fossil fuels...",
    },
    null,
  );
  await seed(
    "EMAIL",
    "email",
    "written-communication",
    {
      text: "Write a formal email to your professor requesting an extension for your assignment submission.",
    },
    null,
  );
  await seed(
    "LETTER",
    "letter",
    "written-communication",
    {
      text: "Write a letter to the editor of a newspaper about increasing traffic congestion in your city.",
    },
    null,
  );
  await seed(
    "NOTICE",
    "notice",
    "written-communication",
    {
      text: "Draft a notice for your college notice board announcing the annual sports day.",
    },
    null,
  );
  await seed(
    "DIALOGUE-COMPLETION",
    "dialogueCompletion",
    "written-communication",
    {
      text: "Complete the dialogue: A: Excuse me, could you tell me how to get to the library? B: ___",
    },
    null,
  );

  // -- audioListening --
  await seed(
    "SUMMARIZE-SPOKEN-TEXT",
    "summarizeSpokenText",
    "listening-reading",
    {
      text: "Listen to the audio and summarize the key points in your own words.",
      audioUrl: PLACEHOLDER_AUDIO,
    },
    null,
  );
  await seed(
    "AUDIO-MCQ-MULTIPLE",
    "audioMcqMultiple",
    "listening-reading",
    {
      text: "Listen to the audio and select all correct statements.",
      audioUrl: PLACEHOLDER_AUDIO,
      options: [
        { id: "a1", text: "The meeting was postponed" },
        { id: "a2", text: "The venue changed" },
        { id: "a3", text: "No changes were made" },
      ],
    },
    { correctOptionIds: ["a1", "a2"] },
  );
  await seed(
    "AUDIO-DROPDOWN-FILL",
    "audioDropdownFill",
    "listening-reading",
    {
      text: "Listen to the audio and fill in the blanks: The train departs at ___ and arrives at ___.",
      audioUrl: PLACEHOLDER_AUDIO,
      options: [
        { id: "t1", text: "9:00 AM" },
        { id: "t2", text: "11:30 AM" },
      ],
      blanks: [{ id: "b1" }, { id: "b2" }],
    },
    {
      blankAnswers: [
        { blankId: "b1", optionId: "t1" },
        { blankId: "b2", optionId: "t2" },
      ],
    },
  );
  await seed(
    "AUDIO-DRAG-DROP-FILL",
    "audioDragAndDropFill",
    "listening-reading",
    {
      text: "Listen to the audio, then fill in: The speaker recommends ___ before ___.",
      audioUrl: PLACEHOLDER_AUDIO,
      options: [
        { id: "w1", text: "reviewing notes" },
        { id: "w2", text: "the exam" },
      ],
      blanks: [{ id: "b1" }, { id: "b2" }],
    },
    {
      blankAnswers: [
        { blankId: "b1", optionId: "w1" },
        { blankId: "b2", optionId: "w2" },
      ],
    },
  );
  await seed(
    "AUDIO-BEST-OPTION",
    "audioBestOption",
    "listening-reading",
    {
      text: "Listen to the audio and choose the option that best matches the speaker's opinion.",
      audioUrl: PLACEHOLDER_AUDIO,
      options: [
        { id: "o1", text: "Strongly agrees" },
        { id: "o2", text: "Strongly disagrees" },
        { id: "o3", text: "Neutral" },
      ],
    },
    { correctOptionIds: ["o1"] },
  );
  await seed(
    "AUDIO-MCQ-SINGLE",
    "audioMcqSingle",
    "listening-reading",
    {
      text: "Listen to the audio. The passage states the meeting was rescheduled. True or False?",
      audioUrl: PLACEHOLDER_AUDIO,
      options: [
        { id: "trueopt", text: "True" },
        { id: "falseopt", text: "False" },
      ],
    },
    { correctOptionIds: ["trueopt"] },
  );

  // -- visualHighlight --
  await seed(
    "HIGHLIGHT-WORDS",
    "highlightWords",
    "leadership-qualities",
    {
      text: "Tap the word that is grammatically incorrect: She don't like coffee.",
      options: [
        { id: "w1", text: "She" },
        { id: "w2", text: "don't" },
        { id: "w3", text: "like" },
        { id: "w4", text: "coffee" },
      ],
    },
    { correctOptionIds: ["w2"] },
  );

  // -- audioSpeaking --
  await seed(
    "AUDIO-SPEAKING-RESPONSE",
    "audioSpeakingResponse",
    "verbal-communication",
    {
      text: "Listen to the question and respond appropriately.",
      audioUrl: PLACEHOLDER_AUDIO,
    },
    null,
  );
  await seed(
    "REPEAT-SENTENCE",
    "repeatSentence",
    "verbal-communication",
    { audioUrl: PLACEHOLDER_AUDIO },
    null,
  );
  await seed(
    "READ-ALOUD",
    "readAloud",
    "verbal-communication",
    {
      text: "Read the following passage aloud: The quick brown fox jumps over the lazy dog.",
    },
    null,
  );

  // -- visualImage --
  await seed(
    "DATA-INTERPRETATION",
    "dataInterpretation",
    "aptitude-logical-reasoning",
    {
      text: "Based on the chart, analyze which quarter had the highest growth and explain why.",
      imageUrl: PLACEHOLDER_IMAGE,
    },
    null,
  );
  await seed(
    "DESCRIBE-IMAGE",
    "describeImage",
    "verbal-communication",
    {
      text: "Describe what is happening in the image, focusing on the setting and mood.",
      imageUrl: PLACEHOLDER_IMAGE,
    },
    null,
  );

  // -- course-scoped example (non-core section) — proves the
  // QuestionCourseMapping path works too, reusing the shared mcqSingle type.
  await seed(
    "SCIENTIFIC-CALC-MCQ",
    "mcqSingle",
    "scientific-calculator",
    {
      text: "What is the value of log10(1000)?",
      options: [
        { id: "c1", text: "1" },
        { id: "c2", text: "2" },
        { id: "c3", text: "3" },
      ],
    },
    { correctOptionIds: ["c3"] },
    [COURSE_ID],
  );

  const templateId = await ensureTemplate(sectionIds, questionsBySection);
  const paperId = await ensurePaper(templateId, questionsBySection);
  const slotId = await ensureSlot(templateId);

  console.log(
    `Seeded ${created.length} questions (all 22 canonical types + 1 course-scoped example) for CLG-10:`,
  );
  for (const line of created) console.log(`  ${line}`);
  console.log(`\nTemplate: ${templateId}`);
  console.log(`Paper (approved, normal): ${paperId}`);
  console.log(`Slot (active, open now): ${slotId}`);
  console.log(
    "\nTo test a full attempt: set this template on a real AdmissionCycle" +
      " (assessment_required: true, assessment_template_id) and start an" +
      " attempt via POST /student/assessments/attempts for a submitted" +
      " application under that cycle.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
