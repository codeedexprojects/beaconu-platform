import { NotFoundError, ValidationError } from "@/shared/errors";
import { CourseTabsRepository } from "../repositories/course-tabs.repository";
import { HostelService } from "./hostel.service";
import {
  COURSE_SETUP_TAB_IDS,
  TAB_FIELD_MAP,
  VALID_TAB_NAMES,
} from "../validators/course-tabs.validator";

const DEFAULT_SETUP_TABS = [...COURSE_SETUP_TAB_IDS];

function mapTabNameToField(tabName: string): string {
  const field = TAB_FIELD_MAP[tabName];
  if (!field) {
    throw new NotFoundError(
      `Invalid tab name "${tabName}". Valid tabs: ${VALID_TAB_NAMES.join(", ")}`,
    );
  }
  return field;
}

function isSetupTabName(tabName: string): boolean {
  return DEFAULT_SETUP_TABS.includes(tabName as any);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object")
    return Object.keys(value as object).length === 0;
  return false;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
//
function getAdmissionBatches(courseInfo: Record<string, unknown>): unknown[] {
  if (Array.isArray(courseInfo.admission_batches)) {
    return courseInfo.admission_batches;
  }

  const admissions = Array.isArray(courseInfo.admissions)
    ? (courseInfo.admissions as unknown[])
    : [];
  if (admissions.length === 0) return [];

  const sharedBanner = asRecord(courseInfo.admission_status);

  return admissions.map((item) => {
    const admission = asRecord(item);
    const admissionBanner = asRecord(admission.banner);

    const label = asText(admission.label) || asText(admission.year);
    const tag =
      asText(admissionBanner.tag) || asText(sharedBanner.tag) || "UPCOMING";
    const message =
      asText(admissionBanner.message) ||
      asText(sharedBanner.message) ||
      asText(sharedBanner.urgency_label) ||
      asText(admission.seats_note);
    const progress =
      asNumber(admissionBanner.progress_percentage) ||
      asNumber(sharedBanner.progress_percentage) ||
      asNumber(sharedBanner.seat_availability_percent) ||
      asNumber(admission.placement_rate);

    return {
      label,
      status: asText(admission.status) || "upcoming",
      banner: {
        enabled:
          typeof admissionBanner.enabled === "boolean"
            ? admissionBanner.enabled
            : progress > 0 || Boolean(message) || Boolean(tag),
        tag,
        message,
        progress_percentage: progress,
      },
    };
  });
}

function getQuickInfo(courseInfo: Record<string, unknown>): unknown[] {
  if (Array.isArray(courseInfo.quick_info)) {
    return courseInfo.quick_info;
  }

  const overview = asRecord(courseInfo.overview);
  const admissions = Array.isArray(courseInfo.admissions)
    ? (courseInfo.admissions as unknown[])
    : [];
  const firstAdmission = admissions.length > 0 ? asRecord(admissions[0]) : {};
  const basicDetails = asRecord(firstAdmission.basic_details);

  const duration = asText(overview.duration) || asText(basicDetails.duration);
  const studyMode =
    asText(overview.study_mode) || asText(basicDetails.study_mode);
  const academicCycle =
    asText(overview.academic_cycle) || asText(basicDetails.academic_cycle);
  const credits =
    asText(overview.credits) || asText(basicDetails.total_credits);
  const gender =
    asText(overview.gender_accepted) || asText(basicDetails.gender_accepted);
  const category =
    asText(overview.course_category) || asText(basicDetails.course_category);

  return [
    { label: "DURATION", value: duration },
    { label: "STUDY MODE", value: studyMode },
    { label: "ACADEMIC CYCLE", value: academicCycle },
    {
      label: "STUDY CREDITS",
      value: credits
        ? credits.toLowerCase().includes("credit")
          ? credits
          : `${credits} Credits`
        : "",
    },
    { label: "GENDER ADMITTED", value: gender },
    { label: "CAMPUS CATEGORY", value: category },
  ];
}

function getCourseSetupTabsFromMetadata(metadata: unknown): string[] {
  const record = asRecord(metadata);
  const tabs = Array.isArray(record.tabs)
    ? record.tabs.filter((v): v is string => typeof v === "string")
    : [];

  const validTabs = tabs.filter((tab) =>
    DEFAULT_SETUP_TABS.includes(tab as any),
  );
  return validTabs.length > 0
    ? Array.from(new Set(validTabs))
    : DEFAULT_SETUP_TABS;
}

function getSetupTabDataFromMetadata(
  metadata: unknown,
  tabName: string,
): unknown {
  const record = asRecord(metadata);
  const tabData = asRecord(record.tabData);
  return tabData[tabName] ?? {};
}

const DEFAULT_PUBLIC_COURSE_INFO_TABS = [
  "course_info",
  "admission_policy",
  "placements",
  "fees",
  "financial_aid",
  "student_housing",
  "exam_policy",
  "faculty",
  "review",
  "library",
  "clubs_associations",
  "alliance",
  "other_courses_offered",
  "demo_graphics",
];

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstNonEmptyStringArray(...values: unknown[]): string[] {
  for (const value of values) {
    const next = asStringArray(value);
    if (next.length > 0) return next;
  }
  return [];
}

function toPositiveInt(value: unknown): number {
  const n = asNumber(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function numberFromText(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function normalizeQuickInfoItems(
  value: unknown,
): Array<{ label: string; value: string }> {
  return asArray(value).map((item, index) => {
    if (typeof item === "string") {
      return { label: `INFO_${index + 1}`, value: item };
    }
    const rec = asRecord(item);
    return {
      label: asText(rec.label) || `INFO_${index + 1}`,
      value: asText(rec.value),
    };
  });
}

function normalizeHighlightsItems(value: unknown): Array<{ text: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") return { text: item };
    const rec = asRecord(item);
    return { text: asText(rec.text) || asText(rec.title) || asText(rec.tag) };
  });
}

const KEY_DATE_STATUSES = ["urgent", "active", "inactive"] as const;
type KeyDateStatus = (typeof KEY_DATE_STATUSES)[number];

function normalizeKeyDateStatus(value: unknown): KeyDateStatus | "" {
  const status = asText(value).toLowerCase();
  return (KEY_DATE_STATUSES as readonly string[]).includes(status)
    ? (status as KeyDateStatus)
    : "";
}

const FEE_DETAIL_GENDERS = ["Boys", "Girls", "Other"] as const;

function normalizeAccreditationItems(
  value: unknown,
): Array<{ tag: string; image: string; document: string; title: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return { tag: "", image: "", document: "", title: item };
    }
    const rec = asRecord(item);
    return {
      tag: asText(rec.tag),
      image: asText(rec.image),
      document: asText(rec.document),
      title: asText(rec.title) || asText(rec.text),
    };
  });
}

function normalizeKeyDateItems(value: unknown): Array<{
  date: string;
  label: string;
  status: KeyDateStatus | "";
}> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return { date: "", label: item, status: "" };
    }
    const rec = asRecord(item);
    return {
      date: asText(rec.date),
      label: asText(rec.label),
      status: normalizeKeyDateStatus(rec.status),
    };
  });
}

function normalizeCurriculumSemesters(
  value: unknown,
): Array<Record<string, unknown>> {
  return asArray(value).map((item, index) => {
    const rec = asRecord(item);
    return {
      id: asText(rec.id) || `sem_${index + 1}`,
      name: asText(rec.name) || asText(rec.label) || `Semester ${index + 1}`,
      expanded: asBoolean(rec.expanded, false),
      footnote: asText(rec.footnote),
      core_subjects: asStringArray(rec.core_subjects),
      specializations: asArray(rec.specializations).map((sp) => {
        const sr = asRecord(sp);
        return {
          title: asText(sr.title),
          selected: asText(sr.selected),
          subjects: asStringArray(sr.subjects),
        };
      }),
    };
  });
}

function normalizeCourseStructureSegments(
  value: unknown,
): Array<{ label: string; details: string; credits: number }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return { label: item, details: "", credits: 0 };
    }
    const rec = asRecord(item);
    return {
      label: asText(rec.label) || asText(rec.title),
      details: asText(rec.details),
      credits: toPositiveInt(rec.credits) || numberFromText(rec.details),
    };
  });
}

function normalizeNamedItems(value: unknown): Array<{ name: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") return { name: item };
    const rec = asRecord(item);
    return { name: asText(rec.name) || asText(rec.label) || asText(rec.title) };
  });
}

function normalizeCareerItems(
  value: unknown,
): Array<{ role: string; salary_range: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") return { role: item, salary_range: "" };
    const rec = asRecord(item);
    return {
      role: asText(rec.role) || asText(rec.title),
      salary_range: asText(rec.salary_range) || asText(rec.salary),
    };
  });
}

function normalizeValueAddedItems(value: unknown): Array<{
  name: string;
  credit_label: string;
  delivery_modes: string[];
  delivery_mode_label: string;
}> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        name: item,
        credit_label: "",
        delivery_modes: [],
        delivery_mode_label: "DELIVERY MODES",
      };
    }
    const rec = asRecord(item);
    return {
      name: asText(rec.name) || asText(rec.title),
      credit_label: asText(rec.credit_label),
      delivery_modes: asStringArray(rec.delivery_modes),
      delivery_mode_label: asText(rec.delivery_mode_label) || "DELIVERY MODES",
    };
  });
}

