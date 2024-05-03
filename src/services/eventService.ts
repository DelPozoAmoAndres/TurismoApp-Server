import mongoose from 'mongoose';
import ActivitySchema from '@models/activitySchema';
import { ActivityDoc } from '@customTypes/activity';
import UserSchema from '@models/userSchema';
import { RecurrentEventDeleteRequest } from '@customTypes/RecurrentEventDeleteRequest';
import { Event } from '@customTypes/event';
import e from 'express';
import ReservationService from './reservationService';

export default class EventService {
    private reservationService: ReservationService;

    constructor(reservationService?: ReservationService) {
        this.reservationService = reservationService || new ReservationService();
    }

    getOneEvent = async (eventId: string) => {
        if (!mongoose.Types.ObjectId.isValid(eventId))
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }

        let activity;
        try {
            activity = await ActivitySchema.find({ "events._id": eventId }, { "events.$": 1 });
            if (!activity || activity.length == 0 || !activity[0].events || activity[0].events.length == 0)
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
        if (!mongoose.Types.ObjectId.isValid(eventId) || await ActivitySchema.findOne({ "events._id": eventId }) === null)
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }
        let participants;
        try {
            participants = await UserSchema.find({ 'reservations.eventId': eventId, 'reservations.state': 'success' });
            if (!participants)
                throw {
                    status: 404,
                    message: 'Evento no encontrado'
                }
            participants = participants.flatMap((participant: any) => participant.reservations.filter((reservation: any) => reservation.eventId === eventId && reservation.state === 'success'));

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
            //devolver solo aquellos eventos cuando el trabajador es el guía
            events = await ActivitySchema.find({ "events.guide": workerId })
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
        return events.flatMap((event: any) => event.events.filter((e: Event) => e.guide === workerId.toString() && e.state !== "cancelled"));
    }

    getEvents = async (search: string, filters: Record<string, unknown>) => {
        let activities;
        try {
            activities = await ActivitySchema.find({ "events": { $exists: true, $not: { $size: 0 }, $elemMatch: { state: { $ne: "cancelled" } } } });
            if (!activities)
                throw {
                    status: 404,
                    message: 'No hay eventos'
                }

        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        return activities.flatMap((event: any) => event.events.filter((e: any) => e.state !== "cancelled"));
    }

    deleteEvents = async (eventId: string, body: RecurrentEventDeleteRequest) => {
        if (!mongoose.Types.ObjectId.isValid(eventId))
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }

        try {
            const startDate = new Date(body.startDate)
            startDate.setHours(1, 0, 0, 0);

            const endDate = new Date(body.endDate)
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);

            await ActivitySchema.findOne({ "events._id": eventId })
                .then(async (activity: ActivityDoc) => {
                    let targetEvent = activity.events.find((event) => event.id == eventId);
                    let eventsToDelete = body.recurrenceDays.length > 0 ? activity.events.filter(
                        (event: Event) =>
                            event.guide == targetEvent.guide
                            && new Date(event.date) >= startDate
                            && new Date(event.date) <= endDate
                            && new Date(event.date).getHours() === new Date(targetEvent.date).getHours()
                            && new Date(event.date).getMinutes() === new Date(targetEvent.date).getMinutes()
                            && body.recurrenceDays.includes(new Date(event.date).getDay())
                    ) : [targetEvent];
                    await UserSchema.find({ 'reservations.eventId': { $in: eventsToDelete.map((event: Event) => event.id) }, 'reservations.state': 'success' }).
                        then(async (users) => {
                            users.forEach(async (user) => {
                                user.reservations
                                    .filter((reservation: any) => eventsToDelete.map((event: Event) => event.id).includes(reservation.eventId))
                                    .forEach((reservation: any) => { this.reservationService.cancelReservation(reservation._id, user._id) });
                                await user.save();
                            });
                        });
                    await ActivitySchema.updateMany(
                        { "events._id": { $in: eventsToDelete.map(event => event.id) } },
                        { $set: { "events.$.state": "cancelled" } }
                    );
                });
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    updateEvent = async (eventId: string, body: Event) => {
        if (!mongoose.Types.ObjectId.isValid(eventId))
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }

        try {
            ActivitySchema.findOne({ "events._id": eventId })
                .then(async (activity: ActivityDoc) => {
                    const targetEvent = activity.events.find((event) => event.id == eventId);
                    if (!targetEvent)
                        throw {
                            status: 404,
                            message: 'Evento no encontrado'
                        }

                    targetEvent.guide = body.guide || targetEvent.guide;
                    targetEvent.seats = body.seats || targetEvent.seats;
                    console.log(targetEvent);
                    await ActivitySchema.updateOne(
                        { "events._id": eventId },
                        { $set: { "events.$": targetEvent } }
                    );
                });
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

}