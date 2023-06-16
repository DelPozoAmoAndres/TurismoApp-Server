import express from 'express';
import { PaymentIntent } from '../models/paymentService';
import User from '../models/user';

const router = express.Router();
const { createIntent, verifyStatus, confirmIntent } = require('../services/stripeService');
const { getUserId } = require('../services/tokenService');

// Ruta para procesar el pago
router.post('/intent/reservation', async (req, res) => {
  getUserId(req, res, async () => {
    try {
      const amount: number = req.body.price;
      const paymentIntent: PaymentIntent = await createIntent(amount);
      res.status(200).json({ paymentIntent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error al crear un intento de pago.' });
    }
  });
});

//Ruta para confirmar un pago
router.post('/confirm/reservation', async (req, res) => {
  const paymentIntentId = req.body.paymentIntentId;
  getUserId(req, res, async (userId:string) => {
    try {
      const paymentIntent = await confirmIntent(paymentIntentId);
      console.log('Pago confirmado:', paymentIntent);
      res.status(200).json({ message: 'Pago confirmado correctamente' });
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      res.status(500).json({ message: 'Error al confirmar el pago' });
    }
  })
});

//Ruta para verificar pago
router.post('/verify/reservation/', async (req, res) => {
  const paymentId = req.body.paymentId;
  try {
    const status = await verifyStatus(paymentId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Error al confirmar el pago:', error);
    res.status(500).json({ message: 'Error al confirmar el pago' });
  }
});

export default router;
