import { Request, Response } from 'express';
import { logger } from '@utils/logger';
import { AuthenticatedRequest } from "@customTypes/autenticatedRequest";
import ReviewService from '@services/reviewService';
import { socket } from '@app';

export default class ReviewController {
    private reviewService;
    constructor(reviewService?: ReviewService){
        this.reviewService = reviewService || new ReviewService();
    }

    getReviewFromReservation = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const review = await this.reviewService.getReviewFromReservation(id);
            res.status(200).json(review);
        } catch (error) {
            logger.error(`[GetReviewFromReservation] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }

    addReview = async (req: AuthenticatedRequest, res: Response) => {
        const { body, userId, params: { id } } = req
        if (!body || Object.keys(body).length === 0) {
            logger.error('[AddReview] No se ha recibido la review.')
            res.status(400).json({ message: 'No se ha recibido la review.' });
            return;
        }
        try {
            await this.reviewService.addReview(id, body, userId);
            socket.emit('update', req.body);
            res.status(200).json({ message: "Review añadida correctamente" });
        } catch (error) {
            logger.error(`[AddReview] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }

    editReview = async (req: AuthenticatedRequest, res: Response) => {
        const { body, params: { id }, userId } = req
        if (!body) {
            logger.error('[EditReview] No se ha recibido la review.')
            res.status(400).json({ message: 'No se ha recibido la review.' });
            return;
        }
        try {
            await this.reviewService.editReview(id, body, userId);
            socket.emit('update', req.body);
            res.status(200).json({ message: "Review editada correctamente" });
        } catch (error) {
            logger.error(`[EditReview] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }

    deleteReview = async (req: AuthenticatedRequest, res: Response) => {
        const { userId, params: { id } } = req
        try {
            await this.reviewService.deleteReview(id.toString(), userId);
            socket.emit('update', req.body);
            res.status(200).json({ message: "Review eliminada correctamente" });
        } catch (error) {
            logger.error(`[DeleteReview] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }
}