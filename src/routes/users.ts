import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { Role, UserDoc } from '../models/user';
import { DecodedToken } from 'src/models/DecodedToken';

const router = express.Router();

/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: Iniciar sesión
 *    description: Permite iniciar sesión a un usuario existente.
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
 *            email:
 *              type: string
 *              description: Email del usuario.
 *              example: usuario@dominio.com
 *            password:
 *              type: string
 *              description: Contraseña del usuario.
 *              example: password123
 *    responses:
 *      200:
 *        description: Token JWT generado al autenticar al usuario.
 *        schema:
 *          type: object
 *          properties:
 *            token:
 *              type: string
 *              description: Token JWT generado.
 *              example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *            user:
 *              type: object
 *              description: Datos del usuario.
 *              example: { _id: "645accda3d8b25220500806a", name: 'asdasda', email: 'andres@a.com', password: '$2b$10$fAJ.VuoWaz3Evm4EZjZrpeH0cOnZDkMM8Bz6p.nJphnFcv5VfAPgK', role: 'user', createdAt: 2023-05-09T22:44:42.947Z, updatedAt: 2023-05-09T22:44:42.947Z, __v: 0}
 *      401:
 *        description: Credenciales incorrectas.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Mensaje de credenciales incorrectas
 *              example: 'Credenciales incorrectas.'
 *      500:
 *        description: Error interno del servidor.
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              description: Mensaje de error interno
 *              example: 'Ha habido un error en el servidor.'
 */
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // Si las credenciales son correctas, se genera el token JWT y se devuelve en la respuesta
        const token = jwt.sign({ userId: user.id, isAdmin:user.role===Role.administrador }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

/**
 * @swagger
 * /api/register:
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
    const { name, email, password, ...optionalFields } = req.body;

    try {
        // Comprobar si el usuario ya existe
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }
        // Crear el usuario
        let newUser : any = {
            name,
            email,
            password,
            role:Role.turista,
        };

        for (const field in optionalFields) {
            if (optionalFields.hasOwnProperty(field)) {
                newUser[field] = optionalFields[field];
            }
        }
        newUser = new User(newUser);
        await newUser.save();

        res.status(200).json({ message: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

router.get('/user', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        let decodedToken: DecodedToken;
        decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken; // Verificar el token
        // Excluir las propiedades
        const projection = {
            password: 0,
            createdAt: 0,
            updatedAt:0,
            __v:0,
        };
        const user = await User.findById(decodedToken.userId,projection)
        res.status(200).json({user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});
/**
 * @swagger
 * /api/edit/user:
 *   put:
 *     summary: Actualiza los datos del usuario.
 *     description: Actualiza los datos del usuario en la base de datos o sistema de almacenamiento.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            User
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                   example: Usuario actualizado.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/edit/user',async (req:Request,res:Response)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera de la petición
        let decodedToken: DecodedToken;
        decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken; // Verificar el token
        let user = await User.findOneAndUpdate({_id:req.body._id},req.body,{new:true});
        console.log(user);
        res.status(200).json({ message: 'Usuario actualizado'})
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Ha habido un error en el servidor.' });
    }
});

export default router;
