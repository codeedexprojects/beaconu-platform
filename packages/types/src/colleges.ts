export interface CourseMinimalItem {
  id: string;
  name: string;
  code: string;
}

export interface CampusAmbassador {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
}

export interface CampusAmbassadorDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  ambassadorType: string | null;
  campusCode: string | null;
  status: string;
  createdAt: string;
  course: string | null;
  district: string | null;
  state: string | null;
}

export interface CreateCampusAmbassadorInput {
  full_name: string;
  email: string;
  phone_number?: string;
  college_id: string;
  linked_student_id?: string;
  ambassador_type: "student" | "teacher";
  avatar_url?: string | null;
  course?: string;
  district?: string;
  state?: string;
  password: string;
  confirm_password: string;
}

export interface UpdateCampusAmbassadorInput {
  full_name?: string;
  phone_number?: string;
  ambassador_type?: "student" | "teacher";
  avatar_url?: string | null;
  course?: string;
  district?: string;
  state?: string;
  status?: "active" | "inactive";
  password?: string;
  confirm_password?: string;
}

export interface AmbassadorVisitStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  reassigned: number;
}

export interface CampusAmbassadorDetailDto extends CampusAmbassadorDto {
  visitStats: AmbassadorVisitStats;
}

export interface CollegeProfileDetails {
  totalCourses: number;
  instituteType: string | null;
  campusAmbassadors: CampusAmbassador[];
}

export interface CollegePermissionDto {
  code: string;
  description: string | null;
}

export interface CollegeRoleDto {
  id: string;
  name: string;
  slug: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: string[];
}

export interface CreateCollegeRoleInput {
  name: string;
  permissionCodes: string[];
}

export interface UpdateCollegeRoleInput {
  name?: string;
  isActive?: boolean;
  permissionCodes?: string[];
}

export interface PublicUniversitySummary {
  id: string;
  name: string;
  logoUrl: string | null;
  universityType: { id: string; name: string; slug: string } | null;
}

export interface PublicCampusSummary {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  isMainCampus: boolean;
}

export interface PublicAffiliateCollegeSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
}

export interface PublicCollegeTab {
  sl: number;
  id: string;
  name: string;
}

export interface PublicCollegeDetail {
  id: string;
  universityId: string | null;
  name: string;
  slug: string;
  code: string | null;
  domain: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  district: string | null;
  pinCode: string | null;
  establishedYear: number | null;
  collegeType: string | null;
  genderType: string | null;
  avgStudentCount: number | null;
  campusSizeAcres: string | null;
  outsideStatePct: string | null;
  avgRating: string | null;
  reviewCount: number | null;
  view360Url: string | null;
  placementData: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
  university: PublicUniversitySummary | null;
  campuses: PublicCampusSummary[];
  institutionGroupMember: {
    group: {
      members: { college: PublicAffiliateCollegeSummary }[];
    };
  } | null;
  institutionGroups: {
    members: { college: PublicAffiliateCollegeSummary }[];
  }[];
  isWishlisted: boolean;
}

export interface PublicCollegeListItem {
  id: string;
  universityId: string | null;
  name: string;
  slug: string;
  code: string | null;
  domain: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  state: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  pinCode: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  university: PublicUniversitySummary | null;
  campuses: PublicCampusSummary[];
  isWishlisted: boolean;
}

export interface PublicCollegeBySlugResponse {
  collegeDetails: PublicCollegeDetail;
  tabs: PublicCollegeTab[];
}

export interface PublicCollegeOverviewStat {
  label?: string;
  value?: string;
}

export interface PublicCollegeOverviewBadge {
  tag?: string;
  title?: string;
  image?: string;
}

export interface PublicCollegeOverviewAmenity {
  label?: string;
  icon?: string;
}

export interface PublicCollegeOverviewFacility {
  label?: string;
  subtitle?: string;
  icon?: string;
  image?: string;
}

export interface PublicCollegeOverviewLocation {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  map_link?: string;
}

export interface PublicCollegeOverviewNearbyAccessItem {
  name?: string;
  distance?: string;
}

export interface PublicCollegeOverviewNearbyAccessGroup {
  category?: string;
  items?: PublicCollegeOverviewNearbyAccessItem[];
}