function normalizeFlexibleExitItems(
  value: unknown,
): Array<{ title: string; description: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return { title: item, description: "" };
    }
    const rec = asRecord(item);
    return {
      title: asText(rec.title) || asText(rec.award) || asText(rec.label),
      description: asText(rec.description),
    };
  });
}

function normalizeClassSchedule(
  value: unknown,
): Array<{ day: string; time: string }> {
  return asArray(value).map((item, index) => {
    if (typeof item === "string") {
      const parts = item.split(":");
      if (parts.length >= 2) {
        return { day: parts[0].trim(), time: parts.slice(1).join(":").trim() };
      }
      return { day: `Day ${index + 1}`, time: item };
    }
    const rec = asRecord(item);
    const day = asText(rec.day) || `Day ${index + 1}`;
    if (asBoolean(rec.closed, false)) {
      return { day, time: "Closed" };
    }
    const start = asText(rec.start);
    const end = asText(rec.end);
    const time = asText(rec.time) || (start && end ? `${start} - ${end}` : "");
    return { day, time };
  });
}

function normalizeRoomItems(
  value: unknown,
): Array<{ icon: string; name: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") return { icon: "", name: item };
    const rec = asRecord(item);
    return {
      icon: asText(rec.icon),
      name: asText(rec.name) || asText(rec.label),
    };
  });
}

function normalizeFaqItems(
  value: unknown,
): Array<{ answer: string; expanded: boolean; question: string }> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return { answer: "", expanded: false, question: item };
    }
    const rec = asRecord(item);
    return {
      answer: asText(rec.answer),
      expanded: asBoolean(rec.expanded, false),
      question: asText(rec.question),
    };
  });
}

function normalizeAlumniItems(value: unknown): Array<Record<string, unknown>> {
  return asArray(value).map((item) => {
    const rec = asRecord(item);
    return {
      name: asText(rec.name),
      image: asText(rec.image),
      designation: asText(rec.designation),
      career_progression: asArray(rec.career_progression).map((step) => {
        const sr = asRecord(step);
        return {
          year: asText(sr.year),
          description: asText(sr.description),
        };
      }),
    };
  });
}

function normalizeCertificationItems(value: unknown): Array<{
  tag: string;
  title: string;
  description: string;
  cta_label: string;
  link: string;
}> {
  return asArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        tag: "BONUS CERTIFICATION",
        title: item,
        description: "",
        cta_label: "View Certificate Details",
        link: "",
      };
    }
    const rec = asRecord(item);
    return {
      tag: asText(rec.tag),
      title: asText(rec.title) || asText(rec.name),
      description: asText(rec.description) || asText(rec.note),
      cta_label: asText(rec.cta_label) || asText(rec.ctaLabel),
      link: asText(rec.link) || asText(rec.certificate_link),
    };
  });
}

function getCourseInfoSource(data: unknown): Record<string, unknown> {
  const record = asRecord(data);
  const wrappedData = asRecord(record.data);
  return Object.keys(wrappedData).length > 0 ? wrappedData : record;
}

function normalizeCourseInfoData(data: unknown): Record<string, unknown> {
  const record = getCourseInfoSource(data);
  const highlightData = asRecord(record.highlights);
  const accreditationData = asRecord(record.accreditations);
  const keyDatesData = asRecord(record.keyDates);
  const curriculumData = asRecord(record.curriculum);
  const curriculumBrochure = asRecord(curriculumData.brochure);
  const courseStructureData = asRecord(record.courseStructure);
  const valueAddedCoursesData = asRecord(record.valueAddedCourses);
  const careerOpportunitiesData = asRecord(record.careerOpportunities);
  const higherEducationData = asRecord(record.higherEducationCertifications);
  const flexibleExitOptionsData = asRecord(record.flexibleExitOptions);
  const classTimingsData = asRecord(record.classTimings);
  const industryToolsData = asRecord(record.industryTools);
  const labFacilitiesData = asRecord(record.labFacilities);
  const roomFacilitiesData = asRecord(record.roomFacilities);
  const featuredAlumniData = asRecord(record.featuredAlumni);
  const faqsData = asRecord(record.faqs);
  const studentForumData = asRecord(
    record.studentForum || record.student_forum,
  );
  const certificationsData = asRecord(record.certifications);
  const bonusCertificationData = asRecord(record.bonus_certification);
  const legacyHigherEducation = asRecord(
    record.higher_education || record.higher_education_and_certifications,
  );
  const quickInfo = normalizeQuickInfoItems(
    Array.isArray(record.quick_info) ? record.quick_info : getQuickInfo(record),
  );
  const highlightItems = normalizeHighlightsItems(
    Array.isArray(highlightData.items)
      ? highlightData.items
      : Array.isArray(record.program_highlights)
        ? record.program_highlights
        : [],
  );
  const accreditationItems = normalizeAccreditationItems(
    Array.isArray(accreditationData.items)
      ? accreditationData.items
      : Array.isArray(record.course_accolades)
        ? record.course_accolades
        : [],
  );
  const keyDateItems = normalizeKeyDateItems(
    Array.isArray(keyDatesData.items)
      ? keyDatesData.items
      : Array.isArray(record.key_dates)
        ? record.key_dates
        : [],
  );
  const curriculumSemesters = normalizeCurriculumSemesters(
    Array.isArray(curriculumData.semesters) ? curriculumData.semesters : [],
  );
  const structureSegments = normalizeCourseStructureSegments(
    Object.keys(courseStructureData).length > 0
      ? courseStructureData.segments
      : Array.isArray(record.course_structure)
        ? record.course_structure
        : [],
  );
  const valueAddedItems = normalizeValueAddedItems(
    Object.keys(valueAddedCoursesData).length > 0
      ? valueAddedCoursesData.items
      : Array.isArray(record.value_added_courses)
        ? record.value_added_courses
        : [],
  );
  const careerItems = normalizeCareerItems(
    Object.keys(careerOpportunitiesData).length > 0
      ? careerOpportunitiesData.items
      : Array.isArray(record.career_opportunities)
        ? record.career_opportunities
        : [],
  );
  const flexibleItems = normalizeFlexibleExitItems(
    Object.keys(flexibleExitOptionsData).length > 0
      ? flexibleExitOptionsData.items
      : Array.isArray(record.flexible_exit_options)
        ? record.flexible_exit_options
        : [],
  );
  const classSchedule = normalizeClassSchedule(
    Object.keys(classTimingsData).length > 0
      ? classTimingsData.schedule
      : Array.isArray(record.class_timings)
        ? record.class_timings
        : [],
  );
  const toolItems = normalizeNamedItems(
    Object.keys(industryToolsData).length > 0
      ? industryToolsData.items
      : Array.isArray(record.industry_tools)
        ? record.industry_tools
        : [],
  );
  const labItems = normalizeNamedItems(
    Object.keys(labFacilitiesData).length > 0
      ? labFacilitiesData.items
      : Array.isArray(record.lab_facilities)
        ? record.lab_facilities
        : [],
  );
  const roomItems = normalizeRoomItems(
    Object.keys(roomFacilitiesData).length > 0
      ? roomFacilitiesData.items
      : Array.isArray(record.classroom_facilities)
        ? record.classroom_facilities
        : [],
  );
  const alumniItems = normalizeAlumniItems(
    Array.isArray(featuredAlumniData.items)
      ? featuredAlumniData.items
      : Array.isArray(record.featured_alumni)
        ? record.featured_alumni
        : Array.isArray(record.featuredAlumni)
          ? record.featuredAlumni
          : [],
  );
  const faqItems = normalizeFaqItems(
    Array.isArray(faqsData.items)
      ? faqsData.items
      : Array.isArray(record.faqs)
        ? record.faqs
        : [],
  );
  const certificationItems = normalizeCertificationItems(
    Array.isArray(certificationsData.items)
      ? certificationsData.items
      : Object.keys(bonusCertificationData).length > 0
        ? [bonusCertificationData]
        : [],
  );

  return {
    name: asText(record.name || record.course_name),
    admission_batches: getAdmissionBatches(record),
    quick_info: quickInfo,
    tabs: DEFAULT_PUBLIC_COURSE_INFO_TABS,
    highlights: {
      title:
        asText(highlightData.title) ||
        asText(asRecord(record.program_highlights).title) ||
        "Program Highlights",
      items: highlightItems,
    },
    accreditations: {
      title:
        asText(accreditationData.title) ||
        asText(asRecord(record.course_accolades).title) ||
        "Course Accolades",
      items: accreditationItems,
    },
    keyDates: {
      title: asText(keyDatesData.title) || "Key Dates to Remember",
      items: keyDateItems,
    },
    curriculum: {
      title: asText(curriculumData.title) || "Curriculum",
      subtitle: asText(curriculumData.subtitle),
      brochure: asText(curriculumBrochure.url)
        ? {
            url: asText(curriculumBrochure.url),
            icon: asText(curriculumBrochure.icon),
            label: asText(curriculumBrochure.label),
          }
        : {
            url:
              asText(curriculumData.brochure_link) ||
              asText(curriculumData.brochure_upload),
            icon: "",
            label: "",
          },
      semesters: curriculumSemesters,
    },
    courseStructure: {
      title: asText(courseStructureData.title) || "Course Structure",
      segments: structureSegments,
      subtitle: asText(courseStructureData.subtitle),
      chart_type: asText(courseStructureData.chart_type),
    },
    valueAddedCourses: {
      title: asText(valueAddedCoursesData.title) || "Value Added Course",
      items: valueAddedItems,
    },
    careerOpportunities: {
      title: asText(careerOpportunitiesData.title) || "Career Opportunities",
      items: careerItems,
    },
    higherEducationCertifications: {
      global: {
        icon:
          asText(asRecord(higherEducationData.global).icon) ||
          asText(asRecord(legacyHigherEducation.global).icon),
        items: firstNonEmptyStringArray(
          asRecord(higherEducationData.global).items,
          asRecord(legacyHigherEducation.global).items,
          legacyHigherEducation.global_certifications,
        ),
        title:
          asText(asRecord(higherEducationData.global).title) ||
          asText(asRecord(legacyHigherEducation.global).title) ||
          "GLOBAL CERTIFICATIONS",
      },
      postgraduation: {
        icon:
          asText(asRecord(higherEducationData.postgraduation).icon) ||
          asText(asRecord(legacyHigherEducation.postgraduation).icon),
        items: firstNonEmptyStringArray(
          asRecord(higherEducationData.postgraduation).items,
          asRecord(legacyHigherEducation.postgraduation).items,
          legacyHigherEducation.postgraduation,
        ),
        title:
          asText(asRecord(higherEducationData.postgraduation).title) ||
          asText(asRecord(legacyHigherEducation.postgraduation).title) ||
          "POSTGRADUATION",
      },
    },
    flexibleExitOptions: {
      title: asText(flexibleExitOptionsData.title) || "Flexible Exit Options",
      subtitle: asText(flexibleExitOptionsData.subtitle),
      items: flexibleItems,
    },
    classTimings: {
      title: asText(classTimingsData.title) || "Class Timings",
      subtitle: asText(classTimingsData.subtitle),
      schedule: classSchedule,
    },
    industryTools: {
      title: asText(industryToolsData.title) || "Industry Tools You'll Master",
      items: toolItems,
    },
    labFacilities: {
      title: asText(labFacilitiesData.title) || "Lab Facilities",
      items: labItems,
    },
    roomFacilities: {
      title: asText(roomFacilitiesData.title) || "Class Room Facilities",
      items: roomItems,
    },
    featuredAlumni: {
      title: asText(featuredAlumniData.title) || "Featured Alumni",
      highlight_word: asText(featuredAlumniData.highlight_word) || "Alumni",
      items: alumniItems,
    },
    faqs: {
      title: asText(faqsData.title) || "Frequently Asked Questions",
      items: faqItems,
    },
    studentForum: {
      icon: asText(studentForumData.icon),
      link:
        asText(studentForumData.link) ||
        asText(studentForumData.admission_team_contact),
      title: asText(studentForumData.title) || "Student Forum",
      enabled: asBoolean(studentForumData.enabled, true),
      cta_icon: asText(studentForumData.cta_icon),
      cta_label: asText(studentForumData.cta_label),
      description: asText(studentForumData.description),
    },
    certifications: {
      title: asText(certificationsData.title) || "Certifications",
      items: certificationItems,
    },
  };
}

