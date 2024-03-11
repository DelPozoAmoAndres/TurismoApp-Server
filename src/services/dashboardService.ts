import { ActivityCategory } from "@customTypes/activity";
import ActivitySchema from "@models/activitySchema";
import User from "@models/userSchema"
import { get } from "mongoose";

export class DashboardService {
    getTotalReservations = async () => {
        try {
            const result = await User.aggregate([
                // Desagrega las reservas para poder contarlas
                { $unwind: '$reservations' },
                // Agrupa los resultados (en este caso, no estamos agrupando por ninguna clave específica)
                { $group: { _id: null, totalReservations: { $sum: 1 } } },
                // Proyecta el resultado para mostrar solo el total de reservas
                { $project: { _id: 0, totalReservations: 1 } }
            ]);

            // Siempre devuelve un valor, incluso si no se encontraron reservas
            const total = result.length ? result[0].totalReservations : 0;
            return total; // Devuelve el número directamente

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
                // Desagrega las reservas para poder sumar sus precios
                { $unwind: '$reservations' },
                // Filtra las reservas por el estado "completed"
                { $match: { 'reservations.state': 'success' } },
                // Agrupa los resultados (en este caso, no estamos agrupando por ninguna clave específica)
                { $group: { _id: null, totalIncome: { $sum: '$reservations.price' } } },
                // Proyecta el resultado para mostrar solo el total de ingresos
                { $project: { _id: 0, totalIncome: 1 } }
            ]);
            // Siempre devuelve un valor, incluso si no se encontraron reservas
            const total = result.length ? result[0].totalIncome : 0;
            return total; // Devuelve el número directamente

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
                // Desagrega los eventos para poder calcular la relación de ocupación
                { $unwind: '$events' },
                // Filtra los eventos por el mes actual
                { $match: { 'events.date': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
                // Agrupa los resultados por día del mes
                { $group: { _id: { $dayOfMonth: '$events.date' }, averageOccupationRatio: { $avg: { $divide: [{ $subtract: ['$events.seats', '$events.bookedSeats'] }, '$events.seats'] } } } },
                // Proyecta el resultado para mostrar solo el día del mes y la relación de ocupación promedio
                { $project: { _id: 1, averageOccupationRatio: 1 } },
                // Ordena los resultados por día del mes de forma ascendente
                { $sort: { _id: 1 } }
            ]);

            const occupationRatioByDayOfMonth: { day: number, occupationRatio: number }[] = [];
            // Construye un objeto con la relación de ocupación promedio por día del mes
            result.forEach(({ _id, averageOccupationRatio }) => {
                const day = _id;
                occupationRatioByDayOfMonth.push({ day, occupationRatio: Number((1 - averageOccupationRatio).toFixed(2)) * 100 });
            });

            for (let index = 1; index <= 30; index++) {
                if (occupationRatioByDayOfMonth.at(index) !== null) occupationRatioByDayOfMonth.push({ day: index, occupationRatio: 0 });
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
                // Desagrega las reservas para poder contarlas
                { $unwind: '$reservations' },
                // Filtra las reservas por el estado "canceled"
                { $match: { 'reservations.state': 'canceled', 'reservations.date': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
                // Agrupa los resultados por día del mes
                { $group: { _id: '$reservations.date', totalCancelations: { $sum: 1 } } },
                // Proyecta el resultado para mostrar solo el día del mes y el total de cancelaciones
                { $project: { _id: 1, totalCancelations: 1 } },
                // Ordena los resultados por día del mes de forma ascendente
                { $sort: { _id: 1 } }
            ]);


            const cancelationsByDayOfMonth: { period: string, cancellations: number }[] = [];
            // Construye un objeto con el número de cancelaciones por día del mes
            result.forEach(({ _id, totalCancelations }) => {
                const date = new Date(_id).getDate().toString();
                cancelationsByDayOfMonth.push({ period: date, cancellations: totalCancelations });
            }, {});

            for (let index = 1; index <= new Date().getDate(); index++) {
                if (cancelationsByDayOfMonth.at(index) !== null) cancelationsByDayOfMonth.push({ period: index.toString(), cancellations: 0 });
            };

            cancelationsByDayOfMonth.sort((a, b) => parseInt(a.period) - parseInt(b.period));

            // Obtiene el total de reservas canceladas
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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const categoryStats = await ActivitySchema.aggregate([
                { $unwind: '$events' },
                { $match: { 'events.date': { $gte: today, $lt: tomorrow } } },
                {
                    $group: {
                        _id: '$category',
                        totalReservations: { $sum: 1 }
                    }
                },
                { $project: { _id: 0, category: '$_id', totalReservations: 1 } }
            ]);

            // Inicializar un objeto con todas las categorías posibles establecidas en 0
            const allCategories: { [key: string]: number } = {};
            for (let category in ActivityCategory) {
                if (!isNaN(Number(category))) continue;
                allCategories[category] = 0;
            }

            const totalReservations = categoryStats.reduce((acc, { totalReservations }) => acc + totalReservations, 0);

            // Iterar sobre los resultados de la consulta y actualizar los valores correspondientes
            for (let stat of categoryStats) {
                allCategories[stat.category] = stat.totalReservations / totalReservations * 100;
            }

            // Convertir el objeto a un array de objetos
            let result = Object.keys(allCategories).map(category => ({
                category,
                reservationsRate: allCategories[category]
            }));
            // Si todas las categorías tienen 0 reservas, añadir un objeto con la categoría "Sin reservas"
            if (result.every(category => category.reservationsRate === 0)) {
                result.push({ category: 'Sin reservas', reservationsRate: 100 });
            }
            console.log(result);
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
            //Devuelve las ultimas 50 reservas realizadas da igual el usuario
            const users = await User.aggregate([
                { $unwind: '$reservations' },
                { $sort: { 'reservations.date': -1 } },
                { $limit: 50 }
            ]);
            return await Promise.all(users.map(async (user) => {
                const activity = await ActivitySchema.findOne({ 'events$._id': user.eventId });
                return { ...user, reservations:[{...user.reservations, activity }] };
            }));
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}
