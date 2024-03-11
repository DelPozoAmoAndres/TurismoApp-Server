import { Request, Response } from 'express';
import { Role } from '@customTypes/user';
import { logger } from '@utils/logger';
import AuthService from '@services/authService';
import { socket } from '@app';

export default class AuthController {
    private authService: AuthService;

    constructor(authService?: AuthService) {
        this.authService = authService||new AuthService();
    }

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!email || !password) {
            logger.error('[Login] No se han enviado todos los parámetros necesarios');
            return res.status(400).json({ message: 'No se han enviado todos los parámetros necesarios' });
        }
        try {
            const { token, user } = await this.authService.login(email, password);
            logger.info('[Login] Inicio de sesión exitoso del usuario:', user._id);
            res.status(200).json({ token, user });
        } catch (error) {
            logger.error('[Login] Ha ocurrido un error en el servidor durante el inicio de sesión.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    };

    register = async (req: Request, res: Response) => {
        const { name, email, password, ...optionalFields } = req.body;
        if (!email || !password || !name) {
            logger.error('[Register] No se han enviado todos los parámetros necesarios');
            return res.status(400).json({ message: 'No se han enviado todos los parámetros necesarios' });
        }
        try {
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

            await this.authService.register(newUser);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario registrado correctamente.' });
        } catch (error) {
            logger.error(error);
            logger.error('Ha ocurrido un error en el servidor durante el registro de usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    };
}