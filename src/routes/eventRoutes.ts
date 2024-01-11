import EventController from '@controllers/eventController';
import express from 'express';

const router = express.Router();
const eventController = new EventController();

router
    .get("/:id", eventController.getOneEvent)
    .get("/:id/participants", eventController.getParticipants)
    .get("/list/:id", eventController.getWorkerEvents)
    .delete("/:id/recurrence", eventController.deleteEvents)

export default router