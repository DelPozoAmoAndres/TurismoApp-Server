import mongoose,{ Schema, Document } from "mongoose";

export interface EventDoc extends Document {
    seats: Number;
    bookedSeats: Number;
    date: Date;
    price: Number;
    language: string;
    guide: string;
}

// Esquema de la actividad
export const eventSchema: Schema = new Schema({
    seats: { type: Number, required: true },
    bookedSeats: { type: Number, required: true },
    guide: { type: String, required: true },
    date: { type: Date, required: true },
    language: { type: String, required: false },
    price: { type: Number, required: true },
});

export enum RepeatType { "days", "range" }

// Modelo de la actividad
export default mongoose.model<EventDoc>('Event', eventSchema);