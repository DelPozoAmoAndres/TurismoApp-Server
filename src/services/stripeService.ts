import { PaymentIntent, PaymentStatus } from "@customTypes/payment";
import Stripe from "stripe";
import PaymentService from "@services/paymentService";
export default class StripeService implements PaymentService{
 private stripe = new Stripe(process.env.CLAVE_SECRETA_DE_STRIPE_TEST,null);

  verifyStatus = async (intentId: string): Promise<PaymentStatus> => {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(intentId);
    let refunded = false;
    if (paymentIntent.latest_charge) {
      const charge = await this.stripe.charges.retrieve(paymentIntent.latest_charge.toString());
      refunded = charge.refunded;
    }
    
    if (refunded)
      return "canceled"

    switch (paymentIntent.status) {
      case "succeeded":
        return "success";
      // case "payment_failed":
      //   return "failure";
      // case "pending_payment":
      //   return "pay"
      default:
        return "pending";
    }

  };

  createIntent = async (amount: number): Promise<PaymentIntent> => {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'eur',
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ['payment_method', 'balances'],
          },
        },
      },
    });;
  };

  cancelPayment = async (paymentIntentId: string) => {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if(paymentIntent.status === "requires_payment_method")
      await this.stripe.paymentIntents.cancel(paymentIntentId)
    else
      await this.stripe.refunds.create({charge:paymentIntent.latest_charge.toString()});
  }

  confirmIntent = async (paymentIntentId: string): Promise<PaymentIntent> => {
    return await this.stripe.paymentIntents.confirm(paymentIntentId)
  }

};
