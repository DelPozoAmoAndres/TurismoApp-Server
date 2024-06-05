import { PaymentIntent, PaymentStatus } from "@customTypes/payment";
import Stripe from "stripe";
import PaymentService from "@services/paymentService";
import UserSchema from "@models/userSchema";
import ActivitySchema from "@models/activitySchema";
export default class StripeService implements PaymentService {
  private stripe = new Stripe(process.env.CLAVE_SECRETA_DE_STRIPE_TEST, null);

  verifyStatus = async (intentId: string): Promise<PaymentStatus> => {
    const user = await UserSchema.findOne({ "reservations.paymentId": intentId }, { "reservations.$": 1 }).exec();
    if (user && user.reservations && user.reservations.length > 0 && user.reservations[0].state !== "pending") {
      return user.reservations[0].state;
    }

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
        UserSchema.findOneAndUpdate({ "reservations.paymentId": intentId }, { $set: { "reservations.$.state": "success" } }).exec();
        return "success";
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

  cancelPayment = async (paymentIntentId: string, refund: boolean) => {
    if (refund) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "requires_payment_method")
        await this.stripe.paymentIntents.cancel(paymentIntentId)
      else
        await this.stripe.refunds.create({ charge: paymentIntent.latest_charge.toString() });
    }
    const user = await UserSchema.findOneAndUpdate({ "reservations.paymentId": paymentIntentId }, { $set: { "reservations.$.state": "canceled", "reservations.$.date": new Date() } }, { new: true }).exec();
    const reservation = user.reservations.filter(reservation => reservation.paymentId === paymentIntentId)[0];
    await ActivitySchema.findOneAndUpdate({ "events._id": reservation.eventId }, { $inc: { "events.$.bookedSeats": - reservation.numPersons } }).exec();
  }

  confirmIntent = async (paymentIntentId: string): Promise<PaymentIntent> => {
    return await this.stripe.paymentIntents.confirm(paymentIntentId)
  }

};
