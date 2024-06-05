jest.mock('@models/activitySchema');
import { ActivityCategory } from "@customTypes/activity";
import ActivitySchema from "@models/activitySchema";
const mockedActivity = ActivitySchema as jest.Mocked<typeof ActivitySchema>;

jest.mock('@models/userSchema');
import UserScheme from "@models/userSchema";
const mockedUser = UserScheme as jest.Mocked<typeof UserScheme>;



jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        model: () => ({
            countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(5) }),
        })
    }
});

import DashboardService from '@services/dashboardService';

describe('Get total reservations', () => {
    let dashboardService: DashboardService;

    beforeAll(() => {
        dashboardService = new DashboardService();
        mockedUser.aggregate = jest.fn().mockResolvedValue([{ totalReservations: 5 }]);
    });

    test('should return the total reservations', async () => {
        const result = await dashboardService.getTotalReservations();
        expect(result).toBe(5);
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getTotalReservations())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    });

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getTotalReservations())
                .rejects.toMatchObject(error);
        });
    });
});

describe('Get total income', () => {
    let dashboardService: DashboardService;

    beforeAll(() => {
        dashboardService = new DashboardService();
        mockedUser.aggregate = jest.fn().mockResolvedValue([{ totalIncome: 5 }]);
    });

    test('should return the total income', async () => {
        const result = await dashboardService.getTotalIncome();
        expect(result).toBe(5);
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getTotalIncome())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    });

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getTotalIncome())
                .rejects.toMatchObject(error);
        });
    });
});

describe('Get occupation', () => {
    let dashboardService: DashboardService;

    let occupationPoints: { day: number, occupationRatio: number }[] = []

    beforeAll(() => {

        for (let i = 1; i <= 30; i++) {
            if (i == 1 || i == 2) {
                occupationPoints.push({ day: i, occupationRatio: 50 })
                continue;
            }
            occupationPoints.push({ day: i, occupationRatio: 0 })
        }

        dashboardService = new DashboardService();
        mockedActivity.aggregate = jest.fn().mockResolvedValue([{ _id: 1, averageOccupationRatio: 0.5 }, { _id: 2, averageOccupationRatio: 0.5 }]);
    });

    test('should return the ocupation', async () => {
        const result = await dashboardService.getOccupation();
        expect(result).toEqual({ occupationRate: "50.00", occupationPoints });
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getOccupation())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    })

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getOccupation())
                .rejects.toMatchObject(error);
        });
    });
})

describe('Get total users', () => {
    let dashboardService: DashboardService;

    beforeAll(() => {
        dashboardService = new DashboardService();
    });

    test('should return the total users', async () => {
        const result = await dashboardService.getTotalUsers();
        expect(result).toBe(5);
    });
});

describe('Get cancelation rate', () => {
    let dashboardService: DashboardService;
    let cancelationsByDayOfMonth: { period: string, cancellations: number }[] = []

    beforeAll(() => {

        for (let i = 1; i <= new Date().getDate(); i++) {
            if (i == 1 || i == 2) {
                cancelationsByDayOfMonth.push({ period: i.toString(), cancellations: 25 })
                continue;
            }
            cancelationsByDayOfMonth.push({ period: i.toString(), cancellations: 0 })
        }

        dashboardService = new DashboardService();
        mockedUser.aggregate = jest.fn().mockResolvedValue([{ _id: "2024-03-01", totalCancelations: 25 }, { _id: '2024-03-02', totalCancelations: 25 }]);
        dashboardService.getTotalReservations = jest.fn().mockResolvedValue(50);
    });

    test('should return the cancelation rate', async () => {
        const result = await dashboardService.getCancelationRate();
        expect(result).toEqual({ "cancelRate": "100.00", cancelationsByDayOfMonth });
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getCancelationRate())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    })

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getCancelationRate())
                .rejects.toMatchObject(error);
        });
    });
})

describe('Get category reservations', () => {

    let dashboardService: DashboardService;
    let categoryReservations: { category: string, reservationsRate: number }[] = []

    beforeAll(() => {

        for (let category in ActivityCategory) {
            if (!Number.isNaN(Number(category))) {
                continue;
            }
            if (category == "cultural") {
                categoryReservations.push({ category: category, reservationsRate: 100 })
                continue;
            }
        }

        dashboardService = new DashboardService();
        mockedActivity.aggregate = jest.fn().mockResolvedValue([{ category: "cultural", totalReservations: 5 }]);
    });

    test('should return the category reservations', async () => {
        const result = await dashboardService.getCategoryReservations();
        expect(result).toEqual(categoryReservations);
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getCategoryReservations())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    })

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedActivity.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getCategoryReservations())
                .rejects.toMatchObject(error);
        });
    });
});

describe('Get reservations', () => {
    let dashboardService: DashboardService;

    beforeAll(() => {
        dashboardService = new DashboardService();
        mockedUser.aggregate = jest.fn().mockResolvedValue([{ eventId: "1", reservations: [] }]);
        mockedActivity.findOne = jest.fn().mockResolvedValue({ name: "name", date: "date", price: 5 });
    });

    test('should return the reservations', async () => {
        const result = await dashboardService.getReservations();
        expect(result).toEqual([{ eventId: "1", reservations: [{ "activity": { name: "name", date: "date", price: 5 } }] }]);
    });

    describe('when throw a default error', () => {

        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(new Error('Error'));
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getReservations())
                .rejects.toMatchObject({ status: 500, message: 'Error' });
        });
    })

    describe('when throw a custom error', () => {
        const error = { status: 400, message: 'Error' }
        beforeAll(() => {
            mockedUser.aggregate = jest.fn().mockRejectedValue(error);
        });

        test('should throw an error', async () => {
            await expect(dashboardService.getReservations())
                .rejects.toMatchObject(error);
        });
    });
});