function transformPublicFeeTab(raw: Record<string, unknown>) {
  const feeDetails = Array.isArray(raw.fee_details)
    ? (raw.fee_details as Record<string, unknown>[]).map((detail) => {
        const summary = asRecord(detail.fees_summary);
        const tuitionRows = Array.isArray(detail.tuition_fees)
          ? (detail.tuition_fees as Record<string, unknown>[]).map((r) => ({
              year: asText(r.year),
              amount: asText(r.amount).replace(/^Rs\s?/, "₹ "),
            }))
          : [];
        const mapItems = (arr: unknown) =>
          Array.isArray(arr)
            ? (arr as Record<string, unknown>[]).map((i) => ({
                label: asText(i.label),
                amount: asText(i.amount).replace(/^Rs\s?/, "₹ "),
              }))
            : [];
        const installments = Array.isArray(detail.deadlines_and_installments)
          ? (
              detail.deadlines_and_installments as Record<string, unknown>[]
            ).map((i) => ({
              due: asText(i.due).toUpperCase(),
              label: asText(i.label),
              amount: asText(i.amount).replace(/^Rs\s?/, "₹ "),
            }))
          : [];

        return {
          quota: asText(detail.quota),
          gender: asText(detail.gender),
          tuition_fees: {
            title: "Tuition Amount",
            rows: tuitionRows,
          },
          one_time_payable_fees: {
            title: "One-time Payable Fees",
            icon: "https://cdn.iconsdb.example.com/icons/wallet-orange.png",
            items: mapItems(detail.one_time_payable_fees),
          },
          additional_fees: {
            title: "Additional Fees",
            icon: "https://cdn.iconsdb.example.com/icons/document-orange.png",
            items: mapItems(detail.additional_fees),
          },
          deadlines_and_installments: {
            title: "Deadlines & Installments",
            icon: "https://cdn.iconsdb.example.com/icons/calendar-orange.png",
            items: installments,
          },
          fees_summary: {
            title: "Fees Summary",
            icon: "https://cdn.iconsdb.example.com/icons/document-text-orange.png",
            full_course_fee: {
              label: "Full course fee",
              amount: asText(summary.full_course_fee),
            },
            booking_amount: {
              label: "Booking Amount",
              amount: asText(summary.booking_amount),
            },
          },
        };
      })
    : [];

  const pdfRaw = asRecord(raw.fee_structure_pdf);
  const pdfSize = asText(pdfRaw.size);

  return {
    tab: "fees",
    title: "Tuition Fees",
    fee_structure_pdf: {
      icon: "https://cdn.iconsdb.example.com/icons/pdf-document-red.png",
      label: "Download Fee Structure",
      subtitle: `Detailed breakdown PDF${pdfSize ? ` (${pdfSize})` : ""}`,
      size: pdfSize,
      download_icon: "https://cdn.iconsdb.example.com/icons/download-gray.png",
      url: asText(pdfRaw.url),
    },
    fee_details: feeDetails,
    whats_included: {
      title: "WHAT'S INCLUDED",
      icon: "https://cdn.iconsdb.example.com/icons/check-circle-green.png",
      items: Array.isArray(raw.whats_included) ? raw.whats_included : [],
    },
    whats_excluded: {
      title: "WHAT'S EXCLUDED",
      icon: "https://cdn.iconsdb.example.com/icons/x-circle-red.png",
      items: Array.isArray(raw.whats_excluded) ? raw.whats_excluded : [],
    },
    refund_policy: {
      title: "Refund Policy",
      icon: "https://cdn.iconsdb.example.com/icons/info-circle-gray.png",
      items: Array.isArray(raw.refund_policy) ? raw.refund_policy : [],
    },
  };
}

function normalizeAmount(val: unknown): string {
  return asText(val).replace(/^Rs\s?/, "₹");
}

function transformPublicFinancialAidTab(raw: Record<string, unknown>) {
  const meritRaw = asRecord(raw.merit_scholarship);
  const calcRaw = asRecord(meritRaw.calculator);
  const tcRaw = meritRaw.terms_and_conditions;

  const portOfEntryRaw = asRecord(calcRaw.port_of_entry);
  const rankRangeRaw = asRecord(calcRaw.rank_range);

  const portOfEntryOptions = Array.isArray(calcRaw.port_of_entry_options)
    ? calcRaw.port_of_entry_options
    : Array.isArray(portOfEntryRaw.options)
      ? portOfEntryRaw.options
      : [];

  const rankRangeOptions = Array.isArray(calcRaw.rank_range_options)
    ? calcRaw.rank_range_options
    : Array.isArray(rankRangeRaw.options)
      ? rankRangeRaw.options
      : [];

  const tcItems = Array.isArray(tcRaw)
    ? tcRaw
    : Array.isArray(asRecord(tcRaw).items)
      ? asRecord(tcRaw).items
      : [];

  const merit_scholarship = {
    title: asText(meritRaw.title) || "Merit Scholarship",
    calculator: {
      title: asText(calcRaw.title) || "Scholarship Calculator",
      icon: "https://cdn.iconsdb.example.com/icons/calculator-orange.png",
      port_of_entry: {
        icon: "https://cdn.iconsdb.example.com/icons/login-arrow-gray.png",
        label: "Select Port of Entry",
        selected: "",
        options: portOfEntryOptions,
      },
      rank_range: {
        icon: "https://cdn.iconsdb.example.com/icons/bar-chart-gray.png",
        label: "Select Rank Range",
        selected: "",
        options: rankRangeOptions,
      },
    },
    terms_and_conditions: {
      title: "TERMS & CONDITIONS",
      icon: "https://cdn.iconsdb.example.com/icons/check-circle-green.png",
      items: tcItems,
    },
  };

  const concessionsRaw = asRecord(raw.financial_concessions);
  const rawItems = Array.isArray(concessionsRaw.items)
    ? (concessionsRaw.items as Record<string, unknown>[])
    : [];

  const concessionItems = rawItems.map((item) => {
    const details = asRecord(item.details);
    const criteriaRaw = asRecord(details.eligibility_criteria);
    const criteria = Array.isArray(details.eligibility_criteria)
      ? (details.eligibility_criteria as string[])
      : Array.isArray(criteriaRaw.items)
        ? (criteriaRaw.items as string[])
        : [];

    const scholarshipRaw = asRecord(details.scholarship);
    const netPayableRaw = asRecord(details.net_payable);

    const scholarshipAmt = normalizeAmount(
      details.scholarship_amount ?? scholarshipRaw.amount,
    );
    const netPayableAmt = normalizeAmount(
      details.net_payable ?? netPayableRaw.amount,
    );
    const discountPct = asNumber(item.discount_percent);

    const detailsCtaRaw = asRecord(item.details_cta);
    const expandedRaw = item.expanded;

    const expanded = typeof expandedRaw === "boolean" ? expandedRaw : true;

    const detailsCta = {
      label: asText(detailsCtaRaw.label) || "SHOW LESS",
      icon:
        asText(detailsCtaRaw.icon) ||
        "https://cdn.iconsdb.example.com/icons/chevron-up-gray.png",
    };

    return {
      name: asText(item.name),
      discount_percent: discountPct,
      discount_label: asText(item.discount_label) || `${discountPct}% OFF`,
      accent_color: asText(item.accent_color) || "black",
      expanded,
      details_cta: detailsCta,
      details: {
        eligibility_criteria: {
          title: "ELIGIBILITY CRITERIA",
          items: criteria,
        },
        scholarship: {
          icon: "https://cdn.iconsdb.example.com/icons/star-purple.png",
          label: "SCHOLARSHIP",
          amount: scholarshipAmt === "₹" ? "" : scholarshipAmt,
        },
        net_payable: {
          icon: "https://cdn.iconsdb.example.com/icons/document-teal.png",
          label: "NET PAYABLE",
          amount: netPayableAmt === "₹" ? "" : netPayableAmt,
        },
      },
    };
  });

  const totalTypes =
    asNumber(concessionsRaw.total_types) || concessionItems.length;

  return {
    tab: "financial_aid",
    merit_scholarship,
    financial_concessions: {
      title: "Financial Concessions",
      total_types: totalTypes,
      total_types_label:
        asText(concessionsRaw.total_types_label) || `${totalTypes} TYPES`,
      items: concessionItems,
    },
  };
}

