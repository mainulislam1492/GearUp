export type PaymentGateway = "STRIPE" | "SSLCOMMERZ";

export interface CreatePaymentPayload {
    rentalOrderId: string;
    provider: PaymentGateway;
}

export interface PaymentCustomer {
    id: string;
    name: string;
    email: string;
}