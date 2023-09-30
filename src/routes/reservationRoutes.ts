import express from "express";
import ReservationController from "@controllers/reservationController";

const router = express.Router();
const reservationController = new ReservationController();

router
    .get('/list', reservationController.getAllReservations)
    .get('/:id', reservationController.getOneReservation)
    .post('/', reservationController.createReservation)
    .put('/:id', reservationController.cancelReservation)

export default router;