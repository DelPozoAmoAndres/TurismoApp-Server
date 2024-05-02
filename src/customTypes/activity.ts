import { Document } from 'mongoose';
import { Event } from '@customTypes/event';
import { Review } from '@customTypes/review';

// Definición de la interfaz para la actividad
export interface ActivityDoc extends Document {
  name: string;
  location: string;
  duration: number;
  description: Map<string, string>;
  events?: Event[];
  reviews?: Review[];
  category:ActivityCategory;
  state: ActivityState;
  images:any[]
}

export enum ActivityState { "abierta", "parada temporalmente", "cancelada" }
export enum ActivityCategory { "cultural"="cultural", "deportiva"="deportiva", "gastronómica"="gastronómica", "naturaleza"="naturaleza", "nocturna"="nocturna", "religiosa"="religiosa", "social"="social"}
