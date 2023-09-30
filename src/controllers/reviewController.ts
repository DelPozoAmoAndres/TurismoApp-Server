import { Request, Response } from 'express';
import { logger } from '@utils/logger';
import { AuthenticatedRequest } from "@customTypes/autenticatedRequest";
import ReviewService from '@services/reviewService';

export default class ReviewController {
    private reviewService;
    constructor(reviewService?: ReviewService){
        this.reviewService = reviewService || new ReviewService();
    }

    getAllReviewsByActivityId = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const updatedReviews = await this.reviewService.getAllReviewsByActivityId(id);
            res.status(200).json(updatedReviews);
        } catch (error) {
            logger.error(`[GetAllReviewsByActivityId] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }

    }
    addReview = async (req: AuthenticatedRequest, res: Response) => {
        const { body: { review }, userId, params: { id } } = req
        if (!review) {
            logger.error('[AddReview] No se ha recibido la review.')
            res.status(400).json({ message: 'No se ha recibido la review.' });
            return;
        }
        try {
            await this.reviewService.addReview(id, review, userId);
            res.status(200).json({ message: "Review añadida correctamente" });
        } catch (error) {
            logger.error(`[AddReview] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }
    deleteReview = async (req: AuthenticatedRequest, res: Response) => {
        const { userId, params: { id } } = req
        try {
            await this.reviewService.deleteReview(id.toString(), userId);
            res.status(200).json({ message: "Review eliminada correctamente" });
        } catch (error) {
            logger.error(`[DeleteReview] ${error.message}`)
            res.status(error.status || 500).json({ message: error.message || 'Ha habido un error en el servidor.' });
        }
    }
}