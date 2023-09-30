export interface Payment {
    createIntent(amount: number): Promise<string>;
    verifyStatus(intentId: string): Promise<PaymentStatus>;
  }
  
export type PaymentStatus = 'pending' | 'success' | 'failure' | 'canceled' | 'pay';

export interface PaymentIntent {
  id:string,
  client_secret:string,
}