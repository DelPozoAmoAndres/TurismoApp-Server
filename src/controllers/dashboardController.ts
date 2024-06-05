import { Response, Request } from "express";
import { logger } from "@utils/logger";
import DashboardService from "@services/dashboardService";

export default class DashboardController {
    private dashboardService: DashboardService;

    constructor(dashboardService?: DashboardService) {
        this.dashboardService = dashboardService || new DashboardService();
    }

    getConfirmedReservations = async (req: Request, res: Response) => {
        try {
            const totalReservations = await this.dashboardService.getConfirmedReservations();
            res.status(200).json(totalReservations);
        } catch (error) {
            logger.error('[GetTotalReservations] Ha ocurrido un error en el servidor durante la obtención de las reservas.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getTotalIncome = async (req: Request, res: Response) => {
        try {
            const totalIncome = await this.dashboardService.getTotalIncome();
            res.status(200).json(totalIncome);
        } catch (error) {
            logger.error('[GetTotalIncome] Ha ocurrido un error en el servidor durante la obtención de los ingresos.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getOccupation = async (req: Request, res: Response) => {
        try {
            const ocupation = await this.dashboardService.getOccupation();
            res.status(200).json(ocupation);
        } catch (error) {
            logger.error('[GetOcupation] Ha ocurrido un error en el servidor durante la obtención de la ocupación.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getTotalUsers = async (req: Request, res: Response) => {
        try {
            const totalUsers = await this.dashboardService.getTotalUsers();
            res.status(200).json(totalUsers);
        } catch (error) {
            logger.error('[GetTotalUsers] Ha ocurrido un error en el servidor durante la obtención de los usuarios.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getCancelationRate = async (req: Request, res: Response) => {
        try {
            const cancelationRate = await this.dashboardService.getCancelationRate();
            res.status(200).json(cancelationRate);
        } catch (error) {
            logger.error('[GetCancelationRate] Ha ocurrido un error en el servidor durante la obtención de la tasa de cancelación.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getCategoryReservationss = async (req: Request, res: Response) => {
        try {
            const dailySales = await this.dashboardService.getCategoryReservations();
            res.status(200).json(dailySales);
        } catch (error) {
            logger.error('[GetDailySales] Ha ocurrido un error en el servidor durante la obtención de las ventas diarias.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getResume = async (req: Request, res: Response) => {
        try {
            const resume = {
                "totalReservations": await this.dashboardService.getConfirmedReservations(),
                "totalIncome": await this.dashboardService.getTotalIncome(),
                "occupationData": await this.dashboardService.getOccupation(),
                "totalUsers": await this.dashboardService.getTotalUsers(),
                "cancelationData": await this.dashboardService.getCancelationRate(),
                "categoryReservations": await this.dashboardService.getCategoryReservations()
            }
            res.status(200).json(resume);
        } catch (error) {
            logger.error('[GetResume] Ha ocurrido un error en el servidor durante la obtención del resumen.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    getReservations = async (req: Request, res: Response) => {
        try {
            const reservations = await this.dashboardService.getReservations();
            res.status(200).json(reservations);
        } catch (error) {
            logger.error('[GetReservations] Ha ocurrido un error en el servidor durante la obtención de las reservas.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}