import express from "express";
import AdminUserController from "@controllers/adminUserController";
const router = express.Router();

const adminUserController = new AdminUserController();
router
    .post('/', adminUserController.addUser)
    .get('/workers', adminUserController.getWorkers)
    .get('/list', adminUserController.getAllUsers)
    .get('/:id', adminUserController.getOneUser)
    .delete('/:id', adminUserController.deleteUser)
    .put('/:id', adminUserController.editUser)
    .get('/:id/reservation/list', adminUserController.getUserReservations)
    .get('/reservation/list', adminUserController.getAllReservations)
    

export default router