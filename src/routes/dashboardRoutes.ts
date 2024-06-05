import express from "express";
import DashboardController from "@controllers/dashboardController";

const router = express.Router();
const dashboardController = new DashboardController();

router
    .get('/totalReservations', dashboardController.getConfirmedReservations)
    .get('/totalIncome', dashboardController.getTotalIncome)
    .get('/occupation', dashboardController.getOccupation)
    .get('/totalUsers', dashboardController.getTotalUsers)
    .get('/cancelationRate', dashboardController.getCancelationRate)
    .get('/categoryReservations', dashboardController.getCategoryReservationss)
    .get('/resume', dashboardController.getResume)
    .get('/reservations', dashboardController.getReservations)

export default router