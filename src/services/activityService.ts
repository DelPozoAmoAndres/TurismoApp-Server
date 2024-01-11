import mongoose, { QueryOptions } from "mongoose";
import Activity from "@models/activitySchema";
import { ActivityDoc } from "@customTypes/activity";

export default class ActivityService {
    getAllActivities = async (queryOptions: QueryOptions) => {
        let query = {
            $and: [
                queryOptions.searchString ? {
                    $or: [
                        { name: { $regex: queryOptions.searchString, $options: 'i' } },
                        { description: { $regex: queryOptions.searchString, $options: 'i' } },
                        { location: { $regex: queryOptions.searchString, $options: 'i' } }
                    ]
                } : {},
                queryOptions.duration && Number.isSafeInteger(queryOptions.duration) ? { duration: { $lt: Number(queryOptions.duration) * 60 } } : {},
                queryOptions.petsPermited ? { petsPermited: queryOptions.petsPermited } : {},
                queryOptions.state ? { state: queryOptions.state } : {}
            ],
        };
        try {
            const activities = queryOptions.price && Number.isSafeInteger(queryOptions.price) ?
                await Activity.find(query)
                    .select('events')
                    .where('events.price')
                    .lt(queryOptions.price)
                :
                await Activity.find(query);
            activities.forEach(activity => { activity.events = activity?.events?.filter(event => new Date(event.date) >= new Date() && event.state!="cancelled"); });
            return activities
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

            activity.events = activity?.events?.filter(event => new Date(event.date) >= new Date() && event.state!="cancelled") || [];

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

        const activity : ActivityDoc[] = await Activity.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(activityId) } },
            { $unwind: "$events" },
            { $match: { "events.date": { $gte: today } } },
            { $group: { _id: "$_id", events: { $push: "$events" } } }
        ]).exec();

        console.log(activity[0]);

        if (!activity[0])
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
}