function transformPublicExamPolicyTab(raw: Record<string, unknown>) {
  const evaluationPatterns = Array.isArray(raw.evaluation_patterns)
    ? (raw.evaluation_patterns as Record<string, unknown>[]).map((pattern) => {
        const chart = asRecord(pattern.chart);
        return {
          ...pattern,
          chart: {
            total: asNumber(chart.total) || 100,
            total_label: asText(chart.total_label) || "Total",
            segments: Array.isArray(chart.segments) ? chart.segments : [],
          },
        };
      })
    : [];

  const projRaw = asRecord(raw.projects_dissertation);
  const mdb = asRecord(projRaw.marks_distribution_bar);
  const projectsDissertation =
    Object.keys(projRaw).length > 0
      ? {
          ...projRaw,
          marks_distribution_bar: {
            title: asText(mdb.title) || "Marks Distribution",
            total_label: asText(mdb.total_label) || "Total: 100",
            segments: Array.isArray(mdb.segments) ? mdb.segments : [],
          },
        }
      : {};

  const ojtRaw = asRecord(raw.ojt_evaluation);
  const ojtEvaluation =
    Object.keys(ojtRaw).length > 0
      ? {
          ...ojtRaw,
          columns: Array.isArray(ojtRaw.columns)
            ? ojtRaw.columns
            : ["Criterion", "Marks"],
        }
      : {};

  const internshipRaw = asRecord(raw.internship_evaluation);
  const internshipEvaluation =
    Object.keys(internshipRaw).length > 0
      ? {
          ...internshipRaw,
          columns: Array.isArray(internshipRaw.columns)
            ? internshipRaw.columns
            : ["Component", "Marks"],
        }
      : {};

  const gradingRaw = asRecord(raw.grading_scale);
  const gradingScale =
    Object.keys(gradingRaw).length > 0
      ? {
          ...gradingRaw,
          columns: Array.isArray(gradingRaw.columns)
            ? gradingRaw.columns
            : ["Percentage of Marks", "Grade", "Grade Point"],
        }
      : {};

  const bannerRaw = asRecord(raw.important_guidelines_banner);
  const policies = Array.isArray(bannerRaw.academic_policies)
    ? (bannerRaw.academic_policies as Record<string, unknown>[]).map((p) => ({
        ...p,
        read_more_cta: asText(p.read_more_cta) || "Read More",
      }))
    : [];
  const importantGuidelinesBanner =
    Object.keys(bannerRaw).length > 0
      ? { ...bannerRaw, academic_policies: policies }
      : {};

  return {
    tab: "exam_policy",
    evaluation_patterns: evaluationPatterns,
    projects_dissertation: projectsDissertation,
    ojt_evaluation: ojtEvaluation,
    internship_evaluation: internshipEvaluation,
    grading_scale: gradingScale,
    important_guidelines_banner: importantGuidelinesBanner,
  };
}

function transformPublicStudentHousingTab(
  raw: Record<string, unknown>,
  hostels: Array<{
    id: string;
    name: string;
    hostelType: string;
    isOnCampus: boolean;
    distanceFromCampus: string | null;
    totalBeds: number | null;
    coverImageUrl: string | null;
    roomTypes: Array<{
      id: string;
      name: string;
      totalBeds: number;
      availableBeds: number;
      annualPlanPrice: unknown;
      monthlyPlanPrice: unknown;
    }>;
  }>,
) {
  return {
    tab: "student_housing",
    summary: asText(raw.summary),
    hostels: hostels.map((hostel) => ({
      id: hostel.id,
      name: hostel.name,
      hostelType: hostel.hostelType,
      isOnCampus: hostel.isOnCampus,
      distanceFromCampus: hostel.distanceFromCampus,
      totalBeds: hostel.totalBeds,
      coverImageUrl: hostel.coverImageUrl,
      roomTypes: hostel.roomTypes.map((roomType) => ({
        id: roomType.id,
        name: roomType.name,
        totalBeds: roomType.totalBeds,
        availableBeds: roomType.availableBeds,
        annualPlanPrice:
          roomType.annualPlanPrice != null
            ? Number(roomType.annualPlanPrice)
            : null,
        monthlyPlanPrice:
          roomType.monthlyPlanPrice != null
            ? Number(roomType.monthlyPlanPrice)
            : null,
      })),
    })),
  };
}

function transformPublicLibraryTab(raw: Record<string, unknown>) {
  const libraries = Array.isArray(raw.libraries)
    ? (raw.libraries as Record<string, unknown>[]).map((lib) => {
        const ar = asRecord(lib.available_resources);
        const lh = asRecord(lib.library_hours);
        const fac = asRecord(lib.facilities);
        return {
          ...lib,
          available_resources: {
            title: asText(ar.title) || "Available Resources",
            items: Array.isArray(ar.items) ? ar.items : [],
          },
          library_hours: {
            title: asText(lh.title) || "Library Hours",
            icon:
              asText(lh.icon) ||
              "https://cdn.iconsdb.example.com/icons/clock-orange.png",
            days: Array.isArray(lh.days) ? lh.days : [],
          },
          facilities: {
            title: asText(fac.title) || "Facilities",
            items: Array.isArray(fac.items) ? fac.items : [],
          },
        };
      })
    : [];

  return { tab: "library", libraries };
}

function transformPublicFacultyTab(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const record = asRecord(raw);
  if (Array.isArray(record.list)) return record.list as unknown[];
  return [];
}

function transformPublicReviewTab(raw: Record<string, unknown>) {
  // Overall rating
  const overallRaw = asRecord(raw.overallRating);
  const averageRating =
    asNumber(overallRaw.rating) || asNumber(raw.average_rating);
  const totalReviews =
    asNumber(overallRaw.totalReviews) || asNumber(raw.total_reviews);

  // Rating breakdown (emoji buckets)
  const ratingDistribution = Array.isArray(raw.ratingDistribution)
    ? (raw.ratingDistribution as Record<string, unknown>[])
    : Array.isArray(raw.rating_breakdown)
      ? (raw.rating_breakdown as Record<string, unknown>[])
      : [];
  const ratingBreakdownItems = ratingDistribution.map((item) => ({
    emoji: asText(item.emoji),
    count: asNumber(item.count),
  }));

  // Category ratings
  const categoryRatings = Array.isArray(raw.categoryRatings)
    ? (raw.categoryRatings as Record<string, unknown>[])
    : Array.isArray(raw.review_categories)
      ? (raw.review_categories as Record<string, unknown>[])
      : [];
  const categoryIcons: Record<string, string> = {
    "Faculty & Course":
      "https://cdn.iconsdb.example.com/icons/book-faculty-orange.png",
    "Campus Life":
      "https://cdn.iconsdb.example.com/icons/graduation-cap-orange.png",
    Infrastructure: "https://cdn.iconsdb.example.com/icons/building-orange.png",
    Placements: "https://cdn.iconsdb.example.com/icons/briefcase-orange.png",
  };
  const categoryRatingItems = categoryRatings.map((item) => {
    const label = asText(item.label) || asText(item.name);
    return {
      icon:
        asText(item.icon) ||
        categoryIcons[label] ||
        "https://cdn.iconsdb.example.com/icons/star-orange.png",
      label,
      rating: asNumber(item.rating) || asNumber(item.average_rating) || 4,
    };
  });

  // Recent reviews (first page, up to 5)
  const reviews = Array.isArray(raw.reviews)
    ? (raw.reviews as Record<string, unknown>[])
    : [];
  const recentReviewItems = reviews.slice(0, 5).map((r, idx) => ({
    id: asText(r.id) || `review_${String(idx + 1).padStart(3, "0")}`,
    reviewer_name: asText(r.reviewer_name) || asText(r.name) || "Anonymous",
    reviewer_avatar:
      asText(r.avatar) ||
      asText(r.reviewer_avatar) ||
      "https://cdn.iconsdb.example.com/icons/avatar-placeholder-orange.png",
    date: asText(r.date),
    rating: r.rating != null ? Number(r.rating) : averageRating || 4.5,
    comment: asText(r.comment),
  }));

  const paginationRaw = asRecord(raw.pagination);
  const hasMore =
    typeof paginationRaw.hasMore === "boolean"
      ? paginationRaw.hasMore
      : reviews.length > 5;

  return {
    tab: "review",
    overall_rating: {
      average: averageRating,
      total_reviews: totalReviews,
    },
    rating_breakdown: {
      items: ratingBreakdownItems,
    },
    category_ratings: {
      items: categoryRatingItems,
    },
    recent_reviews: {
      title: "Reviews",
      items: recentReviewItems,
      load_more_cta: {
        label: asText(paginationRaw.loadMoreLabel) || "Load more",
      },
    },
    has_more: hasMore,
  };
}

