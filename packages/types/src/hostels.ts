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
  serviceType: string; // "laundry" | "gym" | "parking" | freeform
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
  color?: string;
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
