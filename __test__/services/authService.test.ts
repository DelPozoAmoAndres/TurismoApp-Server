jest.mock('@models/userSchema');
import UserScheme from "@models/userSchema";
const mockedUser = UserScheme as jest.Mocked<typeof UserScheme>;

jest.mock('bcrypt');
import bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('@services/tokenService');
import tokenService from '@services/tokenService';
const mockedTokenService = new (tokenService as jest.Mocked<typeof tokenService>)();

import AuthService from "@services/authService";

describe('Login', () => {
    const user = { email: 'test@test.com', password: 'password' };
    const token = 'token';

    let authService = new AuthService(mockedTokenService);
    
    beforeAll(() => {
        mockedTokenService.createToken= jest.fn().mockReturnValue('token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockedBcrypt.compareSync.mockReset();
    });

    describe('when the credentials are valid', () => {
        beforeAll(() => {
            mockedUser.findOne = jest.fn().mockResolvedValue(user);
            mockedBcrypt.compareSync = jest.fn().mockResolvedValue(true);
        });

        test('should respond with a user and a token', async () => {
            const result = await authService.login(user.email, user.password);
            expect(result).toStrictEqual({ user, token });
        });
    });

    describe('when the email is not registered', () => {
        beforeAll(() => {
            mockedUser.findOne = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(authService.login(user.email, user.password))
                .rejects.toMatchObject( { status: 401, message: 'Credenciales incorrectas.' });
        });
    });

    describe('when the password is incorrect', () => {
        beforeAll(() => {
            mockedUser.findOne = jest.fn().mockResolvedValue(user);
            mockedBcrypt.compareSync = jest.fn().mockResolvedValue(false);
        });

        test('should throw an error', async () => {
            await expect(authService.login(user.email, user.password))
                .rejects.toMatchObject( { status: 401, message: 'Credenciales incorrectas.' });
        });
    });
});

describe('Register', () => {
    const user = new UserScheme();

    let authService = new AuthService(mockedTokenService);

    beforeAll(() => {
        mockedTokenService.createToken= jest.fn().mockReturnValue('token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockedBcrypt.compareSync.mockReset();
    });

    describe('when the email is not registered', () => {
        beforeAll(() => {
            mockedUser.exists = jest.fn().mockResolvedValue(false);
            mockedUser.prototype.validateSync = jest.fn();
            mockedUser.prototype.save = jest.fn();
        });

        test('should save the user', async () => {
            await authService.register(user);
            expect(mockedUser.prototype.save).toHaveBeenCalled();
        });
    });

    describe('when the email is already registered', () => {
        beforeAll(() => {
            mockedUser.exists = jest.fn().mockResolvedValue(true);
        });

        test('should throw an error', async () => {
            await expect(authService.register(user))
                .rejects.toMatchObject( { status: 400, message: 'El email ya está registrado.' });
        });
    });

    describe('when the user is not valid', () => {
        beforeAll(() => {
            mockedUser.exists = jest.fn().mockResolvedValue(false);
            mockedUser.prototype.validateSync = jest.fn().mockImplementation(() => { throw new Error() });
        });

        test('should throw an error', async () => {
            await expect(authService.register(user))
                .rejects.toMatchObject( { status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedUser.exists = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(authService.register(user))
                .rejects.toMatchObject( { status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when there is an error on save', () => {
        beforeAll(() => {
            mockedUser.exists = jest.fn().mockResolvedValue(false);
            mockedUser.prototype.validateSync = jest.fn();
            mockedUser.prototype.save = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(authService.register(user))
                .rejects.toMatchObject( { status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});