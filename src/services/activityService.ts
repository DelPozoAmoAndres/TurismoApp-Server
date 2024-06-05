import mongoose from "mongoose";
import Activity from "@models/activitySchema";
import { ActivityDoc } from "@customTypes/activity";
import User from "@models/userSchema";
import { Event } from "@customTypes/event";
import ActivitySchema from "@models/activitySchema";

interface QueryOptions {
    originDate?: string;
    endDate?: string;
    searchString?: string;
    price?: number;
    numPersons?: number;
    minScore?: number;
    language?: string;
}

interface MatchCondition {
    [key: string]: any;
}

interface Query {
    $or?: { [key: string]: any }[];
}

export default class ActivityService {

    getAllActivities = async (queryOptions: QueryOptions) => {
        try {
            const { originDate, endDate, searchString, price, numPersons, minScore, language } = queryOptions;
            let query: Query = {};
            let match: MatchCondition = {};

            // Filtro por fecha de evento
            match['events.date'] = { $gte: originDate ? new Date(originDate) : new Date() };

            if (endDate) {
                const date = new Date(endDate);
                date.setDate(date.getDate() + 1);
                match['events.date'] = { ...match['events.date'], $lte: date };
            }

            // Filtro por búsqueda en nombre, localización o descripción
            if (searchString) {
                query.$or = [
                    { name: { $regex: searchString, $options: 'i' } },
                    { location: { $regex: searchString, $options: 'i' } },
                ];
            }

            // // Filtro por precio máximo
            if (price) {
                match['events.price'] = { $lte: Number(price) };
            }

            // // Filtro por disponibilidad de asientos
            if (numPersons) {
                match['events.numPersons'] = { $gte: Number(numPersons) };
            }
            // Filtro por idioma
            if (language && language.length > 0) {
                match['events.language'] = { $in: language.split(",") };
            }

            if (minScore) {
                match['averageScore'] = { $gte: Number(minScore) };
            }

            // Agregar el agregado para calcular la valoración media y filtrar
            const pipeline = [
                { $match: query },
                {
                    $addFields: {
                        events: {
                            $map: {
                                input: "$events",
                                as: "event",
                                in: {
                                    $mergeObjects: [
                                        "$$event",
                                        {
                                            numPersons: {
                                                $subtract: ["$$event.seats", "$$event.bookedSeats"]
                                            }
                                        }]
                                }
                            }
                        }
                    }
                },
                { $unwind: '$events' },
                {
                    $addFields: {
                        averageScore: { $avg: "$reviews.score" },
                    }
                },
                { $match: match },
                { $group: { _id: '$_id', root: { $mergeObjects: '$$ROOT' }, events: { $push: '$events' } } },
                { $replaceRoot: { newRoot: { $mergeObjects: ['$root', '$$ROOT'] } } },
                { $project: { root: 0 } }
            ];

            return await Activity.aggregate(pipeline);
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getOneActivity = async (activityId: string) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: 'El identificador de la actividad no es válido'
            }

        let activity;
        try {
            activity = await Activity.findById(activityId);

            if (!activity)
                throw {
                    status: 404,
                    message: 'Actividad no encontrada'
                }
            activity.events = activity?.events?.filter(event => new Date(event.date) >= new Date() && event.state != "cancelled") || [];
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }



        return activity
    }

    getActivityFromEvent = async (eventId: string) => {
        if (!mongoose.Types.ObjectId.isValid(eventId))
            throw {
                status: 400,
                message: 'El identificador del evento no es válido'
            }

        let activity;
        try {
            activity = await Activity.findOne({ "events._id": eventId });

            if (!activity)
                throw {
                    status: 404,
                    message: 'Evento no encontrado'
                }

            activity.events = activity?.events?.filter(event => new Date(event.date) >= new Date() && event.state != "cancelled") || [];

        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        return activity
    }

    getEvents = async (activityId: string) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: "El id de la actividad no es válido"
            }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Asegúrate de que la comparación comience desde el inicio del día actual

        const activity: ActivityDoc[] = await Activity.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(activityId) } },
            { $unwind: "$events" },
            { $match: { "events.date": { $gte: today } } },
            { $group: { _id: "$_id", events: { $push: "$events" } } }
        ]).exec();

        if (!activity || activity.length == 0)
            throw {
                status: 404,
                message: "No se ha encontrado la actividad"
            }
        const events = activity[0].events.filter((event) => event.state !== "cancelled");
        if (!events || events.length === 0)
            throw {
                status: 404,
                message: "No hay eventos para esta actividad"
            }
        return events
    }

    getAllReviewsByActivityId = async (activityId: string) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: "El id de la actividad no es válido"
            }
        try {
            const activity = await Activity.findById(activityId);
            if (!activity.reviews || activity.reviews.length === 0)
                throw {
                    status: 404,
                    message: "No hay comentarios para esta actividad"
                }

            const updatedReviews = await Promise.all(activity.reviews.map(async (review) => {
                const user = await User.findById(review.author);
                const { score, comment, author, _id } = review;
                return {
                    _id,
                    score,
                    comment,
                    author,
                    authorName: user.name,
                    authorImage: '',
                    activityId: activity._id,
                    reservationId: review.reservationId
                }
            }))
            return updatedReviews;
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getMaxPrice = async () => {
        try {
            const maxPrice = await Activity.aggregate([
                { $unwind: "$events" },
                { $match: { "events.state": { $ne: "cancelled" } } },
                { $group: { _id: null, maxPrice: { $max: "$events.price" } } }
            ]).exec();
            return maxPrice[0].maxPrice;
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getPopular = async () => {
        console.log("POPULARES")
        try {
            const popular = await Activity.aggregate([
                { $unwind: "$events" },
                { $match: { "events.state": { $ne: "cancelled" } } },
                {
                    $group: {
                        _id: "$_id",
                        popularity: { $sum: { $subtract: ["$events.seats", "$events.bookedSeats"] } },
                        activity: { $first: "$$ROOT" },
                        events: { $push: "$events" } // Push events into an array
                    }
                },
                { $sort: { popularity: -1 } },
                { $limit: 5 },
                { $replaceRoot: { newRoot: { $mergeObjects: ["$activity", { events: "$events" }] } } }, // Merge event and activity
            ]).exec();
            let result = popular.map(activity => { activity.events = activity.events.filter((event: Event) => event.date >= new Date() && event.state !== "cancelled" && (event.bookedSeats === undefined || event.seats > event.bookedSeats)); return activity; });
            result = result.filter((activity: ActivityDoc) => activity.events.length > 0);
            return result;
        } catch (error) {
            throw {
                status: error.status || 500,
                message: error.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}