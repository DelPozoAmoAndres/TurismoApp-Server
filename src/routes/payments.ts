import express, { Request, Response } from 'express';
import User from '../models/user';
import reservation, { ReservationDoc } from '../models/reservation';
import Activity, { ActivityDoc } from '../models/activity';
const stripe = require('stripe')(process.env.CLAVE_SECRETA_DE_STRIPE_TEST);

const router = express.Router();

// Ruta para procesar el pago
router.post('/pay/reservation/:id', async (req, res) => {
    try {
        const user = await User.findOne(
            { 'reservations._id': req.params.id },
            { 'reservations.$': 1 })

        const reservations = user.reservations;

        const result = await Promise.all(reservations.map(async (reservation) => {
            const { eventId, activityId }: ReservationDoc = reservation; // Desestructurar y crear una copia independiente de reservation
            let reservationMap: any = JSON.parse(JSON.stringify(reservation))
            delete reservationMap.eventId;
            delete reservationMap.activityId;
            let activity: ActivityDoc = await Activity.findById(activityId);
            reservationMap.event = activity.events.find((event) => event.id == eventId)
            let activityFinal = activity.toJSON()
            delete activityFinal.events
            reservationMap.activity = activityFinal
            return reservationMap;
        }));

        console.log(result[0].event.price * result[0].numPersons)

        // Crear una intención de pago con los detalles del pago
        const paymentIntent = await stripe.paymentIntents.create({
            amount: result[0].event.price * result[0].numPersons*100,
            currency: 'eur',
            description: 'HOLA HOLA HOLA',
            payment_method: 'pm_card_visa', // ID de prueba de un método de pago (solo para pruebas)
        });

        // Retorna el ID de la intención de pago
        res.status(200).json({ paymentIntentId: paymentIntent.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al procesar el pago.' });
    }
});

export default router;
