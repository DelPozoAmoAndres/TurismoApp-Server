import { PaymentIntent } from "@customTypes/payment";

export default interface PaymentService {
    createIntent: (amount: number) => Promise<PaymentIntent>;
    confirmIntent: (paymentId: string) => Promise<PaymentIntent>;
    verifyStatus: (paymentId: string) => Promise<string>;
    cancelPayment: (paymentId: string) => Promise<void>;
}