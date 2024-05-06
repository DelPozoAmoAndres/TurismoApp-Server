import { Response } from "express";
import { AuthenticatedRequest } from "@customTypes/autenticatedRequest";
import { logger } from "@utils/logger";
import ReservationService from "@services/reservationService";
import { socket } from "@app";
// import EmailService from "@services/emailService";

export default class ReservationController {
    private reservationService: ReservationService;
    // private emailService: EmailService = new EmailService();

    constructor(reservationService?: ReservationService) {
        this.reservationService = reservationService || new ReservationService();
    }

    getOneReservation = async (req: AuthenticatedRequest, res: Response) => {
        const { params: { id }, userId } = req;
        try {
            const reservation = await this.reservationService.getOneReservation(id, userId);
            res.status(200).json(reservation);
        } catch (error) {
            logger.error('[GetOneReservation] Ha ocurrido un error en el servidor durante la obtención de la reserva.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    getAllReservations = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const reservations = await this.reservationService.getAllReservations(req.userId);
            res.status(200).json(reservations);
        } catch (error) {
            logger.error('[GetAllReservations] Ha ocurrido un error en el servidor durante la obtención de las reservas.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    createReservation = async (req: AuthenticatedRequest, res: Response) => {
        const { body: { reservation, intentId }, userId } = req;
        if (!reservation) {
            logger.error('[CreateReservation] No se ha recibido la reserva.');
            return res.status(400).json({ message: 'No se ha recibido la reserva.' });
        }
        if (!intentId) {
            logger.error('[CreateReservation] No se ha recibido el intentId.');
            return res.status(400).json({ message: 'No se ha recibido el intentId.' });
        }
        try {
            await this.reservationService.createReservation(reservation, intentId, userId);
            // this.emailService.sendConfirmReservationEmail(reservation);
            socket.emit('reservation', req.body);
            res.status(200).json({ mesagge: "Reserva creada correctamente" });
        } catch (error) {
            logger.error('[CreateReservation] Ha ocurrido un error en el servidor durante la creación de la reserva.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    cancelReservation = async (req: AuthenticatedRequest, res: Response) => {
        const { params: { id }, userId } = req;
        try {
            await this.reservationService.cancelReservation(id, userId);
            socket.emit('update', req.body);
            res.status(200).json({ mesagge: "Reserva cancelada correctamente" });
        } catch (error) {
            logger.error('[CancelReservation] Ha ocurrido un error en el servidor durante la cancelación de la reserva.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}