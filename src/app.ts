const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')


require('dotenv').config();

const glob = require('glob');
const path = require('path');

import users from './routes/users';
import activities from './routes/activities';
import reservations from './routes/reservations';
import adminUsers from './routes/Admin/admin-users';
import adminActivities from './routes/Admin/admin-activities';
import payments from './routes/payments';

const app = express();

import { loggerMiddleware } from './utils/logger';

// Middlewar
app.use(loggerMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api', users);
app.use('/api/admin', adminUsers);
app.use('/api/admin', adminActivities);
app.use('/api', activities);
app.use('/api', payments);
app.use('/api', reservations);


module.exports = app;