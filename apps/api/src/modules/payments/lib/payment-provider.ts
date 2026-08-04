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

export interface PaymentProvider {
  readonly name: string;
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
}
