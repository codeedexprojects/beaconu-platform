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

export interface HostelWardenInfo {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
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

export interface HostelLocationInfo {
  address?: string;
  nearbyEssentials?: HostelNearbyEssential[];
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
  wardenInfo: HostelWardenInfo;
  amenities: HostelAmenity[];
  rules: HostelRule[];
  locationInfo: HostelLocationInfo;
  roomTypes: HostelRoomTypeDto[];
  messPlans: HostelMessPlanDto[];
  addonServices: HostelAddonServiceDto[];
}
