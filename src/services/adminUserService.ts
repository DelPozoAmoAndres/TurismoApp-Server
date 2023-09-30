import UserScheme from "@models/userSchema";
import { Role, User } from "@customTypes/user";
import mongoose,{ QueryOptions} from "mongoose";
import { ReservationDoc } from "@customTypes/reservation";
import ReservationService  from "@services/reservationService"

export default class AdminUserService {
    private reservationService: ReservationService;

    constructor(reservationService?: ReservationService) {
        this.reservationService = reservationService || new ReservationService();
    }

    addUser = async (newUser: User) => {
        try {
            const user = await UserScheme.findOne({ email: newUser.email });
            if (user)
                throw {
                    status: 400,
                    message: "El email ya está registrado"
                }
            if (!Object.values(Role).includes(newUser.role))
                throw {
                    status: 400,
                    message: "Role incorrecto"
                }
            const userCreated = new UserScheme(newUser);
            return await userCreated.save();
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getAllUsers = async (queryOptions: QueryOptions) => {
        let query: QueryOptions;
        try {
            query = {
                $and: [
                    queryOptions.searchString ? {
                        $or: [
                            { name: { $regex: queryOptions.searchString, $options: 'i' } }, // Buscar en la propiedad "name"
                            { email: { $regex: queryOptions.searchString, $options: 'i' } },// Buscar en la propiedad "email"
                        ]
                    } : {},
                    queryOptions.country ? { country: { $regex: queryOptions.country, $options: 'i' } } : {}, // Buscar en la propiedad "country"
                    queryOptions.role ? { role: { $regex: queryOptions.role, $options: 'i' } } : {}, // Buscar en la propiedad "email"
                ],
            };
        } catch (error) {
            throw {
                status: 400,
                message: 'Error al aplicar filtros'
            }
        }

        const projection = {
            password: 0,
            __v: 0,
        };

        try {
            // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
            const users = await UserScheme.find(query, projection);
            if (!users || users.length === 0)
                throw {
                    status: 404,
                    message: 'No se encontraron usuarios'
                }
            return users;
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    getOneUser = async (userId: string) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const user = await UserScheme.findById(userId)
            if (!user)
                throw {
                    status: 404,
                    message: 'No se encontraron los datos del usuario'
                }
            return user
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    deleteUser = async (userId: string) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const userDeleted = await UserScheme.findByIdAndDelete(userId)
            if (!userDeleted)
                throw {
                    status: 404,
                    message: 'Usuario no encontrado'
                }
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
    editUser = async (userId: string, changes: Record<string, unknown>) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw {
                    status: 400,
                    message: 'El id no es válido'
                }
            const userUpdated = await UserScheme.findByIdAndUpdate(userId, changes, { new: true, runValidators: true })
            if (!userUpdated)
                throw {
                    status: 404,
                    message: 'Usuario no encontrado'
                }
        } catch (error) {
            throw {
                status: error?.status || 500,
                message: error?.message || 'Ha habido un error en el servidor.'
            }
        }
    }
}