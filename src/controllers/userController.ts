import { Response } from 'express';
import { AuthenticatedRequest } from '@customTypes/autenticatedRequest';
import { logger } from '@utils/logger';
import { User } from '@customTypes/user';
import UserService from '@services/userService';
import { socket } from '@app';

export default class UserController {

    private userService: UserService;

    constructor(userService?: UserService) {
        this.userService = userService || new UserService();
    }

    getOneUser = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user: User = await this.userService.getOneUser(req.userId)
            logger.info("[GetOneUser] Obtención exitosa de los datos del usuario:", req.userId)
            res.status(200).json(user);
        } catch (error) {
            logger.error("[GetOneUser] Ha ocurrido un error en el servidor durante la obtención de datos del usuario:", req.userId, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    updateUser = async (req: AuthenticatedRequest, res: Response) => {
        try {
            await this.userService.updateUser(req.userId,req.body)
            logger.info("[UpdateUser] Actualización exitosa de los datos del usuario:", req.userId)
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario actualizado' })
        } catch (error) {
            logger.error("[UpdateUser] Ha ocurrido un error en el servidor durante la actualizacón de los datos del usuario:", req.userId, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    changePassword = async (req: AuthenticatedRequest, res: Response) => {
        const { oldPass, newPass } = req.body;
        if (!oldPass || !newPass) {
            logger.error('[ChangePassword] No se han enviado todos los parámetros necesarios');
            return res.status(400).json({ message: 'No se han enviado todos los parámetros necesarios' });
        }
        try {
            await this.userService.changePassword(req.userId, oldPass, newPass)
            logger.info("[ChangePassword] Actualización exitosa de la contraseña del usuario:", req.userId);
            res.status(200).json({ message: 'Contraseña actualizada' })
        } catch (error) {
            logger.error("[ChangePassword] Ha ocurrido un error en el servidor durante el cambio de contraseña del usuario:", req.userId, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteUser = async (req: AuthenticatedRequest, res: Response) => {
        try {
            await this.userService.deleteUser(req.userId)
            logger.info("[DeleteUser] Eliminación exitosa del usuario:", req.userId);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario eliminado' })
        } catch (error) {
            logger.error("[DeleteUser] Ha ocurrido un error en el servidor durante la eliminación del usuario:", req.userId, error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}