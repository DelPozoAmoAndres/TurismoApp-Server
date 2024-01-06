import { Response, Request } from "express"
import { logger } from "@utils/logger"
import AdminActivityService from "@services/adminActivityService"

export default class AdminActivityController {
    private adminActivityService: AdminActivityService;

    constructor(adminActivityService?: AdminActivityService) {
        this.adminActivityService = adminActivityService || new AdminActivityService();
    }

    addActivity = async (req: Request, res: Response) => {
        const { name, location, duration, description, accesibility, petsPermited, state, images } = req.body;
        if (!name || !location || !duration || !description || !accesibility || !petsPermited || !state || !images) {
            logger.error("[AddActivity] Faltan algunos datos obligatorios de la nueva actividad");
            return res.status(400).json({ message: 'Faltan algunos datos obligatorios de la nueva actividad' })
        }

        const newActivity : any = {
            name,
            location,
            duration,
            description,
            accesibility,
            petsPermited,
            state,
            images
        }

        try {
            await this.adminActivityService.addActivity(newActivity)
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
            return res.status(200).json({ message: 'Se han realizado correctamente los cambios' })
        } catch (error) {
            logger.error("[EditActivity] Ha ocurrido un error en el servidor durante la edición de una actividad", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteActivity = async (req: Request, res: Response) => {
        try {
            await this.adminActivityService.deleteActivity(req.params.id);
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
        if (repeatInfo && repeatInfo.repeatType == "days" && repeatInfo.repeatDays.length == 0) {
            logger.error("[AddEvent] Falta especificar los dias que se va a repetir el evento");
            return res.status(400).json({ message: 'Falta especificar los dias que se va a repetir el evento' });
        }
        if (repeatInfo && repeatInfo.repeatType == "range") {
            if (!repeatInfo.repeatStartDate || new Date(repeatInfo.repeatStartDate) < new Date() || !repeatInfo.repeatEndDate || new Date(repeatInfo.repeatEndDate) < new Date()) {
                logger.error("[AddEvent] Falta especificar un rango de fechas valido para el evento");
                return res.status(400).json({ message: 'Falta especificar un rango de fechas valido para el evento' });
            }
            else if (repeatInfo.repeatDays.length == 0 || repeatInfo.repeatDays.length > 7) {
                logger.error("[AddEvent] Faltan especificar los dias de la semanFaltan especificar los dias de la semana que se va a repetir el eventoa que se va a repetir el evento");
                return res.status(400).json({ message: '' });
            }
        }

        const { language, price, seats, guide, date } = event;
        let events: any = [];

        switch (repeatInfo?.repeatType) {
            case "days": {
                const days: string[] = repeatInfo.repeatDays
                const time = repeatInfo.time.split(":")
                days.forEach((day) => {
                    let date = new Date(day);
                    date.setHours(time[0], time[1])
                    events.push({ seats, date, price, language, guide })
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
                        events.push({ seats, date, price, language, guide })
                    }
                    currDate.setDate(currDate.getDate() + 1);
                }
                break;
            }
            default:
                events.push({ seats, date, price, language, guide })
        }

        try {
            await this.adminActivityService.addEvents(id, events);
            return res.status(200).json({ message: 'Eventos añadidos con exito' });
        } catch (error) {
            logger.error("[AddEvent] Ha ocurrido un error en el servidor durante la creación de un evento", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteReview = async (req: Request, res: Response) => {
        const { params: { activityId, reviewId } } = req

        try {
            await this.adminActivityService.deleteReview(activityId, reviewId)
            res.status(200).json({ message: 'Comentario eliminado con exito' });
        } catch (error) {
            logger.error("[DeleteReview] Ha ocurrido un error en el servidor durante la eliminación de un comentario", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}