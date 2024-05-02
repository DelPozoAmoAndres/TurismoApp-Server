import { Response, Request } from "express"
import { logger } from "@utils/logger"
import AdminActivityService from "@services/adminActivityService"
import EventService from "@services/eventService";
import { socket } from "@app";

export default class AdminActivityController {
    private adminActivityService: AdminActivityService;
    private eventService: EventService;

    constructor(adminActivityService?: AdminActivityService, eventService?: EventService) {
        this.adminActivityService = adminActivityService || new AdminActivityService();
        this.eventService = eventService || new EventService();
    }

    addActivity = async (req: Request, res: Response) => {
        const { name, location, duration, description, state, images, category } = req.body;
        if (!name || !location || !duration || !description || !state || !images) {
            logger.error("[AddActivity] Faltan algunos datos obligatorios de la nueva actividad");
            return res.status(400).json({ message: 'Faltan algunos datos obligatorios de la nueva actividad' })
        }

        const newActivity : any = {
            name,
            location,
            duration,
            description,
            state,
            category,
            images
        }

        try {
            await this.adminActivityService.addActivity(newActivity)
            socket.emit('update', req.body);
            return res.status(200).json({ message: "Se ha creado correctamente la actividad" })
        } catch (error) {
            logger.error("[AddActivity] Ha ocurrido un error en el servidor durante la creación de una actividad", error);
            return res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    editActivity = async (req: Request, res: Response) => {
        const { body, params: { id } } = req

        if (Object.keys(body).length === 0) {
            logger.error("[EditActivity] Faltan los cambios a aplicar");
            return res.status(400).json({ message: 'Faltan los cambios a aplicar' });
        }

        try {
            await this.adminActivityService.editActivity(id, body);
            socket.emit('update', req.body);
            return res.status(200).json({ message: 'Se han realizado correctamente los cambios' })
        } catch (error) {
            logger.error("[EditActivity] Ha ocurrido un error en el servidor durante la edición de una actividad", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteActivity = async (req: Request, res: Response) => {
        try {
            await this.adminActivityService.deleteActivity(req.params.id);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Se ha eliminado correctamente la acticividad: ' + req.params.id })
        } catch (error) {
            logger.error("[DeleteActivity] Ha ocurrido un error en el servidor durante la eliminación de una actividad", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    addEvents = async (req: Request, res: Response) => {
        const { body: { event, repeatInfo }, params: { id } } = req
        if (!event || !event.language || !event.price || !event.guide || !event.seats) {
            logger.error("[AddEvent] Faltan los datos del evento a añadir");
            return res.status(400).json({ message: 'Faltan los datos del evento a añadir' });
        }
        if (!event.date && (!repeatInfo || !repeatInfo.repeatType || !repeatInfo.time || !repeatInfo.repeatDays)) {
            logger.error("[AddEvent] Falta la fecha o el rango de fechas del evento");
            return res.status(400).json({ message: 'Falta la fecha o rango de fechas del evento' });
        }
        if (repeatInfo && repeatInfo.repeatType == "range") {
            if (!repeatInfo.repeatStartDate || new Date(repeatInfo.repeatStartDate) < new Date() || !repeatInfo.repeatEndDate || new Date(repeatInfo.repeatEndDate) < new Date()) {
                logger.error("[AddEvent] Falta especificar un rango de fechas valido para el evento");
                return res.status(400).json({ message: 'Falta especificar un rango de fechas valido para el evento' });
            }
            else if (repeatInfo.repeatDays.length == 0 || repeatInfo.repeatDays.length > 7) {
                logger.error("[AddEvent] Faltan especificar los dias de la semana que se va a repetir el evento");
                return res.status(400).json({ message: '' });
            }
        }

        const { language, price, seats, guide, date,bookedSeats } = event;
        let events: any = [];

        switch (repeatInfo?.repeatType) {
            case "days": {
                const days: string[] = repeatInfo.repeatDays
                const time = repeatInfo.time.split(":")
                days.forEach((day) => {
                    let date = new Date(day);
                    date.setHours(time[0], time[1])
                    events.push({ seats, date, price, language, guide,bookedSeats })
                })
                break;
            }
            case "range": {
                const currDate = new Date(repeatInfo.repeatStartDate);
                const lastDate = new Date(repeatInfo.repeatEndDate);
                const time = repeatInfo.time.split(":")
                while (currDate <= lastDate) {
                    if (repeatInfo.repeatDays.includes(currDate.getDay())) {
                        let date = new Date(currDate);
                        date.setHours(time[0], time[1])
                        events.push({ seats, date, price, language, guide,bookedSeats })
                    }
                    currDate.setDate(currDate.getDate() + 1);
                }
                break;
            }
            default:
                events.push({ seats, date, price, language, guide, bookedSeats })
        }

        try {
            await this.adminActivityService.addEvents(id, events);
            socket.emit('update', req.body);
            return res.status(200).json({ message: 'Eventos añadidos con exito' });
        } catch (error) {
            logger.error("[AddEvent] Ha ocurrido un error en el servidor durante la creación de un evento", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getEvents = async (req: Request, res: Response) => {
        const { query: { search, filters } } = req
        try {
            const events = await this.eventService.getEvents(search as string, filters as Record<string, unknown>)
            res.status(200).json(events);
        } catch (error) {
            logger.error("[GetEvents] Ha ocurrido un error en el servidor durante la obtención de los eventos", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteReview = async (req: Request, res: Response) => {
        const { params: { activityId, reviewId } } = req

        try {
            await this.adminActivityService.deleteReview(activityId, reviewId)
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Comentario eliminado con exito' });
        } catch (error) {
            logger.error("[DeleteReview] Ha ocurrido un error en el servidor durante la eliminación de un comentario", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getAllActivities = async (req: Request, res: Response) => {
        const { query } = req;
        try {
            const activities = await this.adminActivityService.getAllActivities(query);
            res.status(200).json(activities);
        } catch (error) {
            logger.error('[GetAllActivities] Ha ocurrido un error en el servidor durante la búsqueda de las actividades', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}