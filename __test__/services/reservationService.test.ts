jest.mock("@models/userSchema");
import UserSchema from "@models/userSchema";
const mockedUser = UserSchema as jest.Mocked<typeof UserSchema>;

jest.mock("@models/activitySchema");
import ActivitySchema from "@models/activitySchema";
const mockedActivity = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

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

jest.mock("@services/stripeService");
import StripeService from "@services/stripeService";
const mockedPaymentService = StripeService as jest.Mocked<typeof StripeService>;

import { User } from "@customTypes/user";
import { ReservationDoc } from "@customTypes/reservation";
import ReservationService from "@services/reservationService";
import { ActivityDoc, ActivityState } from "@customTypes/activity";
import { PaymentIntent } from "@customTypes/payment";

describe("Get one reservation", () => {
    let reservationService: ReservationService;
    beforeEach(() => {
        mockedPaymentService.prototype.verifyStatus = jest.fn().mockResolvedValue("success");
        reservationService = new ReservationService(new mockedPaymentService());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("when there is a reservation with the given id", () => {
        let reservation : ReservationDoc ={numPersons:2,eventId:"1"} as ReservationDoc;
        let user : User = {reservations: [reservation]} as User;
        let activity : ActivityDoc = {name:"test",events:[{id:"1"}]} as unknown as ActivityDoc;
        let resultReservation ={numPersons:2,activity:{name:"test"},state:"success",event:{id:"1"}};
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findOne.mockResolvedValue(user);
            const mockToJSON = jest.fn().mockReturnValue(resultReservation.activity);
            mockedActivity.findOne.mockResolvedValue({ ...activity, toJSON: mockToJSON });
        })

        test("should return the reservation", async () => {
            const result = await reservationService.getOneReservation("id", "userId");
            expect(result).toEqual(resultReservation);
        });
    });

    describe("when there is not a reservation with the given id", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findOne.mockResolvedValue(undefined);
        })

        test("should throw an error", async () => {
            await expect(reservationService.getOneReservation("id", "userId")).rejects.toMatchObject({
                status: 404, message: 'La reserva no existe.'});
        });
    });

    describe("when the reservation id is not valid", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
            mockedUser.findOne.mockRejectedValue(new Error());
        })

        test("should throw an error", async () => {
            await expect(reservationService.getOneReservation("id", "userId")).rejects.toMatchObject({
                 status: 400, message: 'El id de la reserva no es válido.' });
        });
    });

    describe("when there is an error", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findOne.mockRejectedValue("error");
        })

        test("should throw an error", async () => {
            await expect(reservationService.getOneReservation("id", "userId")).rejects.toMatchObject({
                 status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });
});

describe("Get all reservations", () => {
    let reservationService: ReservationService;
    beforeEach(() => {
        mockedPaymentService.prototype.verifyStatus = jest.fn().mockResolvedValue("success");
        reservationService = new ReservationService(new mockedPaymentService());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("when there are reservations", () => {
        let reservation : ReservationDoc ={numPersons:2,eventId:"1",state:"success"} as ReservationDoc;
        let user : User = {reservations: [reservation]} as User;
        let activity : ActivityDoc = {name:"test",events:[{id:"1",date:"2021-06-01T00:00:00.000Z"}], state:ActivityState.abierta} as unknown as ActivityDoc;
        let resultReservation ={dateFrom:"2021-06-01T00:00:00.000Z",dateTo:"2021-06-01T00:00:00.000Z", reservations:[{numPersons:2,activity,state:"success",event:{id:"1",date:"2021-06-01T00:00:00.000Z"}}]};
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findById.mockResolvedValue(user);
            const mockToJSON = jest.fn().mockReturnValue(activity);
            mockedActivity.findOne.mockResolvedValue({ ...activity, toJSON: mockToJSON });
        })

        test("should return the reservations", async () => {
            const result = await reservationService.getAllReservations("userId");
            expect(result).toEqual([resultReservation]);
        });
    });

    describe("when there are not reservations", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findById.mockResolvedValue(undefined);
        })

        test("should return an error", async () => {
            await expect(reservationService.getAllReservations("userId")).rejects.toMatchObject({ 
                status: 404, message: 'El usuario no tiene reservas'});
        });
    });

    describe("when there is a default error", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findById.mockRejectedValue(new Error());
        })

        test("should throw an error", async () => {
            await expect(reservationService.getAllReservations("userId")).rejects.toMatchObject({
                status: 500, message: 'Ha habido un error en el servidor.'});
        });
    });

    describe("when there is a custom error", () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.findById.mockRejectedValue(error);
        })

        test("should throw an error", async () => {
            await expect(reservationService.getAllReservations("userId")).rejects.toMatchObject({
                 status: error.status, message: error.message });
        });
    });
});

