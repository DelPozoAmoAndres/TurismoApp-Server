import mongoose, { QueryOptions } from "mongoose";
import Activity from "@models/activitySchema";

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
                }:{},
                queryOptions.duration && Number.isSafeInteger(queryOptions.duration) ? { duration: { $lt: Number(queryOptions.duration) * 60 } }:{},
                queryOptions.petsPermited ? { petsPermited: queryOptions.petsPermited }:{},
                queryOptions.state ? { state: queryOptions.state }:{}
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
            activities.forEach(activity => {activity.events =activity?.events?.filter(event => new Date(event.date) >= new Date());});
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
                
            activity.events = activity?.events?.filter(event => new Date(event.date) >= new Date()) || [];

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
            const activity = await Activity.findById(activityId, {
                events: { $elemMatch: { date: { $gte: new Date() } } },
              }).exec();
        if (!activity)
            throw {
                status: 404,
                message: "No se ha encontrado la actividad"
            }
        const events = activity.events
        if (!events || events.length === 0)
            throw {
                status: 404,
                message: "No hay eventos para esta actividad"
            }
        return events
    }
}