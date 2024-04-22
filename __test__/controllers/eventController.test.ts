import request, { Response } from 'supertest';
import app from '@app'

jest.mock('@services/eventService')
import EventService from '@services/eventService'
const mockedEventService = EventService as jest.Mocked<typeof EventService>

jest.mock('@services/tokenService')
import TokenService from '@services/tokenService'
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>

const baseUrl = '/api/events'

describe('GET /:id', () => {
    const url = `${baseUrl}/1`

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
    });

    afterAll(() => {
        jest.clearAllMocks()
    });

    describe('when the event exists', () => {

        beforeAll(() => {
            mockedEventService.prototype.getOneEvent = jest.fn().mockResolvedValue({ id: 1 })
        });

        test('should return the event', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({ id: 1 })
        });
    });

    describe('whem the eventService throws a default error', () => {
            
            beforeAll(() => {
                mockedEventService.prototype.getOneEvent = jest.fn().mockRejectedValue(new Error('Error'))
            });
    
            test('should return a 500 status code', async () => {
                const response = await request(app)
                    .get(url)
                    .set('Origin', 'http://localhost:3000')
    
                expect(response.status).toBe(500)
                expect(response.body).toEqual({ message: 'Error' })
            });
    });

    describe('whem the eventService throws a custom error', () => {
        const error = { status: 404, message: 'Event not found' }
        beforeAll(() => {
            mockedEventService.prototype.getOneEvent = jest.fn().mockRejectedValue(error)
        });

        test('should return a 404 status code', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000')

            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });
});

describe('GET /:id/participants', () => {
    const url = `${baseUrl}/1/participants`

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
    });

    afterAll(() => {
        jest.clearAllMocks()
    });

    describe('when the participants exists', () => {

        beforeAll(() => {
            mockedEventService.prototype.getParticipants = jest.fn().mockResolvedValue([{ id: 1 }])
        });

        test('should return the participants', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000')

            expect(response.status).toBe(200)
            expect(response.body).toEqual([{ id: 1 }])
        });
    });

    describe('whem the eventService throws a default error', () => {
            
            beforeAll(() => {
                mockedEventService.prototype.getParticipants = jest.fn().mockRejectedValue(new Error('Error'))
            });
    
            test('should return a 500 status code', async () => {
                const response = await request(app)
                    .get(url)
                    .set('Origin', 'http://localhost:3000')
    
                expect(response.status).toBe(500)
                expect(response.body).toEqual({ message: 'Error' })
            });
    });

    describe('whem the eventService throws a custom error', () => {
        const error = { status: 404, message: 'Participants not found' }
        beforeAll(() => {
            mockedEventService.prototype.getParticipants = jest.fn().mockRejectedValue(error)
        });

        test('should return a 404 status code', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000')

            expect(response.status).toBe(error.status)
            expect(response.body).toEqual({ message: error.message })
        });
    });

    describe('GET /list/:id', () => {
        const url = `${baseUrl}/list/1`

        beforeAll(() => {
            mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
        });

        afterAll(() => {
            jest.clearAllMocks()
        });

        describe('when the events exists', () => {

            beforeAll(() => {
                mockedEventService.prototype.getWorkerEvents = jest.fn().mockResolvedValue([{ id: 1 }])
            });

            test('should return the events', async () => {
                const response = await request(app)
                    .get(url)
                    .set('Origin', 'http://localhost:3000')

                expect(response.status).toBe(200)
                expect(response.body).toEqual([{ id: 1 }])
            });
        });

        describe('whem the eventService throws a default error', () => {
                
                beforeAll(() => {
                    mockedEventService.prototype.getWorkerEvents = jest.fn().mockRejectedValue(new Error('Error'))
                });
        
                test('should return a 500 status code', async () => {
                    const response = await request(app)
                        .get(url)
                        .set('Origin', 'http://localhost:3000')
        
                    expect(response.status).toBe(500)
                    expect(response.body).toEqual({ message: 'Error' })
                });
        });

        describe('whem the eventService throws a custom error', () => {
            const error = { status: 404, message: 'Events not found' }
            beforeAll(() => {
                mockedEventService.prototype.getWorkerEvents = jest.fn().mockRejectedValue(error)
            });

            test('should return a 404 status code', async () => {
                const response = await request(app)
                    .get(url)
                    .set('Origin', 'http://localhost:3000')

                expect(response.status).toBe(error.status)
                expect(response.body).toEqual({ message: error.message })
            });
        });
    });

    describe('DELETE /:id/recurrence', () => {
        const url = `${baseUrl}/1/recurrence`

        beforeAll(() => {
            mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue(1)
        });

        afterAll(() => {
            jest.clearAllMocks()
        });

        describe('when the events are deleted', () => {

            beforeAll(() => {
                mockedEventService.prototype.deleteEvents = jest.fn().mockResolvedValue(1)
            });

            test('should return a 200 status code', async () => {
                const response = await request(app)
                    .delete(url)
                    .set('Origin', 'http://localhost:3000')

                expect(response.status).toBe(200)
                expect(response.body).toEqual({ message: 'Eventos eliminados correctamente.' })
            });
        });

        describe('whem the eventService throws a default error', () => {
                
                beforeAll(() => {
                    mockedEventService.prototype.deleteEvents = jest.fn().mockRejectedValue(new Error('Error'))
                });
        
                test('should return a 500 status code', async () => {
                    const response = await request(app)
                        .delete(url)
                        .set('Origin', 'http://localhost:3000')
        
                    expect(response.status).toBe(500)
                    expect(response.body).toEqual({ message: 'Error' })
                });
        });

        describe('whem the eventService throws a custom error', () => {
            const error = { status: 404, message: 'Events not found' }
            beforeAll(() => {
                mockedEventService.prototype.deleteEvents = jest.fn().mockRejectedValue(error)
            });

            test('should return a 404 status code', async () => {
                const response = await request(app)
                    .delete(url)
                    .set('Origin', 'http://localhost:3000')

                expect(response.status).toBe(error.status)
                expect(response.body).toEqual({ message: error.message })
            });
        });
    });
});

