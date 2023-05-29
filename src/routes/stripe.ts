import express, { Request, Response } from 'express';
import { Stripe } from 'stripe';

const router = express.Router();

// Configurar la instancia de Stripe
const stripe = new Stripe(process.env.CLAVE_SECRETA_DE_STRIPE_TEST, {
  apiVersion: '2022-11-15'
});

export class CreatePaymentIntentDTO {
  amount?: number;
  currency?: string;
  customer_id?: string;
}

export class CreateSetupIntentDTO {
  customer_id?: string;
}

// Ruta para crear un PaymentIntent
router.post('/intent', async (req: Request, res: Response) => {
  try {
    const createPaymentIntentDto: CreatePaymentIntentDTO = req.body;

    // Obtener el customer ID o crear uno nuevo
    const customerId = createPaymentIntentDto.customer_id || (await stripe.customers.create()).id;

    // Crear una clave efímera para el cliente
    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customerId},{ apiVersion:"2022-11-15"});

    // Crear el PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: createPaymentIntentDto.amount || 1099,
      currency: createPaymentIntentDto.currency || 'usd',
      customer: customerId,
    });

    // Retornar la respuesta con los datos necesarios
    res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear el PaymentIntent.' });
  }
});

// Ruta para crear un SetupIntent
router.post('/intent/setup', async (req: Request, res: Response) => {
  try {
    const createSetupIntentDto: CreateSetupIntentDTO = req.body;

    // Obtener el customer ID o crear uno nuevo
    const customerId = createSetupIntentDto.customer_id || (await stripe.customers.create()).id;

    // Crear una clave efímera para el cliente
    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customerId });

    // Crear el SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'on_session',
    });

    // Retornar la respuesta con los datos necesarios
    res.status(200).json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al crear el SetupIntent.' });
  }
});

// Otras rutas...

export default router;
