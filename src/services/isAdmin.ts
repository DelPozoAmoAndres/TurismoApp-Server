import jwt from "jsonwebtoken";
import { DecodedToken } from "src/models/DecodedToken";

const isAdmin = (token: string) => {
    let decodedToken: DecodedToken;
    decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken; // Verificar el token
    return decodedToken.isAdmin
}

module.exports={isAdmin}