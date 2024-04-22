import request, { Response } from 'supertest';
import app from "@app";

jest.mock('../../src/services/authService');
import AuthService from '@services/authService';
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('POST /login', () => {
    const url = '/api/login';

    describe('when user logs in with valid credentials', () => {
        const body = { token: 'token', user: { name: 'test' } };

        beforeAll(() => {
            mockedAuthService.prototype.login = jest.fn().mockReturnValue(body);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ email: 'test@test.com', password: 'password' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(body);
        });
    });

    describe('when email is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ password: 'password' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'No se han enviado todos los parámetros necesarios' });
        });
    });

    describe('when password is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ email: 'test@test.com' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'No se han enviado todos los parámetros necesarios' });
        });
    });

    describe('when authservice throws a default error', () => {
        beforeAll(() => {
            mockedAuthService.prototype.login = jest.fn().mockRejectedValue(new Error());
        });
        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ email: 'test@test.com', password: 'password' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when authservice throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAuthService.prototype.login = jest.fn().mockRejectedValue(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ email: 'test@test.com', password: 'password' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });
});

describe('POST /register', () => {
    const url = '/api/register';

    describe('when user registers with valid credentials', () => {
        beforeAll(() => {
            mockedAuthService.prototype.register = jest.fn();
        });
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'johndoe@example.com', password: 'password' })
                .set('Origin', 'http://localhost:3000');

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Usuario registrado correctamente.' });
        });
    });

    describe('when user register with optional fields', () => {
        beforeAll(() => {
            mockedAuthService.prototype.register = jest.fn();
        });
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'johndoe@example.com', password: 'password', telephone: 30232323, country: 'españa' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Usuario registrado correctamente.' });
        });
    });

    describe('when the name is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ email: 'johndoe@example.com', password: 'password' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'No se han enviado todos los parámetros necesarios' });
        });
    });

    describe('when the email is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', password: 'password' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'No se han enviado todos los parámetros necesarios' });
        });
    });

    describe('when the password is missing', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'johndoe@example.com' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'No se han enviado todos los parámetros necesarios' });
        });
    });

    // Tests that a user can be registered with empty optional fields
    describe('when the optional fields are empty', () => {
        beforeAll(() => {
            mockedAuthService.prototype.register = jest.fn();
        });
        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'johndoe@example.com', password: 'password', country: '' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ message: 'Usuario registrado correctamente.' });
        });
    });

    describe('when the authservice throws a default error', () => {
        beforeAll(() => {
            mockedAuthService.prototype.register = jest.fn().mockRejectedValue(new Error());
        });
        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'asdas@gmail.com', password: 'password' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the authservice throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedAuthService.prototype.register = jest.fn().mockRejectedValue(error);
        });

        test('shoud respond with the status code of the custom error', async () => {
            const res: Response = await request(app)
                .post(url)
                .send({ name: 'John Doe', email: 'johndoe@example.com', password: 'password' })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(error.status);
            expect(res.body).toStrictEqual({ message: error.message });
        });
    });
});
