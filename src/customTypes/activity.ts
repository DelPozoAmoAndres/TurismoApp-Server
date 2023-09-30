import { Document } from 'mongoose';
import { Event } from '@customTypes/event';
import { Review } from '@customTypes/review';

// Definición de la interfaz para la actividad
export interface ActivityDoc extends Document {
  name: string;
  location: string;
  duration: number;
  description: string;
  events?: Event[];
  reviews?: Review[];
  accesibility: string;
  petsPermited: boolean;
  state: ActivityState;
  images:any[]
}

export enum ActivityState { "abierta", "parada temporalmente", "cancelada" }
