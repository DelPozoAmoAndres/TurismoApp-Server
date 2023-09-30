import { Document } from 'mongoose';
import { ReservationDoc } from './reservation';

export interface User extends Document {
    name: string;
    email: string;
    birthday?: Date;
    telephone?: Number;
    country?: string;
    password?: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
    reservations?: ReservationDoc[];
}

export enum Role { "administrador" = "admin", "turista" = "user", "guía" = "worker" }
