jest.mock('@models/userSchema');
import UserScheme from "@models/userSchema";
const mockedUser = UserScheme as jest.Mocked<typeof UserScheme>;

jest.mock('bcrypt');
import bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

import UserService from "@services/userService";

describe('Get one user', () => {
    const userId = '1';
    let userService = new UserService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the user is found', () => {
        const user = { email: "",name: "", role: "" };
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(user);
        });
        test('should respond with a user', async () => {
            const result = await userService.getOneUser(userId);
            expect(result).toStrictEqual(user);
        });
    });

    describe('when the user is not found', () => {
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(userService.getOneUser(userId))
                .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(userService.getOneUser(userId))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Update user', () => {
    const userId = '1';
    const changes = { email: "",name: "", role: "" };
    let userService = new UserService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the user is found', () => {
        const user = { email: "",name: "", role: "" };
        beforeAll(() => {
            mockedUser.findOneAndUpdate = jest.fn().mockResolvedValue(user);
        });
        test('should respond with a user', async () => {
            const result = await userService.updateUser(userId, changes);
            expect(result).toStrictEqual(user);
        });
    });

    describe('when the user is not found', () => {
        beforeAll(() => {
            mockedUser.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(userService.updateUser(userId, changes))
                .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedUser.findOneAndUpdate = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(userService.updateUser(userId, changes))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Change password', () => {
    const userId = '1';
    const oldPass = 'oldPass';
    const newPass = 'newPass';
    const user = { email: "",name: "", role: ""};
    let userService = new UserService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the user is found', () => {
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(user);
            mockedBcrypt.compareSync = jest.fn().mockReturnValue(true);
            mockedUser.findOneAndUpdate = jest.fn();
        });
        test('should respond with a user', async () => {
            await userService.changePassword(userId, oldPass, newPass);
            expect(mockedUser.findOneAndUpdate).toHaveBeenCalled();
        });
    });

    describe('when the user is not found', () => {
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(userService.changePassword(userId, oldPass, newPass))
                .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('when the old password is not correct', () => {
        
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(user);
            mockedBcrypt.compareSync = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(userService.changePassword(userId, oldPass, newPass))
                .rejects.toMatchObject({ status: 304, message: 'Contraseña no modificada, contraseña actual incorrecta' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedUser.findById = jest.fn().mockResolvedValue(user);
            mockedBcrypt.compareSync = jest.fn().mockReturnValue(true);
            mockedUser.findOneAndUpdate = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(userService.changePassword(userId, oldPass, newPass))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});