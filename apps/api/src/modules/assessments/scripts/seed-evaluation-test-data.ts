/**
 * One-off dev seed: creates two AssessmentAttempts against real, already-seeded
 * question-bank data (college CLG-2, template AST-4, its approved normal paper
 * ASP-5 — 3 questions across 3 sections: one non-autoscorable "describe-image"
 * and two autoscorable choice questions) so the evaluator dashboard
 * (/assessments/evaluation) has something to review.
 *
 * Builds the full chain the real Start-Attempt flow requires (AdmissionCycleCourse
 * with assessment_required, Application + ApplicationCourse, an active Slot) via
 * direct Prisma writes rather than the API, since this is test-data setup, not a
 * flow being verified. Idempotent — re-running skips anything already created.
 *
 * Run from the monorepo root:
 *   npx tsx apps/api/src/modules/assessments/scripts/seed-evaluation-test-data.ts
 */

import { prisma } from "@beaconu/db";

const COLLEGE_ID = "CLG-2";
const ADMISSION_CYCLE_ID = "ACV-1";
const COURSE_ID = "CRS-1";
const TEMPLATE_ID = "AST-4";
const PAPER_ID = "ASP-5";

async function ensureAdmissionCycleCourse() {
  const existing = await prisma.admissionCycleCourse.findUnique({
    where: {
      uq_cycle_course: {
        admissionCycleId: ADMISSION_CYCLE_ID,
        courseId: COURSE_ID,
      },
    },
  });
  if (existing) {
    if (!existing.assessmentRequired || !existing.isActive) {
      await prisma.admissionCycleCourse.update({
        where: { id: existing.id },
        data: { assessmentRequired: true, isActive: true },
      });
    }
    return existing.id;
  }
  const created = await prisma.admissionCycleCourse.create({
    data: {
      admissionCycleId: ADMISSION_CYCLE_ID,
      courseId: COURSE_ID,
      applicationFee: 500,
      interviewRequired: true,
      assessmentRequired: true,
      workExperienceRequired: false,
      isActive: true,
    },
  });
  return created.id;
}

