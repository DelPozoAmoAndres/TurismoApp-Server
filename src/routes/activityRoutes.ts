import express from 'express';
import ActivityController from '@controllers/activityController';

const router = express.Router();
const actitivityController = new ActivityController();

router
    .get("/list", actitivityController.getAllActivities)
    .get("/:id", actitivityController.getOneActivity)
    .get("/event/:id", actitivityController.getActivityFromEvent)
    .get("/:id/events", actitivityController.getEvents)
    .get('/:id/reviews', actitivityController.getAllReviewsByActivityId)

export default router
