import express from 'express';
import ReviewController from '@controllers/reviewController';

const router = express.Router();
const reviewController = new ReviewController();

router
    .post('/activity/:id', reviewController.addReview)
    .get('/reservation/:id', reviewController.getReviewFromReservation)
    .put('/:id', reviewController.editReview)
    .delete('/:id', reviewController.deleteReview)

export default router;