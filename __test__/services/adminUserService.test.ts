jest.mock('@models/userSchema');
import { Role, User } from '@customTypes/user';
import UserScheme from '@models/userSchema';
const mockUserScheme = UserScheme as jest.Mocked<typeof UserScheme>;

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        Types: {
            ObjectId: {
                isValid: jest.fn()
            }
        }
    };
});
import mongoose from 'mongoose';
const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

import AdminUserService from "@services/adminUserService";
import { ReservationDoc } from '@customTypes/reservation';

describe('Add user', () => {
    let adminUserService: AdminUserService;
    beforeEach(() => {
        adminUserService = new AdminUserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When the user is not registered', () => {
        const user = { name: 'test', email: '', password: '', role: Role.administrador } as User;
        beforeAll(() => {
            mockUserScheme.findOne.mockResolvedValue(null);
            mockUserScheme.prototype.save.mockResolvedValue(user);
        });
        test('should return the user', async () => {
            const result = await adminUserService.addUser(user);
            expect(result).toEqual(user);
        });
    });

    describe('When the user is registered', () => {
        beforeAll(() => {
            mockUserScheme.findOne.mockResolvedValue({} as User);
        });

        test('should throw an error', async () => {
            await expect(adminUserService.addUser({} as User)).rejects.toMatchObject({ status: 400, message: 'El email ya está registrado' });
        });
    });

    describe('When the role is not correct', () => {
        beforeAll(() => {
            mockUserScheme.findOne.mockResolvedValue(null);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.addUser({} as User)).rejects.toMatchObject({ status: 400, message: 'Role incorrecto' });
        });
    });

    describe('When there is an error on the search', () => {
        beforeAll(() => {
            mockUserScheme.findOne.mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(adminUserService.addUser({} as User)).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('When there is an error on the save', () => {
        const user = { name: 'test', email: '', password: '', role: Role.administrador } as User;
        beforeAll(() => {
            mockUserScheme.findOne.mockResolvedValue(null);
            mockUserScheme.prototype.save.mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(adminUserService.addUser(user)).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });

});

describe('Get all users', () => {
    let adminUserService: AdminUserService;

    beforeEach(() => {
        adminUserService = new AdminUserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When there are users', () => {
        const users = [{ name: 'test', email: '', password: '', role: Role.administrador } as User];
        beforeAll(() => {
            mockUserScheme.find.mockResolvedValue(users);
        });
        test('should return the users', async () => {
            const result = await adminUserService.getAllUsers({} as any);
            expect(result).toEqual(users);
        });
    });

    describe('When there are not users', () => {
        beforeAll(() => {
            mockUserScheme.find.mockResolvedValue([]);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getAllUsers({} as any)).rejects.toMatchObject({ status: 404, message: 'No se encontraron usuarios' });
        });
    });

    describe('When there is an error on the search', () => {
        beforeAll(() => {
            mockUserScheme.find.mockRejectedValue({} as Error);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getAllUsers({} as any)).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Get one user', () => {
    let adminUserService: AdminUserService;

    beforeEach(() => {
        adminUserService = new AdminUserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When there is a user', () => {
        const user = { name: 'test', email: '', password: '', role: Role.administrador } as User;
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findById.mockResolvedValue(user);
        });
        test('should return the user', async () => {
            const result = await adminUserService.getOneUser('1');
            expect(result).toEqual(user);
        });
    });

    describe('When there is not a user', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findById.mockResolvedValue(null);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getOneUser('1')).rejects.toMatchObject({ status: 404, message: 'No se encontraron los datos del usuario' });
        });
    });

    describe('When the id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getOneUser('1')).rejects.toMatchObject({ status: 400, message: 'El id no es válido' });
        });
    });

    describe('When there is an error on the search', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findById.mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getOneUser('1')).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Delete user', () => {
    let adminUserService: AdminUserService;

    beforeEach(() => {
        adminUserService = new AdminUserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When the user is deleted', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndDelete.mockResolvedValue({} as User);
        });
        test('should not throw an error', async () => {
            await expect(adminUserService.deleteUser('1')).resolves.not.toThrow();
        });
    });

    describe('When the user is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndDelete.mockResolvedValue(null);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.deleteUser('1')).rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('When the id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.deleteUser('1')).rejects.toMatchObject({ status: 400, message: 'El id no es válido' });
        });
    });

    describe('When there is an error on the search', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndDelete.mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(adminUserService.deleteUser('1')).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Edit user', () => {
    let adminUserService: AdminUserService;

    beforeEach(() => {
        adminUserService = new AdminUserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When the user is edited', () => {
        const user = { name: 'test', email: '', password: '', role: Role.administrador };
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndUpdate.mockResolvedValue(user);
        });
        test('should not throw an error', async () => {
            await expect(adminUserService.editUser('1', user)).resolves.not.toThrow();
        });
    });

    describe('When the user is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndUpdate.mockResolvedValue(null);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.editUser('1', {})).rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('When the id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.editUser('1', {})).rejects.toMatchObject({ status: 400, message: 'El id no es válido' });
        });
    });

    describe('When there is an error on the search', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.findByIdAndUpdate.mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(adminUserService.editUser('1', {})).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});