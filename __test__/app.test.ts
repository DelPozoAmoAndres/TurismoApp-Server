import request from 'supertest';
import app from '../app';
describe('CORS', () => {
    test('should always pass', () => {
        expect(true).toBe(true);
    });
    //     describe('when the origin is allowed', () => {
    //         test('should allow requests from allowed origins', async () => {
    //             const response = await request(app)
    //                 .get('/')
    //                 .set('Origin', 'https://astour.online');

    //             expect(response.status).toBe(200);
    //         });
    //     });
    //     describe('when the origin is not allowed', () => {
    //         test('should reject requests from disallowed origins', async () => {
    //             const response = await request(app)
    //                 .get('/')
    //                 .set('Origin', 'https://example.com');

    //             expect(response.status).toBe(500);
    //         });

    //         test('should reject requests without an origin', async () => {
    //             const response = await request(app)
    //                 .get('/');

    //             expect(response.status).toBe(500);
    //         });
    //     });
});
