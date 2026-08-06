export interface HostelSelectedAddonInput {
  addon_service_id: string;
  plan_label: string;
}

export interface InitiateHostelTokenFeeInput {
  room_type_id: string;
  room_plan_type: "monthly" | "annual";
  mess_plan_id?: string;
  dietary_preference?: string;
  selected_addons?: HostelSelectedAddonInput[];
}

export interface HostelEnrollmentItem {
  id: string;
  status: string;
  roomPlanType: string;
  enrolledFrom: string;
  enrolledUntil: string | null;
  hostel: { id: string; name: string };
  roomType: {
    id: string;
    name: string;
    monthlyPlanPrice: string | null;
    annualPlanPrice: string | null;
  };
  messPlan: { id: string; name: string } | null;
  dietaryPreference: string | null;
  selectedAddons: HostelSelectedAddonInput[];
  feeBreakdown: Record<string, unknown>;
}

export interface HostelPaymentItem {
  id: string;
  transactionNumber: string;
  feeCategory: string;
  roomTypeId: string | null;
  amount: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}
