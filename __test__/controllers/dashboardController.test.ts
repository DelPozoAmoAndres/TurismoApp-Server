import request, { Response } from 'supertest';
import app from '@app'

jest.mock('@services/tokenService')
import TokenService from '@services/tokenService'
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>

jest.mock('@services/dashboardService')
import DashboardService from '@services/dashboardService'
const mockedDashboardService = DashboardService as jest.Mocked<typeof DashboardService>

const baseUrl = "/api/dashboard";
describe('GET /totalReservations', () => {
    const url = baseUrl + '/totalReservations';

    beforeAll(() => {
        mockedTokenService.prototype.adminCheck = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getTotalReservations is called', () => {
        const totalReservations = 5;
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockResolvedValue(totalReservations)
        });

        test('should return 200 and the total reservations', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toBe(totalReservations);
        });
    });

    describe('when getTotalReservations throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getTotalReservations throws an custom error', () => {
        const error = { status: 400, message: 'Error getting total reservations'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /totalIncome', () => {
    const url = baseUrl + '/totalIncome';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    }); 

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getTotalIncome is called', () => {
        const totalIncome = 500;
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalIncome = jest.fn().mockResolvedValue(totalIncome)
        });

        test('should return 200 and the total income', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toBe(totalIncome);
        });
    });

    describe('when getTotalIncome throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getTotalIncome = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getTotalIncome throws an custom error', () => {
        const error = { status: 400, message: 'Error getting total income'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalIncome = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /occupation', () => {
    const url = baseUrl + '/occupation';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getOccupation is called', () => {
        const occupation = 50;
        beforeAll(() => {
            mockedDashboardService.prototype.getOccupation = jest.fn().mockResolvedValue(occupation)
        });

        test('should return 200 and the occupation', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toBe(occupation);
        });
    });

    describe('when getOccupation throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getOccupation = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getOccupation throws an custom error', () => {
        const error = { status: 400, message: 'Error getting occupation'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getOccupation = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /totalUsers', () => {
    const url = baseUrl + '/totalUsers';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getTotalUsers is called', () => {
        const totalUsers = 10;
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalUsers = jest.fn().mockResolvedValue(totalUsers)
        });

        test('should return 200 and the total users', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toBe(totalUsers);
        });
    });

    describe('when getTotalUsers throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getTotalUsers = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getTotalUsers throws an custom error', () => {
        const error = { status: 400, message: 'Error getting total users'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalUsers = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /cancelationRate', () => {
    const url = baseUrl + '/cancelationRate';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getCancelationRate is called', () => {
        const cancelationRate = 20;
        beforeAll(() => {
            mockedDashboardService.prototype.getCancelationRate = jest.fn().mockResolvedValue(cancelationRate)
        });

        test('should return 200 and the cancelation rate', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toBe(cancelationRate);
        });
    });

    describe('when getCancelationRate throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getCancelationRate = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getCancelationRate throws an custom error', () => {
        const error = { status: 400, message: 'Error getting cancelation rate'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getCancelationRate = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /categoryReservations', () => {
    const url = baseUrl + '/categoryReservations';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getCategoryReservations is called', () => {
        const categoryReservations = [{ category: 'category', total: 5 }];
        beforeAll(() => {
            mockedDashboardService.prototype.getCategoryReservations = jest.fn().mockResolvedValue(categoryReservations)
        });

        test('should return 200 and the category reservations', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(categoryReservations);
        });
    });

    describe('when getCategoryReservations throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getCategoryReservations = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getCategoryReservations throws an custom error', () => {
        const error = { status: 400, message: 'Error getting category reservations'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getCategoryReservations = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe('GET /resume', () => {
    const url = baseUrl + '/resume';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('when getResume is called', () => {
        const resume = {
            "totalReservations": 5,
            "totalIncome": 500,
            "occupationData": 50,
            "totalUsers": 10,
            "cancelationData": 20,
            "categoryReservations" : [{ category: 'category', total: 5 }]
        };
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockResolvedValue(resume.totalReservations)
            mockedDashboardService.prototype.getTotalIncome = jest.fn().mockResolvedValue(resume.totalIncome)
            mockedDashboardService.prototype.getOccupation = jest.fn().mockResolvedValue(resume.occupationData)
            mockedDashboardService.prototype.getTotalUsers = jest.fn().mockResolvedValue(resume.totalUsers)
            mockedDashboardService.prototype.getCancelationRate = jest.fn().mockResolvedValue(resume.cancelationData)
            mockedDashboardService.prototype.getCategoryReservations = jest.fn().mockResolvedValue(resume.categoryReservations)
        });

        test('should return 200 and the resume', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(resume);
        });
    });

    describe('when getResume throws an default error', () => {

        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockRejectedValue(new Error())
        });

        test('should return 500 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(500);
        });
    });

    describe('when getResume throws an custom error', () => {
        const error = { status: 400, message: 'Error getting resume'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getTotalReservations = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
            .get(url)
            .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});

describe ('GET /reservations', () => {
    const url = baseUrl + '/reservations';

    beforeAll(() => {
        mockedTokenService.prototype.getUserId = jest.fn().mockReturnValue('1')
    });

    afterEach(() => {
        jest.clearAllMocks()
    }); 

    describe('when getReservations is called', () => {
        const reservations = [{ id: 1, date: '2021-10-10', total: 50 }];
        beforeAll(() => {
            mockedDashboardService.prototype.getReservations = jest.fn().mockResolvedValue(reservations)
        });

        test('should return 200 and the reservations', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(reservations);
        });
    });

    describe('when getReservations throws an default error', () => {
            
            beforeAll(() => {
                mockedDashboardService.prototype.getReservations = jest.fn().mockRejectedValue(new Error())
            });
    
            test('should return 500 and an error message', async () => {
                const response = await request(app)
                    .get(url)
                    .set('Origin', 'http://localhost:3000');
    
                expect(response.status).toBe(500);
            });
    });

    describe('when getReservations throws an custom error', () => {
        const error = { status: 400, message: 'Error getting reservations'}
        
        beforeAll(() => {
            mockedDashboardService.prototype.getReservations = jest.fn().mockRejectedValue(error)
        });

        test('should return 400 and an error message', async () => {
            const response = await request(app)
                .get(url)
                .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(error.status);
            expect(response.body.message).toBe(error.message);
        });
    });
});
