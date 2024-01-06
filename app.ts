import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import {authMiddleware} from './src/middleware/authMiddleware';
const { loggerMiddleware } = require('@utils/logger');

dotenv.config();

import authRoutes from '@routes/authRoutes'
import userRoutes from '@routes/userRoutes';
import activityRoutes from '@routes/activityRoutes';
import eventRoutes from '@routes/eventRoutes';
import adminActivityRoutes from '@routes/adminActivityRoutes';
import adminUserRoutes from '@routes/adminUserRoutes';
import reservations from '@routes/reservationRoutes';
import reviews from '@routes/reviewRoutes';
import payments from '@routes/paymentRoutes';
import { Role } from '@customTypes/user';

import swagger from './swagger.json'

const app = express();

// Logger middleware
app.use(loggerMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = swagger;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api', authRoutes);
app.use('/api/user', authMiddleware(Role.turista), userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events', authMiddleware(Role.guía), eventRoutes);
app.use('/api/admin/activity',authMiddleware(Role.administrador), adminActivityRoutes);
app.use('/api/admin1/user',authMiddleware(Role.administrador), adminUserRoutes);
app.use('/api/reservations',authMiddleware(Role.turista), reservations);
app.use('/api/reviews',authMiddleware(Role.turista), reviews);
app.use('/api/payment', authMiddleware(Role.turista),payments);

export default app;