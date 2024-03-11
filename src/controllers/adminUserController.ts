import { Response, Request } from "express";
import { logger } from "@utils/logger";
import { socket } from "@app";

import AdminUserService from "@services/adminUserService";
import ReservationService from "@services/reservationService";

export default class AdminUserController {
    
    private adminUserService: AdminUserService;
    private reservationService: ReservationService;

    constructor(adminUserService?: AdminUserService, reservationService?: ReservationService) {
        this.adminUserService = adminUserService || new AdminUserService();
        this.reservationService = reservationService || new ReservationService();
    }

    addUser = async (req: Request, res: Response) => {
        const { name, email, password, role, ...optionalFields } = req.body;
        if (!email || !password || !name || !role) {
            logger.error('[AddUser] No se han enviado todos los parámetros necesarios');
            return res.status(400).json({ message: 'No se han enviado todos los parámetros necesarios' });
        }
        try {
            let newUser: any = {
                name,
                email,
                password,
                role,
            };

            for (const field in optionalFields) {
                if (optionalFields.hasOwnProperty(field)) {
                    newUser[field] = optionalFields[field];
                }
            }

            await this.adminUserService.addUser(newUser);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario registrado correctamente.' });
        } catch (error) {
            logger.error('[AddUser] Ha ocurrido un error en el servidor durante el creación de un nuevo usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }

    }
    getAllUsers = async (req: Request, res: Response) => {
        const { query } = req;
        try {
            const users = await this.adminUserService.getAllUsers(query);
            res.status(200).json(users);
        } catch (error) {
            logger.error('[GetAllUsers] Ha ocurrido un error en el servidor durante la búsqueda de usuarios', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }

    }
    getOneUser = async (req: Request, res: Response) => {
        const userId = req.params.id;
        try {
            const user = await this.adminUserService.getOneUser(userId);
            res.status(200).json(user);
        } catch (error) {
            logger.error('[GetOneUser] Ha ocurrido un error en el servidor durante la búsqueda de un usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    deleteUser = async (req: Request, res: Response) => {
        const userId = req.params.id;
        try {
            await this.adminUserService.deleteUser(userId);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario eliminado correctamente.' });
        } catch (error) {
            logger.error('[DeleteUser] Ha ocurrido un error en el servidor durante la eliminación de un usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    editUser = async (req: Request, res: Response) => {
        const userId = req.params.id;
        try {
            await this.adminUserService.editUser(userId, req.body);
            socket.emit('update', req.body);
            res.status(200).json({ message: 'Usuario editado correctamente.' });
        } catch (error) {
            logger.error('[EditUser] Ha ocurrido un error en el servidor durante la edición de un usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    getUserReservations = async (req: Request, res: Response) => {
        const { params: { id } } = req;
        try {
            const reservations = await this.reservationService.getAllReservations(id);
            res.status(200).json(reservations);
        } catch (error) {
            logger.error('[GetUserReservations] Ha ocurrido un error en el servidor durante la búsqueda de las reservas de un usuario', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getAllReservations = async (req: Request, res: Response) => {
        const { query } = req;
        try {
            const reservations = await this.reservationService.getAllReservationsAdmin();
            res.status(200).json(reservations);
        } catch (error) {
            logger.error('[GetAllReservations] Ha ocurrido un error en el servidor durante la búsqueda de las reservas', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
    getWorkers = async (req: Request, res: Response) => {
        const { query } = req;
        try {
            const workers = await this.adminUserService.getWorkers(query);
            res.status(200).json(workers);
        } catch (error) {
            logger.error('[GetWorkers] Ha ocurrido un error en el servidor durante la búsqueda de los trabajadores', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}
