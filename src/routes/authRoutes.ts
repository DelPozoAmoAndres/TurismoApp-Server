import express from 'express';
const router = express.Router();
import AuthController from '@controllers/authController';

const authController = new AuthController();

router
    .post('/login', authController.login)
    .post('/register', authController.register)

export default router;