async function ensureApplicationCourse(studentId: string) {
  // A student can now have multiple Applications per cycle (Plan N) —
  // this seed script only ever wants its own EVALSEED-* one, identified by
  // the stable applicationNumber, not by (studentId, admissionCycleId)
  // alone anymore.
  let application = await prisma.application.findUnique({
    where: { applicationNumber: `EVALSEED-${studentId}` },
  });
  if (!application) {
    // Stable per-student, not positional — re-running with a different
    // pick order (e.g. because an earlier student now has an application
    // and gets excluded) must never collide with a prior run's number.
    application = await prisma.application.create({
      data: {
        applicationNumber: `EVALSEED-${studentId}`,
        studentId,
        collegeId: COLLEGE_ID,
        admissionCycleId: ADMISSION_CYCLE_ID,
        formStatus: "submitted",
        feePaymentStatus: "paid",
        submittedAt: new Date(),
      },
    });
  }

  let applicationCourse = await prisma.applicationCourse.findUnique({
    where: {
      uq_application_course: {
        applicationId: application.id,
        courseId: COURSE_ID,
      },
    },
  });
  if (!applicationCourse) {
    applicationCourse = await prisma.applicationCourse.create({
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
  return applicationCourse.id;
}

async function ensureSlot() {
  const existing = await prisma.assessmentSlot.findFirst({
    where: { templateId: TEMPLATE_ID, status: "active" },
  });
  if (existing) return existing.id;

  const now = new Date();
  const created = await prisma.assessmentSlot.create({
    data: {
      collegeId: COLLEGE_ID,
      templateId: TEMPLATE_ID,
      slotType: "window",
      windowStart: new Date(now.getTime() - 60 * 60 * 1000),
      windowEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  });
  return created.id;
}

// Fixed, not "first N without an application" — must stay stable across
// re-runs regardless of what applications already exist, or a retry after
// a partial failure picks different students than the original run did.
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
      `Expected students ${STUDENT_A_ID} and ${STUDENT_B_ID} to exist — adjust the constants to real student ids.`,
    );
  }
  return [a, b] as const;
}

async function createAttempt(
  applicationCourseId: string,
  studentId: string,
  slotId: string,
) {
  const existing = await prisma.assessmentAttempt.findUnique({
    where: { uq_student_attempt: { applicationCourseId, studentId } },
  });
  if (existing) return existing;

  const now = new Date();
  return prisma.assessmentAttempt.create({
    data: {
      applicationCourseId,
      studentId,
      paperId: PAPER_ID,
      slotId,
      status: "not_started",
      lastActivityAt: now,
    },
  });
}

async function main() {
  const paper = await prisma.assessmentPaper.findUnique({
    where: { id: PAPER_ID },
    include: {
      paperQuestions: { include: { question: true } },
    },
  });
  if (!paper || paper.status !== "approved" || paper.paperType !== "normal") {
    throw new Error(
      `${PAPER_ID} must exist and be an approved normal paper — check it hasn't been deleted/changed.`,
    );
  }
  const byQuestionId = new Map(
    paper.paperQuestions.map((pq) => [pq.questionId, pq]),
  );
  const describeImage = byQuestionId.get("QST-1");
  const dataInterpretation = byQuestionId.get("QST-2");
  const mcq = byQuestionId.get("QST-5");
  if (!describeImage || !dataInterpretation || !mcq) {
    throw new Error(
      "Expected paper questions QST-1/QST-2/QST-5 on ASP-5 — question bank may have changed since this script was written.",
    );
  }

  await ensureAdmissionCycleCourse();
  const slotId = await ensureSlot();
  const [studentA, studentB] = await loadStudents();

  const applicationCourseA = await ensureApplicationCourse(studentA.id);
  const applicationCourseB = await ensureApplicationCourse(studentB.id);

  const attemptA = await createAttempt(applicationCourseA, studentA.id, slotId);
  const attemptB = await createAttempt(applicationCourseB, studentB.id, slotId);

  const startedAt = new Date(Date.now() - 30 * 60 * 1000);
  const completedAt = new Date();

  // Attempt A: under_evaluation, one question (describe-image) still pending
  // manual scoring — the primary case for testing the evaluator scoring UI.
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
      uq_attempt_question: { attemptId: attemptA.id, questionId: "QST-2" },
    },
    create: {
      attemptId: attemptA.id,
      questionId: "QST-2",
      sectionId: dataInterpretation.sectionId,
      response: { selectedOptionIds: ["6s8umn2t"] }, // correct
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: { attemptId: attemptA.id, questionId: "QST-5" },
    },
    create: {
      attemptId: attemptA.id,
      questionId: "QST-5",
      sectionId: mcq.sectionId,
      response: { selectedOptionIds: ["nfdns4cp"] }, // incorrect (correct is ziagqvdj)
      autoScore: 0,
      finalScore: 0,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: { attemptId: attemptA.id, questionId: "QST-1" },
    },
    create: {
      attemptId: attemptA.id,
      questionId: "QST-1",
      sectionId: describeImage.sectionId,
      response: {
        text: "The image shows a busy classroom with students engaged in a group discussion around a whiteboard.",
      },
      isFlagged: true,
      evaluationStatus: "pending",
      answeredAt: startedAt,
    },
    update: {},
  });

  // Attempt B: fully evaluated and published, to show the "already scored"
  // state in the queue/detail views.
  const staff = await prisma.staffMember.findFirst({
    where: { collegeId: COLLEGE_ID },
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: { attemptId: attemptB.id, questionId: "QST-2" },
    },
    create: {
      attemptId: attemptB.id,
      questionId: "QST-2",
      sectionId: dataInterpretation.sectionId,
      response: { selectedOptionIds: ["6s8umn2t"] },
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: { attemptId: attemptB.id, questionId: "QST-5" },
    },
    create: {
      attemptId: attemptB.id,
      questionId: "QST-5",
      sectionId: mcq.sectionId,
      response: { selectedOptionIds: ["ziagqvdj"] },
      autoScore: 5,
      finalScore: 5,
      evaluationStatus: "auto_scored",
      answeredAt: startedAt,
    },
    update: {},
  });
  await prisma.studentAnswer.upsert({
    where: {
      uq_attempt_question: { attemptId: attemptB.id, questionId: "QST-1" },
    },
    create: {
      attemptId: attemptB.id,
      questionId: "QST-1",
      sectionId: describeImage.sectionId,
      response: {
        text: "A classroom scene with a teacher pointing at a projected chart while students take notes.",
      },
      manualScore: 4,
      finalScore: 4,
      evaluationStatus: "evaluated",
      evaluationRemarks: "Good description, minor grammar issues.",
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
        [mcq.sectionId]: { score: 5, max: 5 },
      },
    },
  });

  console.log("Seeded evaluation test data:");
  console.log(
    `  Attempt A (under_evaluation, 1 pending): ${attemptA.id} — student ${studentA.fullName}`,
  );
  console.log(
    `  Attempt B (result_published): ${attemptB.id} — student ${studentB.fullName}`,
  );
  console.log(
    `  Slot: ${slotId}  Paper: ${PAPER_ID}  Template: ${TEMPLATE_ID}`,
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
