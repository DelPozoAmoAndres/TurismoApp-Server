// //Alias de los modelos en dist
if (__filename.endsWith('.js')) {
    require('module-alias/register');
}

import app,{server,socket} from "@app";
import { Socket } from "engine.io";
const {logger}  = require("@utils/logger");

//Database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    logger.info('Conexión a MongoDB establecida.');
}).catch((error: Error) => {
    logger.error('Error al conectar a MongoDB:', error);
});

socket.on('connection', (socket) => {
    logger.info('Usuario conectado');
    socket.on('disconnect', () => {
        logger.info('Usuario desconectado');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Servidor iniciado en el puerto ${PORT}`);
});

export default app;