import request,{ Response } from 'supertest';
import app from "@app";

jest.mock("@services/activityService");
import ActivityService from "@services/activityService";
const mockedActivityService = ActivityService as jest.Mocked<typeof ActivityService>;

const baseUrl = '/api/activity';

describe('GET /list', () => {
    describe('when the price filter is invalid', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/list')
                .query({ precio: "a" })
                .set('Origin', 'http://localhost:3000');
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Filtro de precio con formato incorrecto' });
        });
    });

    describe('when the duration filter is invalid', () => {
        test('shoud respond with a 400 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/list')
                .query({ duration: "a" })
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Filtro de duración con formato incorrecto' });
        });
    });

    describe('when the search is valid', () => {
        beforeAll(() => {
            mockedActivityService.prototype.getAllActivities = jest.fn().mockReturnValue([{ name: 'test' }]);
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/list')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual([{ name: 'test' }]);
        });
    });

    describe('when the activityService throws a default error', () => {
        beforeAll(() => {
            mockedActivityService.prototype.getAllActivities = jest.fn().mockRejectedValue(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/list')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the activityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedActivityService.prototype.getAllActivities = jest.fn().mockRejectedValue(error);
        });

        test("shoud respond with the status code of the custom error", async () => {
            const res: Response = await request(app)
                .get('/api/activity/list')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Test error' });
        });
    });
});

describe('GET /:id', () => {
    describe('when the id is valid', () => {
        beforeAll(() => {
            mockedActivityService.prototype.getOneActivity = jest.fn().mockReturnValue({ name: 'test' });
        });

        test('shoud respond with a 200 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/120')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ name: 'test' });
        });
    });
    describe('when the activityService throws a default error', () => {
        beforeAll(() => {
            mockedActivityService.prototype.getOneActivity = jest.fn().mockRejectedValue(new Error());
        });

        test('shoud respond with a 500 status code', async () => {
            const res: Response = await request(app)
                .get('/api/activity/120')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(500);
            expect(res.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the activityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedActivityService.prototype.getOneActivity = jest.fn().mockRejectedValue(error);
        });
        test("shoud respond with the status code of the custom error", async () => {

            const res: Response = await request(app)
                .get('/api/activity/120')
                .set('Origin', 'http://localhost:3000')
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ message: 'Test error' });
        });
    });
});

describe('GET /:id/events', () => {
    const url = baseUrl + '/1/events'

    afterEach(()=>{
        jest.restoreAllMocks();
    })

    describe('when the id is valid', () => {
        const mockedEvents = [{_id: '1', name: 'event1'}, {_id: '2', name: 'event2'}]
        beforeEach(() => {
            mockedActivityService.prototype.getEvents= jest.fn().mockReturnValue(mockedEvents);
        })

        it('should return the events', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockedEvents)
        })
    });

    describe('when the authservice throws a default error', () => {
        beforeEach(() => {
            mockedActivityService.prototype.getEvents = jest.fn().mockRejectedValue(new Error());
        });

        it('should respond with a 500 status code', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe('when the authservice throws a custom error', () => {
        const error = {status: 400, message: 'Test error'}
        beforeEach(() => {
            mockedActivityService.prototype.getEvents= jest.fn().mockRejectedValue(error);
        });

        it('should respond with the status code of the custom error', async () => {
            const response :Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toStrictEqual({ message: error.message })
        });
    });
});

describe('GET /event/:id', () => {
    const url = baseUrl + '/event/123456789012'

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when the id is valid', () => {
        const mockedActivity = { _id: '1', name: 'activity1' };

        beforeAll(() => {
            mockedActivityService.prototype.getActivityFromEvent = jest.fn().mockReturnValue(mockedActivity);
        });

        test('should return the activity', async () => {
            const response: Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockedActivity);
        });
    });

    describe('when the activityService throws a default error', () => {
        beforeAll(() => {
            mockedActivityService.prototype.getActivityFromEvent = jest.fn().mockRejectedValue(new Error());
        });

        test('should respond with a 500 status code', async () => {
            const response: Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000');
            expect(response.status).toBe(500);
            expect(response.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' });
        });
    });

    describe('when the activityService throws a custom error', () => {
        const error = { status: 400, message: 'Test error' };

        beforeAll(() => {
            mockedActivityService.prototype.getActivityFromEvent = jest.fn().mockRejectedValue(error);
        });

        test('should respond with the status code of the custom error', async () => {
            const response: Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000');
            expect(response.status).toBe(error.status);
            expect(response.body).toStrictEqual({ message: error.message });
        });
    });
});

describe('GET /:id/reviews', () => {
    const url = baseUrl + '/1/reviews'

    afterEach(()=>{
        jest.resetAllMocks();
    })

    describe('when the id is valid', () => {
        const mockedReviews = [{_id: '1', name: 'review1'}, {_id: '2', name: 'review2'}]
        beforeEach(() => {
            mockedActivityService.prototype.getAllReviewsByActivityId = jest.fn().mockReturnValue(mockedReviews);
        })

        test('should return the reviews', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockedReviews)
        })
    });

    describe('when the activityService throws a default error', () => {
        beforeEach(() => {
            mockedActivityService.prototype.getAllReviewsByActivityId = jest.fn().mockRejectedValue(new Error());
        });

        test('should respond with a 500 status code', async () => {
            const response : Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(500)
            expect(response.body).toStrictEqual({ message: 'Ha habido un error en el servidor.' })
        });
    });

    describe('when the activityService throws a custom error', () => {
        const error = {status: 400, message: 'Test error'}
        beforeEach(() => {
            mockedActivityService.prototype.getAllReviewsByActivityId = jest.fn().mockRejectedValue(error);
        });

        test('should respond with the status code of the custom error', async () => {
            const response :Response = await request(app).get(url)
                .set('Origin', 'http://localhost:3000')
            expect(response.status).toBe(error.status)
            expect(response.body).toStrictEqual({ message: error.message })
        });
    });

});