function getDefaultForTab(tabSlug: string): unknown {
  if (tabSlug === "eligibility_criteria") {
    return {
      indian_student: { quotas: [] },
      foreign_student: { criteria: [] },
    };
  }

  // Object-type tabs
  const objectTabs = [
    "course_structure",
    "higher_education_certifications",
    "class_timings",
    "exam_policy",
    "demographics",
  ];
  if (objectTabs.includes(tabSlug)) return {};
  return [];
}

function transformPublicClubsAssociationsTab(raw: Record<string, unknown>): {
  data: Record<string, unknown>[];
} {
  const clubs = Array.isArray(raw.clubs)
    ? (raw.clubs as Record<string, unknown>[])
    : [];

  const transformedClubs = clubs.map((club) => {
    const details = asRecord(club.details);
    const recentEvents = asRecord(club.recent_events || details.recent_events);
    const events = Array.isArray(recentEvents.events)
      ? (recentEvents.events as Record<string, unknown>[])
      : [];

    return {
      id: asText(club.id),
      name:
        asText(details.full_name) ||
        asText(club.name) ||
        asText(club.short_name),
      category: (
        asText(club.category) || asText(details.category)
      ).toUpperCase(),
      cover_image: asText(club.cover_image || details.cover_image),
      logo: asText(club.logo || details.logo),
      about: {
        description: asText(details.about),
      },
      mission: {
        description: asText(details.mission),
      },
      key_activities: {
        items: Array.isArray(details.key_activities)
          ? (details.key_activities as string[])
          : [],
      },
      recent_events: {
        view_all_cta: {
          label: "View Happenings",
          link: asText(recentEvents.happenings_link),
        },
        items: events.map((event, index) => ({
          id: asText(event.id) || `event_${index + 1}`,
          title: asText(event.title),
          thumbnail: asText(event.image || event.thumbnail),
          link: asText(event.link),
        })),
      },
    };
  });

  return {
    data: transformedClubs,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function assignMissingIds(
  items: Record<string, unknown>[],
  idPrefix: string,
  nameField = "name",
): Record<string, unknown>[] {
  const usedIds = new Set(
    items.map((item) => asText(item.id)).filter((id) => id.length > 0),
  );

  return items.map((item, index) => {
    if (asText(item.id)) return item;

    const slug = slugify(asText(item[nameField])) || String(index + 1);
    let candidate = `${idPrefix}_${slug}`;
    let suffix = 2;
    while (usedIds.has(candidate)) {
      candidate = `${idPrefix}_${slug}_${suffix}`;
      suffix += 1;
    }
    usedIds.add(candidate);
    return { ...item, id: candidate };
  });
}

// Keys that normalizeCourseInfoData() derives purely for public display.
// The admin frontend never writes these — they only ever land in stored
// data as leftovers from an old write-time normalization bug. Because
// `{ items: [], title: "..." }` is never considered "empty" by isEmptyValue,
// a stale leftover here permanently shadows the real flat-key data
// (e.g. `value_added_courses`) in the public read path. Strip them on every
// save so they can't keep shadowing fresh edits.
const LEGACY_DERIVED_COURSE_INFO_KEYS = [
  "tabs",
  "courseStructure",
  "valueAddedCourses",
  "careerOpportunities",
  "higherEducationCertifications",
  "flexibleExitOptions",
  "classTimings",
  "industryTools",
  "labFacilities",
  "roomFacilities",
  "studentForum",
  "certifications",
] as const;

// Blank-array-entry filtering for every field below is handled generically
// by deepStripBlankEntries() (see normalizeSetupTabData) — this function only
// needs to purge the legacy keys that the generic walker can't know about.
function cleanCourseInfoWriteData(data: unknown): unknown {
  const record = asRecord(data);
  const cleaned: Record<string, unknown> = { ...record };

  for (const key of LEGACY_DERIVED_COURSE_INFO_KEYS) {
    delete cleaned[key];
  }

  // Student Forum was removed from the admin form — drop any leftover data.
  delete cleaned.student_forum;

  // The admin form writes `curriculum.brochure_link` (flat string). A nested
  // `curriculum.brochure` object is a leftover from the old write-time
  // normalization bug — drop it so it can't shadow the real brochure_link.
  if (Object.keys(asRecord(cleaned.curriculum)).length > 0) {
    const curriculum = { ...asRecord(cleaned.curriculum) };
    delete curriculum.brochure;
    cleaned.curriculum = curriculum;
  }

  // `details` was replaced by a dedicated numeric `credits` field, and
  // `color` is no longer part of the admin form — drop stale leftovers.
  if (Array.isArray(cleaned.course_structure)) {
    cleaned.course_structure = (
      cleaned.course_structure as Record<string, unknown>[]
    ).map((cs) => {
      const rest = { ...asRecord(cs) };
      delete rest.details;
      delete rest.color;
      return rest;
    });
  }

  // `cta_label` was dropped from the Bonus Certification form — drop the
  // stale leftover from older saves.
  if (Object.keys(asRecord(cleaned.bonus_certification)).length > 0) {
    const rest = { ...asRecord(cleaned.bonus_certification) };
    delete rest.cta_label;
    cleaned.bonus_certification = rest;
  }

  // `tag_color` is no longer part of Featured Alumni career progression —
  // drop the stale leftover from older saves.
  const featuredAlumni = asRecord(cleaned.featuredAlumni);
  if (Array.isArray(featuredAlumni.items)) {
    cleaned.featuredAlumni = {
      ...featuredAlumni,
      items: (featuredAlumni.items as Record<string, unknown>[]).map((item) => {
        const rec = { ...asRecord(item) };
        if (Array.isArray(rec.career_progression)) {
          rec.career_progression = (
            rec.career_progression as Record<string, unknown>[]
          ).map((step) => {
            const rest = { ...asRecord(step) };
            delete rest.tag_color;
            return rest;
          });
        }
        return rec;
      }),
    };
  }

  return cleaned;
}

// Generic, shape-agnostic cleanup applied to EVERY setup tab's data before
// it's stored: recursively drops blank array entries (empty strings, and
// objects/arrays whose leaf values are all blank) at any depth. This is the
// "basic, everywhere" validation layer — it doesn't know about any tab's
// specific field names, so it works for admission_policy seat rows,
// placements stats, fees structures, faculty entries, etc. without
// per-tab field lists. Booleans and numbers (including 0/false) are never
// considered blank.
function isEffectivelyBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(
      isEffectivelyBlank,
    );
  }
  return false;
}

function deepStripBlankEntries(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(deepStripBlankEntries)
      .filter((item) => !isEffectivelyBlank(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      result[key] = deepStripBlankEntries(v);
    }
    return result;
  }
  return value;
}

// Eligibility Criteria is keyed by indian_student.quotas[] / foreign_student.criteria[].
// Quota ids are auto-assigned from their label, then blank quotas/criteria
// rows are dropped the same way as every other setup tab.
function normalizeEligibilityCriteriaWriteData(data: unknown): unknown {
  const record = asRecord(data);
  const indianStudent = asRecord(record.indian_student);

  const cleaned: Record<string, unknown> = { ...record };
  if (Array.isArray(indianStudent.quotas)) {
    cleaned.indian_student = {
      ...indianStudent,
      quotas: assignMissingIds(
        indianStudent.quotas as Record<string, unknown>[],
        "quota",
        "label",
      ),
    };
  }

  return deepStripBlankEntries(cleaned);
}

