import request, { Response } from 'supertest';
import app from "@app";
import AdminActivityService from "@services/adminActivityService";
import TokenService from "@services/tokenService";

jest.mock("@services/adminActivityService");
const mockedAdminActivityService = AdminActivityService as jest.Mocked<typeof AdminActivityService>;

jest.mock("@services/tokenService");
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

describe('POST /', () => {
    const url = '/api/admin/activity';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the new activity data is correct', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addActivity = jest.fn()
        })

        test('shoud respond with a 200 status code', async () => {
            const body = { name: "test", location: "test", duration: 12, description: "test", accesibility: "test", petsPermited: true, state: "test", images: ['test'] };
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: "Se ha creado correctamente la actividad" });
        });
    });

    describe('when the new activity data is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: "Faltan algunos datos obligatorios de la nueva actividad" });
        });
    });

    describe('when the adminActivityService throws a default error', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addActivity = jest.fn().mockRejectedValue(new Error());
        })

        test('shoud respond with a 500 status code', async () => {
            const body = { name: "test", location: "test", duration: 12, description: "test", accesibility: "test", petsPermited: true, state: "test", images: ['test'] };
            const res: Response = await request(app)
                .post(url)
                .send(body)
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: "Ha habido un error en el servidor." });
        });
    });

    describe('when the adminActivityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAdminActivityService.prototype.addActivity = jest.fn().mockRejectedValue(error);
        })

        test('shoud respond with a the status code of the custom error', async () => {
            const body = { name: "test", location: "test", duration: 12, description: "test", accesibility: "test", petsPermited: true, state: "test", images: ['test'] };
            const res: Response = await request(app)
                .post(url)
                .send(body)
            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });
});

describe('PUT /:id', () => {
    const url = '/api/admin/activity/1';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the changes are correct', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.editActivity = jest.fn()
        })

        test('shoud respond with a 200 status code', async () => {
            const body = { name: "test" };
            const res: Response = await request(app)
                .put(url)
                .send(body)
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: "Se han realizado correctamente los cambios" });
        });
    });
    describe('when the changes are missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .put(url)

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: "Faltan los cambios a aplicar" });
        });
    });

    describe('when the adminActivityService throws a default error', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.editActivity = jest.fn().mockRejectedValue(new Error());
        })

        test('shoud respond with a 500 status code', async () => {
            const body = { name: "test" };
            const res: Response = await request(app)
                .put('/api/admin/activity/1')
                .send(body)
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: "Ha habido un error en el servidor." });
        });
    });

    describe('when the adminActivityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAdminActivityService.prototype.editActivity = jest.fn().mockRejectedValue(error);
        })

        test('shoud respond with a the status code of the custom error', async () => {
            const body = { name: "test" };
            const res: Response = await request(app)
                .put('/api/admin/activity/1')
                .send(body)
            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });
});

describe('DELETE /:id', () => {
    const url = '/api/admin/activity/1';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the activity is deleted', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteActivity = jest.fn()
        })
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .delete(url)
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: "Se ha eliminado correctamente la acticividad: 1" });
        });
    });

    describe('when the adminActivityService throws a default error', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteActivity = jest.fn().mockRejectedValue(new Error());
        })

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .delete(url)
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: "Ha habido un error en el servidor." });
        });
    });

    describe('when the adminActivityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteActivity = jest.fn().mockRejectedValue(error);
        })

        test('shoud respond with a the status code of the custom error', async () => {
            const res: Response = await request(app)
                .delete(url)
            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });
});

describe('POST /:activityId/events', () => {

    const url = '/api/admin/activity/12345/events';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when a single event is added', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addEvents = jest.fn()
        })

        test('shoud respond with a 200 status code', async () => {
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe',
                    date: new Date(),
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Eventos añadidos con exito' });

        });
    });

    describe('when a single event is added with repeatInfo days', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addEvents = jest.fn()
        });

        test('shoud respond with a 200 status code', async () => {
            // Mock the request and response objects
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe'
                },
                repeatInfo: {
                    repeatType: 'days',
                    time: '10:00',
                    repeatDays: [new Date(), new Date()]
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Eventos añadidos con exito' });

        });
    });

    describe('when a single event is added with repeatInfo range',  () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addEvents = jest.fn()
        });

        test('shoud respond with a 200 status code', async () => {
            // Mock the request and response objects
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe'
                },
                repeatInfo: {
                    repeatType: 'range',
                    repeatStartDate: new Date().setDate(new Date().getDate() + 1),
                    repeatEndDate: new Date().setDate(new Date().getDate() + 3),
                    time: '10:00',
                    repeatDays: [0, 1, 2, 3, 4, 5]
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.body).toStrictEqual({ message: 'Eventos añadidos con exito' });
            expect(res.status).toBe(200);
        });
    });

    describe('when the adminActivityService throws a default error', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.addEvents = jest.fn().mockRejectedValue(new Error());
        })

        test('shoud respond with a 500 status code', async () => {
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe',
                    date: new Date(),
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });

        });
    });

    describe('when the adminActivityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAdminActivityService.prototype.addEvents = jest.fn().mockRejectedValue(error);
        })

        test('shoud respond with a the status code of the custom error', async () => {
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe',
                    date: new Date(),
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });

        });
    });

    describe('when the event data is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Faltan los datos del evento a añadir' });
        });
    });

    describe('when a date or repeatInfo is missing', () => {
        test('shoud respond with a 400 status code', async () => {

            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe',
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Falta la fecha o rango de fechas del evento' });
        });
    });

    describe('when the start data or end date is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const body = {
                event: {
                    language: 'English',
                    price: 10,
                    seats: 20,
                    guide: 'John Doe',
                },
                repeatInfo: {
                    repeatType: 'range',
                    time: '10:00',
                    repeatDays: [0, 1, 2, 3, 4, 5]
                }
            };

            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Falta especificar un rango de fechas valido para el evento' });
        });
    });
});

describe('DELETE /:activityId/review', () => {
    const url = '/api/admin/activity/12345/review/12345';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the review is deleted', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteReview = jest.fn()
        })
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Comentario eliminado con exito' });
        });
    });

    describe('when the adminActivityService throws a default error', () => {
        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteReview = jest.fn().mockRejectedValue(new Error());
        })

        it('test_default_error', async () => {
            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });

        });
    });

    describe('when the adminActivityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAdminActivityService.prototype.deleteReview = jest.fn().mockRejectedValue(error);
        })
        test('shoud respond with a the status code of the custom error', async () => {

            const adminActivityService = require("../../src/services/adminActivityService")
            adminActivityService.deleteReview = jest.fn().mockRejectedValue(error);

            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });

        });
    });
});
