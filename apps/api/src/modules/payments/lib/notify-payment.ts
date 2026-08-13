import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";

export async function notifyPaymentConfirmed(
  studentId: string,
  feeLabel: string,
  amount: number,
): Promise<void> {
  try {
    await PushService.sendToUser(studentId, "student", {
      title: "Payment confirmed",
      body: `Your ${feeLabel} payment of ₹${amount} was successful.`,
      data: { type: "payment_confirmed" },
    });
  } catch (error) {
    logger.error(
      { err: error, studentId },
      "Failed to notify student of payment confirmation",
    );
  }
}