// Throws if `requiredFields` on `rec` are partially filled — either all of
// them are blank (not started yet, fine) or all of them are filled
// (complete, fine). Anything in between is rejected so a half-filled
// row can never be saved. Decorative fields (logos/icons/avatars/booleans)
// are intentionally excluded from `requiredFields` by the caller.
function assertCompleteOrEmpty(
  rec: Record<string, unknown>,
  requiredFields: string[],
  context: string,
): void {
  const filled = requiredFields.filter(
    (field) => asText(rec[field]).trim().length > 0,
  );
  if (filled.length > 0 && filled.length < requiredFields.length) {
    const missing = requiredFields.filter((field) => !filled.includes(field));
    throw new ValidationError(
      `${context}: ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
    );
  }
}

function validatePlacementsTabData(data: unknown): void {
  const record = asRecord(data);

  asArray(record.summary_stats).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["label", "value"],
      `Summary Stat #${idx + 1}`,
    );
  });

  const notableOffers = asRecord(record.notable_offers);
  asArray(notableOffers.items).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["company_name", "role", "package"],
      `Notable Offer #${idx + 1}`,
    );
  });

  const placementTrends = asRecord(record.placement_trends);
  asArray(placementTrends.data_points).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["year", "avg_package"],
      `Placement Trend #${idx + 1}`,
    );
  });
  assertCompleteOrEmpty(
    asRecord(placementTrends.footer),
    ["label", "value"],
    "Placement Trends Footer",
  );

  const allCompanyStatistics = asRecord(record.all_company_statistics);
  asArray(allCompanyStatistics.rows).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["company_name", "avg_package", "max_package", "students_placed"],
      `Company Statistic #${idx + 1}`,
    );
  });

  const industrySalaryReport = asRecord(record.industry_salary_report);
  asArray(industrySalaryReport.rows).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["industry", "avg_package", "max_package"],
      `Industry Salary Report #${idx + 1}`,
    );
  });

  const studentSuccess = asRecord(record.student_success);
  asArray(studentSuccess.items).forEach((item, idx) => {
    assertCompleteOrEmpty(
      asRecord(item),
      ["student_name", "placed_at", "quote"],
      `Student Success Story #${idx + 1}`,
    );
  });

  assertCompleteOrEmpty(
    asRecord(record.download_report),
    ["url", "label"],
    "Download Report",
  );
}

function validateFeesTabData(data: unknown): void {
  const record = asRecord(data);

  asArray(record.fee_details).forEach((item, idx) => {
    const detail = asRecord(item);
    const context = `Fee Detail #${idx + 1}`;

    assertCompleteOrEmpty(detail, ["quota", "gender"], context);
    if (
      asText(detail.gender) &&
      !(FEE_DETAIL_GENDERS as readonly string[]).includes(asText(detail.gender))
    ) {
      throw new ValidationError(
        `${context}: gender must be one of ${FEE_DETAIL_GENDERS.join(", ")}`,
      );
    }
    assertCompleteOrEmpty(
      asRecord(detail.fees_summary),
      ["full_course_fee", "booking_amount"],
      `${context} Fees Summary`,
    );

    asArray(detail.tuition_fees).forEach((row, rIdx) => {
      assertCompleteOrEmpty(
        asRecord(row),
        ["year", "amount"],
        `${context} Tuition Fee #${rIdx + 1}`,
      );
    });

    asArray(detail.additional_fees).forEach((row, rIdx) => {
      assertCompleteOrEmpty(
        asRecord(row),
        ["label", "amount"],
        `${context} Additional Fee #${rIdx + 1}`,
      );
    });

    asArray(detail.one_time_payable_fees).forEach((row, rIdx) => {
      assertCompleteOrEmpty(
        asRecord(row),
        ["label", "amount"],
        `${context} One-Time Payable Fee #${rIdx + 1}`,
      );
    });

    asArray(detail.deadlines_and_installments).forEach((row, rIdx) => {
      assertCompleteOrEmpty(
        asRecord(row),
        ["due", "label", "amount"],
        `${context} Installment #${rIdx + 1}`,
      );
    });
  });
}

function normalizeSetupTabData(tabName: string, data: unknown): unknown {
  const record = asRecord(data);

  if (tabName === "course_info") {
    // Store the admin-edited shape as-is (lightly cleaned) — the public-facing
    // display shape is derived on demand by normalizeCourseInfoData() when
    // reading via getPublicCourseDetail. Running that transform here would
    // overwrite the editable form data with read-only display objects,
    // breaking edits on the next load.
    return deepStripBlankEntries(cleanCourseInfoWriteData(data));
  }

  if (tabName === "alliance" && Array.isArray(record.alliances)) {
    // Strip blanks first, then assign IDs — otherwise a freshly-assigned
    // `id` field would make an otherwise-blank alliance look non-blank.
    const cleaned = deepStripBlankEntries(record) as Record<string, unknown>;
    return {
      ...cleaned,
      alliances: assignMissingIds(
        (cleaned.alliances as Record<string, unknown>[]) || [],
        "alliance",
      ),
    };
  }

  if (tabName === "clubs_associations" && Array.isArray(record.clubs)) {
    const cleaned = deepStripBlankEntries(record) as Record<string, unknown>;
    return {
      ...cleaned,
      clubs: assignMissingIds(
        (cleaned.clubs as Record<string, unknown>[]) || [],
        "club",
      ),
    };
  }

  if (tabName === "placements") {
    // The "Icon" field was dropped from both the Download Report and
    // Summary Stats forms — drop stale leftovers from older saves.
    const downloadReport = { ...asRecord(record.download_report) };
    delete downloadReport.icon;
    const summaryStats = Array.isArray(record.summary_stats)
      ? (record.summary_stats as Record<string, unknown>[]).map((stat) => {
          const rest = { ...asRecord(stat) };
          delete rest.icon;
          return rest;
        })
      : record.summary_stats;
    return deepStripBlankEntries({
      ...record,
      download_report: downloadReport,
      summary_stats: summaryStats,
    });
  }

  if (tabName === "fees") {
    // The "PDF Size" field was dropped from the Fee Structure PDF form —
    // drop the stale leftover from older saves.
    const feeStructurePdf = { ...asRecord(record.fee_structure_pdf) };
    delete feeStructurePdf.size;
    return deepStripBlankEntries({
      ...record,
      fee_structure_pdf: feeStructurePdf,
    });
  }

  return deepStripBlankEntries(data);
}

function toClubPreview(club: Record<string, unknown>): Record<string, unknown> {
  return {
    id: club.id,
    name: club.name,
    category: club.category,
    cover_image: club.cover_image,
    logo: club.logo,
    about: club.about,
  };
}

function transformPublicAllianceTab(raw: Record<string, unknown>): {
  data: Record<string, unknown>[];
} {
  const alliances = Array.isArray(raw.alliances)
    ? (raw.alliances as Record<string, unknown>[])
    : [];

  const categoryColorMap: Record<string, string> = {
    "industrial collaboration": "blue",
    "academic & research": "green",
    "own hospital": "red",
    government: "orange",
  };

  const transformedAlliances = alliances.map((alliance) => {
    const details = asRecord(alliance.details);
    const activitiesRaw = asRecord(
      alliance.alliance_activities || details.alliance_activities,
    );
    const activities = Array.isArray(activitiesRaw.activities)
      ? (activitiesRaw.activities as Record<string, unknown>[])
      : [];
    const legalDocs = Array.isArray(details.legal_documents)
      ? (details.legal_documents as Record<string, unknown>[])
      : [];

    const category = asText(details.category) || asText(alliance.tag);
    const categoryLower = category.toLowerCase();
    const categoryColor = categoryColorMap[categoryLower] ?? "blue";

    return {
      id: asText(alliance.id),
      name: asText(details.full_name) || asText(alliance.name),
      category: category.toUpperCase(),
      category_color: categoryColor,
      cover_image: asText(alliance.cover_image || details.cover_image),
      logo: asText(alliance.logo || details.logo),
      about: {
        description: asText(details.about),
      },
      collaboration_impact: {
        description: asText(details.collaboration_impact),
      },
      key_focus_areas: {
        items: Array.isArray(details.key_focus_areas)
          ? (details.key_focus_areas as string[])
          : [],
      },
      legal_and_documentation: {
        items: legalDocs.map((doc) => ({
          title: asText(doc.title),
          download_icon:
            "https://cdn.iconsdb.example.com/icons/download-gray.png",
          url: asText(doc.url),
        })),
      },
      alliance_activities: {
        view_all_cta: {
          label: "View Happenings",
          link: asText(activitiesRaw.happenings_link),
        },
        items: activities.map((activity, index) => ({
          id: asText(activity.id) || `activity_${index + 1}`,
          title: asText(activity.title),
          thumbnail: asText(activity.image || activity.thumbnail),
          link: asText(activity.link),
        })),
      },
    };
  });

  return {
    data: transformedAlliances,
  };
}

