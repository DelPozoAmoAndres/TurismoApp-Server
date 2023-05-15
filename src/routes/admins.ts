import express, { Request, Response } from 'express';
import User, { Role } from '../models/user';
const { isAdmin } = require('../services/isAdmin');

const router = express.Router();

/**
 * @swagger
 * /api/admin/register:
 *  post:
 *    summary: Registrar nuevo usuario.
 *    description: Permite registrar a un usuario si no existia ya en el sistema.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: user
 *        description: Información del usuario a autenticar.
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *              description: Nombre del usuario.
 *              example: name
 *            email:
 *              type: string
 *              description: Email del usuario.
 *              example: usuario@dominio.com
 *            password:
 *              type: string
 *              description: Contraseña del usuario.
 *              example: password123
 *            role:
 *              type: string
 *              description: Tipo de rol.
 *              example: user    
 *    responses:
 *      200:       
 *        description: Usuario registrado correctamente.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Mensaje de confirmación
 *              example: 'Usuario registrado correctamente.'
 *      400:
 *        description: El email ya está registrado.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Mensaje de email ya registrado
 *              example: 'El email ya está registrado.'
 *      500:
 *        description: Ha habido un error en el servidor.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Mesaje de error del servidor
 *              example: 'Ha habido un error en el servidor.'
 */
router.post('/register', async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    try {
        // Comprobar si el usuario ya existe
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        if (!Object.values(Role).includes(role)) {
            return res.status(400).json({ message: 'Role incorrecto' });
        }

        // Crear el usuario
        const newUser = new User({
            name,
            email,
            password,
            role
        });

        await newUser.save();

        res.status(200).json({ message: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

/**
 * @swagger
 * /api/admin/isAdmin:
 *   get:
 *     summary: Verifica si el usuario es administrador
 *     description: Verifica si el usuario autenticado tiene permisos de administrador
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: JWT token de autenticación
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indica si el usuario es administrador o no.
 *                   example: true
 *       401:
 *         description: Error de autenticación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: Error de autenticación.
 */
router.get('/isAdmin', (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        res.status(200).json({ isAdmin: isAdmin(token) });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Error de autenticación.' });
    }
});

router.get('/users', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        if (!isAdmin(token)) {
            res.status(403).json({ menssage: 'Usuario no autorizado' })
        }

        // Construir la expresión de consulta para buscar usuarios que contengan la cadena de búsqueda en alguna propiedad
        const query = {
            $and: [
                req.query.searchString ? {
                    $or: [
                        { name: { $regex: req.query.searchString } }, // Buscar en la propiedad "name"
                        { email: { $regex: req.query.searchString } },// Buscar en la propiedad "email"
                    ]
                } : {},
                req.query.country ? { country: { $regex: req.query.country, $options: 'i' } } : {}, // Buscar en la propiedad "country"
                req.query.role ? { role: { $regex: req.query.role, $options: 'i' } } : {}, // Buscar en la propiedad "email"
            ],
        };

        // Excluir las propiedades
        const projection = {
            password: 0,
            createdAt: 0,
            updatedAt:0,
            __v:0,
        };

        // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
        const users = await User.find(query, projection);
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

router.get('/user', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        if (!isAdmin(token)) {
            res.status(403).json({ menssage: 'Usuario no autorizado' })
        }

        // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
        const user = await User.findOne({email:req.query.email});

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

router.delete('/user', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        if (!isAdmin(token)) {
            res.status(403).json({ menssage: 'Usuario no autorizado' })
        }

        // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
        const user = await User.findOneAndRemove({email:req.query.email});

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

export default router;
