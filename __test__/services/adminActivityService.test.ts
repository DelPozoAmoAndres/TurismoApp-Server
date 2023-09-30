jest.mock('@models/activitySchema');
import ActivitySchema from "@models/activitySchema";
const mockedActivitySchema = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

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

jest.mock('@models/userSchema');
import UserSchema from "@models/userSchema";
const mockedUserSchema = UserSchema as jest.Mocked<typeof UserSchema>;

import AdminActivityService from "@services/adminActivityService";
import { Event } from "@customTypes/event";

describe('Add new activity', () => {
    let adminActivityService: AdminActivityService;

    beforeEach(() => {
        adminActivityService = new AdminActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the activity is added', () => {
        const activity = new mockedActivitySchema({ name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" });
        beforeAll(() => {
            mockedActivitySchema.prototype.validateSync.mockReturnValue(false);
            mockedActivitySchema.prototype.save.mockResolvedValue(activity);
        });
        test('should respond with the activity', async () => {
            const result = await adminActivityService.addActivity(activity);
            expect(result).toEqual(activity);
        });
    });

    describe('when the activity is not valid', () => {
        const activity = new ActivitySchema({ location: "", duration: 0, petsPermited: false, state: "" });
        beforeAll(() => {
            mockedActivitySchema.prototype.validateSync.mockReturnValue({ errors: { name: "", description: "" } });
        });
        test('should respond with the error', async () => {
            await expect(adminActivityService.addActivity(activity)).rejects.toMatchObject({ status: 400, message: 'Error al registrar la actividad. Faltan datos requeridos: ' + "name, description" });
        });
    });

    describe('when there is an error', () => {
        const activity = new ActivitySchema({ name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" });
        beforeAll(() => {
            mockedActivitySchema.prototype.validateSync.mockReturnValue(false);
            mockedActivitySchema.prototype.save.mockRejectedValue({ status: 500, message: "Error" });
        });
        test('should respond with the error', async () => {
            await expect(adminActivityService.addActivity(activity)).rejects.toMatchObject({ status: 500, message: "Error" });
        });
    });

});

describe('Edit activity', () => {
    const activityId = '1';
    let adminActivityService: AdminActivityService;

    beforeEach(() => {
        adminActivityService = new AdminActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the activity is edited', () => {
        const changes = { name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" };
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndUpdate.mockResolvedValue(changes);
        });
        test('should respond with the activity', async () => {
            const result = await adminActivityService.editActivity(activityId, changes);
            expect(result).toEqual(changes);
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.editActivity(activityId, {}))
                .rejects.toMatchObject({ status: 400, message: 'El id de la actividad es invalido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndUpdate.mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.editActivity(activityId, {}))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndUpdate.mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.editActivity(activityId, {}))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Delete activity', () => {
    const activityId = '1';
    let adminActivityService: AdminActivityService;

    beforeEach(() => {
        adminActivityService = new AdminActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the activity is deleted', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndDelete.mockResolvedValue({});
        });
        
        test('should respond with the activity', async () => {
            const result = await adminActivityService.deleteActivity(activityId);
            expect(result).toEqual({});
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteActivity(activityId))
                .rejects.toMatchObject({ status: 400, message: 'El id de la actividad es invalido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndDelete.mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteActivity(activityId))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findByIdAndDelete.mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteActivity(activityId))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Add events', () => {
    const activityId = '1';
    let adminActivityService: AdminActivityService;

    beforeEach(() => {
        adminActivityService = new AdminActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the events are added', () => {
        const events = [
            new Event(10, new Date(), 100, "English", "John"),
            new Event(5, new Date(), 50, "Spanish", "Maria")
        ];
        const activity = new mockedActivitySchema({ name: ""});
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findById.mockResolvedValue(activity);
            mockedUserSchema.findOne.mockResolvedValue({});
            mockedActivitySchema.prototype.save.mockResolvedValue(activity);
        });
        test('should respond with the activity', async () => {
            const result = await adminActivityService.addEvents(activityId, events);
            expect(result).toEqual(activity);
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.addEvents(activityId, []))
                .rejects.toMatchObject({ status: 400, message: 'El id de la actividad es invalido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findById.mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.addEvents(activityId, []))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when the guide is not found', () => {
        const events = [
            new Event(10, new Date(), 100, "English", "John"),
            new Event(5, new Date(), 50, "Spanish", "Maria")
        ];
        const activity = new mockedActivitySchema({ name: ""});
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findById.mockResolvedValue(activity);
            mockedUserSchema.findOne.mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.addEvents(activityId, events))
                .rejects.toMatchObject({ status: 404, message: 'Usuario guía no encontrado' });
        });
    });

    describe('when there is an error', () => {
        const events = [
            new Event(10, new Date(), 100, "English", "John"),
            new Event(5, new Date(), 50, "Spanish", "Maria")
        ];
        const activity = new mockedActivitySchema({ name: ""});
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findById.mockResolvedValue(activity);
            mockedUserSchema.findOne.mockResolvedValue({});
            mockedActivitySchema.prototype.save.mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.addEvents(activityId, events))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Delete review', () => {
    let adminActivityService: AdminActivityService;

    beforeEach(() => {
        adminActivityService = new AdminActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the review is deleted', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOneAndUpdate.mockResolvedValue(new mockedActivitySchema({ name: ""}));
            mockedActivitySchema.prototype.save.mockResolvedValue({});
        });
        
        test('should respond with the activity', async () => {
            const result = await adminActivityService.deleteReview('1', '1');
            expect(result).toEqual({});
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteReview('1', '1'))
                .rejects.toMatchObject({ status: 400, message: 'El id de la actividad es invalido' });
        });
    });

    describe('when the review id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteReview('1', '1'))
                .rejects.toMatchObject({ status: 400, message: 'El id de la review es invalido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOneAndUpdate.mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteReview('1', '1'))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOneAndUpdate.mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(adminActivityService.deleteReview('1', '1'))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });


});