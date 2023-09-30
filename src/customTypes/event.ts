export class Event{
    id?:string;
    seats: number;
    bookedSeats: number;
    date: Date;
    price: number;
    language: string;
    guide: string;

    constructor(
        seats: number,
        date: Date,
        price: number,
        language: string,
        guide: string
    ) {
        this.seats = seats;
        this.date = date;
        this.price = price;
        this.language = language;
        this.guide = guide;
    }
}

export enum RepeatType { "days", "range" }