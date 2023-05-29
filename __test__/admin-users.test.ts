const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const { signToken } = require("../src/services/tokenService")

import { DecodedToken } from 'src/models/DecodedToken';
import User, { Role } from '../src/models/user';
const app = require('../src/app');

describe('Admin Users API', () => {
    let mongoServer: any;
    let mongoUri: string;
    let token: DecodedToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        
    });

    beforeEach(async () => {
        await User.deleteMany({});
        token = signToken({ userId: "1", isAdmin: true })
    });

    describe('POST /api/admin/register', () => {
        it('should return an error when a non-logged in user tries to register a new user', async () => {
            const mockUser = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                role: Role.administrador,
            };

            const response = await request(app)
                .post('/api/admin/register')
                .send(mockUser);


            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Usuario debe registrarse');

            const savedUser = await User.findOne({ email: 'johndoe@example.com' });
            expect(savedUser).toBeNull();
        });
        it('should register a new user', async () => {
            const mockUser = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                role: Role.administrador,
            };

            const response = await request(app)
                .post('/api/admin/register')
                .set('Authorization', `Bearer ${token}`)
                .send(mockUser);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Usuario registrado correctamente.');

            const savedUser = await User.findOne({ email: 'johndoe@example.com' });
            expect(savedUser).toBeDefined();
        });
        it('should return an error when trying to register a user with an existing email', async () => {
            const existingUser = new User({
                name: 'Existing User',
                email: 'existinguser@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            await existingUser.save();

            const mockUser = {
                name: 'John Doe',
                email: 'existinguser@example.com',
                password: 'password123',
                role: Role.administrador,
            };

            const response = await request(app)
                .post('/api/admin/register')
                .set('Authorization', `Bearer ${token}`)
                .send(mockUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El email ya está registrado.');
        });
        it('should return an error when a user without admin role tries to register a new user', async () => {
            const mockUser = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                role: Role.administrador,
            };
            const tokenNoAdmin = signToken({ userId: "1", isAdmin: false })
            const response = await request(app)
                .post('/api/admin/register')
                .set('Authorization', `Bearer ${tokenNoAdmin}`)
                .send(mockUser);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('No tienes permisos para hacer esto');

            const savedUser = await User.findOne({ email: 'johndoe@example.com' });
            expect(savedUser).toBeNull();
        });
    });


    describe('GET /api/admin/users', () => {
        it('should return an error when a non-logged in user tries to get a list of users', async () => {
            const existingUser1 = new User({
                name: 'User 1',
                email: 'user1@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            await existingUser1.save();

            const existingUser2 = new User({
                name: 'User 2',
                email: 'user2@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            await existingUser2.save();

            const response = await request(app)
                .get('/api/admin/users')

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Usuario debe registrarse');
        });
        it('should return a list of users', async () => {
            const existingUser1 = new User({
                name: 'User 1',
                email: 'user1@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            await existingUser1.save();

            const existingUser2 = new User({
                name: 'User 2',
                email: 'user2@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            await existingUser2.save();

            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].name).toBe('User 1');
            expect(response.body[1].name).toBe('User 2');
        });
        it('should return an error when a user without admin role tries to get the user list', async () => {
            const token = signToken({ userId: "1", isAdmin: false })            
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("No tienes permisos para hacer esto");
        });
    });

    // describe('PUT /api/admin/users/:id', () => {
    //     it('should update the user with the given id', async () => {
    //         const existingUser = new User({
    //             name: 'Existing User',
    //             email: 'existinguser@example.com',
    //             password: 'password123',
    //             role: Role.administrador,
    //         });
    //         let userdb =await existingUser.save();

    //         const updatedUser = {
    //             name: 'Updated User',
    //             email: 'updateduser@example.com',
    //             password: 'newpassword123',
    //             role: Role.turista,
    //         };

    //         const response = await request(app)
    //             .put(`/api/admin/users/${userdb._id}`)
    //             .set('Authorization', `Bearer ${token}`)
    //             .send(updatedUser);

    //         expect(response.status).toBe(200);
    //         expect(response.body.message).toBe('Usuario actualizado correctamente.');

    //         const savedUser = await User.findById(existingUser._id);
    //         expect(savedUser).toBeDefined();
    //         expect(savedUser?.name).toBe('Updated User');
    //         expect(savedUser?.email).toBe('updateduser@example.com');
    //         // Add more assertions for other updated fields
    //     });

    //     it('should return an error when trying to update a non-existent user', async () => {
    //         const updatedUser = {
    //             name: 'Updated User',
    //             email: 'updateduser@example.com',
    //             password: 'newpassword123',
    //             role: Role.turista,
    //         };

    //         const response = await request(app)
    //             .put('/api/admin/users/nonexistentuser')
    //             .set('Authorization', `Bearer ${token}`)
    //             .send(updatedUser);

    //         expect(response.status).toBe(404);
    //         expect(response.body.message).toBe('Usuario no encontrado.');
    //     });
    // });

    describe('DELETE /api/admin/user', () => {
        it('should return an error when a non-logged in user tries to delete a user', async () => {
            const existingUser = new User({
                name: 'Existing User',
                email: 'existinguser@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            const userdb=await existingUser.save();

            const response = await request(app)
            .delete(`/api/admin/user?email=${existingUser.email}`)

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Usuario debe registrarse');

            const notDeletedUser = await User.findById(userdb._id);
            expect(notDeletedUser).toBeDefined();
            expect(notDeletedUser.email).toBe(existingUser.email)
        });
        it('should delete the user with the given id', async () => {
            const existingUser = new User({
                name: 'Existing User',
                email: 'existinguser@example.com',
                password: 'password123',
                role: Role.administrador,
            });
            const userdb=await existingUser.save();

            const response = await request(app)
            .delete(`/api/admin/user?email=${existingUser.email}`)
            .set('Authorization', `Bearer ${token}`)

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Usuario eliminado correctamente.');

            const deletedUser = await User.findById(userdb._id);
            expect(deletedUser).toBeNull();
        });
        it('should return an error when trying to delete a non-existent user', async () => {
            const response = await request(app)
            .delete('/api/admin/user?email=nonexistentuser')
            .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuario no encontrado.');
        });
        it('should return an error when a user without admin role tries to delete a user', async () => {
            const token = signToken({ userId: "1", isAdmin: false })
            const response = await request(app)
            .delete('/api/admin/user?email=nonexistentuser')
            .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('No tienes permisos para hacer esto');
        });
    });

});

