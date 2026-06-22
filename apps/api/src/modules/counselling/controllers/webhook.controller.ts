import { Request, Response } from "express";
import { UnauthorizedError } from "@/shared/errors";
import { verifyWebhookSignature } from "@/shared/lib/razorpay";
import { SessionService } from "../services/sessions.service";

export class CounsellingWebhookController {
  static async handleRazorpayWebhook(req: Request, res: Response) {
    const signature = req.headers["x-razorpay-signature"];

    if (typeof signature !== "string" || !req.rawBody) {
      throw new UnauthorizedError("Missing webhook signature");
    }

    if (!verifyWebhookSignature(req.rawBody, signature)) {
      throw new UnauthorizedError("Invalid webhook signature");
    }

    const event = req.body as {
      event?: string;
      payload?: { payment?: { entity?: Record<string, unknown> } };
    };

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        await SessionService.markPaymentCaptured(
          payment as {
            id: string;
            amount: number;
            notes?: { availability_id?: string; student_id?: string };
          },
        );
      }
    }

    return res.status(200).json({ received: true });
  }
}