export interface PublicCollegeOverviewAmbassador {
  name?: string;
  course?: string;
  district?: string;
  state?: string;
  image?: string;
  message_link?: string;
}

export interface PublicCollegeOverviewSocial {
  platform?: string;
  icon?: string;
  url?: string;
}

export interface PublicCollegeOverviewReel {
  title?: string;
  duration?: string;
  date?: string;
  video?: string;
  thumbnail?: string;
  type?: "youtube" | "mp4";
}

export interface PublicCollegeOverviewSection {
  id?: string;
  enabled?: boolean;
  name?: string;
  alt_name?: string;
  location_name?: string;
  type?: string;
  established?: number | null;
  navigation_tabs?: string[];
  about?: string;
  accolades?: PublicCollegeOverviewBadge[];
  university_details?: PublicCollegeOverviewStat[];
  amenities?: PublicCollegeOverviewAmenity[];
  inside_campus_facilities?: PublicCollegeOverviewFacility[];
  location?: PublicCollegeOverviewLocation;
  nearby_access?: PublicCollegeOverviewNearbyAccessGroup[];
  campus_ambassadors?: PublicCollegeOverviewAmbassador[];
  social?: PublicCollegeOverviewSocial[];
  campus_reels?: PublicCollegeOverviewReel[];
}

export interface PublicCollegeSectionResponse<TData = unknown> {
  sectionName: string;
  sectionId: string;
  sectionKey: string;
  data: TData;
}

export interface PublicCourseListItem {
  id: string;
  collegeId: string;
  campusId: string | null;
  name: string;
  code: string;
  duration: string | null;
  eligibility: string | null;
  intakeCapacity: number | null;
  studyMode: string;
  status: string;
  discipline: {
    id: string;
    name: string;
    stream: { id: string; name: string } | null;
  } | null;
  studyLevel: { id: string; name: string } | null;
  programType: { id: string; name: string } | null;
  metadata: { tabs: { id: string; name: string }[] } & Record<string, unknown>;
}

export interface PublicScholarship {
  id: string;
  name: string;
  scholarshipType: string;
  discountType: string;
  discountValue: string;
  discountDisplay: string | null;
  displayLabel: string | null;
  applicableYears: unknown;
  termsAndConditions: string | null;
}

