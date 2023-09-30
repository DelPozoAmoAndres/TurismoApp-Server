import request, { Response } from 'supertest';
import app from '@app';

jest.mock('@services/reviewService');
import ReviewService from '@services/reviewService';
const mockedReservationService = ReviewService as jest.Mocked<typeof ReviewService>;

jest.mock('@services/tokenService');
import TokenService from '@services/tokenService';
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

const baseUrl = '/api/reviews';

describe('GET /activity/:id/reviews', () => {
    const url = baseUrl + '/activity/1/reviews';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockResolvedValue(true);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('when the activity exists', () => {
        const reviews = [{ name: "test" }];
        beforeAll(() => {
            mockedReservationService.prototype.getAllReviewsByActivityId = jest.fn().mockResolvedValue(reviews);
        });

        test('should respond with 200 status code and the list of reviews', async () => {
            const response = await request(app).get(url);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(reviews);
        });
    });

    describe('when the reviewService throws a default error', () => {
        beforeAll(() => {
            mockedReservationService.prototype.getAllReviewsByActivityId = jest.fn().mockRejectedValue(new Error());
        });

        test('should respond with 500 status code and the error message', async () => {
            const response = await request(app).get(url);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the reviewService throws a custom error', () => {
        const error = { status: 400, message: 'Custom error' }
        beforeAll(() => {
            mockedReservationService.prototype.getAllReviewsByActivityId = jest.fn().mockRejectedValue(error);
        });

        test('should respond with the status code of the custom error', async () => {
            const response = await request(app).get(url);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Custom error' });
        });
    });
});

describe('POST /activity/:id/review', () => {
    const url = baseUrl + '/activity/1/review';
    const review = { name: "test" };

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockResolvedValue('1');
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('when the review is added successfully', () => {
        beforeAll(() => {
            mockedReservationService.prototype.addReview = jest.fn();
        });

        test('should respond with 200 status code and the message', async () => {
            const response = await request(app).post(url).send({ review });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Review añadida correctamente" });
        });
    });

    describe('when the review is missing', () => {
        test('should responf with 400 status code and the error message', async () => {
            const response = await request(app).post(url);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'No se ha recibido la review.' });
        });
    });

    describe('when the reviewService throws a default error', () => {
        beforeAll(() => {
            mockedReservationService.prototype.addReview = jest.fn().mockRejectedValue(new Error());
        });

        test('should respond with 500 status code and the error message', async () => {
            const response = await request(app).post(url).send({ review });
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the reviewService throws a custom error', () => {
        const error = { status: 400, message: 'Custom error' }
        beforeAll(() => {
            mockedReservationService.prototype.addReview = jest.fn().mockRejectedValue(error);
        });

        test('should respond with the status code of the custom error', async () => {
            const response = await request(app).post(url).send({ review });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Custom error' });
        });
    });
});

describe('DELETE /activity/:id/review/:id', () => {
    const url = baseUrl + '/activity/1/review/1';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockResolvedValue('1');
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('when the review is deleted successfully', () => {
        beforeAll(() => {
            mockedReservationService.prototype.deleteReview = jest.fn();
        });

        test('should respond with 200 status code and the message', async () => {
            const response = await request(app).delete(url);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Review eliminada correctamente" });
        });
    });

    describe('when the reviewService throws a default error', () => {
        beforeAll(() => {
            mockedReservationService.prototype.deleteReview = jest.fn().mockRejectedValue(new Error());
        });

        test('should respond with 500 status code and the error message', async () => {
            const response = await request(app).delete(url);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the reviewService throws a custom error', () => {
        const error = { status: 400, message: 'Custom error' }
        beforeAll(() => {
            mockedReservationService.prototype.deleteReview = jest.fn().mockRejectedValue(error);
        });

        test('should respond with the status code of the custom error', async () => {
            const response = await request(app).delete(url);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Custom error' });
        });
    });
});