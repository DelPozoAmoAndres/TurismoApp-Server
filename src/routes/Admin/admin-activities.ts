import Activity from '../../models/activity';
import express, { Request, Response } from 'express';
import Event, { EventDoc } from '../../models/event';
import User, { Role } from '../../models/user';
const { adminCheck } = require('../../services/tokenService');
const mongoose = require('mongoose');

const router = express.Router();


router.post('/activity', async (req, res) => {
    adminCheck(req, res, async () => {
        try {
            const createdActivity = new Activity(req.body);
            const validationError = createdActivity.validateSync();

            if (validationError) {
                const missingProperties = Object.keys(validationError.errors).join(', ');
                res.status(400).json({ message: `Error al registrar la actividad. Faltan datos requeridos: ${missingProperties}` });
            }
            else {
                await createdActivity.save();
                res.status(201).json({ message: 'Actividad registrada correctamente' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});


router.put('/activity', async (req, res) => {
    adminCheck(req, res, async () => {
        try {
            if (req.body._id && !mongoose.Types.ObjectId.isValid(req.body._id)) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }
            const result = await Activity.findByIdAndUpdate(req.body._id, req.body);

            if (result) {
                res.status(200).json({ message: 'Actividad actualizada correctamente' });
                return;
            }
            res.status(404).json({ message: 'Actividad no encontrada' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});


router.delete('/activity/:id', async (req, res) => {
    adminCheck(req, res, async () => {
        try {
            if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }
            const result = await Activity.findByIdAndDelete(req.params.id);
            if (result) {
                res.status(200).json({ message: 'Actividad eliminada correctamente' });
            } else {
                res.status(404).json({ message: 'Actividad no encontrada' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

//Crear un evento
router.post('/event', async (req: Request, res: Response) => {
    adminCheck(req, res, async () => {
        try {

            const actividad = await Activity.findById(req.body.activityId);

            if (!actividad) {
                res.status(404).json({ message: "Actividad no encontrada" })
                return;
            }

            const { language, price, seats, guide, date } = req.body.event
            const repeatInfo = req.body.repeatInfo;

            let events: EventDoc[] = actividad.events ? actividad.events : [];

            const user = await User.find({ role: Role.guía, _id: guide });
            if (!(user?.length >0)) {
                res.status(404).json({ message: "Guía no encontrado" })
                return;
            }

            if (repeatInfo?.repeatType == "days") {
                const days: string[] = repeatInfo.repeatDays
                const time = repeatInfo.time.split(":")
                days.forEach((day) => {
                    let date = new Date(day);
                    date.setHours(time[0], time[1])
                    events.push(new Event({ bookedSeats: 0, date, language, price, seats, guide }))
                })
            }
            else if (repeatInfo?.repeatType == "range") {
                const currDate = new Date(repeatInfo.repeatStartDate);
                const lastDate = new Date(repeatInfo.repeatEndDate);
                const time = repeatInfo.time.split(":")
                while (currDate <= lastDate) {
                    if (repeatInfo.repeatDays.includes(currDate.getDay())) {
                        let date = new Date(currDate);
                        date.setHours(time[0], time[1])
                        events.push(new Event({ bookedSeats: 0, date, language, price, seats, guide }))
                    }
                    currDate.setDate(currDate.getDate() + 1);
                }
            }
            else {
                events.push(new Event({ bookedSeats: 0, date: new Date(date!), language, price, seats, guide }))
            }
            actividad.events = events;
            actividad.save()
            res.status(200).json({ message: 'Eventos añadidos con exito' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ha habido un error en el servidor.' });
        }
    });
});

export default router;