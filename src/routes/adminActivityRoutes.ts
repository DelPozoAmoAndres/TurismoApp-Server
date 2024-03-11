import express from "express";
import AdminActivityController from "@controllers/adminActivityController";

const router = express.Router();
const adminActivityController = new AdminActivityController();

router
    .post('/',adminActivityController.addActivity)
    .put('/:id',adminActivityController.editActivity) 
    .delete('/:id',adminActivityController.deleteActivity)
    .post('/:id/events',adminActivityController.addEvents) 
    .delete('/:activityId/review/:reviewId',adminActivityController.deleteReview)
    .get('/event/list',adminActivityController.getEvents)
    .get('/list',adminActivityController.getAllActivities)

export default router