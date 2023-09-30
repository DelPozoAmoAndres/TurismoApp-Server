import app from "@app";
import { logger } from "@utils/logger";

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Servidor iniciado en el puerto ${PORT}`);
});