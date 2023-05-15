import jwt from "jsonwebtoken";

export interface DecodedToken extends jwt.JwtPayload {
    userId: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
  }