function transformPublicDemoGraphicsTab(raw: Record<string, unknown>) {
  const ageDistRaw = asRecord(raw.age_distribution);
  const ageDistData = Array.isArray(ageDistRaw.data)
    ? (ageDistRaw.data as Record<string, unknown>[])
    : [];

  const genderDiversity = Array.isArray(raw.gender_diversity)
    ? (raw.gender_diversity as Record<string, unknown>[])
    : [];

  const workExp = Array.isArray(raw.work_experience)
    ? (raw.work_experience as Record<string, unknown>[])
    : [];

  const intlPresence = Array.isArray(raw.international_presence)
    ? (raw.international_presence as Record<string, unknown>[])
    : [];

  const natlPresence = Array.isArray(raw.national_presence)
    ? (raw.national_presence as Record<string, unknown>[])
    : [];

  return {
    tab: "demo_graphics",
    age_distribution: {
      items: ageDistData.map((item) => ({
        label:
          asText(item.label) || asText(item.range) || asText(item.age_range),
        percent: asNumber(item.percent),
      })),
    },
    gender_diversity: {
      segments: genderDiversity.map((item) => ({
        label: asText(item.label),
        percent: asNumber(item.percent),
      })),
    },
    work_experience: {
      items: workExp.map((item) => ({
        icon:
          asText(item.icon) ||
          "https://cdn.iconsdb.example.com/icons/briefcase-orange.png",
        label: asText(item.label),
        subtitle: asText(item.description) || asText(item.subtitle),
        percent: asNumber(item.percent),
      })),
    },
    international_presence: {
      items: intlPresence.map((item) => ({
        flag:
          asText(item.flag) ||
          "https://cdn.flagicons.example.com/flags/default.png",
        country: asText(item.country),
        percent: asNumber(item.percent),
      })),
    },
    national_presence: {
      items: natlPresence.map((item) => ({
        state: asText(item.state),
        percent: asNumber(item.percent),
      })),
    },
  };
}

type OtherCollegeCourse = {
  id: string;
  name: string;
  duration: string | null;
  metadata: unknown;
  studyLevel: { id: string; name: string; slug: string };
};

function extractCourseFee(metadata: unknown): string {
  const tabData = asRecord(asRecord(metadata).tabData);
  const fees = asRecord(tabData.fees);
  const feeDetails = Array.isArray(fees.fee_details)
    ? (fees.fee_details as Record<string, unknown>[])
    : [];
  const summary = asRecord(feeDetails[0]?.fees_summary);
  return asText(summary.full_course_fee);
}

function buildOtherCoursesOfferedTree(courses: OtherCollegeCourse[]) {
  const studyLevelMap = new Map<
    string,
    {
      studyLevel: { id: string; name: string; slug: string };
      courses: {
        id: string;
        name: string;
        duration: string | null;
        fee: string;
      }[];
    }
  >();

  for (const course of courses) {
    let level = studyLevelMap.get(course.studyLevel.id);
    if (!level) {
      level = { studyLevel: course.studyLevel, courses: [] };
      studyLevelMap.set(course.studyLevel.id, level);
    }

    level.courses.push({
      id: course.id,
      name: course.name,
      duration: course.duration,
      fee: extractCourseFee(course.metadata),
    });
  }

  return Array.from(studyLevelMap.values());
}

export class CourseTabsService {
  // ── College-Admin Endpoints ──────────────────────────────────────────────

  /**
   * Get all tab data for a course (admin view — includes empty tabs).
   */
  static async getCourseTabsForAdmin(courseId: string, collegeId: string) {
    const course = await CourseTabsRepository.findCourseMetadata(
      courseId,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found");
    const tabs = getCourseSetupTabsFromMetadata(course.metadata);
    const record = asRecord(course.metadata);
    const tabData = asRecord(record.tabData);

    return {
      courseId: course.id,
      courseName: course.name,
      tabs,
      tabData,
    };
  }

  /**
   * Get a single tab's data (admin).
   */
  static async getCourseTab(
    courseId: string,
    collegeId: string,
    tabName: string,
  ) {
    if (isSetupTabName(tabName)) {
      const course = await CourseTabsRepository.findCourseMetadata(
        courseId,
        collegeId,
      );
      if (!course) throw new NotFoundError("Course not found");

      return {
        sectionName: tabName,
        sectionId: tabName,
        sectionKey: tabName,
        data: getSetupTabDataFromMetadata(course.metadata, tabName),
      };
    }

    const prismaField = mapTabNameToField(tabName);

    const course = await CourseTabsRepository.findCourseTabField(
      courseId,
      collegeId,
      prismaField,
    );
    if (!course) throw new NotFoundError("Course not found");

    return {
      sectionName: tabName,
      sectionId: tabName,
      sectionKey: tabName,
      data:
        (course as Record<string, unknown>)[prismaField] ??
        getDefaultForTab(tabName),
    };
  }

  /**
   * Update a single tab's data (admin).
   */
  static async updateCourseTab(
    courseId: string,
    collegeId: string,
    tabName: string,
    data: unknown,
  ) {
    if (isSetupTabName(tabName)) {
      if (tabName === "placements") {
        validatePlacementsTabData(data);
      }
      if (tabName === "fees") {
        validateFeesTabData(data);
      }

      const updated = await CourseTabsRepository.updateCourseSetupTabData(
        courseId,
        collegeId,
        tabName,
        normalizeSetupTabData(tabName, data),
      );
      if (!updated) throw new NotFoundError("Course not found");

      return {
        tabName,
        data: getSetupTabDataFromMetadata(updated.metadata, tabName),
      };
    }

    const prismaField = mapTabNameToField(tabName);
    const normalizedData =
      tabName === "eligibility_criteria"
        ? normalizeEligibilityCriteriaWriteData(data)
        : data;

    const updated = await CourseTabsRepository.updateCourseTab(
      courseId,
      collegeId,
      prismaField,
      normalizedData,
    );
    if (!updated) throw new NotFoundError("Course not found");

    return {
      tabName,
      data: (updated as Record<string, unknown>)[prismaField],
    };
  }

  // ── Public Endpoints ─────────────────────────────────────────────────────

  /**
   * Get course detail page with available tabs list (public).
   * Only lists tabs that have non-empty data.
   */
  static async getPublicCourseDetail(courseId: string, collegeSlug: string) {
    const course = await CourseTabsRepository.findPublicCourseByIdAndSlug(
      courseId,
      collegeSlug,
    );
    if (!course) throw new NotFoundError("Course not found");

    const tabs = getCourseSetupTabsFromMetadata(course.metadata);
    const courseInfoRaw = asRecord(
      getSetupTabDataFromMetadata(course.metadata, "course_info"),
    );

    // Merge individual tab columns as fallbacks when metadata course_info is sparse
    const col = course as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...courseInfoRaw };

    const columnFields = [
      "highlights",
      "accreditations",
      "keyDates",
      "curriculum",
      "courseStructure",
      "valueAddedCourses",
      "careerOpportunities",
      "higherEducationCertifications",
      "flexibleExitOptions",
      "classTimings",
      "industryTools",
      "labFacilities",
      "roomFacilities",
      "featuredAlumni",
      "faqs",
    ] as const;

    for (const field of columnFields) {
      if (isEmptyValue(merged[field]) && !isEmptyValue(col[field])) {
        merged[field] = col[field];
      }
    }

    // Use course-level duration/studyMode as fallbacks for quick_info overview
    if (isEmptyValue(merged.overview)) {
      merged.overview = {
        duration: course.duration ?? "",
        study_mode: (course as Record<string, unknown>).studyMode ?? "",
      };
    }

    const courseInfo = normalizeCourseInfoData(merged);

    return {
      id: course.id,
      name: course.name,
      admission_batches: courseInfo.admission_batches ?? [],
      quick_info: courseInfo.quick_info ?? [],
      tabs:
        Array.isArray(courseInfo.tabs) &&
        (courseInfo.tabs as unknown[]).length > 0
          ? courseInfo.tabs
          : tabs,
      highlights: courseInfo.highlights ?? {},
      accreditations: courseInfo.accreditations ?? {},
      keyDates: courseInfo.keyDates ?? {},
      curriculum: courseInfo.curriculum ?? {},
      courseStructure: courseInfo.courseStructure ?? {},
      valueAddedCourses: courseInfo.valueAddedCourses ?? {},
      careerOpportunities: courseInfo.careerOpportunities ?? {},
      higherEducationCertifications:
        courseInfo.higherEducationCertifications ?? {},
      flexibleExitOptions: courseInfo.flexibleExitOptions ?? {},
      classTimings: courseInfo.classTimings ?? {},
      industryTools: courseInfo.industryTools ?? {},
      labFacilities: courseInfo.labFacilities ?? {},
      roomFacilities: courseInfo.roomFacilities ?? {},
      featuredAlumni: courseInfo.featuredAlumni ?? {},
      faqs: courseInfo.faqs ?? {},
      studentForum: asRecord(courseInfo.studentForum),
      certifications: asRecord(courseInfo.certifications),
    };
  }

