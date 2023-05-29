const app = require("./app")

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server=app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});