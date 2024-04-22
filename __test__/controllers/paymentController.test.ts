import { Response } from 'express'; 
import request from 'supertest';
import app from '@app'; 

jest.mock('@services/tokenService');
import TokenService from '@services/tokenService';
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

jest.mock('@services/stripeService'); // Asumiendo que quieras simular este también
import StripeService from '@services/stripeService';
const mockedPaymentService = StripeService as jest.Mocked<typeof StripeService>;

const baseUrl = '/api/payment';

describe('POST /intent', () => {
    const url = `${baseUrl}/intent`

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
    });

    describe('when the request is successful', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.createIntent = jest.fn().mockResolvedValue({ id: '123', client_secret: '123' })
        });

        test('should return 200 and the payment intent', async () => {
            const response = await request(app)
                .post(url)
                .send({ price: 100 })
                .set('Origin', 'http://localhost:3000')
            expect(mockedPaymentService.prototype.createIntent).toHaveBeenCalledWith(100);
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('paymentIntent.id', '123')
        });
    });

    describe('when the paymentService throws a default error', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.createIntent = jest.fn().mockRejectedValue(new Error('Error'))
        });

        test('should return 500 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ price: 100 })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Error' })
        });

    });

    describe('when the paymentService throws a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedPaymentService.prototype.createIntent = jest.fn().mockRejectedValue(error);
        });

        test('should return 400 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ price: 100 })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });

    });
});

describe('POST /confirm', () => {
    const url = `${baseUrl}/confirm`

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
    });

    describe('when the request is successful', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.confirmIntent = jest.fn().mockResolvedValue({ id: '123', status: 'succeeded' })
        });

        test('should return 200 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentIntentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(mockedPaymentService.prototype.confirmIntent).toHaveBeenCalledWith('123');
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ message: 'Pago confirmado correctamente' })
        });
    });

    describe('when the paymentService throws a default error', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.confirmIntent = jest.fn().mockRejectedValue(new Error('Error'))
        });

        test('should return 500 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentIntentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Error' })
        });

    });

    describe('when the paymentService throws a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedPaymentService.prototype.confirmIntent = jest.fn().mockRejectedValue(error);
        });

        test('should return 400 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentIntentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });

    });
});

describe('POST /verify', () => {
    const url = `${baseUrl}/verify`

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
    });

    describe('when the request is successful', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.verifyStatus = jest.fn().mockResolvedValue({ status: 'succeeded' })
        });

        test('should return 200 and the payment status', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(mockedPaymentService.prototype.verifyStatus).toHaveBeenCalledWith('123');
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ status: 'succeeded' })
        });
    });

    describe('when the paymentService throws a default error', () => {

        beforeAll(() => {
            mockedPaymentService.prototype.verifyStatus = jest.fn().mockRejectedValue(new Error('Error'))
        });

        test('should return 500 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Error' })
        });

    });

    describe('when the paymentService throws a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedPaymentService.prototype.verifyStatus = jest.fn().mockRejectedValue(error);
        });

        test('should return 400 and a message', async () => {
            const response = await request(app)
                .post(url)
                .send({ paymentId: '123' })
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });

    });
});