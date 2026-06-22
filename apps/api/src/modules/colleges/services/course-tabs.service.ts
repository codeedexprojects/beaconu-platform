import { NotFoundError } from "@/shared/errors";
import { CourseTabsRepository } from "../repositories/course-tabs.repository";
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
  const summaryRaw = asRecord(meritRaw.final_summary);
  const tcRaw = meritRaw.terms_and_conditions;

  const merit_scholarship = {
    title: asText(meritRaw.title) || "Merit Scholarship",
    calculator: {
      title: "Scholarship Calculator",
      icon: "https://cdn.iconsdb.example.com/icons/calculator-orange.png",
      port_of_entry: {
        icon: "https://cdn.iconsdb.example.com/icons/login-arrow-gray.png",
        label: "Select Port of Entry",
        selected: "",
        options: Array.isArray(calcRaw.port_of_entry_options)
          ? calcRaw.port_of_entry_options
          : [],
      },
      rank_range: {
        icon: "https://cdn.iconsdb.example.com/icons/bar-chart-gray.png",
        label: "Select Rank Range",
        selected: "",
        options: Array.isArray(calcRaw.rank_range_options)
          ? calcRaw.rank_range_options
          : [],
      },
    },
    terms_and_conditions: {
      title: "TERMS & CONDITIONS",
      icon: "https://cdn.iconsdb.example.com/icons/check-circle-green.png",
      items: Array.isArray(tcRaw) ? tcRaw : [],
    },
    final_summary: {
      title: "FINAL SUMMARY",
      max_scholarship: {
        icon: "https://cdn.iconsdb.example.com/icons/star-purple.png",
        label: "MAX SCHOLARSHIP",
        amount: normalizeAmount(summaryRaw.max_scholarship),
      },
      net_payable_fees: {
        icon: "https://cdn.iconsdb.example.com/icons/document-teal.png",
        label: "NET PAYABLE FEES",
        amount: normalizeAmount(summaryRaw.net_payable_fees),
      },
    },
  };

  const concessionsRaw = asRecord(raw.financial_concessions);
  const rawItems = Array.isArray(concessionsRaw.items)
    ? (concessionsRaw.items as Record<string, unknown>[])
    : [];

  const concessionItems = rawItems.map((item) => {
    const details = asRecord(item.details);
    const criteria = Array.isArray(details.eligibility_criteria)
      ? (details.eligibility_criteria as string[])
      : [];
    const scholarshipAmt = normalizeAmount(details.scholarship_amount);
    const netPayableAmt = normalizeAmount(details.net_payable);
    const hasDetails =
      criteria.length > 0 || scholarshipAmt !== "₹" || netPayableAmt !== "₹";
    const discountPct = asNumber(item.discount_percent);
    const expanded = hasDetails;

    return {
      name: asText(item.name),
      discount_percent: discountPct,
      discount_label: `${discountPct}% OFF`,
      accent_color: hasDetails ? "black" : "orange",
      expanded,
      details_cta: expanded
        ? {
            label: "SHOW LESS",
            icon: "https://cdn.iconsdb.example.com/icons/chevron-up-gray.png",
          }
        : {
            label: "DETAILS",
            icon: "https://cdn.iconsdb.example.com/icons/arrow-right-orange.png",
          },
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
      total_types_label: `${totalTypes} TYPES`,
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

function getDefaultForTab(tabSlug: string): unknown {
  // Object-type tabs
  const objectTabs = [
    "course_structure",
    "higher_education_certifications",
    "class_timings",
    "exam_policy",
    "eligibility_criteria",
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
      const updated = await CourseTabsRepository.updateCourseSetupTabData(
        courseId,
        collegeId,
        tabName,
        data,
      );
      if (!updated) throw new NotFoundError("Course not found");

      return {
        tabName,
        data: getSetupTabDataFromMetadata(updated.metadata, tabName),
      };
    }

    const prismaField = mapTabNameToField(tabName);

    const updated = await CourseTabsRepository.updateCourseTab(
      courseId,
      collegeId,
      prismaField,
      data,
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
    const courseInfo = asRecord(
      getSetupTabDataFromMetadata(course.metadata, "course_info"),
    );
    const admissionBatches = getAdmissionBatches(courseInfo);
    const quickInfo = getQuickInfo(courseInfo);

    const studentForum =
      asRecord(courseInfo.student_forum).enabled !== undefined ||
      Object.keys(asRecord(courseInfo.student_forum)).length > 0
        ? asRecord(courseInfo.student_forum)
        : asRecord(courseInfo.studentForum);

    const bonusCertification = asRecord(courseInfo.bonus_certification);
    const certifications =
      Object.keys(bonusCertification).length > 0
        ? {
            title: "Certifications",
            items: [
              {
                tag: asText(bonusCertification.tag),
                title:
                  asText(bonusCertification.title) ||
                  asText(bonusCertification.name),
                description:
                  asText(bonusCertification.description) ||
                  asText(bonusCertification.note),
                cta_label:
                  asText(bonusCertification.cta_label) ||
                  asText(bonusCertification.ctaLabel),
                link:
                  asText(bonusCertification.link) ||
                  asText(bonusCertification.certificate_link),
              },
            ],
          }
        : {};

    return {
      id: course.id,
      name: course.name,
      admission_batches: admissionBatches,
      quick_info: quickInfo,
      tabs,
      highlights: course.highlights ?? {},
      accreditations: course.accreditations ?? {},
      keyDates: course.keyDates ?? {},
      curriculum: course.curriculum ?? {},
      courseStructure: course.courseStructure ?? {},
      valueAddedCourses: course.valueAddedCourses ?? {},
      careerOpportunities: course.careerOpportunities ?? {},
      higherEducationCertifications: course.higherEducationCertifications ?? {},
      flexibleExitOptions: course.flexibleExitOptions ?? {},
      classTimings: course.classTimings ?? {},
      industryTools: course.industryTools ?? {},
      labFacilities: course.labFacilities ?? {},
      roomFacilities: course.roomFacilities ?? {},
      featuredAlumni: course.featuredAlumni ?? {},
      faqs: course.faqs ?? {},
      studentForum,
      certifications,
    };
  }

  /**
   * Get eligibility criteria for a course with filter state echoed back
   * (public). The stored JSON is display-ready (options, criteria, CTAs);
   * this just resolves `filters_applied` from the query string, falling
   * back to each filter's first option when not provided.
   */
  static async getPublicEligibilityCriteria(
    courseId: string,
    collegeSlug: string,
    query: { student_type?: string; quota_category?: string },
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

    const studentTypeOptions = Array.isArray(
      asRecord(stored.student_type_filter).options,
    )
      ? (asRecord(stored.student_type_filter).options as unknown[])
      : [];
    const quotaOptions = Array.isArray(asRecord(stored.quota_filter).options)
      ? (asRecord(stored.quota_filter).options as unknown[])
      : [];

    const defaultStudentType =
      studentTypeOptions.length > 0
        ? asText(asRecord(studentTypeOptions[0]).value)
        : "";
    const defaultQuotaCategory =
      quotaOptions.length > 0 ? asText(asRecord(quotaOptions[0]).value) : "";

    return {
      ...stored,
      filters_applied: {
        student_type: query.student_type || defaultStudentType,
        quota_category: query.quota_category || defaultQuotaCategory,
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
        return {
          sectionName: tabName,
          sectionId: tabName,
          sectionKey: tabName,
          data: transformed.data,
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
}