export interface PublicGalleryItem {
  id: string;
  mediaType: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface PublicCollegeReview {
  id: string;
  rating: number;
  reviewText: string | null;
  reviewType: string;
  categoryRatings: Record<string, number>;
  createdAt: string;
}

export interface PublicInstitutionCourse {
  id: string;
  name: string;
  duration: string | null;
  mode: string;
  fee: string | null;
  currency: string;
}

export interface PublicInstitutionDepartment {
  id: string;
  name: string;
  programs_available: number;
  expanded: boolean;
  program_type_tabs: { selected: string; options: string[] };
  courses: PublicInstitutionCourse[];
}

export interface PublicInstitutionMember {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  country: string;
  role: string;
  selected: boolean;
  joinedAt: string;
  joinedVia: string;
  departments: PublicInstitutionDepartment[];
}

export interface PublicInstitutionsAcrossWorldSection {
  id: string;
  enabled: boolean;
  title: string;
  institutions: PublicInstitutionMember[];
  group: { id: string; name: string; groupCode: string; status: string } | null;
}

export interface PublicCommuteTiming {
  label?: string;
  time?: string;
}

export interface PublicCommuteFee {
  amount?: string;
  payment_structure?: string;
}

export interface PublicCommuteBusInfo {
  registration_number?: string;
  seats?: number | null;
  model?: string;
}

export interface PublicCommutePickupPoint {
  point?: string;
  landmark?: string;
  time?: string;
}

export interface PublicCommuteRoute {
  pickup_point?: string;
  route_name?: string;
  via?: string;
  status?: "VERIFIED" | "UNVERIFIED" | string;
  timings?: PublicCommuteTiming[];
  transport_fee?: PublicCommuteFee;
  bus_information?: PublicCommuteBusInfo;
  morning_pickup_points?: PublicCommutePickupPoint[];
  evening_dropoff_points?: PublicCommutePickupPoint[];
}

export interface PublicCommuteRule {
  title?: string;
  description?: string;
}

export interface PublicCommuteRulesSection {
  title?: string;
  subtitle?: string;
  intro?: string;
  rules?: PublicCommuteRule[];
}

export interface PublicCommuteSection {
  id?: string;
  tab?: string;
  title?: string;
  enabled?: boolean;
  pickup_points?: string[];
  selected_pickup_point?: string;
  routes?: PublicCommuteRoute[];
  rules_and_code_of_conduct?: PublicCommuteRulesSection;
  route_count?: number;
}

export interface PublicHappeningItem {
  category?: string;
  date?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface PublicHappeningsSection {
  id?: string;
  enabled?: boolean;
  title?: string;
  filters?: { categories?: string[] };
  happenings?: PublicHappeningItem[];
}

export interface PublicCodeOfConductRule {
  number?: number;
  rule?: string;
}

export interface PublicCodeOfConductSection {
  id?: string;
  enabled?: boolean;
  section_title?: string;
  rules?: PublicCodeOfConductRule[];
}

export interface PublicCourseAdmissionBatch {
  label?: string;
  status?: string;
  banner?: {
    enabled?: boolean;
    tag?: string;
    message?: string;
    progress_percentage?: number;
  };
}

export interface PublicCourseQuickInfoItem {
  label?: string;
  value?: string;
}

export interface PublicCourseHighlights {
  title?: string;
  items?: { text?: string }[];
}

export interface PublicCourseAccreditationItem {
  tag?: string;
  image?: string;
  document?: string;
  title?: string;
}

export interface PublicCourseAccreditations {
  title?: string;
  items?: PublicCourseAccreditationItem[];
}

export interface PublicCourseKeyDateItem {
  date?: string;
  label?: string;
  status?: "urgent" | "active" | "inactive" | "" | string;
}

export interface PublicCourseKeyDates {
  title?: string;
  items?: PublicCourseKeyDateItem[];
}

export interface PublicCourseCurriculumSpecialization {
  title?: string;
  selected?: boolean;
  subjects?: string[];
}

export interface PublicCourseCurriculumSemester {
  id?: string;
  name?: string;
  expanded?: boolean;
  footnote?: string;
  core_subjects?: string[];
  specializations?: PublicCourseCurriculumSpecialization[];
}

export interface PublicCourseCurriculum {
  title?: string;
  subtitle?: string;
  brochure?: { url?: string; icon?: string; label?: string };
  semesters?: PublicCourseCurriculumSemester[];
}

export interface PublicCourseStructureSegment {
  label?: string;
  details?: string;
  credits?: number;
}

export interface PublicCourseStructure {
  title?: string;
  subtitle?: string;
  chart_type?: string;
  segments?: PublicCourseStructureSegment[];
}

export interface PublicCourseValueAddedItem {
  name?: string;
  credit_label?: string;
  delivery_modes?: string[];
  delivery_mode_label?: string;
}

export interface PublicCourseValueAddedCourses {
  title?: string;
  items?: PublicCourseValueAddedItem[];
}

export interface PublicCourseCareerOpportunityItem {
  role?: string;
  salary_range?: string;
}

export interface PublicCourseCareerOpportunities {
  title?: string;
  items?: PublicCourseCareerOpportunityItem[];
}

export interface PublicCourseCertificationGroup {
  icon?: string;
  title?: string;
  items?: string[];
}

export interface PublicCourseHigherEducationCertifications {
  global?: PublicCourseCertificationGroup;
  postgraduation?: PublicCourseCertificationGroup;
}

export interface PublicCourseFlexibleExitItem {
  title?: string;
  description?: string;
}

export interface PublicCourseFlexibleExitOptions {
  title?: string;
  subtitle?: string;
  items?: PublicCourseFlexibleExitItem[];
}

export interface PublicCourseClassTimingItem {
  day?: string;
  time?: string;
}

export interface PublicCourseClassTimings {
  title?: string;
  subtitle?: string;
  schedule?: PublicCourseClassTimingItem[];
}

export interface PublicCourseSimpleNameItem {
  name?: string;
  icon?: string;
}

export interface PublicCourseSimpleNameList {
  title?: string;
  items?: PublicCourseSimpleNameItem[];
}

export interface PublicCourseAlumniCareerStep {
  year?: string;
  description?: string;
}

export interface PublicCourseAlumniItem {
  name?: string;
  image?: string;
  designation?: string;
  career_progression?: PublicCourseAlumniCareerStep[];
}

export interface PublicCourseFeaturedAlumni {
  title?: string;
  highlight_word?: string;
  items?: PublicCourseAlumniItem[];
}

export interface PublicCourseFaqItem {
  question?: string;
  answer?: string;
  expanded?: boolean;
}

export interface PublicCourseFaqs {
  title?: string;
  items?: PublicCourseFaqItem[];
}

export interface PublicCourseStudentForum {
  icon?: string;
  link?: string;
  title?: string;
  enabled?: boolean;
  cta_icon?: string;
  cta_label?: string;
  description?: string;
}

export interface PublicCourseCertificationItem {
  tag?: string;
  title?: string;
  description?: string;
  cta_label?: string;
  link?: string;
}

export interface PublicCourseCertificationsBlock {
  title?: string;
  items?: PublicCourseCertificationItem[];
}

export interface PublicCourseDetail {
  id: string;
  name: string;
  admission_batches?: PublicCourseAdmissionBatch[];
  quick_info?: PublicCourseQuickInfoItem[];
  tabs?: string[];
  highlights?: PublicCourseHighlights;
  accreditations?: PublicCourseAccreditations;
  keyDates?: PublicCourseKeyDates;
  curriculum?: PublicCourseCurriculum;
  courseStructure?: PublicCourseStructure;
  valueAddedCourses?: PublicCourseValueAddedCourses;
  careerOpportunities?: PublicCourseCareerOpportunities;
  higherEducationCertifications?: PublicCourseHigherEducationCertifications;
  flexibleExitOptions?: PublicCourseFlexibleExitOptions;
  classTimings?: PublicCourseClassTimings;
  industryTools?: PublicCourseSimpleNameList;
  labFacilities?: PublicCourseSimpleNameList;
  roomFacilities?: PublicCourseSimpleNameList;
  featuredAlumni?: PublicCourseFeaturedAlumni;
  faqs?: PublicCourseFaqs;
  studentForum?: PublicCourseStudentForum;
  certifications?: PublicCourseCertificationsBlock;
}

export interface PublicAdmissionSeatMatrixRow {
  quota_category?: string;
  total?: number;
  open?: number;
}

export interface PublicAdmissionSeatMatrix {
  title?: string;
  columns?: string[];
  rows?: PublicAdmissionSeatMatrixRow[];
}

export interface PublicAdmissionQuotaOption {
  label?: string;
  value?: string;
}

export interface PublicAdmissionQuotaOptions {
  title?: string;
  options?: PublicAdmissionQuotaOption[];
}

export interface PublicAdmissionExam {
  name?: string;
  exam_code?: string;
  code_badge?: string;
  min_criteria_label?: string;
  min_criteria_value?: string;
}

export interface PublicAdmissionExamLevel {
  level_label?: string;
  exams?: PublicAdmissionExam[];
}

export interface PublicAdmissionExamsAccepted {
  title?: string;
  levels?: PublicAdmissionExamLevel[];
}

export interface PublicAdmissionPolicyTab {
  id?: string;
  title?: string;
  enabled?: boolean;
  seat_matrix?: PublicAdmissionSeatMatrix;
  quota_options?: PublicAdmissionQuotaOptions;
  entrance_exams_accepted?: PublicAdmissionExamsAccepted;
}

export interface PublicFeePdf {
  icon?: string;
  label?: string;
  subtitle?: string;
  size?: string;
  download_icon?: string;
  url?: string;
}

export interface PublicFeeYearRow {
  year?: string;
  amount?: string;
}

export interface PublicFeeLineItem {
  label?: string;
  amount?: string;
}

export interface PublicFeeDeadlineItem {
  due?: string;
  label?: string;
  amount?: string;
}

export interface PublicFeeSummaryAmount {
  label?: string;
  amount?: string;
}

export interface PublicFeeDetail {
  quota?: string;
  gender?: string;
  tuition_fees?: { title?: string; rows?: PublicFeeYearRow[] };
  one_time_payable_fees?: {
    title?: string;
    icon?: string;
    items?: PublicFeeLineItem[];
  };
  additional_fees?: {
    title?: string;
    icon?: string;
    items?: PublicFeeLineItem[];
  };
  deadlines_and_installments?: {
    title?: string;
    icon?: string;
    items?: PublicFeeDeadlineItem[];
  };
  fees_summary?: {
    title?: string;
    icon?: string;
    full_course_fee?: PublicFeeSummaryAmount;
    booking_amount?: PublicFeeSummaryAmount;
  };
}

export interface PublicFeeTextListBlock {
  title?: string;
  icon?: string;
  items?: string[];
}

export interface PublicFeesTab {
  tab?: string;
  title?: string;
  fee_structure_pdf?: PublicFeePdf;
  fee_details?: PublicFeeDetail[];
  whats_included?: PublicFeeTextListBlock;
  whats_excluded?: PublicFeeTextListBlock;
  refund_policy?: PublicFeeTextListBlock;
}

export interface PublicScholarshipScoreRange {
  id?: string;
  range_label?: string;
  discount_type?: "amount" | "percentage" | string;
  discount_value?: number;
  max_scholarship_amount?: string;
  net_payable_amount?: string;
}

export interface PublicScholarshipPortEntry {
  id?: string;
  name?: string;
  terms_and_conditions?: string[];
  score_ranges?: PublicScholarshipScoreRange[];
}

export interface PublicMeritScholarship {
  title?: string;
  calculator?: {
    title?: string;
    icon?: string;
    port_entries?: PublicScholarshipPortEntry[];
  };
}

export interface PublicFinancialConcessionDetails {
  eligibility_criteria?: { title?: string; items?: string[] };
  scholarship?: { icon?: string; label?: string; amount?: string };
  net_payable?: { icon?: string; label?: string; amount?: string };
}

export interface PublicFinancialConcessionItem {
  name?: string;
  discount_percent?: number;
  discount_label?: string;
  accent_color?: string;
  expanded?: boolean;
  details_cta?: { label?: string; icon?: string };
  details?: PublicFinancialConcessionDetails;
}

export interface PublicFinancialConcessions {
  title?: string;
  total_types?: number;
  total_types_label?: string;
  items?: PublicFinancialConcessionItem[];
}

export interface PublicFinancialAidTab {
  tab?: string;
  merit_scholarship?: PublicMeritScholarship;
  financial_concessions?: PublicFinancialConcessions;
}

export interface PublicExamChartSegment {
  color?: string;
  label?: string;
  percent?: number;
}

export interface PublicExamChart {
  total?: number;
  total_label?: string;
  segments?: PublicExamChartSegment[];
}

export interface PublicExamSummaryCard {
  label?: string;
  value?: string;
}

export interface PublicExamSubComponent {
  name?: string;
  marks?: number;
}

export interface PublicExamComponent {
  icon?: string;
  name?: string;
  marks?: number;
  description?: string;
  sub_components?: PublicExamSubComponent[];
}

export interface PublicExamAssessmentSection {
  section?: string;
  components?: PublicExamComponent[];
}

export interface PublicExamTableRow {
  section?: string;
  subtitle?: string;
  total_questions?: number;
  attempt?: number;
  marks?: number;
}

export interface PublicExamTableSection {
  section?: string;
  columns?: string[];
  rows?: PublicExamTableRow[];
}

export interface PublicEvaluationPattern {
  pattern_type?: string;
  duration?: string;
  chart?: PublicExamChart;
  subtotals?: { label?: string; marks?: number }[];
  exam_duration?: { label?: string; value?: string };
  summary_cards?: PublicExamSummaryCard[];
  internal_assessment?: PublicExamAssessmentSection[];
  external_examination?: (PublicExamAssessmentSection &
    PublicExamTableSection)[];
}

export interface PublicSimpleMarksTable {
  section_title?: string;
  columns?: string[];
  components?: PublicExamComponent[];
  total_summary?: { label?: string; value?: string };
}

export interface PublicGradingScaleRow {
  grade?: string;
  grade_color?: string;
  grade_point?: number;
  percentage_range?: string;
}

export interface PublicGradingScale {
  title?: string;
  columns?: string[];
  rows?: PublicGradingScaleRow[];
}

export interface PublicAcademicPolicyItem {
  icon?: string;
  badge?: string;
  title?: string;
  description?: string;
  read_more_cta?: string;
  read_more_link?: string;
}

export interface PublicGuidelinesBanner {
  tag?: string;
  title?: string;
  description?: string;
  background_style?: string;
  academic_policies?: PublicAcademicPolicyItem[];
}

export interface PublicExamPolicyTab {
  tab?: string;
  evaluation_patterns?: PublicEvaluationPattern[];
  projects_dissertation?: PublicEvaluationPattern & {
    marks_distribution_bar?: {
      title?: string;
      total_label?: string;
      segments?: PublicExamChartSegment[];
    };
  };
  ojt_evaluation?: PublicSimpleMarksTable;
  internship_evaluation?: PublicSimpleMarksTable;
  grading_scale?: PublicGradingScale;
  important_guidelines_banner?: PublicGuidelinesBanner;
}

export interface PublicDemographicsTab {
  tab?: string;
  age_distribution?: { items?: { label?: string; percent?: number }[] };
  gender_diversity?: { segments?: { label?: string; percent?: number }[] };
  work_experience?: {
    items?: {
      icon?: string;
      label?: string;
      subtitle?: string;
      percent?: number;
    }[];
  };
  international_presence?: {
    items?: { flag?: string; country?: string; percent?: number }[];
  };
  national_presence?: { items?: { state?: string; percent?: number }[] };
}

export interface PublicPlacementStat {
  icon?: string;
  unit?: string;
  label?: string;
  value?: string;
  icon_bg_color?: string;
}

export interface PublicPlacementOffer {
  id?: string;
  role?: string;
  unit?: string;
  badge?: string;
  package?: string;
  category?: string;
  badge_color?: string;
  company_logo?: string;
  company_name?: string;
  package_label?: string;
  company_initial?: string;
}

export interface PublicPlacementTrendPoint {
  year?: string;
  avg_package?: number;
  highlighted?: boolean;
}

export interface PublicCompanyStatRow {
  avg_package?: string;
  max_package?: string;
  company_logo?: string;
  company_name?: string;
  logo_bg_color?: string;
  company_initial?: string;
  students_placed?: number;
  progress_percentage?: number;
}

export interface PublicIndustryStatRow {
  industry?: string;
  subtitle?: string;
  avg_package?: string;
  max_package?: string;
  students_placed?: number;
  progress_percentage?: number;
}

export interface PublicStudentSuccessItem {
  type?: "mp4" | "youtube" | string;
  quote?: string;
  placed_at?: string;
  thumbnail?: string;
  video_url?: string;
  student_name?: string;
  student_avatar?: string;
}

export interface PublicPlacementsTab {
  id?: string;
  title?: string;
  enabled?: boolean;
  summary_stats?: PublicPlacementStat[];
  notable_offers?: { title?: string; items?: PublicPlacementOffer[] };
  download_report?: { url?: string; icon?: string; label?: string };
  student_success?: { title?: string; items?: PublicStudentSuccessItem[] };
  placement_trends?: {
    title?: string;
    footer?: { label?: string; value?: string; value_color?: string };
    data_points?: PublicPlacementTrendPoint[];
    duration_filter?: string;
  };
  all_company_statistics?: { title?: string; rows?: PublicCompanyStatRow[] };
  industry_salary_report?: { title?: string; rows?: PublicIndustryStatRow[] };
}

export interface PublicFacultyEducation {
  degree?: string;
  duration?: string;
  institution?: string;
}

export interface PublicFacultyExperience {
  icon?: string;
  role?: string;
  duration?: string;
  is_current?: boolean;
  organization?: string;
  current_badge?: string;
}

export interface PublicFacultyMember {
  id?: string;
  name?: string;
  photo?: string;
  education?: PublicFacultyEducation[];
  department?: string;
  designation?: string;
  professional_experience?: PublicFacultyExperience[];
}

export interface PublicCourseReviewItem {
  id?: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  date?: string;
  rating?: number;
  comment?: string;
}

export interface PublicReviewTab {
  tab?: string;
  overall_rating?: { average?: number; total_reviews?: number };
  rating_breakdown?: { items?: { emoji?: string; count?: number }[] };
  category_ratings?: {
    items?: { icon?: string; label?: string; rating?: number }[];
  };
  recent_reviews?: {
    title?: string;
    items?: PublicCourseReviewItem[];
    load_more_cta?: { label?: string };
  };
  has_more?: boolean;
}

export interface PublicPaginationMeta {
  current_page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
}

export interface PublicCourseReviewsPage {
  reviews?: PublicCourseReviewItem[];
  pagination?: PublicPaginationMeta;
}

export interface PublicHostelRoomTypeFromCourseTab {
  id?: string;
  name?: string;
  totalBeds?: number;
  availableBeds?: number;
  annualPlanPrice?: number;
  monthlyPlanPrice?: number;
}

export interface PublicHostelListItemFromCourseTab {
  id: string;
  name?: string;
  hostelType?: string;
  isOnCampus?: boolean;
  distanceFromCampus?: string | null;
  totalBeds?: number | null;
  coverImageUrl?: string | null;
  roomTypes?: PublicHostelRoomTypeFromCourseTab[];
}

export interface PublicStudentHousingTab {
  tab?: string;
  summary?: string;
  hostels?: PublicHostelListItemFromCourseTab[];
}

export interface PublicClubPreview {
  id: string;
  name?: string;
  category?: string;
  cover_image?: string;
  logo?: string;
  about?: { description?: string };
}

export interface PublicClubEvent {
  id?: string;
  title?: string;
  thumbnail?: string;
  link?: string;
}

export interface PublicClubDetail extends PublicClubPreview {
  mission?: { description?: string };
  key_activities?: { items?: string[] };
  recent_events?: {
    view_all_cta?: { label?: string; link?: string };
    items?: PublicClubEvent[];
  };
}

export interface PublicClubsListPage {
  list?: PublicClubPreview[];
  pagination?: PublicPaginationMeta;
}

export interface PublicAllianceLegalDoc {
  title?: string;
  download_icon?: string;
  url?: string;
}

export interface PublicAllianceActivity {
  id?: string;
  title?: string;
  thumbnail?: string;
  link?: string;
}

export interface PublicAlliancePartner {
  id: string;
  name?: string;
  category?: string;
  category_color?: string;
  cover_image?: string;
  logo?: string;
  about?: { description?: string };
  collaboration_impact?: { description?: string };
  key_focus_areas?: { items?: string[] };
  legal_and_documentation?: { items?: PublicAllianceLegalDoc[] };
  alliance_activities?: {
    view_all_cta?: { label?: string; link?: string };
    items?: PublicAllianceActivity[];
  };
}

export interface PublicOtherCourseItem {
  id: string;
  name?: string;
  duration?: string;
  fee?: string;
}

export interface PublicOtherCoursesGroup {
  studyLevel?: { id?: string; name?: string; slug?: string };
  courses?: PublicOtherCourseItem[];
}

export interface PublicOtherCoursesPage {
  list?: PublicOtherCoursesGroup[];
  pagination?: PublicPaginationMeta;
}

export interface PublicEligibilityOption {
  value?: string;
  label?: string;
}

export interface PublicEligibilityQuota {
  id?: string;
  label?: string;
}

export interface PublicEligibilityCriterion {
  heading?: string;
  description?: string;
}

export interface PublicEligibilityCriteria {
  student_types?: PublicEligibilityOption[];
  quotas?: PublicEligibilityQuota[];
  criteria?: PublicEligibilityCriterion[];
  filters_applied?: {
    student_type?: string | null;
    quota_category?: string | null;
  };
}

export interface PublicScholarshipPortEntryOption {
  id?: string;
  name?: string;
  score_ranges?: { id?: string; range_label?: string }[];
}

export interface PublicScholarshipResolvedDetails {
  criteria?: string[];
  discount_type?: "amount" | "percentage" | string;
  discount_value?: number;
  max_scholarship_amount?: string;
  net_payable_amount?: string;
}

export interface PublicScholarshipDetailsResponse {
  port_entries?: PublicScholarshipPortEntryOption[];
  details?: PublicScholarshipResolvedDetails | null;
  filters_applied?: {
    port_entry_id?: string | null;
    score_range_id?: string | null;
  };
}
