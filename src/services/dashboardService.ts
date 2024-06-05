import { ActivityCategory } from "@customTypes/activity";
import ActivitySchema from "@models/activitySchema";
import User from "@models/userSchema"
import { get } from "mongoose";

export default class DashboardService {
    getConfirmedReservations = async () => {
        try {
            const result = await User.aggregate([
                { $unwind: '$reservations' },
                { $match: { 'reservations.state': 'success' } },
                { $group: { _id: null, totalReservations: { $sum: 1 } } },
                { $project: { _id: 0, totalReservations: 1 } }
            ]);

            const total = result.length ? result[0].totalReservations : 0;
            return total;

        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getTotalReservations = async () => {
        try {
            const result = await User.aggregate([
                { $unwind: '$reservations' },
                { $group: { _id: null, totalReservations: { $sum: 1 } } },
                { $project: { _id: 0, totalReservations: 1 } }
            ]);

            const total = result.length ? result[0].totalReservations : 0;
            return total;

        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    getTotalIncome = async () => {
        try {
            const result = await User.aggregate([
                { $unwind: '$reservations' },
                { $match: { 'reservations.state': 'success' } },
                { $group: { _id: null, totalIncome: { $sum: '$reservations.price' } } },
                { $project: { _id: 0, totalIncome: 1 } }
            ]);
            const total = result.length ? result[0].totalIncome : 0;
            return total;

        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getOccupation = async () => {
        try {
            const result = await ActivitySchema.aggregate([
                { $unwind: '$events' },
                { $match: { 'events.date': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
                { $group: { _id: { $dayOfMonth: '$events.date' }, averageOccupationRatio: { $avg: { $divide: [{ $subtract: ['$events.seats', '$events.bookedSeats'] }, '$events.seats'] } } } },
                { $project: { _id: 1, averageOccupationRatio: 1 } },
                { $sort: { _id: 1 } }
            ]);

            const occupationRatioByDayOfMonth: { day: number, occupationRatio: number }[] = [];
            result.forEach(({ _id, averageOccupationRatio }) => {
                const day = _id;
                occupationRatioByDayOfMonth.push({ day, occupationRatio: Number((1 - averageOccupationRatio).toFixed(2)) * 100 });
            });

            for (let index = 1; index <= 30; index++) {
                if (occupationRatioByDayOfMonth.find(data => data.day === index) === undefined) occupationRatioByDayOfMonth.push({ day: index, occupationRatio: 0 });
            };

            occupationRatioByDayOfMonth.sort((a, b) => a.day - b.day);

            const occupationRate = (100 - (result.reduce((acc, { averageOccupationRatio }) => acc + averageOccupationRatio, 0) / result.length * 100)).toFixed(2);

            return {
                occupationRate,
                occupationPoints: occupationRatioByDayOfMonth
            }
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getTotalUsers = async () => {
        try {
            return await User.countDocuments().exec();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getCancelationRate = async () => {
        try {
            const result = await User.aggregate([
                { $unwind: '$reservations' },
                { $match: { 'reservations.state': 'canceled', 'reservations.date': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
                { $group: { _id: '$reservations.date', totalCancelations: { $sum: 1 } } },
                { $project: { _id: 1, totalCancelations: 1 } },
                { $sort: { _id: 1 } }
            ]);

            const cancelationsByDayOfMonth: { period: string, cancellations: number }[] = [];
            result.forEach(({ _id, totalCancelations }) => {
                const date = new Date(_id).getDate().toString().split("T")[0];
                if (cancelationsByDayOfMonth.find(cancelation => cancelation.period === date)) {
                    cancelationsByDayOfMonth.find(cancelation => cancelation.period === date).cancellations += totalCancelations;
                }
                cancelationsByDayOfMonth.push({ period: date, cancellations: totalCancelations });
            }, {});

            for (let index = 1; index <= new Date().getDate(); index++) {
                const value = cancelationsByDayOfMonth.find((cancelation => Number(cancelation.period) == index));
                if (value === undefined) cancelationsByDayOfMonth.push({ period: index.toString(), cancellations: 0 });
            };

            cancelationsByDayOfMonth.sort((a, b) => parseInt(a.period) - parseInt(b.period));

            const totalCancelations = result.reduce((acc, { totalCancelations }) => acc + totalCancelations, 0);
            const cancelRate = (totalCancelations / await this.getTotalReservations() * 100).toFixed(2);
            return {
                cancelationsByDayOfMonth: [...cancelationsByDayOfMonth],
                cancelRate
            };
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getCategoryReservations = async () => {
        try {
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(firstDay);
            lastDay.setMonth(firstDay.getMonth() + 1);

            const categoryStats = await ActivitySchema.aggregate([
                { $unwind: '$events' },
                {
                    $match: {
                        'events.date': { $gte: firstDay, $lt: lastDay },
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        totalReservations: { $sum: '$events.bookedSeats' }
                    }
                },
                { $project: { _id: 0, category: '$_id', totalReservations: 1 } }
            ]);

            const allCategories: { [key: string]: number } = {};
            for (let category in ActivityCategory) {
                if (!isNaN(Number(category))) continue;
            }

            const totalReservations = categoryStats.reduce((acc, { totalReservations }) => acc + totalReservations, 0);

            for (let stat of categoryStats) {
                allCategories[stat.category] = stat.totalReservations / totalReservations * 100;
            }

            let result = Object.keys(allCategories).map(category => ({
                category,
                reservationsRate: allCategories[category]
            }));

            if (result.every(category => category.reservationsRate === 0)) {
                result = [{ category: 'sin', reservationsRate: 100 }];
            }

            return result
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getReservations = async () => {
        try {
            const users = await User.aggregate([
                { $unwind: '$reservations' },
                { $sort: { 'reservations.date': -1 } },
                { $limit: 50 }
            ]);
            return await Promise.all(users.map(async (user) => {
                const activity = await ActivitySchema.findOne({ 'events._id': user.reservations.eventId });
                return { ...user, reservations: [{ ...user.reservations, activity }] }
            }));
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}
