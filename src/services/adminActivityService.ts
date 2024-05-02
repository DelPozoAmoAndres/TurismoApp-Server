import mongoose, { QueryOptions } from "mongoose";
import { ActivityDoc } from "@customTypes/activity"
import { Event } from "@customTypes/event";
import { Review } from "@customTypes/review";
import { Role } from "@customTypes/user";
import ActivivityScheme from "@models/activitySchema";
import User from "@models/userSchema";
import ActivitySchema from "@models/activitySchema";

export default class AdminActivityService {
    addActivity = async (newActivity: ActivityDoc) => {
        try {
            const createdActivity = new ActivivityScheme(newActivity);
            const validationError = createdActivity.validateSync();
            if (validationError) {
                const missingProperties = Object.keys(validationError.errors).join(', ');
                throw {
                    status: 400,
                    message: `Error al registrar la actividad. Faltan datos requeridos: ${missingProperties}`
                };
            }

            return await createdActivity.save();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }

    }
    editActivity = async (activityId: string, changes: Record<string, unknown>) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: 'El id de la actividad es invalido'
            }
        try {
            const activityUpdated = await ActivivityScheme.findByIdAndUpdate(activityId, changes);
            if (!activityUpdated)
                throw {
                    status: 404,
                    message: 'Actividad no encontrada'
                }
            return activityUpdated;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    deleteActivity = async (activityId: string) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: 'El id de la actividad es invalido'
            }
        try {
            const activityDeleted = await ActivivityScheme.findByIdAndDelete(activityId);
            if (!activityDeleted) {
                throw {
                    status: 404,
                    message: 'Actividad no encontrada'
                }
            }
            return activityDeleted;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }

    }
    addEvents = async (activityId: string, newEvents: Event[]) => {
        if (!mongoose.Types.ObjectId.isValid(activityId))
            throw {
                status: 400,
                message: 'El id de la actividad es invalido'
            }

        try {
            const activity = await ActivivityScheme.findById(activityId);
            if (!activity) {
                throw {
                    status: 404,
                    message: 'Actividad no encontrada'
                }
            }

            const user = await User.findOne({ role: Role.guía, _id: newEvents[0].guide });
            if (!user)
                throw {
                    status: 404,
                    message: 'Usuario guía no encontrado'
                }

            let events: any[] = activity.events ? activity.events : [];
            activity.events = [...events, ...newEvents];
            return await activity.save()
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    deleteReview = async (activityId: string, reviewId: string) => {
        if(!mongoose.Types.ObjectId.isValid(activityId)){
            throw {
                status: 400,
                message: 'El id de la actividad es invalido'
            }
        }

        if(!mongoose.Types.ObjectId.isValid(reviewId)){
            throw {
                status: 400,
                message: 'El id de la review es invalido'
            }
        }
        try {
            const activity = await ActivivityScheme.findOneAndUpdate(
                { _id: activityId }, 
                { $pull: { reviews: { _id: reviewId } } },
                { new: true } 
            );
    
            if (!activity)
                throw {
                    status: 404,
                    message: 'Actividad no encontrada'
                }
            return await activity.save();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

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
        console.log(query)
        try {
            const activities = queryOptions.price && Number.isSafeInteger(queryOptions.price) ?
                await ActivitySchema.find(query)
                    .select('events')
                    .where('events.price')
                    .lt(queryOptions.price)
                :
                await ActivitySchema.find(query);
            return activities;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}