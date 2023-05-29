import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User, { Role } from '../models/user';
const { getUserId } = require('../services/tokenService');

const router = express.Router();

const projection = {
    password: 0,
};

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // Si las credenciales son correctas, se genera el token JWT y se devuelve en la respuesta
        const token = jwt.sign({ userId: user.id, isAdmin: user.role === Role.administrador }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, ...optionalFields } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }
        // Crear el usuario
        let newUser: any = {
            name,
            email,
            password,
            role: Role.turista,
        };

        for (const field in optionalFields) {
            if (optionalFields.hasOwnProperty(field)) {
                newUser[field] = optionalFields[field];
            }
        }
        newUser = new User(newUser);
        await newUser.save();

        res.status(200).json({ message: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});
router.get('/user', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            const user = await User.findById(userId, projection)
            res.status(200).json({ user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    })
});
router.put('/edit/user', async (req: Request, res: Response) => {
    getUserId(req, res, async (userId: string) => {
        try {
            await User.findOneAndUpdate({ _id: userId }, req.body, { new: true });
            res.status(200).json({ message: 'Usuario actualizado' })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

export default router;
