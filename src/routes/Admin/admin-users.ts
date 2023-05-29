import express, { Request, Response } from 'express';
import User, { Role } from '../../models/user';
const { adminCheck } = require('../../services/tokenService');

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            const { name, email, password, role } = req.body;
            // Comprobar si el usuario ya existe
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'El email ya está registrado.' });
            }
            if (!Object.values(Role).includes(role)) {
                return res.status(400).json({ message: 'Role incorrecto' });
            }

            // Crear el usuario
            const newUser = new User({
                name,
                email,
                password,
                role
            });

            await newUser.save();
            res.status(200).json({ message: 'Usuario registrado correctamente.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

router.get('/users', async (req: Request, res: Response) => {

    adminCheck(req, res, async () => {
        try {
            // Construir la expresión de consulta para buscar usuarios que contengan la cadena de búsqueda en alguna propiedad
            const query = {
                $and: [
                    req.query.searchString ? {
                        $or: [
                            { name: { $regex: req.query.searchString, $options: 'i' } }, // Buscar en la propiedad "name"
                            { email: { $regex: req.query.searchString, $options: 'i' } },// Buscar en la propiedad "email"
                        ]
                    } : {},
                    req.query.country ? { country: { $regex: req.query.country, $options: 'i' } } : {}, // Buscar en la propiedad "country"
                    req.query.role ? { role: { $regex: req.query.role, $options: 'i' } } : {}, // Buscar en la propiedad "email"
                ],
            };

            // Excluir las propiedades
            const projection = {
                password: 0,
                __v: 0,
            };

            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const users = await User.find(query, projection);
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

router.get('/user', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {

            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const user = await User.findOne({ email: req.query.email });

            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

router.delete('/user', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const user = await User.findOneAndRemove({ email: req.query.email });
            if (user)
                res.status(200).json({ message: 'Usuario eliminado correctamente.' });
            else {
                res.status(404).json({ message: 'Usuario no encontrado.' })
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

export default router;
