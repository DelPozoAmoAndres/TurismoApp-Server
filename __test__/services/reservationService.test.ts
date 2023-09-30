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

import PaymentService from "@services/paymentService";
class MockedClass implements PaymentService {
    createIntent = jest.fn();
    confirmIntent = jest.fn();
    verifyStatus = jest.fn().mockResolvedValue("success");
    cancelPayment = jest.fn();
}
const mockedPaymentService = new MockedClass();

import { User } from "@customTypes/user";
import { ReservationDoc } from "@customTypes/reservation";
import ReservationService from "@services/reservationService";
import { ActivityDoc } from "@customTypes/activity";
import { PaymentIntent } from "@customTypes/payment";

describe("Get one reservation", () => {
    let reservationService: ReservationService;
    beforeEach(() => {
        reservationService = new ReservationService(mockedPaymentService);
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

// describe("Get all reservations", () => {
//     let reservationService: ReservationService;
//     beforeEach(() => {
//         reservationService = new ReservationService(mockedPaymentService);
//     });

//     afterEach(() => {
//         jest.resetAllMocks();
//     });

//     describe("when there are reservations", () => {
//         let reservation : ReservationDoc ={numPersons:2,eventId:"1"} as ReservationDoc;
//         let user : User = {reservations: [reservation]} as User;
//         let activity : ActivityDoc = {name:"test",events:[{id:"1"}]} as unknown as ActivityDoc;
//         let resultReservation ={numPersons:2,activity:{name:"test"},state:"success",event:{id:"1"}};
//         beforeAll(()=>{
//             mockedUser.findOne.mockResolvedValue(user);
//             const mockToJSON = jest.fn().mockReturnValue(resultReservation.activity);
//             mockedActivity.findOne.mockResolvedValue({ ...activity, toJSON: mockToJSON });
//         })

//         test("should return the reservations", async () => {
//             const result = await reservationService.getAllReservations("userId");
//             expect(result).toEqual([resultReservation]);
//         });
//     });

//     describe("when there are not reservations", () => {
//         beforeAll(()=>{
//             mockedUser.findOne.mockResolvedValue(undefined);
//         })

//         test("should return an empty array", async () => {
//             const result = await reservationService.getAllReservations("userId");
//             expect(result).toEqual([]);
//         });
//     });

//     describe("when there is an error", () => {
//         beforeAll(()=>{
//             mockedUser.findOne.mockRejectedValue("error");
//         })

//         test("should throw an error", async () => {
//             await expect(reservationService.getAllReservations("userId")).rejects.toMatchObject({
//                  status: 500, message: 'Ha habido un error en el servidor.' });
//         });
//     });
// });