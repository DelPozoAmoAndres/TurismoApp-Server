import mongoose from 'mongoose';
import ActivitySchema from '@models/activitySchema';
import UserSchema from '@models/userSchema';

export default class EventService {
    
    getOneEvent = async (eventId: string) => {
        if (!mongoose.Types.ObjectId.isValid(eventId))
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }

        let activity;
        try {
            activity = await ActivitySchema.find({ "events._id": eventId }, { "events.$": 1 });
            if (!activity || activity.length ==0  || !activity[0].events || activity[0].events.length == 0)
                throw {
                    status: 404,
                    message: 'Evento no encontrado'
                }
                
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        return activity[0].events[0];
    }

    getParticipants = async (eventId: string) => {
        if (!mongoose.Types.ObjectId.isValid(eventId) || await ActivitySchema.findOne({ "events._id": eventId })===null)
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }
        let participants;
        try {
            participants = await UserSchema.find({'reservations.eventId': eventId, 'reservations.state': 'success'});
            if (!participants)
                throw {
                    status: 404,
                    message: 'Evento no encontrado'
                }
                participants = participants.flatMap((participant: any) =>participant.reservations.filter((reservation: any) => reservation.eventId === eventId && reservation.state === 'success'));
                
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        return participants;
    }

    getWorkerEvents = async (workerId: string) => {
        if (!mongoose.Types.ObjectId.isValid(workerId))
            throw {
                status: 400,
                message: 'El identificador del trabajador no es válido'
            }

        let events;
        try {
            events = await ActivitySchema.find({ "events.guide": workerId });
            if (!events)
                throw {
                    status: 404,
                    message: 'No hay eventos para este trabajador'
                }
                
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        return events;
    }

}