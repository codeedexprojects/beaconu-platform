import "dotenv/config";
import { prisma } from "./index";

/**
 * Seeds the `exam_policy` tab for a course with a complete demo dataset.
 * Covers all three evaluation patterns (with practical, without practical,
 * standalone practical), projects/dissertation, OJT, internship, grading
 * scale, and academic guidelines banner.
 *
 * Usage:
 *   pnpm --filter @beaconu/db exec tsx src/seed-exam-policy.ts <courseId>
 *
 * Example:
 *   pnpm --filter @beaconu/db exec tsx src/seed-exam-policy.ts CRS-1
 */
async function main() {
  const courseId = process.argv[2];
  if (!courseId) {
    throw new Error("Usage: tsx src/seed-exam-policy.ts <courseId>");
  }

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course "${courseId}" not found`);
  }

  const metadata = (course.metadata ?? {}) as Record<string, unknown>;
  const tabData = (metadata.tabData ?? {}) as Record<string, unknown>;
  const currentTabs = Array.isArray(metadata.tabs)
    ? (metadata.tabs as string[])
    : [];

  const examPolicyData = {
    evaluation_patterns: [
      {
        pattern_type: "Course with Practical",
        duration: "2 + 3 Hrs",
        chart: {
          total: 100,
          segments: [
            { label: "Theory", percent: 50, color: "#FF6B00" },
            { label: "Practical", percent: 20, color: "#FFB27A" },
            { label: "Internal", percent: 30, color: "#E5E5E5" },
          ],
        },
        subtotals: [
          { label: "ISA Theory", marks: 20 },
          { label: "ISA Practical", marks: 15 },
          { label: "ESA Theory", marks: 50 },
          { label: "ESA Practical", marks: 20 },
        ],
        internal_assessment: [
          {
            section: "ISA - Theory",
            components: [
              {
                name: "Test Papers",
                marks: 10,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Mid-term Exam", marks: 6 },
                  { name: "Class Test", marks: 4 },
                ],
              },
              {
                name: "Assignment",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Content Relevance", marks: 2 },
                  { name: "Research Quality", marks: 2 },
                  { name: "Timely Submission", marks: 1 },
                ],
              },
              {
                name: "Seminar",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Presentation Skills", marks: 1 },
                  { name: "Topic Depth", marks: 3 },
                  { name: "Q&A Interaction", marks: 1 },
                ],
              },
            ],
          },
          {
            section: "ISA - Practical",
            components: [
              {
                name: "Practical Record",
                marks: 5,
                description:
                  "Assessment of maintained practical records and observations.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Lab Performance",
                marks: 5,
                description:
                  "Evaluation of day-to-day lab performance and skill.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Viva-Voce",
                marks: 5,
                description: "Oral examination based on practical concepts.",
                icon: "",
                sub_components: [],
              },
            ],
          },
        ],
        external_examination: [
          {
            section: "ESA - Theory",
            columns: ["Section", "Total Q", "Attempt", "Marks"],
            rows: [
              {
                section: "Section A",
                subtitle: "1 Mark each",
                total_questions: 10,
                attempt: 10,
                marks: 10,
              },
              {
                section: "Section B",
                subtitle: "3 Marks each",
                total_questions: 5,
                attempt: 5,
                marks: 15,
              },
              {
                section: "Section C",
                subtitle: "12.5 Marks each",
                total_questions: 2,
                attempt: 2,
                marks: 25,
              },
            ],
          },
          {
            section: "ESA - Practical",
            columns: ["Component", "Total Q", "Attempt", "Marks"],
            rows: [
              {
                section: "Execution",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 10,
              },
              {
                section: "Result & Analysis",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 5,
              },
              {
                section: "External Viva-Voce",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 5,
              },
            ],
          },
        ],
        summary_cards: [
          { label: "ISA THEORY", value: "20 Marks" },
          { label: "ISA PRACTICAL", value: "15 Marks" },
          { label: "ESA THEORY", value: "50 Marks" },
          { label: "ESA PRACTICAL", value: "20 Marks" },
        ],
        exam_duration: { label: "DURATION", value: "2 + 3 Hrs" },
      },
      {
        pattern_type: "Course without Practical",
        duration: "3 Hours",
        chart: {
          total: 100,
          segments: [
            { label: "Theory", percent: 75, color: "#FF6B00" },
            { label: "Internal", percent: 25, color: "#FFB27A" },
          ],
        },
        subtotals: [
          { label: "Subtotal ISA", marks: 25 },
          { label: "Subtotal ESA", marks: 75 },
        ],
        internal_assessment: [
          {
            section: "Internal Assessment (ISA)",
            components: [
              {
                name: "Test Papers",
                marks: 10,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Mid-term Exam", marks: 6 },
                  { name: "Class Test", marks: 4 },
                ],
              },
              {
                name: "Assignment",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Content Relevance", marks: 2 },
                  { name: "Research Quality", marks: 2 },
                  { name: "Timely Submission", marks: 1 },
                ],
              },
              {
                name: "Seminar",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "Presentation Skills", marks: 1 },
                  { name: "Topic Depth", marks: 3 },
                  { name: "Q&A Interaction", marks: 1 },
                ],
              },
              {
                name: "Attendance",
                marks: 5,
                description: "",
                icon: "",
                sub_components: [
                  { name: "90% - 100%", marks: 5 },
                  { name: "85% - 89%", marks: 4 },
                  { name: "80% - 84%", marks: 3 },
                  { name: "76% - 79%", marks: 2 },
                  { name: "75%", marks: 1 },
                ],
              },
            ],
          },
        ],
        external_examination: [
          {
            section: "External Examination Pattern",
            columns: ["Section", "Total Questions", "Answered", "Marks"],
            rows: [
              {
                section: "Part A",
                subtitle: "2 Marks each",
                total_questions: 10,
                attempt: 10,
                marks: 20,
              },
              {
                section: "Part B",
                subtitle: "5 Marks each",
                total_questions: 5,
                attempt: 5,
                marks: 25,
              },
              {
                section: "Part C",
                subtitle: "15 Marks each",
                total_questions: 2,
                attempt: 2,
                marks: 30,
              },
            ],
          },
        ],
        summary_cards: [
          { label: "SUBTOTAL ISA", value: "25 Marks" },
          { label: "SUBTOTAL ESA", value: "75 Marks" },
        ],
        exam_duration: { label: "EXAM DURATION", value: "3 Hours" },
      },
      {
        pattern_type: "Standalone Practical",
        duration: "4 Hours",
        chart: {
          total: 100,
          segments: [
            { label: "Practical", percent: 70, color: "#FF6B00" },
            { label: "Internal", percent: 30, color: "#FFB27A" },
          ],
        },
        subtotals: [
          { label: "Subtotal ISA", marks: 30 },
          { label: "Subtotal ESA", marks: 70 },
        ],
        internal_assessment: [
          {
            section: "Internal Assessment (ISA)",
            components: [
              {
                name: "Practical Record",
                marks: 10,
                description: "Evaluation criteria for Practical Records.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Lab Performance",
                marks: 10,
                description: "Evaluation criteria for Lab Performance.",
                icon: "",
                sub_components: [],
              },
              {
                name: "Viva-Voce",
                marks: 10,
                description: "Evaluation criteria for Viva-Voce.",
                icon: "",
                sub_components: [],
              },
            ],
          },
        ],
        external_examination: [
          {
            section: "External Examination Pattern",
            columns: ["Component", "Total Questions", "Answered", "Marks"],
            rows: [
              {
                section: "Experiment Execution",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 30,
              },
              {
                section: "Result & Analysis",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 20,
              },
              {
                section: "External Viva-Voce",
                subtitle: "",
                total_questions: 1,
                attempt: 1,
                marks: 20,
              },
            ],
          },
        ],
        summary_cards: [
          { label: "SUBTOTAL ISA", value: "30 Marks" },
          { label: "SUBTOTAL ESA", value: "70 Marks" },
        ],
        exam_duration: { label: "EXAM DURATION", value: "4 Hours" },
      },
    ],

    projects_dissertation: {
      marks_distribution_bar: {
        title: "Marks Distribution",
        total_label: "Total: 100",
        segments: [
          { label: "ESA", percent: 70, color: "#3B82F6" },
          { label: "Internal", percent: 30, color: "#A78BFA" },
        ],
      },
      internal_assessment: [
        {
          section: "Components of Internal Evaluation",
          components: [
            { name: "Relevance of the Topic", marks: 5 },
            { name: "Project Content & Methodology", marks: 10 },
            { name: "Presentation", marks: 10 },
            { name: "Viva-Voce", marks: 5 },
          ],
        },
      ],
      external_examination: [
        {
          section: "Components of External Assessment",
          components: [
            { name: "Project Dissertation", marks: 50 },
            { name: "Presentation & Viva-Voce", marks: 20 },
          ],
        },
      ],
      summary_cards: [
        { label: "SUBTOTAL ISA", value: "30 Marks" },
        { label: "SUBTOTAL ESA", value: "70 Marks" },
      ],
    },

    ojt_evaluation: {
      section_title: "OJT ASSESSMENT CRITERIA",
      columns: ["Criterion", "Marks"],
      components: [
        { name: "Attendance & Punctuality", marks: 20 },
        { name: "Work Performance", marks: 30 },
        { name: "OJT Report", marks: 30 },
        { name: "Viva-Voce", marks: 20 },
      ],
      total_summary: { label: "TOTAL ASSESSMENT", value: "100 Marks" },
    },

    internship_evaluation: {
      section_title: "COMPONENTS OF INTERNSHIP EVALUATION",
      columns: ["Component", "Marks"],
      components: [
        { name: "Industry Supervisor Evaluation", marks: 40 },
        { name: "Internship Report", marks: 30 },
        { name: "Presentation & Viva", marks: 30 },
      ],
      total_summary: { label: "TOTAL EVALUATION", value: "100 Marks" },
    },

    grading_scale: {
      title: "Grading Scale",
      columns: ["Percentage of Marks", "Grade", "Grade Point"],
      rows: [
        {
          percentage_range: "90% - 100%",
          grade: "O",
          grade_color: "green",
          grade_point: 10.0,
        },
        {
          percentage_range: "80% - 89%",
          grade: "A+",
          grade_color: "green",
          grade_point: 9.0,
        },
        {
          percentage_range: "70% - 79%",
          grade: "A",
          grade_color: "green",
          grade_point: 8.0,
        },
        {
          percentage_range: "60% - 69%",
          grade: "B+",
          grade_color: "blue",
          grade_point: 7.0,
        },
        {
          percentage_range: "50% - 59%",
          grade: "B",
          grade_color: "blue",
          grade_point: 6.0,
        },
        {
          percentage_range: "45% - 49%",
          grade: "C",
          grade_color: "orange",
          grade_point: 5.0,
        },
        {
          percentage_range: "40% - 44%",
          grade: "P",
          grade_color: "orange",
          grade_point: 4.0,
        },
        {
          percentage_range: "Below 40%",
          grade: "F",
          grade_color: "red",
          grade_point: 0.0,
        },
      ],
    },

    important_guidelines_banner: {
      tag: "ACADEMIC POLICIES",
      title: "Important Guidelines",
      description:
        "Essential rules and regulations regarding attendance, examinations, grading, and student conduct to ensure a smooth academic journey.",
      background_style: "gradient_orange",
      academic_policies: [
        {
          badge: "Required: 75%",
          title: "Minimum Attendance",
          description:
            "Students must maintain a minimum of 75% attendance in theory and practical sessions separately to be eligible for examinations.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "65% - 75% Range",
          title: "Condonation Policy",
          description:
            "Shortage of attendance between 65% and 75% may be condoned by the Vice-Chancellor on valid grounds, subject to approval.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Max 4 Failed Subjects",
          title: "Year Back Scheme",
          description:
            "Students failing in more than 4 subjects (Theory/Practical combined) will not be promoted to the next academic year.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Submit within 3 days",
          title: "Medical Leave",
          description:
            "Medical certificates must be submitted within 3 days of returning. Approved medical leave is considered for attendance eligibility.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Min 50% Aggregate",
          title: "Pass Percentage",
          description:
            "ISA: Min 50% aggregate (Theory + Practical). ESA: Min 40% in each subject & 50% aggregate.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Lateral Entry",
          title: "Credit Transfer",
          description:
            "Applicable for lateral entry/inter-university transfers. Credits are mapped based on UGC guidelines and subject equivalency.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Up to 5 marks",
          title: "Grace Marks",
          description:
            "Eligible students may receive up to 5 grace marks in theory to pass a specific subject, provided all other subjects are cleared.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Zero Tolerance",
          title: "Malpractice",
          description:
            "Strict disciplinary action, including exam cancellation and debarment for up to 3 years, applies to any student found using unfair means.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Submission Deadline",
          title: "Late Fee",
          description:
            "Examination forms submitted after the deadline attract a late fee. No forms are accepted within 7 days of the exam date.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Within 10 Days",
          title: "Revaluation",
          description:
            "Students can apply for revaluation of answer scripts within 10 days of result declaration.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Within 45 Days",
          title: "Re-exam Scheme",
          description:
            "Supplementary exams are conducted within 45 days for students failing in regular attempts.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Online Portal",
          title: "Result Publish",
          description:
            "Results are published online on the student portal within 30 days of the last examination.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
        {
          badge: "Offline Only",
          title: "Mode of Exam",
          description:
            "All semester-end examinations are conducted in offline Pen & Paper mode only.",
          read_more_cta: "Read More",
          read_more_link: "",
          icon: "",
        },
      ],
    },
  };

  const tabs = currentTabs.includes("exam_policy")
    ? currentTabs
    : [...currentTabs, "exam_policy"];

  await prisma.course.update({
    where: { id: courseId },
    data: {
      metadata: {
        ...metadata,
        tabs,
        tabData: {
          ...tabData,
          exam_policy: examPolicyData,
        },
      } as any,
    },
  });

  console.log(`✓ exam_policy seeded for course "${courseId}" (${course.name})`);
  console.log(
    `  → ${examPolicyData.evaluation_patterns.length} evaluation patterns`,
  );
  console.log(
    `  → ${examPolicyData.grading_scale.rows.length} grading scale rows`,
  );
  console.log(
    `  → ${examPolicyData.important_guidelines_banner.academic_policies.length} academic policies`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
