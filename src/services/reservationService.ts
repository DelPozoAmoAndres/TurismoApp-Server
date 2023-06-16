import Activity, { ActivityDoc } from "../models/activity";
import User , {ReservationDoc} from "../models/user";
const { verifyStatus} = require("./stripeService")

const formatData = async (reservation: ReservationDoc) => {
    const { eventId }: ReservationDoc = reservation; // Desestructurar y crear una copia independiente de reservation
    let reservationMap: any = JSON.parse(JSON.stringify(reservation))
    delete reservationMap.eventId;
    let activity: ActivityDoc = await Activity.findOne({ "events._id": eventId });
    reservationMap.event = activity?.events?.find((event) => event.id == eventId)
    const status = await verifyStatus(reservationMap.paymentId);
    if (reservationMap.event.date < new Date() && status == "success")
        reservationMap.state = "completed"
    else
        reservationMap.state = status
    let activityFinal = activity.toJSON()
    delete activityFinal.events
    reservationMap.activity = activityFinal
    return reservationMap;
}

const groupReservations = async (reservations:any) => {
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

const getReservation = async (userId: string, reservationId: string) => {
    const user = await User.findOne(
        { _id: userId, 'reservations._id': reservationId},
        { 'reservations.$': 1 })
    if(!(user?.reservations?.length>0)){
        return null;
    }
    return user.reservations[0]
    
}

module.exports = { formatData,groupReservations, getReservation }