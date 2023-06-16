import express, { Request, Response } from 'express';
import User, { ReservationDoc } from '../models/user';
import { verify } from 'jsonwebtoken';
const { cancelPayment,verifyStatus } = require("../services/stripeService")
const { formatData, groupReservations, getReservation } = require("../services/reservationService")
const { getUserId } = require('../services/tokenService');
const router = express.Router();


//Iniciar una reserva 
router.post('/reservation', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            const usuario = await User.findById(userId);
            let reservation: ReservationDoc = req.body.reservation

            const intentId = req.body.intentId;
            reservation.paymentId = intentId;

            usuario.reservations?.push(reservation)
            console.log(reservation)
            const validationError = usuario.validateSync();
            if (validationError) {
                res.status(400).json({ message: `Error al registrar la reserva` })
            }
            else {
                usuario.save();
                res.status(200).json({ mesagge: "Reserva completada correctamente" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

//Obtener las reservas de un usuario
router.get('/reservations', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const user = await User.findById(userId);
            let reservations: ReservationDoc[] = user.reservations ? user.reservations : [];

            const result = await Promise.all(reservations.map(async (reservation) => {
                return await formatData(reservation);
            }));

            // Ordenar las reservas por fecha de forma ascendente
            result.sort((a, b) => a.event.date.getTime() - b.event.date.getTime());

            let reservationGroups = await groupReservations(result)

            res.status(200).json(reservationGroups);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    })
});

//Obtener informacion de una reserva
router.get('/reservation/:id', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            let reservation = await getReservation(userId, req.params.id)
            if (!reservation) {
                res.status(404).json(null);
            }
            else {
                reservation = await formatData(reservation);
                res.status(200).json(reservation);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    })
});

//Cancelar una reserva
router.put('/cancel/reservation/:id', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            let reservation = await getReservation(userId, req.params.id)
            if (!reservation) {
                res.status(404).json(null);
            }
            else {
                await cancelPayment(reservation.paymentId)
                res.status(200).json({ message: "Reserva cancelada correctamente" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    })
});

export default router