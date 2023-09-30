import express from 'express';
import ReviewController from '@controllers/reviewController';

const router = express.Router();
const reviewController = new ReviewController();

router
    .get('/activity/:id/reviews', reviewController.getAllReviewsByActivityId)
    .post('/activity/:id/review', reviewController.addReview)
    .delete('/activity/:id/review/:id', reviewController.deleteReview)

export default router;