  /**
   * Get eligibility criteria for a course, resolved by student type and
   * (for Indian students) quota (public). Indian students pick a quota and
   * see that quota's criteria; foreign students have no quota concept and
   * share one criteria list.
   */
  static async getPublicEligibilityCriteria(
    courseId: string,
    collegeSlug: string,
    query: { student_type?: "indian" | "foreign"; quota_category?: string },
  ) {
    const course = await CourseTabsRepository.findPublicCourseTabField(
      courseId,
      collegeSlug,
      "eligibilityCriteria",
    );
    if (!course) throw new NotFoundError("Course not found");

    const stored = asRecord(
      (course as Record<string, unknown>).eligibilityCriteria,
    );
    const indianStudent = asRecord(stored.indian_student);
    const foreignStudent = asRecord(stored.foreign_student);

    const trim = (value: unknown) => asText(value).trim();
    // Heading/description are single-line fields — collapse any stray
    // newlines (e.g. from older data entered before this was an Input
    // instead of a Textarea) into spaces instead of leaking literal "\n".
    const trimLine = (value: unknown) =>
      asText(value)
        .replace(/\s*[\r\n]+\s*/g, " ")
        .trim();
    const trimCriteria = (
      value: unknown,
    ): Array<{
      heading: string;
      description: string;
    }> =>
      asArray(value).map((item) => {
        const rec = asRecord(item);
        return {
          heading: trimLine(rec.heading),
          description: trimLine(rec.description),
        };
      });

    const quotas = (
      Array.isArray(indianStudent.quotas) ? indianStudent.quotas : []
    ).map((q) => {
      const rec = asRecord(q);
      return { id: trim(rec.id), label: trim(rec.label) };
    });

    // Criteria is only resolved once a real selection is made: an explicit
    // student_type, and — for "indian" — a quota_category that matches a
    // real quota. No filter selected (or an indian selection with no/invalid
    // quota) returns an empty criteria list, not a silently-defaulted one.
    let criteria: Array<{ heading: string; description: string }> = [];
    let resolvedStudentType: "indian" | "foreign" | null = null;
    let resolvedQuotaCategory: string | null = null;

    if (query.student_type === "foreign") {
      resolvedStudentType = "foreign";
      criteria = trimCriteria(foreignStudent.criteria);
    } else if (query.student_type === "indian") {
      resolvedStudentType = "indian";
      const quotaList = Array.isArray(indianStudent.quotas)
        ? (indianStudent.quotas as Record<string, unknown>[])
        : [];
      const selectedQuota = query.quota_category
        ? quotaList.find((q) => trim(q.id) === query.quota_category)
        : undefined;
      if (selectedQuota) {
        resolvedQuotaCategory = trim(selectedQuota.id);
        criteria = trimCriteria(selectedQuota.criteria);
      }
    }

    return {
      student_types: [
        { value: "indian", label: "Indian Student" },
        { value: "foreign", label: "Foreign Student" },
      ],
      quotas,
      criteria,
      filters_applied: {
        student_type: resolvedStudentType,
        quota_category: resolvedQuotaCategory,
      },
    };
  }

  /**
   * Get a single tab's data (public).
   */
  static async getPublicCourseTab(
    courseId: string,
    collegeSlug: string,
    tabName: string,
  ) {
    if (isSetupTabName(tabName)) {
      const course =
        await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
          courseId,
          collegeSlug,
        );
      if (!course) throw new NotFoundError("Course not found");

      const rawData = getSetupTabDataFromMetadata(course.metadata, tabName);

      if (tabName === "fees") {
        return transformPublicFeeTab(asRecord(rawData));
      }

      if (tabName === "student_housing") {
        const raw = asRecord(rawData);
        const hostelIds = Array.isArray(raw.hostelIds)
          ? (raw.hostelIds as unknown[]).filter(
              (id): id is string => typeof id === "string",
            )
          : [];
        const hostels = await HostelService.getPublicHostelsByIds(
          course.collegeId,
          hostelIds,
        );
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformPublicStudentHousingTab(raw, hostels),
        };
      }

      if (tabName === "financial_aid") {
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformPublicFinancialAidTab(asRecord(rawData)),
        };
      }

      if (tabName === "exam_policy") {
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformPublicExamPolicyTab(asRecord(rawData)),
        };
      }

      if (tabName === "library") {
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformPublicLibraryTab(asRecord(rawData)),
        };
      }

      if (tabName === "faculty") {
        return transformPublicFacultyTab(rawData);
      }

      if (tabName === "clubs_associations") {
        const transformed = transformPublicClubsAssociationsTab(
          asRecord(rawData),
        );
        const preview = transformed.data.slice(0, 10).map(toClubPreview);
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: preview,
        };
      }

      if (tabName === "alliance") {
        const transformed = transformPublicAllianceTab(asRecord(rawData));
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformed.data,
        };
      }

      if (tabName === "other_courses_offered") {
        const otherCourses = await CourseTabsRepository.findOtherCollegeCourses(
          course.collegeId,
          courseId,
        );
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          list: buildOtherCoursesOfferedTree(otherCourses),
        };
      }

      if (tabName === "demo_graphics") {
        const transformed = transformPublicDemoGraphicsTab(asRecord(rawData));
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformed,
        };
      }

      if (tabName === "review") {
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformPublicReviewTab(asRecord(rawData)),
        };
      }

      return {
        sectionName: tabName,
        sectionId: tabName,
        sectionKey: tabName,
        data: rawData,
      };
    }

    const prismaField = mapTabNameToField(tabName);

    const course = await CourseTabsRepository.findPublicCourseTabField(
      courseId,
      collegeSlug,
      prismaField,
    );
    if (!course) throw new NotFoundError("Course not found");

    return {
      sectionName: tabName,
      sectionId: tabName,
      sectionKey: tabName,
      data:
        (course as Record<string, unknown>)[prismaField] ??
        getDefaultForTab(tabName),
    };
  }

  /**
   * Paginated list of reviews for a course (public).
   * GET /public/colleges/by-slug/:slug/courses/:courseId/reviews
   */
  static async listPublicCourseReviews(
    courseId: string,
    collegeSlug: string,
    page: number,
    perPage: number,
  ) {
    const course =
      await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
        courseId,
        collegeSlug,
      );
    if (!course) throw new NotFoundError("Course not found");

    const rawData = getSetupTabDataFromMetadata(course.metadata, "review");
    const raw = asRecord(rawData);
    const allReviews = Array.isArray(raw.reviews)
      ? (raw.reviews as Record<string, unknown>[])
      : [];

    const overallRaw = asRecord(raw.overallRating);
    const totalItems = allReviews.length;
    const averageRating =
      asNumber(overallRaw.rating) || asNumber(raw.average_rating);

    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageSlice = allReviews.slice(start, end);

    const reviews = pageSlice.map((r, idx) => ({
      id: asText(r.id) || `review_${String(start + idx + 1).padStart(3, "0")}`,
      reviewer_name: asText(r.reviewer_name) || asText(r.name) || "Anonymous",
      reviewer_avatar:
        asText(r.avatar) ||
        asText(r.reviewer_avatar) ||
        "https://cdn.iconsdb.example.com/icons/avatar-placeholder-orange.png",
      date: asText(r.date),
      rating: r.rating != null ? Number(r.rating) : averageRating || 4.5,
      comment: asText(r.comment),
    }));

    return {
      reviews,
      pagination: {
        current_page: page,
        per_page: perPage,
        total_items: totalItems,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    };
  }

  /**
   * Paginated + searchable list of "other courses offered" by the same
   * college, grouped by study level.
   * GET /public/colleges/by-slug/:slug/courses/:courseId/other-courses-offered
   */
  static async listPublicOtherCoursesOffered(
    courseId: string,
    collegeSlug: string,
    page: number,
    perPage: number,
    search: string | undefined,
  ) {
    const course =
      await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
        courseId,
        collegeSlug,
      );
    if (!course) throw new NotFoundError("Course not found");

    const { data, total } =
      await CourseTabsRepository.findOtherCollegeCoursesPaginated(
        course.collegeId,
        courseId,
        search,
        (page - 1) * perPage,
        perPage,
      );

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return {
      list: buildOtherCoursesOfferedTree(data as OtherCollegeCourse[]),
      pagination: {
        current_page: page,
        per_page: perPage,
        total_items: total,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    };
  }

  /**
   * Paginated + searchable list of clubs & associations for a course.
   * GET /public/colleges/by-slug/:slug/courses/:courseId/clubs-associations
   */
  static async listPublicClubsAssociations(
    courseId: string,
    collegeSlug: string,
    page: number,
    perPage: number,
    search: string | undefined,
  ) {
    const course =
      await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
        courseId,
        collegeSlug,
      );
    if (!course) throw new NotFoundError("Course not found");

    const rawData = getSetupTabDataFromMetadata(
      course.metadata,
      "clubs_associations",
    );
    const allClubs = transformPublicClubsAssociationsTab(
      asRecord(rawData),
    ).data;

    const searchTerm = search?.trim().toLowerCase();
    const filtered = searchTerm
      ? allClubs.filter((club) =>
          asText(club.name).toLowerCase().includes(searchTerm),
        )
      : allClubs;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;

    return {
      list: filtered.slice(start, start + perPage).map(toClubPreview),
      pagination: {
        current_page: page,
        per_page: perPage,
        total_items: total,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    };
  }

  /**
   * Single club's full detail view.
   * GET /public/colleges/by-slug/:slug/courses/:courseId/clubs-associations/:clubId
   */
  static async getPublicClubDetail(
    courseId: string,
    collegeSlug: string,
    clubId: string,
  ) {
    const course =
      await CourseTabsRepository.findPublicCourseMetadataByIdAndSlug(
        courseId,
        collegeSlug,
      );
    if (!course) throw new NotFoundError("Course not found");

    const rawData = getSetupTabDataFromMetadata(
      course.metadata,
      "clubs_associations",
    );
    const allClubs = transformPublicClubsAssociationsTab(
      asRecord(rawData),
    ).data;

    const club = allClubs.find((c) => c.id === clubId);
    if (!club) throw new NotFoundError("Club not found");

    return club;
  }
}
