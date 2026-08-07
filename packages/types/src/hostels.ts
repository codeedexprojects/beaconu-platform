export type HostelType = "boys" | "girls" | "co-ed";

export interface HostelRoomTypeDto {
  id: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  annualPlanPrice: number | null;
  monthlyPlanPrice: number | null;
  admissionFee?: number;
  securityDeposit?: number;
  description?: string | null;
  photos?: string[];
}

export interface HostelMessPlanDto {
  id: string;
  name: string;
  description: string | null;
  mealsIncluded: string[];
  priceMonthly: number;
  duration: string;
  isCompulsory: boolean;
  dietaryOptions: string[];
}

export interface HostelAddonPlanItem {
  label: string;
  price: number;
}

export interface HostelAddonServiceDto {
  id: string;
  serviceType: string;
  name: string;
  description: string | null;
  isOptional: boolean;
  plans: HostelAddonPlanItem[];
  notes: string | null;
}

export interface HostelSafetyFeature {
  label: string;
}

export interface HostelWardenInfo {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  designation?: string;
  safetyFeatures?: HostelSafetyFeature[];
}

export interface HostelTag {
  label: string;
}

export interface HostelAmenity {
  name: string;
  icon?: string;
}

export interface HostelRule {
  title: string;
  description: string;
}

export interface HostelNearbyEssential {
  type: string;
  name: string;
  distance: string;
}

export interface HostelUtility {
  category: string;
  provider: string;
  notes?: string;
}

export interface HostelTransitRoute {
  route: string;
  stop?: string;
  timing?: string;
}

export interface HostelCollegeTransport {
  description?: string;
  busStopNote?: string;
}

export interface HostelMapInfo {
  thumbnail?: string;
}

export interface HostelLocationInfo {
  address?: string;
  addressLine2?: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
  map?: HostelMapInfo;
  nearbyEssentials?: HostelNearbyEssential[];
  collegeTransport?: HostelCollegeTransport;
  utilities?: HostelUtility[];
  transit?: HostelTransitRoute[];
}

export interface HostelSummaryDto {
  id: string;
  name: string;
  slug: string;
  hostelType: HostelType;
  isOnCampus: boolean;
  distanceFromCampus: string | null;
  totalBeds: number | null;
  coverImageUrl: string | null;
  avgRating: number;
  reviewCount: number;
}

export interface HostelDetailDto extends HostelSummaryDto {
  description: string | null;
  gallery: string[];
  tags?: HostelTag[];
  badge?: string | null;
  safetyTier?: string | null;
  wardenInfo: HostelWardenInfo;
  amenities: HostelAmenity[];
  rules: HostelRule[];
  locationInfo: HostelLocationInfo;
  roomTypes: HostelRoomTypeDto[];
  messPlans: HostelMessPlanDto[];
  addonServices: HostelAddonServiceDto[];
}

export interface PublicHostelSummary extends HostelSummaryDto {
  gallery: string[];
}

export interface PublicHostelPlan {
  name?: string;
  subtitle?: string;
  price?: string;
  currency?: string;
  period?: string;
  additional_charges?: string[];
  feature_tags?: string[];
  meal_tags?: string[];
}

export interface PublicHostelRoomTypeFees {
  room_type_id?: string;
  room_type_label?: string;
  plans?: PublicHostelPlan[];
}

export interface PublicHostelFeeBlock {
  step_number?: number;
  title?: string;
  room_types?: PublicHostelRoomTypeFees[];
  note?: string;
}

export interface PublicHostelSimplePlanBlock {
  step_number?: number;
  title?: string;
  status_badge?: string;
  plans?: PublicHostelPlan[];
  note?: string;
}

export interface PublicHostelParkingBlock {
  step_number?: number;
  title?: string;
  items?: {
    name?: string;
    price?: string;
    currency?: string;
    period?: string;
  }[];
  note?: string;
}

export interface PublicHostelRoomItem {
  id?: string;
  name?: string;
  description?: string;
  photos?: string[];
  availability_label?: string;
  price?: string;
  currency?: string;
  period?: string;
}

export interface PublicHostelHeader {
  cover_image?: string;
  tags?: { label?: string }[];
  rating_badge?: { rating?: number; review_count?: number };
  name?: string;
  verified_badge?: { text?: string };
}

export interface PublicHostelSafetyWarden {
  title?: string;
  warden?: { photo?: string; name?: string; designation?: string };
  features?: { label?: string }[];
}

export interface PublicHostelAmenities {
  title?: string;
  items?: { label?: string; selected?: boolean }[];
}

export interface PublicHostelRules {
  title?: string;
  items?: { number?: number; title?: string; description?: string }[];
}

export interface PublicHostelReviewItem {
  id?: string;
  reviewer_initials?: string;
  reviewer_name?: string;
  rating?: number;
  posted?: string;
  comment?: string;
}

export interface PublicHostelReviews {
  title?: string;
  summary?: { average?: number; total_reviews_label?: string };
  items?: PublicHostelReviewItem[];
}

export interface PublicHostelLocationCategoryDetail {
  name?: string;
  distance?: string;
}

export interface PublicHostelLocationCategory {
  title?: string;
  details?: PublicHostelLocationCategoryDetail[];
}

export interface PublicHostelLocationType {
  type?: string;
  categories?: PublicHostelLocationCategory[];
}

export interface PublicHostelLocationAndAccess {
  title?: string;
  tabs?: { selected?: string; options?: string[] };
  types?: PublicHostelLocationType[];
  map?: {
    thumbnail?: string;
    address?: { line1?: string; line2?: string };
    college_transport?: {
      title?: string;
      description?: string;
      bus_stop_note?: string;
    };
    open_map_cta?: { latitude?: number; longitude?: number; link?: string };
  };
}

export interface PublicHostelDetail {
  id: string;
  tab?: string;
  gallery?: string[];
  header?: PublicHostelHeader;
  rooms_and_types?: {
    title?: string;
    total_intake_label?: string;
    items?: PublicHostelRoomItem[];
  };
  hostel_fees?: PublicHostelFeeBlock;
  mess_plan?: PublicHostelSimplePlanBlock;
  laundry_charges?: PublicHostelSimplePlanBlock;
  gym_packages?: PublicHostelSimplePlanBlock;
  parking_charges?: PublicHostelParkingBlock;
  other_charges?: PublicHostelSimplePlanBlock;
  safety_and_warden?: PublicHostelSafetyWarden;
  amenities?: PublicHostelAmenities;
  rules?: PublicHostelRules;
  reviews_and_ratings?: PublicHostelReviews;
  location_and_access?: PublicHostelLocationAndAccess;
}
