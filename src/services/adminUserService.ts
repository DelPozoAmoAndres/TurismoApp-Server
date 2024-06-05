import UserScheme from "@models/userSchema";
import { Role, User } from "@customTypes/user";
import mongoose, { QueryOptions, get } from "mongoose";
import { ReservationDoc } from "@customTypes/reservation";
import ReservationService from "@services/reservationService"
import ActivitySchema from "@models/activitySchema";
import { ActivityDoc } from "@customTypes/activity";
import { Event } from "@customTypes/event";
import EventService from "./eventService";

export default class AdminUserService {
    private eventService: EventService;

    constructor(eventService?: EventService) {
        this.eventService = eventService || new EventService();
    }

    addUser = async (newUser: User) => {
        try {
            const user = await UserScheme.findOne({ email: newUser.email });
            if (user)
                throw {
                    status: 400,
                    message: "El email ya está registrado"
                }
            if (!Object.values(Role).includes(newUser.role))
                throw {
                    status: 400,
                    message: "Role incorrecto"
                }
            const userCreated = new UserScheme(newUser);
            return await userCreated.save();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getAllUsers = async (queryOptions: QueryOptions) => {
        let query: QueryOptions = {};

        try {
            if (queryOptions.searchString) {
                query = {
                    $or: [
                        { name: { $regex: queryOptions.searchString, $options: 'i' } }, // Buscar en la propiedad "name"
                        { email: { $regex: queryOptions.searchString, $options: 'i' } },// Buscar en la propiedad "email"
                    ]
                };
            }

            if (mongoose.isValidObjectId(queryOptions.searchString)) {
                query.$or.push({ _id: new mongoose.Types.ObjectId(queryOptions.searchString) });
            }

        } catch (error) {
            throw {
                status: 400,
                message: 'Error al aplicar filtros'
            }
        }

        const projection = {
            password: 0,
            __v: 0,
        };

        try {
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const users = await UserScheme.find(query, projection);
            if (!users || users.length === 0)
                throw {
                    status: 404,
                    message: 'No se encontraron usuarios'
                }
            return users;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getOneUser = async (userId: string) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const user = await UserScheme.findById(userId)
            if (!user)
                throw {
                    status: 404,
                    message: 'No se encontraron los datos del usuario'
                }
            return user
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    deleteUser = async (userId: string) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const userDeleted = await UserScheme.deleteOne({ _id: userId })
            if (!userDeleted)
                throw {
                    status: 404,
                    message: 'Usuario no encontrado'
                }
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    editUser = async (userId: string, changes: Record<string, unknown>) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const userUpdated = await UserScheme.findByIdAndUpdate(userId, changes, { new: true, runValidators: true })
            if (!userUpdated)
                throw {
                    status: 404,
                    message: 'Usuario no encontrado'
                }
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getWorkers = async (queryOptions: QueryOptions) => {
        const MARGIN_BETWEEN_EVENTS = 2;
        try {
            let { repeatType, repeatDays, repeatStartDate, repeatEndDate, time, date } = queryOptions;
            if (!repeatType && !date
                || repeatType == "days" && !repeatDays
                || repeatType == "range" && (!repeatDays || !repeatStartDate || !repeatEndDate)) {
                throw {
                    status: 400,
                    message: "Faltan parámetros"
                }
            }
            const workers = await UserScheme.find({ role: Role.guía });
            if (!workers)
                throw {
                    status: 404,
                    message: 'No se encontraron guias disponibles'
                }

            if (date) {
                date = date.replace("%3A", ":");
            }
            if (time) {
                time = time.replace("%3A", ":");
            }
            if (repeatType == "days") {
                repeatDays = repeatDays.split(',')
            }

            let result: User[] = [];
            for (const worker of workers) {
                const events: Event[] = await this.eventService.getWorkerEvents(worker._id);
                let workerIsAvailable = true;
                // Comprobar contra eventos existentes
                for (const event of events) {
                    const activity = await ActivitySchema.findOne({ "events._id": event.id });
                    const eventStartTime = new Date(event.date);
                    const eventEndTime = new Date(eventStartTime.getTime() + activity.duration * 60000);
                    console.log(eventStartTime, eventEndTime, event)

                    if (repeatType == "none" && date) {
                        const proposedStartTime = new Date(date);
                        proposedStartTime.setHours(proposedStartTime.getHours() - MARGIN_BETWEEN_EVENTS);
                        const proposedEndTime = new Date(proposedStartTime.getTime() + activity.duration * 60000);
                        proposedEndTime.setHours(proposedEndTime.getHours() + MARGIN_BETWEEN_EVENTS);
                        console.log(proposedStartTime, eventStartTime);
                        if (!(eventEndTime < proposedStartTime || proposedEndTime < eventStartTime)) {
                            workerIsAvailable = false;
                            break;
                        }
                    } else if (repeatType === 'range' && time) {
                        let day = new Date(repeatStartDate);
                        while (day <= new Date(repeatEndDate)) {
                            const currentDay = new Date(day);
                            currentDay.setHours(time.split(':')[0], time.split(':')[1]);
                            const dayOfWeek = currentDay.getDay();
                            if (repeatDays.includes(dayOfWeek)) {
                                const proposedStartTime = currentDay;
                                proposedStartTime.setHours(proposedStartTime.getHours() - MARGIN_BETWEEN_EVENTS);
                                const proposedEndTime = new Date(proposedStartTime.getTime() + activity.duration * 60000);
                                proposedEndTime.setHours(proposedEndTime.getHours() + MARGIN_BETWEEN_EVENTS);
                                if (!(eventEndTime < proposedStartTime || proposedEndTime < eventStartTime)) {
                                    workerIsAvailable = false;
                                    break;
                                }
                            }
                            day.setDate(day.getDate() + 1);
                        }
                    } else if (repeatType === 'days' && time) {
                        for (const day of repeatDays) {
                            let proposedStartTime = new Date(day);
                            proposedStartTime.setHours(time.split(':')[0], time.split(':')[1]);
                            proposedStartTime.setHours(proposedStartTime.getHours() - MARGIN_BETWEEN_EVENTS);
                            const proposedEndTime = new Date(proposedStartTime.getTime() + activity.duration * 60000);
                            proposedEndTime.setHours(proposedEndTime.getHours() + MARGIN_BETWEEN_EVENTS);

                            if (!(eventEndTime < proposedStartTime || proposedEndTime < eventStartTime)) {
                                workerIsAvailable = false;
                                break;
                            }
                        }
                    }
                }
                if (workerIsAvailable) {
                    result.push(worker);
                }
            };
            return result;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}