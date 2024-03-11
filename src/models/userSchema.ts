import mongoose, { Schema } from "mongoose";
import { User } from "../customTypes/user";
import bcrypt from 'bcrypt';
import ActivitySchema from "./activitySchema";
import { ReservationDoc } from "@customTypes/reservation";

const UserScheme = new Schema<User>(
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
            paymentId: { type: String, required: true },
            price: { type: Number, required: true },
            state: { type: String, required: false },
            date:{type: Date, required: true},
        }],

    },
    { timestamps: true }
);

// Antes de guardar un usuario, hasheamos su contraseña
UserScheme.pre<User>('save', async function () {
    const user = this;

    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    }
});

// Antes de actualizar un usuario, hasheamos su contraseña
UserScheme.pre<User>('findOneAndUpdate', async function () {
    const query = this as any; // referencia a la query
    const update = query.getUpdate(); // obtiene el objeto update de la query
    if (update.password && !update.password.includes("$2b&10$")) { // chequea si hay una nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(update.password, salt);
        update.password = hash;
    }
});

UserScheme.pre<User>(['save'], async function () {
    const updatedUser = this;
    if (updatedUser.isModified('reservations')) {
        const reservation = updatedUser.reservations.at(-1);
        const activity = await ActivitySchema.findOne({ 'events._id': reservation.eventId }, { 'events.$': 1 });
        const newBookedSeats = activity.events[0].bookedSeats + reservation.numPersons;
        await ActivitySchema.updateOne(
            { 'events._id': reservation.eventId },
            { $set: { "events.$.bookedSeats": newBookedSeats } }
        );
    }
});

UserScheme.pre<User>('deleteOne', async function () {
    const query = this as any; 
    const user = await UserSchema.findOne(query);

    if (user && user.reservations) {
        const reservations = user.reservations.filter(reservation => reservation.state === 'success');
        console.log(user.reservations);

        for (let i = 0; i < reservations.length; i++) {
            const reservation = reservations[i];
            const activity = await ActivitySchema.findOne({ 'events._id': reservation.eventId }, { 'events.$': 1 });

            if (activity && new Date(activity.events[0].date) > new Date()) {
                const newBookedSeats = activity.events[0].bookedSeats - reservation.numPersons;
                await ActivitySchema.updateOne(
                    { 'events._id': reservation.eventId },
                    { $set: { "events.$.bookedSeats": newBookedSeats } }
                );
            }
        }
    }
});

const UserSchema = mongoose.model<User>('User', UserScheme);

export default UserSchema;