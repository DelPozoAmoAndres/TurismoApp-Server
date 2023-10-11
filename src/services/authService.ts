import { User } from "@customTypes/user";
import UserSchema from "@models/userSchema";
import bcrypt from 'bcrypt';
import TokenService from '@services/tokenService';

export default class AuthService {
    private tokenService: TokenService;
    
    constructor(tokenService?: TokenService) {
        this.tokenService = tokenService || new TokenService();
    }

    login = async (email: string, password: string) => {
        let user;
        try {
            user = await UserSchema.findOne({ email });
            if (!user)
                throw {
                    status: 401,
                    message: 'Credenciales incorrectas.'
                }
            const isMatch = await bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                throw {
                    status: 401,
                    message: 'Credenciales incorrectas.'
                }
            }
            const token = this.tokenService.createToken(user);
            return { token, user };
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    register = async (newUser: User) => {
        try {
            const userExists = await UserSchema.exists({ email: newUser.email });
            if (userExists)
                throw {
                    status: 400,
                    message: 'El email ya está registrado.'
                }

            newUser = new UserSchema(newUser);
            newUser.validateSync()
            await newUser.save();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}