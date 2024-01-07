interface Payment {
    createIntent(amount: number): Promise<string>;
    verifyStatus(intentId: string): Promise<PaymentStatus>;
  }
  
type PaymentStatus = 'pending' | 'success' | 'failure' | 'canceled' | 'pay';

interface PaymentIntent {
  id:string,
  client_secret:string,
}

export {Payment, PaymentStatus, PaymentIntent}