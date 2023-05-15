import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

require('dotenv').config();

const glob = require('glob');
const path = require('path');


import users from './routes/users';
import admins from './routes/admins';
import activities from './routes/activities';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//Database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión a MongoDB establecida.');
}).catch((error: Error) => {
    console.error('Error al conectar a MongoDB:', error);
});

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        info: {
            title: 'API ASTOUR',
            version: '1.0.0',
            description: 'API para recibir dar recursos a la aplicación movil y web',
        },
        servers: [
            {
                url: 'http://localhost:'+process.env.PORT,
                description: 'Development server'
            }
        ],
    },
    apis: glob.sync(path.join(__dirname, 'routes/*.ts')), // Rutas a documentar
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api', users);
app.use('/api/admin', admins);
app.use('/api', activities);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});