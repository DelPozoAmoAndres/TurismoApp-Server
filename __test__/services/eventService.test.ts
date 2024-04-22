jest.mock('@models/activitySchema');
import ActivitySchema from "@models/activitySchema";
const mockedActivitySchema = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

jest.mock('@models/userSchema');
import UserSchema from "@models/userSchema";
const mockedUserSchema = UserSchema as jest.Mocked<typeof UserSchema>;

jest.mock('@services/reservationService');
import ReservationService from '@services/reservationService';
const mockedReservationService = ReservationService as jest.Mocked<typeof ReservationService>;

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

import EventService from "@services/eventService";
import { RecurrentEventDeleteRequest } from "@customTypes/RecurrentEventDeleteRequest";

describe('Get one event', () => {
    let eventService : EventService;

    beforeAll(() => {
        eventService = new EventService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the event id is valid', () => {
        const event= {id: '123', name: 'event', date: '2021-12-12', price: 100}
            beforeAll(() => {
                mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
                mockedActivitySchema.find = jest.fn().mockResolvedValue([{events: [event]}]);
            })
        test('should return a event',async ()=>{
            const result = await eventService.getOneEvent('123');
            expect(result).toEqual(event);
            
        });
    });

    describe('when the event id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getOneEvent('123')).rejects.toMatchObject({status: 400, message: 'El identificador del evento no es válido'});
        });
    });

    describe('when the event is not found', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockResolvedValue([]);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getOneEvent('123')).rejects.toMatchObject({status: 404, message: 'Evento no encontrado'});
        });
    });

    describe('when there is a default error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockRejectedValue(new Error());
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getOneEvent('123')).rejects.toMatchObject({status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe('when there is a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockRejectedValue(error);
        });
        test('should throw an error',async ()=>{
            await expect(eventService.getOneEvent('123')).rejects.toMatchObject({status: 400, message: error.message});
        });
    });
});

describe('Get participants', () => {
    let eventService : EventService;

    beforeAll(() => {
        eventService = new EventService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the event id is valid', () => {
        const participants = [{eventId: '123', state: 'success'}]

        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockResolvedValue({ejemplo:'ejemplo'});
            mockedUserSchema.find = jest.fn().mockResolvedValue([{reservations: [{eventId: '123', state: 'success'}]}]);
        })

        test('should return a event',async ()=>{
            const result = await eventService.getParticipants('123');
            expect(result).toEqual(participants);
            
        });
    });

    describe('when the event id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getParticipants('123')).rejects.toMatchObject({status: 400, message: 'El identificador del evento no es válido'});
        });
    });

    describe('when there arent any reservations', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockResolvedValue({ejemplo:'ejemplo'});
            mockedUserSchema.find = jest.fn().mockResolvedValue(null);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getParticipants('123')).rejects.toMatchObject({status: 404, message: 'Evento no encontrado'});
        });
    });

    describe('when there is a default error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockResolvedValue({ejemplo:'ejemplo'});
            mockedUserSchema.find = jest.fn().mockRejectedValue(new Error());
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getParticipants('123')).rejects.toMatchObject({status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe('when there is a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockResolvedValue({ejemplo:'ejemplo'});
            mockedUserSchema.find = jest.fn().mockRejectedValue(error);
        });
        test('should throw an error',async ()=>{
            await expect(eventService.getParticipants('123')).rejects.toMatchObject({status: 400, message: error.message});
        });
    });
});

describe('Get worker events', () => {
    let eventService : EventService;

    beforeAll(() => {
        eventService = new EventService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the worker id is valid', () => {
        const events = [{id: '123', name: 'event', date: '2021-12-12', price: 100, guide: '123', state: 'success'}]

        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockResolvedValue([{events:events}]);
        })

        test('should return a event',async ()=>{
            const result = await eventService.getWorkerEvents('123');
            expect(result).toEqual(events);
            
        });
    });

    describe('when the worker id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getWorkerEvents('123')).rejects.toMatchObject({status: 400, message: 'El identificador del trabajador no es válido'});
        });
    });

    describe('when there is a default error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockRejectedValue(new Error());
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getWorkerEvents('123')).rejects.toMatchObject({status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe('when there is a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.find = jest.fn().mockRejectedValue(error);
        });
        test('should throw an error',async ()=>{
            await expect(eventService.getWorkerEvents('123')).rejects.toMatchObject({status: 400, message: error.message});
        });
    });
});

describe('Get all events', () => {
    let eventService : EventService;

    beforeAll(() => {
        eventService = new EventService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when there are events', () => {
        const events = [{id: '123', name: 'event', date: '2021-12-12', price: 100, guide: '123', state: 'success'}]

        beforeAll(() => {
            mockedActivitySchema.find = jest.fn().mockResolvedValue([{events:events}]);
        })

        test('should return a event',async ()=>{
            const result = await eventService.getEvents("",{});
            expect(result).toEqual(events);
            
        });
    });

    describe('when there is a default error', () => {
        beforeAll(() => {
            mockedActivitySchema.find = jest.fn().mockRejectedValue(new Error());
        })
        test('should throw an error',async ()=>{
            await expect(eventService.getEvents("",{})).rejects.toMatchObject({status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe('when there is a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedActivitySchema.find = jest.fn().mockRejectedValue(error);
        });
        test('should throw an error',async ()=>{
            await expect(eventService.getEvents("",{})).rejects.toMatchObject({status: 400, message: error.message});
        });
    });
});

describe('Delete events', () => {
    let eventService : EventService;

    beforeAll(() => {
        mockedReservationService.prototype.cancelReservation = jest.fn();
        eventService = new EventService(new mockedReservationService());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when the event id is valid', () => {

        const recurrentEventDelete : RecurrentEventDeleteRequest = {startDate: new Date(), endDate: new Date(), recurrenceDays: [1,2,3]};
        const mockedUsers = [{_id:"a",reservations:[{_id:"a",eventId:'ejemplo'}],save: jest.fn()}]
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockResolvedValue({events:[{id:'123'}]});
            mockedUserSchema.find = jest.fn().mockResolvedValue(mockedUsers);
            mockedActivitySchema.updateMany = jest.fn();
        })

        test('should return a event',async ()=>{
            const result = await eventService.deleteEvents('123',recurrentEventDelete);
            expect(mockedUsers[0].save).toBeCalled();
            
        });
    });

    describe('when the event id is not valid', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
        })
        test('should throw an error',async ()=>{
            await expect(eventService.deleteEvents('123',{startDate: new Date(), endDate: new Date(), recurrenceDays: [1,2,3]})).rejects.toMatchObject({status: 400, message: 'El identificador del evento no es válido'});
        });
    });

    describe('when there is a default error', () => {
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockRejectedValue(new Error());
        })
        test('should throw an error',async ()=>{
            await expect(eventService.deleteEvents('123',{startDate: new Date(), endDate: new Date(), recurrenceDays: [1,2,3]})).rejects.toMatchObject({status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe('when there is a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            mockedActivitySchema.findOne = jest.fn().mockRejectedValue(error);
        });
        test('should throw an error',async ()=>{
            await expect(eventService.deleteEvents('123',{startDate: new Date(), endDate: new Date(), recurrenceDays: [1,2,3]})).rejects.toMatchObject({status: 400, message: error.message});
        });
    });

});