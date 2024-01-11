import { Request, Response } from "express";
import { logger } from "../utils/logger";
import EventService from "@services/eventService";

export default class EventController {
    private eventService: EventService;

    constructor(eventService?: EventService) {
        this.eventService = eventService || new EventService();
    }

    getOneEvent = async (req: Request, res: Response) => {
        try {
            const event = await this.eventService.getOneEvent(req.params.id)
            res.status(200).json(event);
        } catch (error) {
            logger.error("[GetOneEvent] Ha ocurrido un error en el servidor durante la obtencion los datos del evento:", req.params.id, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getParticipants = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const participants = await this.eventService.getParticipants(id);
            res.status(200).json(participants);
        } catch (error) {
            logger.error('[GetParticipantsByEventId] Ha ocurrido un error en el servidor durante la obtención de los participantes.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getWorkerEvents = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const events = await this.eventService.getWorkerEvents(id);
            res.status(200).json(events);
        } catch (error) {
            logger.error('[GetWorkerEvents] Ha ocurrido un error en el servidor durante la obtención de los eventos.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteEvents = async (req: Request, res: Response) => {
        const { params:{id}, body } = req;
        try {
            await this.eventService.deleteEvents(id,body);
            res.status(200).json({ message: 'Eventos eliminados correctamente.' });
        } catch (error) {
            logger.error('[DeleteEvents] Ha ocurrido un error en el servidor durante la eliminación de los eventos.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}
