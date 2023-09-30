import express from 'express';
import ActivityController from '@controllers/activityController';

const router = express.Router();
const actitivityController = new ActivityController();

router
    .get("/list", actitivityController.getAllActivities)
    .get("/:id", actitivityController.getOneActivity)
    .get("/:id/events", actitivityController.getEvents)

export default router
