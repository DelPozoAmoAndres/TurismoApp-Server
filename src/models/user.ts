import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { ActivityDoc } from './activity';
import { PaymentStatus } from './paymentService';

export interface UserDoc extends Document {
    name: string;
    email: string;
    birthday : Date;
    telephone: Number;
    country: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    reservations?: ReservationDoc[];
    schedules:Schedule[];
}

export interface ReservationDoc extends Document {
    numPersons:number;
    price:number;
    eventId:String;
    name:String;
    email:string;
    telephone:number;
    state:PaymentStatus;
    paymentId:String;
}

export interface Schedule {
    name:string,
    activities:ActivityDoc[];
}

export enum Role { "administrador" = "admin", "turista" = "user", "guía" = "worker" }

const UserSchema = new Schema<UserDoc>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        birthday: { type: Date, required: false },
        country: { type: String, required: false },
        telephone: { type: Number, required: false },
        password: { type: String, required: true },
        role: { type: String, required: true },
        reservations: [{
            numPersons: { type: Number, required: true },
            eventId: { type: String, required: true },
            email: { type: String, required: true },
            name: { type: String, required: false },
            telephone: { type: Number, required: true },
            paymentId: {type: String, required: true},
            price: {type:Number, required:true}
        }]

    },
    { timestamps: true }
);

// Antes de guardar un usuario, hasheamos su contraseña
UserSchema.pre<UserDoc>('save', async function () {
    const user = this;

    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    }
});

// Antes de actualizar un usuario, hasheamos su contraseña
UserSchema.pre<UserDoc>('findOneAndUpdate', async function () {
    const query = this as any; // referencia a la query
    const update = query.getUpdate(); // obtiene el objeto update de la query
    if (update.password && !update.password.includes("$2b&10$")) { // chequea si hay una nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(update.password, salt);
        update.password = hash;
    }
});

const User = mongoose.model<UserDoc>('User', UserSchema);

export default User;
