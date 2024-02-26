import { Document } from "mongoose";

export interface Review extends Document {
    reservationId: string;
    score: number;
    comment?: string;
    author: string;
    authorName?:string;
    authorImage?:string;
    date:string;
  }