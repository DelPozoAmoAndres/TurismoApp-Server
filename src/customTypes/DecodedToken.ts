import jwt from "jsonwebtoken";

// Define la interfaz sin el constructor
export interface DecodedToken extends jwt.JwtPayload {
  userId: string;
  isAdmin: boolean;
}

// Crea una clase que implemente la interfaz y tenga el constructor
export default class DecodedTokenImpl implements DecodedToken {
  userId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;

  constructor(userId: string, isAdmin: boolean) {
    this.userId = userId;
    this.isAdmin = isAdmin;
  }
}
