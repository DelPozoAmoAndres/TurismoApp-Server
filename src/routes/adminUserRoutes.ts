import express from "express";
import AdminUserController from "@controllers/adminUserController";
const router = express.Router();

const adminUserController = new AdminUserController();
router
    .post('/', adminUserController.addUser)
    .get('/list', adminUserController.getAllUsers)
    .get('/:id', adminUserController.getOneUser)
    .delete('/:id', adminUserController.deleteUser)
    .put('/:id', adminUserController.editUser)
    .get('/:userId/reservation/list', adminUserController.getUserReservations)

export default router