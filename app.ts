import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from "socket.io";

import { authMiddleware } from './src/middlewares/authMiddleware';
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
import dashboard from '@routes/dashboardRoutes';
// import emailRoutes from '@routes/emailRoutes';
import { Role } from '@customTypes/user';

import swagger from './swagger.json'
import { logger } from '@utils/logger';

const app = express();

// Logger middleware
app.use(loggerMiddleware);

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

const allowedOrigins = ['https://astour.pozito.dev/'];
const allowedOriginFunc = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.') || allowedOrigins.includes(origin))) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'), false);
    }
};

app.use(cors());

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = swagger;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Connected to the server');
});

// Middleware para manejo de errores
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

// Rutas
// app.use('/email', emailRoutes);
app.use('/api', authRoutes);
app.use('/api/user', authMiddleware(Role.turista), userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events', authMiddleware(Role.guía), eventRoutes);
app.use('/api/admin/activity', authMiddleware(Role.administrador), adminActivityRoutes);
app.use('/api/admin1/user', authMiddleware(Role.administrador), adminUserRoutes);
app.use('/api/reservations', authMiddleware(Role.turista), reservations);
app.use('/api/reviews', authMiddleware(Role.turista), reviews);
app.use('/api/payment', authMiddleware(Role.turista), payments);
app.use('/api/dashboard', authMiddleware(Role.administrador), dashboard);

export const server = http.createServer(app);
export const socket = new Server(server, {
    cors: {
        origin: allowedOriginFunc,
        methods: ["GET", "POST", "DELETE", "PUT"],
    },
    allowEIO3: true
});


export default app;