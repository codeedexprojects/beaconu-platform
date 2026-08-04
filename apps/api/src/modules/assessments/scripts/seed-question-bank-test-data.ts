import { prisma, Prisma } from "@beaconu/db";

const COLLEGE_ID = "CLG-2";

const SECTION = {
  verbal: "ASC-1",
  aptitude: "ASC-2",
  listeningReading: "ASC-3",
  leadership: "ASC-4",
  emotionalIntelligence: "ASC-5",
  scientificCalculator: "ASC-6",
} as const;

const QTYPE = {
  audioComprehension: "QTP-1",
  repeatSentence: "QTP-2",
  readAloud: "QTP-3",
  respondToSituation: "QTP-4",
  describeImage: "QTP-5",
  mcq: "QTP-6",
  dataInterpretation: "QTP-7",
  sequenceQuestions: "QTP-8",
  trueFalse: "QTP-9",
  passageBasedQuestions: "QTP-10",
  scenarioBasedWriting: "QTP-11",
  rankingQuestions: "QTP-12",
  scenarioBasedMcq: "QTP-13",
  likertScale: "QTP-14",
  situationalJudgement: "QTP-15",
  scientificCalculationProblem: "QTP-16",
} as const;

const COURSE_IDS_FOR_CALCULATOR = ["CRS-1", "CRS-8"];

interface SeedQuestion {
  title: string;
  sectionId: string;
  questionTypeId: string;
  difficulty: "easy" | "medium" | "hard";
  content: Prisma.InputJsonValue;
  answerKey?: Prisma.InputJsonValue;
  marks: number;
  negativeMarks?: number;
  courseIds?: string[];
}

