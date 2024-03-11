import mongoose, { Schema } from 'mongoose';
import { ActivityDoc } from '@customTypes/activity';

const activitySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: Number, required: true },
  events: [{
    seats: { type: Number, required: true },
    bookedSeats: { type: Number, required: false },
    guide: { type: String, required: true },
    date: { type: Date, required: true },
    language: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String, required: false },
  }],
  reviews: [{
    score: { type: Number, required: true },
    comment: { type: String, required: false },
    author: { type: String, required: true },
    reservationId: { type: String, required: true },
  }],
  accesibility: { type: String, required: true },
  petsPermited: { type: Boolean, required: true },
  state: { type: String, required: true },
  category: { type: String, required: true },
  images: [],
});

const ActivitySchema = mongoose.model<ActivityDoc>('Activity', activitySchema);

export default ActivitySchema;