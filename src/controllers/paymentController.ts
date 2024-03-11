import { Request, Response } from 'express';
import { logger } from '@utils/logger';
import PaymentService from '@services/paymentService';
import StripeService from '@services/stripeService';
import { PaymentIntent } from '@customTypes/payment';
import { socket } from '@app';

export default class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService?: PaymentService) {
        this.paymentService = paymentService || new StripeService();
    }

    createIntent = async (req: Request, res: Response) => {
        const {price} = req.body;
        try {
            const paymentIntent: PaymentIntent = await this.paymentService.createIntent(price);
            res.status(200).json({ paymentIntent });
        } catch (error) {
            logger.error('[CreateIntent] Ha ocurrido un error en el servidor durante la creación de un intento de pago', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    confirmIntent = async (req: Request, res: Response) => {
        const paymentIntentId = req.body.paymentIntentId;
        try {
            const paymentIntent = await this.paymentService.confirmIntent(paymentIntentId);
            console.log('Pago confirmado:', paymentIntent);
            res.status(200).json({ message: 'Pago confirmado correctamente' });
        } catch (error) {
            console.error('Error al confirmar el pago:', error);
            res.status(500).json({ message: 'Error al confirmar el pago' });
        }
    }

    verifyStatus = async (req: Request, res: Response) => {
        const paymentId = req.body.paymentId;
        try {
            const status = await this.paymentService.verifyStatus(paymentId);
            res.status(200).json(status);
        } catch (error) {
            console.error('Error al confirmar el pago:', error);
            res.status(500).json({ message: 'Error al confirmar el pago' });
        }
    }

}