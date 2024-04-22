import { Request, Response, NextFunction } from "express";
import { Role } from "@customTypes/user";
import TokenService from "@services/tokenService";

interface AuthenticatedRequest extends Request {
    userId?: string; 
}

const tokenService = new TokenService();

const authMiddleware = (requiredRole: Role) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (requiredRole === Role.administrador){
            tokenService.adminCheck(req)
            next();
        }
        else{
            const userId:string =tokenService.getUserId(req);
            req.userId=userId;
            next();
        }
    } catch (error) {
        res.status(error?.status || 500).send({ message: error.message || "" })
    }
};

export { authMiddleware, AuthenticatedRequest };