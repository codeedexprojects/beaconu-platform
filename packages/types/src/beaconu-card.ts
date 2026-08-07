export interface BeaconuCardItem {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  validUntil: string;
  balance: string;
  totalEarned: string;
  totalWithdrawn: string;
  status: string;
  collegeId: string | null;
  collegeName: string | null;
  duration: string | null;
  commuteEnrolled: boolean;
  housingEnrolled: boolean;
  createdAt: string;
}
