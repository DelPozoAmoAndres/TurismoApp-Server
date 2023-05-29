import jwt, { sign } from "jsonwebtoken";
import { DecodedToken } from "src/models/DecodedToken";
import { NextFunction, Request, Response } from "express";

const adminCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        let decodedToken: DecodedToken = verifyToken(req, res);
        if (!decodedToken.isAdmin)
            res.status(403).json({ message: "No tienes permisos para hacer esto" })
        else
            next();
    } catch (error) {
        res.status(401).json({ message: "Usuario debe registrarse" })
    }

}

const signToken = (decodedToken: DecodedToken) => {
    // Si las credenciales son correctas, se genera el token JWT y se devuelve en la respuesta
    return jwt.sign({ userId: decodedToken.userId, isAdmin: decodedToken.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
}

const getUserId = (req: Request, res: Response, next: NextFunction) => {
    try {
        let decodedToken: DecodedToken = verifyToken(req, res);
        next(decodedToken.userId);
    } catch (error) {
        res.status(401).json({ message: "Usuario debe registrarse" })
    }
}

const verifyToken = (req: Request, res: Response): DecodedToken => {
    const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
    return jwt.verify(token, process.env.JWT_SECRET) as DecodedToken; // Verificar el token
}
module.exports = { adminCheck, getUserId, signToken }