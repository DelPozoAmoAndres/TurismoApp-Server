jest.mock("@models/userSchema");
import UserSchema from "@models/userSchema";
const mockedUser = UserSchema as jest.Mocked<typeof UserSchema>;

jest.mock("@models/activitySchema");
import ActivitySchema from "@models/activitySchema";
const mockedActivity = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        Types: {
            ObjectId: {
                isValid: jest.fn()
            }
        }
    };
});
import mongoose from 'mongoose';
const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

import ReviewService from "@services/reviewService";
import { Review } from "@customTypes/review";

describe('Get reviews from reservation', () => {

    let reviewService: ReviewService;
    const activity = {
        _id: '123',
        reviews: [
            {
                _id: '456',
                score: 5,
                comment: 'Great!',
                author: '789',
                reservationId: '101'
            }
        ]
    }

    const user = {
        name: 'John Doe',
    }

    const review = {
        _id: activity.reviews[0]._id,
        score: activity.reviews[0].score,
        comment: activity.reviews[0].comment,
        author: activity.reviews[0].author,
        authorName: user.name,
        authorImage: '',
        activityId: activity._id,
        reservationId: activity.reviews[0].reservationId
    }

    beforeEach(() => {
        reviewService = new ReviewService();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('when the reservationId is valid', () => {
            beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue(activity);
            mockedUser.findById = jest.fn().mockResolvedValue(user);
        });

        test('should return the review', async () => {
            const result = await reviewService.getReviewFromReservation(activity.reviews[0].reservationId);
            expect(result).toEqual(review);
        });
    });            

    describe('when the reservationId is invalid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw a 400 error', async () => {
            await expect(reviewService.getReviewFromReservation('invalidId')).rejects.toEqual({
                status: 400,
                message: "El id de la reserva no es válido"
            });
        });
    });

    describe('when the reservation does not exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue(null);
        });

        test('should throw a 404 error', async () => {
            await expect(reviewService.getReviewFromReservation('101')).rejects.toEqual({
                status: 404,
                message: "No hay comentario asociado a esta reserva"
            });
        });
    });

    describe('when there is a default error', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue(activity);
            mockedUser.findById = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw a 404 error', async () => {
            await expect(reviewService.getReviewFromReservation('101')).rejects.toEqual({
                status: 500,
                message: "Error"
            });
        });
            
    });
});

describe('Add review', () => {
    
    let reviewService: ReviewService;

    const activity = {
        _id: '123',
    };

    const user ={
        _id: '789',
        name: 'John Doe',
    };

    const review = {
        score: 5,
        comment: 'Great!',
        reservationId: '101',
    }as unknown as Review;


    beforeEach(()=>{
        reviewService = new ReviewService();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('when the activityId exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue({...activity,validateSync: jest.fn(),save: jest.fn()});
        });

        test('should save the review', async () => {
            await reviewService.addReview('123', review, user._id);
        });
    });

    describe('when the activityId not exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue(null);
        });

        test('should throw a 404 error', async () => {
            await expect(reviewService.addReview('121213', review, user._id)).rejects.toEqual({
                status: 404,
                message: "La actividad no existe"
            });
        });
    });

    describe('when the activityId is invalid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw a 400 error', async () => {
            await expect(reviewService.addReview('invalidId', review, '789')).rejects.toEqual({
                status: 400,
                message: "El id de la actividad no es válido"
            });
        });
    });

    describe('when the review is invalid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue({...activity,validateSync: jest.fn().mockReturnValue(new Error('Error'))});
        });

        test('should throw a 400 error', async () => {
            await expect(reviewService.addReview('123', review, '789')).rejects.toEqual({
                status: 400,
                message: "El comentario no es válido"
            });
        });
    });

    describe('when there is a default error', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw a 500 error', async () => {
            await expect(reviewService.addReview('123', review, '789')).rejects.toEqual({
                status: 500,
                message: "Error"
            });
        });
    });
});

describe('Edit review', () => {
    
    let reviewService: ReviewService;

    const review = {
        score: 5,
        comment: 'Great!',
        reservationId: '101',
    }as unknown as Review;

    const activity = {
        _id: '123',
        reviews:[review]
    };

    const user ={
        _id: '789',
        name: 'John Doe',
    };

    beforeEach(()=>{
        reviewService = new ReviewService();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('when the reviewId exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue({...activity,save: jest.fn()});
        });

        test('should save the review', async () => {
            await reviewService.editReview(review._id, review, '789');
        });
    });

    describe('when the reviewId is invalid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw a 400 error', async () => {
            await expect(reviewService.editReview('invalidId', review, '789')).rejects.toEqual({
                status: 400,
                message: "El id del comentario no es válido"
            });
        });
    });

    describe('when the review does not exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue(null);
        });

        test('should throw a 404 error', async () => {
            await expect(reviewService.editReview('123', review, '789')).rejects.toEqual({
                status: 404,
                message: "El comentario no existe"
            });
        });
    });

    describe('when there is a default error', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw a 500 error', async () => {
            await expect(reviewService.editReview('123', review, '789')).rejects.toEqual({
                status: 500,
                message: "Error"
            });
        });
    });
});

describe('Delete review', () => {
    
    let reviewService: ReviewService;

    const user ={
        _id: '789',
        name: 'John Doe',
    };

    const review = {
        score: 5,
        comment: 'Great!',
        reservationId: '101',
        author: user._id
    }as unknown as Review;

    const activity = {
        _id: '123',
        reviews:[review]
    };

    

    beforeEach(()=>{
        reviewService = new ReviewService();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('when the reviewId exist and the user is the author', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue({...activity,save: jest.fn()});
        });

        test('should delete the review', async () => {
            await reviewService.deleteReview(review._id, user._id);
        });
    });

    describe('when the reviewId is invalid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw a 400 error', async () => {
            await expect(reviewService.deleteReview('invalidId', user._id)).rejects.toEqual({
                status: 400,
                message: "El id del comentario no es válido"
            });
        });
    });

    describe('when the review does not exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findOne = jest.fn().mockResolvedValue(null);
        });

        test('should throw a 404 error', async () => {
            await expect(reviewService.deleteReview('123', user._id)).rejects.toEqual({
                status: 404,
                message: "El comentario no existe"
            });
        });
    });
});
