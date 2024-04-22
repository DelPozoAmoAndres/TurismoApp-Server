import express from 'express';
import PaymentController from '@controllers/paymentController';

const router = express.Router();
const paymentController = new PaymentController();

router
  .post('/intent', paymentController.createIntent)
  .post('/confirm', paymentController.confirmIntent)
  .post('/verify', paymentController.verifyStatus);

export default router;
