import express from 'express';
const router = express.Router();
import UserController from '@controllers/userController';

const userController = new UserController();

router
    .get('/', userController.getOneUser)
    .put('/edit', userController.updateUser)
    .put('/edit/password', userController.changePassword)

export default router;
