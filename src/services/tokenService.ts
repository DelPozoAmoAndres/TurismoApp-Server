import jwt from "jsonwebtoken";
import { DecodedToken } from "@customTypes/DecodedToken";
import { Request } from "express";
import { logger } from "@utils/logger";
import { Role } from '@customTypes/user';
import { User } from "@customTypes/user";

export default class TokenService {
    adminCheck = (req: Request) => {
        try {
            let decodedToken: DecodedToken = this.verifyToken(req);
            if (!decodedToken.isAdmin) {
                logger.info("[AdminCheck] Intento de acceso a una ruta sin permisos.", "Usuario:", decodedToken.userId)
                throw {
                    status: 403,
                    message: "No tienes permisos para hacer esto"
                }
            }
        } catch (error) {
            logger.debug("[AdminCheck] Intento de acceso a una ruta admin sin estar registrado")
            throw {
                status: 401,
                message: "Usuario debe registrarse"
            }
        }
    }

    signToken = (decodedToken: DecodedToken) => {
        logger.debug(`[SignToken] Firma de un token de sesión - token: ${decodedToken.userId} - admin: ${decodedToken.isAdmin}`)
        return jwt.sign({ userId: decodedToken.userId, isAdmin: decodedToken.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });
    }

    createToken = (user: User) => {
        logger.debug(`[CreateToken] Creación de un token de sesión - usuario: ${user._id} - admin: ${user.role === Role.administrador}`)
        return jwt.sign({ userId: user._id, isAdmin: user.role === Role.administrador }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });
    }

    getUserId = (req: Request) => {
        try {
            let decodedToken: DecodedToken = this.verifyToken(req);
            return decodedToken.userId
        } catch (error) {
            logger.debug("[AdminCheck] Intento de acceso a una ruta personal sin estar registrado")
            throw {
                status: 401,
                message: "Usuario debe registrarse"
            }
        }
    }

    verifyToken = (req: Request): DecodedToken => {
        const token = req.headers.authorization.split(" ")[1];
        const valid = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
        return valid;
    }
}