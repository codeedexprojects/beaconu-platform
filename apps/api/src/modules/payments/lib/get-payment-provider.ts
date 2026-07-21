import { MockPaymentProvider } from "./providers/mock-payment.provider";
import type { PaymentProvider } from "./payment-provider";

const mockProvider = new MockPaymentProvider();

/** Single seam for swapping the concrete gateway later (Razorpay,
 * RazorpayX, or Razorpay Route) — every payments-module call site depends
 * only on the PaymentProvider interface, never on this function's
 * implementation. */
export function getPaymentProvider(): PaymentProvider {
  return mockProvider;
}