describe("Get all admin reservations", () => {
    let reservationService: ReservationService;
    beforeEach(() => {
        mockedPaymentService.prototype.verifyStatus = jest.fn().mockResolvedValue("success");
        reservationService = new ReservationService(new mockedPaymentService());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("when there are reservations", () => {
        let reservation : ReservationDoc ={numPersons:2,eventId:"1",state:"success"} as ReservationDoc;
        let user : User = {reservations: [reservation]} as User;
        let resultReservation ={numPersons:2,state:"success",eventId:"1"};
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.find.mockResolvedValue([user]);
        })

        test("should return the reservations", async () => {
            const result = await reservationService.getAllReservationsAdmin();
            expect(result).toEqual([resultReservation]);
        });
    });

    describe("when there are not reservations", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.find.mockResolvedValue(undefined);
        })

        test("should return an error", async () => {
            await expect(reservationService.getAllReservationsAdmin()).rejects.toMatchObject({ 
                status: 404, message: 'No hay reservas'});
        });
    });

    describe("when there is a default error", () => {
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.find.mockRejectedValue(new Error());
        })
        
        test("should throw an error", async () => {
            await expect(reservationService.getAllReservationsAdmin()).rejects.toMatchObject({
                status: 500, message: 'Ha habido un error en el servidor.'});
        });

    });

    describe("when there is a custom error", () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(()=>{
            mockedMongoose.Types.ObjectId.isValid= jest.fn().mockReturnValue(true);
            mockedUser.find.mockRejectedValue(error);
        })

        test("should throw an error", async () => {
            await expect(reservationService.getAllReservationsAdmin()).rejects.toMatchObject({
                 status: error.status, message: error.message });
        });
    });
});

describe("Create reservation", () => {
    let reservationService: ReservationService;

    beforeEach(() => {
        mockedPaymentService.prototype.verifyStatus = jest.fn().mockResolvedValue("success");
        reservationService = new ReservationService(new mockedPaymentService());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("when the reservation is created", () => {
        let reservation : ReservationDoc ={numPersons:2,eventId:"1"} as ReservationDoc;
        let user : User = {reservations: [reservation], validateSync:jest.fn().mockReturnValue(false), save:jest.fn().mockResolvedValue({})} as unknown as User;
        beforeAll(()=>{
            mockedUser.findById.mockResolvedValue(user);
        })

        test("should create the reservation", async () => {
            await reservationService.createReservation(reservation, "id", "userId");
            expect(user.save).toHaveBeenCalled();
        });
    });

    describe("when there is a default error", () => {
        beforeAll(()=>{
            mockedUser.findById.mockRejectedValue(new Error());
        })

        test("should throw an error", async () => {
            await expect(reservationService.createReservation(null, "id", "userId")).rejects.toMatchObject({
                status: 500, message: 'Ha habido un error en el servidor.' });
        });
    });

    describe("when there is a custom error", () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(()=>{
            mockedUser.findById.mockRejectedValue(error);
        })

        test("should throw an error", async () => {
            await expect(reservationService.createReservation(null, "id", "userId")).rejects.toMatchObject({
                status: error.status, message: error.message });
        });
    });
});