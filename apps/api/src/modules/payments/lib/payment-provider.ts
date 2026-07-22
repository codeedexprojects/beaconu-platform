export interface CreateOrderParams {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  raw: unknown;
}

export interface VerifyPaymentParams {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
}

/** Every concrete gateway (mock today; Razorpay, RazorpayX, or Razorpay
 * Route later) implements this same shape. Nothing in the payments module's
 * service layer depends on gateway-specific types, so swapping the
 * implementation returned by getPaymentProvider() is the only change needed
 * to go live with a real gateway. */
export interface PaymentProvider {
  readonly name: string;
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
}
