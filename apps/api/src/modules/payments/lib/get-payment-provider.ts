import { MockPaymentProvider } from "./providers/mock-payment.provider";
import type { PaymentProvider } from "./payment-provider";

const mockProvider = new MockPaymentProvider();

export function getPaymentProvider(): PaymentProvider {
  return mockProvider;
}
