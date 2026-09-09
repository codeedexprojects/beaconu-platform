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
  communityLinkUrl: string | null;
  courseName: string | null;
  duration: string | null;
  applicationCourseId: string | null;
  commuteEnrolled: boolean;
  housingEnrolled: boolean;
  createdAt: string;
}

// ── Redemption (BeaconU Card wallet payout) ──────────────────────────────────
// Payouts are made by hand by a super admin outside the platform; these types
// describe the review queue, not a payment integration.

/** Payout destination as it stood when the request was made. Snapshotted, so a
 * later edit to the student's bank account can't rewrite history. Masked — the
 * full account number is only ever returned by the payout-details endpoint. */
export interface RedemptionPayoutSnapshot {
  bankName: string;
  accountHolderName: string;
  accountNumberLast4: string;
  ifscCode: string;
  accountType: string;
}

export interface RedemptionRequest {
  id: string;
  amount: number;
  status: string | null;
  payoutDetails: RedemptionPayoutSnapshot | null;
  reviewRemarks: string | null;
  reviewedAt: string | null;
  requestedAt: string;
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  card: { cardNumber: string; balance: number } | null;
}

/** Returned only by the per-request payout-details endpoint — the single place
 * a bank account number is decrypted. `accountNumber` is null if the linked
 * account was deleted or the ciphertext failed its auth check. */
export interface RedemptionPayoutDetails {
  id: string;
  amount: number;
  status: string | null;
  requestedAt: string;
  student: { id: string; fullName: string; phoneNumber: string | null };
  snapshot: RedemptionPayoutSnapshot | null;
  account: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string | null;
    accountNumberLast4: string;
    ifscCode: string;
    accountType: string;
  } | null;
}

export interface ReviewRedemptionInput {
  status: "approved" | "rejected";
  remarks?: string;
}

export interface ReviewRedemptionResult {
  id: string;
  withdrawalStatus: string | null;
  reviewRemarks: string | null;
  reviewedAt: string | null;
}

export interface StudentBankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumberLast4: string;
  ifscCode: string;
  accountType: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}
