import { Request, Response } from "express";
import { logger } from "../utils/logger";
import ActivityService from "@services/activityService";

export default class ActivityController {
    private activityService: ActivityService;

    constructor(activityService?: ActivityService) {
        this.activityService = activityService || new ActivityService();
    }

    getAllActivities = async (req: Request, res: Response) => {
        const { query } = req

        if (query.precio && !Number.isSafeInteger(query.precio)) {
            logger.error("[GetAllActivities] Filtro de precio con formato incorrecto:", req.query.precio);
            return res.status(400).json({ message: 'Filtro de precio con formato incorrecto' });

        }
        if (query.duration && !Number.isSafeInteger(query.duration)) {
            logger.error("[GetAllActivities] Filtro de duración con formato incorrecto:", req.query.duración);
            return res.status(400).json({ message: 'Filtro de duración con formato incorrecto' });
        }

        try {
            const activities = await this.activityService.getAllActivities(query);
            res.status(200).json(activities);
        } catch (error) {
            logger.error("[GetAllActivities] Ha ocurrido un error en el servidor durante la obtencion de las actividades", error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getOneActivity = async (req: Request, res: Response) => {
        try {
            const activity = await this.activityService.getOneActivity(req.params.id)
            res.status(200).json(activity);
        } catch (error) {
            logger.error("[GetOneActivity] Ha ocurrido un error en el servidor durante la obtencion los datos de la actividad:", req.params.id, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getEvents = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const events = await this.activityService.getEvents(id);
            res.status(200).json(events);
        } catch (error) {
            logger.error('[GetEventsByActivityId] Ha ocurrido un error en el servidor durante la obtención de los eventos.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}