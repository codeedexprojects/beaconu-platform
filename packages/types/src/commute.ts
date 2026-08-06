export interface CommuteRouteItem {
  id: string;
  name: string;
  description: string | null;
}

export interface CommuteStopItem {
  id: string;
  stopName: string;
  landmark: string | null;
  morningTime: string | null;
  eveningTime: string | null;
  stopOrder: number;
}

export interface CommuteBusItem {
  id: string;
  busNumber: string;
  busName: string | null;
  busType: string | null;
  busModel: string | null;
  totalSeats: number;
  availableSeats: number;
  driverName: string | null;
  driverPhone: string | null;
  driverStatus: string;
  monthlyFee: string;
}

export interface CommuteEnrollmentItem {
  id: string;
  status: string;
  enrolledFrom: string;
  enrolledUntil: string | null;
  route: { id: string; name: string };
  bus: {
    id: string;
    busNumber: string;
    busName: string | null;
    monthlyFee: string;
    driverName: string | null;
    driverPhone: string | null;
    driverStatus: string;
  };
  pickupStop: {
    id: string;
    stopName: string;
    morningTime: string | null;
    eveningTime: string | null;
  };
}

export interface CommutePaymentDue {
  period: string;
  amount: string;
  status: "unpaid" | "pending" | "paid";
}

export interface CommuteDashboard {
  enrollment: CommuteEnrollmentItem | null;
  paymentDue: CommutePaymentDue | null;
}

export interface CommuteRideHistoryItem {
  id: string;
  rideDate: string;
  rideType: "morning" | "evening";
  boardedAt: string | null;
  droppedAt: string | null;
  status: string;
  busNumber: string;
}

export interface CommuteScheduleStopItem {
  id: string;
  stopName: string;
  landmark: string | null;
  time: string | null;
  stopOrder: number;
  isMyPickup: boolean;
}

export interface SetupCommuteInput {
  college_id: string;
  route_id: string;
  pickup_stop_id: string;
  bus_id: string;
}

export type ModifyCommuteInput = SetupCommuteInput;

export interface CommutePaymentItem {
  id: string;
  transactionNumber: string;
  period: string;
  amount: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}
