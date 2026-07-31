/**
 * One-off dev seed: builds the FULL assessment chain from scratch for college
 * CLG-10 (Beacon Institute of Technology), which had zero assessment data
 * (no sections, question types, questions, templates, papers, or slots) —
 * unlike CLG-2 (see seed-evaluation-test-data.ts), which already had all of
 * that and only needed attempts wired on top.
 *
 * Creates: 3 assessment sections + question types (verbal-communication,
 * aptitude-logical-reasoning, listening-reading), 3 questions (one per
 * section, mirroring CLG-2's QST-1/2/5 shapes), one AssessmentTemplate +
 * TemplateSections, one manually-assembled + approved AssessmentPaper, one
 * active AssessmentSlot, AdmissionCycle (ACV-3) assessment config, two
 * dedicated EVALSEED Applications + ApplicationCourses (not touching the
 * students' real draft applications), and two AssessmentAttempts (one
 * under_evaluation with a pending answer, one result_published) so the
 * evaluator dashboard has something to review for this college too.
 *
 * Idempotent — re-running skips anything already created.
 *
 * Run from apps/api:
 *   DATABASE_URL="..." pnpm exec tsx src/modules/assessments/scripts/seed-evaluation-test-data-clg10.ts
 */

import { prisma } from "@beaconu/db";
import { SectionService } from "../services/section.service";

const COLLEGE_ID = "CLG-10";
const ADMISSION_CYCLE_ID = "ACV-3";
const COURSE_ID = "CRS-19";

const SECTION_SLUGS = [
  "verbal-communication",
  "aptitude-logical-reasoning",
  "listening-reading",
] as const;

async function ensureSections() {
  const sectionIds: Record<string, string> = {};
  for (const slug of SECTION_SLUGS) {
    let section = await prisma.assessmentSection.findFirst({
      where: { collegeId: COLLEGE_ID, slug },
    });
    if (!section) {
      await SectionService.toggleSection(COLLEGE_ID, slug, true);
      section = await prisma.assessmentSection.findFirst({
        where: { collegeId: COLLEGE_ID, slug },
      });
    }
    if (!section) throw new Error(`Failed to seed section ${slug}`);
    sectionIds[slug] = section.id;
  }
  return sectionIds;
}

async function ensureQuestionType(slug: string) {
  const type = await prisma.questionType.findFirst({
    where: { collegeId: COLLEGE_ID, slug },
  });
  if (!type) throw new Error(`Expected question type ${slug} to be seeded`);
  return type.id;
}

