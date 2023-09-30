import { Document } from "mongoose";

export interface Review extends Document {
    score: number;
    comment?: string;
    author: string;
    authorName?:string;
    authorImage?:string;
  }