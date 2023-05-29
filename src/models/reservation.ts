import mongoose, { Schema } from "mongoose";

export interface ReservationDoc extends Document {
    numPersons:Number;
    eventId:String;
    activityId:string;
    name:String;
    email:string;
    telephone:Number;
    state:String;
}

export const reservationSchema: Schema = new Schema({
    numPersons: { type: Number, required: true },
    eventId: { type: String, required: true },
    activityId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: false },
    telephone: { type: Number, required: true },
    state: { type: String, required: true },
});

export default mongoose.model<ReservationDoc>('Reservation', reservationSchema);