async function ensureQuestion(
  marker: string,
  sectionId: string,
  questionTypeId: string,
  content: object,
  answerKey: object | null,
) {
  const existing = await prisma.question.findFirst({
    where: { sectionId, title: marker },
  });
  if (existing) return existing;
  return prisma.question.create({
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
}

async function ensureTemplate(sectionIds: Record<string, string>) {
  const existing = await prisma.assessmentTemplate.findFirst({
    where: { collegeId: COLLEGE_ID, name: "CLG-10 Seed Assessment" },
  });
  if (existing) return existing.id;

  return prisma.$transaction(async (tx) => {
    const template = await tx.assessmentTemplate.create({
      data: {
        collegeId: COLLEGE_ID,
        name: "CLG-10 Seed Assessment",
        templateType: "admission",
        totalQuestions: 3,
        status: "active",
        settings: { negativeMarkingMode: "none" },
      },
    });
    let sortOrder = 0;
    for (const slug of SECTION_SLUGS) {
      await tx.templateSection.create({
        data: {
          templateId: template.id,
          sectionId: sectionIds[slug],
          questionCount: 1,
          timeLimitMins: 10,
          sortOrder: sortOrder++,
        },
      });
    }
    return template.id;
  });
}

async function ensurePaper(
  templateId: string,
  questions: { id: string; sectionId: string }[],
) {
  const existing = await prisma.assessmentPaper.findFirst({
    where: { templateId, status: "approved", paperType: "normal" },
  });
  if (existing) return existing.id;

  const paperCode = `PAPER-CLG10SEED`;
  const paper = await prisma.assessmentPaper.create({
    data: {
      templateId,
      paperCode,
      generationType: "manual",
      status: "approved",
      paperType: "normal",
      approvedAt: new Date(),
    },
  });
  let order = 0;
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
  const applicationNumber = `EVALSEED-CLG10-${studentId}`;
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

const STUDENT_A_ID = "STU-1";
const STUDENT_B_ID = "STU-6";

async function loadStudents() {
  const students = await prisma.student.findMany({
    where: { id: { in: [STUDENT_A_ID, STUDENT_B_ID] } },
    select: { id: true, fullName: true },
  });
  const byId = new Map(students.map((s) => [s.id, s]));
  const a = byId.get(STUDENT_A_ID);
  const b = byId.get(STUDENT_B_ID);
  if (!a || !b) {
    throw new Error(
      `Expected students ${STUDENT_A_ID} and ${STUDENT_B_ID} to exist.`,
    );
  }
  return [a, b] as const;
}

async function createAttempt(
  applicationId: string,
  studentId: string,
  paperId: string,
  slotId: string,
) {
  const existing = await prisma.assessmentAttempt.findUnique({
    where: { uq_student_attempt: { applicationId, studentId } },
  });
  if (existing) return existing;

  return prisma.assessmentAttempt.create({
    data: {
      applicationId,
      studentId,
      paperId,
      slotId,
      status: "not_started",
      lastActivityAt: new Date(),
    },
  });
}

async function main() {
  const sectionIds = await ensureSections();

  const verbalTypeId = await ensureQuestionType("describeImage");
  const aptitudeTypeId = await ensureQuestionType("dataInterpretation");
  const listeningTypeId = await ensureQuestionType("audioMcqSingle");

  const describeImage = await ensureQuestion(
    "CLG10-SEED-DESCRIBE-IMAGE",
    sectionIds["verbal-communication"],
    verbalTypeId,
    {
      text: "Describe what is happening in the image.",
      imageUrl:
        "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/verbal-communication/seed-placeholder.png",
    },
    null,
  );
  const dataInterpretation = await ensureQuestion(
    "CLG10-SEED-DATA-INTERPRETATION",
    sectionIds["aptitude-logical-reasoning"],
    aptitudeTypeId,
    {
      text: "Based on the chart, analyze which quarter had the highest growth and explain why.",
      imageUrl:
        "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/aptitude-logical-reasoning/seed-chart-placeholder.png",
    },
    null,
  );
  const trueFalse = await ensureQuestion(
    "CLG10-SEED-TRUE-FALSE",
    sectionIds["listening-reading"],
    listeningTypeId,
    {
      text: "The passage states the meeting was rescheduled. True or False?",
      options: [
        { id: "trueopt", text: "True" },
        { id: "falseopt", text: "False" },
      ],
    },
    { correctOptionIds: ["trueopt"] },
  );

  const templateId = await ensureTemplate(sectionIds);
  const paperId = await ensurePaper(templateId, [
    describeImage,
    dataInterpretation,
    trueFalse,
  ]);
  const slotId = await ensureSlot(templateId);
  await ensureAdmissionCycleAssessmentConfig(templateId);

  const [studentA, studentB] = await loadStudents();
  const applicationA = await ensureApplication(studentA.id);
  const applicationB = await ensureApplication(studentB.id);

  const attemptA = await createAttempt(
    applicationA,
    studentA.id,
    paperId,
    slotId,
  );
  const attemptB = await createAttempt(
    applicationB,
    studentB.id,
    paperId,
    slotId,
  );

  const startedAt = new Date(Date.now() - 30 * 60 * 1000);
  const completedAt = new Date();

  // Attempt A: under_evaluation, describe-image answer still pending manual scoring.
  await prisma.assessmentAttempt.update({
    where: { id: attemptA.id },
    data: {
      status: "under_evaluation",
      startedAt,
      completedAt,
      timeSpentSecs: 1800,
      lastActivityAt: completedAt,
    },
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptA.id,
        questionId: dataInterpretation.id,
      },
    },
    create: {
      attemptId: attemptA.id,
      questionId: dataInterpretation.id,
      sectionId: dataInterpretation.sectionId,
      response: { selectedOptionIds: ["q1opt"] },
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptA.id,
        questionId: trueFalse.id,
      },
    },
    create: {
      attemptId: attemptA.id,
      questionId: trueFalse.id,
      sectionId: trueFalse.sectionId,
      response: { selectedOptionIds: ["falseopt"] },
      autoScore: 0,
      finalScore: 0,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptA.id,
        questionId: describeImage.id,
      },
    },
    create: {
      attemptId: attemptA.id,
      questionId: describeImage.id,
      sectionId: describeImage.sectionId,
      response: {
        text: "The chart shows steady growth across all four quarters with a peak in Q1.",
      },
      isFlagged: true,
      evaluationStatus: "pending",
      answeredAt: startedAt,
    },
    update: {},
  });

  // Attempt B: fully evaluated and published.
  const staff = await prisma.staffMember.findFirst({
    where: { collegeId: COLLEGE_ID },
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptB.id,
        questionId: dataInterpretation.id,
      },
    },
    create: {
      attemptId: attemptB.id,
      questionId: dataInterpretation.id,
      sectionId: dataInterpretation.sectionId,
      response: { selectedOptionIds: ["q1opt"] },
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptB.id,
        questionId: trueFalse.id,
      },
    },
    create: {
      attemptId: attemptB.id,
      questionId: trueFalse.id,
      sectionId: trueFalse.sectionId,
      response: { selectedOptionIds: ["trueopt"] },
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: {
        attemptId: attemptB.id,
        questionId: describeImage.id,
      },
    },
    create: {
      attemptId: attemptB.id,
      questionId: describeImage.id,
      sectionId: describeImage.sectionId,
      response: {
        text: "The chart depicts a rising trend, with Q1 showing the sharpest increase.",
      },
      manualScore: 4,
      finalScore: 4,
      evaluationStatus: "evaluated",
      evaluationRemarks: "Clear description, minor phrasing issues.",
      evaluatedBy: staff?.id,
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.assessmentAttempt.update({
    where: { id: attemptB.id },
    data: {
      status: "result_published",
      startedAt,
      completedAt,
      timeSpentSecs: 1650,
      lastActivityAt: completedAt,
      totalScore: 14,
      maxScore: 15,
      sectionScores: {
        [describeImage.sectionId]: { score: 4, max: 5 },
        [dataInterpretation.sectionId]: { score: 5, max: 5 },
        [trueFalse.sectionId]: { score: 5, max: 5 },
      },
    },
  });

  console.log("Seeded full assessment chain for CLG-10:");
  console.log(
    `  Sections: ${SECTION_SLUGS.join(", ")} -> ${Object.values(sectionIds).join(", ")}`,
  );
  console.log(`  Template: ${templateId}  Paper: ${paperId}  Slot: ${slotId}`);
  console.log(
    `  Attempt A (under_evaluation, 1 pending): ${attemptA.id} — student ${studentA.fullName}`,
  );
  console.log(
    `  Attempt B (result_published): ${attemptB.id} — student ${studentB.fullName}`,
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