const QUESTIONS: SeedQuestion[] = [
  {
    title: "[SEED] Audio Comprehension — campus announcement",
    sectionId: SECTION.verbal,
    questionTypeId: QTYPE.audioComprehension,
    difficulty: "medium",
    content: {
      text: "Listen to the campus announcement and summarize its main point in your own words.",
      audioUrl:
        "https://example-bucket.s3.ap-south-1.amazonaws.com/seed/verbal/campus-announcement.mp3",
    },
    marks: 5,
  },
  {
    title: "[SEED] Repeat Sentence — orientation day",
    sectionId: SECTION.verbal,
    questionTypeId: QTYPE.repeatSentence,
    difficulty: "easy",
    content: {
      text: "Listen to the sentence and repeat it back exactly as spoken.",
      audioUrl:
        "https://example-bucket.s3.ap-south-1.amazonaws.com/seed/verbal/repeat-sentence-1.mp3",
    },
    marks: 3,
  },
  {
    title: "[SEED] Read Aloud — library passage",
    sectionId: SECTION.verbal,
    questionTypeId: QTYPE.readAloud,
    difficulty: "medium",
    content: {
      text: "The university library holds over two hundred thousand volumes across four floors, with a dedicated quiet zone for postgraduate research on the top level.",
    },
    marks: 4,
  },
  {
    title: "[SEED] Respond to a Situation — group project conflict",
    sectionId: SECTION.verbal,
    questionTypeId: QTYPE.respondToSituation,
    difficulty: "hard",
    content: {
      text: "A teammate in your group project has missed two deadlines. Respond as if speaking to them directly, addressing the issue constructively.",
    },
    marks: 5,
  },
  {
    title: "[SEED] MCQ — series completion",
    sectionId: SECTION.aptitude,
    questionTypeId: QTYPE.mcq,
    difficulty: "easy",
    content: {
      text: "What comes next in the series: 2, 6, 12, 20, 30, ?",
      options: [
        { id: "opt-a", text: "40" },
        { id: "opt-b", text: "42" },
        { id: "opt-c", text: "36" },
        { id: "opt-d", text: "48" },
      ],
    },
    answerKey: { correctOptionIds: ["opt-b"] },
    marks: 4,
    negativeMarks: 1,
  },
  {
    title: "[SEED] Sequence Questions — process ordering",
    sectionId: SECTION.aptitude,
    questionTypeId: QTYPE.sequenceQuestions,
    difficulty: "medium",
    content: {
      text: "Arrange the steps of the college admission process in the correct order.",
      options: [
        { id: "step-apply", text: "Submit application" },
        { id: "step-pay", text: "Pay application fee" },
        { id: "step-assess", text: "Take the assessment" },
        { id: "step-interview", text: "Attend the interview" },
        { id: "step-offer", text: "Receive offer letter" },
      ],
    },
    answerKey: {
      correctOrder: [
        "step-apply",
        "step-pay",
        "step-assess",
        "step-interview",
        "step-offer",
      ],
    },
    marks: 5,
  },
  {
    title: "[SEED] True/False — reading comprehension",
    sectionId: SECTION.listeningReading,
    questionTypeId: QTYPE.trueFalse,
    difficulty: "easy",
    content: {
      text: "Passage: Renewable energy sources, such as solar and wind, produced over 30% of the world's electricity in 2025 for the first time. Statement: Renewable sources produced less than a quarter of the world's electricity in 2025.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ],
    },
    answerKey: { correctOptionIds: ["false"] },
    marks: 3,
  },
  {
    title: "[SEED] Passage-Based Questions — climate article",
    sectionId: SECTION.listeningReading,
    questionTypeId: QTYPE.passageBasedQuestions,
    difficulty: "medium",
    content: {
      text: "Passage: Urban heat islands occur when cities replace natural land cover with pavement and buildings that absorb and re-emit heat. Question: What primarily causes the urban heat island effect?",
      options: [
        { id: "opt-a", text: "Increased vehicle traffic" },
        {
          id: "opt-b",
          text: "Pavement and buildings absorbing and re-emitting heat",
        },
        { id: "opt-c", text: "Lack of rainfall in cities" },
        { id: "opt-d", text: "Higher altitude of urban areas" },
      ],
    },
    answerKey: { correctOptionIds: ["opt-b"] },
    marks: 5,
  },
  {
    title: "[SEED] Scenario-Based Writing — handling team disagreement",
    sectionId: SECTION.leadership,
    questionTypeId: QTYPE.scenarioBasedWriting,
    difficulty: "hard",
    content: {
      text: "Scenario: Two members of your student club strongly disagree on the theme for the annual event, and the disagreement is affecting the whole team's morale. Write how you, as the club lead, would resolve this situation.",
    },
    marks: 10,
  },
  {
    title: "[SEED] Ranking Questions — leadership priorities",
    sectionId: SECTION.leadership,
    questionTypeId: QTYPE.rankingQuestions,
    difficulty: "medium",
    content: {
      text: "Rank the following in order of importance when leading a new team, from most to least important.",
      options: [
        { id: "trust", text: "Building trust" },
        { id: "clarity", text: "Setting clear goals" },
        { id: "delegation", text: "Delegating tasks" },
        { id: "feedback", text: "Giving regular feedback" },
      ],
    },
    answerKey: {
      correctOrder: ["trust", "clarity", "delegation", "feedback"],
    },
    marks: 5,
  },
  {
    title: "[SEED] Scenario-Based MCQ — handling criticism",
    sectionId: SECTION.emotionalIntelligence,
    questionTypeId: QTYPE.scenarioBasedMcq,
    difficulty: "medium",
    content: {
      text: "Scenario: Your professor publicly points out a mistake in your presentation. What is the most emotionally intelligent response?",
      options: [
        { id: "opt-a", text: "Argue back to defend yourself immediately" },
        {
          id: "opt-b",
          text: "Acknowledge the point calmly and ask how to improve",
        },
        { id: "opt-c", text: "Stay silent and avoid the professor afterward" },
        { id: "opt-d", text: "Blame a teammate for the mistake" },
      ],
    },
    answerKey: { correctOptionIds: ["opt-b"] },
    marks: 5,
  },
  {
    title: "[SEED] Likert Scale — stress self-assessment",
    sectionId: SECTION.emotionalIntelligence,
    questionTypeId: QTYPE.likertScale,
    difficulty: "easy",
    content: {
      text: "I remain calm and composed when facing unexpected setbacks.",
      options: [
        { id: "1", text: "Strongly Disagree" },
        { id: "2", text: "Disagree" },
        { id: "3", text: "Neutral" },
        { id: "4", text: "Agree" },
        { id: "5", text: "Strongly Agree" },
      ],
    },
    marks: 0,
  },
  {
    title: "[SEED] Situational Judgement — teammate underperforming",
    sectionId: SECTION.emotionalIntelligence,
    questionTypeId: QTYPE.situationalJudgement,
    difficulty: "hard",
    content: {
      text: "Scenario: A close friend on your team has been underperforming and it's affecting the group's grade. What should you do first?",
      options: [
        { id: "opt-a", text: "Report them to the professor immediately" },
        { id: "opt-b", text: "Have an honest, private conversation with them" },
        {
          id: "opt-c",
          text: "Redo their work yourself without telling anyone",
        },
        { id: "opt-d", text: "Complain about them to other teammates" },
      ],
    },
    answerKey: { correctOptionIds: ["opt-b"] },
    marks: 5,
  },
  {
    title: "[SEED] Scientific Calculator — kinematics problem",
    sectionId: SECTION.scientificCalculator,
    questionTypeId: QTYPE.scientificCalculationProblem,
    difficulty: "hard",
    content: {
      text: "A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?",
      options: [
        { id: "opt-a", text: "2 m/s²" },
        { id: "opt-b", text: "4 m/s²" },
        { id: "opt-c", text: "5 m/s²" },
        { id: "opt-d", text: "10 m/s²" },
      ],
    },
    answerKey: { correctOptionIds: ["opt-b"] },
    marks: 5,
    courseIds: COURSE_IDS_FOR_CALCULATOR,
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const q of QUESTIONS) {
    const existing = await prisma.question.findFirst({
      where: { collegeId: COLLEGE_ID, title: q.title },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          collegeId: COLLEGE_ID,
          sectionId: q.sectionId,
          questionTypeId: q.questionTypeId,
          difficulty: q.difficulty,
          title: q.title,
          content: q.content,
          answerKey: q.answerKey,
          marks: q.marks,
          negativeMarks: q.negativeMarks ?? 0,
        },
      });
      if (q.courseIds?.length) {
        await tx.questionCourseMapping.createMany({
          data: q.courseIds.map((courseId) => ({
            questionId: question.id,
            courseId,
          })),
        });
      }
    });
    created++;
  }

  console.log(
    `Seeded question bank: ${created} created, ${skipped} already existed.`,
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
