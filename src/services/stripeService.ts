import { PaymentIntent, PaymentStatus } from "../models/paymentService";
const stripe = require('stripe')(process.env.CLAVE_SECRETA_DE_STRIPE_TEST);

const verifyStatus = async (intentId: string): Promise<PaymentStatus> => {
  const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
  let refunded = false;
  if (paymentIntent.latest_charge) {
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    refunded = charge.refunded;
  }
  
  if (refunded)
    return "canceled"

  switch (paymentIntent.status) {
    case "succeeded":
      return "success";
    case "payment_failed":
      return "failure";
    case "pending_payment":
      return "pay"
    default:
      return "pending";
  }

};

const createIntent = async (amount: number): Promise<PaymentIntent> => {
  return await stripe.paymentIntents.create({
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

const cancelPayment = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if(paymentIntent.status === "requires_payment_method")
    await stripe.paymentIntents.cancel(paymentIntentId)
  else
    await stripe.refunds.create({charge:paymentIntent.latest_charge});
}

const confirmIntent = async (paymentIntentId: string): Promise<PaymentIntent> => {
  return await stripe.paymentIntents.confirm(paymentIntentId)
}

module.exports = { verifyStatus, createIntent, confirmIntent, cancelPayment };
