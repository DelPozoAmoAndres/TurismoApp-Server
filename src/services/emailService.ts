// import { ReservationDoc } from '@customTypes/reservation';
// import ActivitySchema from '@models/activitySchema';
// import nodemailer from 'nodemailer';
// import { MailOptions } from 'nodemailer/lib/sendmail-transport';
// import { OAuth2Client } from 'google-auth-library';

// const client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

// export default class EmailService {

//     private refreshToken: string;

//     public constructor() { }

//     getAuth = () => {
//         return client.generateAuthUrl({
//             access_type: 'offline',
//             scope: ['https://www.googleapis.com/auth/gmail.send']
//         });
//     }

//     setToken = async (code: string) => {
//         const { tokens } = await client.getToken(code);
//         client.setCredentials({ refresh_token: tokens.refresh_token });
//         this.refreshToken = tokens.refresh_token;
//     }

//     // Función para enviar emails
//     sendMail = async (mailOptions: MailOptions) => {
//         try {
//             const accessToken = await client.getAccessToken();

//             const transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                     type: 'OAuth2',
//                     user: 'astourtfg@gmail.com',
//                     accessToken: accessToken.token,
//                     clientId: process.env.CLIENT_ID,
//                     clientSecret: process.env.CLIENT_SECRET,
//                     refreshToken: this.refreshToken
//                 }
//             });

//             const info = await transporter.sendMail(mailOptions);
//             console.log('Email enviado: ', info.response, mailOptions);
//         } catch (error) {
//             console.error('Error al enviar email: ', error);
//         }
//     };

//     sendConfirmReservationEmail = async (reservation: ReservationDoc) => {
//         const activty = await ActivitySchema.findOne({ "events._id": reservation.eventId });
//         const event = activty?.events?.find((event) => event.id == reservation.eventId)
//         await this.sendMail({
//             from: 'no-reply@astour.online',
//             to: reservation.email,
//             subject: 'Astour - Confirmación de reserva',
//             html: generateConfirmationEmail(reservation, activty.name, event.date.toString().split("T").join(" "), activty.location)
//         });
//     }

// }


// export function generateConfirmationEmail(reservation: ReservationDoc, activityName: string, activityDate: string, initialPoint: string) {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
//     <title>Confirmación de Reserva</title>
// </head>
// <body>
//     <h1>¡Hola ${reservation.name}!</h1>
//     <p>Gracias por reservar con Astour. Estamos emocionados de tenerte con nosotros para la experiencia <strong>${activityName}</strong>. A continuación, encontrarás los detalles de tu reserva y algunas instrucciones importantes para ayudarte a prepararte para tu aventura.</p>

//     <h2>Detalles de la Reserva</h2>
//     <ul>
//         <li><strong>Fecha:</strong> ${activityDate}- Por favor llega 15 minutos antes.</li>
//         <li><strong>Ubicación:</strong> ${initialPoint}</li>

//     <h2>Instrucciones Pre-actividad</h2>
//     <ul>
//         <li>Viste ropa cómoda y adecuada para el clima. Te recomendamos revisar el pronóstico del tiempo para el día de la actividad.</li>
//         <li>Informa a nuestro equipo de cualquier condición médica que deberíamos conocer (por ejemplo, alergias, condiciones de salud).</li>
//     </ul>

//     <h2>Política de Cancelación</h2>
//     <p>Si necesitas cancelar o modificar tu reserva, por favor contáctanos al menos 24 horas antes de la fecha programada. De lo contrario, no se devolverá el dinero.</p>

//     <h2>¿Preguntas?</h2>
//     <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos a través de:
//         <ul>
//             <li>Teléfono: 600000000</li>
//             <li>Email: support@astour.online</li>
//         </ul>
//     </p>
//     <p>¡Estamos aquí para asegurar que tu experiencia sea fantástica y estamos deseando explorar juntos!</p>

//     <p>Saludos cordiales,</p>
//     <p>El equipo de Astour</p>
// </body>
// </html>
//     `;
// }

