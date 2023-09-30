import request, { Response } from 'supertest';
import app from "@app";

jest.mock("@services/userService");
import UserService from "@services/userService";
const mockedUserService = UserService as jest.Mocked<typeof UserService>;

jest.mock("@services/tokenService");
import TokenService from "@services/tokenService";
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

describe('GET /', () => {
    const url = "/api/user";

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('test');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the user is valid', () => {
        const user = { name: 'test' };
        beforeAll(() => {
            mockedUserService.prototype.getOneUser = jest.fn().mockReturnValue(user);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get(url)
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(user);
        });
    });

    describe('when the userService throws a default error', () => {
        beforeAll(() => {
            mockedUserService.prototype.getOneUser = jest.fn().mockRejectedValue(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get('/api/user')
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the userService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };
        beforeAll(() => {
            mockedUserService.prototype.getOneUser = jest.fn().mockRejectedValue(error);
        });

        test("shoud respond with the status code of the custom error", async () => {
            const res: Response = await request(app)
                .get('/api/user')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Test error' });
        });

    });
});

describe('PUT /edit', () => {
    const url = "/api/user/edit";

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('test');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the changes are valid', () => {
        beforeAll(() => {
            mockedUserService.prototype.updateUser = jest.fn();
        });

        test("test_valid", async () => {
            const res: Response = await request(app)
                .put(url)
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Usuario actualizado' });
        });
    })

    describe('when the userService throws a default error', () => {
        beforeAll(() => {
            mockedUserService.prototype.updateUser = jest.fn().mockRejectedValue(new Error());
        });

        test("shoud respond with a 500 status code", async () => {
            const res: Response = await request(app)
                .put(url)
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the userService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedUserService.prototype.updateUser = jest.fn().mockRejectedValue(error);
        });
        test("shoud respond with the status code of the custom error", async () => {
            const res: Response = await request(app)
                .put(url)
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Test error' });
        });
    });

});

describe('PUT /edit/password', () => {
    const url = "/api/user/edit/password";

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('test');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('when the passwords are valid', () => {
        beforeAll(() => {
            mockedUserService.prototype.changePassword = jest.fn();
        });

        test("shoud respond with a 200 status code", async () => {
            const res: Response = await request(app)
                .put(url)
                .send({ oldPass: 'test', newPass: 'test' })
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Contraseña actualizada' });
        })
    });

    describe("when not all parameters are sent", () => {
        const error = { status: 400, message: 'No se han enviado todos los parámetros necesarios' };

        beforeAll(() => {
            mockedUserService.prototype.changePassword = jest.fn().mockRejectedValue(error);
        });

        test("shoud respond with a 400 status code", async () => {
            const res: Response = await request(app)
                .put(url)
            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });

    describe("when the userService throws a default error", () => {
        beforeAll(() => {
            mockedUserService.prototype.changePassword = jest.fn().mockRejectedValue(new Error());
        });

        test("shoud respond with a 500 status code", async () => {
            const res: Response = await request(app)
                .put(url)
                .send({ oldPass: 'test', newPass: 'test' })
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe("when the userService throws a custom error", () => {
        const error = { status: 400, message: 'Test error' };
        beforeAll(() => {
            mockedUserService.prototype.changePassword = jest.fn().mockRejectedValue(error);
        });
        test("shoud respond with the status code of the custom error", async () => {
            const res: Response = await request(app)
                .put(url)
                .send({ oldPass: 'test', newPass: 'test' })
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Test error' });
        });
    });
});