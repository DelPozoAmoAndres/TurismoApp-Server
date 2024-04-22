import { Role } from '@customTypes/user';
import e, { Response } from 'express';

import TokenService from '@services/tokenService';
jest.mock("@services/tokenService");
const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

import { authMiddleware, AuthenticatedRequest } from '@middlewares/authMiddleware';

describe('authMiddleware', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when is a turist', () => {
        const req = { userId: '123' } as unknown as AuthenticatedRequest;
        const res = {} as unknown as Response;
        const next = jest.fn();

        beforeAll(() => {
            mockedTokenService.prototype.getUserId = jest.fn().mockImplementation(() => req.userId);
        });

        test('should call next', () => {
            authMiddleware(Role.turista)(req, res, next);
            expect(next).toHaveBeenCalled();
        });

    });

    describe('when is an admin', () => {
        const req = { userId: '123' } as unknown as AuthenticatedRequest;
        const res = {} as unknown as Response;
        const next = jest.fn();
        beforeAll(() => {
            mockedTokenService.prototype.adminCheck = jest.fn();
        });
        test('should call next', () => {
            authMiddleware(Role.administrador)(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('when is not authenticated', () => {
        const error= { status: 401, message: "Unauthorized" };

        beforeEach(() => {
            mockedTokenService.prototype.getUserId = jest.fn().mockImplementation(() => {
                throw error;
            });
            mockedTokenService.prototype.adminCheck = jest.fn().mockImplementation(() => {
                throw error;
            });
        });

        test('should return an error if has to be registered', () => {
            const req = {userId:""} as unknown as AuthenticatedRequest;
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const next = jest.fn();

            authMiddleware(Role.turista)(req, res, next);
            expect(next).toBeCalledTimes(0);
            expect(res.status).toBeCalledWith(error.status);
        });

        test('should return an error if has to be registered', () => {
            const req = {} as unknown as AuthenticatedRequest;
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const next = jest.fn();

            authMiddleware(Role.administrador)(req, res, next);
            expect(next).toBeCalledTimes(0);
            expect(res.status).toBeCalledWith(error.status);
        });
    });

    describe('when theres some internal error', () => {

        beforeEach(() => {
            mockedTokenService.prototype.getUserId = jest.fn().mockImplementation(() => {
                throw new Error();
            });
            mockedTokenService.prototype.adminCheck = jest.fn().mockImplementation(() => {
                throw new Error();
            });
        });

        test('and have to be user should return an error', () => {
            const req = {userId:""} as unknown as AuthenticatedRequest;
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const next = jest.fn();

            authMiddleware(Role.turista)(req, res, next);
            expect(next).toBeCalledTimes(0);
            expect(res.status).toBeCalledWith(500);
        });

        test('and have to be admin should return an error', () => {
            const req = {} as unknown as AuthenticatedRequest;
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const next = jest.fn();

            authMiddleware(Role.administrador)(req, res, next);
            expect(next).toBeCalledTimes(0);
            expect(res.status).toBeCalledWith(500);
        });
    });
});