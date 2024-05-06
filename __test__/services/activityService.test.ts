jest.mock('@models/activitySchema');
import ActivityScheme from "@models/activitySchema";
const mockedActivity = ActivityScheme as jest.Mocked<typeof ActivityScheme>;

import mongoose from 'mongoose';

import ActivityService from "@services/activityService";
import { ActivityDoc, ActivityState } from "@customTypes/activity";
import { Event } from "@customTypes/event";

describe('Get all activities', () => {
    let activityService: ActivityService;

    beforeEach(() => {
        activityService = new ActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });



    describe('when the activities are found and there are price filters', () => {
        const activities = [{ name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" }];
        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockResolvedValue(activities);
        });

        test('should respond with activities', async () => {
            const result = await activityService.getAllActivities({ price: 12 });
            expect(result).toStrictEqual(activities);
        });
    });

    describe('when the activities are found and there are not price filters', () => {
        const queryOptions = {
            searchString: 'test',
        };
        const activities = [{ name: "test", description: "", location: "", duration: 0, petsPermited: false, state: "" }];
        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockResolvedValue(activities);
        });
        test('should respond with activities', async () => {
            const result = await activityService.getAllActivities(queryOptions);
            expect(result).toStrictEqual(activities);
        });
    });
});

describe('Get one activity', () => {
    const activityId = '1';
    let activityService: ActivityService;

    beforeEach(() => {
        activityService = new ActivityService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the activity is found', () => {
        const activity = { name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" };
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue(activity);
        });
        test('should respond with a activity', async () => {
            const result = await activityService.getOneActivity(activityId);
            expect(result).toStrictEqual(activity);
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(activityService.getOneActivity(activityId))
                .rejects.toMatchObject({ status: 400, message: 'El identificador de la actividad no es válido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(activityService.getOneActivity(activityId))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockRejectedValue(new Error());
        });

        test('should throw an error', async () => {
            await expect(activityService.getOneActivity(activityId))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe('Get events by activity id', () => {
    let activityService: ActivityService;
    let activityId: string;
    beforeEach(() => {
        activityService = new ActivityService();
        activityId = '123456789012';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('When there are events', () => {
        const activity = {
            name: 'Hiking',
            location: 'Mountains',
            category: 'Adventure',
            duration: 120,
            description: { es: 'Una actividad divertida y desafiante para los amantes de la naturaleza', en: 'A fun and challenging activity for nature lovers' },
            state: ActivityState.abierta,
            images: ['image1.jpg', 'image2.jpg'],
            events: [new Event(10, new Date(), 10, 'English', 'John Doe'), new Event(10, new Date(), 10, 'English', 'John Doe')]
        };
        beforeAll(() => {
            // jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.aggregate.mockReturnValue({
                exec: jest.fn().mockResolvedValue([activity]),
            } as any);
        });

        test('Should return the events', async () => {
            const events = await activityService.getEvents(activityId);
            expect(events).toEqual(activity.events);
        });
    });

    describe('When there are no events', () => {
        const activity = {
            name: 'Hiking',
            location: 'Mountains',
            duration: 120,
            description: { es: 'Una actividad divertida y desafiante para los amantes de la naturaleza', en: 'A fun and challenging activity for nature lovers' },
            category: 'Adventure',
            state: ActivityState.abierta,
            images: ['image1.jpg', 'image2.jpg'],
            events: [] as any
        };
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.aggregate.mockReturnValue({
                exec: jest.fn().mockResolvedValue([activity]),
            } as any);
        });

        test('Should return an error', async () => {
            await expect(activityService.getEvents(activityId)).rejects.toEqual({
                status: 404,
                message: "No hay eventos para esta actividad"
            });
        });
    });

    describe('When the activity does not exist', () => {
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            mockedActivity.aggregate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);
        });

        test('Should return an error', async () => {
            await expect(activityService.getEvents(activityId)).rejects.toEqual({
                status: 404,
                message: "No se ha encontrado la actividad"
            });
        });
    });

    describe('When the activity id is not valid', () => {
        beforeAll(() => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
        });
        test('Should return an error', async () => {
            await expect(activityService.getEvents(activityId)).rejects.toEqual({
                status: 400,
                message: "El id de la actividad no es válido"
            });
        });
    });

});
