jest.mock('@models/userSchema');
import { Role, User } from '@customTypes/user';
import UserScheme from '@models/userSchema';
const mockUserScheme = UserScheme as jest.Mocked<typeof UserScheme>;

jest.mock('@services/eventService');
import EventService from '@services/eventService';
const mockEventService = new EventService() as jest.Mocked<EventService>;

jest.mock('@services/reservationService');
import ReservationService from '@services/reservationService';
const mockReservationService = new ReservationService() as jest.Mocked<ReservationService>;

jest.mock('@models/activitySchema');
import ActivitySchema from '@models/activitySchema';
const mockActivitySchema = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

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
import { Event } from '@customTypes/event';

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

    describe('When there is an error on the query options', () => {
        beforeAll(() => {
            mockUserScheme.find.mockRejectedValue({} as Error);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getAllUsers({ limit: 'a' } as any)).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
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
            mockUserScheme.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
        });
        test('should not throw an error', async () => {
            await expect(adminUserService.deleteUser('1')).resolves.not.toThrow();
        });
    });

    describe('When the user is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockUserScheme.deleteOne.mockResolvedValue(null);
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
            mockUserScheme.deleteOne.mockRejectedValue(new Error());
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

describe('Get workers', () => {
    let adminUserService: AdminUserService;

    beforeAll(() => {
        mockEventService.getWorkerEvents = jest.fn().mockResolvedValue([]);
        adminUserService = new AdminUserService(mockReservationService, mockEventService);
        
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When there are workers with any event assigned', () => {
        const workers = [{ name: 'test', email: '', password: '', role: Role.guía } as User];
        const queryOptions ={
            "repeatType": "none",
            "date": "2024-03-15"
          }
        beforeAll(() => {
            mockUserScheme.find.mockResolvedValue(workers);
        });
        test('should return the workers', async () => {
            const result = await adminUserService.getWorkers(queryOptions);
            expect(result).toEqual(workers);
        });

    });

    describe ('When there are workers with some events assigned', () => {
        const workers = [{ name: 'test', email: '', password: '', role: Role.guía } as User];
        const events : Event[] = [{id: '1', bookedSeats:2, guide: '1', seats: 5, date: new Date('2024-03-15'), language: 'Spanish', price:12 }];
        const activity = {duration:2};
        beforeAll(() => {
            mockUserScheme.find.mockResolvedValue(workers);
            mockEventService.getWorkerEvents.mockResolvedValue(events);
            mockActivitySchema.findOne.mockResolvedValue(activity);
        });

        describe('on a repeatType none', () => {
            const queryOptions ={
                "repeatType": "none",
                "date": "2024-03-15T18:00:00Z"
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual(workers);
            });
        });

        describe('on a repeatType days', () => {
            const queryOptions ={
                "repeatType": "days",
                "repeatDays": "1,3,5", 
                "time": "14:00" 
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual(workers);
            });
        });

        describe('on a repeatType range', () => {
            const queryOptions ={
                "repeatType": "range",
                "repeatDays": "2,4", 
                "repeatStartDate": "2024-03-01",
                "repeatEndDate": "2024-03-31",
                "time": "10:00" 
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual(workers);
            });
        });
    });

    describe('When there are not workers', () => {
        const workers = [{ name: 'test', email: '', password: '', role: Role.guía } as User];
        const events : Event[] = [{id: '1', bookedSeats:2, guide: '1', seats: 5, date: new Date('2024-03-15T00:00:00'), language: 'Spanish', price:12 }];
        const activity = {duration:2};
        beforeAll(() => {
            mockUserScheme.find.mockResolvedValue(workers);
            mockEventService.getWorkerEvents.mockResolvedValue(events);
            mockActivitySchema.findOne.mockResolvedValue(activity);
        });

        describe('on a repeatType none', () => {
            const queryOptions ={
                "repeatType": "none",
                "date": "2024-03-15T00:00:00"
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual([]);
            });
        });

        describe('on a repeatType days', () => {
            const queryOptions ={
                "repeatType": "days",
                "repeatDays": '2024-03-15', 
                "time": "00:00" 
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual([]);
            });
        });

        describe('on a repeatType range', () => {
            const queryOptions ={
                "repeatType": "range",
                "repeatDays": [0,1,2,3,4,5,6], 
                "repeatStartDate": "2024-03-14",
                "repeatEndDate": "2024-03-16",
                "time": "00:00" 
              }
            test('should return the workers', async () => {
                const result = await adminUserService.getWorkers(queryOptions);
                expect(result).toEqual([]);
            });
        });
    });

    describe('When there is an error on the search', () => {
        const queryOptions = {
            "repeatType": "range",
            "repeatDays": "2,4", 
            "repeatStartDate": "2024-03-01",
            "repeatEndDate": "2024-03-31",
            "time": "10:00" 
          }
        beforeAll(() => {
            mockUserScheme.find.mockRejectedValue({} as Error);
        });
        test('should throw an error', async () => {
            await expect(adminUserService.getWorkers(queryOptions)).rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});


