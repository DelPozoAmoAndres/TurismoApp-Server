jest.mock('@models/activitySchema');
import ActivityScheme from "@models/activitySchema";
const mockedActivity = ActivityScheme as jest.Mocked<typeof ActivityScheme>;

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
        const queryOptions = {
            price: 12
        };
        const activities = [{ name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" }];
        beforeAll(() => {
            mockedActivity.find = jest.fn().mockReturnValue(
                {
                    select: jest.fn().mockReturnValue(
                        {
                            where: jest.fn().mockReturnValue(
                                { lt: jest.fn().mockResolvedValue(activities) }
                            )
                        }
                    )
                }
            );
        });
        test('should respond with activities', async () => {
            const result = await activityService.getAllActivities(queryOptions);
            expect(result).toStrictEqual(activities);
        });
    });

    describe('when the activities are found and there are not price filters', () => {
        const queryOptions = {
            searchString: 'test',
        };
        const activities = [{ name: "", description: "", location: "", duration: 0, petsPermited: false, state: "" }];
        beforeAll(() => {
            mockedActivity.find = jest.fn().mockResolvedValue(activities);
        });
        test('should respond with activities', async () => {
            const result = await activityService.getAllActivities(queryOptions);
            expect(result).toStrictEqual(activities);
        });
    });

    describe('when an error occurs while filtering', () => {
        const queryOptions = {
            duration: 'test',
        };
        beforeAll(() => {
            mockedActivity.find = jest.fn().mockRejectedValue(new Error());
        });
        test('should throw an error', async () => {
            await expect(activityService.getAllActivities(queryOptions))
                .rejects.toMatchObject({ status: 500, message: 'Ha habido un error en el servidor.' });
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
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue(activity);
        });
        test('should respond with a activity', async () => {
            const result = await activityService.getOneActivity(activityId);
            expect(result).toStrictEqual(activity);
        });
    });

    describe('when the activity id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });

        test('should throw an error', async () => {
            await expect(activityService.getOneActivity(activityId))
                .rejects.toMatchObject({ status: 400, message: 'El identificador de la actividad no es válido' });
        });
    });

    describe('when the activity is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById = jest.fn().mockResolvedValue(null);
        });

        test('should throw an error', async () => {
            await expect(activityService.getOneActivity(activityId))
                .rejects.toMatchObject({ status: 404, message: 'Actividad no encontrada' });
        });
    });

    describe('when there is an error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
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
    beforeEach(() => {
        activityService = new ActivityService();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('When there are events', () => {
        const activity: ActivityDoc = {
            name: 'Hiking',
            location: 'Mountains',
            duration: 120,
            description: 'A fun and challenging activity for nature lovers',
            accesibility: 'Moderate',
            petsPermited: true,
            state: ActivityState.abierta,
            images: ['image1.jpg', 'image2.jpg'],
            events: [new Event(10, new Date(), 10, 'English', 'John Doe'), new Event(10, new Date(), 10, 'English', 'John Doe')]
          } as ActivityDoc;
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById.mockResolvedValue(activity);
        });

        test('Should return the events', async () => {
            const events = await activityService.getEvents('1234');
            expect(events).toEqual(activity.events);
        });
    });

    describe('When there are no events', () => {
        const activity: ActivityDoc = {
            name: 'Hiking',
            location: 'Mountains',
            duration: 120,
            description: 'A fun and challenging activity for nature lovers',
            accesibility: 'Moderate',
            petsPermited: true,
            state: ActivityState.abierta,
            images: ['image1.jpg', 'image2.jpg'],
            events: []
          } as ActivityDoc;
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById.mockResolvedValue(activity);
        });

        test('Should return an error', async () => {
            await expect(activityService.getEvents('1234')).rejects.toEqual({
                status: 404,
                message: "No hay eventos para esta actividad"
            });
        });
    });

    describe('When the activity does not exist', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivity.findById.mockResolvedValue(null);
        });

        test('Should return an error', async () => {
            await expect(activityService.getEvents('1234')).rejects.toEqual({
                status: 404,
                message: "No se ha encontrado la actividad"
            });
        });
    });

    describe('When the activity id is not valid', () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        });
        test('Should return an error', async () => {
            await expect(activityService.getEvents('1234')).rejects.toEqual({
                status: 400,
                message: "El id de la actividad no es válido"
            });
        });
    });

});
