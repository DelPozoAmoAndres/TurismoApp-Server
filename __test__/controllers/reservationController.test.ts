import request, { Response } from 'supertest';
import app from '@app'

jest.mock('@services/reservationService')
import ReservationService from '@services/reservationService'
const mockedReservationService = ReservationService as jest.Mocked<typeof ReservationService>

jest.mock('@services/tokenService')
import TokenService from '@services/tokenService'
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>

const baseUrl = '/api/reservations'

describe('GET /:id', () => {
    const url = baseUrl + '/1'
    
    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when reservation exists', () => {
        const reservation = {
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }

        beforeAll(() => {
            mockedReservationService.prototype.getOneReservation = jest.fn().mockResolvedValue(reservation)
        });

        test('should respond with status 200 and the reservation', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(reservation)
        });
    });

    describe(('when reservationService throws a default error'), () => {
        beforeAll(() => {
            mockedReservationService.prototype.getOneReservation = jest.fn().mockRejectedValue(new Error())
        });

        test('should respond with status 500 and a generic message', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe(('when reservationService throws a custom error'), () => {
        const error = {status: 400, message: 'Test error'}
        beforeAll(() => {
            mockedReservationService.prototype.getOneReservation = jest.fn().mockRejectedValue(error)
        });

        test('should respond with the status code of the custom error', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });

});

describe('GET /list', () => {
    const url= baseUrl + '/list'

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when the reservationService works correctly', () => {
        const reservations = [{
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }]
        beforeAll(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockResolvedValue(reservations)
        });

        test('should respond with status 200 and the reservations', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(reservations)
        });
    });

    describe(('when reservationService throws a default error'), () => {
        beforeAll(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockRejectedValue(new Error())
        });

        test('should respond with status 500 and a generic message', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe(('when reservationService throws a custom error'), () => {
        const error = {status: 400, message: 'Test error'}
        beforeAll(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockRejectedValue(error)
        });

        test('should respond with the status code of the custom error', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000') 
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });
});

describe('POST /', () => {
    const url = baseUrl + '/'

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when the creation of the reservation works correctly', () => {
        const reservation = {
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        const intentId = '1'
        const body = { reservation, intentId }

        beforeAll(() => {
            mockedReservationService.prototype.createReservation = jest.fn().mockResolvedValue(undefined)
        });

        test('should respond with status 200 and a message', async () => {
            const response : Response = await request(app).post(url)
                .send(body)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ mesagge: "Reserva creada correctamente" })
        });
    });

    describe(('when reservation is missing'), () => {
        const intentId = '1'
        const body = { intentId }

        test('should respond with status 400 and a message', async () => {
            const response : Response = await request(app).post(url)
                .send(body)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(400)
            expect(response.body).toEqual({ message: 'No se ha recibido la reserva.' })
        });
    });

    describe(('when intentId is missing'), () => {
        const reservation = {
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        const body = { reservation }

        test('should respond with status 400 and a message', async () => {
            const response : Response = await request(app).post(url)
                .send(body)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(400)
            expect(response.body).toEqual({ message: 'No se ha recibido el intentId.' })
        });
    });

    describe(('when reservationService throws a default error'), () => {
        const reservation = {
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        const intentId = '1'
        const body = { reservation, intentId }

        beforeAll(() => {
            mockedReservationService.prototype.createReservation = jest.fn().mockRejectedValue(new Error())
        });

        test('should respond with status 500 and a generic message', async () => {
            const response : Response = await request(app).post(url)
                .send(body)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe(('when reservationService throws a custom error'), () => {
        const error = {status: 400, message: 'Test error'}
        const reservation = {
            id: 1,
            userId: 1,
            restaurantId: 1,
            reservationDate: new Date().toDateString(),
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        const intentId = '1'
        const body = { reservation, intentId }

        beforeAll(() => {
            mockedReservationService.prototype.createReservation = jest.fn().mockRejectedValue(error)
        });

        test('should respond with the status code of the custom error', async () => {
            const response : Response = await request(app).post(url)
                .send(body)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });
});

describe('PUT /:id', () => {
    const url=  baseUrl + '/1'

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe("when the cancellation of the reservation works correctly", () => {
        beforeAll(() => {
            mockedReservationService.prototype.cancelReservation = jest.fn().mockResolvedValue(undefined)
        });

        test('should respond with status 200 and a message', async () => {
            const response : Response = await request(app).put(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ mesagge: "Reserva cancelada correctamente" })
        });
    });

    describe('when reservationService throws a default error', () => {
        beforeAll(() => {
            mockedReservationService.prototype.cancelReservation = jest.fn().mockRejectedValue(new Error())
        });

        test('should respond with status 500 and a generic message', async () => {
            const response : Response = await request(app).put(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe('when reservationService throws a custom error', () => {
        const error = {status: 400, message: 'Test error'}
        beforeAll(() => {
            mockedReservationService.prototype.cancelReservation = jest.fn().mockRejectedValue(error)
        });

        test('should respond with the status code of the custom error', async () => {
            const response : Response = await request(app).put(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });

});