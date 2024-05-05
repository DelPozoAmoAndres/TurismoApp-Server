import EmailService from "@services/emailService";
import { logger } from "@utils/logger";
import { Request, Response } from "express";

export default class EmailController {

    private emailService: EmailService;

    constructor(emailService?: EmailService) {
        this.emailService = emailService || new EmailService();
    }

    getAuth = async (req: Request, res: Response) => {
        try {
            const authURL = this.emailService.getAuth();
            res.redirect(authURL);
        } catch (error) {
            logger.error('[GetAuth] Ha ocurrido un error en el servidor durante la obtención de la autenticación.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }

    setToken = async (req: Request, res: Response) => {
        try {
            const { code } = req.query;
            await this.emailService.setToken(String(code));
            res.status(200).json({ message: 'Token guardado correctamente' });
        } catch (error) {
            logger.error('[SetToken] Ha ocurrido un error en el servidor durante el guardado del token.', error);
            res.status(error?.status || 500).json({ message: error?.message || 'Ha habido un error en el servidor.' });
        }
    }
}