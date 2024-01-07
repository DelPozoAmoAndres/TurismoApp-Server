import { User } from "@customTypes/user";
import UserScheme from "@models/userSchema";
import bcrypt from 'bcrypt';

const projection = {
    password: 0,
};

export default class UserService {
    getOneUser = async (userId: string) => {
        let user: User;
        try {
            user = await UserScheme.findById(userId, projection)
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }

        if (!user)
            throw {
                status: 404,
                message: "Usuario no encontrado",
            }
        return user;
    }
    updateUser = async (userId: string, changes: Record<string, unknown>) => {
        let user: User;
        try {
            user = await UserScheme.findOneAndUpdate({ _id: userId }, changes, { new: true });
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }

        if (!user)
            throw {
                status: 404,
                message: "Usuario no encontrado",
            }
        return user;
    }
    changePassword = async (userId: string, oldPass: string, newPass: string) => {
        let user: User;
        try {
            user = await this.getOneUser(userId)
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
        const isMatch = await bcrypt.compareSync(oldPass, user.password);
        if (!isMatch)
            throw {
                status: 304,
                message: "Contraseña no modificada, contraseña actual incorrecta",
            }
        const hashedPassword = await bcrypt.hashSync(newPass, 10);
        try {
            await UserScheme.findOneAndUpdate(
                { _id: userId },
                { $set: { password: hashedPassword } },
                { new: true }
            );
        }catch(error){
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }

    deleteUser = async (userId: string) => {
        try {
            await UserScheme.deleteOne({ _id: userId });
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}