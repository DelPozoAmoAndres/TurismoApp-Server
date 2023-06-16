import mongoose, { Schema, Document } from 'mongoose';

// Definición de la interfaz para la actividad
export interface ActivityDoc extends Document {
  name: string;
  location: string;
  duration: number;
  description: string;
  events?: EventDoc[];
  reviews?: ReviewDoc[];
  accesibility: string;
  petsPermited: boolean;
  state: ActivityState;
  images:any[]
}

export enum ActivityState { "abierta", "parada temporalmente", "cancelada" }

export interface EventDoc extends Document {
  seats: number;
  bookedSeats: number;
  date: Date;
  price: number;
  language: string;
  guide: string;
}

export enum RepeatType { "days", "range" }

export interface ReviewDoc extends Document {
  score: number;
  comment?: string;
  author: string;
  authorName?:string;
  authorImage?:string;
}

// Esquema de la actividad
const activitySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: Number, required: true },
  events: [{
    seats: { type: Number, required: true },
    bookedSeats: { type: Number, required: true },
    guide: { type: String, required: true },
    date: { type: Date, required: true },
    language: { type: String, required: true },
    price: { type: Number, required: true },
  }],
  reviews:[{
    score: {type:Number, required:true},
    comment: {type:String, required:false},
    author: {type:String, required:true},
  }],
  accesibility: { type: String, required: true },
  petsPermited: { type: Boolean, required: true },
  state: { type: String, required: true },
  images: [],
});


export default mongoose.model<ActivityDoc>('Activity', activitySchema);

