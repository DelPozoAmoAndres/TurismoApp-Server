import mongoose, { Schema, Document } from 'mongoose';

// Definición de la interfaz para la actividad
export interface Activity extends Document {
  name: string;
  location: string;
  duration: number;
  description: string;
  events: Event[] | null;
  accesibility: string;
  petsPermited: boolean;
  state: ActivityState;
}

export enum ActivityState { "abierta", "parada temporalmente", "cancelada" }

// Esquema de la actividad
const activitySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: Number, required: true },
  events: {
    type: [{
      seats: Number,
      availableSeats: Number,
      date: Date,
      price: Number,
      language: String,
    }],
    required: false
  },
  accesibility: { type: String, required: true },
  petsPermited: { type: Boolean, required: true },
  state: { type: String, required: true },
});

const eventSchema: Schema = new Schema({
  seats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  date: { type: Date, required: true },
  language: { type: String, required: true },
  price: { type: Number, required: false },
});

export interface Event {
  seats: Number;
  availableSeats: Number;
  date: Date;
  price: Number;
  language: string;
}

// Modelo de la actividad
export default mongoose.model<Activity>('Activity', activitySchema);

