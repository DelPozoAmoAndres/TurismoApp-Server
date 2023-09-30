import mongoose from "mongoose"
import { ReservationDoc } from "@customTypes/reservation";
import User from "@models/userSchema";
import StripeService  from "@services/stripeService"
import { ActivityDoc } from "@customTypes/activity";
import Activity from "@models/activitySchema";
import PaymentService from "./paymentService";


export default class ReservationService {
    private paymentService: PaymentService;

    constructor(paymentService?: PaymentService) {
        this.paymentService = paymentService || new StripeService();
    }

    getOneReservation = async (reservationId: string, userId: string) => {
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw { status: 400, message: 'El id del usuario no es válido.' };
        if (!mongoose.Types.ObjectId.isValid(reservationId))
            throw { status: 400, message: 'El id de la reserva no es válido.' };
        try {
            const user = await User.findOne(
                { _id: userId, 'reservations._id': reservationId },
                { 'reservations.$': 1 })

            if (!user || !user.reservations || user.reservations.length == 0) {
                throw {
                    status: 404,
                    message: 'La reserva no existe.'
                };
            }
            return await this.formatData(user.reservations[0]);
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            };
        }
    }

    getAllReservations = async (userId: string) => {
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw { status: 400, message: 'El id del usuario no es válido.' };
        try {
            const user = await User.findById(userId);
            if (!user || !user.reservations || user.reservations.length == 0) {
                throw {
                    status: 404,
                    message: 'El usuario no tiene reservas'
                };
            }
            const result = await Promise.all(user.reservations.map(async (reservation) => {
                return await this.formatData(reservation);
            }));
            result.sort((a, b) => a.event.date.getTime() - b.event.date.getTime());

            return await this.groupReservations(result)

        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            };
        }
    }

    createReservation = async (reservation: ReservationDoc, intentId: string, userId: string,) => {
        try {
            const user = await User.findById(userId);
            reservation.paymentId = intentId;
            user.reservations ? user.reservations.push(reservation) : user.reservations = [reservation];
            if (user.validateSync())
                throw {
                    status: 400,
                    message: 'Error al registrar la reserva'
                };
            await user.save();
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            };
        }
    }

    cancelReservation = async (reservationId: string, userId: string) => {
        if (!mongoose.Types.ObjectId.isValid(reservationId))
            throw { status: 400, message: 'El id de la reserva no es válido.' };
        try {
            const user = await User.findOne(
                { _id: userId, 'reservations._id': reservationId },
                { 'reservations.$': 1 })

            if (!user || !user.reservations || user.reservations.length == 0) {
                throw {
                    status: 404,
                    message: 'La reserva no existe.'
                };
            }
            const reservation = user.reservations[0]
            if (reservation.state == 'canceled')
                throw {
                    status: 400,
                    message: 'La reserva ya ha sido cancelada.'
                };
            await this.paymentService.cancelPayment(reservation.paymentId)
            await user.save();
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            };
        }
    }

    private formatData = async (reservation: ReservationDoc) => {
        const { eventId }: ReservationDoc = reservation; // Desestructurar y crear una copia independiente de reservation
        let reservationMap: any = JSON.parse(JSON.stringify(reservation))
        delete reservationMap.eventId;
        let activity: ActivityDoc = await Activity.findOne({ "events._id": eventId });
        reservationMap.event = activity?.events?.find((event) => event.id == eventId)
        const status = await this.paymentService.verifyStatus(reservationMap.paymentId);
        if (reservationMap.event.date < new Date() && status == "success")
            reservationMap.state = "completed"
        else
            reservationMap.state = status
        let activityFinal = activity.toJSON()
        delete activityFinal.events
        reservationMap.activity = activityFinal
        return reservationMap;
    }
    
    private groupReservations = async (reservations:any) => {
        const reservationGroups: any[] = [];
        let currentGroup: any = null;
    
        // Agrupar las reservas por fecha con una diferencia máxima de 5 días
        reservations.forEach((reservation: any) => {
            if (!currentGroup || Math.abs(reservation.event.date.getTime() - currentGroup.dateTo.getTime()) > 3 * 24 * 60 * 60 * 1000) {
                // Crear un nuevo grupo
                currentGroup = {
                    dateFrom: reservation.event.date,
                    reservations: [reservation],
                };
                reservationGroups.push(currentGroup);
            } else {
                // Agregar la reserva al grupo actual
                currentGroup.reservations.push(reservation);
            }
            currentGroup.dateTo = reservation.event.date;
        });
        return reservationGroups;
    }
}
