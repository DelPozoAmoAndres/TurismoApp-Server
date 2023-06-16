import jwt, { sign } from "jsonwebtoken";
import { DecodedToken } from "../models/DecodedToken";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { Role, UserDoc } from "../models/user";

const adminCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        let decodedToken: DecodedToken = verifyToken(req, res);
        if (!decodedToken.isAdmin) {
            logger.debug("Intento de acceso a una ruta sin permisos.", "Usuario:",decodedToken.userId)
            res.status(403).json({ message: "No tienes permisos para hacer esto" })
        }
        else
            next();
    } catch (error) {
        logger.debug("Intento de acceso a una ruta admin sin estar registrado")
        res.status(401).json({ message: "Usuario debe registrarse" })
    }

}

const signToken = (decodedToken: DecodedToken) => {
    // Si las credenciales son correctas, se genera el token JWT y se devuelve en la respuesta
    logger.debug(`Firma de un token de sesión - token: ${decodedToken.userId} - admin: ${decodedToken.isAdmin}`)
    return jwt.sign({ userId: decodedToken.userId, isAdmin: decodedToken.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
}

const createToken = (user: UserDoc) => {
    // Si las credenciales son correctas, se genera el token JWT y se devuelve en la respuesta
    logger.debug(`Creación de un token de sesión - usuario: ${user._id} - admin: ${ user.role === Role.administrador}`)
    return jwt.sign({ userId: user.id, isAdmin: user.role === Role.administrador }, process.env.JWT_SECRET, {
        expiresIn: '10h'
    });
}

const getUserId = (req: Request, res: Response, next: NextFunction) => {
    try {
        let decodedToken: DecodedToken = verifyToken(req, res);
        next(decodedToken.userId);
    } catch (error) {
        logger.debug("Intento de acceso a una ruta personal sin estar registrado")
        res.status(401).json({ message: "Usuario debe registrarse" })
    }
}

const verifyToken = (req: Request, res: Response): DecodedToken => {
    const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
    const valid= jwt.verify(token, process.env.JWT_SECRET) as DecodedToken; // Verificar el token
    return valid;
}
module.exports = { adminCheck, getUserId, signToken,createToken }