import User from '../models/user';
import Activity, { ActivityDoc } from '../models/activity';
import { ReservationDoc } from '../models/reservation';

import express, { Request, Response } from 'express';

const { getUserId } = require('../services/tokenService');
const router = express.Router();

// Obtener la lista de actividades
router.get('/activities', async (req, res) => {
  try {
    const query = {
      $and: [
          req.query.searchString ? {
              $or: [
                  { name: { $regex: req.query.searchString, $options: 'i' } }, // Buscar en la propiedad "name"
                  { description: { $regex: req.query.searchString, $options: 'i' } },// Buscar en la propiedad "description"
              ]
          } : {},
      ],
  };
    const activities = await Activity.find(query);
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de actividades' });
  }
});

// Obtener la información de una actividad específica
router.get('/activity/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (activity) {
      res.status(200).json(activity);
    } else {
      res.status(404).json({ message: 'Actividad no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la información de la actividad' });
  }
});

//Obtener los eventos de una actividad
router.get('/activity/:id/events', async (req: Request, res: Response) => {
  try {
      // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
      const activity = (await Activity.findById(req.params.id));
      const events = activity?.events ? activity?.events : []
      res.status(200).json(events);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Iniciar una reserva con estado "No pagada"
router.post('/activity/:activityId/event/:eventId/reservation', async (req: Request, res: Response) => {
  try {
      let userId=getUserId(req)
      // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
      const usuario = await User.findById(userId);
      let reservation = req.body.reservation
      reservation.state = "No pagada"
      reservation.activityId = req.params.activityId
      usuario.reservations?.push(reservation)
      usuario.save();
      res.status(200).json({ mesagge: "Reserva completada correctamente" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Obtener las reservas de un usuario
router.get('/reservations', async (req: Request, res: Response) => {
  try {
      let userId=getUserId(req)
      // Realizar la búsqueda de usuarios que coincidan con la expresión de consulta
      const user = await User.findById(userId);
      let reservations: ReservationDoc[] = user.reservations ? user.reservations : [];

      const result = await Promise.all(reservations.map(async (reservation) => {
          const { eventId, activityId }: ReservationDoc = reservation; // Desestructurar y crear una copia independiente de reservation
          let reservationMap: any = JSON.parse(JSON.stringify(reservation))
          delete reservationMap.eventId;
          delete reservationMap.activityId;
          let activity: ActivityDoc = await Activity.findById(activityId);
          reservationMap.event = activity.events.find((event) => event.id == eventId)
          let activityFinal = activity.toJSON()
          delete activityFinal.events
          reservationMap.activity = activityFinal
          return reservationMap;
      }));

      // Ordenar las reservas por fecha de forma ascendente
      result.sort((a, b) => a.event.date.getTime() - b.event.date.getTime());
      const reservationGroups: any[] = [];
      let currentGroup: any = null;

      // Agrupar las reservas por fecha con una diferencia máxima de 5 días
      result.forEach((reservation) => {
          if (!currentGroup || Math.abs(reservation.event.date.getTime() - currentGroup.dateTo.getTime()) > 3 * 24 * 60 * 60 * 1000) {
              // Crear un nuevo grupo
              currentGroup = {
                  dateFrom: reservation.event.date,
                  reservations: [reservation],
              };
              reservationGroups.push(currentGroup);
          } else {
              // Agregar la reserva al grupo actual
              currentGroup.reservations.push(reservation);
          }
          currentGroup.dateTo = reservation.event.date;
      });
      res.status(200).json(reservationGroups);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Obtener informacion de una reserva
router.get('/reservation/:id', async (req: Request, res: Response) => {
  try {
      let userId=getUserId(req)
      const user = await User.findOne(
          { _id:userId,'reservations._id': req.params.id },
          { 'reservations.$': 1 })

      const reservations = user.reservations;

      const result = await Promise.all(reservations.map(async (reservation) => {
          const { eventId, activityId }: ReservationDoc = reservation; // Desestructurar y crear una copia independiente de reservation
          let reservationMap: any = JSON.parse(JSON.stringify(reservation))
          delete reservationMap.eventId;
          delete reservationMap.activityId;
          let activity: ActivityDoc = await Activity.findById(activityId);
          reservationMap.event = activity.events.find((event) => event.id == eventId)
          let activityFinal = activity.toJSON()
          delete activityFinal.events
          reservationMap.activity = activityFinal
          return reservationMap;
      }));

      res.status(200).json(result.length > 0 ? result[0] : null);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

//Cancelar una reserva
router.put('/cancel/reservation/:id', async (req: Request, res: Response) => {
  try {
      let userId=getUserId(req)
      await User.findOneAndUpdate(
          { _id: userId, 'reservations._id': req.params.id },
          { $set: { 'reservations.$.state': "Cancelada" } },
          { new: true }
      ).exec();
      res.status(200).json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha habido un error en el servidor.' });
  }
});

export default router
