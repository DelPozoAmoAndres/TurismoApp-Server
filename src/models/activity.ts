import mongoose, { Schema, Document } from 'mongoose';
import Event,{EventDoc, eventSchema } from './event';

// Definición de la interfaz para la actividad
export interface ActivityDoc extends Document {
  name: string;
  location: string;
  duration: number;
  description: string;
  events?: EventDoc[] ;
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
  events: [eventSchema],
  accesibility: { type: String, required: true },
  petsPermited: { type: Boolean, required: true },
  state: { type: String, required: true },
});


export default mongoose.model<ActivityDoc>('Activity', activitySchema);

