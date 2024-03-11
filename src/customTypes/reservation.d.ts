import { PaymentStatus } from './payment';

export interface ReservationDoc extends Document {
    numPersons:number;
    price:number;
    eventId:string;
    name:string;
    email:string;
    telephone:number;
    state:PaymentStatus;
    paymentId:string;
    date:Date;
}