import { randomUUID } from "crypto";
import type {
  PaymentProvider,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
} from "../payment-provider";

/** Dev/testing stand-in until a real gateway is plugged in behind the same
 * PaymentProvider interface. No real money moves — createOrder fabricates
 * an order id, verifyPayment always succeeds. */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const providerOrderId = `mock_order_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
    return {
      providerOrderId,
      amount: params.amount,
      currency: params.currency,
      raw: { provider: "mock", ...params, providerOrderId },
    };
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    return true;
  }
}
