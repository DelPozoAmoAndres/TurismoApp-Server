import request, {Response} from 'supertest';
import app from "@app";

jest.mock("@services/adminUserService");
import AdminUserService from "@services/adminUserService";
const mockedAdminUserService = AdminUserService as jest.Mocked<typeof AdminUserService>;

jest.mock("@services/reservationService");
import ReservationService from "@services/reservationService";
const mockedReservationService = ReservationService as jest.Mocked<typeof ReservationService>;

jest.mock("@services/tokenService");
import TokenService from "@services/tokenService";
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

const baseUrl = '/api/admin1/user';

describe('POST /', () => {
    const url = baseUrl;

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the new user data is correct', () => {
        const body = { name: "test", email: "test", password: "test", role: "test" };

        beforeAll(()=>{
            mockedAdminUserService.prototype.addUser = jest.fn()
        })
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Usuario registrado correctamente.");
        });
    });
    describe('when the new user data is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No se han enviado todos los parámetros necesarios");
        });
    });

    describe('when the new user data is incomplete', () => {
        const body = { name: "test", email: "test", password: "test" };
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No se han enviado todos los parámetros necesarios");
        });
    });

    describe('when the new user data is empty', () => {
        const body = { name: "", email: "", password: "", role: "" };
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No se han enviado todos los parámetros necesarios");
        });
    });

    describe('when the new user data is null', () => {
        const body: any = { name: null, email: null, password: null, role: null };
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No se han enviado todos los parámetros necesarios");
        });
    });

    describe('when the new user data is undefined', () => {
        const body: any = { name: undefined, email: undefined, password: undefined, role: undefined };
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No se han enviado todos los parámetros necesarios");
        });
    });

    describe('when the adminUserService throws a default error', () => {
        const body = { name: "test", email: "test", password: "test", role: "test" };

        beforeEach(() => {
            mockedAdminUserService.prototype.addUser= jest.fn().mockRejectedValueOnce( new Error("hola"));
        })

        test('shoud respond with a 500 status code', async () => {
            
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("hola");
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const body = { name: "test", email: "test", password: "test", role: "test" };
        const error = { status: 400, message: 'El email ya está registrado' };

        beforeAll(() => {
            mockedAdminUserService.prototype.addUser= jest.fn().mockRejectedValueOnce( error);
        });
        
        test('shoud respond with the status code of the custom error', async () => {
            
            const res: Response = await request(app)
                .post(url)
                .send(body)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("El email ya está registrado");
        });
    });

});

describe('GET /list', () => {
    const url = baseUrl + '/list';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the adminUserService returns a list of users', () => {
        const users = [{ name: "test", email: "test", password: "test", role: "test" }];

        beforeAll(() => {
            mockedAdminUserService.prototype.getAllUsers = jest.fn().mockReturnValue(users);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(200);
            expect(res.body).toEqual(users);
        });
    });

    describe('when the adminUserService throws a default error', () => {
        beforeEach(() => {
            mockedAdminUserService.prototype.getAllUsers = jest.fn().mockRejectedValueOnce(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ha habido un error en el servidor.');
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const error = { status: 400, message: 'No hay usuarios registrados' };

        beforeAll(() => {
            mockedAdminUserService.prototype.getAllUsers = jest.fn().mockRejectedValueOnce(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No hay usuarios registrados");
        });
    });
});

describe('GET /:id', () => {
    const url= baseUrl + '/1';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the adminUserService returns a user', () => {
        const user = { name: "test", email: "test", password: "test", role: "test" };

        beforeAll(() => {
            mockedAdminUserService.prototype.getOneUser = jest.fn().mockResolvedValueOnce(user);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(200);
            expect(res.body).toEqual(user);
        });
    });

    describe('when the adminUserService throws a default error', () => {
        beforeEach(() => {
            mockedAdminUserService.prototype.getOneUser = jest.fn().mockRejectedValueOnce(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ha habido un error en el servidor.');
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const error = { status: 400, message: 'El usuario no existe' };

        beforeAll(() => {
            mockedAdminUserService.prototype.getOneUser = jest.fn().mockRejectedValueOnce(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("El usuario no existe");
        });
    });
});

describe('DELETE /:id', () => {
    const url= baseUrl + '/1';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the adminUserService deletes a user', () => {
        beforeAll(() => {
            mockedAdminUserService.prototype.deleteUser = jest.fn();
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Usuario eliminado correctamente.");
        });
    });

    describe('when the adminUserService throws a default error', () => {
        beforeEach(() => {
            mockedAdminUserService.prototype.deleteUser = jest.fn().mockRejectedValueOnce(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ha habido un error en el servidor.');
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const error = { status: 400, message: 'El usuario no existe' };

        beforeAll(() => {
            mockedAdminUserService.prototype.deleteUser = jest.fn().mockRejectedValueOnce(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .delete(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("El usuario no existe");
        });
    });
});

describe('PUT /:id', () => {
    const url= baseUrl + '/1';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the adminUserService edits a user', () => {
        beforeAll(() => {
            mockedAdminUserService.prototype.editUser = jest.fn();
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .put(url)

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Usuario editado correctamente.");
        });
    });

    describe('when the adminUserService throws a default error', () => {
        beforeEach(() => {
            mockedAdminUserService.prototype.editUser = jest.fn().mockRejectedValueOnce(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .put(url)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ha habido un error en el servidor.');
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const error = { status: 400, message: 'El usuario no existe' };

        beforeAll(() => {
            mockedAdminUserService.prototype.editUser = jest.fn().mockRejectedValueOnce(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .put(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("El usuario no existe");
        });
    });
});

describe('GET /:userId/reservation/list', () => {
    const url= baseUrl + '/1/reservation/list';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the adminUserService returns a list of reservations', () => {
        const reservations = [{ name: "test", email: "test", password: "test", role: "test" }];

        beforeAll(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockReturnValue(reservations);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(200);
            expect(res.body).toEqual(reservations);
        });
    });

    describe('when the adminUserService throws a default error', () => {
        beforeEach(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockRejectedValueOnce(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ha habido un error en el servidor.');
        });
    });

    describe('when the adminUserService throws a custom error', () => {
        const error = { status: 400, message: 'El usuario no existe' };

        beforeAll(() => {
            mockedReservationService.prototype.getAllReservations = jest.fn().mockRejectedValueOnce(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .get(url)

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("El usuario no existe");
        });
    });

});