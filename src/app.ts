import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import {authMiddleware} from './middleware/authMiddleware';
// import { loggerMiddleware } from '@utils/logger';

dotenv.config();

import authRoutes from '@routes/authRoutes'
import userRoutes from '@routes/userRoutes';
import activityRoutes from '@routes/activityRoutes';
import adminActivityRoutes from '@routes/adminActivityRoutes';
import adminUserRoutes from '@routes/adminUserRoutes';
import reservations from '@routes/reservationRoutes';
import reviews from '@routes/reviewRoutes';
import { Role } from '@customTypes/user';

const app = express();

// Logger middleware
// app.use(loggerMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger2.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api', authRoutes);
app.use('/api/user', authMiddleware(Role.turista), userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin/activity',authMiddleware(Role.administrador), adminActivityRoutes);
app.use('/api/admin1/user',authMiddleware(Role.administrador), adminUserRoutes);
app.use('/api/reservations',authMiddleware(Role.turista), reservations);
app.use('/api/reviews',authMiddleware(Role.turista), reviews);
// app.use('/api', payments);
// app.use('/api', reservations);

export default app;