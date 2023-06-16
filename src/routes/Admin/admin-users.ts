import express, { Request, Response } from 'express';
import User, { ReservationDoc, Role } from '../../models/user';
import mongoose from 'mongoose';
const { adminCheck } = require('../../services/tokenService');
const { formatData, groupReservations } = require("../../services/reservationService")

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            const { name, email, password, role, telephone, country, birthday } = req.body;
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
                role,
                telephone,
                country,
                birthday
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
            const user = await User.findOne({ _id: req.query.id });
            if (user)
                res.status(200).json(user);
            else {
                res.status(404).json({ message: 'Usuario no encontrado.' })
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

router.delete('/user', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            if (req.query.id && !mongoose.Types.ObjectId.isValid(String(req.query.id))) {
                res.status(404).json({ message: 'Usuario no encontrado.' });
                return;
            }
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const user = await User.findOneAndRemove({ _id: req.query.id });
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

router.put('/edit/user', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            const { _id, ...user } = req.body;
            await User.findOneAndUpdate({ _id: req.body._id }, user, { new: true });
            res.status(200).json({ message: 'Usuario actualizado' })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

router.get('/reservations', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const user = await User.findById(req.query.userId);
            let reservations: ReservationDoc[] = user.reservations ? user.reservations : [];

            const result = await Promise.all(reservations.map(async (reservation) => {
                return await formatData(reservation);
            }));

            // Ordenar las reservas por fecha de forma ascendente
            result.sort((a, b) => a.event.date.getTime() - b.event.date.getTime());

            let reservationGroups = await groupReservations(result)

            res.status(200).json(reservationGroups);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    })
})

export default router;
